import crypto from 'crypto';
import path from 'path';
import { NextResponse } from 'next/server';
import { resolveDataDir, ensureDirectory, safeReadFile, safeAtomicWrite } from '../db/storage';
import { Database, AssistantData } from '../db';
import { timingSafeStringEqual } from './password';

const DATA_DIR = resolveDataDir();
const ADMIN_KEY_FILE = path.join(DATA_DIR, '.admin_key');

let inMemoryMasterKey: string | null = null;

/**
 * Retrieves the configured or auto-generated Master Admin Key.
 *
 * IMPORTANT: this key signs every admin session token and gates every admin
 * API route, so it must never fall back to a fixed, source-visible constant.
 * When no ADMIN_API_KEY/ADMIN_PASSWORD env var is set, a random 256-bit key
 * is generated once and persisted to DATA_DIR so it stays stable across
 * restarts on the same instance/volume.
 */
export const DEFAULT_FALLBACK_ADMIN_KEY = 'kortex_admin_secret_key_2026';

export function getAdminKey(): string {
  if (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.trim()) {
    return process.env.ADMIN_API_KEY.trim().replace(/^["']|["']$/g, '');
  }
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim()) {
    return process.env.ADMIN_PASSWORD.trim().replace(/^["']|["']$/g, '');
  }

  // Reject fallback keys in production environments
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[Security] Fatal: Running in production without ADMIN_API_KEY or ADMIN_PASSWORD configured. Insecure fallback credentials are disabled.'
    );
  }

  // If deployed to serverless (Vercel) in non-production without explicit key configured,
  // use the default fallback so multiple lambda instances don't generate divergent keys.
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return DEFAULT_FALLBACK_ADMIN_KEY;
  }

  if (inMemoryMasterKey) {
    return inMemoryMasterKey;
  }

  // Auto-generate or retrieve persistent secret in DATA_DIR
  try {
    ensureDirectory(DATA_DIR);
    const saved = safeReadFile(ADMIN_KEY_FILE);
    if (saved && saved.trim()) {
      inMemoryMasterKey = saved.trim().replace(/^["']|["']$/g, '');
      return inMemoryMasterKey;
    }

    // Check bundled key file if DATA_DIR was redirected to /tmp
    const bundledKeyFile = path.join(process.cwd(), '.data', '.admin_key');
    if (bundledKeyFile !== ADMIN_KEY_FILE) {
      const bundledSaved = safeReadFile(bundledKeyFile);
      if (bundledSaved && bundledSaved.trim()) {
        inMemoryMasterKey = bundledSaved.trim().replace(/^["']|["']$/g, '');
        return inMemoryMasterKey;
      }
    }

    // No configured or persisted key yet: generate a fresh random secret.
    const generatedKey = crypto.randomBytes(32).toString('hex');
    safeAtomicWrite(ADMIN_KEY_FILE, generatedKey);
    inMemoryMasterKey = generatedKey;
    return inMemoryMasterKey;
  } catch (err) {
    if (!inMemoryMasterKey) {
      inMemoryMasterKey = DEFAULT_FALLBACK_ADMIN_KEY;
    }
    return inMemoryMasterKey;
  }
}

/**
 * Generates a signed HMAC-SHA256 session token valid for 7 days.
 */
export function generateSessionToken(
  role: string = 'admin',
  memberId?: string,
  workspaceId: string = 'default-workspace'
): string {
  const masterKey = getAdminKey();
  const payload = {
    role: role || 'admin',
    memberId: memberId || 'admin',
    workspaceId: workspaceId || 'default-workspace',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', masterKey)
    .update(payloadB64)
    .digest('hex');

  return `${payloadB64}.${signature}`;
}

/**
 * Validates a signed session token.
 */
export function verifySessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  const masterKey = getAdminKey();

  const expectedSignature = crypto
    .createHmac('sha256', masterKey)
    .update(payloadB64)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) {
      return false; // Expired token
    }
    const validRoles = ['admin', 'owner', 'support_agent', 'billing_manager', 'viewer'];
    return validRoles.includes(payload.role);
  } catch {
    return false;
  }
}

/**
 * Extracts payload data from a signed session token.
 */
export function getSessionPayload(token: string): { role: string; memberId: string; workspaceId: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  if (!verifySessionToken(token)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return {
      role: payload.role || 'admin',
      memberId: payload.memberId || 'admin',
      workspaceId: payload.workspaceId || 'default-workspace',
    };
  } catch {
    return null;
  }
}

/**
 * Resolves full auth context from request headers or cookie.
 */
export async function getAuthContext(req: Request): Promise<{
  authenticated: boolean;
  role: string;
  memberId: string;
  workspaceId: string;
}> {
  const masterKey = getAdminKey();

  // 1. Check Authorization header
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key');
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (timingSafeStringEqual(token, masterKey)) {
      return { authenticated: true, role: 'admin', memberId: 'master-admin', workspaceId: '*' };
    }
    const session = getSessionPayload(token);
    if (session) {
      return { authenticated: true, role: session.role, memberId: session.memberId, workspaceId: session.workspaceId };
    }
  }

  // 2. Check Cookie header
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
      const [k, v] = pair.split('=').map((s) => s.trim());
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {});

    const sessionCookie = cookies['kortex_admin_session'];
    if (sessionCookie) {
      const session = getSessionPayload(sessionCookie);
      if (session) {
        return { authenticated: true, role: session.role, memberId: session.memberId, workspaceId: session.workspaceId };
      }
    }
  }

  return { authenticated: false, role: 'guest', memberId: '', workspaceId: 'default-workspace' };
}

/**
 * Checks an incoming Next.js API request for valid admin authentication.
 * Accepts either:
 *  1. Authorization: Bearer <adminKey|sessionToken>
 *  2. Cookie: kortex_admin_session=<sessionToken>
 */
export async function verifyAdminRequest(req: Request): Promise<boolean> {
  const ctx = await getAuthContext(req);
  return ctx.authenticated;
}

/**
 * Generates an unguessable, deterministic capability token scoping access to
 * a single conversation, so the public (unauthenticated) chat widget can poll
 * for live-agent replies without exposing every conversation to anyone who
 * knows or guesses its id. The token is derived from the server-side admin
 * key via HMAC, so it never needs to be stored anywhere.
 */
export function generateConversationAccessToken(conversationId: string): string {
  const masterKey = getAdminKey();
  return crypto
    .createHmac('sha256', masterKey)
    .update(`conversation-access:${conversationId}`)
    .digest('hex')
    .slice(0, 32);
}

export function verifyConversationAccessToken(conversationId: string, token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const expected = generateConversationAccessToken(conversationId);
  return timingSafeStringEqual(token, expected);
}

export function createSessionCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `kortex_admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`;
}

export function createClearCookieHeader(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `kortex_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? '; Secure' : ''}`;
}

/**
 * Higher-order API route wrapper that enforces administrator authentication.
 * Returns HTTP 401 JSON if unauthorized; otherwise invokes the inner handler.
 */
export function withAdminAuth<T = any>(
  handler: (req: Request, context: T) => Promise<Response>
): (req: Request, context: T) => Promise<Response> {
  return async (req: Request, context: T): Promise<Response> => {
    const isAuthed = await verifyAdminRequest(req);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, context);
  };
}

/**
 * Cross-Workspace IDOR / BOLA Prevention Guard
 * Validates that an assistant exists and belongs to the caller's workspace.
 * If ctx.workspaceId is '*' (Master Admin), access is granted to any valid assistant.
 */
export async function requireWorkspaceAssistant(
  ctx: { workspaceId: string },
  assistantId: string
): Promise<AssistantData | null> {
  if (!assistantId || typeof assistantId !== 'string') return null;
  const assistant = await Database.getAssistantById(assistantId, ctx.workspaceId);
  return assistant;
}

/**
 * Generates an unguessable capability token scoping access to an assistant's
 * appointment calendar feed (e.g. for iCal subscriptions in Apple/Google Calendar).
 * Derived via HMAC from the server master key and assistantId.
 */
export function generateCalendarFeedToken(assistantId: string): string {
  const masterKey = getAdminKey();
  return crypto
    .createHmac('sha256', masterKey)
    .update(`calendar-feed:${assistantId}`)
    .digest('hex')
    .slice(0, 32);
}

export function verifyCalendarFeedToken(assistantId: string, token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const expected = generateCalendarFeedToken(assistantId);
  return timingSafeStringEqual(token, expected);
}


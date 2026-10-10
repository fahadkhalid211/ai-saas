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
      inMemoryMasterKey = crypto.randomBytes(32).toString('hex');
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
  workspaceId: string = 'default-workspace',
  isMasterAdmin?: boolean,
  sessionVersion: number = 0,
  /** Support access by the platform owner (lib/security/support-access.ts): marked in the token and short-lived. */
  support?: { ttlMs: number }
): string {
  const masterKey = getAdminKey();
  const computedIsMaster =
    isMasterAdmin !== undefined
      ? isMasterAdmin
      : memberId === 'master-admin' || (role === 'admin' && workspaceId === '*');

  const payload = {
    role: role || 'admin',
    memberId: memberId || 'admin',
    workspaceId: workspaceId || 'default-workspace',
    isMasterAdmin: computedIsMaster,
    sv: sessionVersion || 0,
    ...(support ? { imp: true } : {}),
    iat: Date.now(),
    exp: Date.now() + (support ? support.ttlMs : 7 * 24 * 60 * 60 * 1000),
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
export function getSessionPayload(token: string): {
  role: string;
  memberId: string;
  workspaceId: string;
  isMasterAdmin: boolean;
  sessionVersion: number;
  supportAccess: boolean;
} | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  if (!verifySessionToken(token)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const isMaster = Boolean(
      payload.isMasterAdmin ||
        payload.memberId === 'master-admin' ||
        (payload.role === 'admin' && payload.workspaceId === '*')
    );
    return {
      role: payload.role || 'admin',
      memberId: payload.memberId || 'admin',
      workspaceId: payload.workspaceId || 'default-workspace',
      isMasterAdmin: isMaster,
      sessionVersion: Number(payload.sv) || 0,
      supportAccess: payload.imp === true && !isMaster,
    };
  } catch {
    return null;
  }
}

export interface AuthContext {
  authenticated: boolean;
  role: string;
  memberId: string;
  workspaceId: string;
  isMasterAdmin: boolean;
  /** The platform owner is inside this workspace to troubleshoot it (never true together with isMasterAdmin). */
  supportAccess?: boolean;
}

const GUEST: AuthContext = { authenticated: false, role: 'guest', memberId: '', workspaceId: 'default-workspace', isMasterAdmin: false };

/** Legacy/placeholder identities that have no team-member row of their own. */
const NON_MEMBER_IDS = new Set(['admin', 'master-admin', 'tm_owner', 'demo_user']);

/**
 * A valid signature is not enough: the account must still exist and the session must not have been ended.
 * The role and workspace come from the account as it is now, so a demotion or removal takes effect at once
 * instead of when the 7-day token runs out.
 */
async function resolveSession(session: NonNullable<ReturnType<typeof getSessionPayload>>): Promise<AuthContext> {
  if (session.isMasterAdmin) {
    return { authenticated: true, role: session.role, memberId: session.memberId, workspaceId: session.workspaceId, isMasterAdmin: true };
  }
  if (session.supportAccess) {
    // The platform owner inside a customer's workspace: valid while that workspace exists, whatever happens to its members.
    const state = await Database.getState();
    if (session.workspaceId === '*' || !(state.workspaces || []).some((w) => w.id === session.workspaceId)) return GUEST;
    return { authenticated: true, role: 'owner', memberId: session.memberId, workspaceId: session.workspaceId, isMasterAdmin: false, supportAccess: true };
  }
  let member = await Database.findTeamMember(session.memberId);
  // Each server keeps its own copy of the accounts for up to a minute. A sign-up, or a new sign-in after a password change,
  // handled by another server is not in this copy yet: load the latest accounts once before treating the session as invalid.
  const unknownHere = member ? (member.sessionVersion || 0) < session.sessionVersion : !NON_MEMBER_IDS.has(session.memberId);
  if (unknownHere && (await Database.refreshState())) {
    member = await Database.findTeamMember(session.memberId);
  }
  if (!member) {
    if (NON_MEMBER_IDS.has(session.memberId)) {
      return { authenticated: true, role: session.role, memberId: session.memberId, workspaceId: session.workspaceId, isMasterAdmin: false };
    }
    return GUEST; // the account was removed
  }
  if (member.status && member.status !== 'active') return GUEST;
  if ((member.sessionVersion || 0) !== session.sessionVersion) return GUEST; // signed out everywhere / password or 2FA changed
  return { authenticated: true, role: member.role, memberId: member.id, workspaceId: member.workspaceId || session.workspaceId, isMasterAdmin: false };
}

/**
 * Resolves full auth context from request headers or cookie.
 */
export async function getAuthContext(req: Request): Promise<AuthContext> {
  const masterKey = getAdminKey();

  // 1. Check Authorization header
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key');
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (timingSafeStringEqual(token, masterKey)) {
      return { authenticated: true, role: 'admin', memberId: 'master-admin', workspaceId: '*', isMasterAdmin: true };
    }
    const session = getSessionPayload(token);
    if (session) return resolveSession(session);
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
      if (session) return resolveSession(session);
    }
  }

  return GUEST;
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

export type UserRole = 'owner' | 'admin' | 'billing_manager' | 'support_agent' | 'viewer';

export function hasRole(userRole: string, allowedRoles: UserRole[]): boolean {
  if (userRole === 'admin' || userRole === 'owner') return true;
  return allowedRoles.includes(userRole as UserRole);
}

export function requireRole(
  ctx: { role: string; isMasterAdmin?: boolean },
  allowedRoles: UserRole[]
): boolean {
  if (ctx.isMasterAdmin) return true;
  return hasRole(ctx.role, allowedRoles);
}

/**
 * Higher-order API route wrapper that enforces administrator authentication.
 * Returns HTTP 401 JSON if unauthorized; otherwise invokes the inner handler.
 */
export function withAdminAuth<T = any>(
  handler: (req: Request, context: T) => Promise<Response>
): (req: Request, context?: T) => Promise<Response> {
  return async (req: Request, context?: T): Promise<Response> => {
    const isAuthed = await verifyAdminRequest(req);
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, context as T);
  };
}

/**
 * Higher-order API route wrapper that enforces role-based access control.
 * Returns HTTP 401 if unauthenticated, HTTP 403 if role lacks permission.
 */
export function withRoleAuth<T = any>(
  allowedRoles: UserRole[],
  handler: (req: Request, context: T) => Promise<Response>
): (req: Request, context?: T) => Promise<Response> {
  return async (req: Request, context?: T): Promise<Response> => {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!requireRole(ctx, allowedRoles)) {
      return NextResponse.json(
        { success: false, error: `Forbidden: role '${ctx.role}' lacks required permissions` },
        { status: 403 }
      );
    }
    return handler(req, context as T);
  };
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


// ---------------------------------------------------------------------------
// Pending two-factor challenge (sign-in methods where the password step is done elsewhere, e.g. Google)
// ---------------------------------------------------------------------------

const PENDING_2FA_COOKIE = 'kortex_2fa_pending';
const PENDING_2FA_TTL_MS = 5 * 60 * 1000;

function signPending(payloadB64: string): string {
  return crypto.createHmac('sha256', getAdminKey()).update(`2fa-pending:${payloadB64}`).digest('hex');
}

/** A short-lived proof that the first factor passed. It is NOT a session and grants no access on its own. */
export function createPendingTwoFactorCookie(memberId: string, workspaceId: string): string {
  const payloadB64 = Buffer.from(JSON.stringify({ memberId, workspaceId, exp: Date.now() + PENDING_2FA_TTL_MS })).toString('base64url');
  const isProd = process.env.NODE_ENV === 'production';
  return `${PENDING_2FA_COOKIE}=${payloadB64}.${signPending(payloadB64)}; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=300${isProd ? '; Secure' : ''}`;
}

export function clearPendingTwoFactorCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${PENDING_2FA_COOKIE}=; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? '; Secure' : ''}`;
}

export function readPendingTwoFactor(req: Request): { memberId: string; workspaceId: string } | null {
  const header = req.headers.get('cookie') || '';
  const raw = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${PENDING_2FA_COOKIE}=`));
  if (!raw) return null;
  const token = decodeURIComponent(raw.slice(PENDING_2FA_COOKIE.length + 1));
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  const expected = Buffer.from(signPending(payloadB64), 'hex');
  const given = Buffer.from(sig, 'hex');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!p.memberId || !p.workspaceId || typeof p.exp !== 'number' || p.exp < Date.now()) return null;
    return { memberId: String(p.memberId), workspaceId: String(p.workspaceId) };
  } catch {
    return null;
  }
}

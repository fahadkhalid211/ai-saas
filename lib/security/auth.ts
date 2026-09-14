import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const DATA_DIR = path.join(process.cwd(), '.data');
const ADMIN_KEY_FILE = path.join(DATA_DIR, '.admin_key');

/**
 * Retrieves the configured or auto-generated Master Admin Key.
 */
export function getAdminKey(): string {
  if (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.trim()) {
    return process.env.ADMIN_API_KEY.trim().replace(/^["']|["']$/g, '');
  }
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim()) {
    return process.env.ADMIN_PASSWORD.trim().replace(/^["']|["']$/g, '');
  }

  // Auto-generate a persistent secret in .data/ if not provided in .env
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ADMIN_KEY_FILE)) {
      const saved = fs.readFileSync(ADMIN_KEY_FILE, 'utf8').trim().replace(/^["']|["']$/g, '');
      if (saved) return saved;
    }

    const generated = 'kortex_' + crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(ADMIN_KEY_FILE, generated, 'utf8');
    console.log(`[Security] No ADMIN_API_KEY configured in .env. Auto-generated master key: ${generated}`);
    return generated;
  } catch {
    return 'kortex_admin_secret_fallback_key';
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
    if (token === masterKey) {
      return { authenticated: true, role: 'admin', memberId: 'master-admin', workspaceId: 'default-workspace' };
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


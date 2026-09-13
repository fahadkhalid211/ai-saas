import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const ADMIN_KEY_FILE = path.join(DATA_DIR, '.admin_key');

/**
 * Retrieves the configured or auto-generated Master Admin Key.
 */
export function getAdminKey(): string {
  if (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY.trim()) {
    return process.env.ADMIN_API_KEY.trim();
  }
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim()) {
    return process.env.ADMIN_PASSWORD.trim();
  }

  // Auto-generate a persistent secret in .data/ if not provided in .env
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ADMIN_KEY_FILE)) {
      const saved = fs.readFileSync(ADMIN_KEY_FILE, 'utf8').trim();
      if (saved) return saved;
    }

    const generated = 'kortex_' + crypto.randomBytes(16).toString('hex');
    fs.writeFileSync(ADMIN_KEY_FILE, generated, 'utf8');
    console.log(`[Security] No ADMIN_API_KEY configured in .env. Auto-generated master key: ${generated}`);
    return generated;
  } catch (err) {
    return 'kortex_admin_secret_fallback_key';
  }
}

/**
 * Generates a signed HMAC-SHA256 session token valid for 7 days.
 */
export function generateSessionToken(): string {
  const masterKey = getAdminKey();
  const payload = {
    role: 'admin',
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
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Checks an incoming Next.js API request for valid admin authentication.
 * Accepts either:
 *  1. Authorization: Bearer <adminKey|sessionToken>
 *  2. Cookie: kortex_admin_session=<sessionToken>
 */
export async function verifyAdminRequest(req: Request): Promise<boolean> {
  const masterKey = getAdminKey();

  // 1. Check Authorization header
  const authHeader = req.headers.get('authorization') || req.headers.get('x-api-key');
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (token === masterKey) return true;
    if (verifySessionToken(token)) return true;
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
    if (sessionCookie && verifySessionToken(sessionCookie)) {
      return true;
    }
  }

  return false;
}

export function createSessionCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `kortex_admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`;
}

export function createClearCookieHeader(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `kortex_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? '; Secure' : ''}`;
}

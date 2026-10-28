import crypto from 'crypto';
import { getAdminKey } from './auth';
import { timingSafeStringEqual } from './password';

const PARTNER_COOKIE_NAME = 'crescelo_partner_session';
const PARTNER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function generatePartnerToken(partnerId: string): string {
  const masterKey = getAdminKey();
  const payload = JSON.stringify({
    pid: partnerId,
    iat: Date.now(),
    exp: Date.now() + PARTNER_SESSION_TTL_MS,
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', masterKey).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifyPartnerToken(token: string): { partnerId: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [b64, sig] = parts;
  const masterKey = getAdminKey();
  const expectedSig = crypto.createHmac('sha256', masterKey).update(b64).digest('base64url');
  if (!timingSafeStringEqual(sig, expectedSig)) return null;

  try {
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (!data.pid || typeof data.pid !== 'string') return null;
    if (data.exp && Date.now() > data.exp) return null;
    return { partnerId: data.pid };
  } catch {
    return null;
  }
}

export function getPartnerSessionFromRequest(req: Request): { partnerId: string } | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${PARTNER_COOKIE_NAME}=`));
  if (!match) return null;
  const token = decodeURIComponent(match.slice(PARTNER_COOKIE_NAME.length + 1));
  return verifyPartnerToken(token);
}

export function createPartnerSessionCookie(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${PARTNER_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${isProd ? '; Secure' : ''}`;
}

export function createClearPartnerSessionCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${PARTNER_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? '; Secure' : ''}`;
}

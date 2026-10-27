import crypto from 'crypto';
import { getAdminKey } from '@/lib/security/auth';

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function signingKey(): Buffer {
  return crypto.createHmac('sha256', getAdminKey()).update('password-reset:v1').digest();
}

function sign(payloadB64: string): string {
  return crypto.createHmac('sha256', signingKey()).update(payloadB64).digest('base64url');
}

export function createPasswordResetToken(memberId: string, email: string, now: number = Date.now()): string {
  const payload = { t: 'pr', m: memberId, e: email.toLowerCase().trim(), x: now + PASSWORD_RESET_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function readPasswordResetToken(
  token: string | null | undefined,
  now: number = Date.now(),
): { memberId: string; email: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expected = Buffer.from(sign(payloadB64));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload?.t !== 'pr' || typeof payload.m !== 'string' || typeof payload.e !== 'string' || typeof payload.x !== 'number') return null;
    if (payload.x < now) return null;
    return { memberId: payload.m, email: payload.e };
  } catch {
    return null;
  }
}

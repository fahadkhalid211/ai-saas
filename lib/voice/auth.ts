import crypto from 'crypto';

/**
 * Request signing between the voice worker and the Next.js API, plus short-lived call tokens that
 * authorise one media stream. Everything is HMAC-SHA256 with a shared secret (VOICE_WORKER_SECRET).
 */

export const VOICE_MAX_SKEW_SECONDS = 300;
const seenSignatures = new Map<string, number>();

export function getVoiceSecret(): string | null {
  const s = process.env.VOICE_WORKER_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function signVoiceRequest(secret: string, timestampSeconds: number, rawBody: string): string {
  return crypto.createHmac('sha256', secret).update(`${timestampSeconds}.${rawBody}`).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ba.length === bb.length && ba.length > 0 && crypto.timingSafeEqual(ba, bb);
}

export type VerifyResult = { ok: true } | { ok: false; reason: 'disabled' | 'missing' | 'stale' | 'bad_signature' | 'replay' };

/** Verifies a worker request: fresh timestamp, matching HMAC, and not seen before. */
export function verifyVoiceRequest(opts: {
  secret: string | null;
  timestamp: string | null;
  signature: string | null;
  rawBody: string;
  nowMs?: number;
}): VerifyResult {
  if (!opts.secret) return { ok: false, reason: 'disabled' };
  if (!opts.timestamp || !opts.signature) return { ok: false, reason: 'missing' };
  const nowMs = opts.nowMs ?? Date.now();
  const ts = Number(opts.timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowMs / 1000 - ts) > VOICE_MAX_SKEW_SECONDS) return { ok: false, reason: 'stale' };

  const expected = signVoiceRequest(opts.secret, ts, opts.rawBody);
  if (!safeEqualHex(opts.signature.toLowerCase(), expected)) return { ok: false, reason: 'bad_signature' };

  // Best-effort replay guard (per instance). The timestamp window bounds the exposure elsewhere.
  for (const [sig, exp] of seenSignatures) if (exp < nowMs) seenSignatures.delete(sig);
  if (seenSignatures.has(expected)) return { ok: false, reason: 'replay' };
  seenSignatures.set(expected, nowMs + VOICE_MAX_SKEW_SECONDS * 1000);
  return { ok: true };
}

export interface CallTokenPayload {
  callId: string;
  assistantId: string;
  from?: string;
  to?: string;
  exp: number; // unix seconds
}

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');

export function mintCallToken(secret: string, payload: Omit<CallTokenPayload, 'exp'>, ttlSeconds = 900, nowMs = Date.now()): string {
  const body = b64u(JSON.stringify({ ...payload, exp: Math.floor(nowMs / 1000) + ttlSeconds }));
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyCallToken(secret: string | null, token: string | null | undefined, nowMs = Date.now()): CallTokenPayload | null {
  if (!secret || !token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as CallTokenPayload;
    if (!payload.callId || !payload.assistantId || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000 > nowMs ? payload : null;
  } catch {
    return null;
  }
}

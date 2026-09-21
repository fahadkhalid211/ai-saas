import crypto from 'crypto';

/**
 * TeXML (Telnyx) / TwiML-style responses for the carrier webhook, plus webhook authentication.
 * The carrier asks us what to do when a call arrives; we answer with XML that either streams the call's
 * audio to the voice worker, forwards it to a person, or politely ends it.
 */

export const xmlEscape = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const wrap = (inner: string) => `<?xml version="1.0" encoding="UTF-8"?>\n<Response>${inner}</Response>`;

/** Streams both directions of the call's audio to our worker (8 kHz mu-law). */
export function streamResponse(opts: { url: string; token: string; callId: string; from: string; to: string }): string {
  return wrap(
    `<Connect><Stream url="${xmlEscape(opts.url)}" bidirectionalMode="rtp" bidirectionalCodec="PCMU">` +
      `<Parameter name="callToken" value="${xmlEscape(opts.token)}"/>` +
      `<Parameter name="callId" value="${xmlEscape(opts.callId)}"/>` +
      `<Parameter name="from" value="${xmlEscape(opts.from)}"/>` +
      `<Parameter name="to" value="${xmlEscape(opts.to)}"/>` +
      `</Stream></Connect>`
  );
}

/** Rings a person instead of the AI (after hours, or when the AI service is unavailable). */
export function dialResponse(number: string, callerId?: string): string {
  return wrap(`<Dial${callerId ? ` callerId="${xmlEscape(callerId)}"` : ''} timeout="25"><Number>${xmlEscape(number)}</Number></Dial>`);
}

export function sayHangupResponse(message: string): string {
  return wrap(`<Say>${xmlEscape(message)}</Say><Hangup/>`);
}

export function rejectResponse(): string {
  return wrap('<Reject reason="rejected"/>');
}

/** Telnyx signs `${timestamp}|${rawBody}` with Ed25519. `publicKeyB64` is the raw 32-byte key, base64 encoded. */
export function verifyTelnyxSignature(opts: { publicKeyB64: string; signatureB64: string; timestamp: string; rawBody: string; nowMs?: number }): boolean {
  try {
    const ts = Number(opts.timestamp);
    const nowMs = opts.nowMs ?? Date.now();
    if (!Number.isFinite(ts) || Math.abs(nowMs / 1000 - ts) > 300) return false;
    const raw = Buffer.from(opts.publicKeyB64, 'base64');
    if (raw.length !== 32) return false;
    // SPKI DER prefix for an Ed25519 public key
    const der = Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), raw]);
    const key = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
    return crypto.verify(null, Buffer.from(`${opts.timestamp}|${opts.rawBody}`), key, Buffer.from(opts.signatureB64, 'base64'));
  } catch {
    return false;
  }
}

/** Constant-time comparison of the `?k=` secret configured in the carrier's webhook URL. */
export function verifyWebhookKey(provided: string | null, secret: string | undefined): boolean {
  if (!provided || !secret || secret.length < 24) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Parses the carrier's request body, which may be form-encoded or JSON. */
export function parseCarrierBody(raw: string, contentType: string | null): Record<string, string> {
  try {
    if ((contentType || '').includes('json')) {
      const j = JSON.parse(raw);
      const data = j?.data?.payload || j?.payload || j;
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(data || {})) if (typeof v === 'string' || typeof v === 'number') flat[k] = String(v);
      return flat;
    }
    return Object.fromEntries(new URLSearchParams(raw));
  } catch {
    return {};
  }
}

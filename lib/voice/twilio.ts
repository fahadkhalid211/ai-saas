import crypto from 'crypto';
import { xmlEscape, verifyWebhookKey } from './texml';

export { xmlEscape, verifyWebhookKey };

const wrapTwiML = (inner: string) => `<?xml version="1.0" encoding="UTF-8"?>\n<Response>${inner}</Response>`;

/**
 * Streams Twilio call audio bidirectionally over WebSockets.
 * Twilio connects to `url` with 8 kHz G.711 mu-law audio payloads.
 */
export function streamTwilioResponse(opts: { url: string; token: string; callId: string; from: string; to: string }): string {
  return wrapTwiML(
    `<Connect><Stream url="${xmlEscape(opts.url)}">` +
      `<Parameter name="callToken" value="${xmlEscape(opts.token)}"/>` +
      `<Parameter name="callId" value="${xmlEscape(opts.callId)}"/>` +
      `<Parameter name="from" value="${xmlEscape(opts.from)}"/>` +
      `<Parameter name="to" value="${xmlEscape(opts.to)}"/>` +
      `</Stream></Connect>`
  );
}

/** Rings a human phone number using TwiML Dial. */
export function dialTwilioResponse(number: string, callerId?: string): string {
  return wrapTwiML(`<Dial${callerId ? ` callerId="${xmlEscape(callerId)}"` : ''} timeout="25"><Number>${xmlEscape(number)}</Number></Dial>`);
}

/** Speaks an automated message and hangs up. */
export function sayTwilioHangupResponse(message: string): string {
  return wrapTwiML(`<Say>${xmlEscape(message)}</Say><Hangup/>`);
}

/** Rejects the inbound Twilio call without answering (no billing). */
export function rejectTwilioResponse(): string {
  return wrapTwiML('<Reject reason="busy"/>');
}

/**
 * Validates Twilio's X-Twilio-Signature header.
 * Twilio signature = Base64( HMAC-SHA1( AuthToken, URL + sorted(key + value for key in params) ) )
 */
export function verifyTwilioSignature(opts: {
  authToken: string;
  signature: string | null;
  url: string;
  params: Record<string, string>;
}): boolean {
  if (!opts.signature || !opts.authToken) return false;
  try {
    let data = opts.url;
    const sortedKeys = Object.keys(opts.params).sort();
    for (const key of sortedKeys) {
      data += key + opts.params[key];
    }
    const expected = crypto
      .createHmac('sha1', opts.authToken)
      .update(Buffer.from(data, 'utf-8'))
      .digest('base64');

    const a = Buffer.from(opts.signature);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

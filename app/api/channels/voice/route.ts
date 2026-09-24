import crypto from 'crypto';
import { Database } from '@/lib/db';
import { isOpenNow } from '@/lib/appointments/availability';
import { enforceRateLimitByKey } from '@/lib/security/rate-limit';
import { getVoiceSecret, mintCallToken } from '@/lib/voice/auth';
import { normalizeE164 } from '@/lib/voice/text';
import { dialResponse, parseCarrierBody, rejectResponse, sayHangupResponse, streamResponse, verifyTelnyxSignature, verifyWebhookKey } from '@/lib/voice/texml';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

const xml = (body: string, status = 200) => new Response(body, { status, headers: { 'Content-Type': 'text/xml; charset=utf-8', 'Cache-Control': 'no-store' } });

/**
 * Carrier webhook (Telnyx TeXML): a call arrived on one of our numbers. We decide what happens:
 * stream it to the AI voice worker, ring a person, or end it politely. The audio itself never touches this app.
 *
 * Authentication: the webhook URL carries a secret (?k=VOICE_WEBHOOK_SECRET), and Telnyx's Ed25519 signature is
 * accepted too when TELNYX_PUBLIC_KEY is set.
 */
async function handle(req: Request): Promise<Response> {
  const raw = req.method === 'POST' ? await req.text() : '';
  const url = new URL(req.url);

  const keyOk = verifyWebhookKey(url.searchParams.get('k'), process.env.VOICE_WEBHOOK_SECRET);
  const sigHeader = req.headers.get('telnyx-signature-ed25519');
  const tsHeader = req.headers.get('telnyx-timestamp');
  const sigOk =
    !!process.env.TELNYX_PUBLIC_KEY &&
    !!sigHeader &&
    !!tsHeader &&
    verifyTelnyxSignature({ publicKeyB64: process.env.TELNYX_PUBLIC_KEY, signatureB64: sigHeader, timestamp: tsHeader, rawBody: raw });
  if (!keyOk && !sigOk) return new Response('Unauthorized', { status: 401 });

  const body = parseCarrierBody(raw, req.headers.get('content-type'));
  const from = normalizeE164(body.From || body.from || body.Caller || '') || '';
  const to = normalizeE164(body.To || body.to || body.Called || '');
  const callId = body.CallSid || body.call_control_id || body.CallControlId || `call_${crypto.randomUUID()}`;

  if (!to) return xml(rejectResponse());
  const assistant = await Database.getAssistantByPhoneNumber(to);
  if (!assistant) return xml(rejectResponse());

  if (enforceRateLimitByKey(`voice-hook:${to}`, { windowMs: 60 * 60 * 1000, max: 400 }).errorResponse) {
    return xml(sayHangupResponse('Sorry, this line is busy right now. Please try again later.'));
  }

  const transfer = assistant.phoneTransferNumber || '';
  const config = {
    bookingStartHour: assistant.bookingStartHour,
    bookingEndHour: assistant.bookingEndHour,
    bookingAvailableDays: assistant.bookingAvailableDays,
    timezone: assistant.timezone,
  };
  if (!isOpenNow(config) && (assistant.phoneAfterHours || 'ai') === 'forward' && transfer) return xml(dialResponse(transfer, to));

  const streamUrl = process.env.VOICE_STREAM_URL;
  const secret = getVoiceSecret();
  if (!streamUrl || !secret) {
    // The AI voice service is not set up or is down: never leave the caller hanging.
    return transfer ? xml(dialResponse(transfer, to)) : xml(sayHangupResponse('Sorry, we cannot take your call right now. Please try again later.'));
  }

  const token = mintCallToken(secret, { callId, assistantId: assistant.id, from, to }, 900);
  return xml(streamResponse({ url: streamUrl, token, callId, from, to }));
}

const POSTHandler = handle;
const GETHandler = handle;

export const POST = logged(POSTHandler, { route: '/api/channels/voice' });
export const GET = logged(GETHandler, { route: '/api/channels/voice' });

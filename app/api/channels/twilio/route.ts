import crypto from 'crypto';
import { Database } from '@/lib/db';
import { isOpenNow } from '@/lib/appointments/availability';
import { enforceRateLimitByKey } from '@/lib/security/rate-limit';
import { getVoiceSecret, mintCallToken } from '@/lib/voice/auth';
import { normalizeE164 } from '@/lib/voice/text';
import { parseCarrierBody, verifyWebhookKey } from '@/lib/voice/texml';
import {
  dialTwilioResponse,
  rejectTwilioResponse,
  sayTwilioHangupResponse,
  streamTwilioResponse,
  verifyTwilioSignature,
} from '@/lib/voice/twilio';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

const xml = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

/**
 * Carrier webhook (Twilio Voice): Inbound calls to a Twilio number arrive here.
 * Twilio connects to our voice worker via a bidirectional WebSocket Media Stream.
 */
async function handle(req: Request): Promise<Response> {
  const raw = req.method === 'POST' ? await req.text() : '';
  const url = new URL(req.url);

  const keyOk = verifyWebhookKey(url.searchParams.get('k'), process.env.VOICE_WEBHOOK_SECRET);
  const body =
    req.method === 'POST'
      ? parseCarrierBody(raw, req.headers.get('content-type'))
      : Object.fromEntries(url.searchParams);

  // Reconstruct external public URL if behind reverse proxy
  const proto = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host;
  const publicUrl = `${proto}://${host}${url.pathname}${url.search}`;

  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSig = req.headers.get('x-twilio-signature');
  const sigOk =
    !!twilioAuthToken &&
    !!twilioSig &&
    (verifyTwilioSignature({
      authToken: twilioAuthToken,
      signature: twilioSig,
      url: publicUrl,
      params: body,
    }) ||
      verifyTwilioSignature({
        authToken: twilioAuthToken,
        signature: twilioSig,
        url: req.url,
        params: body,
      }));

  if (!keyOk && !sigOk) return new Response('Unauthorized', { status: 401 });

  const from = normalizeE164(body.From || body.from || body.Caller || '') || '';
  const to = normalizeE164(body.To || body.to || body.Called || '');
  const callId = body.CallSid || `call_${crypto.randomUUID()}`;

  if (!to) return xml(rejectTwilioResponse());
  const assistant = await Database.getAssistantByPhoneNumber(to);
  if (!assistant) return xml(rejectTwilioResponse());

  if (enforceRateLimitByKey(`voice-hook:${to}`, { windowMs: 60 * 60 * 1000, max: 400 }).errorResponse) {
    return xml(sayTwilioHangupResponse('Sorry, this line is busy right now. Please try again later.'));
  }

  const transfer = assistant.phoneTransferNumber || '';
  const config = {
    bookingStartHour: assistant.bookingStartHour,
    bookingEndHour: assistant.bookingEndHour,
    bookingAvailableDays: assistant.bookingAvailableDays,
    timezone: assistant.timezone,
  };
  if (!isOpenNow(config) && (assistant.phoneAfterHours || 'ai') === 'forward' && transfer) {
    return xml(dialTwilioResponse(transfer, to));
  }

  const streamUrl = process.env.VOICE_STREAM_URL;
  const secret = getVoiceSecret();
  if (!streamUrl || !secret) {
    return transfer
      ? xml(dialTwilioResponse(transfer, to))
      : xml(sayTwilioHangupResponse('Sorry, we cannot take your call right now. Please try again later.'));
  }

  const token = mintCallToken(secret, { callId, assistantId: assistant.id, from, to }, 900);
  return xml(streamTwilioResponse({ url: streamUrl, token, callId, from, to }));
}

const POSTHandler = handle;
const GETHandler = handle;

export const POST = logged(POSTHandler, { route: '/api/channels/twilio' });
export const GET = logged(GETHandler, { route: '/api/channels/twilio' });

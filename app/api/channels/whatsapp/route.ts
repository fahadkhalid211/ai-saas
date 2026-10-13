import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/db';
import { processWhatsAppWebhook } from '@/lib/channels/whatsapp';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';

/**
 * Meta Webhook Verification (GET)
 * Meta sends hub.mode, hub.verify_token, and hub.challenge when saving the webhook in Meta Developer App.
 */
async function GETHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    const assistantId = searchParams.get('assistantId');

    if (!mode || !token) {
      return new NextResponse('Missing parameters', { status: 400 });
    }

    if (mode === 'subscribe') {
      if (assistantId) {
        const assistant = await Database.getAssistantById(assistantId);
        if (assistant?.whatsappVerifyToken && assistant.whatsappVerifyToken !== token) {
          return new NextResponse('Token mismatch', { status: 403 });
        }
      }
      return new NextResponse(challenge || 'OK', { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
  } catch (error: any) {
    return new NextResponse(error?.message || 'Verification failed', { status: 500 });
  }
}

/**
 * Meta Webhook Event Receiver (POST)
 */
async function POSTHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId query parameter is required' }, { status: 400 });
    }

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    if (!assistant.whatsappEnabled) {
      return NextResponse.json({ error: 'WhatsApp is not enabled for this assistant' }, { status: 403 });
    }

    const rawBody = await req.text();

    // Mandatory Meta Webhook Signature Verification
    const signature = req.headers.get('x-hub-signature-256');
    if (!signature) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing mandatory x-hub-signature-256 header' },
        { status: 401 }
      );
    }

    // Meta signs webhooks with the Meta app secret. The per-assistant verify token is a guessable label
    // (it has a public default), so it is accepted as a signing key outside production only.
    const appSecret =
      process.env.WHATSAPP_APP_SECRET || (process.env.NODE_ENV === 'production' ? '' : assistant.whatsappVerifyToken);
    if (!appSecret) {
      return NextResponse.json(
        { error: 'Forbidden: WhatsApp webhook secret is not configured' },
        { status: 403 }
      );
    }

    const expectedSig = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      logEvent({ level: 'warn', category: 'security', event: 'security.invalid_signature', meta: { channel: 'whatsapp', assistantId: assistant.id } });
      return NextResponse.json({ error: 'Forbidden: Invalid webhook signature' }, { status: 403 });
    }

    const body = JSON.parse(rawBody);

    // Answer Meta at once, and finish the reply after the response. The work is registered with after() so the platform keeps
    // the function alive until it is done (a promise left running after the response is frozen with the function, and Meta
    // does not retry a delivery it received a 200 for).
    after(async () => {
      try {
        await processWhatsAppWebhook(assistant, body);
      } catch (err) {
        console.error('[WhatsApp Webhook Handler Error]:', err);
      }
    });

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error: any) {
    console.error('[WhatsApp Route Error]:', error);
    return NextResponse.json({ error: error?.message || 'Webhook failed' }, { status: 500 });
  }
}

/** Room for the AI reply that is finished after the response. */
export const maxDuration = 60;

export const GET = logged(GETHandler, { route: '/api/channels/whatsapp' });
export const POST = logged(POSTHandler, { route: '/api/channels/whatsapp' });

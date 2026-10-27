import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/db';
import { processTikTokWebhook } from '@/lib/channels/tiktok';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';

/**
 * TikTok Webhook Verification (GET)
 * TikTok for Developers sends challenge/token when configuring the webhook URL in the developer portal.
 */
async function GETHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challenge =
      searchParams.get('challenge') ||
      searchParams.get('hub.challenge') ||
      searchParams.get('echostr');
    const token =
      searchParams.get('token') ||
      searchParams.get('verify_token') ||
      searchParams.get('hub.verify_token');
    const assistantId = searchParams.get('assistantId');

    if (assistantId && token) {
      const assistant = await Database.getAssistantById(assistantId);
      if (assistant?.tiktokVerifyToken && assistant.tiktokVerifyToken !== token) {
        return new NextResponse('Token mismatch', { status: 403 });
      }
    }

    if (challenge) {
      return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    return new NextResponse(error?.message || 'Verification failed', { status: 500 });
  }
}

/**
 * TikTok Webhook Event Receiver (POST)
 */
async function POSTHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = {};
    }

    // Handshake: TikTok URL verification challenge via POST
    if (body?.challenge || body?.event === 'url_verification') {
      const challengeToken = body.challenge;
      return NextResponse.json({ challenge: challengeToken }, { status: 200 });
    }

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId query parameter is required' }, { status: 400 });
    }

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    if (!assistant.tiktokEnabled) {
      return NextResponse.json({ error: 'TikTok is not enabled for this assistant' }, { status: 403 });
    }

    // Webhook Signature Verification (when X-TikTok-Signature or x-hub-signature-256 is present)
    const signature =
      req.headers.get('x-tiktok-signature') ||
      req.headers.get('x-hub-signature-256') ||
      req.headers.get('x-signature');

    const appSecret =
      process.env.TIKTOK_APP_SECRET ||
      (process.env.NODE_ENV === 'production' ? '' : assistant.tiktokVerifyToken);

    if (signature && appSecret) {
      const cleanSig = signature.startsWith('sha256=') ? signature.slice(7) : signature;
      const expectedSig = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const sigBuf = Buffer.from(cleanSig);
      const expectedBuf = Buffer.from(expectedSig);

      if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        logEvent({
          level: 'warn',
          category: 'security',
          event: 'security.invalid_signature',
          meta: { channel: 'tiktok', assistantId: assistant.id },
        });
        return NextResponse.json({ error: 'Forbidden: Invalid webhook signature' }, { status: 403 });
      }
    }

    // Answer TikTok immediately with 200 OK and process the AI response in after()
    after(async () => {
      try {
        await processTikTokWebhook(assistant, body);
      } catch (err) {
        console.error('[TikTok Webhook Handler Error]:', err);
      }
    });

    return NextResponse.json({ status: 'EVENT_RECEIVED', code: 0, message: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('[TikTok Route Error]:', error);
    return NextResponse.json({ error: error?.message || 'Webhook failed' }, { status: 500 });
  }
}

/** Room for the AI reply that is finished after the response. */
export const maxDuration = 60;

export const GET = logged(GETHandler, { route: '/api/channels/tiktok' });
export const POST = logged(POSTHandler, { route: '/api/channels/tiktok' });

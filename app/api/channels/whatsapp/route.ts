import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { processWhatsAppWebhook } from '@/lib/channels/whatsapp';

/**
 * Meta Webhook Verification (GET)
 * Meta sends hub.mode, hub.verify_token, and hub.challenge when saving the webhook in Meta Developer App.
 */
export async function GET(req: NextRequest) {
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
export async function POST(req: NextRequest) {
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

    const body = await req.json();

    // Process incoming message asynchronously so Meta gets 200 OK immediately
    processWhatsAppWebhook(assistant, body).catch((err) => {
      console.error('[WhatsApp Webhook Handler Error]:', err);
    });

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error: any) {
    console.error('[WhatsApp Route Error]:', error);
    return NextResponse.json({ error: error?.message || 'Webhook failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/db';
import {
  getTelegramBotInfo,
  setTelegramWebhook,
  processTelegramUpdate,
} from '@/lib/channels/telegram';
import { verifyAdminRequest } from '@/lib/security/auth';

function getTelegramSecretToken(assistantId: string, token: string): string {
  return crypto.createHmac('sha256', token).update(assistantId).digest('hex').slice(0, 32);
}

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

    if (!assistant.telegramBotEnabled || !assistant.telegramBotToken) {
      return NextResponse.json({ error: 'Telegram bot not enabled or configured for this assistant' }, { status: 403 });
    }

    // Verify Telegram Webhook Secret Token
    const secretTokenHeader = req.headers.get('x-telegram-bot-api-secret-token');
    if (!secretTokenHeader) {
      return NextResponse.json({ error: 'Missing x-telegram-bot-api-secret-token header' }, { status: 401 });
    }

    const expectedSecretToken = getTelegramSecretToken(assistant.id, assistant.telegramBotToken);
    const headerBuf = Buffer.from(secretTokenHeader);
    const expectedBuf = Buffer.from(expectedSecretToken);
    if (
      headerBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(headerBuf, expectedBuf)
    ) {
      return NextResponse.json({ error: 'Invalid secret token' }, { status: 403 });
    }

    const update = await req.json();

    // Process update asynchronously so Telegram webhook gets 200 OK immediately
    processTelegramUpdate(assistant, update).catch((err) => {
      console.error('[Telegram Webhook Handler Error]:', err);
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Route Error]:', error);
    return NextResponse.json({ error: error?.message || 'Webhook failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const token = searchParams.get('token');
    const assistantId = searchParams.get('assistantId');

    if (action === 'verify' || action === 'setWebhook') {
      if (!(await verifyAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Action 1: Verify Bot Token and fetch info
    if (action === 'verify' && token) {
      const info = await getTelegramBotInfo(token);
      return NextResponse.json(info);
    }

    // Action 2: Set Webhook automatically
    if (action === 'setWebhook' && assistantId) {
      const assistant = await Database.getAssistantById(assistantId);
      if (!assistant || !assistant.telegramBotToken) {
        return NextResponse.json({ error: 'Assistant or Telegram token not found' }, { status: 400 });
      }

      // Infer host from request
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const webhookUrl = `${protocol}://${host}/api/channels/telegram?assistantId=${assistant.id}`;
      const secretToken = getTelegramSecretToken(assistant.id, assistant.telegramBotToken);

      const res = await setTelegramWebhook(assistant.telegramBotToken, webhookUrl, secretToken);
      return NextResponse.json({ ...res, webhookUrl });
    }

    return NextResponse.json({ status: 'active', channel: 'telegram' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Telegram action failed' }, { status: 500 });
  }
}

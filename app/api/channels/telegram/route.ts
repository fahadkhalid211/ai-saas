import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/db';
import {
  getTelegramBotInfo,
  setTelegramWebhook,
  processTelegramUpdate,
} from '@/lib/channels/telegram';
import { verifyAdminRequest, getAuthContext } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';

/** Room for the AI reply that is finished after the response. */
export const maxDuration = 60;

function getTelegramSecretToken(assistantId: string, token: string): string {
  return crypto.createHmac('sha256', token).update(assistantId).digest('hex').slice(0, 32);
}

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
      logEvent({ level: 'warn', category: 'security', event: 'security.invalid_signature', meta: { channel: 'telegram' } });
      return NextResponse.json({ error: 'Invalid secret token' }, { status: 403 });
    }

    const update = await req.json();

    // Answer Telegram at once, and finish the reply after the response. The work is registered with after() so the platform keeps
    // the function alive until it is done: a promise left running after the response is frozen with the function and the
    // reply is lost at random.
    after(async () => {
      try {
        await processTelegramUpdate(assistant, update);
      } catch (err) {
        console.error('[Telegram Webhook Handler Error]:', err);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Route Error]:', error);
    return NextResponse.json({ error: error?.message || 'Webhook failed' }, { status: 500 });
  }
}

async function GETHandler(req: NextRequest) {
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
      const ctx = await getAuthContext(req);
      const assistant = await Database.getAssistantById(assistantId, ctx.workspaceId);
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

export const POST = logged(POSTHandler, { route: '/api/channels/telegram' });
export const GET = logged(GETHandler, { route: '/api/channels/telegram' });

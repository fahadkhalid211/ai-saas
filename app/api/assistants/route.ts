import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth } from '@/lib/security/auth';
import { maskSecret } from '@/lib/security/crypto';

export const GET = withAdminAuth(async (_req: Request) => {
  try {
    const assistants = await Database.getAssistants();
    const sanitized = assistants.map((a) => ({
      ...a,
      apiKeyEncrypted: a.apiKeyEncrypted ? maskSecret(a.apiKeyEncrypted) : '',
      telegramBotToken: a.telegramBotToken ? maskSecret(a.telegramBotToken) : '',
      whatsappAccessToken: a.whatsappAccessToken ? maskSecret(a.whatsappAccessToken) : '',
      webhookSecret: a.webhookSecret ? maskSecret(a.webhookSecret) : '',
    }));

    return NextResponse.json({ assistants: sanitized });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch assistants' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Assistant name is required' }, { status: 400 });
    }

    const assistant = await Database.createAssistant(body);
    const sanitized = {
      ...assistant,
      apiKeyEncrypted: assistant.apiKeyEncrypted ? maskSecret(assistant.apiKeyEncrypted) : '',
      telegramBotToken: assistant.telegramBotToken ? maskSecret(assistant.telegramBotToken) : '',
      whatsappAccessToken: assistant.whatsappAccessToken ? maskSecret(assistant.whatsappAccessToken) : '',
      webhookSecret: assistant.webhookSecret ? maskSecret(assistant.webhookSecret) : '',
    };

    return NextResponse.json({ assistant: sanitized }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create assistant' },
      { status: 500 }
    );
  }
});

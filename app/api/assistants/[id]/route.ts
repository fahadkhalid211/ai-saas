import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security/auth';
import { maskSecret } from '@/lib/security/crypto';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const assistant = await Database.getAssistantById(id);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const sanitized = {
      ...assistant,
      apiKeyEncrypted: assistant.apiKeyEncrypted ? maskSecret(assistant.apiKeyEncrypted) : '',
      telegramBotToken: assistant.telegramBotToken ? maskSecret(assistant.telegramBotToken) : '',
      whatsappAccessToken: assistant.whatsappAccessToken ? maskSecret(assistant.whatsappAccessToken) : '',
      webhookSecret: assistant.webhookSecret ? maskSecret(assistant.webhookSecret) : '',
    };

    return NextResponse.json({ assistant: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to get assistant' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await Database.updateAssistant(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const sanitized = {
      ...updated,
      apiKeyEncrypted: updated.apiKeyEncrypted ? maskSecret(updated.apiKeyEncrypted) : '',
      telegramBotToken: updated.telegramBotToken ? maskSecret(updated.telegramBotToken) : '',
      whatsappAccessToken: updated.whatsappAccessToken ? maskSecret(updated.whatsappAccessToken) : '',
      webhookSecret: updated.webhookSecret ? maskSecret(updated.webhookSecret) : '',
    };

    return NextResponse.json({ assistant: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update assistant' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    await Database.deleteAssistant(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete assistant' }, { status: 500 });
  }
}

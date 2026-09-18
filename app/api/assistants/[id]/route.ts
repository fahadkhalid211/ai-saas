import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, withRoleAuth, getAuthContext, requireWorkspaceAssistant, generateCalendarFeedToken } from '@/lib/security/auth';
import { maskSecret } from '@/lib/security/crypto';
import { getClientIp } from '@/lib/security/rate-limit';

export const GET = withAdminAuth(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const ctx = await getAuthContext(req);
    const { id } = await params;
    const assistant = await requireWorkspaceAssistant(ctx, id);

    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const sanitized = {
      ...assistant,
      apiKeyEncrypted: assistant.apiKeyEncrypted ? maskSecret(assistant.apiKeyEncrypted) : '',
      telegramBotToken: assistant.telegramBotToken ? maskSecret(assistant.telegramBotToken) : '',
      whatsappAccessToken: assistant.whatsappAccessToken ? maskSecret(assistant.whatsappAccessToken) : '',
      webhookSecret: assistant.webhookSecret ? maskSecret(assistant.webhookSecret) : '',
      calendarFeedToken: generateCalendarFeedToken(assistant.id),
    };

    return NextResponse.json({ assistant: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch assistant' }, { status: 500 });
  }
});

export const PUT = withRoleAuth(['owner', 'admin'], async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const ctx = await getAuthContext(req);
    const { id } = await params;
    const existing = await requireWorkspaceAssistant(ctx, id);
    if (!existing) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated = await Database.updateAssistant(id, body, ctx.workspaceId);
    if (!updated) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const sanitized = {
      ...updated,
      apiKeyEncrypted: updated.apiKeyEncrypted ? maskSecret(updated.apiKeyEncrypted) : '',
      telegramBotToken: updated.telegramBotToken ? maskSecret(updated.telegramBotToken) : '',
      whatsappAccessToken: updated.whatsappAccessToken ? maskSecret(updated.whatsappAccessToken) : '',
      webhookSecret: updated.webhookSecret ? maskSecret(updated.webhookSecret) : '',
      calendarFeedToken: generateCalendarFeedToken(updated.id),
    };

    await Database.addAuditLog({
      workspaceId: existing.workspaceId || ctx.workspaceId,
      actor: {
        id: ctx.memberId,
        name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
        ip: getClientIp(req),
      },
      action: 'assistant.updated',
      targetType: 'assistant',
      targetId: id,
      details: {
        name: updated.name,
        provider: updated.provider,
        modelName: updated.modelName,
      },
    });

    return NextResponse.json({ assistant: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update assistant' }, { status: 500 });
  }
});

export const DELETE = withRoleAuth(['owner', 'admin'], async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const ctx = await getAuthContext(req);
    const { id } = await params;
    const existing = await requireWorkspaceAssistant(ctx, id);
    if (!existing) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const deleted = await Database.deleteAssistant(id, ctx.workspaceId);
    if (!deleted) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    await Database.addAuditLog({
      workspaceId: existing.workspaceId || ctx.workspaceId,
      actor: {
        id: ctx.memberId,
        name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
        ip: getClientIp(req),
      },
      action: 'assistant.deleted',
      targetType: 'assistant',
      targetId: id,
      details: {
        name: existing.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete assistant' }, { status: 500 });
  }
});

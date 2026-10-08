import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, withRoleAuth, getAuthContext, requireWorkspaceAssistant, generateCalendarFeedToken } from '@/lib/security/auth';
import { maskSecret } from '@/lib/security/crypto';
import { hasConnectedAiKey } from '@/lib/ai/resolve-provider';
import { getClientIp } from '@/lib/security/rate-limit';
import { sanitizePhoneSettings } from '@/lib/voice/settings';
import {
  verifyAiProviderConnection,
  verifyTelegramBotConnection,
  verifyWhatsAppConnection,
  verifyWebhookConnection,
} from '@/lib/connectors/verify';
import { logged } from '@/lib/logging/route';
import { sanitizeCostCap } from '@/lib/ai/spend/guard';
import { validateUrl } from '@/lib/security/validation';

const GETHandler = withAdminAuth(async (
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
      hasConnectedKey: hasConnectedAiKey(assistant),
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

const PUTHandler = withRoleAuth(['owner', 'admin'], async (
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
    const {
      id: _forbiddenId,
      workspaceId: _forbiddenWs,
      createdAt: _forbiddenCreatedAt,
      updatedAt: _forbiddenUpdatedAt,
      ...safeUpdates
    } = body;

    // Links the widget and hosted pages render must be web addresses: a javascript: or data: link would run in a visitor's browser.
    for (const field of ['bookingUrl', 'customBrandingUrl'] as const) {
      if (safeUpdates[field] !== undefined && safeUpdates[field] !== null) {
        const urlCheck = validateUrl(safeUpdates[field], true, field === 'bookingUrl' ? 'Booking link' : 'Branding link');
        if (!urlCheck.valid) return NextResponse.json({ error: urlCheck.error }, { status: 400 });
        safeUpdates[field] = urlCheck.value;
      }
    }

    // Monthly cost cap on the customer's own AI key
    if (safeUpdates.costCap !== undefined) {
      const capCheck = sanitizeCostCap(safeUpdates.costCap);
      if (!capCheck.ok) {
        return NextResponse.json({ error: capCheck.error }, { status: 400 });
      }
      safeUpdates.costCap = capCheck.value ?? undefined;
    }

    // Phone channel + timezone fields: validated, and only the platform admin can assign the dialled number.
    const phoneCheck = await sanitizePhoneSettings(safeUpdates, {
      isMasterAdmin: !!ctx.isMasterAdmin,
      existingNumber: existing.phoneNumber,
      isNumberTaken: (n) => Database.isPhoneNumberTaken(n, id),
    });
    if (!phoneCheck.ok) {
      return NextResponse.json({ error: phoneCheck.error }, { status: phoneCheck.status });
    }

    // Connection verification for AI Engine & messaging connectors before saving
    const isAiConfigChanging =
      (safeUpdates.provider !== undefined && safeUpdates.provider !== existing.provider) ||
      (safeUpdates.apiKeyEncrypted !== undefined &&
        !safeUpdates.apiKeyEncrypted.includes('****') &&
        safeUpdates.apiKeyEncrypted !== '') ||
      (safeUpdates.customBaseUrl !== undefined && safeUpdates.customBaseUrl !== existing.customBaseUrl);

    if (isAiConfigChanging) {
      const targetProvider = safeUpdates.provider !== undefined ? safeUpdates.provider : existing.provider;
      const isCustomEndpoint = targetProvider === 'custom';
      const isOllama = targetProvider === 'ollama';

      // Automatically clear leftover localhost URLs when customer uses a cloud provider (Groq, Gemini, OpenAI, Claude, etc.)
      if (!isCustomEndpoint && !isOllama) {
        if (safeUpdates.customBaseUrl === undefined || safeUpdates.customBaseUrl?.includes('localhost') || safeUpdates.customBaseUrl?.includes('127.0.0.1')) {
          phoneCheck.updates.customBaseUrl = '';
        }
      }

      const targetBaseUrl = isCustomEndpoint || isOllama
        ? (safeUpdates.customBaseUrl !== undefined ? safeUpdates.customBaseUrl : existing.customBaseUrl)
        : undefined;

      const targetModel = safeUpdates.modelName !== undefined ? safeUpdates.modelName : existing.modelName;

      let keyToVerify = '';
      if (safeUpdates.apiKeyEncrypted !== undefined) {
        keyToVerify = safeUpdates.apiKeyEncrypted.includes('****')
          ? existing.apiKeyEncrypted || ''
          : safeUpdates.apiKeyEncrypted;
      } else {
        keyToVerify = existing.apiKeyEncrypted || '';
      }

      const aiCheck = await verifyAiProviderConnection(targetProvider, keyToVerify, {
        customBaseUrl: targetBaseUrl,
        modelName: targetModel,
      });

      if (!aiCheck.success) {
        return NextResponse.json(
          {
            error: `Connection verification failed: ${aiCheck.message}`,
            connectionFailed: true,
            details: aiCheck.details,
          },
          { status: 400 }
        );
      }
    }

    if (
      safeUpdates.telegramBotToken !== undefined &&
      !safeUpdates.telegramBotToken.includes('****') &&
      safeUpdates.telegramBotToken.trim() !== ''
    ) {
      const tgCheck = await verifyTelegramBotConnection(safeUpdates.telegramBotToken);
      if (!tgCheck.success) {
        return NextResponse.json(
          {
            error: `Connection verification failed: ${tgCheck.message}`,
            connectionFailed: true,
          },
          { status: 400 }
        );
      }
    }

    if (
      safeUpdates.whatsappAccessToken !== undefined &&
      !safeUpdates.whatsappAccessToken.includes('****') &&
      safeUpdates.whatsappAccessToken.trim() !== ''
    ) {
      const waCheck = await verifyWhatsAppConnection(
        safeUpdates.whatsappAccessToken,
        safeUpdates.whatsappPhoneNumberId || existing.whatsappPhoneNumberId
      );
      if (!waCheck.success) {
        return NextResponse.json(
          {
            error: `Connection verification failed: ${waCheck.message}`,
            connectionFailed: true,
          },
          { status: 400 }
        );
      }
    }

    if (
      safeUpdates.webhookUrl !== undefined &&
      safeUpdates.webhookUrl.trim() !== '' &&
      safeUpdates.webhookUrl !== existing.webhookUrl
    ) {
      const whCheck = await verifyWebhookConnection(safeUpdates.webhookUrl);
      if (!whCheck.success) {
        return NextResponse.json(
          {
            error: `Connection verification failed: ${whCheck.message}`,
            connectionFailed: true,
          },
          { status: 400 }
        );
      }
    }

    const updated = await Database.updateAssistant(id, phoneCheck.updates, ctx.workspaceId);
    if (!updated) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const sanitized = {
      ...updated,
      apiKeyEncrypted: updated.apiKeyEncrypted ? maskSecret(updated.apiKeyEncrypted) : '',
      hasConnectedKey: hasConnectedAiKey(updated),
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
        ...(safeUpdates.costCap !== undefined ? { costCap: updated.costCap ?? null } : {}),
      },
    });

    return NextResponse.json({ assistant: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update assistant' }, { status: 500 });
  }
});

const DELETEHandler = withRoleAuth(['owner', 'admin'], async (
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

export const GET = logged(GETHandler, { route: '/api/assistants/[id]' });
export const PUT = logged(PUTHandler, { route: '/api/assistants/[id]' });
export const DELETE = logged(DELETEHandler, { route: '/api/assistants/[id]' });

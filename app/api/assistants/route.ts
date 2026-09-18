import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, withRoleAuth, getAuthContext, generateCalendarFeedToken } from '@/lib/security/auth';
import { maskSecret } from '@/lib/security/crypto';
import { BILLING_PLANS } from '@/lib/billing/plans';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const assistants = await Database.getAssistants(ctx.workspaceId);
    const sanitized = assistants.map((a) => ({
      ...a,
      apiKeyEncrypted: a.apiKeyEncrypted ? maskSecret(a.apiKeyEncrypted) : '',
      telegramBotToken: a.telegramBotToken ? maskSecret(a.telegramBotToken) : '',
      whatsappAccessToken: a.whatsappAccessToken ? maskSecret(a.whatsappAccessToken) : '',
      webhookSecret: a.webhookSecret ? maskSecret(a.webhookSecret) : '',
      calendarFeedToken: generateCalendarFeedToken(a.id),
    }));

    return NextResponse.json({ assistants: sanitized });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch assistants' },
      { status: 500 }
    );
  }
});

export const POST = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Assistant name is required' }, { status: 400 });
    }

    const targetWorkspaceId = (ctx.memberId === 'master-admin' && body.workspaceId)
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : (body.workspaceId || 'default-workspace'));

    // Enforce subscription plan bot limits
    const existingAssistants = await Database.getAssistants(targetWorkspaceId);
    const billing = await Database.getWorkspaceBilling(targetWorkspaceId);
    const plan = BILLING_PLANS.find((p) => p.id === billing.planId) || BILLING_PLANS[0];

    if (plan.botLimit !== 'Unlimited' && existingAssistants.length >= plan.botLimit) {
      return NextResponse.json(
        {
          error: `AI Assistant bot limit reached for ${plan.name} plan (${existingAssistants.length} of ${plan.botLimit} bots used). Please upgrade to Growth or Scale plan to add more bots.`,
          quotaReached: true,
          planLimit: plan.botLimit,
          currentCount: existingAssistants.length,
          planName: plan.name,
        },
        { status: 403 }
      );
    }

    const assistant = await Database.createAssistant({
      ...body,
      workspaceId: targetWorkspaceId,
    });
    const sanitized = {
      ...assistant,
      apiKeyEncrypted: assistant.apiKeyEncrypted ? maskSecret(assistant.apiKeyEncrypted) : '',
      telegramBotToken: assistant.telegramBotToken ? maskSecret(assistant.telegramBotToken) : '',
      whatsappAccessToken: assistant.whatsappAccessToken ? maskSecret(assistant.whatsappAccessToken) : '',
      webhookSecret: assistant.webhookSecret ? maskSecret(assistant.webhookSecret) : '',
      calendarFeedToken: generateCalendarFeedToken(assistant.id),
    };

    return NextResponse.json({ assistant: sanitized }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create assistant' },
      { status: 500 }
    );
  }
});

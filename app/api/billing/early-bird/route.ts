import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getAuthContext, requireRole } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit, enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { newTrialDates, TRIAL_PLAN_ID } from '@/lib/billing/trial';
import { earlyBirdAvailableFor } from '@/lib/billing/early-bird';
import { logged } from '@/lib/logging/route';
import { emailConfirmationRequired } from '@/lib/security/email-verification-gate';

export const dynamic = 'force-dynamic';

/** Starts the launch-offer trial without a card. Once per workspace; only while no trial has started. */
async function POSTHandler(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx.authenticated || ctx.isMasterAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!requireRole(ctx, ['owner', 'admin', 'billing_manager'])) {
    return NextResponse.json({ error: 'Only an owner, admin or billing manager can start the trial.' }, { status: 403 });
  }
  const unconfirmed = await emailConfirmationRequired(ctx.memberId);
  if (unconfirmed) return unconfirmed;
  const limited =
    (await enforceDistributedRateLimit(req, 'early-bird', { windowMs: 24 * 60 * 60 * 1000, max: 5 })) ||
    (await enforceDistributedRateLimitByKey(`early-bird-ws:${ctx.workspaceId}`, { windowMs: 60 * 60 * 1000, max: 5 }));
  if (limited) return limited;

  const ws = await Database.getWorkspaceBilling(ctx.workspaceId);
  if (!earlyBirdAvailableFor(ws)) {
    return NextResponse.json({ error: 'The no-card trial is not available for this workspace. Use the contact form and we will sort it out.' }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = BILLING_PLANS.find((p) => p.id === (body?.planId || TRIAL_PLAN_ID)) || BILLING_PLANS.find((p) => p.id === TRIAL_PLAN_ID)!;
  const interval = body?.billingInterval === 'monthly' ? 'monthly' : 'annual';
  const dates = newTrialDates();

  await Database.updateWorkspaceBilling(ws.id, {
    requiresSubscription: false,
    earlyBird: true,
    planId: plan.id,
    planName: plan.name,
    billingInterval: interval,
    monthlyChatLimit: plan.chatSessionsLimit,
    overageRatePerChat: plan.overageRate,
    landingPageLimit: plan.landingPageLimit,
    ...dates,
  });
  await Database.addAuditLog({
    workspaceId: ws.id,
    actor: { id: ctx.memberId, name: ctx.role, ip: getClientIp(req) },
    action: 'billing.early_bird_trial_started',
    targetType: 'workspace_billing',
    targetId: ws.id,
    details: { planId: plan.id, interval },
  });
  return NextResponse.json({ success: true, trialEndsAt: dates.trialEndsAt });
}

export const POST = logged(POSTHandler, { route: '/api/billing/early-bird' });

import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import {
  buildCheckoutUrl,
  canChangePlanInApp,
  changeSubscriptionPlan,
  checkoutLink,
  getCustomerPortalUrl,
  isBillingConfigured,
  sandboxAllowed,
  cleanCustomerEmail,
  type BillingInterval,
  type PaidPlanId,
} from '@/lib/billing/lemonsqueezy';
import { enforceDistributedRateLimit, enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { newTrialDates, trialAvailable } from '@/lib/billing/trial';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { getAuthContext, requireRole } from '@/lib/security/auth';
import { getClientIp, enforceRateLimit } from '@/lib/security/rate-limit';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';
import { emailConfirmationRequired } from '@/lib/security/email-verification-gate';

async function POSTHandler(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'billing-checkout', { windowMs: 60 * 1000, max: 10 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!requireRole(ctx, ['owner', 'admin', 'billing_manager'])) {
      return NextResponse.json(
        { error: `Forbidden: role '${ctx.role}' lacks permission for billing checkout` },
        { status: 403 }
      );
    }
    const unconfirmed = await emailConfirmationRequired(ctx.memberId);
    if (unconfirmed) return unconfirmed;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { planId, billingInterval = 'monthly' } = body as { planId?: any; billingInterval?: any };

    // Only plain strings from a fixed list are accepted; nothing typed by the user reaches the checkout link.
    if (typeof planId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing planId' }, { status: 400 });
    }
    if (typeof billingInterval !== 'string') {
      return NextResponse.json({ error: 'Invalid billingInterval' }, { status: 400 });
    }

    const VALID_PLAN_IDS = BILLING_PLANS.map((p) => p.id);
    if (!VALID_PLAN_IDS.includes(planId as any)) {
      return NextResponse.json(
        { error: `Invalid or missing planId. Must be one of: ${VALID_PLAN_IDS.join(', ')}` },
        { status: 400 }
      );
    }
    if (billingInterval !== 'monthly' && billingInterval !== 'annual') {
      return NextResponse.json(
        { error: `Invalid billingInterval '${billingInterval}'. Must be 'monthly' or 'annual'` },
        { status: 400 }
      );
    }
    const plan = planId as PaidPlanId;
    const interval = billingInterval as BillingInterval;

    const workspaceId = ctx.isMasterAdmin && typeof body.workspaceId === 'string'
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');

    // Card-testing defence: each workspace and each address can only open a handful of checkouts per hour, shared across servers.
    const limitedByWorkspace = await enforceDistributedRateLimitByKey(`billing-checkout:ws:${workspaceId}`, { windowMs: 60 * 60 * 1000, max: 6 });
    if (limitedByWorkspace) return limitedByWorkspace;
    const limitedByIp = await enforceDistributedRateLimit(req, 'billing-checkout-ip', { windowMs: 60 * 60 * 1000, max: 15 });
    if (limitedByIp) return limitedByIp;

    const ws = await Database.getWorkspaceBilling(workspaceId);
    const targetPlan = BILLING_PLANS.find((p) => p.id === plan)!;
    const live = isBillingConfigured();

    if (!live && !sandboxAllowed()) {
      logEvent({ level: 'error', category: 'billing', event: 'billing.not_configured' });
      return NextResponse.json({ error: 'Billing is not available right now. Please contact support.' }, { status: 503 });
    }

    if (live) {
      if (!checkoutLink(plan, interval)) {
        return NextResponse.json(
          { error: interval === 'annual' ? 'Yearly billing is not available for this plan yet. Choose monthly billing.' : 'This plan cannot be bought right now. Please contact support.' },
          { status: 400 }
        );
      }

      if (ws.billingSubscriptionId && ws.subscriptionStatus !== 'canceled') {
        // Already subscribed: move the existing subscription. A second checkout would create a second, double-billed one.
        if (canChangePlanInApp(plan, interval)) {
          try {
            await changeSubscriptionPlan(ws.billingSubscriptionId, plan, interval);
          } catch (err: any) {
            return NextResponse.json({ error: err?.message || 'Could not change the plan. Use "Manage subscription" instead.' }, { status: 502 });
          }
          // the plan itself is updated by the webhook Lemon Squeezy sends for the change
          await Database.addAuditLog({
            workspaceId: ws.id,
            actor: { id: ctx.memberId, name: ctx.role === 'owner' ? 'Workspace Owner' : 'Billing Manager', ip: getClientIp(req) },
            action: 'billing.plan_change_requested',
            targetType: 'workspace_billing',
            targetId: ws.id,
            details: { planId: plan, billingInterval: interval },
          });
          return NextResponse.json({ success: true, isSandbox: false, message: 'Your plan change was sent. It shows here as soon as it is confirmed, usually within a minute.' });
        }
        // switching is done in the customer portal
        const portal = await getCustomerPortalUrl(ws.billingSubscriptionId);
        return NextResponse.json({ success: true, isSandbox: false, url: portal, message: 'Change your plan in the billing portal.' });
      }

      const url = buildCheckoutUrl({ planId: plan, interval, workspaceId: ws.id, customerEmail: cleanCustomerEmail(ws.billingEmail) });
      if (!url) {
        return NextResponse.json({ error: 'This plan cannot be bought right now. Please contact support.' }, { status: 400 });
      }

      await Database.addAuditLog({
        workspaceId: ws.id,
        actor: {
          id: ctx.memberId,
          name: ctx.role === 'owner' ? 'Workspace Owner' : 'Billing Manager',
          ip: getClientIp(req),
        },
        action: 'billing.checkout_initiated',
        targetType: 'checkout',
        targetId: `${plan}:${interval}`,
        details: { planId: plan, billingInterval: interval, isSandbox: false },
      });

      return NextResponse.json({ success: true, isSandbox: false, url });
    }

    // Operating in Sandbox Mode (instant direct activation, development only)
    // Prevent a duplicate invoice if already on this exact plan and interval
    if (ws.billingSubscriptionId && ws.planId === targetPlan.id && ws.billingInterval === interval) {
      return NextResponse.json({
        success: true,
        isSandbox: true,
        message: `Workspace is already on the ${targetPlan.name} (${interval}) plan.`,
        planId: targetPlan.id,
        billingInterval: interval,
      });
    }

    // The first subscription of a workspace starts with the 14-day trial
    const withTrial = trialAvailable(ws);
    const todayStr = new Date().toISOString().split('T')[0];
    const price = interval === 'annual' ? targetPlan.annualMonthlyPrice * 12 : targetPlan.monthlyPrice;

    const newInvoice = {
      id: `inv_${Date.now().toString().slice(-6)}`,
      date: todayStr,
      planName: `${targetPlan.name} (${interval === 'annual' ? 'Annual' : 'Monthly'})`,
      amount: price,
      status: 'paid' as const,
    };

    const currentInvoices = ws.invoices || [];

    await Database.updateWorkspaceBilling(ws.id, {
      planId: targetPlan.id,
      planName: targetPlan.name,
      billingInterval: interval,
      monthlyChatLimit: targetPlan.chatSessionsLimit,
      overageRatePerChat: targetPlan.overageRate,
      landingPageLimit: targetPlan.landingPageLimit,
      // simulated subscription (development only): a trial when one is available, otherwise paid
      billingSubscriptionId: 'sandbox_sub',
      subscriptionStatus: withTrial ? 'trialing' : 'active',
      ...(withTrial ? newTrialDates() : {}),
      invoices: withTrial ? currentInvoices : [newInvoice, ...currentInvoices],
    });

    await Database.addAuditLog({
      workspaceId: ws.id,
      actor: { id: ctx.memberId, name: ctx.role === 'owner' ? 'Workspace Owner' : 'Billing Manager', ip: getClientIp(req) },
      action: 'billing.checkout_initiated',
      targetType: 'checkout',
      targetId: 'sandbox',
      details: { planId: plan, billingInterval: interval, isSandbox: true },
    });

    return NextResponse.json({
      success: true,
      isSandbox: true,
      message: `Sandbox: Successfully upgraded to ${targetPlan.name} plan (simulated payment).`,
      planId: targetPlan.id,
      billingInterval: interval,
    });
  } catch (error: any) {
    console.error('[Billing Checkout] Error creating checkout:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize checkout session' },
      { status: 500 }
    );
  }
}

export const POST = logged(POSTHandler, { route: '/api/billing/checkout' });

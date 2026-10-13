import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { createCheckoutSession, changeSubscriptionPlan, cleanCustomerEmail, isStripeConfigured, sandboxAllowed, stripeModeOk } from '@/lib/billing/stripe';
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

    const { planId, billingInterval = 'monthly', addonType } = body as { planId?: any; billingInterval?: any; addonType?: any };

    // Only plain strings from a fixed list are accepted; nothing typed by the user reaches Stripe.
    if (typeof planId !== 'undefined' && typeof planId !== 'string') {
      return NextResponse.json({ error: 'Invalid planId' }, { status: 400 });
    }
    if (typeof addonType !== 'undefined' && typeof addonType !== 'string') {
      return NextResponse.json({ error: 'Invalid addonType' }, { status: 400 });
    }
    if (typeof billingInterval !== 'string') {
      return NextResponse.json({ error: 'Invalid billingInterval' }, { status: 400 });
    }

    // Validate addonType if specified
    if (addonType !== undefined) {
      if (addonType !== 'extra_landing_page') {
        return NextResponse.json(
          { error: `Unsupported addonType '${addonType}'. Supported types: extra_landing_page` },
          { status: 400 }
        );
      }
    }

    // Validate planId if addonType is not specified
    const VALID_PLAN_IDS = BILLING_PLANS.map((p) => p.id);
    if (!addonType) {
      if (!planId || typeof planId !== 'string' || !VALID_PLAN_IDS.includes(planId as any)) {
        return NextResponse.json(
          { error: `Invalid or missing planId. Must be one of: ${VALID_PLAN_IDS.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate billingInterval
    if (billingInterval !== 'monthly' && billingInterval !== 'annual') {
      return NextResponse.json(
        { error: `Invalid billingInterval '${billingInterval}'. Must be 'monthly' or 'annual'` },
        { status: 400 }
      );
    }

    const workspaceId = ctx.isMasterAdmin && typeof body.workspaceId === 'string'
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');

    // Card-testing defence: each workspace and each address can only open a handful of checkouts per hour, shared across servers.
    const limitedByWorkspace = await enforceDistributedRateLimitByKey(`billing-checkout:ws:${workspaceId}`, { windowMs: 60 * 60 * 1000, max: 6 });
    if (limitedByWorkspace) return limitedByWorkspace;
    const limitedByIp = await enforceDistributedRateLimit(req, 'billing-checkout-ip', { windowMs: 60 * 60 * 1000, max: 15 });
    if (limitedByIp) return limitedByIp;

    if (!stripeModeOk()) {
      logEvent({ level: 'error', category: 'billing', event: 'billing.test_key_in_production' });
      return NextResponse.json({ error: 'Billing is not available right now. Please contact support.' }, { status: 503 });
    }

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${origin}/dashboard?billing_success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/dashboard?billing_cancelled=true`;

    const ws = await Database.getWorkspaceBilling(workspaceId);
    // The first subscription of a workspace starts with the 14-day trial (card collected now, charged when it ends)
    const withTrial = !addonType && trialAvailable(ws);

    if (!addonType && isStripeConfigured() && ws.stripeSubscriptionId && ws.subscriptionStatus !== 'canceled') {
      // Already subscribed: move the existing subscription. A second Checkout would create a second, double-billed one.
      try {
        await changeSubscriptionPlan(ws.stripeSubscriptionId, planId as 'starter' | 'growth' | 'scale', billingInterval);
      } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Could not change the plan. Use "Manage subscription" instead.' }, { status: 502 });
      }
      await Database.updateWorkspaceBilling(ws.id, {
        planId: planId as 'starter' | 'growth' | 'scale',
        planName: BILLING_PLANS.find((p) => p.id === planId)!.name,
        billingInterval,
        monthlyChatLimit: BILLING_PLANS.find((p) => p.id === planId)!.chatSessionsLimit,
        overageRatePerChat: BILLING_PLANS.find((p) => p.id === planId)!.overageRate,
        landingPageLimit: BILLING_PLANS.find((p) => p.id === planId)!.landingPageLimit,
      });
      return NextResponse.json({ success: true, isSandbox: false, message: 'Your plan was updated. Changes take effect on your next billing date; nothing extra is charged during a trial.' });
    }

    if (!isStripeConfigured() && !sandboxAllowed()) {
      logEvent({ level: 'error', category: 'billing', event: 'billing.stripe_not_configured' });
      return NextResponse.json({ error: 'Billing is not available right now. Please contact support.' }, { status: 503 });
    }

    // Call Stripe helper
    const result = await createCheckoutSession({
      workspaceId: ws.id,
      workspaceName: ws.name,
      customerEmail: cleanCustomerEmail(ws.billingEmail),
      planId: planId as 'starter' | 'growth' | 'scale' | undefined,
      billingInterval,
      addonType,
      withTrial,
      successUrl,
      cancelUrl,
    });

    await Database.addAuditLog({
      workspaceId: ws.id,
      actor: {
        id: ctx.memberId,
        name: ctx.role === 'owner' ? 'Workspace Owner' : 'Billing Manager',
        ip: getClientIp(req),
      },
      action: 'billing.checkout_initiated',
      targetType: 'checkout_session',
      targetId: result.sessionId || 'sandbox',
      details: {
        planId,
        billingInterval,
        addonType,
        isSandbox: result.isSandbox,
      },
    });

    // If Stripe is configured and session URL generated, return redirect URL
    if (!result.isSandbox && result.url) {
      return NextResponse.json({
        success: true,
        isSandbox: false,
        url: result.url,
        sessionId: result.sessionId,
      });
    }

    // Operating in Sandbox Mode (Instant direct activation for dev/demo)
    if (addonType === 'extra_landing_page') {
      const addonResult = await Database.purchaseExtraLandingPageSlot(ws.id);
      return NextResponse.json({
        success: true,
        isSandbox: true,
        message: 'Sandbox: 1 Extra Landing Page slot successfully activated ($100 one-time).',
        newSlotCount: addonResult.newSlotCount,
        invoice: addonResult.invoice,
      });
    }

    // Sandbox Plan Upgrade
    const targetPlan = BILLING_PLANS.find((p) => p.id === planId)!;
    const interval = billingInterval as 'monthly' | 'annual';

    // Prevent duplicate duplicate invoice if already on this exact plan and interval
    if (ws.stripeSubscriptionId && ws.planId === targetPlan.id && ws.billingInterval === interval) {
      return NextResponse.json({
        success: true,
        isSandbox: true,
        message: `Workspace is already on the ${targetPlan.name} (${interval}) plan.`,
        planId: targetPlan.id,
        billingInterval: interval,
      });
    }

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
      stripeSubscriptionId: 'sandbox_sub',
      subscriptionStatus: withTrial ? 'trialing' : 'active',
      ...(withTrial ? newTrialDates() : {}),
      invoices: withTrial ? currentInvoices : [newInvoice, ...currentInvoices],
    });

    return NextResponse.json({
      success: true,
      isSandbox: true,
      message: `Sandbox: Successfully upgraded to ${targetPlan.name} plan with Google Pay / Card payment simulated!`,
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

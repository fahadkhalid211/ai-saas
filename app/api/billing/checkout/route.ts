import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { createCheckoutSession, isStripeConfigured } from '@/lib/billing/stripe';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { getAuthContext, requireRole } from '@/lib/security/auth';
import { getClientIp, enforceRateLimit } from '@/lib/security/rate-limit';
import { logged } from '@/lib/logging/route';

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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { planId, billingInterval = 'monthly', addonType } = body;

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

    const workspaceId = ctx.isMasterAdmin && body.workspaceId
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${origin}/?billing_success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/?billing_cancelled=true`;

    const ws = await Database.getWorkspaceBilling(workspaceId);

    // Call Stripe helper
    const result = await createCheckoutSession({
      workspaceId: ws.id,
      workspaceName: ws.name,
      customerEmail: ws.billingEmail,
      planId,
      billingInterval,
      addonType,
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
    if (ws.planId === targetPlan.id && ws.billingInterval === interval) {
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
      invoices: [newInvoice, ...currentInvoices],
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

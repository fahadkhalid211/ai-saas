import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { createCheckoutSession, isStripeConfigured } from '@/lib/billing/stripe';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { getAuthContext, requireRole } from '@/lib/security/auth';

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json().catch(() => ({}));
    const { planId, billingInterval = 'monthly', addonType } = body;
    const workspaceId = body.workspaceId || 'default-workspace';

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
    const targetPlan = BILLING_PLANS.find((p) => p.id === planId) || BILLING_PLANS[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const price = billingInterval === 'annual' ? targetPlan.annualMonthlyPrice * 12 : targetPlan.monthlyPrice;

    const newInvoice = {
      id: `inv_${Date.now().toString().slice(-6)}`,
      date: todayStr,
      planName: `${targetPlan.name} (${billingInterval === 'annual' ? 'Annual' : 'Monthly'})`,
      amount: price,
      status: 'paid' as const,
    };

    const currentInvoices = ws.invoices || [];

    await Database.updateWorkspaceBilling(ws.id, {
      planId: targetPlan.id,
      planName: targetPlan.name,
      billingInterval,
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
      billingInterval,
    });
  } catch (error: any) {
    console.error('[Billing Checkout] Error creating checkout:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize checkout session' },
      { status: 500 }
    );
  }
}

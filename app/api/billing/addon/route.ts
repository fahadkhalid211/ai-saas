import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { BILLING_PLANS, EXTRA_LANDING_PAGE_ADDON_PRICE } from '@/lib/billing/plans';
import { withRoleAuth, getAuthContext } from '@/lib/security/auth';
import { createCheckoutSession, isStripeConfigured } from '@/lib/billing/stripe';

export const POST = withRoleAuth(['owner', 'admin', 'billing_manager'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const body = await req.json().catch(() => ({}));
    const { addonType } = body;
    const targetWsId = ctx.isMasterAdmin && body.workspaceId
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');

    if (addonType !== 'extra_landing_page') {
      return NextResponse.json({ success: false, error: 'Unsupported addon type' }, { status: 400 });
    }

    const ws = await Database.getWorkspaceBilling(targetWsId);
    const origin = (req as any).nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${origin}/?addon_success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/?addon_cancelled=true`;

    // Real payment gate: If Stripe is configured, create a real Stripe Checkout session
    if (isStripeConfigured()) {
      const checkout = await createCheckoutSession({
        workspaceId: ws.id,
        workspaceName: ws.name,
        customerEmail: ws.billingEmail,
        addonType: 'extra_landing_page',
        successUrl,
        cancelUrl,
      });

      if (!checkout.isSandbox && checkout.url) {
        return NextResponse.json({
          success: true,
          isSandbox: false,
          url: checkout.url,
          sessionId: checkout.sessionId,
        });
      }
    }

    // Operating in Sandbox Mode (Stripe not configured - demo/dev environment)
    const result = await Database.purchaseExtraLandingPageSlot(targetWsId);
    const billing = await Database.getWorkspaceBilling(targetWsId);
    const plan = BILLING_PLANS.find((p) => p.id === billing.planId) || BILLING_PLANS[0];
    const totalAllowed = (plan.landingPageLimit || 1) + (billing.extraLandingPagesCount || 0);

    return NextResponse.json({
      success: true,
      isSandbox: true,
      newSlotCount: result.newSlotCount,
      totalAllowed,
      price: EXTRA_LANDING_PAGE_ADDON_PRICE,
      invoice: result.invoice,
      billing,
      message: `Sandbox: Added 1 extra landing page slot for $${EXTRA_LANDING_PAGE_ADDON_PRICE} (Demo Mode). You can now create up to ${totalAllowed} landing pages!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
});

import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { BILLING_PLANS, EXTRA_LANDING_PAGE_ADDON_PRICE } from '@/lib/billing/plans';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { addonType } = body;
    const targetWsId = (body.workspaceId && body.workspaceId !== '*')
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');

    if (addonType !== 'extra_landing_page') {
      return NextResponse.json({ success: false, error: 'Unsupported addon type' }, { status: 400 });
    }

    const result = await Database.purchaseExtraLandingPageSlot(targetWsId);
    const billing = await Database.getWorkspaceBilling(targetWsId);
    const plan = BILLING_PLANS.find((p) => p.id === billing.planId) || BILLING_PLANS[0];
    const totalAllowed = (plan.landingPageLimit || 1) + (billing.extraLandingPagesCount || 0);

    return NextResponse.json({
      success: true,
      newSlotCount: result.newSlotCount,
      totalAllowed,
      price: EXTRA_LANDING_PAGE_ADDON_PRICE,
      invoice: result.invoice,
      billing,
      message: `Successfully added 1 extra landing page slot for $${EXTRA_LANDING_PAGE_ADDON_PRICE}. You can now create up to ${totalAllowed} landing pages!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
});

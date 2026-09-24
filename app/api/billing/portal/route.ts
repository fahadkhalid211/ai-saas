import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { createCustomerPortalSession } from '@/lib/billing/stripe';
import { getAuthContext, requireRole } from '@/lib/security/auth';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logged } from '@/lib/logging/route';

async function POSTHandler(req: NextRequest) {
  try {
    const rateLimitRes = enforceRateLimit(req, 'billing-portal', { max: 10, windowMs: 60 * 1000 });
    if (rateLimitRes.errorResponse) return rateLimitRes.errorResponse;

    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!requireRole(ctx, ['owner', 'admin', 'billing_manager'])) {
      return NextResponse.json(
        { error: `Forbidden: role '${ctx.role}' lacks permission for customer portal access` },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const workspaceId = ctx.isMasterAdmin && body.workspaceId
      ? body.workspaceId
      : (ctx.workspaceId && ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');
    const ws = await Database.getWorkspaceBilling(workspaceId);

    const customerId = (ws as any).stripeCustomerId;
    if (!customerId) {
      return NextResponse.json(
        {
          error: 'No active Stripe customer account associated with this workspace. Upgrade your plan via Stripe Checkout first.',
        },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${origin}/`;

    const portalUrl = await createCustomerPortalSession(customerId, returnUrl);
    if (!portalUrl) {
      return NextResponse.json({ error: 'Failed to generate customer portal session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: portalUrl });
  } catch (error: any) {
    console.error('[Billing Portal] Error generating portal session:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize customer portal' },
      { status: 500 }
    );
  }
}

export const POST = logged(POSTHandler, { route: '/api/billing/portal' });

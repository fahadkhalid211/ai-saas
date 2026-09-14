import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { createCustomerPortalSession } from '@/lib/billing/stripe';
import { verifyAdminRequest } from '@/lib/security/auth';

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await verifyAdminRequest(req);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const workspaceId = body.workspaceId || 'default-workspace';
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

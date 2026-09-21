import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { constructWebhookEvent } from '@/lib/billing/stripe';
import { BILLING_PLANS } from '@/lib/billing/plans';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const event = constructWebhookEvent(rawBody, signature);
    if (!event) {
      return NextResponse.json({ error: 'Invalid webhook signature or missing secret' }, { status: 400 });
    }

    // Webhook Idempotency: Deduplicate repeated events to prevent duplicate invoices or slot allocations
    if (await Database.isWebhookProcessed(event.id)) {
      console.log(`[Stripe Webhook] Duplicate event ignored: ${event.type} (${event.id})`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const workspaceId = session.metadata?.workspaceId || 'default-workspace';
        const addonType = session.metadata?.addonType;
        const planId = session.metadata?.planId;
        const billingInterval = (session.metadata?.billingInterval as 'monthly' | 'annual') || 'monthly';

        if (addonType === 'extra_landing_page') {
          await Database.purchaseExtraLandingPageSlot(workspaceId);
          console.log(`[Stripe Webhook] Workspace ${workspaceId} purchased extra landing page slot.`);
          break;
        }

        if (planId) {
          const targetPlan = BILLING_PLANS.find((p) => p.id === planId) || BILLING_PLANS[0];
          const ws = await Database.getWorkspaceBilling(workspaceId);
          const todayStr = new Date().toISOString().split('T')[0];
          const amount = (session.amount_total || 0) / 100;

          const newInvoice = {
            id: `inv_${session.id.slice(-6)}`,
            date: todayStr,
            planName: `${targetPlan.name} (${billingInterval === 'annual' ? 'Annual' : 'Monthly'})`,
            amount,
            status: 'paid' as const,
          };

          const currentInvoices = ws.invoices || [];

          await Database.updateWorkspaceBilling(workspaceId, {
            planId: targetPlan.id,
            planName: targetPlan.name,
            billingInterval,
            monthlyChatLimit: targetPlan.chatSessionsLimit,
            overageRatePerChat: targetPlan.overageRate,
            landingPageLimit: targetPlan.landingPageLimit,
            stripeCustomerId: session.customer ? String(session.customer) : undefined,
            stripeSubscriptionId: session.subscription ? String(session.subscription) : undefined,
            invoices: [newInvoice, ...currentInvoices],
          } as any);

          console.log(`[Stripe Webhook] Workspace ${workspaceId} upgraded to ${targetPlan.name} (${billingInterval}).`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer ? String(subscription.customer) : null;
        if (customerId) {
          const ws = await Database.findWorkspaceByStripeCustomer(customerId);
          if (ws) {
            const starterPlan = BILLING_PLANS[0];
            await Database.updateWorkspaceBilling(ws.id, {
              planId: starterPlan.id,
              planName: starterPlan.name,
              monthlyChatLimit: starterPlan.chatSessionsLimit,
              overageRatePerChat: starterPlan.overageRate,
              landingPageLimit: starterPlan.landingPageLimit,
              stripeSubscriptionId: undefined,
            } as any);
            console.log(`[Stripe Webhook] Subscription cancelled for workspace ${ws.id}, reverted to Starter.`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer ? String(invoice.customer) : null;
        if (customerId && invoice.amount_paid > 0) {
          const ws = await Database.findWorkspaceByStripeCustomer(customerId);
          if (ws) {
            const currentInvoices = ws.invoices || [];
            const newInvoice = {
              id: `inv_${invoice.id.slice(-6)}`,
              date: new Date().toISOString().split('T')[0],
              planName: ws.planName || 'Crescelo Subscription',
              amount: invoice.amount_paid / 100,
              status: 'paid' as const,
              pdfUrl: invoice.hosted_invoice_url || invoice.invoice_pdf,
            };
            await Database.updateWorkspaceBilling(ws.id, {
              invoices: [newInvoice, ...currentInvoices],
            });
            console.log(`[Stripe Webhook] Logged invoice payment for workspace ${ws.id}: $${newInvoice.amount}`);
          }
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    await Database.recordProcessedWebhook(event.id);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Execution error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}

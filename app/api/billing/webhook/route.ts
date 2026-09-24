import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { cancelSubscriptionNow, constructWebhookEvent, retrieveSubscriptionSummary } from '@/lib/billing/stripe';
import { sendBillingEmail } from '@/lib/billing/emails';
import { newTrialDates } from '@/lib/billing/trial';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';

async function POSTHandler(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const event = constructWebhookEvent(rawBody, signature);
    if (!event) {
      logEvent({ level: 'warn', category: 'security', event: 'security.invalid_signature', meta: { channel: 'stripe' } });
      return NextResponse.json({ error: 'Invalid webhook signature or missing secret' }, { status: 400 });
    }
    logEvent({ category: 'billing', event: 'billing.webhook_received', meta: { type: event.type, eventId: event.id } });

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
          // every purchase is followed by a receipt to the customer
          const buyer = session.customer_details?.email || session.customer_email;
          await sendBillingEmail({ kind: 'receipt', to: buyer, planName: 'Additional landing page slot', amount: (session.amount_total || 0) / 100 });
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

          const subId = session.subscription ? String(session.subscription) : undefined;
          // Stripe is the source of truth for the trial: its status, when the trial ends (the first charge) and any pending cancellation
          const sub = subId ? await retrieveSubscriptionSummary(subId) : null;
          const isTrial = session.metadata?.trial === 'true';
          const fallbackTrial = newTrialDates();
          await Database.updateWorkspaceBilling(workspaceId, {
            planId: targetPlan.id,
            planName: targetPlan.name,
            billingInterval,
            monthlyChatLimit: targetPlan.chatSessionsLimit,
            overageRatePerChat: targetPlan.overageRate,
            landingPageLimit: targetPlan.landingPageLimit,
            stripeCustomerId: session.customer ? String(session.customer) : undefined,
            stripeSubscriptionId: subId,
            subscriptionStatus: sub?.status ?? (isTrial ? 'trialing' : 'active'),
            cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
            ...(isTrial ? { trialStartedAt: fallbackTrial.trialStartedAt, trialEndsAt: sub?.trialEnd ?? fallbackTrial.trialEndsAt } : {}),
            // a trial has nothing to invoice yet; the first invoice arrives with the first charge
            invoices: amount > 0 ? [newInvoice, ...currentInvoices] : currentInvoices,
            ...(sub?.card ? { paymentMethod: { brand: sub.card.brand, last4: sub.card.last4, expMonth: sub.card.expMonth, expYear: sub.card.expYear }, cardFingerprint: sub.card.fingerprint || undefined } : {}),
          } as any);

          // One free trial per physical card: a second workspace using the same card is stopped before any service is given
          if (isTrial && sub?.card?.fingerprint) {
            const earlier = await Database.findOtherWorkspaceByCardFingerprint(sub.card.fingerprint, workspaceId);
            if (earlier && subId) {
              await cancelSubscriptionNow(subId);
              await Database.updateWorkspaceBilling(workspaceId, { subscriptionStatus: 'canceled', billingRisk: 'trial_card_reused' } as any);
              logEvent({ level: 'warn', category: 'security', event: 'billing.trial_card_reused', meta: { workspaceId } });
              break;
            }
          }

          const to = ws.billingEmail || session.customer_details?.email || session.customer_email;
          const firstCharge = isTrial ? (sub?.trialEnd ?? fallbackTrial.trialEndsAt) : null;
          const price = billingInterval === 'annual' ? targetPlan.annualMonthlyPrice * 12 : targetPlan.monthlyPrice;
          if (isTrial) {
            await sendBillingEmail({ kind: 'trial_started', to, workspaceName: ws.name, planName: targetPlan.name, amount: price, interval: billingInterval, date: firstCharge });
          }
          // a paid (non-trial) checkout is followed by the invoice.payment_succeeded receipt below

          console.log(`[Stripe Webhook] Workspace ${workspaceId} upgraded to ${targetPlan.name} (${billingInterval}).`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        // trial converted to paid, payment failed (past_due), plan changed, or the owner set it to cancel at period end
        const subscription = event.data.object as any;
        const customerId = subscription.customer ? String(subscription.customer) : null;
        const ws = customerId ? await Database.findWorkspaceByStripeCustomer(customerId) : null;
        if (ws) {
          await Database.updateWorkspaceBilling(ws.id, {
            subscriptionStatus: subscription.status,
            cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
            ...(subscription.trial_end ? { trialEndsAt: new Date(subscription.trial_end * 1000).toISOString() } : {}),
          } as any);
          logEvent({ category: 'billing', event: 'billing.subscription_updated', meta: { workspaceId: ws.id, status: subscription.status, cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end) } });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Cancelled (during the trial nothing was ever charged) or ended after failed payments. Service stops; there is no free plan.
        const subscription = event.data.object as any;
        const customerId = subscription.customer ? String(subscription.customer) : null;
        if (customerId) {
          const ws = await Database.findWorkspaceByStripeCustomer(customerId);
          if (ws) {
            await Database.updateWorkspaceBilling(ws.id, { subscriptionStatus: 'canceled', cancelAtPeriodEnd: false } as any);
            logEvent({ category: 'billing', event: 'billing.subscription_ended', meta: { workspaceId: ws.id } });
            if (!ws.billingRisk) await sendBillingEmail({ kind: 'cancelled', to: ws.billingEmail, workspaceName: ws.name });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer ? String(invoice.customer) : null;
        const ws = customerId ? await Database.findWorkspaceByStripeCustomer(customerId) : null;
        if (ws) {
          logEvent({ level: 'warn', category: 'billing', event: 'billing.payment_failed', meta: { workspaceId: ws.id, attempt: invoice.attempt_count } });
          await sendBillingEmail({ kind: 'payment_failed', to: ws.billingEmail || invoice.customer_email, workspaceName: ws.name, planName: ws.planName, amount: (invoice.amount_due || 0) / 100 });
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        // Stripe sends this three days before the trial ends: remind the customer of the charge and how to cancel
        const subscription = event.data.object as any;
        const customerId = subscription.customer ? String(subscription.customer) : null;
        const ws = customerId ? await Database.findWorkspaceByStripeCustomer(customerId) : null;
        if (ws) {
          const plan = BILLING_PLANS.find((p) => p.id === ws.planId) || BILLING_PLANS[0];
          await sendBillingEmail({
            kind: 'trial_ending',
            to: ws.billingEmail,
            workspaceName: ws.name,
            planName: ws.planName,
            amount: ws.billingInterval === 'annual' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice,
            date: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : ws.trialEndsAt,
          });
        }
        break;
      }

      // A disputed or fraud-flagged payment ends the subscription at once, whatever the plan or trial state
      case 'radar.early_fraud_warning.created':
      case 'charge.dispute.created': {
        const obj = event.data.object as any;
        const customerId = obj.customer ? String(obj.customer) : obj.charge?.customer ? String(obj.charge.customer) : null;
        const ws = customerId ? await Database.findWorkspaceByStripeCustomer(customerId) : null;
        logEvent({ level: 'warn', category: 'security', event: `billing.${event.type}`, meta: { workspaceId: ws?.id ?? null } });
        if (ws) {
          if (ws.stripeSubscriptionId) await cancelSubscriptionNow(ws.stripeSubscriptionId);
          await Database.updateWorkspaceBilling(ws.id, { subscriptionStatus: 'canceled', billingRisk: event.type.startsWith('radar') ? 'fraud_warning' : 'dispute' } as any);
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
            // the customer gets a receipt with the Stripe invoice link for every payment
            await sendBillingEmail({
              kind: 'receipt',
              to: ws.billingEmail || invoice.customer_email,
              workspaceName: ws.name,
              planName: ws.planName,
              amount: newInvoice.amount,
              invoiceUrl: invoice.hosted_invoice_url,
              invoicePdfUrl: invoice.invoice_pdf,
              invoiceNumber: invoice.number,
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

export const POST = logged(POSTHandler, { route: '/api/billing/webhook' });

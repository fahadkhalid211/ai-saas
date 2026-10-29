import { NextRequest, NextResponse } from 'next/server';
import { Database, type WorkspaceBillingData } from '@/lib/db';
import {
  mapSubscriptionStatus,
  parseWebhookEvent,
  planRecord,
  resolvePlan,
  testModeAllowed,
  verifyWebhookSignature,
  type LemonEvent,
} from '@/lib/billing/lemonsqueezy';
import { sendBillingEmail } from '@/lib/billing/emails';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';

/**
 * Lemon Squeezy webhooks. This is the only place a workspace gets a paid plan: a checkout link can be edited by whoever holds it,
 * but a request signed with our webhook secret cannot.
 *
 * Events handled: subscription_created / _updated / _resumed / _unpaused / _paused / _cancelled / _expired,
 * subscription_payment_success / _failed / _recovered, and refunds (logged for a person to look at).
 */

const SUBSCRIPTION_EVENTS = new Set([
  'subscription_created',
  'subscription_updated',
  'subscription_resumed',
  'subscription_unpaused',
  'subscription_paused',
  'subscription_cancelled',
  'subscription_expired',
  'subscription_payment_recovered',
]);

/**
 * The workspace a subscription event belongs to: the one that already holds this subscription, otherwise the workspace named in the
 * checkout link. The customer is only a last resort, because one customer (one e-mail address) can own several workspaces and a
 * new subscription must not be attached to whichever of them happened to pay first.
 */
async function findWorkspace(evt: LemonEvent): Promise<{ ws: WorkspaceBillingData; viaLink: boolean } | null> {
  const bySubscription = await Database.findWorkspaceByBillingSubscription(evt.resourceId);
  if (bySubscription) return { ws: bySubscription, viaLink: false };
  const linkWorkspace = typeof evt.customData.workspace_id === 'string' ? evt.customData.workspace_id : '';
  if (linkWorkspace && (await Database.workspaceExists(linkWorkspace))) {
    return { ws: await Database.getWorkspaceBilling(linkWorkspace), viaLink: true };
  }
  if (evt.name !== 'subscription_created') {
    const customerId = evt.attributes.customer_id !== undefined ? String(evt.attributes.customer_id) : '';
    const byCustomer = customerId ? await Database.findWorkspaceByBillingCustomer(customerId) : null;
    if (byCustomer) return { ws: byCustomer, viaLink: false };
  }
  return null;
}

/** Brings a workspace in line with what Lemon Squeezy says about its subscription. */
async function applySubscription(ws: WorkspaceBillingData, evt: LemonEvent, isNewLink: boolean): Promise<void> {
  const a = evt.attributes;
  const status = mapSubscriptionStatus(a.status, a.ends_at);
  const resolved = resolvePlan(a);
  const nowIso = new Date().toISOString();

  const updates: Partial<WorkspaceBillingData> = {
    billingCustomerId: a.customer_id !== undefined ? String(a.customer_id) : ws.billingCustomerId,
    billingSubscriptionId: evt.resourceId,
    subscriptionStatus: status,
    cancelAtPeriodEnd: Boolean(a.cancelled) && status !== 'canceled',
  };
  if (typeof a.renews_at === 'string') updates.currentPeriodEnd = a.renews_at;
  if (a.status === 'on_trial' && typeof a.trial_ends_at === 'string') {
    updates.trialStartedAt = ws.trialStartedAt || (typeof a.created_at === 'string' ? a.created_at : nowIso);
    updates.trialEndsAt = a.trial_ends_at;
  } else if (!ws.trialStartedAt && isNewLink) {
    // paid from day one: no trial, but the workspace has now used its chance to start one
    updates.trialStartedAt = typeof a.created_at === 'string' ? a.created_at : nowIso;
  }
  if (a.card_last_four) {
    updates.paymentMethod = { brand: String(a.card_brand || 'card'), last4: String(a.card_last_four), expMonth: 0, expYear: 0 };
  }
  if (resolved) {
    const plan = planRecord(resolved.planId);
    updates.planId = plan.id;
    updates.planName = plan.name;
    updates.billingInterval = resolved.interval;
    updates.monthlyChatLimit = plan.chatSessionsLimit;
    updates.overageRatePerChat = plan.overageRate;
    updates.landingPageLimit = plan.landingPageLimit;
  } else if (isNewLink) {
    logEvent({ level: 'error', category: 'billing', event: 'billing.plan_unresolved', meta: { workspaceId: ws.id, variantId: a.variant_id ?? null, variantName: a.variant_name ?? null } });
  }
  await Database.updateWorkspaceBilling(ws.id, updates);

  if (isNewLink && a.status === 'on_trial' && resolved) {
    const plan = planRecord(resolved.planId);
    await sendBillingEmail({
      kind: 'trial_started',
      to: ws.billingEmail || (typeof a.user_email === 'string' ? a.user_email : undefined),
      workspaceName: ws.name,
      planName: plan.name,
      amount: resolved.interval === 'annual' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice,
      interval: resolved.interval,
      date: a.trial_ends_at,
    });
  }
}

async function POSTHandler(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature') || '';

    if (!verifyWebhookSignature(rawBody, signature)) {
      logEvent({ level: 'warn', category: 'security', event: 'security.invalid_signature', meta: { channel: 'lemonsqueezy' } });
      return NextResponse.json({ error: 'Invalid webhook signature or missing secret' }, { status: 400 });
    }
    const evt = parseWebhookEvent(rawBody);
    if (!evt) {
      return NextResponse.json({ error: 'Not a Lemon Squeezy event' }, { status: 400 });
    }
    logEvent({ category: 'billing', event: 'billing.webhook_received', meta: { type: evt.name, resourceId: evt.resourceId } });

    // Test-mode purchases accept test cards: on a live server they must never start a subscription.
    if (evt.testMode && !testModeAllowed()) {
      logEvent({ level: 'warn', category: 'billing', event: 'billing.test_event_ignored', meta: { type: evt.name } });
      return NextResponse.json({ received: true, ignored: 'test_mode' });
    }

    // Webhook idempotency: the same delivery repeated (Lemon Squeezy retries) must not add a second invoice or send a second e-mail
    if (await Database.isWebhookProcessed(evt.dedupeKey)) {
      console.log(`[LemonSqueezy Webhook] Duplicate event ignored: ${evt.name} (${evt.resourceId})`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    console.log(`[LemonSqueezy Webhook] Processing event: ${evt.name} (${evt.resourceId})`);

    if (SUBSCRIPTION_EVENTS.has(evt.name)) {
      const found = await findWorkspace(evt);
      if (!found) {
        logEvent({ level: 'error', category: 'billing', event: 'billing.webhook_unmatched', meta: { type: evt.name, resourceId: evt.resourceId } });
      } else {
        const { ws, viaLink } = found;
        // A workspace that already has a live subscription is not taken over by a different one that names it in a checkout link.
        const takenByOther =
          viaLink &&
          ws.billingSubscriptionId &&
          ws.billingSubscriptionId !== evt.resourceId &&
          ['trialing', 'active', 'past_due'].includes(ws.subscriptionStatus || '');
        if (takenByOther) {
          logEvent({ level: 'error', category: 'security', event: 'billing.subscription_conflict', meta: { workspaceId: ws.id, resourceId: evt.resourceId } });
        } else if (evt.name === 'subscription_expired') {
          await applySubscription(ws, evt, false);
          await Database.updateWorkspaceBilling(ws.id, { subscriptionStatus: 'canceled', cancelAtPeriodEnd: false });
          logEvent({ category: 'billing', event: 'billing.subscription_ended', meta: { workspaceId: ws.id } });
          if (!ws.billingRisk) await sendBillingEmail({ kind: 'cancelled', to: ws.billingEmail, workspaceName: ws.name });
        } else {
          await applySubscription(ws, evt, viaLink);
          logEvent({ category: 'billing', event: 'billing.subscription_updated', meta: { workspaceId: ws.id, type: evt.name, status: String(evt.attributes.status || '') } });
        }
      }
    } else if (evt.name === 'subscription_payment_success') {
      const a = evt.attributes;
      const subscriptionId = a.subscription_id !== undefined ? String(a.subscription_id) : '';
      const ws = subscriptionId ? await Database.findWorkspaceByBillingSubscription(subscriptionId) : null;
      const amountCents = Number(a.total) || 0;
      if (ws && amountCents > 0 && (!a.status || a.status === 'paid')) {
        const invoiceId = `inv_${evt.resourceId}`;
        const current = ws.invoices || [];
        if (!current.some((i) => i.id === invoiceId)) {
          const plan = BILLING_PLANS.find((p) => p.id === ws.planId);
          await Database.updateWorkspaceBilling(ws.id, {
            invoices: [
              {
                id: invoiceId,
                date: (typeof a.created_at === 'string' ? a.created_at : new Date().toISOString()).split('T')[0],
                planName: `${plan?.name || ws.planName || 'Crescelo Subscription'} (${ws.billingInterval === 'annual' ? 'Annual' : 'Monthly'})`,
                amount: amountCents / 100,
                status: 'paid',
                pdfUrl: typeof a.urls?.invoice_url === 'string' ? a.urls.invoice_url : undefined,
              },
              ...current,
            ],
          });
          // Lemon Squeezy e-mails the customer its own receipt and invoice, so none is sent from here.
          console.log(`[LemonSqueezy Webhook] Logged invoice payment for workspace ${ws.id}: $${amountCents / 100}`);
        }
      }
    } else if (evt.name === 'subscription_payment_failed') {
      const a = evt.attributes;
      const subscriptionId = a.subscription_id !== undefined ? String(a.subscription_id) : '';
      const ws = subscriptionId ? await Database.findWorkspaceByBillingSubscription(subscriptionId) : null;
      if (ws) {
        logEvent({ level: 'warn', category: 'billing', event: 'billing.payment_failed', meta: { workspaceId: ws.id } });
        await sendBillingEmail({ kind: 'payment_failed', to: ws.billingEmail, workspaceName: ws.name, planName: ws.planName, amount: (Number(a.total) || 0) / 100 });
      }
    } else if (evt.name === 'order_refunded' || evt.name === 'subscription_payment_refunded') {
      // A refund is a person's decision to look at (partial or full, goodwill or fraud); the plan is left as it is.
      const customerId = evt.attributes.customer_id !== undefined ? String(evt.attributes.customer_id) : '';
      const ws = customerId ? await Database.findWorkspaceByBillingCustomer(customerId) : null;
      if (ws) {
        const nowIso = new Date().toISOString();
        await Database.updateWorkspaceBilling(ws.id, {
          hasRefunded: true,
          refundedAt: nowIso,
        });
      }
      logEvent({ level: 'warn', category: 'billing', event: 'billing.refund', meta: { type: evt.name, workspaceId: ws?.id ?? null } });
    }
    // anything else (orders, licence keys, ...) needs no action

    await Database.recordProcessedWebhook(evt.dedupeKey);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[LemonSqueezy Webhook] Execution error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}

export const POST = logged(POSTHandler, { route: '/api/billing/webhook' });

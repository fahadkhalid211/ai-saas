import crypto from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { POST as webhook } from '../../app/api/billing/webhook/route';
import { serviceBlocked, trialInfo } from './trial';

const SECRET = 'whsec_webhook_test_secret';
const tag = Math.random().toString(36).slice(2, 8);

beforeAll(() => {
  vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', SECRET);
  vi.stubEnv('LEMONSQUEEZY_VARIANT_GROWTH', '');
  vi.stubEnv('LEMONSQUEEZY_VARIANT_STARTER', '');
  vi.stubEnv('LEMONSQUEEZY_VARIANT_SCALE', '');
});
afterAll(() => vi.unstubAllEnvs());

let counter = 0;
const stamp = () => `2026-10-22T10:00:${String(counter++ % 60).padStart(2, '0')}.000000Z`;

function event(name: string, opts: { id: string; type?: string; attributes: Record<string, unknown>; customData?: Record<string, unknown>; testMode?: boolean }) {
  return {
    meta: { event_name: name, test_mode: Boolean(opts.testMode), custom_data: opts.customData || {} },
    data: { id: opts.id, type: opts.type || 'subscriptions', attributes: { updated_at: stamp(), created_at: '2026-10-22T09:00:00.000000Z', ...opts.attributes } },
  };
}

async function send(payload: unknown, signWith: string | null = SECRET) {
  const raw = JSON.stringify(payload);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (signWith !== null) headers['x-signature'] = crypto.createHmac('sha256', signWith).update(raw).digest('hex');
  const res = await webhook(new NextRequest('http://localhost/api/billing/webhook', { method: 'POST', headers, body: raw }));
  return { status: res.status, json: await res.json() };
}

async function newWorkspace(label: string) {
  const t = await Database.createTenantWorkspace({ businessName: `LS ${label} ${tag}`, ownerEmail: `${label}-${tag}@example.com`, password: 'a-good-password' });
  return t.workspace.id;
}

const subscription = (over: Record<string, unknown> = {}) => ({
  status: 'on_trial',
  customer_id: 9001,
  variant_id: 55,
  product_name: 'Crescelo',
  variant_name: 'Growth',
  user_email: 'buyer@example.com',
  trial_ends_at: '2026-11-05T09:00:00.000000Z',
  renews_at: '2026-11-05T09:00:00.000000Z',
  ends_at: null,
  cancelled: false,
  card_brand: 'visa',
  card_last_four: '4242',
  ...over,
});

describe('Lemon Squeezy webhook', () => {
  it('refuses a request that is not signed with the secret', async () => {
    const payload = event('subscription_created', { id: 'sub_x', attributes: subscription(), customData: { workspace_id: 'ws_nope' } });
    expect((await send(payload, null)).status).toBe(400);
    expect((await send(payload, 'someone-elses-secret')).status).toBe(400);
  });

  it('starts the trial on the workspace named in the checkout link, with the plan Lemon Squeezy reports', async () => {
    const ws = await newWorkspace('trial');
    const res = await send(event('subscription_created', { id: `sub_${tag}_1`, attributes: subscription(), customData: { workspace_id: ws } }));
    expect(res.status).toBe(200);

    const billing = await Database.getWorkspaceBilling(ws);
    expect(billing.billingSubscriptionId).toBe(`sub_${tag}_1`);
    expect(billing.billingCustomerId).toBe('9001');
    expect(billing.subscriptionStatus).toBe('trialing');
    expect(billing.planId).toBe('growth');
    expect(billing.billingInterval).toBe('monthly');
    expect(billing.trialEndsAt).toBe('2026-11-05T09:00:00.000000Z');
    expect(billing.paymentMethod).toMatchObject({ brand: 'visa', last4: '4242' });
    expect(trialInfo(billing).status).toBe('trialing');
    expect(serviceBlocked(billing)).toBe(false);
  });

  it('ignores a repeat of the same delivery', async () => {
    const ws = await newWorkspace('repeat');
    const payload = event('subscription_created', { id: `sub_${tag}_2`, attributes: subscription({ variant_name: 'Starter' }), customData: { workspace_id: ws } });
    expect((await send(payload)).json.duplicate).toBeUndefined();
    expect((await send(payload)).json.duplicate).toBe(true);
  });

  it('takes the plan from what was bought, never from the plan written in the checkout link', async () => {
    const ws = await newWorkspace('tamper');
    // the buyer edited the link to say "scale" but paid for the Starter variant
    await send(event('subscription_created', { id: `sub_${tag}_3`, attributes: subscription({ variant_name: 'Starter' }), customData: { workspace_id: ws, plan_id: 'scale' } }));
    expect((await Database.getWorkspaceBilling(ws)).planId).toBe('starter');
  });

  it('does not let a second subscription take over a workspace that already has a live one', async () => {
    const ws = await newWorkspace('conflict');
    await send(event('subscription_created', { id: `sub_${tag}_4`, attributes: subscription(), customData: { workspace_id: ws } }));
    await send(event('subscription_created', { id: `sub_${tag}_5`, customData: { workspace_id: ws }, attributes: subscription({ status: 'active', variant_name: 'Agency / Scale', customer_id: 9002 }) }));
    const billing = await Database.getWorkspaceBilling(ws);
    expect(billing.billingSubscriptionId).toBe(`sub_${tag}_4`);
    expect(billing.planId).toBe('growth');
  });

  it('follows the subscription: trial converts, cancel keeps access until the period ends, expiry stops service', async () => {
    const ws = await newWorkspace('life');
    const id = `sub_${tag}_6`;
    await send(event('subscription_created', { id, attributes: subscription(), customData: { workspace_id: ws } }));

    await send(event('subscription_updated', { id, attributes: subscription({ status: 'active', trial_ends_at: null, renews_at: '2026-12-05T09:00:00.000000Z' }) }));
    let billing = await Database.getWorkspaceBilling(ws);
    expect(billing.subscriptionStatus).toBe('active');
    expect(trialInfo(billing).status).toBe('subscribed');

    await send(event('subscription_cancelled', { id, attributes: subscription({ status: 'cancelled', cancelled: true, trial_ends_at: null, ends_at: '2999-01-01T00:00:00.000000Z' }) }));
    billing = await Database.getWorkspaceBilling(ws);
    expect(billing.cancelAtPeriodEnd).toBe(true);
    expect(serviceBlocked(billing)).toBe(false);

    await send(event('subscription_resumed', { id, attributes: subscription({ status: 'active', cancelled: false, trial_ends_at: null }) }));
    expect((await Database.getWorkspaceBilling(ws)).cancelAtPeriodEnd).toBe(false);

    await send(event('subscription_expired', { id, attributes: subscription({ status: 'expired', cancelled: true, trial_ends_at: null }) }));
    billing = await Database.getWorkspaceBilling(ws);
    expect(billing.subscriptionStatus).toBe('canceled');
    expect(serviceBlocked(billing)).toBe(true);
  });

  it('moves the workspace to the new plan when the subscription is switched', async () => {
    const ws = await newWorkspace('switch');
    const id = `sub_${tag}_7`;
    await send(event('subscription_created', { id, attributes: subscription({ status: 'active', trial_ends_at: null, variant_name: 'Starter' }), customData: { workspace_id: ws } }));
    expect((await Database.getWorkspaceBilling(ws)).planId).toBe('starter');
    await send(event('subscription_updated', { id, attributes: subscription({ status: 'active', trial_ends_at: null, variant_name: 'Agency / Scale' }) }));
    const billing = await Database.getWorkspaceBilling(ws);
    expect(billing.planId).toBe('scale');
    expect(billing.monthlyChatLimit).toBeGreaterThan(0);
  });

  it('records each paid invoice once, and keeps a past-due subscription served while payment is retried', async () => {
    const ws = await newWorkspace('invoice');
    const id = `sub_${tag}_8`;
    await send(event('subscription_created', { id, attributes: subscription({ status: 'active', trial_ends_at: null }), customData: { workspace_id: ws } }));

    const invoice = event('subscription_payment_success', {
      id: `inv_${tag}`,
      type: 'subscription-invoices',
      attributes: { subscription_id: Number(id.length), status: 'paid', total: 14900, urls: { invoice_url: 'https://app.lemonsqueezy.com/my-orders/x/subscription-invoice/1' } },
    });
    (invoice.data.attributes as Record<string, unknown>).subscription_id = id;
    await send(invoice);
    // a second, different delivery of the same invoice (Lemon Squeezy also sends it on its own schedule)
    const again = JSON.parse(JSON.stringify(invoice));
    again.data.attributes.updated_at = '2026-10-22T11:11:11.000000Z';
    await send(again);

    const billing = await Database.getWorkspaceBilling(ws);
    const mine = (billing.invoices || []).filter((i) => i.id === `inv_inv_${tag}`);
    expect(mine).toHaveLength(1);
    expect(mine[0].amount).toBe(149);
    expect(mine[0].pdfUrl).toContain('lemonsqueezy.com');

    await send(event('subscription_updated', { id, attributes: subscription({ status: 'past_due', trial_ends_at: null }) }));
    const late = await Database.getWorkspaceBilling(ws);
    expect(trialInfo(late).status).toBe('past_due');
    expect(serviceBlocked(late)).toBe(false);
  });

  it('ignores a test-mode purchase on a live server, so a test card cannot start a real subscription', async () => {
    const ws = await newWorkspace('testmode');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ALLOW_LEMONSQUEEZY_TEST_MODE', '');
    try {
      const res = await send(event('subscription_created', { id: `sub_${tag}_9`, testMode: true, attributes: subscription(), customData: { workspace_id: ws } }));
      expect(res.status).toBe(200);
      expect(res.json.ignored).toBe('test_mode');
    } finally {
      vi.stubEnv('NODE_ENV', 'test');
    }
    expect((await Database.getWorkspaceBilling(ws)).billingSubscriptionId).toBeUndefined();
  });

  it('answers 200 for a subscription it cannot match, so Lemon Squeezy does not keep retrying', async () => {
    const res = await send(event('subscription_created', { id: `sub_${tag}_10`, attributes: subscription(), customData: { workspace_id: 'ws_does_not_exist' } }));
    expect(res.status).toBe(200);
  });
});

describe('workspaces saved while payments ran through Stripe', () => {
  it('keep their subscription under the new field names', async () => {
    const ws = await newWorkspace('legacy');
    await Database.updateWorkspaceBilling(ws, { stripeSubscriptionId: 'sub_old', stripeCustomerId: 'cus_old', subscriptionStatus: 'active' } as any);
    const billing = await Database.getWorkspaceBilling(ws);
    expect(billing.billingSubscriptionId).toBe('sub_old');
    expect(billing.billingCustomerId).toBe('cus_old');
    expect((billing as any).stripeSubscriptionId).toBeUndefined();
    expect(serviceBlocked(billing)).toBe(false);
  });
});

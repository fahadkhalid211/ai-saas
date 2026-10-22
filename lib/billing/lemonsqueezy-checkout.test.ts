import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { generateSessionToken } from '../security/auth';
import { POST as checkout } from '../../app/api/billing/checkout/route';
import { POST as portal } from '../../app/api/billing/portal/route';
import { GET as billingGet } from '../../app/api/billing/route';

const tag = Math.random().toString(36).slice(2, 8);

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());

async function owner(label: string) {
  const t = await Database.createTenantWorkspace({ businessName: `Checkout ${label} ${tag}`, ownerEmail: `${label}-${tag}@example.com`, password: 'a-good-password', emailVerified: false });
  await Database.confirmEmail(t.owner.id); // checkout needs a confirmed address
  const cookie = `kortex_admin_session=${generateSessionToken('owner', t.owner.id, t.workspace.id)}`;
  return { ws: t.workspace.id, cookie };
}

function post(handler: (r: NextRequest) => Promise<Response>, url: string, cookie: string, body: unknown) {
  return handler(
    new NextRequest(`http://localhost${url}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie, 'x-forwarded-for': `10.7.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify(body),
    }),
  ).then(async (res) => ({ status: res.status, json: await res.json() }));
}

describe('checkout with Lemon Squeezy connected', () => {
  it('sends the owner to the plan link, carrying the workspace and the billing e-mail', async () => {
    vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', 'whsec_checkout_test');
    const { ws, cookie } = await owner('live');
    const res = await post(checkout, '/api/billing/checkout', cookie, { planId: 'growth', billingInterval: 'monthly' });
    expect(res.status).toBe(200);
    expect(res.json.isSandbox).toBe(false);
    expect(res.json.url).toContain('https://crescelo.lemonsqueezy.com/checkout/buy/697e29a1-8305-43e5-b24e-54fa12c8f9c4');
    expect(res.json.url).toContain(`checkout[custom][workspace_id]=${encodeURIComponent(ws)}`);
    expect(res.json.url).toContain('checkout[email]=live-');

    // the checkout alone grants nothing: only the signed webhook does
    const billing = await Database.getWorkspaceBilling(ws);
    expect(billing.billingSubscriptionId).toBeUndefined();
    vi.unstubAllEnvs();
    vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  });

  it('uses the yearly link for yearly billing and refuses a plan that does not exist', async () => {
    vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', 'whsec_checkout_test');
    const { cookie } = await owner('year');
    const yearly = await post(checkout, '/api/billing/checkout', cookie, { planId: 'scale', billingInterval: 'annual' });
    expect(yearly.json.url).toContain('/checkout/buy/92ffd59c-cbe3-4e8b-8265-0be9e9c7182f');
    const bad = await post(checkout, '/api/billing/checkout', cookie, { planId: 'platinum', billingInterval: 'monthly' });
    expect(bad.status).toBe(400);
    const badInterval = await post(checkout, '/api/billing/checkout', cookie, { planId: 'growth', billingInterval: 'weekly' });
    expect(badInterval.status).toBe(400);
    vi.unstubAllEnvs();
    vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  });

  it('opens a portal link only for a workspace that has a subscription, and never makes a second subscription', async () => {
    vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', 'whsec_checkout_test');
    vi.stubEnv('LEMONSQUEEZY_API_KEY', '');
    const { ws, cookie } = await owner('portal');
    expect((await post(portal, '/api/billing/portal', cookie, {})).status).toBe(400);

    await Database.updateWorkspaceBilling(ws, { billingSubscriptionId: 'sub_live_1', billingCustomerId: '42', subscriptionStatus: 'active' });
    const link = await post(portal, '/api/billing/portal', cookie, {});
    expect(link.status).toBe(200);
    expect(link.json.url).toContain('lemonsqueezy.com');

    // already subscribed: asking for another plan opens the portal instead of a second checkout
    const again = await post(checkout, '/api/billing/checkout', cookie, { planId: 'scale', billingInterval: 'monthly' });
    expect(again.status).toBe(200);
    expect(again.json.url).toContain('lemonsqueezy.com');
    expect(again.json.url).not.toContain('/checkout/buy/');
    vi.unstubAllEnvs();
    vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  });

  it('reports whether yearly billing is on sale, so the screens can hide the toggle when it is not', async () => {
    vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', 'whsec_checkout_test');
    const { cookie } = await owner('flag');
    const res = await billingGet(new Request('http://localhost/api/billing', { headers: { cookie } }));
    const json = await res.json();
    expect(json.payments.annualAvailable).toBe(true);
    expect(json.subscription.hasBillingCustomer).toBe(false);
    vi.unstubAllEnvs();
    vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  });
});

describe('checkout while payments are not connected (development)', () => {
  it('simulates the purchase, so the dashboard can be tried without a payment account', async () => {
    vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', '');
    const { ws, cookie } = await owner('sandbox');
    const res = await post(checkout, '/api/billing/checkout', cookie, { planId: 'starter', billingInterval: 'monthly' });
    expect(res.status).toBe(200);
    expect(res.json.isSandbox).toBe(true);
    const billing = await Database.getWorkspaceBilling(ws);
    expect(billing.planId).toBe('starter');
    expect(billing.billingSubscriptionId).toBe('sandbox_sub');
  });

  it('is closed on a live server with no webhook secret, so nobody gets a plan without paying', async () => {
    vi.stubEnv('LEMONSQUEEZY_WEBHOOK_SECRET', '');
    vi.stubEnv('ADMIN_API_KEY', 'k'.repeat(48)); // production refuses to run without one; set before the session is signed
    const { ws, cookie } = await owner('closed');
    vi.stubEnv('NODE_ENV', 'production');
    try {
      const res = await post(checkout, '/api/billing/checkout', cookie, { planId: 'starter', billingInterval: 'monthly' });
      expect(res.status).toBe(503);
    } finally {
      vi.stubEnv('NODE_ENV', 'test');
    }
    expect((await Database.getWorkspaceBilling(ws)).billingSubscriptionId).toBeUndefined();
  });
});

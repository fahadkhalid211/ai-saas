import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  annualBillingAvailable,
  buildCheckoutUrl,
  canChangePlanInApp,
  checkoutLink,
  isBillingConfigured,
  mapSubscriptionStatus,
  parseWebhookEvent,
  resolvePlan,
  testModeAllowed,
  verifyWebhookSignature,
} from './lemonsqueezy';

const saved = { ...process.env };
afterEach(() => {
  process.env = { ...saved };
});

describe('checkout links', () => {
  it('has the six links (monthly and yearly) built in, on Lemon Squeezy only', () => {
    expect(checkoutLink('starter', 'annual')).toBe('https://crescelo.lemonsqueezy.com/checkout/buy/ed54b154-b7d1-4fc1-8bbc-bbc45066bcaf');
    expect(checkoutLink('growth', 'annual')).toBe('https://crescelo.lemonsqueezy.com/checkout/buy/e8e85f6f-f0d9-4738-9064-c1613227ce59');
    expect(checkoutLink('scale', 'annual')).toBe('https://crescelo.lemonsqueezy.com/checkout/buy/92ffd59c-cbe3-4e8b-8265-0be9e9c7182f');
    expect(annualBillingAvailable()).toBe(true);
    expect(checkoutLink('starter', 'monthly')).toBe('https://crescelo.lemonsqueezy.com/checkout/buy/0f627ab5-31c8-45ce-82c0-61c29a979893');
    expect(checkoutLink('growth', 'monthly')).toBe('https://crescelo.lemonsqueezy.com/checkout/buy/697e29a1-8305-43e5-b24e-54fa12c8f9c4');
    expect(checkoutLink('scale', 'monthly')).toBe('https://crescelo.lemonsqueezy.com/checkout/buy/c8f89515-e76c-4fbb-8868-9fdc91adb183');
  });

  it('lets the environment replace a link, and stops offering yearly billing if a yearly link is invalid', () => {
    process.env.LEMONSQUEEZY_CHECKOUT_GROWTH_ANNUAL = 'https://crescelo.lemonsqueezy.com/checkout/buy/override';
    expect(checkoutLink('growth', 'annual')).toBe('https://crescelo.lemonsqueezy.com/checkout/buy/override');
    expect(annualBillingAvailable()).toBe(true);
    process.env.LEMONSQUEEZY_CHECKOUT_GROWTH_ANNUAL = 'https://evil.example/pay';
    expect(checkoutLink('growth', 'annual')).toBeNull();
    expect(annualBillingAvailable()).toBe(false);
  });

  it('never sends anyone to a link outside Lemon Squeezy, whatever the environment says', () => {
    process.env.LEMONSQUEEZY_CHECKOUT_GROWTH = 'https://evil.example/pay';
    expect(checkoutLink('growth', 'monthly')).toBeNull();
    process.env.LEMONSQUEEZY_CHECKOUT_GROWTH = 'https://lemonsqueezy.com.evil.example/pay';
    expect(checkoutLink('growth', 'monthly')).toBeNull();
    process.env.LEMONSQUEEZY_CHECKOUT_GROWTH = 'http://crescelo.lemonsqueezy.com/checkout/buy/x';
    expect(checkoutLink('growth', 'monthly')).toBeNull();
  });

  it('carries the workspace and a well-formed e-mail, encoded', () => {
    const url = buildCheckoutUrl({ planId: 'growth', interval: 'monthly', workspaceId: 'ws_a&b=c', customerEmail: ' Owner@Company.com ' })!;
    expect(url.startsWith('https://crescelo.lemonsqueezy.com/checkout/buy/697e29a1')).toBe(true);
    expect(url).toContain('checkout[email]=owner%40company.com');
    expect(url).toContain('checkout[custom][workspace_id]=ws_a%26b%3Dc');
    expect(buildCheckoutUrl({ planId: 'growth', interval: 'monthly', workspaceId: 'ws_1', customerEmail: 'a@b.co\r\nBcc: x@y.z' })).not.toContain('checkout[email]');
    expect(buildCheckoutUrl({ planId: 'growth', interval: 'annual', workspaceId: 'ws_1' })).toContain('/checkout/buy/e8e85f6f-f0d9-4738-9064-c1613227ce59?checkout[custom][workspace_id]=ws_1');
  });
});

describe('configuration', () => {
  it('payments are only live once the webhook secret is set, and test mode is refused in production', () => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    expect(isBillingConfigured()).toBe(false);
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'whsec_test';
    expect(isBillingConfigured()).toBe(true);

    (process.env as Record<string, string>).NODE_ENV = 'production';
    delete process.env.ALLOW_LEMONSQUEEZY_TEST_MODE;
    expect(testModeAllowed()).toBe(false);
    process.env.ALLOW_LEMONSQUEEZY_TEST_MODE = 'true';
    expect(testModeAllowed()).toBe(true);
  });

  it('switches a live subscription from inside the app only with an API key and the variant ids', () => {
    delete process.env.LEMONSQUEEZY_API_KEY;
    delete process.env.LEMONSQUEEZY_VARIANT_GROWTH;
    expect(canChangePlanInApp('growth', 'monthly')).toBe(false);
    process.env.LEMONSQUEEZY_API_KEY = 'key';
    expect(canChangePlanInApp('growth', 'monthly')).toBe(false);
    process.env.LEMONSQUEEZY_VARIANT_GROWTH = '123456';
    expect(canChangePlanInApp('growth', 'monthly')).toBe(true);
  });
});

describe('webhook signature', () => {
  const body = JSON.stringify({ meta: { event_name: 'subscription_created' }, data: { id: '1' } });
  const sign = (secret: string, text: string) => crypto.createHmac('sha256', secret).update(text).digest('hex');

  beforeEach(() => {
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'whsec_unit_test';
  });

  it('accepts the signature made with the secret, and nothing else', () => {
    expect(verifyWebhookSignature(body, sign('whsec_unit_test', body))).toBe(true);
    expect(verifyWebhookSignature(body, sign('another-secret', body))).toBe(false);
    expect(verifyWebhookSignature(body + ' ', sign('whsec_unit_test', body))).toBe(false);
    expect(verifyWebhookSignature(body, '')).toBe(false);
    expect(verifyWebhookSignature(body, 'not-hex')).toBe(false);
    expect(verifyWebhookSignature(body, sign('whsec_unit_test', body).slice(0, 20))).toBe(false);
  });

  it('accepts nothing at all while no secret is configured', () => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    expect(verifyWebhookSignature(body, sign('', body))).toBe(false);
    expect(verifyWebhookSignature(body, sign('whsec_unit_test', body))).toBe(false);
  });
});

describe('reading events', () => {
  it('reads the event, its custom data and a stable key for repeated deliveries', () => {
    const evt = parseWebhookEvent(
      JSON.stringify({
        meta: { event_name: 'subscription_created', test_mode: true, custom_data: { workspace_id: 'ws_1' } },
        data: { id: '77', type: 'subscriptions', attributes: { status: 'on_trial', updated_at: '2026-10-22T10:00:00.000000Z' } },
      }),
    )!;
    expect(evt.name).toBe('subscription_created');
    expect(evt.testMode).toBe(true);
    expect(evt.customData.workspace_id).toBe('ws_1');
    expect(evt.resourceId).toBe('77');
    expect(evt.dedupeKey).toBe('ls:subscription_created:77:2026-10-22T10:00:00.000000Z');
  });

  it('refuses anything that is not an event', () => {
    expect(parseWebhookEvent('not json')).toBeNull();
    expect(parseWebhookEvent('{}')).toBeNull();
    expect(parseWebhookEvent(JSON.stringify({ meta: { event_name: 'x' } }))).toBeNull();
  });

  it('translates statuses, keeping a cancelled subscription alive until the period it paid for ends', () => {
    const now = new Date('2026-10-22T00:00:00Z');
    expect(mapSubscriptionStatus('on_trial')).toBe('trialing');
    expect(mapSubscriptionStatus('active')).toBe('active');
    expect(mapSubscriptionStatus('past_due')).toBe('past_due');
    expect(mapSubscriptionStatus('unpaid')).toBe('unpaid');
    expect(mapSubscriptionStatus('paused')).toBe('paused');
    expect(mapSubscriptionStatus('expired')).toBe('canceled');
    expect(mapSubscriptionStatus('cancelled', '2026-11-01T00:00:00Z', now)).toBe('active');
    expect(mapSubscriptionStatus('cancelled', '2026-10-01T00:00:00Z', now)).toBe('canceled');
    expect(mapSubscriptionStatus('cancelled', null, now)).toBe('canceled');
  });
});

describe('which plan was bought', () => {
  it('reads it from the variant Lemon Squeezy reports, by id when configured', () => {
    process.env.LEMONSQUEEZY_VARIANT_STARTER = '111';
    process.env.LEMONSQUEEZY_VARIANT_GROWTH_ANNUAL = '222';
    expect(resolvePlan({ variant_id: 111, variant_name: 'Default' })).toEqual({ planId: 'starter', interval: 'monthly' });
    expect(resolvePlan({ variant_id: '222', variant_name: 'Default' })).toEqual({ planId: 'growth', interval: 'annual' });
  });

  it('falls back to the plan name, and gives up rather than guess', () => {
    expect(resolvePlan({ product_name: 'Crescelo Growth', variant_name: 'Default' })).toEqual({ planId: 'growth', interval: 'monthly' });
    expect(resolvePlan({ product_name: 'Agency / Scale', variant_name: 'Yearly' })).toEqual({ planId: 'scale', interval: 'annual' });
    expect(resolvePlan({ product_name: 'Crescelo', variant_name: 'Starter (annual)' })).toEqual({ planId: 'starter', interval: 'annual' });
    expect(resolvePlan({ product_name: 'Something else', variant_name: 'Default' })).toBeNull();
  });
});

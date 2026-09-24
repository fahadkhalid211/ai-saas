import { describe, it, expect, afterEach } from 'vitest';
import { buildBillingEmail, safeStripeLink, escapeHtml } from './emails';
import { stripeModeOk, cleanCustomerEmail } from './stripe';

describe('billing e-mails', () => {
  it('escape every outside value so nothing can inject HTML', () => {
    const evil = '<img src=x onerror=alert(1)>"\'';
    const { html, subject } = buildBillingEmail({ kind: 'receipt', to: 'a@b.co', workspaceName: evil, planName: evil, amount: 49, invoiceNumber: evil });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('only links to https pages hosted by Stripe', () => {
    expect(safeStripeLink('https://invoice.stripe.com/i/abc')).toBe('https://invoice.stripe.com/i/abc');
    expect(safeStripeLink('https://pay.stripe.com/receipts/x')).toBeTruthy();
    expect(safeStripeLink('http://invoice.stripe.com/i/abc')).toBeNull();
    expect(safeStripeLink('https://evil.example/stripe.com')).toBeNull();
    expect(safeStripeLink('https://stripe.com.evil.example/x')).toBeNull();
    expect(safeStripeLink('javascript:alert(1)')).toBeNull();
    const { html } = buildBillingEmail({ kind: 'receipt', amount: 1, invoiceUrl: 'https://evil.example/x' });
    expect(html).not.toContain('evil.example');
  });

  it('states the trial terms and the charge date in the trial e-mail', () => {
    const { text } = buildBillingEmail({ kind: 'trial_started', planName: 'Growth', amount: 149, interval: 'monthly', date: '2026-10-15T00:00:00Z' });
    expect(text).toMatch(/\$149\.00/);
    expect(text).toMatch(/October 1[45], 2026/);
    expect(text).toMatch(/cancel/i);
  });

  it('escapeHtml handles non-strings', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(5)).toBe('5');
  });
});

describe('payment safety checks', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  it('a test-mode Stripe key is refused in production, so test cards cannot start real subscriptions', () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    delete process.env.ALLOW_STRIPE_TEST_MODE;
    expect(stripeModeOk()).toBe(false);
    process.env.ALLOW_STRIPE_TEST_MODE = 'true';
    expect(stripeModeOk()).toBe(true);
    process.env.STRIPE_SECRET_KEY = 'sk_live_123';
    delete process.env.ALLOW_STRIPE_TEST_MODE;
    expect(stripeModeOk()).toBe(true);
  });

  it('only a well-formed e-mail is passed to Stripe', () => {
    expect(cleanCustomerEmail(' Owner@Company.com ')).toBe('owner@company.com');
    expect(cleanCustomerEmail('a@b.co\r\nBcc: x@y.z')).toBeUndefined();
    expect(cleanCustomerEmail('<script>@x.y')).toBeUndefined();
    expect(cleanCustomerEmail('')).toBeUndefined();
  });
});

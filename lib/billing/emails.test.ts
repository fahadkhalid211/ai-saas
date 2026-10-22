import { describe, it, expect, afterEach } from 'vitest';
import { buildBillingEmail, safeInvoiceLink, escapeHtml } from './emails';
import { testModeAllowed, cleanCustomerEmail } from './lemonsqueezy';

describe('billing e-mails', () => {
  it('escape every outside value so nothing can inject HTML', () => {
    const evil = '<img src=x onerror=alert(1)>"\'';
    const { html, subject } = buildBillingEmail({ kind: 'receipt', to: 'a@b.co', workspaceName: evil, planName: evil, amount: 49, invoiceNumber: evil });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('only links to https pages hosted by Lemon Squeezy', () => {
    expect(safeInvoiceLink('https://app.lemonsqueezy.com/my-orders/abc')).toBe('https://app.lemonsqueezy.com/my-orders/abc');
    expect(safeInvoiceLink('https://crescelo.lemonsqueezy.com/invoice/x')).toBeTruthy();
    expect(safeInvoiceLink('http://app.lemonsqueezy.com/x')).toBeNull();
    expect(safeInvoiceLink('https://evil.example/lemonsqueezy.com')).toBeNull();
    expect(safeInvoiceLink('https://lemonsqueezy.com.evil.example/x')).toBeNull();
    expect(safeInvoiceLink('javascript:alert(1)')).toBeNull();
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

  it('test-mode payments are refused in production, so test cards cannot start real subscriptions', () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    delete process.env.ALLOW_LEMONSQUEEZY_TEST_MODE;
    expect(testModeAllowed()).toBe(false);
    process.env.ALLOW_LEMONSQUEEZY_TEST_MODE = 'true';
    expect(testModeAllowed()).toBe(true);
    (process.env as Record<string, string>).NODE_ENV = 'development';
    delete process.env.ALLOW_LEMONSQUEEZY_TEST_MODE;
    expect(testModeAllowed()).toBe(true);
  });

  it('only a well-formed e-mail is put into a checkout link', () => {
    expect(cleanCustomerEmail(' Owner@Company.com ')).toBe('owner@company.com');
    expect(cleanCustomerEmail('a@b.co\r\nBcc: x@y.z')).toBeUndefined();
    expect(cleanCustomerEmail('<script>@x.y')).toBeUndefined();
    expect(cleanCustomerEmail('')).toBeUndefined();
  });
});

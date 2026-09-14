import { describe, it, expect } from 'vitest';
import {
  isStripeConfigured,
  createCheckoutSession,
  createCustomerPortalSession,
  constructWebhookEvent,
} from './stripe';
import { BILLING_PLANS } from './plans';

describe('Stripe & Google Pay Billing Module', () => {
  it('should detect whether Stripe credentials are configured', () => {
    const configured = isStripeConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('should create sandbox checkout session for Growth plan when Stripe keys are absent', async () => {
    const result = await createCheckoutSession({
      workspaceId: 'ws_test_123',
      workspaceName: 'Test Business',
      customerEmail: 'test@business.com',
      planId: 'growth',
      billingInterval: 'monthly',
      successUrl: 'http://localhost:3000/?success=true',
      cancelUrl: 'http://localhost:3000/?cancelled=true',
    });

    expect(result).toBeDefined();
    expect(result.isSandbox).toBe(true);
    expect(result.planTier?.id).toBe('growth');
    expect(result.planTier?.monthlyPrice).toBe(149);
    expect(result.message).toContain('Sandbox mode');
  });

  it('should compute discounted annual prices in checkout session', async () => {
    const result = await createCheckoutSession({
      workspaceId: 'ws_test_456',
      planId: 'scale',
      billingInterval: 'annual',
      successUrl: 'http://localhost:3000/?success=true',
      cancelUrl: 'http://localhost:3000/?cancelled=true',
    });

    expect(result.isSandbox).toBe(true);
    expect(result.planTier?.id).toBe('scale');
    expect(result.planTier?.annualMonthlyPrice).toBe(319);
  });

  it('should handle extra landing page add-on checkout in sandbox mode', async () => {
    const result = await createCheckoutSession({
      workspaceId: 'ws_test_addon',
      addonType: 'extra_landing_page',
      successUrl: 'http://localhost:3000/?success=true',
      cancelUrl: 'http://localhost:3000/?cancelled=true',
    });

    expect(result.isSandbox).toBe(true);
    expect(result.message).toContain('Extra Landing Page');
  });

  it('should safely return null for customer portal session when Stripe is unconfigured', async () => {
    const portalUrl = await createCustomerPortalSession('cus_fake_123', 'http://localhost:3000/');
    expect(portalUrl).toBeNull();
  });

  it('should safely reject invalid webhook signatures', () => {
    const event = constructWebhookEvent('{}', 'invalid_signature_test');
    expect(event).toBeNull();
  });
});

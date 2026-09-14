import Stripe from 'stripe';
import { BILLING_PLANS, EXTRA_LANDING_PAGE_ADDON_PRICE, PlanTier } from './plans';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      appInfo: {
        name: 'Kortex AI SaaS',
        version: '0.1.0',
      },
    });
  }
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim());
}

export interface CreateCheckoutParams {
  workspaceId: string;
  workspaceName?: string;
  customerEmail?: string;
  planId?: 'starter' | 'growth' | 'scale';
  billingInterval?: 'monthly' | 'annual';
  addonType?: 'extra_landing_page';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  isSandbox: boolean;
  url?: string;
  sessionId?: string;
  message?: string;
  planTier?: PlanTier;
}

/**
 * Creates a Stripe Checkout session with Google Pay, Apple Pay, and Credit Cards enabled.
 * If STRIPE_SECRET_KEY is absent, returns a sandbox payload for instant demo upgrades.
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
  const stripe = getStripeClient();

  // 1. Add-on Purchase (One-Time Payment: Extra Landing Page)
  if (params.addonType === 'extra_landing_page') {
    if (!stripe) {
      return {
        isSandbox: true,
        message: 'Stripe is not configured. Sandbox checkout active for Extra Landing Page ($100).',
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Additional Hosted Landing Page Slot',
              description: 'Permanent lifetime extra landing page allocation for your Kortex AI workspace.',
            },
            unit_amount: EXTRA_LANDING_PAGE_ADDON_PRICE * 100, // in cents ($100.00)
          },
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId: params.workspaceId,
        addonType: 'extra_landing_page',
      },
      customer_email: params.customerEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return {
      isSandbox: false,
      url: session.url || undefined,
      sessionId: session.id,
    };
  }

  // 2. Subscription Plan Purchase
  const targetPlanId = params.planId || 'growth';
  const plan = BILLING_PLANS.find((p) => p.id === targetPlanId) || BILLING_PLANS[1];
  const interval = params.billingInterval === 'annual' ? 'annual' : 'monthly';
  const priceDollars = interval === 'annual' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;

  if (!stripe) {
    return {
      isSandbox: true,
      message: `Stripe is not configured. Operating in Sandbox mode for ${plan.name} (${interval}).`,
      planTier: plan,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Kortex AI ${plan.name} Plan`,
            description: `${plan.chatSessionsLimit} chat sessions/mo, ${plan.botLimit} bots, ${plan.landingPageLimit} landing pages (${plan.tagline})`,
          },
          unit_amount: priceDollars * 100,
          recurring: {
            interval: interval === 'annual' ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      workspaceId: params.workspaceId,
      planId: plan.id,
      billingInterval: interval,
    },
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return {
    isSandbox: false,
    url: session.url || undefined,
    sessionId: session.id,
    planTier: plan,
  };
}

/**
 * Generates a Stripe Customer Portal session URL for managing subscriptions and payment methods.
 */
export async function createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return portalSession.url;
}

/**
 * Validates Stripe webhook event signatures.
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event | null {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !webhookSecret) return null;

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('[Stripe] Webhook signature verification failed:', err.message);
    return null;
  }
}

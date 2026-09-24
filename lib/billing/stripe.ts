import Stripe from 'stripe';
import { BILLING_PLANS, EXTRA_LANDING_PAGE_ADDON_PRICE, PlanTier } from './plans';
import { TRIAL_DAYS, type SubscriptionStatus } from './trial';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      appInfo: {
        name: 'Crescelo SaaS',
        version: '0.1.0',
      },
    });
  }
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim());
}

/**
 * A simulated checkout (no Stripe) is for local development only. In production a missing Stripe key must never grant paid
 * or trial access for free, so callers refuse instead.
 */
export function sandboxAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * A live website must charge real cards. If a TEST key (sk_test_) is used in production, Stripe test cards such as
 * 4242 4242 4242 4242 would start subscriptions for free, so checkout refuses unless ALLOW_STRIPE_TEST_MODE=true is set on purpose.
 */
export function stripeModeOk(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim() || '';
  if (!key) return true; // handled separately (sandbox in development, refusal in production)
  if (process.env.NODE_ENV === 'production' && key.startsWith('sk_test_') && process.env.ALLOW_STRIPE_TEST_MODE !== 'true') return false;
  return true;
}

const EMAIL_OK = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
/** Only a well-formed address is ever handed to Stripe as the customer e-mail. */
export function cleanCustomerEmail(email?: string): string | undefined {
  const v = (email || '').trim().toLowerCase();
  return v.length <= 254 && EMAIL_OK.test(v) ? v : undefined;
}

/** Card checks applied to every Checkout: 3-D Secure whenever the bank supports it, and the billing address for AVS checks. */
const CARD_PROTECTION = {
  billing_address_collection: 'required' as const,
  payment_method_options: { card: { request_three_d_secure: 'any' as const } },
};

export interface CreateCheckoutParams {
  /** Start the subscription with a 14-day trial (the card is collected now and charged automatically when the trial ends). */
  withTrial?: boolean;
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
              description: 'Permanent lifetime extra landing page allocation for your Crescelo workspace.',
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
      ...CARD_PROTECTION,
      invoice_creation: { enabled: true }, // a real invoice exists for every one-time purchase
      payment_intent_data: { receipt_email: cleanCustomerEmail(params.customerEmail) },
      customer_email: cleanCustomerEmail(params.customerEmail),
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
  const plan = BILLING_PLANS.find((p) => p.id === targetPlanId);
  if (!plan) {
    throw new Error(
      `Invalid planId '${targetPlanId}'. Must be one of: ${BILLING_PLANS.map((p) => p.id).join(', ')}`
    );
  }
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
            name: `Crescelo ${plan.name} Plan`,
            description: `${plan.chatSessionsLimit} chat sessions/mo, ${plan.botLimit} bots (${plan.tagline})`,
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
      trial: params.withTrial ? 'true' : 'false',
    },
    subscription_data: {
      metadata: { workspaceId: params.workspaceId, planId: plan.id, billingInterval: interval },
      ...(params.withTrial
        ? {
            trial_period_days: TRIAL_DAYS,
            // no card, no trial: if it is somehow missing at the end, cancel instead of continuing for free
            trial_settings: { end_behavior: { missing_payment_method: 'cancel' as const } },
          }
        : {}),
    },
    payment_method_collection: 'always',
    ...CARD_PROTECTION,
    custom_text: {
      submit: {
        message: params.withTrial
          ? `Your ${TRIAL_DAYS}-day free trial starts today. You will not be charged until the trial ends; then $${priceDollars} is charged automatically every ${interval === 'annual' ? 'year' : 'month'} until you cancel. Cancel any time in the billing portal, and cancelling before the trial ends means you are never charged.`
          : `$${priceDollars} is charged now and every ${interval === 'annual' ? 'year' : 'month'} until you cancel. Cancel any time in the billing portal.`,
      },
    },
    customer_email: cleanCustomerEmail(params.customerEmail),
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

export interface CardSummary {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  /** Stripe's stable identifier for the physical card, used to stop one card starting many free trials. */
  fingerprint: string | null;
}

export interface SubscriptionSummary {
  card: CardSummary | null;
  status: SubscriptionStatus;
  customerId: string | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const iso = (unix?: number | null) => (unix ? new Date(unix * 1000).toISOString() : null);

/** Reads a subscription from Stripe so our records follow Stripe's (trial end, status, pending cancellation). */
export async function retrieveSubscriptionSummary(subscriptionId: string): Promise<SubscriptionSummary | null> {
  const stripe = getStripeClient();
  if (!stripe || !subscriptionId) return null;
  try {
    const sub: any = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['default_payment_method'] });
    const pm = sub.default_payment_method && typeof sub.default_payment_method === 'object' ? sub.default_payment_method : null;
    return {
      card: pm?.card ? { brand: String(pm.card.brand || 'card'), last4: String(pm.card.last4 || ''), expMonth: Number(pm.card.exp_month) || 0, expYear: Number(pm.card.exp_year) || 0, fingerprint: pm.card.fingerprint ? String(pm.card.fingerprint) : null } : null,
      status: sub.status as SubscriptionStatus,
      customerId: sub.customer ? String(typeof sub.customer === 'string' ? sub.customer : sub.customer.id) : null,
      trialEnd: iso(sub.trial_end),
      currentPeriodEnd: iso(sub.current_period_end),
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    };
  } catch (err: any) {
    console.error('[Stripe] Could not read subscription:', err?.message);
    return null;
  }
}

/** Moves an existing subscription to another plan or billing period (a second Checkout would create a second subscription). */
export async function changeSubscriptionPlan(subscriptionId: string, planId: 'starter' | 'growth' | 'scale', interval: 'monthly' | 'annual'): Promise<boolean> {
  const stripe = getStripeClient();
  const plan = BILLING_PLANS.find((p) => p.id === planId);
  if (!stripe || !plan) return false;
  const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
  const item = sub.items?.data?.[0];
  if (!item) return false;
  const price = interval === 'annual' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;
  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: item.id, price_data: { currency: 'usd', product: String(item.price.product), unit_amount: price * 100, recurring: { interval: interval === 'annual' ? 'year' : 'month' } } }],
    proration_behavior: sub.status === 'trialing' ? 'none' : 'create_prorations',
    metadata: { planId: plan.id, billingInterval: interval },
  } as any);
  return true;
}

/** Ends a subscription immediately (used when a card turns out to be disputed, flagged or reused for a second free trial). */
export async function cancelSubscriptionNow(subscriptionId: string): Promise<boolean> {
  const stripe = getStripeClient();
  if (!stripe || !subscriptionId) return false;
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (err: any) {
    console.error('[Stripe] Could not cancel subscription:', err?.message);
    return false;
  }
}

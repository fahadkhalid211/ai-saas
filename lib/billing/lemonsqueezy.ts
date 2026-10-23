import crypto from 'node:crypto';
import { BILLING_PLANS } from './plans';
import type { SubscriptionStatus } from './trial';

/**
 * Payments run through Lemon Squeezy, which is the merchant of record: it takes the card, charges the tax, issues the invoice and
 * hosts the customer portal. This module holds everything the app needs from it:
 *
 *  - the checkout link for each plan (a plain hosted link; the workspace travels with it as custom data and comes back on every webhook),
 *  - verifying and reading webhooks,
 *  - the few API calls that need LEMONSQUEEZY_API_KEY (a fresh customer-portal link, changing the plan of a live subscription).
 *
 * The webhook is the only thing that gives a workspace a paid plan. A link built here carries no authority: what was bought is read
 * from the variant Lemon Squeezy reports, never from anything the buyer could have edited in the link.
 */

export type PaidPlanId = 'starter' | 'growth' | 'scale';
export type BillingInterval = 'monthly' | 'annual';

const PLAN_IDS: PaidPlanId[] = ['starter', 'growth', 'scale'];

/** The hosted checkout links for each plan. Public links (they carry no secret), overridable from the environment. */
const DEFAULT_LINKS: Record<BillingInterval, Record<PaidPlanId, string>> = {
  monthly: {
    starter: 'https://crescelo.lemonsqueezy.com/checkout/buy/0f627ab5-31c8-45ce-82c0-61c29a979893',
    growth: 'https://crescelo.lemonsqueezy.com/checkout/buy/697e29a1-8305-43e5-b24e-54fa12c8f9c4',
    scale: 'https://crescelo.lemonsqueezy.com/checkout/buy/c8f89515-e76c-4fbb-8868-9fdc91adb183',
  },
  annual: {
    starter: 'https://crescelo.lemonsqueezy.com/checkout/buy/ed54b154-b7d1-4fc1-8bbc-bbc45066bcaf',
    growth: 'https://crescelo.lemonsqueezy.com/checkout/buy/e8e85f6f-f0d9-4738-9064-c1613227ce59',
    scale: 'https://crescelo.lemonsqueezy.com/checkout/buy/92ffd59c-cbe3-4e8b-8265-0be9e9c7182f',
  },
};

const env = (name: string): string => (process.env[name] || '').trim();
const planKey = (planId: PaidPlanId) => planId.toUpperCase();

/** Only a link on Lemon Squeezy's own domains is ever used as a checkout destination, whatever the environment says. */
function isLemonSqueezyUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && /(^|\.)lemonsqueezy\.com$/i.test(u.hostname);
  } catch {
    return false;
  }
}

/** The hosted checkout link for a plan and billing period, or null when that combination is not on sale (no annual link set yet). */
export function checkoutLink(planId: PaidPlanId, interval: BillingInterval): string | null {
  if (!PLAN_IDS.includes(planId)) return null;
  const configured = env(interval === 'annual' ? `LEMONSQUEEZY_CHECKOUT_${planKey(planId)}_ANNUAL` : `LEMONSQUEEZY_CHECKOUT_${planKey(planId)}`);
  const link = configured || DEFAULT_LINKS[interval][planId];
  return link && isLemonSqueezyUrl(link) ? link : null;
}

/** Whether every plan can be bought yearly (the annual toggle is only offered then). */
export function annualBillingAvailable(): boolean {
  return PLAN_IDS.every((p) => checkoutLink(p, 'annual') !== null);
}

/** True when the server can take a real payment AND learn about it: the webhook secret is what makes a paid plan reach the workspace. */
export function isBillingConfigured(): boolean {
  return Boolean(env('LEMONSQUEEZY_WEBHOOK_SECRET'));
}

/**
 * A simulated checkout (no payment provider) is for local development only. In production a missing webhook secret must never grant
 * paid or trial access for free, so callers refuse instead.
 */
export function sandboxAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * A live website must be paid with real money. Lemon Squeezy's test mode accepts test cards, so a test-mode event reaching a
 * production server would start subscriptions for free; it is ignored unless ALLOW_LEMONSQUEEZY_TEST_MODE=true is set on purpose.
 */
export function testModeAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' || env('ALLOW_LEMONSQUEEZY_TEST_MODE') === 'true';
}

const EMAIL_OK = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
/** Only a well-formed address is ever put into a checkout link as the customer e-mail. */
export function cleanCustomerEmail(email?: string): string | undefined {
  const v = (email || '').trim().toLowerCase();
  return v.length <= 254 && EMAIL_OK.test(v) ? v : undefined;
}

export interface CheckoutUrlParams {
  planId: PaidPlanId;
  interval: BillingInterval;
  workspaceId: string;
  customerEmail?: string;
}

/**
 * The link a workspace owner is sent to. It carries the workspace id (returned on every webhook as custom data) and the e-mail to
 * prefill. Brackets are written as they are in Lemon Squeezy's own documentation; the values are percent-encoded.
 */
export function buildCheckoutUrl(params: CheckoutUrlParams): string | null {
  const base = checkoutLink(params.planId, params.interval);
  if (!base) return null;
  const parts: string[] = [];
  const email = cleanCustomerEmail(params.customerEmail);
  if (email) parts.push(`checkout[email]=${encodeURIComponent(email)}`);
  parts.push(`checkout[custom][workspace_id]=${encodeURIComponent(params.workspaceId)}`);
  const joiner = base.includes('?') ? '&' : '?';
  return `${base}${joiner}${parts.join('&')}`;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------------------------------------------------------------

/** Lemon Squeezy signs the raw body with HMAC-SHA256 using the signing secret and sends the hex digest in `X-Signature`. */
export function verifyWebhookSignature(rawBody: string, signature: string | null | undefined): boolean {
  const secret = env('LEMONSQUEEZY_WEBHOOK_SECRET');
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest();
  let given: Buffer;
  try {
    given = Buffer.from(signature.trim(), 'hex');
  } catch {
    return false;
  }
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export interface LemonEvent {
  name: string;
  testMode: boolean;
  customData: Record<string, unknown>;
  /** The id of the object the event is about (a subscription, or an invoice for payment events). */
  resourceId: string;
  resourceType: string;
  attributes: Record<string, any>;
  /** Stable key for "have we handled this already": the object, the event and the moment it last changed. */
  dedupeKey: string;
}

/** Reads a webhook body. Returns null when it is not a Lemon Squeezy event. */
export function parseWebhookEvent(rawBody: string): LemonEvent | null {
  let json: any;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return null;
  }
  const name = json?.meta?.event_name;
  const data = json?.data;
  if (typeof name !== 'string' || !data || data.id === undefined || data.id === null) return null;
  const attributes = data.attributes && typeof data.attributes === 'object' ? data.attributes : {};
  const customData = json.meta.custom_data && typeof json.meta.custom_data === 'object' ? json.meta.custom_data : {};
  const stamp = attributes.updated_at || attributes.created_at || '';
  return {
    name,
    testMode: Boolean(json.meta.test_mode),
    customData,
    resourceId: String(data.id),
    resourceType: String(data.type || ''),
    attributes,
    dedupeKey: `ls:${name}:${data.id}:${stamp}`,
  };
}

/** Lemon Squeezy's subscription status in the vocabulary the rest of the app uses (lib/billing/trial.ts). */
export function mapSubscriptionStatus(status: unknown, endsAt?: unknown, now: Date = new Date()): SubscriptionStatus {
  switch (String(status)) {
    case 'on_trial':
      return 'trialing';
    case 'active':
      return 'active';
    case 'paused':
      return 'paused';
    case 'past_due':
      return 'past_due';
    case 'unpaid':
      return 'unpaid';
    case 'expired':
      return 'canceled';
    case 'cancelled': {
      // cancelled by the customer: service continues until the end of the period that was already paid for
      const end = endsAt ? new Date(String(endsAt)).getTime() : NaN;
      return Number.isFinite(end) && end > now.getTime() ? 'active' : 'canceled';
    }
    default:
      return 'active';
  }
}

export interface ResolvedPlan {
  planId: PaidPlanId;
  interval: BillingInterval;
}

/**
 * Which plan a subscription is for. Lemon Squeezy reports the variant that was bought, so this cannot be influenced by the buyer.
 * Variant ids from the environment (LEMONSQUEEZY_VARIANT_STARTER, ..._GROWTH, ..._SCALE and the same with _ANNUAL) win; otherwise the
 * variant, product or plan name is read ("Starter", "Growth", "Agency / Scale", with "annual" or "yearly" for the yearly one).
 */
export function resolvePlan(attrs: { variant_id?: unknown; variant_name?: unknown; product_name?: unknown }): ResolvedPlan | null {
  const variantId = attrs.variant_id === undefined || attrs.variant_id === null ? '' : String(attrs.variant_id);
  if (variantId) {
    for (const planId of PLAN_IDS) {
      if (env(`LEMONSQUEEZY_VARIANT_${planKey(planId)}`) === variantId) return { planId, interval: 'monthly' };
      if (env(`LEMONSQUEEZY_VARIANT_${planKey(planId)}_ANNUAL`) === variantId) return { planId, interval: 'annual' };
    }
  }
  const text = `${attrs.product_name || ''} ${attrs.variant_name || ''}`.toLowerCase();
  const planId: PaidPlanId | null = /scale|agency/.test(text) ? 'scale' : /growth/.test(text) ? 'growth' : /starter/.test(text) ? 'starter' : null;
  if (!planId) return null;
  return { planId, interval: /annual|yearly|\byear\b/.test(text) ? 'annual' : 'monthly' };
}

/** The plan record (chat limit, prices, ...) for a plan id. */
export function planRecord(planId: PaidPlanId) {
  return BILLING_PLANS.find((p) => p.id === planId) || BILLING_PLANS[0];
}

// ---------------------------------------------------------------------------------------------------------------------------------
// API (needs LEMONSQUEEZY_API_KEY)
// ---------------------------------------------------------------------------------------------------------------------------------

const API_BASE = 'https://api.lemonsqueezy.com/v1';

export function isApiConfigured(): boolean {
  return Boolean(env('LEMONSQUEEZY_API_KEY'));
}

async function api(path: string, init: { method?: string; body?: unknown } = {}): Promise<any> {
  const key = env('LEMONSQUEEZY_API_KEY');
  if (!key) throw new Error('Lemon Squeezy API key is not configured.');
  const res = await fetch(`${API_BASE}${path}`, {
    method: init.method || 'GET',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${key}`,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // not JSON
  }
  if (!res.ok) {
    const detail = json?.errors?.[0]?.detail || json?.errors?.[0]?.title || `HTTP ${res.status}`;
    throw new Error(`Lemon Squeezy: ${detail}`);
  }
  return json;
}

/** Where customers see their orders when no subscription-specific portal link can be made. */
export const GENERIC_CUSTOMER_PORTAL = 'https://app.lemonsqueezy.com/my-orders';

/**
 * A fresh link to the customer portal of one subscription (change card, cancel, switch plan, download invoices). Lemon Squeezy's
 * links are signed and expire after a day, so one is requested each time. Falls back to the general "my orders" page.
 */
export async function getCustomerPortalUrl(subscriptionId: string): Promise<string> {
  if (isApiConfigured() && subscriptionId) {
    try {
      const json = await api(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
      const url = json?.data?.attributes?.urls?.customer_portal;
      if (typeof url === 'string' && isLemonSqueezyUrl(url)) return url;
    } catch (err: any) {
      console.error('[LemonSqueezy] Could not get the customer portal link:', err?.message);
    }
  }
  return GENERIC_CUSTOMER_PORTAL;
}

/** The numeric variant id for a plan and period, from the environment (needed to switch a live subscription over the API). */
export function variantIdFor(planId: PaidPlanId, interval: BillingInterval): number | null {
  const v = env(interval === 'annual' ? `LEMONSQUEEZY_VARIANT_${planKey(planId)}_ANNUAL` : `LEMONSQUEEZY_VARIANT_${planKey(planId)}`);
  const n = Number(v);
  return v && Number.isInteger(n) && n > 0 ? n : null;
}

/** Whether a live subscription can be moved to another plan from inside the app (otherwise the customer portal does it). */
export function canChangePlanInApp(planId: PaidPlanId, interval: BillingInterval): boolean {
  return isApiConfigured() && variantIdFor(planId, interval) !== null;
}

/**
 * Cancels a subscription so nothing more is charged (used when an account is deleted). It stays usable to the end of the period
 * already paid for, which does not matter once the account is gone. A subscription that is already cancelled or expired is fine.
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const current = await api(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
  const status = current?.data?.attributes?.status;
  if (status === 'cancelled' || status === 'expired') return;
  await api(`/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: 'DELETE' });
}

/** Moves a live subscription to another plan or billing period. Lemon Squeezy prorates it. */
export async function changeSubscriptionPlan(subscriptionId: string, planId: PaidPlanId, interval: BillingInterval): Promise<void> {
  const variantId = variantIdFor(planId, interval);
  if (!variantId) throw new Error('This plan cannot be switched from here. Use "Manage subscription".');
  await api(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: 'PATCH',
    body: { data: { type: 'subscriptions', id: String(subscriptionId), attributes: { variant_id: variantId } } },
  });
}

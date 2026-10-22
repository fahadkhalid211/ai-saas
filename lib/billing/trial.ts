/**
 * The 14-day free trial. Starting it needs a card: a new workspace must complete checkout, which collects the card and
 * starts a subscription with a 14-day trial (set on the plan in Lemon Squeezy). Lemon Squeezy charges the card automatically when
 * the trial ends, and the owner can cancel any time in the customer portal (cancelling during the trial means nothing is ever charged).
 *
 * Until Checkout is completed, and after a subscription ends, the assistants stop answering visitors; the dashboard stays
 * open on a plan-choice screen so the owner can start (or restart) a subscription or export their data.
 *
 * Workspaces created before card-required trials existed carry none of these fields and are never locked. Workspaces from the
 * short-lived "no card" trial keep their original dates.
 */
export const TRIAL_DAYS = 14;
export const TRIAL_PLAN_ID = 'growth' as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Subscription statuses we act on (Lemon Squeezy's, translated in lib/billing/lemonsqueezy.ts). */
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'paused';

export type TrialStatus =
  | 'subscribed' // paying
  | 'trialing' // in the 14 days, card on file
  | 'past_due' // a payment failed; the provider is retrying, service continues meanwhile
  | 'needs_card' // new workspace, has not started the trial yet
  | 'expired' // subscription ended or trial over without payment
  | 'legacy'; // older workspace, never locked

export interface TrialInfo {
  status: TrialStatus;
  /** Whole days left in the trial, rounded up; 0 when not trialing. */
  daysLeft: number;
  /** When the trial ends, and so when the first charge happens (trialing only). */
  endsAt: string | null;
  /** The subscription is set to end at the period end (the owner cancelled). */
  cancelling: boolean;
}

export interface TrialFields {
  requiresSubscription?: boolean;
  trialStartedAt?: string;
  trialEndsAt?: string;
  billingSubscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
}

/** Dates for a trial that starts now (used for simulated checkouts and as a fallback if the provider does not say). */
export function newTrialDates(now: Date = new Date()): { trialStartedAt: string; trialEndsAt: string } {
  return { trialStartedAt: now.toISOString(), trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * DAY_MS).toISOString() };
}

const none = (status: TrialStatus, cancelling = false): TrialInfo => ({ status, daysLeft: 0, endsAt: null, cancelling });

export function trialInfo(ws: TrialFields | null | undefined, now: Date = new Date()): TrialInfo {
  if (!ws) return none('legacy');
  const cancelling = Boolean(ws.cancelAtPeriodEnd);

  if (ws.billingSubscriptionId) {
    switch (ws.subscriptionStatus) {
      case 'trialing': {
        const end = ws.trialEndsAt ? new Date(ws.trialEndsAt).getTime() : NaN;
        if (Number.isFinite(end)) {
          if (now.getTime() >= end) return none('subscribed', cancelling); // the provider converts it to active at the end
          return { status: 'trialing', daysLeft: Math.max(1, Math.ceil((end - now.getTime()) / DAY_MS)), endsAt: ws.trialEndsAt!, cancelling };
        }
        return { status: 'trialing', daysLeft: TRIAL_DAYS, endsAt: null, cancelling };
      }
      case 'past_due':
        return none('past_due', cancelling);
      case 'unpaid':
      case 'canceled':
      case 'incomplete_expired':
      case 'paused':
        return none('expired');
      case 'incomplete':
        return none('needs_card');
      default:
        return none('subscribed', cancelling);
    }
  }

  // No subscription
  if (ws.requiresSubscription) return none(ws.subscriptionStatus === 'canceled' ? 'expired' : 'needs_card');

  // Workspaces from the earlier "no card" trial: their own dates apply
  if (ws.trialEndsAt) {
    const end = new Date(ws.trialEndsAt).getTime();
    if (Number.isFinite(end)) {
      if (now.getTime() >= end) return none('expired');
      return { status: 'trialing', daysLeft: Math.max(1, Math.ceil((end - now.getTime()) / DAY_MS)), endsAt: ws.trialEndsAt, cancelling: false };
    }
  }
  return none('legacy');
}

/** True when visitors should not be served by this workspace's assistants. */
export function serviceBlocked(ws: TrialFields | null | undefined, now: Date = new Date()): boolean {
  const s = trialInfo(ws, now).status;
  return s === 'expired' || s === 'needs_card';
}

/** A workspace that has used its trial does not get a second one when it subscribes again. */
export function trialAvailable(ws: TrialFields | null | undefined): boolean {
  return !ws?.trialStartedAt && !ws?.billingSubscriptionId && ws?.subscriptionStatus !== 'canceled';
}

export const SERVICE_PAUSED_MESSAGE = 'This assistant is not available right now. Please contact the business directly.';

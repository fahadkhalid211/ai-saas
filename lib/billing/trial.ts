/**
 * The 14-day free trial. A new workspace gets every Growth feature for 14 days, with no card. When the 14 days end without a
 * paid subscription the assistants stop answering visitors (the dashboard stays open so the owner can subscribe and export
 * their data). Workspaces created before the trial existed carry no trial dates and are never locked.
 */
export const TRIAL_DAYS = 14;
export const TRIAL_PLAN_ID = 'growth' as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export type TrialStatus = 'subscribed' | 'trialing' | 'expired' | 'legacy';

export interface TrialInfo {
  status: TrialStatus;
  /** Whole days left, rounded up (0 on the last day, once under 24 hours remain it still shows 1 until it ends). */
  daysLeft: number;
  endsAt: string | null;
}

export interface TrialFields {
  trialEndsAt?: string;
  stripeSubscriptionId?: string;
}

/** Dates for a trial that starts now. */
export function newTrialDates(now: Date = new Date()): { trialStartedAt: string; trialEndsAt: string } {
  return { trialStartedAt: now.toISOString(), trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * DAY_MS).toISOString() };
}

export function trialInfo(ws: TrialFields | null | undefined, now: Date = new Date()): TrialInfo {
  if (!ws) return { status: 'legacy', daysLeft: 0, endsAt: null };
  if (ws.stripeSubscriptionId) return { status: 'subscribed', daysLeft: 0, endsAt: null };
  if (!ws.trialEndsAt) return { status: 'legacy', daysLeft: 0, endsAt: null };
  const end = new Date(ws.trialEndsAt).getTime();
  if (!Number.isFinite(end)) return { status: 'legacy', daysLeft: 0, endsAt: null };
  if (now.getTime() >= end) return { status: 'expired', daysLeft: 0, endsAt: ws.trialEndsAt };
  return { status: 'trialing', daysLeft: Math.max(1, Math.ceil((end - now.getTime()) / DAY_MS)), endsAt: ws.trialEndsAt };
}

/** True when visitors should no longer be served by this workspace's assistants. */
export function serviceBlocked(ws: TrialFields | null | undefined, now: Date = new Date()): boolean {
  return trialInfo(ws, now).status === 'expired';
}

export const SERVICE_PAUSED_MESSAGE = 'This assistant is not available right now. Please contact the business directly.';

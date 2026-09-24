import { describe, it, expect } from 'vitest';
import { newTrialDates, trialInfo, serviceBlocked, trialAvailable, TRIAL_DAYS } from './trial';

const day = 24 * 60 * 60 * 1000;
const start = new Date('2026-10-01T10:00:00Z');

describe('card-required 14-day trial', () => {
  it('a new trial lasts exactly 14 days', () => {
    const { trialStartedAt, trialEndsAt } = newTrialDates(start);
    expect(trialStartedAt).toBe(start.toISOString());
    expect(new Date(trialEndsAt).getTime() - start.getTime()).toBe(TRIAL_DAYS * day);
  });

  it('a new workspace cannot serve visitors until it has started the trial with a card', () => {
    const ws = { requiresSubscription: true };
    expect(trialInfo(ws).status).toBe('needs_card');
    expect(serviceBlocked(ws)).toBe(true);
    expect(trialAvailable(ws)).toBe(true);
  });

  it('while trialing it serves visitors and counts down to the first charge', () => {
    const ws = { requiresSubscription: true, stripeSubscriptionId: 'sub_1', subscriptionStatus: 'trialing' as const, trialEndsAt: newTrialDates(start).trialEndsAt };
    expect(trialInfo(ws, start)).toMatchObject({ status: 'trialing', daysLeft: 14 });
    expect(trialInfo(ws, new Date(start.getTime() + 13.5 * day))).toMatchObject({ status: 'trialing', daysLeft: 1 });
    expect(serviceBlocked(ws, start)).toBe(false);
    // once the trial date has passed Stripe has converted it (or cancelled it); we never lock on our own clock
    expect(trialInfo(ws, new Date(start.getTime() + 15 * day)).status).toBe('subscribed');
  });

  it('a paying workspace is served; a failed payment keeps service while Stripe retries', () => {
    expect(trialInfo({ stripeSubscriptionId: 's', subscriptionStatus: 'active' }).status).toBe('subscribed');
    expect(serviceBlocked({ stripeSubscriptionId: 's', subscriptionStatus: 'past_due' })).toBe(false);
    expect(trialInfo({ stripeSubscriptionId: 's', subscriptionStatus: 'past_due' }).status).toBe('past_due');
  });

  it('a cancelled or unpaid subscription stops service, and the trial is not offered again', () => {
    for (const status of ['canceled', 'unpaid', 'incomplete_expired'] as const) {
      expect(serviceBlocked({ requiresSubscription: true, stripeSubscriptionId: 's', subscriptionStatus: status })).toBe(true);
    }
    const afterCancel = { requiresSubscription: true, subscriptionStatus: 'canceled' as const, trialStartedAt: '2026-10-01T00:00:00Z' };
    expect(trialInfo(afterCancel).status).toBe('expired');
    expect(trialAvailable(afterCancel)).toBe(false);
  });

  it('cancelling during the trial keeps the trial running until it ends', () => {
    const ws = { stripeSubscriptionId: 's', subscriptionStatus: 'trialing' as const, trialEndsAt: newTrialDates(start).trialEndsAt, cancelAtPeriodEnd: true };
    const info = trialInfo(ws, start);
    expect(info.status).toBe('trialing');
    expect(info.cancelling).toBe(true);
  });

  it('older workspaces are never locked; the earlier no-card trial keeps its own dates', () => {
    expect(trialInfo({}).status).toBe('legacy');
    expect(serviceBlocked({})).toBe(false);
    expect(serviceBlocked(null)).toBe(false);
    const old = { trialEndsAt: newTrialDates(start).trialEndsAt };
    expect(trialInfo(old, start).status).toBe('trialing');
    expect(serviceBlocked(old, new Date(start.getTime() + 15 * day))).toBe(true);
  });
});

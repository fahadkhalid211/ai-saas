import { describe, it, expect } from 'vitest';
import { newTrialDates, trialInfo, serviceBlocked, TRIAL_DAYS } from './trial';

const day = 24 * 60 * 60 * 1000;

describe('14-day trial', () => {
  it('a new trial lasts exactly 14 days', () => {
    const now = new Date('2026-10-01T10:00:00Z');
    const { trialStartedAt, trialEndsAt } = newTrialDates(now);
    expect(trialStartedAt).toBe(now.toISOString());
    expect(new Date(trialEndsAt).getTime() - now.getTime()).toBe(TRIAL_DAYS * day);
  });

  it('counts down and then expires', () => {
    const start = new Date('2026-10-01T10:00:00Z');
    const ws = { trialEndsAt: newTrialDates(start).trialEndsAt };
    expect(trialInfo(ws, start)).toMatchObject({ status: 'trialing', daysLeft: 14 });
    expect(trialInfo(ws, new Date(start.getTime() + 13.5 * day))).toMatchObject({ status: 'trialing', daysLeft: 1 });
    expect(trialInfo(ws, new Date(start.getTime() + 14 * day)).status).toBe('expired');
    expect(serviceBlocked(ws, new Date(start.getTime() + 15 * day))).toBe(true);
    expect(serviceBlocked(ws, start)).toBe(false);
  });

  it('a paid subscription is never blocked, even after the trial dates', () => {
    const ws = { trialEndsAt: '2020-01-01T00:00:00Z', stripeSubscriptionId: 'sub_1' };
    expect(trialInfo(ws).status).toBe('subscribed');
    expect(serviceBlocked(ws)).toBe(false);
  });

  it('workspaces from before the trial existed are never locked', () => {
    expect(trialInfo({}).status).toBe('legacy');
    expect(serviceBlocked({})).toBe(false);
    expect(serviceBlocked(null)).toBe(false);
    expect(trialInfo({ trialEndsAt: 'garbage' }).status).toBe('legacy');
  });
});

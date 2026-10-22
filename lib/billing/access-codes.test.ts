import { beforeEach, describe, expect, it } from 'vitest';
import {
  complimentaryInfo, createAccessCode, generateCode, grantFor, listAccessCodes, normalizeCode, parseNewCode, redeemAccessCode, redeemBlockReason,
  redeemable, resetAccessCodesMemory, setAccessCodeActive, deleteAccessCode,
} from './access-codes';
import { trialInfo } from './trial';

beforeEach(() => resetAccessCodesMemory());

describe('code text', () => {
  it('forgives case, spaces and lookalike dashes', () => {
    expect(normalizeCode('  friend – 7k3q9x ')).toBe('FRIEND-7K3Q9X');
  });
  it('generates readable unique codes', () => {
    const a = generateCode('friend');
    expect(a).toMatch(/^FRIEND-[A-Z2-9]{6}$/);
    expect(a.split('-')[1]).not.toMatch(/[01OI]/);
    expect(generateCode()).toMatch(/^FRIEND-[A-Z2-9]{6}$/);
    expect(generateCode('')).toMatch(/^[A-Z2-9]{6}$/);
    expect(new Set(Array.from({ length: 50 }, () => generateCode())).size).toBe(50);
  });
});

describe('making a code', () => {
  it('fills in defaults', () => {
    const c = parseNewCode({ code: 'friends-2026' });
    expect(c).toMatchObject({ code: 'FRIENDS-2026', planId: 'growth', days: 30, maxUses: 1, active: true, expiresAt: null });
  });
  it('rejects bad input with a readable message', () => {
    expect(() => parseNewCode({ code: 'a b' })).toThrow(/4 to 32/);
    expect(() => parseNewCode({ code: 'OKAY1', planId: 'gold' })).toThrow(/plan/);
    expect(() => parseNewCode({ code: 'OKAY1', days: -1 })).toThrow(/Days/);
    expect(() => parseNewCode({ code: 'OKAY1', days: 1.5 })).toThrow(/Days/);
    expect(() => parseNewCode({ code: 'OKAY1', maxUses: 0 })).toThrow(/Uses/);
    expect(() => parseNewCode({ code: 'OKAY1', expiresAt: '2020-01-01' })).toThrow(/future/);
    expect(() => parseNewCode({ code: 'OKAY1', expiresAt: 'soon' })).toThrow(/valid date/);
  });
  it('refuses a duplicate', async () => {
    await createAccessCode({ code: 'DUPE-1' }, 'me');
    await expect(createAccessCode({ code: 'dupe-1' }, 'me')).rejects.toThrow(/already exists/);
  });
});

describe('redeeming', () => {
  it('uses one place and records the workspace', async () => {
    await createAccessCode({ code: 'TWO-USES', maxUses: 2 }, 'me');
    expect((await redeemAccessCode('two-uses', 'ws1')).ok).toBe(true);
    const list = await listAccessCodes();
    expect(list[0].usedCount).toBe(1);
    expect(list[0].redemptions.map((r) => r.workspaceId)).toEqual(['ws1']);
  });
  it('lets a workspace redeem a code only once and does not spend a place on the retry', async () => {
    await createAccessCode({ code: 'ONCE-EACH', maxUses: 3 }, 'me');
    await redeemAccessCode('ONCE-EACH', 'ws1');
    expect(await redeemAccessCode('ONCE-EACH', 'ws1')).toEqual({ ok: false, reason: 'already' });
    expect((await listAccessCodes())[0].usedCount).toBe(1);
  });
  it('stops at the limit', async () => {
    await createAccessCode({ code: 'SINGLE-1' }, 'me');
    expect((await redeemAccessCode('SINGLE-1', 'ws1')).ok).toBe(true);
    expect(await redeemAccessCode('SINGLE-1', 'ws2')).toEqual({ ok: false, reason: 'invalid' });
  });
  it('treats unknown, switched-off and malformed codes the same way', async () => {
    await createAccessCode({ code: 'OFF-1' }, 'me');
    await setAccessCodeActive('OFF-1', false);
    for (const bad of ['OFF-1', 'NOPE-999', '', 'x', `'; DROP TABLE`]) expect(await redeemAccessCode(bad, 'ws1')).toEqual({ ok: false, reason: 'invalid' });
    await setAccessCodeActive('OFF-1', true);
    expect((await redeemAccessCode('OFF-1', 'ws1')).ok).toBe(true);
  });
  it('honours the expiry date', async () => {
    const soon = new Date(Date.now() + 60_000).toISOString();
    await createAccessCode({ code: 'SOON-1', expiresAt: soon }, 'me');
    expect((await redeemAccessCode('SOON-1', 'ws1', new Date(Date.now() + 30_000))).ok).toBe(true);
    expect(await redeemAccessCode('SOON-1', 'ws2', new Date(Date.now() + 120_000))).toEqual({ ok: false, reason: 'invalid' });
  });
  it('can be deleted', async () => {
    await createAccessCode({ code: 'GONE-1' }, 'me');
    expect(await deleteAccessCode('gone-1')).toBe(true);
    expect(await redeemAccessCode('GONE-1', 'ws1')).toEqual({ ok: false, reason: 'invalid' });
  });
  it('reports redeemable() consistently', () => {
    const base = { code: 'A-1234', planId: 'growth', days: 30, maxUses: 1, usedCount: 0, expiresAt: null, active: true, note: '', createdAt: '', createdBy: '' } as const;
    expect(redeemable(base)).toBe(true);
    expect(redeemable({ ...base, usedCount: 1 })).toBe(false);
    expect(redeemable({ ...base, active: false })).toBe(false);
    expect(redeemable(null)).toBe(false);
  });
});

describe('the grant', () => {
  const now = new Date('2026-10-01T00:00:00Z');
  it('gives a timed workspace a trial-like window that locks at the end', () => {
    const g = grantFor({ code: 'X-1234', planId: 'growth', days: 30 }, now);
    expect(g).toMatchObject({ requiresSubscription: false, complimentaryCode: 'X-1234', planId: 'growth' });
    expect(g.trialEndsAt).toBe('2026-10-31T00:00:00.000Z');
    expect(trialInfo(g as any, new Date('2026-10-10T00:00:00Z')).status).toBe('trialing');
    expect(trialInfo(g as any, new Date('2026-11-02T00:00:00Z')).status).toBe('expired');
  });
  it('gives an open-ended workspace access that never locks', () => {
    const g = grantFor({ code: 'X-1234', planId: 'scale', days: 0 }, now);
    expect(g.trialEndsAt).toBeUndefined();
    expect(trialInfo(g as any, new Date('2030-01-01T00:00:00Z')).status).toBe('legacy');
  });
});

describe('who may redeem', () => {
  it('lets a new or ended workspace, and an early-bird trial, redeem', () => {
    expect(redeemBlockReason({ requiresSubscription: true })).toBeNull();
    expect(redeemBlockReason({ requiresSubscription: true, subscriptionStatus: 'canceled', billingSubscriptionId: 'sub_1' } as any)).toBeNull();
    const future = new Date(Date.now() + 5 * 86400000).toISOString();
    expect(redeemBlockReason({ earlyBird: true, trialStartedAt: new Date().toISOString(), trialEndsAt: future })).toBeNull();
  });
  it('blocks a paying workspace, older workspaces, repeat grants and flagged cards', () => {
    expect(redeemBlockReason({ billingSubscriptionId: 'sub_1', subscriptionStatus: 'active' })).toMatch(/subscription/);
    expect(redeemBlockReason({})).toMatch(/not needed/);
    expect(redeemBlockReason({ complimentaryCode: 'X-1234' })).toMatch(/already have free access/);
    expect(redeemBlockReason({ requiresSubscription: true, billingRisk: 'dispute' })).toMatch(/contact support/);
    expect(redeemBlockReason(null)).toBeTruthy();
  });
  it('describes free access for the dashboard', () => {
    const end = new Date(Date.now() + 86400000).toISOString();
    expect(complimentaryInfo({ complimentaryCode: 'X-1234', trialStartedAt: 'x', trialEndsAt: end })).toEqual({ active: true, code: 'X-1234', endsAt: end });
    expect(complimentaryInfo({ complimentaryCode: 'X-1234', trialEndsAt: new Date(Date.now() - 1000).toISOString() }).active).toBe(false);
    expect(complimentaryInfo({}).active).toBe(false);
  });
});

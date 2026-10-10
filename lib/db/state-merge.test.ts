import { describe, it, expect } from 'vitest';
import { applyMerged, mergeCollection, mergeItem, mergeState } from './state-merge';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const base = () => ({
  workspaces: [
    { id: 'ws_a', name: 'Bright Dental', requiresSubscription: true, planId: 'growth' },
    { id: 'ws_b', name: 'Tidy Homes', planId: 'starter' },
  ],
  teamMembers: [{ id: 'tm_a', workspaceId: 'ws_a', email: 'amy@bright.co', role: 'owner' }],
  assistants: [{ id: 'ast_a', workspaceId: 'ws_a', name: 'Front desk', provider: 'ollama', modelName: 'llama3.2' }],
  smtpSettings: { host: 'smtp.example.com' },
  landingPagesInitialized: true,
});

describe('saving the shared state from two servers', () => {
  it('keeps a redeemed access code when a server with an older copy saves assistant settings (the bug)', () => {
    const b = base();
    // server 1 redeems the code and saves
    const remote = clone(b);
    Object.assign(remote.workspaces[0], { requiresSubscription: false, complimentaryCode: 'WAQAS', trialEndsAt: '2026-11-09T07:02:28.617Z' });
    // server 2 still has the old copy and saves new assistant settings
    const local = clone(b);
    Object.assign(local.assistants[0], { provider: 'anthropic', modelName: 'claude-haiku-4-5' });

    const { merged, changedByOthers } = mergeState(b, local, remote);
    expect(merged.workspaces[0]).toMatchObject({ requiresSubscription: false, complimentaryCode: 'WAQAS' });
    expect(merged.assistants[0]).toMatchObject({ provider: 'anthropic', modelName: 'claude-haiku-4-5' });
    expect(changedByOthers).toBe(true);
  });

  it('keeps a sign-up made on another server', () => {
    const b = base();
    const remote = clone(b);
    remote.workspaces.push({ id: 'ws_new', name: 'New Salon', planId: 'growth' });
    remote.teamMembers.push({ id: 'tm_new', workspaceId: 'ws_new', email: 'new@salon.co', role: 'owner' });
    const local = clone(b);
    local.teamMembers[0].role = 'admin';

    const { merged } = mergeState(b, local, remote);
    expect(merged.workspaces.map((w: any) => w.id)).toEqual(['ws_a', 'ws_b', 'ws_new']);
    expect(merged.teamMembers.map((m: any) => [m.id, m.role])).toEqual([['tm_a', 'admin'], ['tm_new', 'owner']]);
  });

  it('merges different fields of the same item, and lets the later save win on the same field', () => {
    const was = { id: 'tm_a', name: 'Amy', lastLoginAt: '2026-10-01', role: 'owner' };
    const mine = { ...was, tourSeenAt: '2026-10-10', role: 'admin' };
    const theirs = { ...was, lastLoginAt: '2026-10-10', role: 'viewer' };
    expect(mergeItem(was, mine, theirs)).toEqual({ id: 'tm_a', name: 'Amy', lastLoginAt: '2026-10-10', tourSeenAt: '2026-10-10', role: 'admin' });
  });

  it('removes a field this server cleared and keeps a field another server cleared', () => {
    const was = { id: 'ws_a', trialEndsAt: '2026-11-01', billingRisk: 'dispute', name: 'A' };
    const mine: Record<string, any> = { id: 'ws_a', billingRisk: 'dispute', name: 'A' }; // cleared trialEndsAt
    const theirs = { id: 'ws_a', trialEndsAt: '2026-11-01', name: 'A' }; // cleared billingRisk
    expect(mergeItem(was, mine, theirs)).toEqual({ id: 'ws_a', name: 'A' });
  });

  it('respects deletions on both sides', () => {
    const was = [{ id: 'a', v: 1 }, { id: 'b', v: 1 }, { id: 'c', v: 1 }, { id: 'd', v: 1 }];
    const mine = [{ id: 'a', v: 1 }, { id: 'c', v: 2 }, { id: 'd', v: 1 }, { id: 'mine', v: 1 }]; // deleted b, changed c
    const theirs = [{ id: 'a', v: 1 }, { id: 'b', v: 9 }, { id: 'theirs', v: 1 }]; // changed b, deleted c and d
    expect(mergeCollection(was, mine, theirs)).toEqual([
      { id: 'a', v: 1 },
      { id: 'c', v: 2 }, // deleted there but changed here: kept
      { id: 'mine', v: 1 },
      { id: 'theirs', v: 1 },
      // b: deleted here, stays deleted. d: deleted there and untouched here, stays deleted.
    ]);
  });

  it('merges plain settings: a change here wins, otherwise the stored value is kept', () => {
    const b = base();
    const remote = { ...clone(b), smtpSettings: { host: 'mail.other.com' }, landingPagesInitialized: false };
    const local = { ...clone(b), landingPagesInitialized: true };
    expect(mergeState(b, local, remote).merged.smtpSettings).toEqual({ host: 'mail.other.com' });
    const local2 = { ...clone(b), smtpSettings: { host: 'smtp.mine.com' } };
    expect(mergeState(b, local2, remote).merged.smtpSettings).toEqual({ host: 'smtp.mine.com' });
  });

  it('is a plain save when nobody else wrote anything', () => {
    const b = base();
    const local = clone(b);
    local.assistants[0].name = 'Reception';
    local.assistants.push({ id: 'ast_b', workspaceId: 'ws_b', name: 'Helper', provider: 'groq', modelName: 'x' });
    const { merged, changedByOthers } = mergeState(b, local, clone(b));
    expect(merged).toEqual(local);
    expect(changedByOthers).toBe(false);
  });

  it('never drops stored items when this server has no record of what it loaded', () => {
    const remote = base();
    const local = { workspaces: [{ id: 'ws_a', name: 'Bright Dental (renamed)' }], teamMembers: [], assistants: [] };
    const { merged } = mergeState(null, local, remote);
    expect(merged.workspaces).toEqual([
      { id: 'ws_a', name: 'Bright Dental (renamed)', requiresSubscription: true, planId: 'growth' },
      { id: 'ws_b', name: 'Tidy Homes', planId: 'starter' },
    ]);
    expect(merged.teamMembers).toHaveLength(1);
    expect(merged.smtpSettings).toEqual({ host: 'smtp.example.com' });
  });

  it('leaves the truncated log lists to the saving server', () => {
    const b = { auditLogs: [{ id: 'a1' }], workspaces: [] };
    const { merged, changedByOthers } = mergeState(b, { auditLogs: [{ id: 'a2' }], workspaces: [] }, { auditLogs: [{ id: 'a3' }], workspaces: [] });
    expect(merged.auditLogs).toEqual([{ id: 'a2' }]);
    expect(changedByOthers).toBe(false);
  });

  it('saves whatever it is given when nothing is stored yet', () => {
    const local = base();
    expect(mergeState(null, local, null)).toEqual({ merged: local, changedByOthers: false });
  });
});

describe('bringing merged changes into the live copy', () => {
  it('updates items in place, so objects the running code holds stay the real ones', () => {
    const live: any = base();
    const heldMember = live.teamMembers[0];
    const heldList = live.workspaces;
    const merged = clone(live);
    merged.teamMembers[0].lastLoginAt = '2026-10-10';
    delete merged.teamMembers[0].role;
    merged.workspaces = [merged.workspaces[0], { id: 'ws_new', name: 'New Salon' }]; // ws_b deleted elsewhere, ws_new added
    merged.smtpSettings = { host: 'mail.other.com' };
    merged.auditLogs = [{ id: 'ignored' }];

    applyMerged(live, merged);

    expect(live.teamMembers[0]).toBe(heldMember);
    expect(heldMember).toEqual({ id: 'tm_a', workspaceId: 'ws_a', email: 'amy@bright.co', lastLoginAt: '2026-10-10' });
    expect(live.workspaces).toBe(heldList);
    expect(heldList.map((w: any) => w.id)).toEqual(['ws_a', 'ws_new']);
    expect(live.smtpSettings).toEqual({ host: 'mail.other.com' });
    expect(live.auditLogs).toBeUndefined();
  });
});

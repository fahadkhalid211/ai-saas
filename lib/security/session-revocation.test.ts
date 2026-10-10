import { describe, it, expect } from 'vitest';
import { Database } from '@/lib/db';
import { getAuthContext } from './auth';
import { tokenFor } from './test-session';

const req = (token: string) => new Request('http://x/api/t', { headers: { authorization: `Bearer ${token}` } });

describe('sessions follow the account', () => {
  it('stops working after the session version is raised', async () => {
    const token = await tokenFor('admin', 'tm_rev_1', 'ws_rev');
    expect((await getAuthContext(req(token))).authenticated).toBe(true);
    await Database.bumpSessionVersion('tm_rev_1');
    expect((await getAuthContext(req(token))).authenticated).toBe(false);
  });

  it('stops working when the member is removed', async () => {
    const token = await tokenFor('admin', 'tm_rev_2', 'ws_rev');
    const state = await Database.getState();
    state.teamMembers = (state.teamMembers || []).filter((m) => m.id !== 'tm_rev_2');
    expect((await getAuthContext(req(token))).authenticated).toBe(false);
  });

  it('uses the role the account has now, not the one in the token', async () => {
    const token = await tokenFor('admin', 'tm_rev_3', 'ws_rev');
    const state = await Database.getState();
    state.teamMembers!.find((m) => m.id === 'tm_rev_3')!.role = 'viewer';
    expect((await getAuthContext(req(token))).role).toBe('viewer');
  });
});

describe('an account this server has not heard of yet', () => {
  it('reloads the accounts once before deciding the session is invalid (sign-up handled by another server)', async () => {
    const { vi } = await import('vitest');
    const token = await tokenFor('owner', 'tm_fresh_1', 'ws_fresh');
    const state = await Database.getState();
    const member = state.teamMembers!.find((m) => m.id === 'tm_fresh_1')!;
    // this server's copy predates the sign-up...
    state.teamMembers = state.teamMembers!.filter((m) => m.id !== 'tm_fresh_1');
    // ...and the shared database has it
    const refresh = vi.spyOn(Database, 'refreshState').mockImplementation(async () => {
      state.teamMembers!.push(member);
      return true;
    });
    try {
      const ctx = await getAuthContext(req(token));
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(ctx).toMatchObject({ authenticated: true, memberId: 'tm_fresh_1', workspaceId: 'ws_fresh' });
    } finally {
      refresh.mockRestore();
    }
  });

  it('stays signed out when the account really is gone', async () => {
    const { vi } = await import('vitest');
    const token = await tokenFor('owner', 'tm_fresh_2', 'ws_fresh');
    const state = await Database.getState();
    state.teamMembers = state.teamMembers!.filter((m) => m.id !== 'tm_fresh_2');
    const refresh = vi.spyOn(Database, 'refreshState').mockResolvedValue(true);
    try {
      expect((await getAuthContext(req(token))).authenticated).toBe(false);
    } finally {
      refresh.mockRestore();
    }
  });
});

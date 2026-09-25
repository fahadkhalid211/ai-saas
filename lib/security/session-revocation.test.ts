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

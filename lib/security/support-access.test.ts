import { describe, it, expect, beforeAll } from 'vitest';
import { Database } from '@/lib/db';
import { generateSessionToken, getAuthContext } from './auth';
import { tokenFor } from './test-session';
import { SUPPORT_ACCESS_MINUTES } from './support-access';

const KEY = 'support-access-test-key-'.padEnd(40, 'x');
const call = (path: string, init: { method?: string; cookie?: string; body?: unknown } = {}) =>
  new Request(`http://localhost${path}`, {
    method: init.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(init.cookie ? { cookie: init.cookie } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
const cookieValue = (res: Response, name: string) => {
  for (const c of res.headers.getSetCookie()) {
    const m = c.match(new RegExp(`^${name}=([^;]*)`));
    if (m) return m[1];
  }
  return null;
};

describe('master support access to a customer account', () => {
  let masterToken = '';
  let ownerId = '';
  const workspaceId = 'ws_support_test';

  beforeAll(async () => {
    process.env.ADMIN_API_KEY = KEY;
    masterToken = generateSessionToken('admin', 'master-admin', '*', true);
    const state = await Database.getState();
    if (!state.workspaces.find((w) => w.id === workspaceId)) {
      state.workspaces.push({ ...(state.workspaces[0] as any), id: workspaceId, name: 'Bright Dental' });
    }
    await tokenFor('owner', 'tm_support_owner', workspaceId);
    ownerId = 'tm_support_owner';
  });

  it('lets only the master start it', async () => {
    const { POST } = await import('../../app/api/master/support-access/route');
    const customer = await tokenFor('owner', 'tm_support_other', 'ws_other');
    const asCustomer = await POST(call('/api/master/support-access', { method: 'POST', cookie: `kortex_admin_session=${customer}`, body: { workspaceId } }));
    expect(asCustomer.status).toBe(404);
    const anonymous = await POST(call('/api/master/support-access', { method: 'POST', body: { workspaceId } }));
    expect(anonymous.status).toBe(401);
  });

  it('signs the master in as the workspace owner, for a limited time, without master rights', async () => {
    const { POST } = await import('../../app/api/master/support-access/route');
    const res = await POST(call('/api/master/support-access', { method: 'POST', cookie: `kortex_admin_session=${masterToken}`, body: { workspaceId } }));
    expect(res.status).toBe(200);
    const session = cookieValue(res, 'kortex_admin_session')!;
    expect(cookieValue(res, 'kortex_master_return')).toBe(masterToken);

    const ctx = await getAuthContext(call('/api/x', { cookie: `kortex_admin_session=${session}` }));
    expect(ctx).toMatchObject({ authenticated: true, workspaceId, memberId: ownerId, role: 'owner', isMasterAdmin: false, supportAccess: true });

    const payload = JSON.parse(Buffer.from(session.split('.')[0], 'base64url').toString());
    expect(payload.exp - Date.now()).toBeLessThanOrEqual(SUPPORT_ACCESS_MINUTES * 60_000);
    expect(payload.exp - Date.now()).toBeGreaterThan((SUPPORT_ACCESS_MINUTES - 1) * 60_000);

    // the customer's own logs endpoint stays closed: this session is not the master
    const { GET: logs } = await import('../../app/api/master/logs/route');
    expect((await logs(call('/api/master/logs', { cookie: `kortex_admin_session=${session}` }))).status).toBe(404);
  });

  it('answers 404 for a workspace that does not exist', async () => {
    const { POST } = await import('../../app/api/master/support-access/route');
    const res = await POST(call('/api/master/support-access', { method: 'POST', cookie: `kortex_admin_session=${masterToken}`, body: { workspaceId: 'ws_nope' } }));
    expect(res.status).toBe(404);
  });

  it('returns to the master session only with the master return cookie', async () => {
    const { POST, DELETE } = await import('../../app/api/master/support-access/route');
    const start = await POST(call('/api/master/support-access', { method: 'POST', cookie: `kortex_admin_session=${masterToken}`, body: { workspaceId } }));
    const session = cookieValue(start, 'kortex_admin_session')!;

    const noReturn = await DELETE(call('/api/master/support-access', { method: 'DELETE', cookie: `kortex_admin_session=${session}` }));
    expect(noReturn.status).toBe(401);
    const forged = await DELETE(call('/api/master/support-access', { method: 'DELETE', cookie: `kortex_admin_session=${session}; kortex_master_return=${session}` }));
    expect(forged.status).toBe(401);

    const back = await DELETE(call('/api/master/support-access', { method: 'DELETE', cookie: `kortex_admin_session=${session}; kortex_master_return=${masterToken}` }));
    expect(back.status).toBe(200);
    expect(cookieValue(back, 'kortex_admin_session')).toBe(masterToken);
    expect(cookieValue(back, 'kortex_master_return')).toBe('');
  });

  it('a customer cannot mint a support session by editing their own token', async () => {
    const customer = await tokenFor('owner', 'tm_support_other', 'ws_other');
    const payload = JSON.parse(Buffer.from(customer.split('.')[0], 'base64url').toString());
    const forged = Buffer.from(JSON.stringify({ ...payload, workspaceId, memberId: ownerId, imp: true })).toString('base64url') + '.' + customer.split('.')[1];
    expect((await getAuthContext(call('/api/x', { cookie: `kortex_admin_session=${forged}` }))).authenticated).toBe(false);
  });

  it('lists every workspace with its people and assistants, for the master only', async () => {
    const { GET } = await import('../../app/api/master/customers/route');
    const customer = await tokenFor('owner', 'tm_support_other', 'ws_other');
    expect((await GET(call('/api/master/customers', { cookie: `kortex_admin_session=${customer}` }))).status).toBe(404);
    const res = await GET(call('/api/master/customers', { cookie: `kortex_admin_session=${masterToken}` }));
    expect(res.status).toBe(200);
    const body = await res.json();
    const ws = body.customers.find((c: any) => c.id === workspaceId);
    expect(ws.name).toBe('Bright Dental');
    expect(ws.owner).toMatchObject({ id: ownerId, email: 'tm_support_owner@test.local' });
    expect(JSON.stringify(body)).not.toMatch(/password|apiKeyEncrypted|twoFactorSecret|recoveryCodes/);
  });
});

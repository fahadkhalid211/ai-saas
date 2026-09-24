import { describe, it, expect, beforeAll, vi } from 'vitest';

const queryLogs = vi.fn(async () => ({ entries: [], nextCursor: null }));
const summarizeLogs = vi.fn(async () => ({ hours: 24, totals: {}, byHour: [], topFailingRoutes: [], errorGroups: [], slowestRoutes: [], storage: {} }));
vi.mock('./query', async () => {
  const actual = await vi.importActual<typeof import('./query')>('./query');
  return { ...actual, queryLogs: (...a: any[]) => (queryLogs as any)(...a), summarizeLogs: (...a: any[]) => (summarizeLogs as any)(...a) };
});
vi.mock('./store', async () => {
  const actual = await vi.importActual<typeof import('./store')>('./store');
  return { ...actual, persistLogRows: vi.fn(async (rows: any[]) => ({ stored: rows.length, where: 'postgres' as const })) };
});

import { generateSessionToken } from '@/lib/security/auth';

const KEY = 'access-test-key-'.padEnd(40, 'x');
const call = (path: string, headers: Record<string, string> = {}) => new Request(`http://localhost${path}`, { headers });

const ENDPOINTS = ['/api/master/logs', '/api/master/logs/summary', '/api/master/logs/export'];

async function handler(path: string) {
  if (path.endsWith('/summary')) return (await import('../../app/api/master/logs/summary/route')).GET;
  if (path.endsWith('/export')) return (await import('../../app/api/master/logs/export/route')).GET;
  return (await import('../../app/api/master/logs/route')).GET;
}

describe('the log is visible to the master admin only', () => {
  beforeAll(() => {
    process.env.ADMIN_API_KEY = KEY;
  });

  it('answers anonymous callers with 401 on every endpoint', async () => {
    for (const p of ENDPOINTS) {
      const res = await (await handler(p))(call(p));
      expect(res.status, p).toBe(401);
    }
    expect(queryLogs).not.toHaveBeenCalled();
    expect(summarizeLogs).not.toHaveBeenCalled();
  });

  it('answers every customer role with 404, so the endpoints look like they do not exist', async () => {
    for (const role of ['owner', 'admin', 'support_agent', 'billing_manager', 'viewer']) {
      const token = generateSessionToken(role, 'tm_customer', 'ws_customer');
      for (const p of ENDPOINTS) {
        const res = await (await handler(p))(call(p, { cookie: `kortex_admin_session=${token}` }));
        expect(res.status, `${role} ${p}`).toBe(404);
      }
    }
    // a bearer session token of a customer is no better
    const token = generateSessionToken('owner', 'tm_customer', 'ws_customer');
    expect((await (await handler(ENDPOINTS[0]))(call(ENDPOINTS[0], { authorization: `Bearer ${token}` }))).status).toBe(404);
    expect(queryLogs).not.toHaveBeenCalled();
  });

  it('does not treat a forged master flag as master', async () => {
    const forged = Buffer.from(JSON.stringify({ role: 'owner', memberId: 'x', workspaceId: 'ws', isMasterAdmin: true, exp: Date.now() + 1e9 })).toString('base64url');
    const res = await (await handler(ENDPOINTS[0]))(call(ENDPOINTS[0], { cookie: `kortex_admin_session=${forged}.${'0'.repeat(64)}` }));
    expect(res.status).toBe(401);
  });

  it('lets the master admin in (session from /master, or the master key as a bearer token)', async () => {
    const session = generateSessionToken('admin', 'master-admin', '*', true);
    const viaCookie = await (await handler(ENDPOINTS[0]))(call(`${ENDPOINTS[0]}?levels=error&limit=10`, { cookie: `kortex_admin_session=${session}` }));
    expect(viaCookie.status).toBe(200);
    expect(await viaCookie.json()).toEqual({ entries: [], nextCursor: null });
    expect(queryLogs).toHaveBeenCalledWith(expect.objectContaining({ levels: ['error'], limit: 10 }));

    const summary = await (await handler(ENDPOINTS[1]))(call(ENDPOINTS[1], { authorization: `Bearer ${KEY}` }));
    expect(summary.status).toBe(200);

    const csv = await (await handler(ENDPOINTS[2]))(call(`${ENDPOINTS[2]}?format=csv`, { cookie: `kortex_admin_session=${session}` }));
    expect(csv.status).toBe(200);
    expect(csv.headers.get('content-type')).toContain('text/csv');
    expect(csv.headers.get('content-disposition')).toContain('attachment');
    expect((await csv.text()).startsWith('ts,level,category')).toBe(true);
  });
});

import { tokenFor } from '@/lib/security/test-session';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const persisted: any[] = [];
const purge = vi.fn(async (_days: number) => 7);
vi.mock('./store', async () => {
  const actual = await vi.importActual<typeof import('./store')>('./store');
  return {
    ...actual,
    persistLogRows: vi.fn(async (rows: any[]) => {
      persisted.push(...rows);
      return { stored: rows.length, where: 'postgres' as const };
    }),
    purgeOldLogs: (d: number) => purge(d),
  };
});
vi.mock('@/lib/cache/redis', () => ({ isRedisConfigured: () => false, getRedisClient: () => null }));

import { flushLogs, _resetLoggerForTesting } from './logger';
import { generateSessionToken } from '@/lib/security/auth';

const KEY = 'client-log-test-key-'.padEnd(40, 'x');
let n = 0;
const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/log/client', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.7.0.${++n}`, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

beforeAll(() => {
  process.env.ADMIN_API_KEY = KEY;
});
beforeEach(() => {
  persisted.length = 0;
  purge.mockClear();
  _resetLoggerForTesting();
});

describe('browser error reports', () => {
  it('records a report with the server-verified identity, never the one claimed in the payload', async () => {
    const { POST } = await import('../../app/api/log/client/route');
    const token = await tokenFor('owner', 'tm_real', 'ws_real');
    const res = await POST(
      post(
        { kind: 'error', message: 'Cannot read properties of undefined', stack: 'at render (app.js:1:2)', page: '/dashboard', userId: 'tm_FAKE', workspaceId: 'ws_FAKE', line: 10 },
        { cookie: `kortex_admin_session=${token}` }
      )
    );
    expect(res.status).toBe(204);
    await flushLogs();
    const row = persisted.find((r) => r.event === 'client.error')!;
    expect(row).toMatchObject({ category: 'client', level: 'error', userId: 'tm_real', workspaceId: 'ws_real' });
    expect(row.meta.page).toBe('/dashboard');
    expect(JSON.stringify(row)).not.toContain('FAKE');
    expect(row.fingerprint).toHaveLength(16);
  });

  it('redacts secrets in reports and rejects oversized or malformed ones', async () => {
    const { POST } = await import('../../app/api/log/client/route');
    await POST(post({ kind: 'unhandledrejection', message: 'fetch failed https://x.test/cb?token=abc123secret Bearer abcdefghijklmnop12345' }));
    await flushLogs();
    const row = persisted.find((r) => r.event === 'client.unhandledrejection')!;
    expect(JSON.stringify(row)).not.toMatch(/abc123secret|abcdefghijklmnop12345/);

    expect((await POST(post({ message: 'x'.repeat(5000) }))).status).toBe(413);
    expect((await POST(post('{not json'))).status).toBe(400);
    expect((await POST(post('123'))).status).toBe(400);
  });

  it('is rate limited per address', async () => {
    const { POST } = await import('../../app/api/log/client/route');
    const same = { 'x-forwarded-for': '10.7.9.9' };
    const codes: number[] = [];
    for (let i = 0; i < 25; i++) codes.push((await POST(post({ message: `m${i}` }, same))).status);
    expect(codes.filter((c) => c === 204).length).toBeLessThanOrEqual(20);
    expect(codes).toContain(429);
  });
});

describe('daily retention job', () => {
  it('refuses callers without the cron secret and deletes old rows for those with it', async () => {
    process.env.CRON_SECRET = 'cron-secret-'.padEnd(32, 'z');
    process.env.LOG_RETENTION_DAYS = '14';
    const { GET } = await import('../../app/api/cron/log-retention/route');
    const denied = await GET(new Request('http://localhost/api/cron/log-retention') as any);
    expect(denied.status).toBe(401);
    expect(purge).not.toHaveBeenCalled();

    const ok = await GET(new Request('http://localhost/api/cron/log-retention', { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } }) as any);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ success: true, days: 14, deleted: 7 });
    expect(purge).toHaveBeenCalledWith(14);
    delete process.env.LOG_RETENTION_DAYS;
    delete process.env.CRON_SECRET;
  });
});

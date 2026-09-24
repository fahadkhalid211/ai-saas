import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const persisted: any[] = [];
vi.mock('./store', async () => {
  const actual = await vi.importActual<typeof import('./store')>('./store');
  return {
    ...actual,
    persistLogRows: vi.fn(async (rows: any[]) => {
      persisted.push(...rows);
      return { stored: rows.length, where: 'postgres' as const };
    }),
  };
});

import { NextResponse } from 'next/server';
import { logged } from './route';
import { flushLogs, logEvent, _resetLoggerForTesting } from './logger';
import { generateSessionToken } from '@/lib/security/auth';

const req = (path = '/api/thing?token=secret123', init: RequestInit = {}) => new Request(`http://localhost${path}`, init);

beforeAll(() => {
  process.env.ADMIN_API_KEY = 'route-log-test-key-'.padEnd(40, 'x');
});
beforeEach(() => {
  _resetLoggerForTesting();
  persisted.length = 0;
});

describe('logged()', () => {
  it('keeps the handler signature, adds a request id header and records the request', async () => {
    const handler = logged(async (r: Request, ctx: { params: Promise<{ id: string }> }) => {
      const { id } = await ctx.params;
      return NextResponse.json({ id, method: r.method });
    }, { route: '/api/thing/[id]' });

    const res = await handler(req('/api/thing/42?token=secret123', { method: 'POST', headers: { 'user-agent': 'vitest' } }), { params: Promise.resolve({ id: '42' }) });
    expect(await res.json()).toEqual({ id: '42', method: 'POST' });
    const requestId = res.headers.get('x-request-id')!;
    expect(requestId).toMatch(/^[0-9a-f-]{36}$/);

    await flushLogs();
    expect(persisted).toHaveLength(1);
    expect(persisted[0]).toMatchObject({
      level: 'info', category: 'request', event: 'http.request', status: 200, method: 'POST', route: '/api/thing/[id]', requestId,
    });
    expect(persisted[0].durationMs).toBeGreaterThanOrEqual(0);
    // the query VALUE (a token) must never reach the log, only the key
    expect(persisted[0].path).toBe('/api/thing/42?token=…');
    expect(JSON.stringify(persisted[0])).not.toContain('secret123');
  });

  it('records who made the request (verified session only)', async () => {
    const handler = logged(async () => NextResponse.json({ ok: true }), { route: '/api/x' });
    const token = generateSessionToken('owner', 'tm_abc', 'ws_123');
    await handler(req('/api/x', { headers: { cookie: `kortex_admin_session=${token}` } }));
    // a forged token is not trusted for identity
    await handler(req('/api/x', { headers: { cookie: 'kortex_admin_session=eyJyb2xlIjoib3duZXIifQ.deadbeef' } }));
    await flushLogs();
    expect(persisted[0]).toMatchObject({ userId: 'tm_abc', workspaceId: 'ws_123', role: 'owner' });
    expect(persisted[1].userId).toBeNull();
  });

  it('logs failures at warn/error and always records them', async () => {
    const h401 = logged(async () => NextResponse.json({ error: 'no' }, { status: 401 }), { route: '/api/a', sample: 0 });
    const h500 = logged(async () => NextResponse.json({ error: 'bad' }, { status: 500 }), { route: '/api/b', sample: 0 });
    await h401(req('/api/a'));
    await h500(req('/api/b'));
    await flushLogs();
    expect(persisted.map((r) => [r.status, r.level])).toEqual([[401, 'warn'], [500, 'error']]);
  });

  it('samples successful requests but never failures', async () => {
    const ok = logged(async () => NextResponse.json({ ok: 1 }), { route: '/api/noisy', sample: 0 });
    for (let i = 0; i < 20; i++) await ok(req('/api/noisy'));
    await flushLogs();
    expect(persisted).toHaveLength(0);
  });

  it('turns an uncaught exception into a logged error and a generic 500 that carries the request id', async () => {
    const boom = logged(async () => {
      throw new Error('database exploded at 155.248.251.71 using sk-live-abcdefghijklmnopqrstuv');
    }, { route: '/api/boom' });
    const res = await boom(req('/api/boom'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('exploded');
    expect(res.headers.get('x-request-id')).toBe(body.requestId);
    await flushLogs();
    expect(persisted[0]).toMatchObject({ level: 'error', event: 'http.unhandled_exception', status: 500, requestId: body.requestId });
    expect(persisted[0].errorMessage).not.toContain('abcdefghijklmnopqrstuv');
    expect(persisted[0].fingerprint).toHaveLength(16);
  });

  it('gives events logged deep inside the handler the same request id', async () => {
    const handler = logged(async () => {
      logEvent({ category: 'booking', event: 'booking.created', meta: { slot: '10:00' } });
      return NextResponse.json({ ok: true });
    }, { route: '/api/deep' });
    const res = await handler(req('/api/deep'));
    await flushLogs();
    const requestId = res.headers.get('x-request-id');
    expect(persisted.map((r) => r.requestId)).toEqual([requestId, requestId]);
    expect(persisted.map((r) => r.event).sort()).toEqual(['booking.created', 'http.request']);
  });

  it('ignores a malformed client-supplied request id and does not log CORS preflights', async () => {
    const handler = logged(async () => new Response('ok'), { route: '/api/pre' });
    const res = await handler(req('/api/pre', { headers: { 'x-request-id': 'bad id with spaces <script>' } }));
    expect(res.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
    await handler(req('/api/pre', { method: 'OPTIONS' }));
    await flushLogs();
    expect(persisted).toHaveLength(1);
  });
});

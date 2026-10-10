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
import { flushLogs, _resetLoggerForTesting } from './logger';
import { describeLog } from './describe';

beforeAll(() => {
  process.env.ADMIN_API_KEY = 'failure-reason-test-key-'.padEnd(40, 'x');
});
beforeEach(() => {
  _resetLoggerForTesting();
  persisted.length = 0;
});

describe('failed requests say why', () => {
  it('records the error text of a handler that answered 500 without throwing', async () => {
    const handler = logged(async () => NextResponse.json({ error: 'Cannot read properties of undefined (reading email)' }, { status: 500 }), { route: '/api/auth' });
    const res = await handler(new Request('http://localhost/api/auth', { method: 'POST' }));
    expect(await res.json()).toEqual({ error: 'Cannot read properties of undefined (reading email)' }); // the caller still gets the body
    await flushLogs();
    const row = persisted.find((r) => r.event === 'http.request');
    expect(row).toMatchObject({ status: 500, level: 'error', message: 'Cannot read properties of undefined (reading email)' });
    expect(describeLog(row)).toBe(
      'Someone not signed in tried to sign in or register. It failed because of an error on the server. They were told: "Cannot read properties of undefined (reading email)"'
    );
  });

  it('leaves successful and non-JSON responses alone', async () => {
    const ok = logged(async () => NextResponse.json({ message: 'fine' }), { route: '/api/x' });
    await ok(new Request('http://localhost/api/x'));
    const text = logged(async () => new Response('nope', { status: 404 }), { route: '/api/y' });
    await text(new Request('http://localhost/api/y'));
    await flushLogs();
    expect(persisted.filter((r) => r.event === 'http.request').map((r) => r.message)).toEqual([null, null]);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

const persisted: any[][] = [];
vi.mock('./store', async () => {
  const actual = await vi.importActual<typeof import('./store')>('./store');
  return {
    ...actual,
    persistLogRows: vi.fn(async (rows: any[]) => {
      persisted.push(rows);
      return { stored: rows.length, where: 'postgres' as const };
    }),
  };
});

import { logEvent, log, flushLogs, fingerprintOf, _resetLoggerForTesting, _peekLogBufferForTesting } from './logger';
import { runWithLogContext } from './context';

beforeEach(() => {
  _resetLoggerForTesting();
  persisted.length = 0;
  delete process.env.LOG_LEVEL;
});

describe('logger', () => {
  it('attaches the request identity and never blocks the caller', async () => {
    runWithLogContext(
      { requestId: 'req-1', method: 'POST', route: '/api/x', path: '/api/x', ip: '1.2.3.4', userId: 'u1', workspaceId: 'w1', role: 'owner' },
      () => log.info('auth', 'auth.login_success', { provider: 'password' })
    );
    expect(_peekLogBufferForTesting()).toHaveLength(1);
    await flushLogs();
    expect(persisted).toHaveLength(1);
    expect(persisted[0][0]).toMatchObject({
      level: 'info', category: 'auth', event: 'auth.login_success', requestId: 'req-1', userId: 'u1', workspaceId: 'w1', role: 'owner', ip: '1.2.3.4', route: '/api/x',
    });
    expect(persisted[0][0].ts).toBeInstanceOf(Date);
  });

  it('redacts metadata and error text before anything is stored', async () => {
    logEvent({ category: 'auth', event: 'auth.x', meta: { password: 'p', note: 'ok' }, error: new Error('failed using sk-live-abcdefghijklmnopqrstuv') });
    await flushLogs();
    const row = persisted[0][0];
    expect(row.meta.password).toBe('[redacted]');
    expect(row.meta.note).toBe('ok');
    expect(row.errorMessage).not.toContain('abcdefghijklmnopqrstuv');
    expect(row.level).toBe('error');
    expect(row.fingerprint).toHaveLength(16);
  });

  it('drops events below LOG_LEVEL', async () => {
    log.debug('system', 'noisy');
    expect(_peekLogBufferForTesting()).toHaveLength(0);
    process.env.LOG_LEVEL = 'debug';
    log.debug('system', 'noisy');
    expect(_peekLogBufferForTesting()).toHaveLength(1);
    process.env.LOG_LEVEL = 'error';
    log.info('system', 'quiet');
    log.warn('system', 'quiet');
    expect(_peekLogBufferForTesting()).toHaveLength(1);
  });

  it('writes in batches of at most 200 rows and keeps the buffer bounded', async () => {
    for (let i = 0; i < 450; i++) log.info('system', `e${i}`);
    await flushLogs();
    expect(persisted.map((b) => b.length)).toEqual([200, 200, 50]);
    for (let i = 0; i < 1500; i++) log.info('system', 'burst');
    expect(_peekLogBufferForTesting().length).toBeLessThanOrEqual(1000);
  });

  it('never throws into application code, even with hostile input', () => {
    const circular: any = {};
    circular.self = circular;
    expect(() => logEvent({ category: 'system', event: 'x', meta: circular, error: { toString: () => { throw new Error('no'); } } })).not.toThrow();
    expect(() => logEvent({ category: 'system', event: 'y'.repeat(5000), message: undefined })).not.toThrow();
  });

  it('groups the same failure under one fingerprint regardless of line numbers or ids', () => {
    const a = fingerprintOf('TypeError', 'TypeError: x\n    at handler (/app/route.ts:10:5)', 'x');
    const b = fingerprintOf('TypeError', 'TypeError: x\n    at handler (/app/route.ts:99:1)', 'x');
    const c = fingerprintOf('TypeError', 'TypeError: x\n    at other (/app/route.ts:10:5)', 'x');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(fingerprintOf('Error', null, 'user 12345 not found')).toBe(fingerprintOf('Error', null, 'user 99 not found'));
  });
});

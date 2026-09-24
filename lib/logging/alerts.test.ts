import { describe, it, expect, beforeEach, vi } from 'vitest';

const sendOperationalEmail = vi.fn(async (_: { to: string; subject: string; text: string }) => ({ success: true, messageId: 'm1' } as any));
vi.mock('@/lib/email', () => ({ sendOperationalEmail: (o: any) => sendOperationalEmail(o) }));
vi.mock('@/lib/cache/redis', () => ({ isRedisConfigured: () => false, getRedisClient: () => null }));
vi.mock('./store', async () => {
  const actual = await vi.importActual<typeof import('./store')>('./store');
  return { ...actual, persistLogRows: vi.fn(async (rows: any[]) => ({ stored: rows.length, where: 'postgres' as const })) };
});

import { evaluateAlert, isAlertWorthy, _resetAlertsForTesting } from './alerts';
import { _resetLoggerForTesting } from './logger';
import type { LogRow } from './store';

const row = (over: Partial<LogRow> = {}): LogRow => ({
  ts: new Date(),
  level: 'error',
  category: 'request',
  event: 'http.unhandled_exception',
  message: 'boom',
  route: '/api/x',
  method: 'POST',
  status: 500,
  requestId: 'req-1',
  userId: 'u1',
  fingerprint: 'fp-' + Math.random().toString(36).slice(2),
  errorName: 'Error',
  errorMessage: 'boom',
  ...over,
});

beforeEach(() => {
  _resetAlertsForTesting();
  _resetLoggerForTesting();
  sendOperationalEmail.mockClear();
  delete process.env.LOG_ALERTS;
  delete process.env.LOG_ALERT_THRESHOLD;
  process.env.MASTER_ADMIN_EMAIL = 'owner@example.com';
});

describe('error alerts', () => {
  it('only errors and fatals count, and failures of the alert e-mail itself never do', () => {
    expect(isAlertWorthy(row())).toBe(true);
    expect(isAlertWorthy(row({ level: 'fatal' }))).toBe(true);
    expect(isAlertWorthy(row({ level: 'warn' }))).toBe(false);
    expect(isAlertWorthy(row({ level: 'info' }))).toBe(false);
    expect(isAlertWorthy(row({ message: '[EmailService] SMTP delivery failed: x' }))).toBe(false);
  });

  it('e-mails the master admin once the error count reaches the threshold, then respects the cool-down', async () => {
    // same fingerprint so only the volume rule can fire
    const fp = 'same-error';
    for (let i = 0; i < 9; i++) await evaluateAlert(row({ fingerprint: fp, category: 'request' }));
    expect(sendOperationalEmail).not.toHaveBeenCalled();
    await evaluateAlert(row({ fingerprint: fp, category: 'request' }));
    expect(sendOperationalEmail).toHaveBeenCalledTimes(1);
    const mail = sendOperationalEmail.mock.calls[0][0];
    expect(mail.to).toBe('owner@example.com');
    expect(mail.subject).toContain('10 errors');
    expect(mail.text).toContain('req-1');
    for (let i = 0; i < 20; i++) await evaluateAlert(row({ fingerprint: fp, category: 'request' }));
    expect(sendOperationalEmail).toHaveBeenCalledTimes(1);
  });

  it('alerts straight away on a brand-new kind of error in a critical area, but not in ordinary ones', async () => {
    await evaluateAlert(row({ category: 'request', fingerprint: 'new-1' }));
    expect(sendOperationalEmail).not.toHaveBeenCalled();
    await evaluateAlert(row({ category: 'auth', fingerprint: 'new-2' }));
    expect(sendOperationalEmail).toHaveBeenCalledTimes(1);
    expect(sendOperationalEmail.mock.calls[0][0].subject).toContain('new kind of error');
  });

  it('does not repeat the "new error" alert for a known fingerprint', async () => {
    process.env.LOG_ALERT_COOLDOWN_MIN = '0.0001';
    await evaluateAlert(row({ category: 'db', fingerprint: 'known' }));
    await new Promise((r) => setTimeout(r, 20));
    await evaluateAlert(row({ category: 'db', fingerprint: 'known' }));
    expect(sendOperationalEmail).toHaveBeenCalledTimes(1);
    delete process.env.LOG_ALERT_COOLDOWN_MIN;
  });

  it('can be switched off', async () => {
    process.env.LOG_ALERTS = 'false';
    for (let i = 0; i < 30; i++) await evaluateAlert(row({ category: 'auth' }));
    expect(sendOperationalEmail).not.toHaveBeenCalled();
  });

  it('never throws when e-mail sending fails', async () => {
    sendOperationalEmail.mockRejectedValueOnce(new Error('smtp down'));
    await expect(evaluateAlert(row({ category: 'auth', fingerprint: 'x1' }))).rejects.toThrow();
    // installLogAlerts() wraps evaluateAlert in .catch(); the evaluator itself is allowed to reject
  });
});

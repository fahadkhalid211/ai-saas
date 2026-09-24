import { getRedisClient, isRedisConfigured } from '@/lib/cache/redis';
import { getMasterEmail } from '@/lib/security/master';
import { sendOperationalEmail } from '@/lib/email';
import { logEvent, onLogRow } from './logger';
import type { LogRow } from './store';

/**
 * E-mails the master admin when the app starts failing.
 *
 * A message goes out when EITHER
 *   - LOG_ALERT_THRESHOLD (default 10) or more errors happen inside LOG_ALERT_WINDOW_MIN (default 5) minutes, or
 *   - an error with a never-before-seen fingerprint shows up in auth, db or security (or any fatal error) in the last 24 hours,
 * and never more often than once per LOG_ALERT_COOLDOWN_MIN (default 30) minutes. Counters live in Redis so they hold across
 * serverless instances; without Redis they are per-process. LOG_ALERTS=false switches it off.
 */

const memory = new Map<string, { value: number; expires: number }>();

function envNumber(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function alertsEnabled(): boolean {
  return process.env.LOG_ALERTS !== 'false';
}

async function incrWindow(key: string, ttlSeconds: number): Promise<number> {
  const redis = isRedisConfigured() ? getRedisClient() : null;
  if (redis) {
    try {
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, ttlSeconds);
      return n;
    } catch {
      // fall back to memory
    }
  }
  const now = Date.now();
  const cur = memory.get(key);
  if (!cur || cur.expires < now) {
    memory.set(key, { value: 1, expires: now + ttlSeconds * 1000 });
    return 1;
  }
  cur.value++;
  return cur.value;
}

/** True the first time a key is claimed within ttl (SET NX). */
async function claim(key: string, ttlSeconds: number): Promise<boolean> {
  const redis = isRedisConfigured() ? getRedisClient() : null;
  if (redis) {
    try {
      return (await redis.set(key, '1', { nx: true, ex: ttlSeconds })) === 'OK';
    } catch {
      // fall back to memory
    }
  }
  const now = Date.now();
  const cur = memory.get(key);
  if (cur && cur.expires > now) return false;
  memory.set(key, { value: 1, expires: now + ttlSeconds * 1000 });
  return true;
}

function appUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (configured) return /^https?:\/\//i.test(configured) ? configured.replace(/\/$/, '') : `https://${configured}`;
  return 'https://www.crescelo.com';
}

export function isAlertWorthy(row: LogRow): boolean {
  if (row.level !== 'error' && row.level !== 'fatal') return false;
  // Failures of the alert e-mail itself must not count toward the next alert.
  if ((row.message || '').startsWith('[EmailService]')) return false;
  return true;
}

export async function evaluateAlert(row: LogRow): Promise<void> {
  if (!alertsEnabled() || !isAlertWorthy(row)) return;

  const windowMin = envNumber('LOG_ALERT_WINDOW_MIN', 5);
  const threshold = envNumber('LOG_ALERT_THRESHOLD', 10);
  const cooldownSec = envNumber('LOG_ALERT_COOLDOWN_MIN', 30) * 60;

  const bucket = Math.floor(Date.now() / (windowMin * 60_000));
  const count = await incrWindow(`logalert:count:${bucket}`, windowMin * 60 * 2);

  let reason: string | null = null;
  if (count >= threshold) reason = `${count} errors in the last ${windowMin} minutes`;
  if (!reason && row.fingerprint && (row.level === 'fatal' || ['auth', 'db', 'security'].includes(row.category))) {
    if (await claim(`logalert:fp:${row.fingerprint}`, 24 * 3600)) reason = 'a new kind of error in a critical area';
  }
  if (!reason) return;
  if (!(await claim('logalert:sent', cooldownSec))) return;

  const to = getMasterEmail();
  const lines = [
    `Crescelo alert: ${reason}.`,
    '',
    `Time:        ${row.ts.toISOString()}`,
    `Level:       ${row.level}`,
    `Where:       ${row.category} / ${row.event}`,
    row.route ? `Route:       ${row.method || ''} ${row.route}${row.status ? ` -> ${row.status}` : ''}` : '',
    row.userId ? `User:        ${row.userId}${row.workspaceId ? ` (workspace ${row.workspaceId})` : ''}` : '',
    row.requestId ? `Request id:  ${row.requestId}` : '',
    row.fingerprint ? `Error group: ${row.fingerprint}` : '',
    '',
    row.errorName || row.errorMessage ? `${row.errorName || 'Error'}: ${(row.errorMessage || row.message || '').slice(0, 400)}` : (row.message || '').slice(0, 400),
    '',
    `Open the log: ${appUrl()}/dashboard  (System Logs, filter by request id)`,
    '',
    `You get at most one alert per ${Math.round(cooldownSec / 60)} minutes. Turn alerts off with LOG_ALERTS=false.`,
  ].filter((l, i, a) => !(l === '' && a[i - 1] === ''));

  const result = await sendOperationalEmail({
    to,
    subject: `[Crescelo] ${reason}`,
    text: lines.join('\n'),
  });
  if (result.simulated) {
    if (await claim('logalert:not-configured', 3600)) {
      logEvent({ level: 'warn', category: 'system', event: 'alerts.email_not_configured', message: 'An alert was due but no e-mail sending service is configured.' });
    }
  } else if (!result.success) {
    logEvent({ level: 'warn', category: 'system', event: 'alerts.email_failed', message: `Alert e-mail could not be sent: ${result.error || 'unknown error'}` });
  } else {
    logEvent({ category: 'system', event: 'alerts.email_sent', meta: { reason } });
  }
}

let installed = false;

/** Hooks alert evaluation onto every recorded error. Safe to call more than once. */
export function installLogAlerts(): void {
  if (installed || !alertsEnabled()) return;
  installed = true;
  onLogRow((row) => {
    if (!isAlertWorthy(row)) return;
    const run = () => evaluateAlert(row).catch(() => undefined);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { after } = require('next/server') as { after?: (cb: () => Promise<void> | void) => void };
      if (typeof after === 'function') {
        after(run);
        return;
      }
    } catch {
      // outside a request scope
    }
    void run();
  });
}

/** For tests. */
export function _resetAlertsForTesting(): void {
  installed = false;
  memory.clear();
}

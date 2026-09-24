import crypto from 'node:crypto';
import { getLogContext } from './context';
import { redactString, safeMeta } from './redact';
import { LOG_LEVELS, persistLogRows, purgeOldLogs, retentionDays, type LogLevel, type LogRow } from './store';

export type LogCategory =
  | 'request'
  | 'auth'
  | 'security'
  | 'db'
  | 'llm'
  | 'webhook'
  | 'billing'
  | 'booking'
  | 'knowledge'
  | 'voice'
  | 'client'
  | 'system'
  | 'audit'
  | 'cron'
  | 'admin';

export interface LogInput {
  level?: LogLevel;
  category: LogCategory;
  /** Stable machine-readable name, for example "auth.login_failed". */
  event: string;
  message?: string;
  status?: number;
  durationMs?: number;
  /** Structured details. Redacted and size-capped. Never put message text or request bodies here. */
  meta?: unknown;
  error?: unknown;
  /** Overrides the identity taken from the current request (used when there is no request, e.g. a failed login). */
  userId?: string;
  workspaceId?: string;
  role?: string;
  ip?: string;
}

const MAX_BUFFER = 1000;
const MAX_BATCH = 200;
let buffer: LogRow[] = [];
let flushing: Promise<void> | null = null;
let timerPending = false;
let listeners: Array<(rows: LogRow[]) => void> = [];

function minLevel(): number {
  const configured = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
  const idx = LOG_LEVELS.indexOf(configured);
  return idx === -1 ? 1 : idx;
}

/** Groups the same failure together: error name + the top stack frame without line numbers (or the digit-stripped message). */
export function fingerprintOf(name?: string | null, stack?: string | null, message?: string | null): string {
  const frame = (stack || '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('at ') && !l.includes('node_modules') && !l.includes('node:internal'));
  const basis = frame
    ? frame.replace(/:\d+:\d+\)?$/, '').replace(/\?[^ )]*/, '')
    : (message || '').replace(/\d+/g, '#').replace(/[0-9a-f]{8,}/gi, '#').slice(0, 120);
  return crypto.createHash('sha1').update(`${name || 'Error'}|${basis}`).digest('hex').slice(0, 16);
}

function describeError(error: unknown): { name: string; message: string; stack: string | null } {
  if (error instanceof Error) return { name: error.name || 'Error', message: error.message || '', stack: error.stack || null };
  if (typeof error === 'string') return { name: 'Error', message: error, stack: null };
  try {
    return { name: 'Error', message: JSON.stringify(error)?.slice(0, 500) ?? String(error), stack: null };
  } catch {
    return { name: 'Error', message: String(error), stack: null };
  }
}

function buildRow(input: LogInput): LogRow {
  const ctx = getLogContext();
  const level: LogLevel = input.level ?? (input.error ? 'error' : 'info');
  const row: LogRow = {
    ts: new Date(),
    level,
    category: input.category,
    event: input.event.slice(0, 120),
    message: input.message ? redactString(input.message) : null,
    requestId: ctx?.requestId ?? null,
    method: ctx?.method ?? null,
    route: ctx?.route ?? null,
    path: ctx?.path ?? null,
    status: input.status ?? null,
    durationMs: input.durationMs !== undefined ? Math.round(input.durationMs) : null,
    userId: input.userId ?? ctx?.userId ?? null,
    workspaceId: input.workspaceId ?? ctx?.workspaceId ?? null,
    role: input.role ?? ctx?.role ?? null,
    ip: input.ip ?? ctx?.ip ?? null,
    userAgent: ctx?.userAgent ?? null,
    deployment: ctx?.deployment ?? process.env.VERCEL_REGION ?? null,
    meta: safeMeta(input.meta),
  };
  if (input.error !== undefined) {
    const e = describeError(input.error);
    row.errorName = e.name.slice(0, 120);
    row.errorMessage = redactString(e.message, 1000);
    row.errorStack = e.stack ? redactString(e.stack, 4000) : null;
    row.fingerprint = fingerprintOf(e.name, e.stack, e.message);
    if (!row.message) row.message = row.errorMessage?.slice(0, 300) ?? null;
  }
  return row;
}

/** Writes everything buffered so far in batched INSERTs. Safe to call at any time; never throws. */
export async function flushLogs(): Promise<void> {
  if (flushing) {
    await flushing;
    if (buffer.length === 0) return;
  }
  flushing = (async () => {
    try {
      while (buffer.length > 0) {
        const batch = buffer.splice(0, MAX_BATCH);
        const result = await persistLogRows(batch);
        // Opportunistic clean-up (about 1 flush in 500) in case the daily cron has not run.
        if (result.where === 'postgres' && Math.random() < 0.002) void purgeOldLogs(retentionDays()).catch(() => undefined);
        for (const l of listeners) {
          try {
            l(batch);
          } catch {
            // listener errors must not affect logging
          }
        }
      }
    } catch {
      // persistLogRows already swallows its own failures
    } finally {
      flushing = null;
    }
  })();
  await flushing;
}

function scheduleFlush(): void {
  const ctx = getLogContext();
  if (ctx?.flushScheduled) return;
  if (ctx) ctx.flushScheduled = true;
  try {
    // Inside a request: run after the response has been sent, so logging never adds latency.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { after } = require('next/server') as { after?: (cb: () => Promise<void> | void) => void };
    if (typeof after === 'function') {
      after(() => flushLogs());
      return;
    }
  } catch {
    // not inside a Next.js request scope (scripts, tests, instrumentation): fall through
  }
  if (timerPending) return;
  timerPending = true;
  setTimeout(() => {
    timerPending = false;
    void flushLogs();
  }, 50).unref?.();
}

/** Records an event. Returns immediately; the write happens after the current response. */
export function logEvent(input: LogInput): void {
  try {
    const level: LogLevel = input.level ?? (input.error ? 'error' : 'info');
    if (LOG_LEVELS.indexOf(level) < minLevel()) return;
    const row = buildRow({ ...input, level });
    if (buffer.length >= MAX_BUFFER) buffer.shift(); // never grow without bound
    buffer.push(row);
    for (const l of rowListeners) {
      try {
        l(row);
      } catch {
        // ignore
      }
    }
    scheduleFlush();
  } catch {
    // logging must never throw into application code
  }
}

const rowListeners: Array<(row: LogRow) => void> = [];

/** Called for every recorded row (used by alerting). */
export function onLogRow(listener: (row: LogRow) => void): void {
  rowListeners.push(listener);
}

/** Called after each batch has been persisted (used by tests). */
export function onLogFlushed(listener: (rows: LogRow[]) => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export const log = {
  debug: (category: LogCategory, event: string, meta?: unknown, message?: string) =>
    logEvent({ level: 'debug', category, event, meta, message }),
  info: (category: LogCategory, event: string, meta?: unknown, message?: string) =>
    logEvent({ level: 'info', category, event, meta, message }),
  warn: (category: LogCategory, event: string, meta?: unknown, message?: string) =>
    logEvent({ level: 'warn', category, event, meta, message }),
  error: (category: LogCategory, event: string, error: unknown, meta?: unknown, message?: string) =>
    logEvent({ level: 'error', category, event, error, meta, message }),
  fatal: (category: LogCategory, event: string, error: unknown, meta?: unknown, message?: string) =>
    logEvent({ level: 'fatal', category, event, error, meta, message }),
};

/** For tests. */
export function _peekLogBufferForTesting(): LogRow[] {
  return buffer.slice();
}
export function _resetLoggerForTesting(): void {
  buffer = [];
  flushing = null;
  timerPending = false;
  listeners = [];
  rowListeners.length = 0;
}

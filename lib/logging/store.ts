import fs from 'node:fs';
import path from 'node:path';
import { getPostgresPool, isPostgresConfigured } from '@/lib/db/postgres';
import { resolveDataDir } from '@/lib/db/storage';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

export interface LogRow {
  ts: Date;
  level: LogLevel;
  category: string;
  event: string;
  message?: string | null;
  requestId?: string | null;
  method?: string | null;
  route?: string | null;
  path?: string | null;
  status?: number | null;
  durationMs?: number | null;
  userId?: string | null;
  workspaceId?: string | null;
  role?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  deployment?: string | null;
  errorName?: string | null;
  errorMessage?: string | null;
  errorStack?: string | null;
  fingerprint?: string | null;
  meta?: Record<string, unknown> | null;
}

/** Table name; overridable (tests use a scratch table). Validated because it is placed into SQL text. */
export function logTable(): string {
  const name = process.env.LOG_TABLE || 'kortex_logs';
  if (!/^[a-z_][a-z0-9_]{0,40}$/.test(name)) throw new Error('Invalid LOG_TABLE name');
  return name;
}

/** How many days of logs to keep (LOG_RETENTION_DAYS, default 30). */
export function retentionDays(): number {
  const n = Number(process.env.LOG_RETENTION_DAYS);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 30;
}

let ensuredTable: string | null = null;
let breakerUntil = 0;
let lastConsoleFallbackAt = 0;

/** Creates the table (idempotent). Mirrors supabase/schema-logs-v1.sql. */
export async function ensureLogTable(): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  const t = logTable();
  if (ensuredTable === t) return true;
  await pool.query({
    text: `
    CREATE TABLE IF NOT EXISTS ${t} (
      id BIGSERIAL PRIMARY KEY,
      ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      event TEXT NOT NULL,
      message TEXT,
      request_id TEXT,
      method TEXT,
      route TEXT,
      path TEXT,
      status INTEGER,
      duration_ms INTEGER,
      user_id TEXT,
      workspace_id TEXT,
      role TEXT,
      ip TEXT,
      user_agent TEXT,
      deployment TEXT,
      error_name TEXT,
      error_message TEXT,
      error_stack TEXT,
      fingerprint TEXT,
      meta JSONB
    );
    CREATE INDEX IF NOT EXISTS idx_${t}_ts ON ${t} (ts DESC);
    CREATE INDEX IF NOT EXISTS idx_${t}_level_ts ON ${t} (level, ts DESC);
    CREATE INDEX IF NOT EXISTS idx_${t}_user_ts ON ${t} (user_id, ts DESC);
    CREATE INDEX IF NOT EXISTS idx_${t}_workspace_ts ON ${t} (workspace_id, ts DESC);
    CREATE INDEX IF NOT EXISTS idx_${t}_request ON ${t} (request_id);
    CREATE INDEX IF NOT EXISTS idx_${t}_fingerprint_ts ON ${t} (fingerprint, ts DESC);
    ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${t}' AND policyname = 'Service role full access') THEN
          CREATE POLICY "Service role full access" ON ${t} FOR ALL TO service_role USING (true) WITH CHECK (true);
        END IF;
      END IF;
    END $$;`,
    query_timeout: 10_000,
  } as any);
  ensuredTable = t;
  return true;
}

const COLUMNS = [
  'ts', 'level', 'category', 'event', 'message', 'request_id', 'method', 'route', 'path', 'status', 'duration_ms',
  'user_id', 'workspace_id', 'role', 'ip', 'user_agent', 'deployment', 'error_name', 'error_message', 'error_stack',
  'fingerprint', 'meta',
] as const;

function rowValues(r: LogRow): unknown[] {
  return [
    r.ts, r.level, r.category, r.event, r.message ?? null, r.requestId ?? null, r.method ?? null, r.route ?? null,
    r.path ?? null, r.status ?? null, r.durationMs ?? null, r.userId ?? null, r.workspaceId ?? null, r.role ?? null,
    r.ip ?? null, r.userAgent ?? null, r.deployment ?? null, r.errorName ?? null, r.errorMessage ?? null,
    r.errorStack ?? null, r.fingerprint ?? null, r.meta ? JSON.stringify(r.meta) : null,
  ];
}

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function writeToConsole(rows: LogRow[], reason: string): void {
  // At most one line every 30 s about the store being unavailable, then the rows themselves for errors only.
  const now = Date.now();
  if (now - lastConsoleFallbackAt > 30_000) {
    lastConsoleFallbackAt = now;
    console.warn(`[Log] not persisted (${reason}); falling back to console for error rows`);
  }
  for (const r of rows) {
    if (r.level === 'error' || r.level === 'fatal') {
      process.stderr.write(`[Log:${r.level}] ${r.ts.toISOString()} ${r.category}/${r.event} ${r.message ?? ''} req=${r.requestId ?? '-'} user=${r.userId ?? '-'}\n`);
    }
  }
}

function writeToFile(rows: LogRow[]): boolean {
  if (isServerless()) return false; // read-only filesystem
  try {
    const dir = path.join(resolveDataDir(), 'logs');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${new Date().toISOString().slice(0, 10)}.ndjson`);
    fs.appendFileSync(file, rows.map((r) => JSON.stringify({ ...r, ts: r.ts.toISOString() })).join('\n') + '\n');
    return true;
  } catch {
    return false;
  }
}

/**
 * Persists a batch. Never throws: a logging failure must not affect the request that produced it.
 * After a failed insert the database is skipped for 60 s (circuit breaker) so a broken log store cannot slow anything down.
 */
export async function persistLogRows(rows: LogRow[]): Promise<{ stored: number; where: 'postgres' | 'file' | 'console' }> {
  if (rows.length === 0) return { stored: 0, where: 'console' };

  if (isPostgresConfigured() && Date.now() >= breakerUntil) {
    try {
      const pool = getPostgresPool();
      if (pool) {
        await ensureLogTable();
        const t = logTable();
        const width = COLUMNS.length;
        const values: unknown[] = [];
        const tuples = rows.map((r, i) => {
          values.push(...rowValues(r));
          return `(${COLUMNS.map((_, c) => `$${i * width + c + 1}`).join(',')})`;
        });
        await pool.query({
          text: `INSERT INTO ${t} (${COLUMNS.join(',')}) VALUES ${tuples.join(',')}`,
          values,
          query_timeout: 5_000,
        } as any);
        return { stored: rows.length, where: 'postgres' };
      }
    } catch (err) {
      breakerUntil = Date.now() + 60_000;
      ensuredTable = null;
      writeToConsole(rows, `database error: ${(err as Error)?.message?.slice(0, 120)}`);
      return { stored: 0, where: 'console' };
    }
  }

  if (!isPostgresConfigured() && writeToFile(rows)) return { stored: rows.length, where: 'file' };
  writeToConsole(rows, isPostgresConfigured() ? 'circuit breaker open' : 'no log store configured');
  return { stored: 0, where: 'console' };
}

/** Deletes rows older than `days` in bounded batches. Returns how many were removed. */
export async function purgeOldLogs(days: number, batch = 5000, maxBatches = 20): Promise<number> {
  const pool = getPostgresPool();
  if (!pool || !Number.isFinite(days) || days < 1) return 0;
  await ensureLogTable();
  const t = logTable();
  let total = 0;
  for (let i = 0; i < maxBatches; i++) {
    const res = await pool.query({
      text: `DELETE FROM ${t} WHERE ctid IN (SELECT ctid FROM ${t} WHERE ts < NOW() - ($1 || ' days')::interval LIMIT $2)`,
      values: [String(Math.floor(days)), batch],
      query_timeout: 20_000,
    } as any);
    total += res.rowCount ?? 0;
    if ((res.rowCount ?? 0) < batch) break;
  }
  return total;
}

/** For tests. */
export function _resetLogStoreForTesting(): void {
  ensuredTable = null;
  breakerUntil = 0;
  lastConsoleFallbackAt = 0;
}

import fs from 'node:fs';
import path from 'node:path';
import { getPostgresPool, isPostgresConfigured } from '@/lib/db/postgres';
import { resolveDataDir } from '@/lib/db/storage';
import { ensureLogTable, logTable, LOG_LEVELS } from './store';

export interface LogFilters {
  from?: Date;
  to?: Date;
  /** Only these levels. */
  levels?: string[];
  categories?: string[];
  /** Free text over message, event, route, path, error message. */
  q?: string;
  userId?: string;
  workspaceId?: string;
  requestId?: string;
  route?: string;
  event?: string;
  fingerprint?: string;
  statusMin?: number;
  statusMax?: number;
  /** Keyset cursor: rows strictly older than this (ts, id). */
  before?: { ts: string; id: string };
  order?: 'desc' | 'asc';
  limit?: number;
}

export interface LogEntry {
  id: string;
  ts: string;
  level: string;
  category: string;
  event: string;
  message: string | null;
  requestId: string | null;
  method: string | null;
  route: string | null;
  path: string | null;
  status: number | null;
  durationMs: number | null;
  userId: string | null;
  workspaceId: string | null;
  role: string | null;
  ip: string | null;
  userAgent: string | null;
  deployment: string | null;
  errorName: string | null;
  errorMessage: string | null;
  errorStack: string | null;
  fingerprint: string | null;
  meta: Record<string, unknown> | null;
}

export const MAX_PAGE = 200;

const CATEGORY_RE = /^[a-z_]{1,30}$/;
const SAFE_TEXT = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined);

/** Escapes LIKE wildcards so user text is matched literally. */
export function likePattern(input: string): string {
  return `%${input.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/** Validates and normalises query-string filters. Unknown or malformed values are dropped, never passed on. */
export function parseFilters(params: URLSearchParams): LogFilters {
  const f: LogFilters = {};
  const date = (name: string) => {
    const v = params.get(name);
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };
  f.from = date('from');
  f.to = date('to');
  const levels = (params.get('levels') || '').split(',').map((s) => s.trim()).filter((s) => (LOG_LEVELS as string[]).includes(s));
  if (levels.length) f.levels = levels;
  const cats = (params.get('categories') || '').split(',').map((s) => s.trim()).filter((s) => CATEGORY_RE.test(s));
  if (cats.length) f.categories = cats.slice(0, 20);
  f.q = SAFE_TEXT(params.get('q'), 100);
  f.userId = SAFE_TEXT(params.get('userId'), 120);
  f.workspaceId = SAFE_TEXT(params.get('workspaceId'), 120);
  f.requestId = SAFE_TEXT(params.get('requestId'), 80);
  f.route = SAFE_TEXT(params.get('route'), 200);
  f.event = SAFE_TEXT(params.get('event'), 120);
  f.fingerprint = SAFE_TEXT(params.get('fingerprint'), 40);
  const int = (name: string) => {
    const n = Number(params.get(name));
    return params.get(name) && Number.isInteger(n) && n >= 100 && n <= 599 ? n : undefined;
  };
  f.statusMin = int('statusMin');
  f.statusMax = int('statusMax');
  const cursor = params.get('before');
  if (cursor) {
    const [ts, id] = cursor.split('|');
    if (ts && id && !Number.isNaN(new Date(ts).getTime()) && /^\d{1,18}$/.test(id)) f.before = { ts, id };
  }
  f.order = params.get('order') === 'asc' ? 'asc' : 'desc';
  const limit = Number(params.get('limit'));
  f.limit = Number.isInteger(limit) && limit >= 1 ? Math.min(limit, MAX_PAGE) : 50;
  return f;
}

/** Builds a parameterised WHERE clause. Values are only ever passed as parameters, never concatenated. */
export function buildWhere(f: LogFilters): { sql: string; params: unknown[] } {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (fragment: string, value: unknown) => {
    params.push(value);
    where.push(fragment.replace('?', `$${params.length}`));
  };

  if (f.from) add('ts >= ?', f.from);
  if (f.to) add('ts <= ?', f.to);
  if (f.levels?.length) add('level = ANY(?)', f.levels);
  if (f.categories?.length) add('category = ANY(?)', f.categories);
  if (f.userId) add('user_id = ?', f.userId);
  if (f.workspaceId) add('workspace_id = ?', f.workspaceId);
  if (f.requestId) add('request_id = ?', f.requestId);
  if (f.route) add('route = ?', f.route);
  if (f.event) add('event = ?', f.event);
  if (f.fingerprint) add('fingerprint = ?', f.fingerprint);
  if (f.statusMin !== undefined) add('status >= ?', f.statusMin);
  if (f.statusMax !== undefined) add('status <= ?', f.statusMax);
  if (f.q) {
    params.push(likePattern(f.q));
    const n = params.length;
    where.push(
      `(message ILIKE $${n} ESCAPE '\\' OR event ILIKE $${n} ESCAPE '\\' OR route ILIKE $${n} ESCAPE '\\' OR path ILIKE $${n} ESCAPE '\\' OR error_message ILIKE $${n} ESCAPE '\\' OR user_id ILIKE $${n} ESCAPE '\\')`
    );
  }
  if (f.before) {
    params.push(f.before.ts, f.before.id);
    const a = params.length - 1;
    where.push(f.order === 'asc' ? `(ts, id) > ($${a}::timestamptz, $${a + 1}::bigint)` : `(ts, id) < ($${a}::timestamptz, $${a + 1}::bigint)`);
  }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

function toEntry(r: Record<string, any>): LogEntry {
  return {
    id: String(r.id),
    ts: new Date(r.ts).toISOString(),
    level: r.level,
    category: r.category,
    event: r.event,
    message: r.message ?? null,
    requestId: r.request_id ?? null,
    method: r.method ?? null,
    route: r.route ?? null,
    path: r.path ?? null,
    status: r.status ?? null,
    durationMs: r.duration_ms ?? null,
    userId: r.user_id ?? null,
    workspaceId: r.workspace_id ?? null,
    role: r.role ?? null,
    ip: r.ip ?? null,
    userAgent: r.user_agent ?? null,
    deployment: r.deployment ?? null,
    errorName: r.error_name ?? null,
    errorMessage: r.error_message ?? null,
    errorStack: r.error_stack ?? null,
    fingerprint: r.fingerprint ?? null,
    meta: r.meta ?? null,
  };
}

/* ------------------------- local file store (development without a database) ------------------------- */

function readFileRows(): LogEntry[] {
  try {
    const dir = path.join(resolveDataDir(), 'logs');
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ndjson')).sort().slice(-7);
    const rows: LogEntry[] = [];
    let id = 0;
    for (const file of files) {
      for (const line of fs.readFileSync(path.join(dir, file), 'utf8').split('\n')) {
        if (!line.trim()) continue;
        try {
          const r = JSON.parse(line);
          rows.push({ id: String(++id), ...r, ts: new Date(r.ts).toISOString() });
        } catch {
          // skip a corrupt line
        }
      }
    }
    return rows;
  } catch {
    return [];
  }
}

function matchesFile(e: LogEntry, f: LogFilters): boolean {
  const t = new Date(e.ts).getTime();
  if (f.from && t < f.from.getTime()) return false;
  if (f.to && t > f.to.getTime()) return false;
  if (f.levels?.length && !f.levels.includes(e.level)) return false;
  if (f.categories?.length && !f.categories.includes(e.category)) return false;
  if (f.userId && e.userId !== f.userId) return false;
  if (f.workspaceId && e.workspaceId !== f.workspaceId) return false;
  if (f.requestId && e.requestId !== f.requestId) return false;
  if (f.route && e.route !== f.route) return false;
  if (f.event && e.event !== f.event) return false;
  if (f.fingerprint && e.fingerprint !== f.fingerprint) return false;
  if (f.statusMin !== undefined && (e.status ?? 0) < f.statusMin) return false;
  if (f.statusMax !== undefined && (e.status ?? 999) > f.statusMax) return false;
  if (f.q) {
    const needle = f.q.toLowerCase();
    const hay = [e.message, e.event, e.route, e.path, e.errorMessage, e.userId].filter(Boolean).join(' ').toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

/* ------------------------------------------- queries ------------------------------------------- */

export async function queryLogs(f: LogFilters): Promise<{ entries: LogEntry[]; nextCursor: string | null }> {
  const limit = Math.min(f.limit ?? 50, MAX_PAGE);
  const order = f.order === 'asc' ? 'ASC' : 'DESC';

  if (!isPostgresConfigured() || !getPostgresPool()) {
    const all = readFileRows().filter((e) => matchesFile(e, f));
    all.sort((a, b) => (order === 'DESC' ? b.ts.localeCompare(a.ts) : a.ts.localeCompare(b.ts)));
    const page = all.slice(0, limit);
    return { entries: page, nextCursor: null };
  }

  await ensureLogTable();
  const pool = getPostgresPool()!;
  const { sql, params } = buildWhere(f);
  const res = await pool.query({
    text: `SELECT * FROM ${logTable()} ${sql} ORDER BY ts ${order}, id ${order} LIMIT ${limit + 1}`,
    values: params,
    query_timeout: 15_000,
  } as any);
  const rows = res.rows.slice(0, limit).map(toEntry);
  const more = res.rows.length > limit;
  const last = rows[rows.length - 1];
  return { entries: rows, nextCursor: more && last ? `${last.ts}|${last.id}` : null };
}

export interface LogSummary {
  hours: number;
  totals: { requests: number; errors: number; warnings: number; serverErrors: number; activeUsers: number; activeUsersHour: number };
  byHour: Array<{ hour: string; errors: number; warnings: number; requests: number }>;
  topFailingRoutes: Array<{ route: string; method: string | null; failures: number; lastSeen: string }>;
  errorGroups: Array<{ fingerprint: string; count: number; firstSeen: string; lastSeen: string; event: string; category: string; message: string | null; route: string | null }>;
  slowestRoutes: Array<{ route: string; method: string | null; requests: number; p50: number; p95: number }>;
  storage: { rows: number; bytes: number; oldest: string | null };
}

export async function summarizeLogs(hours = 24): Promise<LogSummary> {
  const h = Math.min(Math.max(Math.floor(hours) || 24, 1), 24 * 30);
  const empty: LogSummary = {
    hours: h,
    totals: { requests: 0, errors: 0, warnings: 0, serverErrors: 0, activeUsers: 0, activeUsersHour: 0 },
    byHour: [],
    topFailingRoutes: [],
    errorGroups: [],
    slowestRoutes: [],
    storage: { rows: 0, bytes: 0, oldest: null },
  };

  if (!isPostgresConfigured() || !getPostgresPool()) {
    const since = Date.now() - h * 3_600_000;
    const rows = readFileRows().filter((e) => new Date(e.ts).getTime() >= since);
    empty.totals.requests = rows.filter((e) => e.event === 'http.request').length;
    empty.totals.errors = rows.filter((e) => e.level === 'error' || e.level === 'fatal').length;
    empty.totals.warnings = rows.filter((e) => e.level === 'warn').length;
    empty.totals.serverErrors = rows.filter((e) => (e.status ?? 0) >= 500).length;
    empty.totals.activeUsers = new Set(rows.map((e) => e.userId).filter(Boolean)).size;
    return empty;
  }

  await ensureLogTable();
  const pool = getPostgresPool()!;
  const t = logTable();
  const q = (text: string, values: unknown[] = []) => pool.query({ text, values, query_timeout: 15_000 } as any);
  const since = `NOW() - ($1 || ' hours')::interval`;
  const hs = String(h);

  const [totals, byHour, failing, groups, slow, storage] = await Promise.all([
    q(
      `SELECT
         COUNT(*) FILTER (WHERE event = 'http.request') AS requests,
         COUNT(*) FILTER (WHERE level IN ('error','fatal')) AS errors,
         COUNT(*) FILTER (WHERE level = 'warn') AS warnings,
         COUNT(*) FILTER (WHERE status >= 500) AS server_errors,
         COUNT(DISTINCT user_id) AS active_users,
         COUNT(DISTINCT user_id) FILTER (WHERE ts >= NOW() - interval '1 hour') AS active_users_hour
       FROM ${t} WHERE ts >= ${since}`,
      [hs]
    ),
    q(
      `SELECT date_trunc('hour', ts) AS hour,
              COUNT(*) FILTER (WHERE level IN ('error','fatal')) AS errors,
              COUNT(*) FILTER (WHERE level = 'warn') AS warnings,
              COUNT(*) FILTER (WHERE event = 'http.request') AS requests
       FROM ${t} WHERE ts >= ${since} GROUP BY 1 ORDER BY 1`,
      [hs]
    ),
    q(
      `SELECT route, method, COUNT(*) AS failures, MAX(ts) AS last_seen
       FROM ${t} WHERE ts >= ${since} AND event = 'http.request' AND status >= 500 AND route IS NOT NULL
       GROUP BY route, method ORDER BY failures DESC LIMIT 10`,
      [hs]
    ),
    q(
      `SELECT fingerprint, COUNT(*) AS count, MIN(ts) AS first_seen, MAX(ts) AS last_seen,
              (ARRAY_AGG(event ORDER BY ts DESC))[1] AS event, (ARRAY_AGG(category ORDER BY ts DESC))[1] AS category,
              (ARRAY_AGG(COALESCE(error_message, message) ORDER BY ts DESC))[1] AS message, (ARRAY_AGG(route ORDER BY ts DESC))[1] AS route
       FROM ${t} WHERE ts >= ${since} AND fingerprint IS NOT NULL AND level IN ('error','fatal')
       GROUP BY fingerprint ORDER BY count DESC LIMIT 15`,
      [hs]
    ),
    q(
      `SELECT route, method, COUNT(*) AS requests,
              percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_ms) AS p50,
              percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95
       FROM ${t} WHERE ts >= ${since} AND event = 'http.request' AND duration_ms IS NOT NULL AND route IS NOT NULL
       GROUP BY route, method HAVING COUNT(*) >= 5 ORDER BY p95 DESC LIMIT 10`,
      [hs]
    ),
    q(`SELECT (SELECT reltuples::bigint FROM pg_class WHERE relname = $1) AS rows, pg_total_relation_size($2::regclass) AS bytes, (SELECT MIN(ts) FROM ${t}) AS oldest`, [t, t]),
  ]);

  const n = (v: unknown) => Number(v) || 0;
  const tr = totals.rows[0] || {};
  return {
    hours: h,
    totals: {
      requests: n(tr.requests),
      errors: n(tr.errors),
      warnings: n(tr.warnings),
      serverErrors: n(tr.server_errors),
      activeUsers: n(tr.active_users),
      activeUsersHour: n(tr.active_users_hour),
    },
    byHour: byHour.rows.map((r: any) => ({ hour: new Date(r.hour).toISOString(), errors: n(r.errors), warnings: n(r.warnings), requests: n(r.requests) })),
    topFailingRoutes: failing.rows.map((r: any) => ({ route: r.route, method: r.method, failures: n(r.failures), lastSeen: new Date(r.last_seen).toISOString() })),
    errorGroups: groups.rows.map((r: any) => ({
      fingerprint: r.fingerprint,
      count: n(r.count),
      firstSeen: new Date(r.first_seen).toISOString(),
      lastSeen: new Date(r.last_seen).toISOString(),
      event: r.event,
      category: r.category,
      message: r.message ?? null,
      route: r.route ?? null,
    })),
    slowestRoutes: slow.rows.map((r: any) => ({ route: r.route, method: r.method, requests: n(r.requests), p50: Math.round(n(r.p50)), p95: Math.round(n(r.p95)) })),
    storage: {
      rows: Math.max(0, n(storage.rows[0]?.rows)),
      bytes: n(storage.rows[0]?.bytes),
      oldest: storage.rows[0]?.oldest ? new Date(storage.rows[0].oldest).toISOString() : null,
    },
  };
}

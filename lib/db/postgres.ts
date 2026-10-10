import { Pool } from 'pg';
import { mergeState } from './state-merge';

/** Records a database event in the system log. Lazy require: the log store imports this module. */
function dbLog(input: Record<string, unknown>): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('../logging/logger') as typeof import('../logging/logger')).logEvent({ category: 'db', ...(input as any) });
  } catch {
    // logging must never affect database access
  }
}

let pgPoolInstance: Pool | null = null;
let isSchemaInitialized = false;
let isPostgresDisabledUntil = 0;

export function isConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const code = err.code ? String(err.code) : '';

  if (code.startsWith('08') || code.startsWith('57P')) {
    return true;
  }

  if (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'EPIPE' ||
    code === 'ENOTFOUND'
  ) {
    return true;
  }

  if (
    msg.includes('connection terminated') ||
    msg.includes('connection refused') ||
    msg.includes('connection timeout') ||
    msg.includes('connection closed') ||
    msg.includes('client has encountered a connection error') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout')
  ) {
    return true;
  }

  return false;
}

export function disablePostgresTemporarily(durationMs = 60000): void {
  isPostgresDisabledUntil = Date.now() + durationMs;
  dbLog({ level: 'error', event: 'db.postgres_unavailable', message: 'Database connection failed; pausing database use', meta: { pausedForMs: durationMs } });
  if (pgPoolInstance) {
    try {
      pgPoolInstance.end().catch(() => {});
    } catch {}
    pgPoolInstance = null;
  }
  isSchemaInitialized = false;
}

export function disablePostgresIfConnectionError(err: any, durationMs = 60000): boolean {
  if (isConnectionError(err)) {
    disablePostgresTemporarily(durationMs);
    return true;
  }
  return false;
}

export function getPostgresUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )?.trim();
}

export function isPostgresConfigured(): boolean {
  if (Date.now() < isPostgresDisabledUntil) return false;
  const url = getPostgresUrl();
  if (!url) return false;
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    return false;
  }
  return Boolean(url.startsWith('postgres://') || url.startsWith('postgresql://'));
}

export type PostgresTlsMode = 'off' | 'encrypted' | 'verified';

const PRIVATE_HOST = /^(localhost|127\.\d+\.\d+\.\d+|::1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|[^.]+)$/i;

function isPrivateHost(hostname: string): boolean {
  return PRIVATE_HOST.test(hostname);
}

/**
 * Decides how the connection to Postgres is protected, and returns the connection string with the
 * ssl query parameters removed. (node-postgres lets `sslmode` in the URL override the `ssl` option and
 * silently turns "require" into full certificate checking, so the mode is resolved here instead.)
 *
 *   sslmode=disable                       -> no TLS (only acceptable on a private network)
 *   DATABASE_SSL_CA set (PEM)             -> TLS, server certificate verified against that CA
 *   sslmode=verify-full / verify-ca       -> TLS, certificate verified against the system CAs
 *   anything else (require, unset)        -> TLS, certificate NOT verified (encrypted, but can be impersonated)
 */
export function resolvePostgresConnection(rawUrl: string): {
  connectionString: string;
  ssl: false | { rejectUnauthorized: boolean; ca?: string };
  mode: PostgresTlsMode;
  host: string;
} {
  let host = '';
  let sslmode = '';
  let cleaned = rawUrl;
  try {
    const u = new URL(rawUrl);
    host = u.hostname;
    sslmode = (u.searchParams.get('sslmode') || (u.searchParams.get('ssl') === 'false' ? 'disable' : '')).toLowerCase();
    for (const key of ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat']) u.searchParams.delete(key);
    cleaned = u.toString();
  } catch {
    sslmode = /sslmode=disable|ssl=false/i.test(rawUrl) ? 'disable' : '';
  }

  const ca = (process.env.DATABASE_SSL_CA || '').replace(/\\n/g, '\n').trim();
  if (sslmode === 'disable' || (!sslmode && host && isPrivateHost(host) && !ca)) {
    return { connectionString: cleaned, ssl: false, mode: 'off', host };
  }
  if (ca) return { connectionString: cleaned, ssl: { rejectUnauthorized: true, ca }, mode: 'verified', host };
  if (sslmode === 'verify-full' || sslmode === 'verify-ca') {
    return { connectionString: cleaned, ssl: { rejectUnauthorized: true }, mode: 'verified', host };
  }
  return { connectionString: cleaned, ssl: { rejectUnauthorized: false }, mode: 'encrypted', host };
}

let warnedInsecureTransport = false;

export function getPostgresPool(): Pool | null {
  if (!isPostgresConfigured()) return null;
  if (pgPoolInstance) return pgPoolInstance;

  const conn = resolvePostgresConnection(getPostgresUrl()!);
  const remote = Boolean(conn.host) && !isPrivateHost(conn.host);

  if (conn.mode === 'off' && remote) {
    // Password and all customer data would cross the internet in clear text.
    if (process.env.DATABASE_REQUIRE_TLS === 'true') {
      console.error('[Postgres] DATABASE_REQUIRE_TLS is set and the connection has TLS disabled: refusing to connect.');
      return null;
    }
    if (!warnedInsecureTransport) {
      warnedInsecureTransport = true;
      console.error(
        '[Postgres] SECURITY: connecting to a remote database WITHOUT TLS. Enable TLS on the server, then set DATABASE_URL to sslmode=require and DATABASE_REQUIRE_TLS=true.'
      );
    }
  }

  const isServerless =
    Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  // Every serverless instance holds its own pool, so keep it small: many instances x a large pool would
  // exhaust the server's connection limit (100 by default) and take the database down for everyone.
  const configuredMax = Number(process.env.DATABASE_POOL_MAX);
  const max = Number.isFinite(configuredMax) && configuredMax > 0 ? Math.min(configuredMax, 20) : isServerless ? 3 : 10;

  pgPoolInstance = new Pool({
    connectionString: conn.connectionString,
    ssl: conn.ssl,
    max,
    idleTimeoutMillis: isServerless ? 10_000 : 30_000,
    connectionTimeoutMillis: 5000,
    keepAlive: true,
    allowExitOnIdle: true,
    application_name: 'crescelo',
    // A stuck query must not hold a connection (and a request) forever.
    statement_timeout: 30_000,
    query_timeout: 35_000,
    idle_in_transaction_session_timeout: 30_000,
  });

  pgPoolInstance.on('error', (err) => {
    console.warn('[Postgres Pool] Unexpected error on idle client:', err?.message || err);
    if (isConnectionError(err)) {
      disablePostgresTemporarily();
    }
  });

  return pgPoolInstance;
}

export async function ensurePostgresSchema(): Promise<boolean> {
  if (isSchemaInitialized) return true;
  const pool = getPostgresPool();
  if (!pool) return false;

  try {
    // Every cold serverless instance lands here. The DDL below takes a table lock (ALTER ... ROW LEVEL SECURITY) and costs a round
    // trip, so it only runs when the table is really missing.
    const present = await pool.query(`SELECT to_regclass('public.kortex_app_state') AS r`);
    if (present.rows[0]?.r) {
      isSchemaInitialized = true;
      return true;
    }
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kortex_app_state (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        chunks JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE kortex_app_state ENABLE ROW LEVEL SECURITY;
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = 'kortex_app_state'
              AND policyname = 'Service role has full access to app state'
          ) THEN
            CREATE POLICY "Service role has full access to app state"
              ON kortex_app_state
              FOR ALL
              TO service_role
              USING (true)
              WITH CHECK (true);
          END IF;
        END IF;
      END $$;
    `);
    isSchemaInitialized = true;
    return true;
  } catch (err: any) {
    console.warn('[Postgres Schema] Could not initialize kortex_app_state table:', err?.message || err);
    if (isConnectionError(err)) {
      disablePostgresTemporarily();
    }
    return false;
  }
}

export async function fetchPostgresStateUpdatedAt(): Promise<string | null> {
  const pool = getPostgresPool();
  if (!pool) return null;

  try {
    const initialized = await ensurePostgresSchema();
    if (!initialized) return null;
    const result = await pool.query(
      'SELECT updated_at FROM kortex_app_state WHERE id = $1 LIMIT 1',
      ['default']
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return row.updated_at ? new Date(row.updated_at).toISOString() : null;
  } catch (err: any) {
    console.warn('[Postgres] Exception fetching state updated_at:', err?.message || err);
    if (isConnectionError(err)) {
      disablePostgresTemporarily();
    }
    return null;
  }
}

export type CloudStateResult =
  | { status: 'found'; data: any }
  | { status: 'not_found' }
  | { status: 'error'; error: string };

export async function fetchPostgresState(): Promise<CloudStateResult> {
  const pool = getPostgresPool();
  if (!pool) return { status: 'error', error: 'Postgres not configured' };

  try {
    const initialized = await ensurePostgresSchema();
    if (!initialized) return { status: 'error', error: 'Postgres schema initialization failed' };
    const readStarted = performance.now();
    const result = await pool.query(
      'SELECT data FROM kortex_app_state WHERE id = $1 LIMIT 1',
      ['default']
    );
    const readMs = performance.now() - readStarted;
    if (readMs > 500) dbLog({ level: 'warn', event: 'db.slow_state_read', durationMs: readMs });
    if (result.rows.length === 0) return { status: 'not_found' };
    return { status: 'found', data: result.rows[0].data || {} };
  } catch (err: any) {
    console.warn('[Postgres] Exception fetching state:', err?.message || err);
    if (isConnectionError(err)) {
      disablePostgresTemporarily();
    }
    return { status: 'error', error: err?.message || String(err) };
  }
}

/** The six collections that live in their own tables in relational mode; the copies inside the state row are frozen leftovers. */
const RELATIONAL_KEYS = ['conversations', 'messages', 'leads', 'appointments', 'notifications', 'unansweredQueries'] as const;

const relationalMode = () => process.env.DB_RELATIONAL_MODE === 'true';

/**
 * The part of the in-memory state that is stored in the state row: no vectors, the log-like lists cut to their newest
 * entries and, in relational mode, without the collections that have their own tables. Applying it twice changes nothing.
 */
export function toCloudPayload(state: any): Record<string, any> {
  const {
    chunks: _chunks,
    pageViews: rawPageViews,
    messages: rawMessages,
    auditLogs: rawAuditLogs,
    notifications: rawNotifications,
    ...transactional
  } = state || {};

  const cloudData: Record<string, any> = {
    ...transactional,
    messages: Array.isArray(rawMessages) ? rawMessages.slice(-100) : [],
    auditLogs: Array.isArray(rawAuditLogs) ? rawAuditLogs.slice(-50) : [],
    notifications: Array.isArray(rawNotifications) ? rawNotifications.slice(-50) : [],
    pageViews: Array.isArray(rawPageViews) ? rawPageViews.slice(0, 50) : [],
  };
  if (relationalMode()) {
    for (const key of RELATIONAL_KEYS) delete cloudData[key];
  }
  return cloudData;
}

export interface PersistStateOptions {
  /** The payload this instance last loaded or saved (see lib/db/state-merge.ts). Null or absent: only add and update, never remove. */
  base?: Record<string, any> | null;
}

export interface PersistStateResult {
  ok: boolean;
  updatedAt?: string;
  /** What is stored now: this instance's changes on top of what the other instances had saved. */
  merged?: Record<string, any>;
  /** True when other instances had saved something this one did not have. */
  changedByOthers?: boolean;
}

/** The minimum of a pg client this needs (so the transaction can be tested without a database). */
export interface StateClient {
  query(text: string, values?: unknown[]): Promise<{ rows: any[] }>;
}

/**
 * Saves the state row without undoing other instances' saves: inside one transaction the row is locked and read, this
 * instance's changes (payload compared with base) are applied on top of what is stored, and the result is written.
 * Two instances saving at the same moment wait for each other on the row lock, so neither works from a stale read.
 */
export async function writeStateMerged(client: StateClient, payload: Record<string, any>, base: Record<string, any> | null | undefined): Promise<PersistStateResult> {
  const relational = relationalMode();
  await client.query('BEGIN');
  try {
    await client.query("SET LOCAL lock_timeout = '10s'");
    const current = await client.query('SELECT data FROM kortex_app_state WHERE id = $1 FOR UPDATE', ['default']);

    let toWrite = payload;
    let changedByOthers = false;
    if (current.rows.length > 0 && current.rows[0].data && typeof current.rows[0].data === 'object') {
      const stored = { ...current.rows[0].data };
      if (relational) for (const key of RELATIONAL_KEYS) delete stored[key];
      const result = mergeState(base ?? null, payload, stored);
      toWrite = result.merged;
      changedByOthers = result.changedByOthers;
    }

    const result = relational
      ? // Conversations, messages, leads, appointments, notifications and unanswered questions live in their own tables. The state
        // row carries only settings, assistants, workspaces and the like; whatever it already holds for those six collections is
        // kept as it is (a frozen copy that makes switching back possible) instead of being sent again on every save.
        await client.query(
          `INSERT INTO kortex_app_state (id, data, updated_at)
           VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (id) DO UPDATE
           SET data = EXCLUDED.data || jsonb_build_object(
                 'conversations', COALESCE(kortex_app_state.data->'conversations', '[]'::jsonb),
                 'messages', COALESCE(kortex_app_state.data->'messages', '[]'::jsonb),
                 'leads', COALESCE(kortex_app_state.data->'leads', '[]'::jsonb),
                 'appointments', COALESCE(kortex_app_state.data->'appointments', '[]'::jsonb),
                 'notifications', COALESCE(kortex_app_state.data->'notifications', '[]'::jsonb),
                 'unansweredQueries', COALESCE(kortex_app_state.data->'unansweredQueries', '[]'::jsonb)
               ),
               updated_at = NOW()
           RETURNING updated_at`,
          ['default', JSON.stringify(toWrite)]
        )
      : await client.query(
          `INSERT INTO kortex_app_state (id, data, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (id) DO UPDATE
           SET data = EXCLUDED.data, updated_at = NOW()
           RETURNING updated_at`,
          ['default', JSON.stringify(toWrite)]
        );
    await client.query('COMMIT');
    const updatedAt = result.rows[0]?.updated_at ? new Date(result.rows[0].updated_at).toISOString() : new Date().toISOString();
    return { ok: true, updatedAt, merged: toWrite, changedByOthers };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  }
}

export async function persistPostgresState(state: any, options: PersistStateOptions = {}): Promise<PersistStateResult> {
  const pool = getPostgresPool();
  if (!pool) return { ok: false };

  try {
    const initialized = await ensurePostgresSchema();
    if (!initialized) return { ok: false };
    const payload = toCloudPayload(state);

    const writeStarted = performance.now();
    const client = await pool.connect(); // the transaction and its row lock belong to one connection
    let result: PersistStateResult;
    try {
      result = await writeStateMerged(client, payload, options.base);
    } finally {
      client.release();
    }
    const writeMs = performance.now() - writeStarted;
    if (writeMs > 500) {
      dbLog({ level: 'warn', event: 'db.slow_state_write', durationMs: writeMs, meta: { bytes: JSON.stringify(result.merged || payload).length } });
    }
    if (result.changedByOthers) {
      dbLog({ level: 'info', event: 'db.state_merged', message: 'A save was merged with changes another server instance had saved in the meantime.' });
    }
    return result;
  } catch (err: any) {
    console.warn('[Postgres] Exception persisting state:', err?.message || err);
    if (isConnectionError(err)) {
      disablePostgresTemporarily();
    }
    return { ok: false };
  }
}

export async function fetchPostgresChunks(): Promise<any[] | null> {
  const pool = getPostgresPool();
  if (!pool) return null;

  try {
    await ensurePostgresSchema();
    const result = await pool.query(
      'SELECT chunks FROM kortex_app_state WHERE id = $1 LIMIT 1',
      ['default']
    );
    if (result.rows.length === 0) return null;
    const chunks = result.rows[0].chunks;
    return Array.isArray(chunks) ? chunks : null;
  } catch (err: any) {
    console.warn('[Postgres] Exception fetching chunks:', err?.message || err);
    return null;
  }
}

export async function persistPostgresChunks(chunks: any[]): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;

  try {
    await ensurePostgresSchema();
    await pool.query(
      `UPDATE kortex_app_state
       SET chunks = $1, updated_at = NOW()
       WHERE id = 'default'`,
      [JSON.stringify(chunks)]
    );
    return true;
  } catch (err: any) {
    console.warn('[Postgres] Exception persisting chunks:', err?.message || err);
    return false;
  }
}

import { Pool } from 'pg';

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

export function getPostgresPool(): Pool | null {
  if (!isPostgresConfigured()) return null;
  if (pgPoolInstance) return pgPoolInstance;

  const connectionString = getPostgresUrl()!;
  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');

  pgPoolInstance = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 1500,
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kortex_app_state (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        chunks JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
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
    const result = await pool.query(
      'SELECT data FROM kortex_app_state WHERE id = $1 LIMIT 1',
      ['default']
    );
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

export async function persistPostgresState(state: any): Promise<{ ok: boolean; updatedAt?: string }> {
  const pool = getPostgresPool();
  if (!pool) return { ok: false };

  try {
    const initialized = await ensurePostgresSchema();
    if (!initialized) return { ok: false };
    const {
      chunks: _chunks,
      pageViews: rawPageViews,
      messages: rawMessages,
      auditLogs: rawAuditLogs,
      notifications: rawNotifications,
      ...transactional
    } = state;

    const cloudPageViews = Array.isArray(rawPageViews) ? rawPageViews.slice(0, 50) : [];
    const cloudMessages = Array.isArray(rawMessages) ? rawMessages.slice(-100) : [];
    const cloudAuditLogs = Array.isArray(rawAuditLogs) ? rawAuditLogs.slice(-50) : [];
    const cloudNotifications = Array.isArray(rawNotifications) ? rawNotifications.slice(-50) : [];

    const cloudData = {
      ...transactional,
      messages: cloudMessages,
      auditLogs: cloudAuditLogs,
      notifications: cloudNotifications,
      pageViews: cloudPageViews,
    };

    const result = await pool.query(
      `INSERT INTO kortex_app_state (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, updated_at = NOW()
       RETURNING updated_at`,
      ['default', JSON.stringify(cloudData)]
    );
    const updatedAt = result.rows[0]?.updated_at ? new Date(result.rows[0].updated_at).toISOString() : new Date().toISOString();
    return { ok: true, updatedAt };
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

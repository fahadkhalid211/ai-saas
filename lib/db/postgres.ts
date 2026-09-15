import { Pool } from 'pg';

let pgPoolInstance: Pool | null = null;
let isSchemaInitialized = false;

export function getPostgresUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )?.trim();
}

export function isPostgresConfigured(): boolean {
  const url = getPostgresUrl();
  return Boolean(url && (url.startsWith('postgres://') || url.startsWith('postgresql://')));
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
    connectionTimeoutMillis: 10000,
  });

  pgPoolInstance.on('error', (err) => {
    console.warn('[Postgres Pool] Unexpected error on idle client:', err?.message || err);
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
    return false;
  }
}

export async function fetchPostgresState(): Promise<any | null> {
  const pool = getPostgresPool();
  if (!pool) return null;

  try {
    await ensurePostgresSchema();
    const result = await pool.query(
      'SELECT data FROM kortex_app_state WHERE id = $1 LIMIT 1',
      ['default']
    );
    if (result.rows.length === 0) return null;
    return result.rows[0].data || null;
  } catch (err: any) {
    console.warn('[Postgres] Exception fetching state:', err?.message || err);
    return null;
  }
}

export async function persistPostgresState(state: any): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;

  try {
    await ensurePostgresSchema();
    const { chunks: _chunks, ...transactional } = state;
    await pool.query(
      `INSERT INTO kortex_app_state (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data, updated_at = NOW()`,
      ['default', JSON.stringify(transactional)]
    );
    return true;
  } catch (err: any) {
    console.warn('[Postgres] Exception persisting state:', err?.message || err);
    return false;
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

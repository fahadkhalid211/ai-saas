import { getPostgresPool, isConnectionError, isPostgresConfigured } from './postgres';
import type { ChunkRecord } from './index';
import type { SearchResultChunk } from '../rag/types';
import { embeddingProfile, vectorTag, PLACEHOLDER_PROFILE_ID } from '../rag/embedding-profile';

/**
 * Knowledge-base passages in Postgres with pgvector: an HNSW index for meaning, a full-text index for words, both
 * searched and fused inside the database in one round trip. Enabled with RAG_VECTOR_STORE=pgvector (after
 * `npm run rag:migrate` has copied existing passages over).
 *
 * Why this exists: the older path kept every passage of every customer in one JSON value and scanned it in memory
 * for each question, re-writing the whole thing on every upload.
 */

export const EMBEDDING_DIMENSIONS = 384; // Xenova/bge-small-en-v1.5

export function pgVectorStoreEnabled(): boolean {
  return process.env.RAG_VECTOR_STORE === 'pgvector' && isPostgresConfigured();
}

/** Table name; overridable so tests can use a scratch table. Validated because it is placed into SQL text. */
export function chunkTable(): string {
  const name = process.env.CHUNKS_TABLE || 'kortex_chunks';
  if (!/^[a-z_][a-z0-9_]{0,40}$/.test(name)) throw new Error('Invalid CHUNKS_TABLE name');
  return name;
}

const tunedClients = new WeakSet<object>();
let ready: { table: string; iterative: boolean } | null = null;
let readyPromise: Promise<{ table: string; iterative: boolean }> | null = null;

/** Creates the extension, table and indexes if they are missing (idempotent), once per process. */
export async function ensureChunkStore(): Promise<{ table: string; iterative: boolean }> {
  const t = chunkTable();
  if (ready && ready.table === t) return ready;
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    const pool = getPostgresPool();
    if (!pool) throw new Error('Postgres is not configured');
    try {
      const present = await pool.query('SELECT to_regclass($1) AS r', [t]);
      if (!present.rows[0]?.r) {
      const ddl = await pool.connect(); // the lock belongs to one connection
      try {
        await ddl.query('SELECT pg_advisory_lock(hashtext($1))', [`ddl:${t}`]);
      await ddl.query('CREATE EXTENSION IF NOT EXISTS vector').catch(() => undefined); // already installed on your server
      await ddl.query({
        text: `
        CREATE TABLE IF NOT EXISTS ${t} (
          id TEXT PRIMARY KEY,
          assistant_id TEXT NOT NULL,
          source_id TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT '',
          content TEXT NOT NULL,
          tokens INTEGER NOT NULL DEFAULT 0,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          embedding vector(${EMBEDDING_DIMENSIONS}),
          chunk_index INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          fts tsvector GENERATED ALWAYS AS (to_tsvector('english', COALESCE(title, '') || ' ' || content)) STORED
        );
        CREATE INDEX IF NOT EXISTS idx_${t}_assistant_source ON ${t} (assistant_id, source_id);
        CREATE INDEX IF NOT EXISTS idx_${t}_assistant_chunk ON ${t} (assistant_id, chunk_index);
        CREATE INDEX IF NOT EXISTS idx_${t}_source ON ${t} (source_id);
        CREATE INDEX IF NOT EXISTS idx_${t}_embedding_hnsw ON ${t} USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
        CREATE INDEX IF NOT EXISTS idx_${t}_fts ON ${t} USING gin (fts);
        ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${t}' AND policyname = 'Service role full access') THEN
              CREATE POLICY "Service role full access" ON ${t} FOR ALL TO service_role USING (true) WITH CHECK (true);
            END IF;
          END IF;
        END $$;`,
        query_timeout: 60_000,
      } as any);
      } finally {
        await ddl.query('SELECT pg_advisory_unlock(hashtext($1))', [`ddl:${t}`]).catch(() => undefined);
        ddl.release();
      }
      }
      // pgvector 0.8+ can keep scanning the index until enough rows pass the tenant filter (needed for correct multi-tenant results)
      const v = await pool.query("SELECT extversion FROM pg_extension WHERE extname = 'vector'");
      const [maj, min] = String(v.rows[0]?.extversion || '0.0').split('.').map(Number);
      ready = { table: t, iterative: maj > 0 || min >= 8 };
      return ready;
    } catch (err) {
      readyPromise = null;
      if (isConnectionError(err)) throw err;
      throw new Error(`pgvector store is not available: ${(err as Error).message}`);
    }
  })();
  return readyPromise;
}

async function pool() {
  await ensureChunkStore();
  const p = getPostgresPool();
  if (!p) throw new Error('Postgres is not configured');
  return p;
}

const toVector = (e?: number[] | null) => (e && e.length === EMBEDDING_DIMENSIONS ? `[${e.join(',')}]` : null);

function rowToRecord(r: any): ChunkRecord {
  return {
    id: r.id,
    assistantId: r.assistant_id,
    knowledgeSourceId: r.source_id,
    content: r.content,
    chunkIndex: r.chunk_index ?? 0,
    tokenCount: r.tokens ?? 0,
    metadata: typeof r.metadata === 'object' && r.metadata !== null ? r.metadata : {},
    embedding: [], // never shipped back to the app: it is only needed by the database
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  } as ChunkRecord;
}

function rowToResult(r: any, similarity: number): SearchResultChunk {
  return {
    id: r.id,
    content: r.content,
    chunkIndex: r.chunk_index ?? 0,
    tokenCount: r.tokens ?? 0,
    metadata: typeof r.metadata === 'object' && r.metadata !== null ? r.metadata : {},
    knowledgeSourceId: r.source_id,
    similarity,
  };
}

/* --------------------------------------------- writes ---------------------------------------------- */

export async function upsertChunks(chunks: ChunkRecord[]): Promise<void> {
  if (chunks.length === 0) return;
  const p = await pool();
  const t = chunkTable();
  const batchSize = 100;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const values: unknown[] = [];
    const rows = batch.map((c, r) => {
      const o = r * 9;
      values.push(
        c.id,
        c.assistantId,
        c.knowledgeSourceId,
        String(c.metadata?.sourceTitle || c.metadata?.title || '').slice(0, 500),
        c.content,
        c.tokenCount || 0,
        JSON.stringify(c.metadata || {}),
        toVector(c.embedding),
        c.chunkIndex ?? 0
      );
      return `($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4}, $${o + 5}, $${o + 6}, $${o + 7}::jsonb, $${o + 8}::vector, $${o + 9})`;
    });
    await p.query({
      // An update that carries no embedding (the app never reads them back) keeps the stored one.
      text: `INSERT INTO ${t} (id, assistant_id, source_id, title, content, tokens, metadata, embedding, chunk_index)
             VALUES ${rows.join(', ')}
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title, content = EXCLUDED.content, tokens = EXCLUDED.tokens, metadata = EXCLUDED.metadata,
               embedding = COALESCE(EXCLUDED.embedding, ${t}.embedding), chunk_index = EXCLUDED.chunk_index`,
      values,
      query_timeout: 60_000,
    } as any);
  }
}

export async function deleteChunksBySource(sourceId: string): Promise<number> {
  const p = await pool();
  const r = await p.query(`DELETE FROM ${chunkTable()} WHERE source_id = $1`, [sourceId]);
  return r.rowCount ?? 0;
}

export async function deleteChunksByAssistant(assistantId: string): Promise<number> {
  const p = await pool();
  const r = await p.query(`DELETE FROM ${chunkTable()} WHERE assistant_id = $1`, [assistantId]);
  return r.rowCount ?? 0;
}

/* --------------------------------------------- reads ----------------------------------------------- */

const COLS = 'id, assistant_id, source_id, content, tokens, metadata, chunk_index, created_at';

export async function getChunksBySource(sourceId: string): Promise<ChunkRecord[]> {
  const p = await pool();
  const r = await p.query(`SELECT ${COLS} FROM ${chunkTable()} WHERE source_id = $1 ORDER BY chunk_index ASC`, [sourceId]);
  return r.rows.map(rowToRecord);
}

export async function getChunksByAssistant(assistantId: string): Promise<ChunkRecord[]> {
  const p = await pool();
  const r = await p.query(`SELECT ${COLS} FROM ${chunkTable()} WHERE assistant_id = $1 ORDER BY source_id, chunk_index ASC`, [assistantId]);
  return r.rows.map(rowToRecord);
}

/** Passages whose vectors were made by a different embedding model than the one in use (oldest tag first), for the rebuild job. */
export async function staleEmbeddingChunks(profileId: string, limit: number): Promise<ChunkRecord[]> {
  const p = await pool();
  const r = await p.query(
    `SELECT ${COLS} FROM ${chunkTable()} WHERE COALESCE(metadata->>'embModel', 'bge-small-en-v1.5') <> $1 ORDER BY assistant_id, source_id, chunk_index LIMIT $2`,
    [profileId, limit]
  );
  return r.rows.map(rowToRecord);
}

/**
 * Re-tags stand-in vectors that were stored as if a model had made them. A real embedding always has negative components;
 * a stand-in (counts of characters, normalised) never does, which is how they are told apart. Returns the number re-tagged.
 */
export async function markPlaceholderVectors(): Promise<number> {
  const p = await pool();
  const t = chunkTable();
  const r = await p.query({
    text: `UPDATE ${t} SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{embModel}', to_jsonb($1::text))
           WHERE COALESCE(metadata->>'embModel', '') <> $1
             AND embedding IS NOT NULL
             AND NOT EXISTS (SELECT 1 FROM unnest(embedding::real[]) AS x WHERE x < 0)`,
    values: [PLACEHOLDER_PROFILE_ID],
    query_timeout: 60_000,
  } as any);
  return r.rowCount ?? 0;
}

export async function countStaleEmbeddingChunks(profileId: string): Promise<number> {
  const p = await pool();
  const r = await p.query(`SELECT COUNT(*)::int AS n FROM ${chunkTable()} WHERE COALESCE(metadata->>'embModel', 'bge-small-en-v1.5') <> $1`, [profileId]);
  return r.rows[0]?.n ?? 0;
}

export async function countChunksByAssistants(assistantIds: string[]): Promise<number> {
  if (assistantIds.length === 0) return 0;
  const p = await pool();
  const r = await p.query(`SELECT COUNT(*)::int AS n FROM ${chunkTable()} WHERE assistant_id = ANY($1)`, [assistantIds]);
  return r.rows[0]?.n ?? 0;
}

/** Bytes of text held for each source (used when a source has no recorded file size). */
export async function textBytesBySource(sourceIds: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (sourceIds.length === 0) return out;
  const p = await pool();
  const r = await p.query(`SELECT source_id, SUM(octet_length(content))::bigint AS bytes FROM ${chunkTable()} WHERE source_id = ANY($1) GROUP BY source_id`, [sourceIds]);
  for (const row of r.rows) out.set(row.source_id, Number(row.bytes));
  return out;
}

const PRICING_WORDS = String.raw`\y(budget|budgets|price|prices|pricing|cost|costs|rate|rates|fee|fees|\$|usd|eur|haircut|service|project)\y`;

export async function getPricingChunks(assistantId: string, limit = 12): Promise<SearchResultChunk[]> {
  const p = await pool();
  const r = await p.query(
    `SELECT ${COLS} FROM ${chunkTable()} WHERE assistant_id = $1 AND (content ~* $2 OR title ~* $2) ORDER BY chunk_index ASC LIMIT $3`,
    [assistantId, PRICING_WORDS, limit]
  );
  return r.rows.map((row) => rowToResult(row, 0.85));
}

/* ------------------------------------------ hybrid search ------------------------------------------- */

/** Words for the full-text side: letters and digits only, no operators, so a visitor can never inject query syntax. */
export function tsQueryFrom(text: string, max = 24): string {
  const seen = new Set<string>();
  for (const raw of (text || '').toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length >= 2 && raw.length <= 40) seen.add(raw);
    if (seen.size >= max) break;
  }
  return [...seen].join(' | ');
}

/**
 * Meaning (HNSW) and words (full text) searched together and fused by reciprocal rank inside the database, with the same
 * cut-offs and rank constants as the in-memory path so results are comparable. `similarity` is the fused score, as before.
 */
export async function hybridSearch(assistantId: string, query: string, queryEmbedding: number[], topK = 6): Promise<SearchResultChunk[]> {
  const p = await pool();
  const { iterative } = await ensureChunkStore();
  const t = chunkTable();
  const vec = toVector(queryEmbedding);
  if (!vec) return [];
  const tsq = tsQueryFrom(query);
  const profile = embeddingProfile();

  const sql = `
    WITH q AS (
      SELECT $1::vector AS emb,
             CASE WHEN $3::text = '' THEN NULL
                  WHEN numnode(to_tsquery('english', $3::text)) = 0 THEN NULL
                  ELSE to_tsquery('english', $3::text) END AS tsq
    ),
    kw AS (
      SELECT c.id, ts_rank_cd(c.fts, q.tsq, 32) AS score,
             ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.fts, q.tsq, 32) DESC, c.id) AS rnk
      FROM ${t} c, q
      WHERE q.tsq IS NOT NULL AND c.assistant_id = $2 AND c.fts @@ q.tsq
      ORDER BY score DESC, c.id
      LIMIT 15
    ),
    cut AS (SELECT CASE WHEN EXISTS (SELECT 1 FROM kw) THEN $5::float8 ELSE $6::float8 END AS v),
    vec AS (
      SELECT c.id, 1 - (c.embedding <=> q.emb) AS score,
             ROW_NUMBER() OVER (ORDER BY c.embedding <=> q.emb, c.id) AS rnk
      FROM ${t} c, q
      WHERE c.assistant_id = $2 AND c.embedding IS NOT NULL
        AND COALESCE(c.metadata->>'embModel', 'bge-small-en-v1.5') = $7
      ORDER BY c.embedding <=> q.emb, c.id
      LIMIT 15
    ),
    vecf AS (SELECT vec.* FROM vec, cut WHERE vec.score >= cut.v AND vec.score > 0),
    fused AS (
      SELECT COALESCE(v.id, k.id) AS id,
             COALESCE(1.0 / (60 + v.rnk) + v.score * 0.05, 0) + COALESCE(1.0 / (60 + k.rnk), 0) AS rrf,
             COALESCE(v.score, 0) AS vscore, (k.id IS NOT NULL) AS kmatch
      FROM vecf v FULL OUTER JOIN kw k ON k.id = v.id
    )
    SELECT c.id, c.content, c.tokens, c.metadata, c.source_id, c.chunk_index, f.rrf, f.vscore, f.kmatch
    FROM fused f JOIN ${t} c ON c.id = f.id
    ORDER BY f.rrf DESC
    LIMIT $4`;

  const client = await p.connect();
  try {
    // Tuning is set once per connection (not per search) so a search costs a single round trip.
    if (!tunedClients.has(client)) {
      await client.query(
        (iterative
          // keep walking the index until enough rows of THIS assistant are found (a small tenant's passages are otherwise crowded out)
          ? "SET hnsw.iterative_scan = 'relaxed_order'; SET hnsw.max_scan_tuples = 20000; "
          : '') + 'SET hnsw.ef_search = 80'
      );
      tunedClients.add(client);
    }
    const res = await client.query({ text: sql, values: [vec, assistantId, tsq, topK, profile.vectorCutoffWithKeyword, profile.vectorCutoffAlone, vectorTag()], query_timeout: 15_000 } as any);
    return res.rows.map((r: any) => ({
      ...rowToResult(r, Number(r.rrf) || 0),
      vectorScore: Number(r.vscore) || 0,
      keywordMatch: Boolean(r.kmatch),
    }));
  } finally {
    client.release();
  }
}

/** How many passages an assistant has in the table (used to detect assistants not migrated yet). */
export async function countChunksForAssistant(assistantId: string): Promise<number> {
  const p = await pool();
  const r = await p.query(`SELECT COUNT(*)::int AS n FROM ${chunkTable()} WHERE assistant_id = $1`, [assistantId]);
  return r.rows[0]?.n ?? 0;
}

/** For tests. */
export function _resetChunkStoreForTesting(): void {
  ready = null;
  readyPromise = null;
}

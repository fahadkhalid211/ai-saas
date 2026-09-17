/**
 * CLI Backfill Script: Populate kortex_chunks from Monolithic State (Phase 2)
 *
 * Usage:
 *   npx tsx scripts/backfill-chunks.ts
 *
 * Idempotently backfills knowledge base chunks stored in the app state blob
 * into the dedicated kortex_chunks Postgres table with vector(384) embeddings.
 *
 * Once backfilled, Database.hybridSearch() can leverage the pgvector HNSW
 * index and GIN full-text search index for O(log N) fast retrieval.
 */

import { Database } from '../lib/db';
import { isPostgresConfigured, getPostgresPool } from '../lib/db/postgres';
import * as Relational from '../lib/db/relational';

async function runBackfillChunks(): Promise<void> {
  console.log('[BackfillChunks] Starting chunk backfill process...');

  if (!isPostgresConfigured()) {
    console.error('[BackfillChunks] Error: Postgres is not configured or currently unreachable.');
    console.error('[BackfillChunks] Please check DATABASE_URL / POSTGRES_URL environment variables.');
    process.exit(1);
  }

  const pool = getPostgresPool();
  if (!pool) {
    console.error('[BackfillChunks] Error: Could not acquire Postgres connection pool.');
    process.exit(1);
  }

  // Load database state to access chunks
  console.log('[BackfillChunks] Loading knowledge base chunks from storage...');
  const state = await Database.getState();
  const chunks = state.chunks || [];

  console.log(`[BackfillChunks] Discovered ${chunks.length} chunks in state.`);

  if (chunks.length === 0) {
    console.log('[BackfillChunks] No chunks to migrate. Exiting.');
    await pool.end();
    return;
  }

  const batchSize = 50;
  let migrated = 0;
  let failed = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    try {
      const ok = await Relational.relationalUpsertChunks(batch);
      if (ok) {
        migrated += batch.length;
        console.log(`[BackfillChunks] Progress: ${migrated} / ${chunks.length} chunks migrated.`);
      } else {
        failed += batch.length;
        console.warn(`[BackfillChunks] Batch ${i / batchSize + 1} returned false.`);
      }
    } catch (err) {
      failed += batch.length;
      console.error(`[BackfillChunks] Batch ${i / batchSize + 1} failed:`, err);
    }
  }

  console.log('[BackfillChunks] Migration summary:');
  console.log(`  - Total chunks in blob: ${chunks.length}`);
  console.log(`  - Chunks successfully migrated: ${migrated}`);
  console.log(`  - Chunks failed: ${failed}`);
  console.log('[BackfillChunks] Completed successfully.');

  try {
    await pool.end();
  } catch {}
}

runBackfillChunks().catch((err) => {
  console.error('[BackfillChunks] Fatal error during chunk backfill:', err);
  process.exit(1);
});

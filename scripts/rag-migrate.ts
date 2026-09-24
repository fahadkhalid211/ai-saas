/**
 * Copies every knowledge-base passage from the old store (JSON state / .data/vectors.json) into the Postgres
 * pgvector table, then checks the counts match. Safe to re-run: existing rows are updated, nothing is deleted.
 *
 *   npm run rag:migrate            copy + verify
 *   npm run rag:migrate -- --dry   only report what would be copied
 *
 * Afterwards set RAG_VECTOR_STORE=pgvector in the environment and redeploy.
 */
import fs from 'node:fs';

for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
delete process.env.RAG_VECTOR_STORE; // read from the OLD store

async function main() {
  const dry = process.argv.includes('--dry');
  const { Database } = await import('../lib/db');
  const { isPostgresConfigured } = await import('../lib/db/postgres');
  const store = await import('../lib/db/chunk-store');
  if (!isPostgresConfigured()) throw new Error('DATABASE_URL is not set or the database is unreachable');

  const state = await Database.getState();
  const byId = new Map<string, any>();
  for (const c of state.chunks || []) byId.set(c.id, c);
  for (const a of state.assistants || []) for (const c of await Database.getChunksByAssistant(a.id)) byId.set(c.id, c);
  const chunks = [...byId.values()].filter((c) => c.assistantId && c.knowledgeSourceId && c.content);
  const withVec = chunks.filter((c) => Array.isArray(c.embedding) && c.embedding.length === store.EMBEDDING_DIMENSIONS).length;
  console.log(`Found ${chunks.length} passages (${withVec} with embeddings, ${chunks.length - withVec} without).`);
  if (dry || chunks.length === 0) return;

  process.env.RAG_VECTOR_STORE = 'pgvector';
  await store.ensureChunkStore();
  for (let i = 0; i < chunks.length; i += 200) {
    await store.upsertChunks(chunks.slice(i, i + 200));
    console.log(`  copied ${Math.min(i + 200, chunks.length)} / ${chunks.length}`);
  }

  const ids = [...new Set(chunks.map((c) => c.assistantId as string))];
  const counts = await store.countChunksByAssistants(ids);
  console.log(`Table now holds ${counts} passages for these ${ids.length} assistants.`);
  if (counts < chunks.length) throw new Error(`Verification failed: expected at least ${chunks.length}, found ${counts}`);
  console.log('Done. Set RAG_VECTOR_STORE=pgvector and redeploy.');
}

main().then(() => process.exit(0), (err) => { console.error('Migration failed:', err.message); process.exit(1); });

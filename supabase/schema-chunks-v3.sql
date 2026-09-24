-- Knowledge-base passages for the pgvector store (RAG_VECTOR_STORE=pgvector). Idempotent and self-contained;
-- lib/db/chunk-store.ts creates the same objects on first use, this file is for `npm run db:apply`.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS kortex_chunks (
  id TEXT PRIMARY KEY,
  assistant_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(384),
  chunk_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', COALESCE(title, '') || ' ' || content)) STORED
);

CREATE INDEX IF NOT EXISTS idx_kortex_chunks_assistant_source ON kortex_chunks (assistant_id, source_id);
CREATE INDEX IF NOT EXISTS idx_kortex_chunks_assistant_chunk ON kortex_chunks (assistant_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_kortex_chunks_source ON kortex_chunks (source_id);
CREATE INDEX IF NOT EXISTS idx_kortex_chunks_embedding_hnsw ON kortex_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS idx_kortex_chunks_fts ON kortex_chunks USING gin (fts);

ALTER TABLE kortex_chunks ENABLE ROW LEVEL SECURITY;

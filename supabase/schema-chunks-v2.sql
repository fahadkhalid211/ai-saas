-- ==============================================================================
-- Kortex AI - Chunks HNSW & Full-Text Search Migration (Phase 2 RAG Acceleration)
-- ==============================================================================
-- Run AFTER schema.sql. Execute in Supabase SQL Editor or psql.
-- Idempotent: all CREATE INDEX and ALTER TABLE statements are IF NOT EXISTS.
--
-- This migration transforms kortex_chunks into a fully indexed vector + text
-- retrieval engine:
--   1. HNSW index for O(log N) approximate nearest neighbor vector similarity.
--   2. GIN full-text search index for indexed keyword relevance.
--   3. Composite indexes for rapid tenant/source filtering.
-- ==============================================================================

-- 1. Ensure vector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add chunk_index column if not already present
ALTER TABLE kortex_chunks 
  ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0;

-- 3. Composite index for assistant-scoped and source-scoped lookups
CREATE INDEX IF NOT EXISTS idx_kortex_chunks_assistant_source 
  ON kortex_chunks (assistant_id, source_id);

CREATE INDEX IF NOT EXISTS idx_kortex_chunks_assistant_chunk_idx
  ON kortex_chunks (assistant_id, chunk_index ASC);

-- 4. Vector HNSW Index (Hierarchical Navigable Small World)
-- Note: Requires pgvector >= 0.5.0 (Supabase standard on Postgres 15+)
-- If running on an older pgvector version (< 0.5.0), use the IVFFlat fallback below:
--   CREATE INDEX IF NOT EXISTS idx_kortex_chunks_embedding_ivfflat 
--     ON kortex_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_kortex_chunks_embedding_hnsw 
    ON kortex_chunks 
    USING hnsw (embedding vector_cosine_ops);
EXCEPTION WHEN OTHERS THEN
  -- Fallback to IVFFlat if HNSW is unsupported on older pgvector
  RAISE NOTICE 'HNSW index creation failed, attempting IVFFlat fallback: %', SQLERRM;
  CREATE INDEX IF NOT EXISTS idx_kortex_chunks_embedding_ivfflat 
    ON kortex_chunks 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
END $$;

-- 5. Full-Text Search GIN Index for English text
CREATE INDEX IF NOT EXISTS idx_kortex_chunks_fts 
  ON kortex_chunks 
  USING gin (to_tsvector('english', content));

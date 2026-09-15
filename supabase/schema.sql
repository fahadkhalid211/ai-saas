-- ==============================================================================
-- Kortex AI - Supabase Database Schema
-- ==============================================================================
-- Execute this script in your Supabase project SQL Editor (Dashboard -> SQL Editor -> New Query).
-- This provisions the persistent cloud storage required for Kortex AI on Vercel.

-- 1. Enable pgvector extension for AI embeddings and RAG hybrid search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Master App State Table (Single-document JSONB store for fast transactional sync)
-- Stores workspaces, assistants, team members, landing page configs, and settings.
CREATE TABLE IF NOT EXISTS kortex_app_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  chunks JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by state identifier
CREATE INDEX IF NOT EXISTS idx_kortex_app_state_id ON kortex_app_state(id);

-- Optional trigger to auto-update updated_at timestamp on change
CREATE OR REPLACE FUNCTION update_kortex_app_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kortex_app_state_updated_at ON kortex_app_state;
CREATE TRIGGER trg_kortex_app_state_updated_at
  BEFORE UPDATE ON kortex_app_state
  FOR EACH ROW
  EXECUTE FUNCTION update_kortex_app_state_timestamp();

-- 3. Dedicated Relational Vector Store for Knowledge Base Chunks (pgvector)
CREATE TABLE IF NOT EXISTS kortex_chunks (
  id TEXT PRIMARY KEY,
  assistant_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(384), -- 384 dimensions for Xenova/bge-small-en-v1.5, or 1536 for text-embedding-3-small
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kortex_chunks_assistant ON kortex_chunks(assistant_id);
CREATE INDEX IF NOT EXISTS idx_kortex_chunks_source ON kortex_chunks(source_id);

-- 4. Enable Row Level Security (RLS) & Policies
ALTER TABLE kortex_app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_chunks ENABLE ROW LEVEL SECURITY;

-- Allow service_role key full unrestricted access to read and write all records
DROP POLICY IF EXISTS "Service role has full access to app state" ON kortex_app_state;
CREATE POLICY "Service role has full access to app state"
  ON kortex_app_state
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to chunks" ON kortex_chunks;
CREATE POLICY "Service role has full access to chunks"
  ON kortex_chunks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional public read-only policy for anon key if public landing pages or embed widgets query directly
DROP POLICY IF EXISTS "Public read access to state" ON kortex_app_state;
CREATE POLICY "Public read access to state"
  ON kortex_app_state
  FOR SELECT
  TO anon, authenticated
  USING (true);

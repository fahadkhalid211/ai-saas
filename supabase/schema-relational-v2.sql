-- ==============================================================================
-- Kortex AI - Relational Migration v2
-- High-frequency transactional tables (Phase 2)
-- ==============================================================================
-- Run AFTER schema.sql. Execute in Supabase SQL Editor or psql.
-- Idempotent: all CREATE TABLE and CREATE INDEX are IF NOT EXISTS.
--
-- These 6 tables replace the corresponding arrays stored inside
-- kortex_app_state.data for write-hot paths. The blob remains
-- authoritative for workspaces, assistants, knowledgeSources,
-- landingPages, teamMembers, smtpSettings, pageViews, auditLogs.
--
-- Activate in application with: DB_RELATIONAL_MODE=true
-- (default OFF - set only after validating reads match expectations)
-- ==============================================================================

-- 1. Messages
-- One row per chat message. Replaces state.messages[].
CREATE TABLE IF NOT EXISTS kortex_messages (
  id              TEXT        PRIMARY KEY,
  conversation_id TEXT        NOT NULL,
  role            TEXT        NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'agent')),
  content         TEXT        NOT NULL DEFAULT '',
  citations       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  tokens_used     INTEGER     NOT NULL DEFAULT 0,
  sender_name     TEXT,
  attachment      JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kortex_messages_conversation
  ON kortex_messages (conversation_id, created_at ASC);

-- 2. Conversations
-- One row per visitor session / chat thread. Replaces state.conversations[].
CREATE TABLE IF NOT EXISTS kortex_conversations (
  id                  TEXT        PRIMARY KEY,
  assistant_id        TEXT        NOT NULL,
  visitor_id          TEXT,
  visitor_email       TEXT,
  visitor_name        TEXT,
  sentiment           TEXT        CHECK (sentiment IN ('urgent', 'positive', 'neutral')),
  escalated           BOOLEAN     NOT NULL DEFAULT false,
  resolved            BOOLEAN     NOT NULL DEFAULT false,
  is_live_takeover    BOOLEAN     NOT NULL DEFAULT false,
  assigned_agent_name TEXT,
  status              TEXT        NOT NULL DEFAULT 'bot'
                                  CHECK (status IN ('bot', 'waiting_for_agent', 'live_agent', 'resolved')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kortex_conversations_assistant
  ON kortex_conversations (assistant_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_kortex_conversations_visitor
  ON kortex_conversations (visitor_id, created_at DESC);

-- 3. Leads
-- One row per captured lead email. Replaces state.leads[].
CREATE TABLE IF NOT EXISTS kortex_leads (
  id           TEXT        PRIMARY KEY,
  assistant_id TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  name         TEXT,
  phone        TEXT,
  notes        TEXT,
  custom_data  JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kortex_leads_assistant
  ON kortex_leads (assistant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kortex_leads_email
  ON kortex_leads (email);

-- 4. Appointments
-- One row per booking. Replaces state.appointments[].
CREATE TABLE IF NOT EXISTS kortex_appointments (
  id                    TEXT        PRIMARY KEY,
  assistant_id          TEXT        NOT NULL,
  name                  TEXT        NOT NULL,
  email                 TEXT        NOT NULL,
  phone                 TEXT,
  date                  TEXT        NOT NULL,
  time_slot             TEXT        NOT NULL,
  duration_minutes      INTEGER     NOT NULL DEFAULT 30,
  status                TEXT        NOT NULL DEFAULT 'confirmed'
                                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes                 TEXT,
  service_id            TEXT,
  service_name          TEXT,
  price                 NUMERIC,
  manage_token          TEXT        UNIQUE,
  cancellation_reason   TEXT,
  landing_page_name     TEXT,
  landing_page_slug     TEXT,
  reminders_sent        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kortex_appointments_assistant
  ON kortex_appointments (assistant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kortex_appointments_manage_token
  ON kortex_appointments (manage_token)
  WHERE manage_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kortex_appointments_status
  ON kortex_appointments (status, date);

-- Prevent double-booking race condition at database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_kortex_appointments_slot_unique
  ON kortex_appointments (assistant_id, date, time_slot)
  WHERE status != 'cancelled';

-- 5. Notifications (in-app dashboard alerts)
-- One row per notification. Replaces state.notifications[]. Max 200 kept (handled in app).
CREATE TABLE IF NOT EXISTS kortex_notifications (
  id           TEXT        PRIMARY KEY,
  assistant_id TEXT,
  title        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  type         TEXT        NOT NULL,
  metadata     JSONB,
  read         BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kortex_notifications_created
  ON kortex_notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kortex_notifications_unread
  ON kortex_notifications (read, created_at DESC)
  WHERE read = false;

-- 6. Unanswered Queries (knowledge gap detection)
-- One row per unanswered visitor question. Replaces state.unansweredQueries[].
CREATE TABLE IF NOT EXISTS kortex_unanswered_queries (
  id               TEXT        PRIMARY KEY,
  assistant_id     TEXT        NOT NULL,
  query            TEXT        NOT NULL,
  visitor_id       TEXT,
  resolved         BOOLEAN     NOT NULL DEFAULT false,
  suggested_answer TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kortex_unanswered_queries_assistant
  ON kortex_unanswered_queries (assistant_id, created_at DESC);

-- ==============================================================================
-- Row Level Security
-- All 6 new tables: service_role has full access.
-- ==============================================================================

ALTER TABLE kortex_messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_leads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_appointments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_unanswered_queries  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON kortex_messages;
CREATE POLICY "Service role full access" ON kortex_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON kortex_conversations;
CREATE POLICY "Service role full access" ON kortex_conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON kortex_leads;
CREATE POLICY "Service role full access" ON kortex_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON kortex_appointments;
CREATE POLICY "Service role full access" ON kortex_appointments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON kortex_notifications;
CREATE POLICY "Service role full access" ON kortex_notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON kortex_unanswered_queries;
CREATE POLICY "Service role full access" ON kortex_unanswered_queries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

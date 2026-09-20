-- ==============================================================================
-- Kortex AI - Widget funnel events (pilot measurement)
-- ==============================================================================
-- MANUAL RUN: execute in the Supabase SQL Editor BEFORE deploying the code that
-- writes to this table. If the table is missing, widget events are silently
-- dropped (logged once) and nothing else is affected.
--
-- One row per (widget session, event type). Sessions are de-duplicated client-side
-- (one 'widget_loaded' and one 'widget_opened' per browser session), and reads use
-- COUNT(DISTINCT session_id) so replays can't inflate the numbers.

CREATE TABLE IF NOT EXISTS kortex_widget_events (
  id           TEXT        PRIMARY KEY,
  assistant_id TEXT        NOT NULL,
  session_id   TEXT        NOT NULL,
  event_type   TEXT        NOT NULL
                           CHECK (event_type IN ('widget_loaded', 'widget_opened')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kortex_widget_events_assistant_type
  ON kortex_widget_events (assistant_id, event_type, created_at DESC);

-- Row Level Security: service_role only. Deliberately NO anon/authenticated policy.
ALTER TABLE kortex_widget_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON kortex_widget_events;
CREATE POLICY "Service role full access" ON kortex_widget_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

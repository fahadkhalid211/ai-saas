-- System log (master-admin only, read through /api/master/logs).
-- Idempotent. The app also creates this table on first write; this file exists so `npm run db:schema` and
-- a manual review show exactly what is stored. Retention (default 30 days) is enforced by /api/cron/log-retention.
--
-- What is stored: who (user id, workspace, role, IP), what (route, event, status, duration), when, and error details.
-- What is NOT stored: passwords, tokens, API keys, cookies, request bodies, chat or form text.

CREATE TABLE IF NOT EXISTS kortex_logs (
  id            BIGSERIAL PRIMARY KEY,
  ts            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level         TEXT NOT NULL,          -- debug | info | warn | error | fatal
  category      TEXT NOT NULL,          -- request | auth | security | db | llm | webhook | billing | booking | knowledge | voice | client | system | audit | cron | admin
  event         TEXT NOT NULL,          -- e.g. http.request, auth.login_failed
  message       TEXT,
  request_id    TEXT,
  method        TEXT,
  route         TEXT,
  path          TEXT,
  status        INTEGER,
  duration_ms   INTEGER,
  user_id       TEXT,
  workspace_id  TEXT,
  role          TEXT,
  ip            TEXT,
  user_agent    TEXT,
  deployment    TEXT,
  error_name    TEXT,
  error_message TEXT,
  error_stack   TEXT,
  fingerprint   TEXT,                   -- groups the same failure together
  meta          JSONB
);

CREATE INDEX IF NOT EXISTS idx_kortex_logs_ts           ON kortex_logs (ts DESC);
CREATE INDEX IF NOT EXISTS idx_kortex_logs_level_ts     ON kortex_logs (level, ts DESC);
CREATE INDEX IF NOT EXISTS idx_kortex_logs_user_ts      ON kortex_logs (user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_kortex_logs_workspace_ts ON kortex_logs (workspace_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_kortex_logs_request      ON kortex_logs (request_id);
CREATE INDEX IF NOT EXISTS idx_kortex_logs_fingerprint_ts ON kortex_logs (fingerprint, ts DESC);

ALTER TABLE kortex_logs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kortex_logs' AND policyname = 'Service role full access') THEN
      CREATE POLICY "Service role full access" ON kortex_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

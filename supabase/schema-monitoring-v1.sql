-- System Monitoring & Status Schema for Crescelo
-- Idempotent setup for services, health checks, incidents, timeline, and alerts.

CREATE TABLE IF NOT EXISTS kortex_monitor_services (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'operational', -- 'operational' | 'degraded' | 'outage'
  latency_ms      INTEGER NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uptime_30d      NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  metadata        JSONB
);

CREATE TABLE IF NOT EXISTS kortex_monitor_incidents (
  id                  TEXT PRIMARY KEY,
  service_id          TEXT NOT NULL REFERENCES kortex_monitor_services(id) ON DELETE CASCADE,
  service_name        TEXT NOT NULL,
  severity            TEXT NOT NULL DEFAULT 'warning', -- 'warning' | 'critical'
  status              TEXT NOT NULL DEFAULT 'detected', -- 'detected' | 'investigating' | 'identified' | 'monitoring' | 'resolved'
  title               TEXT NOT NULL,
  public_message      TEXT NOT NULL,
  detected_reason     TEXT NOT NULL,
  detected_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ,
  duration_seconds    INTEGER,
  deployment_ref      TEXT,
  affected_components JSONB,
  metadata            JSONB
);

CREATE INDEX IF NOT EXISTS idx_kortex_incidents_status ON kortex_monitor_incidents (status);
CREATE INDEX IF NOT EXISTS idx_kortex_incidents_detected_at ON kortex_monitor_incidents (detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_kortex_incidents_service ON kortex_monitor_incidents (service_id);

CREATE TABLE IF NOT EXISTS kortex_monitor_timeline (
  id           TEXT PRIMARY KEY,
  incident_id  TEXT NOT NULL REFERENCES kortex_monitor_incidents(id) ON DELETE CASCADE,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       TEXT NOT NULL,
  message      TEXT NOT NULL,
  is_public    BOOLEAN NOT NULL DEFAULT true,
  created_by   TEXT
);

CREATE INDEX IF NOT EXISTS idx_kortex_timeline_incident_ts ON kortex_monitor_timeline (incident_id, timestamp ASC);

CREATE TABLE IF NOT EXISTS kortex_monitor_health_checks (
  id          BIGSERIAL PRIMARY KEY,
  service_id  TEXT NOT NULL,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL,
  latency_ms  INTEGER NOT NULL,
  message     TEXT,
  details     JSONB
);

CREATE INDEX IF NOT EXISTS idx_kortex_hc_service_ts ON kortex_monitor_health_checks (service_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS kortex_monitor_alerts (
  id          TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,
  service_id  TEXT NOT NULL,
  alert_type  TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel     TEXT NOT NULL,
  recipient   TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS idx_kortex_alerts_incident ON kortex_monitor_alerts (incident_id, sent_at DESC);

CREATE TABLE IF NOT EXISTS kortex_monitor_deployments (
  id           TEXT PRIMARY KEY,
  version      TEXT NOT NULL,
  commit_sha   TEXT,
  deployed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  environment  TEXT NOT NULL DEFAULT 'production',
  summary      TEXT
);

CREATE INDEX IF NOT EXISTS idx_kortex_deployments_ts ON kortex_monitor_deployments (deployed_at DESC);

-- Enable RLS and grant service_role full access
ALTER TABLE kortex_monitor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_monitor_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_monitor_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_monitor_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_monitor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kortex_monitor_deployments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kortex_monitor_services' AND policyname = 'Service role monitor services') THEN
      CREATE POLICY "Service role monitor services" ON kortex_monitor_services FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kortex_monitor_incidents' AND policyname = 'Service role monitor incidents') THEN
      CREATE POLICY "Service role monitor incidents" ON kortex_monitor_incidents FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kortex_monitor_timeline' AND policyname = 'Service role monitor timeline') THEN
      CREATE POLICY "Service role monitor timeline" ON kortex_monitor_timeline FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kortex_monitor_health_checks' AND policyname = 'Service role monitor health checks') THEN
      CREATE POLICY "Service role monitor health checks" ON kortex_monitor_health_checks FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kortex_monitor_alerts' AND policyname = 'Service role monitor alerts') THEN
      CREATE POLICY "Service role monitor alerts" ON kortex_monitor_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kortex_monitor_deployments' AND policyname = 'Service role monitor deployments') THEN
      CREATE POLICY "Service role monitor deployments" ON kortex_monitor_deployments FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

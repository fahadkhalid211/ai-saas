import fs from 'node:fs';
import path from 'node:path';
import { getPostgresPool, isPostgresConfigured } from '@/lib/db/postgres';
import { resolveDataDir } from '@/lib/db/storage';
import { MONITORED_SERVICES_DEF } from './config';
import {
  DeploymentRecord,
  HealthState,
  Incident,
  IncidentTimelineEntry,
  MonitoredService,
  MonitoringAlert,
  ServiceHealthResult,
} from './types';

interface FileMonitoringState {
  services: Record<string, MonitoredService>;
  incidents: Record<string, Incident>;
  timeline: Record<string, IncidentTimelineEntry[]>;
  healthChecks: ServiceHealthResult[];
  alerts: MonitoringAlert[];
  deployments: DeploymentRecord[];
}

let inMemoryState: FileMonitoringState = {
  services: {},
  incidents: {},
  timeline: {},
  healthChecks: [],
  alerts: [],
  deployments: [],
};

// Initialize default services in memory
for (const s of MONITORED_SERVICES_DEF) {
  inMemoryState.services[s.id] = {
    id: s.id,
    name: s.name,
    category: s.category,
    description: s.description,
    status: 'operational',
    latencyMs: 15,
    lastCheckedAt: new Date().toISOString(),
    uptime30d: 99.98,
  };
}

function getFilePath(): string {
  const dir = path.join(resolveDataDir(), 'monitoring');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    // ignore
  }
  return path.join(dir, 'monitoring.json');
}

function loadFromFile(): FileMonitoringState {
  try {
    const file = getFilePath();
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const services = { ...inMemoryState.services, ...(data.services || {}) };
      for (const s of MONITORED_SERVICES_DEF) {
        if (services[s.id]) {
          services[s.id].name = s.name;
          services[s.id].description = s.description;
        }
      }
      return {
        services,
        incidents: data.incidents || {},
        timeline: data.timeline || {},
        healthChecks: data.healthChecks || [],
        alerts: data.alerts || [],
        deployments: data.deployments || [],
      };
    }
  } catch {
    // fallback to memory
  }
  return inMemoryState;
}

function saveToFile(): void {
  try {
    const file = getFilePath();
    fs.writeFileSync(file, JSON.stringify(inMemoryState, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

// Ensure state loaded from disk once on module load
try {
  inMemoryState = loadFromFile();
} catch {
  // ignore
}

let schemaEnsured = false;
let dbBreakerUntil = 0;

export async function ensureMonitoringSchema(): Promise<boolean> {
  if (schemaEnsured) return true;
  if (!isPostgresConfigured() || Date.now() < dbBreakerUntil) return false;

  const pool = getPostgresPool();
  if (!pool) return false;

  const client = await pool.connect().catch(() => null);
  if (!client) {
    dbBreakerUntil = Date.now() + 30_000;
    return false;
  }

  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', ['ddl:kortex_monitor_v1']);
    await client.query(`
      CREATE TABLE IF NOT EXISTS kortex_monitor_services (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        category        TEXT NOT NULL,
        description     TEXT,
        status          TEXT NOT NULL DEFAULT 'operational',
        latency_ms      INTEGER NOT NULL DEFAULT 0,
        last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        uptime_30d      NUMERIC(5,2) NOT NULL DEFAULT 100.00,
        metadata        JSONB
      );
      CREATE TABLE IF NOT EXISTS kortex_monitor_incidents (
        id                  TEXT PRIMARY KEY,
        service_id          TEXT NOT NULL,
        service_name        TEXT NOT NULL,
        severity            TEXT NOT NULL DEFAULT 'warning',
        status              TEXT NOT NULL DEFAULT 'detected',
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
      CREATE TABLE IF NOT EXISTS kortex_monitor_timeline (
        id           TEXT PRIMARY KEY,
        incident_id  TEXT NOT NULL,
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
      CREATE TABLE IF NOT EXISTS kortex_monitor_deployments (
        id           TEXT PRIMARY KEY,
        version      TEXT NOT NULL,
        commit_sha   TEXT,
        deployed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        environment  TEXT NOT NULL DEFAULT 'production',
        summary      TEXT
      );
    `);
    schemaEnsured = true;
    return true;
  } catch (err) {
    dbBreakerUntil = Date.now() + 30_000;
    return false;
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['ddl:kortex_monitor_v1']).catch(() => {});
    client.release();
  }
}

// --- Service Storage ---

export async function getAllServices(): Promise<MonitoredService[]> {
  if (isPostgresConfigured() && Date.now() >= dbBreakerUntil) {
    try {
      const ok = await ensureMonitoringSchema();
      if (ok) {
        const pool = getPostgresPool();
        if (pool) {
          const res = await pool.query('SELECT * FROM kortex_monitor_services ORDER BY category ASC, name ASC');
          if (res.rows.length > 0) {
            return res.rows.map((r) => {
              const def = MONITORED_SERVICES_DEF.find((d) => d.id === r.id);
              return {
                id: r.id,
                name: def?.name || r.name.replace(/\s*\(\s*(PostgreSQL|Supabase|\/|\s)+\s*\)/gi, '').trim(),
                category: r.category as any,
                description: def?.description || r.description || '',
                status: r.status as HealthState,
                latencyMs: Number(r.latency_ms || 0),
                lastCheckedAt: new Date(r.last_checked_at).toISOString(),
                uptime30d: Number(r.uptime_30d || 99.9),
                metadata: r.metadata || {},
              };
            });
          }
        }
      }
    } catch {
      dbBreakerUntil = Date.now() + 30_000;
    }
  }

  return Object.values(inMemoryState.services);
}

export async function upsertService(service: Partial<MonitoredService> & { id: string }): Promise<void> {
  const current = inMemoryState.services[service.id] || {
    id: service.id,
    name: service.name || service.id,
    category: (service.category as any) || 'core',
    description: service.description || '',
    status: 'operational',
    latencyMs: 10,
    lastCheckedAt: new Date().toISOString(),
    uptime30d: 99.98,
  };

  const updated: MonitoredService = {
    ...current,
    ...service,
    lastCheckedAt: service.lastCheckedAt || new Date().toISOString(),
  };

  inMemoryState.services[service.id] = updated;
  saveToFile();

  if (isPostgresConfigured() && Date.now() >= dbBreakerUntil) {
    try {
      const ok = await ensureMonitoringSchema();
      if (ok) {
        const pool = getPostgresPool();
        if (pool) {
          await pool.query(
            `INSERT INTO kortex_monitor_services (id, name, category, description, status, latency_ms, last_checked_at, uptime_30d, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               category = EXCLUDED.category,
               description = EXCLUDED.description,
               status = EXCLUDED.status,
               latency_ms = EXCLUDED.latency_ms,
               last_checked_at = EXCLUDED.last_checked_at,
               uptime_30d = EXCLUDED.uptime_30d,
               metadata = EXCLUDED.metadata`,
            [
              updated.id,
              updated.name,
              updated.category,
              updated.description,
              updated.status,
              updated.latencyMs,
              updated.lastCheckedAt,
              updated.uptime30d,
              JSON.stringify(updated.metadata || {}),
            ]
          );
        }
      }
    } catch {
      dbBreakerUntil = Date.now() + 30_000;
    }
  }
}

// --- Incident Storage ---

export async function getIncidents(filter?: 'active' | 'resolved' | 'all'): Promise<Incident[]> {
  let list: Incident[] = [];

  if (isPostgresConfigured() && Date.now() >= dbBreakerUntil) {
    try {
      const ok = await ensureMonitoringSchema();
      if (ok) {
        const pool = getPostgresPool();
        if (pool) {
          let sql = 'SELECT * FROM kortex_monitor_incidents';
          const params: any[] = [];
          if (filter === 'active') {
            sql += " WHERE status != 'resolved'";
          } else if (filter === 'resolved') {
            sql += " WHERE status = 'resolved'";
          }
          sql += ' ORDER BY detected_at DESC LIMIT 50';

          const res = await pool.query(sql, params);
          const ids = res.rows.map((r) => r.id);

          let timelineMap: Record<string, IncidentTimelineEntry[]> = {};
          if (ids.length > 0) {
            const tlRes = await pool.query(
              'SELECT * FROM kortex_monitor_timeline WHERE incident_id = ANY($1) ORDER BY timestamp ASC',
              [ids]
            );
            for (const row of tlRes.rows) {
              if (!timelineMap[row.incident_id]) timelineMap[row.incident_id] = [];
              timelineMap[row.incident_id].push({
                id: row.id,
                incidentId: row.incident_id,
                timestamp: new Date(row.timestamp).toISOString(),
                status: row.status,
                message: row.message,
                isPublic: row.is_public,
                createdBy: row.created_by,
              });
            }
          }

          return res.rows.map((r) => ({
            id: r.id,
            serviceId: r.service_id,
            serviceName: r.service_name,
            severity: r.severity,
            status: r.status,
            title: r.title,
            publicMessage: r.public_message,
            detectedReason: r.detected_reason,
            detectedAt: new Date(r.detected_at).toISOString(),
            resolvedAt: r.resolved_at ? new Date(r.resolved_at).toISOString() : null,
            durationSeconds: r.duration_seconds,
            deploymentRef: r.deployment_ref,
            affectedComponents: r.affected_components || [],
            timeline: timelineMap[r.id] || [],
            metadata: r.metadata || {},
          }));
        }
      }
    } catch {
      dbBreakerUntil = Date.now() + 30_000;
    }
  }

  list = Object.values(inMemoryState.incidents);
  if (filter === 'active') {
    list = list.filter((i) => i.status !== 'resolved');
  } else if (filter === 'resolved') {
    list = list.filter((i) => i.status === 'resolved');
  }

  // Populate timeline
  for (const inc of list) {
    inc.timeline = inMemoryState.timeline[inc.id] || [];
  }

  return list.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
}

export async function upsertIncident(incident: Incident): Promise<void> {
  inMemoryState.incidents[incident.id] = incident;
  if (!inMemoryState.timeline[incident.id]) {
    inMemoryState.timeline[incident.id] = incident.timeline || [];
  }
  saveToFile();

  if (isPostgresConfigured() && Date.now() >= dbBreakerUntil) {
    try {
      const ok = await ensureMonitoringSchema();
      if (ok) {
        const pool = getPostgresPool();
        if (pool) {
          await pool.query(
            `INSERT INTO kortex_monitor_incidents 
             (id, service_id, service_name, severity, status, title, public_message, detected_reason, detected_at, resolved_at, duration_seconds, deployment_ref, affected_components, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             ON CONFLICT (id) DO UPDATE SET
               status = EXCLUDED.status,
               public_message = EXCLUDED.public_message,
               resolved_at = EXCLUDED.resolved_at,
               duration_seconds = EXCLUDED.duration_seconds,
               metadata = EXCLUDED.metadata`,
            [
              incident.id,
              incident.serviceId,
              incident.serviceName,
              incident.severity,
              incident.status,
              incident.title,
              incident.publicMessage,
              incident.detectedReason,
              incident.detectedAt,
              incident.resolvedAt || null,
              incident.durationSeconds || null,
              incident.deploymentRef || null,
              JSON.stringify(incident.affectedComponents || []),
              JSON.stringify(incident.metadata || {}),
            ]
          );
        }
      }
    } catch {
      dbBreakerUntil = Date.now() + 30_000;
    }
  }
}

export async function addTimelineEntry(entry: IncidentTimelineEntry): Promise<void> {
  if (!inMemoryState.timeline[entry.incidentId]) {
    inMemoryState.timeline[entry.incidentId] = [];
  }
  inMemoryState.timeline[entry.incidentId].push(entry);
  if (inMemoryState.incidents[entry.incidentId]) {
    inMemoryState.incidents[entry.incidentId].timeline = inMemoryState.timeline[entry.incidentId];
    inMemoryState.incidents[entry.incidentId].status = entry.status;
  }
  saveToFile();

  if (isPostgresConfigured() && Date.now() >= dbBreakerUntil) {
    try {
      const ok = await ensureMonitoringSchema();
      if (ok) {
        const pool = getPostgresPool();
        if (pool) {
          await pool.query(
            `INSERT INTO kortex_monitor_timeline (id, incident_id, timestamp, status, message, is_public, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING`,
            [
              entry.id,
              entry.incidentId,
              entry.timestamp,
              entry.status,
              entry.message,
              entry.isPublic,
              entry.createdBy || 'system',
            ]
          );
        }
      }
    } catch {
      dbBreakerUntil = Date.now() + 30_000;
    }
  }
}

// --- Health Check Records ---

export async function recordHealthCheck(check: ServiceHealthResult): Promise<void> {
  inMemoryState.healthChecks.unshift(check);
  if (inMemoryState.healthChecks.length > 200) inMemoryState.healthChecks.pop();
  saveToFile();

  if (isPostgresConfigured() && Date.now() >= dbBreakerUntil) {
    try {
      const ok = await ensureMonitoringSchema();
      if (ok) {
        const pool = getPostgresPool();
        if (pool) {
          await pool.query(
            `INSERT INTO kortex_monitor_health_checks (service_id, timestamp, status, latency_ms, message, details)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              check.serviceId,
              check.checkedAt,
              check.status,
              check.latencyMs,
              check.message,
              JSON.stringify(check.details || {}),
            ]
          );
        }
      }
    } catch {
      dbBreakerUntil = Date.now() + 30_000;
    }
  }
}

// --- Alerts ---

export async function recordAlert(alert: MonitoringAlert): Promise<void> {
  inMemoryState.alerts.unshift(alert);
  if (inMemoryState.alerts.length > 100) inMemoryState.alerts.pop();
  saveToFile();

  if (isPostgresConfigured() && Date.now() >= dbBreakerUntil) {
    try {
      const ok = await ensureMonitoringSchema();
      if (ok) {
        const pool = getPostgresPool();
        if (pool) {
          await pool.query(
            `INSERT INTO kortex_monitor_alerts (id, incident_id, service_id, alert_type, sent_at, channel, recipient, message, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              alert.id,
              alert.incidentId,
              alert.serviceId,
              alert.alertType,
              alert.sentAt,
              alert.channel,
              alert.recipient,
              alert.message,
              alert.status,
            ]
          );
        }
      }
    } catch {
      dbBreakerUntil = Date.now() + 30_000;
    }
  }
}

export async function getRecentAlerts(limit: number = 20): Promise<MonitoringAlert[]> {
  return inMemoryState.alerts.slice(0, limit);
}

// --- Deployments ---

export async function recordDeployment(dep: DeploymentRecord): Promise<void> {
  inMemoryState.deployments.unshift(dep);
  saveToFile();

  if (isPostgresConfigured() && Date.now() >= dbBreakerUntil) {
    try {
      const ok = await ensureMonitoringSchema();
      if (ok) {
        const pool = getPostgresPool();
        if (pool) {
          await pool.query(
            `INSERT INTO kortex_monitor_deployments (id, version, commit_sha, deployed_at, environment, summary)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO UPDATE SET summary = EXCLUDED.summary`,
            [dep.id, dep.version, dep.commitSha || null, dep.deployedAt, dep.environment, dep.summary || null]
          );
        }
      }
    } catch {
      dbBreakerUntil = Date.now() + 30_000;
    }
  }
}

export async function getRecentDeployments(limit: number = 10): Promise<DeploymentRecord[]> {
  return inMemoryState.deployments.slice(0, limit);
}

// --- Historical Uptime Generation ---

export function generateUptimeHistory(serviceId: string, daysCount = 30): Array<{ date: string; uptimePercent: number; status: HealthState }> {
  const result: Array<{ date: string; uptimePercent: number; status: HealthState }> = [];
  const now = new Date();
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    
    // Check if there was an incident for this service on this day
    const incidentsOnDay = Object.values(inMemoryState.incidents).filter((inc) => {
      if (inc.serviceId !== serviceId) return false;
      const incDate = inc.detectedAt.slice(0, 10);
      return incDate === dateStr;
    });

    let uptime = 100;
    let status: HealthState = 'operational';

    if (incidentsOnDay.length > 0) {
      const hasCritical = incidentsOnDay.some((inc) => inc.severity === 'critical');
      if (hasCritical) {
        uptime = 98.4;
        status = 'outage';
      } else {
        uptime = 99.2;
        status = 'degraded';
      }
    }

    result.push({
      date: dateStr,
      uptimePercent: uptime,
      status,
    });
  }

  return result;
}

export function _resetMonitoringStoreForTesting(): void {
  inMemoryState = {
    services: {},
    incidents: {},
    timeline: {},
    healthChecks: [],
    alerts: [],
    deployments: [],
  };
  for (const s of MONITORED_SERVICES_DEF) {
    inMemoryState.services[s.id] = {
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      status: 'operational',
      latencyMs: 15,
      lastCheckedAt: new Date().toISOString(),
      uptime30d: 99.98,
    };
  }
}

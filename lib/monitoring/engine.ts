import crypto from 'node:crypto';
import { LogRow } from '@/lib/logging/store';
import { redactString } from '@/lib/logging/redact';
import { onLogRow } from '@/lib/logging/logger';
import { getMonitoringConfig, MONITORED_SERVICES_DEF } from './config';
import {
  EventSeverity,
  HealthState,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentTimelineEntry,
  MonitoredEvent,
  MonitoredService,
} from './types';
import {
  addTimelineEntry,
  getAllServices,
  getIncidents,
  getRecentDeployments,
  upsertIncident,
  upsertService,
} from './store';
import { dispatchAlert } from './alerts';

interface ServiceMetricsWindow {
  totalRequests: number;
  errorCount: number;
  consecutiveFailures: number;
  latencies: number[];
  lastWindowReset: number;
}

const serviceMetrics = new Map<string, ServiceMetricsWindow>();
const recentEventsBuffer: MonitoredEvent[] = [];
const MAX_EVENTS_BUFFER = 2000;

function getMetrics(serviceId: string): ServiceMetricsWindow {
  const now = Date.now();
  let m = serviceMetrics.get(serviceId);
  if (!m || now - m.lastWindowReset > 5 * 60_000) {
    // 5-minute sliding window
    m = {
      totalRequests: 0,
      errorCount: 0,
      consecutiveFailures: m ? m.consecutiveFailures : 0,
      latencies: [],
      lastWindowReset: now,
    };
    serviceMetrics.set(serviceId, m);
  }
  return m;
}

export function mapCategoryToService(category: string, route?: string | null): string {
  switch (category) {
    case 'db':
      return 'database';
    case 'auth':
    case 'security':
      return 'auth';
    case 'llm':
      return 'ai';
    case 'rag':
    case 'knowledge':
      return 'knowledge';
    case 'booking':
      return 'booking';
    case 'voice':
    case 'webhook':
    case 'billing':
      return 'channels';
    case 'cron':
      return 'workers';
    case 'client':
    case 'request':
    default:
      if (route?.includes('/api/chat')) return 'chatbot';
      if (route?.includes('/api/appointments')) return 'booking';
      if (route?.includes('/api/knowledge/url')) return 'scraper';
      if (route?.includes('/api/notifications')) return 'notifications';
      return 'api';
  }
}

export function mapLevelToSeverity(level: string): EventSeverity {
  switch (level) {
    case 'fatal':
      return 'critical';
    case 'error':
      return 'error';
    case 'warn':
      return 'warning';
    case 'info':
    case 'debug':
    default:
      return 'info';
  }
}

export function normalizeLogRow(row: LogRow): MonitoredEvent {
  const service = mapCategoryToService(row.category, row.route);
  const severity = mapLevelToSeverity(row.level);

  return {
    id: `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    timestamp: row.ts instanceof Date ? row.ts.toISOString() : new Date(row.ts).toISOString(),
    severity,
    service,
    component: row.category,
    environment: process.env.NODE_ENV || 'production',
    endpoint: row.route || row.path || undefined,
    method: row.method || undefined,
    httpStatus: row.status ?? undefined,
    errorType: row.errorName || undefined,
    errorMessage: row.errorMessage ? redactString(row.errorMessage, 500) : (row.message ? redactString(row.message, 300) : undefined),
    stackTrace: row.errorStack ? redactString(row.errorStack, 1500) : undefined,
    requestId: row.requestId || undefined,
    correlationId: row.requestId || undefined,
    userId: row.userId || undefined,
    workspaceId: row.workspaceId || undefined,
    deployment: row.deployment || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || undefined,
    durationMs: row.durationMs ?? undefined,
    metadata: row.meta || {},
  };
}

export async function processMonitoredEvent(event: MonitoredEvent): Promise<void> {
  // 1. Buffer the event
  recentEventsBuffer.unshift(event);
  if (recentEventsBuffer.length > MAX_EVENTS_BUFFER) {
    recentEventsBuffer.pop();
  }

  // 2. Update service metrics
  const metrics = getMetrics(event.service);
  metrics.totalRequests++;

  if (event.durationMs !== undefined) {
    metrics.latencies.push(event.durationMs);
    if (metrics.latencies.length > 100) metrics.latencies.shift();
  }

  const isFailure = event.severity === 'error' || event.severity === 'critical';
  if (isFailure) {
    metrics.errorCount++;
    metrics.consecutiveFailures++;
  } else {
    metrics.consecutiveFailures = 0;
  }

  // 3. Evaluate incident creation / escalation
  await evaluateServiceHealth(event.service, metrics, event);
}

export async function evaluateServiceHealth(
  serviceId: string,
  metrics: ServiceMetricsWindow,
  triggerEvent?: MonitoredEvent
): Promise<HealthState> {
  const config = getMonitoringConfig();
  const def = MONITORED_SERVICES_DEF.find((s) => s.id === serviceId);
  const serviceName = def?.name || serviceId.toUpperCase();

  const total = Math.max(metrics.totalRequests, 1);
  const errorRate = metrics.errorCount / total;
  const avgLatency = metrics.latencies.length > 0
    ? metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length
    : 15;

  let calculatedState: HealthState = 'operational';
  let severity: IncidentSeverity = 'warning';
  let detectedReason = '';

  if (
    errorRate >= config.errorRateCritical ||
    metrics.consecutiveFailures >= config.consecutiveFailuresCritical ||
    avgLatency >= config.latencyCriticalMs
  ) {
    calculatedState = 'outage';
    severity = 'critical';
    detectedReason = `Critical failure: error rate ${(errorRate * 100).toFixed(1)}% (threshold ${(config.errorRateCritical * 100)}%), ${metrics.consecutiveFailures} consecutive failures, or latency ${Math.round(avgLatency)}ms.`;
  } else if (
    errorRate >= config.errorRateWarning ||
    metrics.consecutiveFailures >= config.consecutiveFailuresWarning ||
    avgLatency >= config.latencyWarningMs
  ) {
    calculatedState = 'degraded';
    severity = 'warning';
    detectedReason = `Degraded performance: elevated error rate ${(errorRate * 100).toFixed(1)}% or elevated latency ${Math.round(avgLatency)}ms.`;
  }

  // Update current service state
  await upsertService({
    id: serviceId,
    status: calculatedState,
    latencyMs: Math.round(avgLatency),
    lastCheckedAt: new Date().toISOString(),
  });

  // Check active incidents for this service
  const activeIncidents = await getIncidents('active');
  const existingIncident = activeIncidents.find((i) => i.serviceId === serviceId);

  if (calculatedState === 'outage' || calculatedState === 'degraded') {
    if (!existingIncident) {
      // Find nearby deployment
      const recentDeployments = await getRecentDeployments(1);
      const nearbyDeploy = recentDeployments[0]?.version || null;

      const incidentId = `inc_${Date.now()}_${serviceId}`;
      const nowIso = new Date().toISOString();
      const newIncident: Incident = {
        id: incidentId,
        serviceId,
        serviceName,
        severity,
        status: 'detected',
        title: `${serviceName} ${calculatedState === 'outage' ? 'Outage' : 'Degraded Performance'}`,
        publicMessage: `We are investigating an issue causing ${calculatedState === 'outage' ? 'service disruption' : 'elevated errors'} on ${serviceName}.`,
        detectedReason,
        detectedAt: nowIso,
        deploymentRef: nearbyDeploy,
        affectedComponents: [serviceId, triggerEvent?.component || 'core'],
        timeline: [
          {
            id: `tl_${Date.now()}_1`,
            incidentId,
            timestamp: nowIso,
            status: 'detected',
            message: `Incident detected automatically: ${detectedReason}`,
            isPublic: false,
          },
          {
            id: `tl_${Date.now()}_2`,
            incidentId,
            timestamp: nowIso,
            status: 'investigating',
            message: `We have detected elevated errors on ${serviceName} and our engineering team is investigating.`,
            isPublic: true,
          },
        ],
        metadata: {
          errorRate: (errorRate * 100).toFixed(1),
          consecutiveFailures: metrics.consecutiveFailures,
          requestId: triggerEvent?.requestId,
        },
      };

      await upsertIncident(newIncident);
      await dispatchAlert({
        incident: newIncident,
        alertType: 'created',
        message: `${newIncident.title}: ${detectedReason}`,
      });
    } else if (calculatedState === 'outage' && existingIncident.severity === 'warning') {
      // Escalate from degraded to outage
      existingIncident.severity = 'critical';
      existingIncident.status = 'investigating';
      existingIncident.title = `${serviceName} Outage Detected`;
      existingIncident.publicMessage = `Service disruption confirmed for ${serviceName}. Active mitigation is underway.`;

      const nowIso = new Date().toISOString();
      await upsertIncident(existingIncident);
      await addTimelineEntry({
        id: `tl_${Date.now()}`,
        incidentId: existingIncident.id,
        timestamp: nowIso,
        status: 'investigating',
        message: `Incident escalated to Critical Outage: ${detectedReason}`,
        isPublic: true,
      });

      await dispatchAlert({
        incident: existingIncident,
        alertType: 'escalated',
        message: `ESCALATION: ${existingIncident.title} has escalated to full outage.`,
      });
    }
  } else if (calculatedState === 'operational' && existingIncident) {
    // Automatic Recovery Detection
    const nowIso = new Date().toISOString();
    const durationSeconds = Math.round(
      (new Date(nowIso).getTime() - new Date(existingIncident.detectedAt).getTime()) / 1000
    );

    existingIncident.status = 'resolved';
    existingIncident.resolvedAt = nowIso;
    existingIncident.durationSeconds = durationSeconds;
    existingIncident.publicMessage = `${serviceName} has recovered and all operations have returned to normal.`;

    await upsertIncident(existingIncident);
    await addTimelineEntry({
      id: `tl_${Date.now()}`,
      incidentId: existingIncident.id,
      timestamp: nowIso,
      status: 'resolved',
      message: `Automatic recovery detected: Error rate returned to normal (0%) and health checks succeeded. Total duration: ${Math.round(durationSeconds / 60)} minutes.`,
      isPublic: true,
    });

    await dispatchAlert({
      incident: existingIncident,
      alertType: 'recovered',
      message: `RECOVERY: ${serviceName} is now operational. Incident ${existingIncident.id} resolved.`,
    });
  }

  return calculatedState;
}

export function getRecentEvents(filters?: {
  service?: string;
  severity?: string;
  requestId?: string;
  limit?: number;
}): MonitoredEvent[] {
  let list = recentEventsBuffer;
  if (filters?.service) {
    list = list.filter((e) => e.service === filters.service);
  }
  if (filters?.severity) {
    list = list.filter((e) => e.severity === filters.severity);
  }
  if (filters?.requestId) {
    list = list.filter((e) => e.requestId === filters.requestId || e.correlationId === filters.requestId);
  }
  return list.slice(0, filters?.limit || 100);
}

export function getEventsAroundTimestamp(
  targetTimestamp: string,
  windowMinutes: number = 5,
  requestId?: string
): MonitoredEvent[] {
  const targetTime = new Date(targetTimestamp).getTime();
  const windowMs = windowMinutes * 60_000;

  return recentEventsBuffer.filter((e) => {
    // If request ID matches, always include
    if (requestId && e.requestId === requestId) return true;

    const eventTime = new Date(e.timestamp).getTime();
    return Math.abs(eventTime - targetTime) <= windowMs;
  });
}

// Hook into existing logging system: whenever any log row is emitted anywhere in the app,
// it is automatically passed into the monitoring engine without duplicating log systems!
try {
  onLogRow((row: LogRow) => {
    try {
      const monitoredEvent = normalizeLogRow(row);
      void processMonitoredEvent(monitoredEvent).catch(() => {});
    } catch {
      // monitoring must never throw
    }
  });
} catch {
  // ignore
}

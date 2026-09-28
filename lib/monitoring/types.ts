export type HealthState = 'operational' | 'degraded' | 'outage';

export type IncidentSeverity = 'warning' | 'critical';

export type IncidentStatus =
  | 'detected'
  | 'investigating'
  | 'identified'
  | 'monitoring'
  | 'resolved';

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface MonitoredService {
  id: string;
  name: string;
  category: 'core' | 'ai' | 'data' | 'channels' | 'infra';
  description: string;
  status: HealthState;
  latencyMs: number;
  lastCheckedAt: string;
  uptime30d: number;
  metadata?: Record<string, unknown>;
}

export interface ServiceHealthResult {
  serviceId: string;
  status: HealthState;
  latencyMs: number;
  checkedAt: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface IncidentTimelineEntry {
  id: string;
  incidentId: string;
  timestamp: string;
  status: IncidentStatus;
  message: string;
  isPublic: boolean;
  createdBy?: string;
}

export interface Incident {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  publicMessage: string;
  detectedReason: string;
  detectedAt: string;
  resolvedAt?: string | null;
  durationSeconds?: number | null;
  deploymentRef?: string | null;
  affectedComponents: string[];
  timeline: IncidentTimelineEntry[];
  metadata?: Record<string, unknown>;
}

export interface MonitoredEvent {
  id: string;
  timestamp: string;
  severity: EventSeverity;
  service: string;
  component: string;
  environment: string;
  endpoint?: string;
  method?: string;
  httpStatus?: number;
  errorType?: string;
  errorMessage?: string;
  stackTrace?: string;
  requestId?: string;
  correlationId?: string;
  userId?: string;
  workspaceId?: string;
  jobId?: string;
  deployment?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  incidentId?: string;
  recoveryTimestamp?: string;
}

export interface DeploymentRecord {
  id: string;
  version: string;
  commitSha?: string;
  deployedAt: string;
  environment: string;
  summary?: string;
}

export interface MonitoringAlert {
  id: string;
  incidentId: string;
  serviceId: string;
  alertType: 'created' | 'escalated' | 'recovered';
  sentAt: string;
  channel: 'email' | 'webhook' | 'slack';
  recipient: string;
  message: string;
  status: 'sent' | 'failed';
}

export interface SystemStatusSummary {
  overallStatus: HealthState;
  overallMessage: string;
  lastUpdated: string;
  services: MonitoredService[];
  activeIncidents: Incident[];
  pastIncidents: Incident[];
  uptimeHistory: {
    serviceId: string;
    serviceName: string;
    days: Array<{
      date: string;
      uptimePercent: number;
      status: HealthState;
    }>;
  }[];
}

export interface MonitoringConfig {
  errorRateWarning: number; // e.g. 0.05 (5%)
  errorRateCritical: number; // e.g. 0.20 (20%)
  latencyWarningMs: number; // e.g. 1500ms
  latencyCriticalMs: number; // e.g. 4000ms
  consecutiveFailuresWarning: number; // e.g. 3
  consecutiveFailuresCritical: number; // e.g. 5
  alertCooldownMinutes: number; // e.g. 30
  rawEventsRetentionDays: number; // e.g. 30
  errorsRetentionDays: number; // e.g. 90
  incidentsRetentionDays: number; // e.g. 365
  publicStatusRefreshSec: number; // e.g. 30
  webhookUrl?: string;
}

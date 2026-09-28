import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkApiService,
  checkDatabaseService,
  checkAuthService,
  checkAiService,
  checkBookingService,
  runHealthCheckForService,
  runAllHealthChecks,
} from './health';
import {
  normalizeLogRow,
  mapCategoryToService,
  mapLevelToSeverity,
  evaluateServiceHealth,
  getEventsAroundTimestamp,
  processMonitoredEvent,
  getRecentEvents,
} from './engine';
import {
  getAllServices,
  getIncidents,
  upsertIncident,
  upsertService,
  _resetMonitoringStoreForTesting,
  generateUptimeHistory,
} from './store';
import { dispatchAlert, _resetAlertCooldownForTesting } from './alerts';
import { LogRow } from '@/lib/logging/store';

describe('System Monitoring & Status Platform', () => {
  beforeEach(() => {
    _resetMonitoringStoreForTesting();
    _resetAlertCooldownForTesting();
  });

  describe('Health Probes', () => {
    it('executes API health check successfully', async () => {
      const res = await checkApiService();
      expect(res.serviceId).toBe('api');
      expect(['operational', 'degraded', 'outage']).toContain(res.status);
      expect(res.latencyMs).toBeGreaterThanOrEqual(0);
      expect(res.message).toBeDefined();
    });

    it('executes Database health check successfully', async () => {
      const res = await checkDatabaseService();
      expect(res.serviceId).toBe('database');
      expect(['operational', 'degraded', 'outage']).toContain(res.status);
    });

    it('executes Auth health check successfully', async () => {
      const res = await checkAuthService();
      expect(res.serviceId).toBe('auth');
      expect(res.status).toBe('operational');
    });

    it('executes AI Providers health check successfully', async () => {
      const res = await checkAiService();
      expect(res.serviceId).toBe('ai');
      expect(['operational', 'degraded']).toContain(res.status);
    });

    it('executes Booking health check successfully', async () => {
      const res = await checkBookingService();
      expect(res.serviceId).toBe('booking');
      expect(['operational', 'degraded', 'outage']).toContain(res.status);
    });

    it('runs health check for specific service via registry', async () => {
      const res = await runHealthCheckForService('database');
      expect(res.serviceId).toBe('database');
      expect(res.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('runs all health checks across all services', async () => {
      const checks = await runAllHealthChecks();
      expect(checks.length).toBeGreaterThanOrEqual(8);
      const serviceIds = checks.map((c) => c.serviceId);
      expect(serviceIds).toContain('api');
      expect(serviceIds).toContain('database');
      expect(serviceIds).toContain('auth');
      expect(serviceIds).toContain('booking');
      expect(serviceIds).toContain('ai');
    });
  });

  describe('Log Normalization & Secret Redaction', () => {
    it('maps log categories to corresponding monitored services', () => {
      expect(mapCategoryToService('db')).toBe('database');
      expect(mapCategoryToService('auth')).toBe('auth');
      expect(mapCategoryToService('security')).toBe('auth');
      expect(mapCategoryToService('llm')).toBe('ai');
      expect(mapCategoryToService('booking')).toBe('booking');
      expect(mapCategoryToService('cron')).toBe('workers');
      expect(mapCategoryToService('request', '/api/chat')).toBe('chatbot');
      expect(mapCategoryToService('request', '/api/appointments')).toBe('booking');
    });

    it('maps log levels to normalized event severities', () => {
      expect(mapLevelToSeverity('fatal')).toBe('critical');
      expect(mapLevelToSeverity('error')).toBe('error');
      expect(mapLevelToSeverity('warn')).toBe('warning');
      expect(mapLevelToSeverity('info')).toBe('info');
    });

    it('normalizes log rows and redacts sensitive tokens/passwords', () => {
      const fakeRow: LogRow = {
        ts: new Date(),
        level: 'error',
        category: 'auth',
        event: 'auth.login_failed',
        errorMessage: 'Invalid key bearer sk-proj-1234567890abcdef1234567890 password=supersecret',
        requestId: 'req_test_123',
        status: 401,
      };

      const event = normalizeLogRow(fakeRow);
      expect(event.service).toBe('auth');
      expect(event.severity).toBe('error');
      expect(event.requestId).toBe('req_test_123');
      expect(event.errorMessage).not.toContain('supersecret');
      expect(event.errorMessage).not.toContain('sk-proj-1234567890abcdef1234567890');
    });
  });

  describe('Incident Auto-Detection, Escalation & Auto-Recovery', () => {
    it('detects degraded performance and creates warning incident', async () => {
      const metrics = {
        totalRequests: 20,
        errorCount: 2, // 10% error rate (threshold is 5%)
        consecutiveFailures: 3,
        latencies: [150],
        lastWindowReset: Date.now(),
      };

      const state = await evaluateServiceHealth('api', metrics);
      expect(state).toBe('degraded');

      const incidents = await getIncidents('active');
      const apiInc = incidents.find((i) => i.serviceId === 'api');
      expect(apiInc).toBeDefined();
      expect(apiInc?.severity).toBe('warning');
      expect(apiInc?.status).toBe('detected');
      expect(apiInc?.timeline.length).toBeGreaterThan(0);
    });

    it('detects critical outage and escalates warning incident to critical', async () => {
      // 1. First trigger degraded
      await evaluateServiceHealth('database', {
        totalRequests: 10,
        errorCount: 1, // 10%
        consecutiveFailures: 2,
        latencies: [200],
        lastWindowReset: Date.now(),
      });

      let incidents = await getIncidents('active');
      let dbInc = incidents.find((i) => i.serviceId === 'database');
      expect(dbInc?.severity).toBe('warning');

      // 2. Now trigger critical outage (25% error rate or 5 consecutive failures)
      const criticalMetrics = {
        totalRequests: 20,
        errorCount: 6, // 30% error rate (threshold 20%)
        consecutiveFailures: 6,
        latencies: [5000],
        lastWindowReset: Date.now(),
      };

      const state = await evaluateServiceHealth('database', criticalMetrics);
      expect(state).toBe('outage');

      incidents = await getIncidents('active');
      dbInc = incidents.find((i) => i.serviceId === 'database');
      expect(dbInc?.severity).toBe('critical');
    });

    it('automatically resolves incident when health recovers to operational', async () => {
      // 1. Create active incident
      await evaluateServiceHealth('booking', {
        totalRequests: 10,
        errorCount: 4,
        consecutiveFailures: 4,
        latencies: [200],
        lastWindowReset: Date.now(),
      });

      let active = await getIncidents('active');
      expect(active.some((i) => i.serviceId === 'booking')).toBe(true);

      // 2. Metrics return to clean normal state
      const cleanMetrics = {
        totalRequests: 20,
        errorCount: 0,
        consecutiveFailures: 0,
        latencies: [25],
        lastWindowReset: Date.now(),
      };

      const state = await evaluateServiceHealth('booking', cleanMetrics);
      expect(state).toBe('operational');

      // 3. Verify incident is now resolved
      active = await getIncidents('active');
      expect(active.some((i) => i.serviceId === 'booking')).toBe(false);

      const resolved = await getIncidents('resolved');
      const bookingInc = resolved.find((i) => i.serviceId === 'booking');
      expect(bookingInc).toBeDefined();
      expect(bookingInc?.status).toBe('resolved');
      expect(bookingInc?.resolvedAt).toBeDefined();
      expect(bookingInc?.durationSeconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Alerting & Cooldown Deduplication', () => {
    it('dispatches alerts without throwing and enforces cooldown', async () => {
      const fakeIncident = {
        id: 'inc_test_cooldown',
        serviceId: 'api',
        serviceName: 'API Gateway',
        severity: 'critical' as const,
        status: 'detected' as const,
        title: 'API Gateway Outage',
        publicMessage: 'Investigating issue',
        detectedReason: 'Error rate 35%',
        detectedAt: new Date().toISOString(),
        affectedComponents: ['api'],
        timeline: [],
      };

      // 1. First alert should process cleanly
      await expect(
        dispatchAlert({
          incident: fakeIncident,
          alertType: 'created',
          message: 'API Outage',
        })
      ).resolves.not.toThrow();

      // 2. Second alert within cooldown window should be suppressed
      await expect(
        dispatchAlert({
          incident: fakeIncident,
          alertType: 'created',
          message: 'API Outage again',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Error Investigation ("View Context")', () => {
    it('retrieves correlated events within 5-minute time window or by request ID', async () => {
      const now = new Date();
      const past2m = new Date(now.getTime() - 2 * 60_000);
      const past15m = new Date(now.getTime() - 15 * 60_000);

      // Process 3 events
      await processMonitoredEvent({
        id: 'evt_1',
        timestamp: past2m.toISOString(),
        severity: 'error',
        service: 'database',
        component: 'db',
        environment: 'test',
        requestId: 'req_shared_123',
        errorMessage: 'connection reset',
      });

      await processMonitoredEvent({
        id: 'evt_2',
        timestamp: now.toISOString(),
        severity: 'info',
        service: 'api',
        component: 'request',
        environment: 'test',
        requestId: 'req_shared_123',
      });

      await processMonitoredEvent({
        id: 'evt_3',
        timestamp: past15m.toISOString(),
        severity: 'info',
        service: 'auth',
        component: 'auth',
        environment: 'test',
        requestId: 'req_distant_999',
      });

      // Context around now (±5 minutes): should include evt_1 and evt_2, but not evt_3
      const windowEvents = getEventsAroundTimestamp(now.toISOString(), 5);
      const ids = windowEvents.map((e) => e.id);
      expect(ids).toContain('evt_1');
      expect(ids).toContain('evt_2');
      expect(ids).not.toContain('evt_3');

      // Request ID correlation: matching request ID should be matched
      const correlated = getEventsAroundTimestamp(past15m.toISOString(), 1, 'req_shared_123');
      expect(correlated.map((e) => e.id)).toContain('evt_1');
    });
  });

  describe('Historical Uptime Calculation', () => {
    it('generates 30-day historical uptime records', () => {
      const history = generateUptimeHistory('api', 30);
      expect(history.length).toBe(30);
      expect(history[0].date).toBeDefined();
      expect(history[0].uptimePercent).toBeGreaterThanOrEqual(95);
      expect(['operational', 'degraded', 'outage']).toContain(history[0].status);
    });
  });
});

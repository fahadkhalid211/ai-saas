import { NextResponse } from 'next/server';
import { getAllServices, getIncidents, generateUptimeHistory } from '@/lib/monitoring/store';
import { HealthState, Incident, SystemStatusSummary } from '@/lib/monitoring/types';

export const dynamic = 'force-dynamic';

function scrubIncident(inc: Incident): Incident {
  return {
    id: inc.id,
    serviceId: inc.serviceId,
    serviceName: inc.serviceName,
    severity: inc.severity,
    status: inc.status,
    title: inc.title,
    publicMessage: inc.publicMessage,
    detectedReason: inc.detectedReason,
    detectedAt: inc.detectedAt,
    resolvedAt: inc.resolvedAt,
    durationSeconds: inc.durationSeconds,
    affectedComponents: inc.affectedComponents,
    timeline: (inc.timeline || [])
      .filter((t) => t.isPublic)
      .map((t) => ({
        id: t.id,
        incidentId: t.incidentId,
        timestamp: t.timestamp,
        status: t.status,
        message: t.message,
        isPublic: true,
      })),
  };
}

export async function GET() {
  const services = await getAllServices();
  const allIncidents = await getIncidents('all');

  const activeIncidents = allIncidents.filter((i) => i.status !== 'resolved').map(scrubIncident);
  const pastIncidents = allIncidents.filter((i) => i.status === 'resolved').slice(0, 10).map(scrubIncident);

  let overallStatus: HealthState = 'operational';
  let overallMessage = 'All Systems Operational';

  const hasOutage = services.some((s) => s.status === 'outage');
  const hasDegraded = services.some((s) => s.status === 'degraded');

  if (hasOutage) {
    overallStatus = 'outage';
    overallMessage = 'Major System Outage';
  } else if (hasDegraded) {
    overallStatus = 'degraded';
    overallMessage = 'Some Systems Experiencing Degraded Performance';
  }

  const uptimeHistory = services.map((s) => ({
    serviceId: s.id,
    serviceName: s.name,
    days: generateUptimeHistory(s.id, 30),
  }));

  const summary: SystemStatusSummary = {
    overallStatus,
    overallMessage,
    lastUpdated: new Date().toISOString(),
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      status: s.status,
      latencyMs: s.latencyMs,
      lastCheckedAt: s.lastCheckedAt,
      uptime30d: s.uptime30d,
    })),
    activeIncidents,
    pastIncidents,
    uptimeHistory,
  };

  return NextResponse.json(summary, {
    headers: {
      'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
    },
  });
}

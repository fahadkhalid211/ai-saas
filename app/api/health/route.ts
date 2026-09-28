import { NextResponse } from 'next/server';
import { runAllHealthChecks } from '@/lib/monitoring/health';
import { getAllServices, getIncidents } from '@/lib/monitoring/store';
import { HealthState } from '@/lib/monitoring/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shouldRunFresh = url.searchParams.get('fresh') === 'true';

  let checks;
  if (shouldRunFresh) {
    checks = await runAllHealthChecks();
  }

  const services = await getAllServices();
  const activeIncidents = await getIncidents('active');

  // Overall status calculation
  let overallStatus: HealthState = 'operational';
  const hasOutage = services.some((s) => s.status === 'outage');
  const hasDegraded = services.some((s) => s.status === 'degraded');

  if (hasOutage) {
    overallStatus = 'outage';
  } else if (hasDegraded) {
    overallStatus = 'degraded';
  }

  const httpStatus = overallStatus === 'outage' ? 503 : (overallStatus === 'degraded' ? 200 : 200);

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      activeIncidentsCount: activeIncidents.length,
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        latencyMs: s.latencyMs,
        lastCheckedAt: s.lastCheckedAt,
        uptime30d: s.uptime30d,
      })),
      checks: checks || undefined,
    },
    {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

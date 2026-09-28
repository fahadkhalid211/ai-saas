import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { runAllHealthChecks, runHealthCheckForService } from '@/lib/monitoring/health';
import {
  getAllServices,
  getIncidents,
  getRecentAlerts,
  getRecentDeployments,
  recordDeployment,
} from '@/lib/monitoring/store';
import { getMonitoringConfig } from '@/lib/monitoring/config';
import { DeploymentRecord } from '@/lib/monitoring/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  const [services, incidents, alerts, deployments] = await Promise.all([
    getAllServices(),
    getIncidents('all'),
    getRecentAlerts(20),
    getRecentDeployments(10),
  ]);

  const config = getMonitoringConfig();

  return NextResponse.json({
    services,
    incidents,
    alerts,
    deployments,
    config,
  });
}

export async function POST(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'run_health_check') {
      const { serviceId } = body;
      if (serviceId) {
        const result = await runHealthCheckForService(serviceId);
        return NextResponse.json({ success: true, result });
      }
      const results = await runAllHealthChecks();
      return NextResponse.json({ success: true, results });
    }

    if (action === 'record_deployment') {
      const { version, commitSha, environment, summary } = body;
      const record: DeploymentRecord = {
        id: `dep_${Date.now()}`,
        version: version || 'v1.0.0',
        commitSha: commitSha || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
        deployedAt: new Date().toISOString(),
        environment: environment || process.env.NODE_ENV || 'production',
        summary: summary || 'Application deployment',
      };
      await recordDeployment(record);
      return NextResponse.json({ success: true, deployment: record });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Admin action failed' }, { status: 500 });
  }
}

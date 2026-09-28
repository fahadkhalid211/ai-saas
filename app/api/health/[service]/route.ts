import { NextResponse } from 'next/server';
import { runHealthCheckForService } from '@/lib/monitoring/health';
import { MONITORED_SERVICES_DEF } from '@/lib/monitoring/config';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  const serviceId = service.toLowerCase().trim();

  const def = MONITORED_SERVICES_DEF.find((s) => s.id === serviceId);
  if (!def) {
    return NextResponse.json(
      { error: `Unknown service: '${serviceId}'`, validServices: MONITORED_SERVICES_DEF.map((s) => s.id) },
      { status: 404 }
    );
  }

  const check = await runHealthCheckForService(serviceId);
  const httpStatus = check.status === 'outage' ? 503 : 200;

  return NextResponse.json(check, {
    status: httpStatus,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

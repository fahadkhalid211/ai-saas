import { NextResponse } from 'next/server';
import { runHealthCheckForService } from '@/lib/monitoring/health';
import { MONITORED_SERVICES_DEF } from '@/lib/monitoring/config';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  // Each call runs a live check (database ping and so on), so an anonymous caller must not be able to loop on it.
  const limited = enforceRateLimit(req, 'health-service', { windowMs: 60 * 1000, max: 20 });
  if (limited.errorResponse) return limited.errorResponse;
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

  // Public: report the state only, not which database or provider sits behind it.
  const { details: _internal, ...publicCheck } = check as typeof check & { details?: unknown };
  return NextResponse.json(publicCheck, {
    status: httpStatus,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { getEventsAroundTimestamp, getRecentEvents } from '@/lib/monitoring/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const contextTimestamp = url.searchParams.get('contextTimestamp');
  const requestId = url.searchParams.get('requestId') || undefined;
  const service = url.searchParams.get('service') || undefined;
  const severity = url.searchParams.get('severity') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 100;

  if (contextTimestamp) {
    // "View Context": Return events around this failure (±5 minutes) or matching requestId
    const contextEvents = getEventsAroundTimestamp(contextTimestamp, 5, requestId);
    return NextResponse.json({ events: contextEvents });
  }

  const events = getRecentEvents({
    service,
    severity,
    requestId,
    limit,
  });

  return NextResponse.json({ events });
}

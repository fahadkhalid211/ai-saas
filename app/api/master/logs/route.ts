import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { parseFilters, queryLogs } from '@/lib/logging/query';

export const dynamic = 'force-dynamic';

/** Master admin only: search the system log. Query: from, to, levels, categories, q, userId, workspaceId, requestId, route, event, fingerprint, statusMin, statusMax, before, order, limit. */
async function GETHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  try {
    const filters = parseFilters(new URL(req.url).searchParams);
    const result = await queryLogs(filters);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[Logs] query failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'Could not read the log' }, { status: 500 });
  }
}

// Reading the log is not itself logged on success (the live view polls); failures always are.
export const GET = logged(GETHandler, { route: '/api/master/logs', sample: 0 });

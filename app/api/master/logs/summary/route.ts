import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { summarizeLogs } from '@/lib/logging/query';

export const dynamic = 'force-dynamic';

/** Master admin only: counts, error groups, failing and slow routes for the last N hours (default 24, max 720). */
async function GETHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  try {
    const hours = Number(new URL(req.url).searchParams.get('hours')) || 24;
    return NextResponse.json(await summarizeLogs(hours), { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[Logs] summary failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'Could not summarise the log' }, { status: 500 });
  }
}

export const GET = logged(GETHandler, { route: '/api/master/logs/summary', sample: 0 });

import { NextRequest, NextResponse } from 'next/server';
import { getAdminKey } from '@/lib/security/auth';
import { timingSafeStringEqual } from '@/lib/security/password';
import { logged } from '@/lib/logging/route';
import { reembedStaleChunks } from '@/lib/rag/reembed';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Daily: rebuild vectors made by an older embedding model. Does nothing (one cheap count) when everything is current. */
async function GETHandler(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || req.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET || process.env.ADMIN_API_KEY || getAdminKey();
  if (!token || !timingSafeStringEqual(token, expected)) return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
  return NextResponse.json({ success: true, ...(await reembedStaleChunks({ limit: 400, budgetMs: 240_000 })) });
}

export const GET = logged(GETHandler, { route: '/api/cron/reembed' });

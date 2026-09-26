import { NextRequest, NextResponse } from 'next/server';
import { getAdminKey } from '@/lib/security/auth';
import { timingSafeStringEqual } from '@/lib/security/password';
import { logged } from '@/lib/logging/route';
import { recrawlDueSources } from '@/lib/rag/recrawl';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Daily: read web page sources again (every RECRAWL_DAYS, default 7) so answers follow changes on the page. */
async function GETHandler(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || req.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET || process.env.ADMIN_API_KEY || getAdminKey();
  if (!token || !timingSafeStringEqual(token, expected)) return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
  return NextResponse.json({ success: true, ...(await recrawlDueSources({ max: 10, budgetMs: 240_000 })) });
}

export const GET = logged(GETHandler, { route: '/api/cron/recrawl' });

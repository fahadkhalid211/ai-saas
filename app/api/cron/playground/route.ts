import { NextRequest, NextResponse } from 'next/server';
import { getAdminKey } from '@/lib/security/auth';
import { timingSafeStringEqual } from '@/lib/security/password';
import { logged } from '@/lib/logging/route';
import { purgeExpired } from '@/lib/playground/store';

export const dynamic = 'force-dynamic';

/** Daily: delete playground sessions (and the documents in them) older than 7 days. */
async function GETHandler(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || req.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET || process.env.ADMIN_API_KEY || getAdminKey();
  if (!token || !timingSafeStringEqual(token, expected)) return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
  return NextResponse.json({ success: true, removed: await purgeExpired() });
}

export const GET = logged(GETHandler, { route: '/api/cron/playground' });

import { NextRequest, NextResponse } from 'next/server';
import { getAdminKey } from '@/lib/security/auth';
import { timingSafeStringEqual } from '@/lib/security/password';
import { logged } from '@/lib/logging/route';
import { closeStaleResolved } from '@/lib/support/tickets';

export const dynamic = 'force-dynamic';

/** Daily: close tickets that were resolved a week ago with no reply (each requester is told by e-mail). */
async function GETHandler(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || req.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET || process.env.ADMIN_API_KEY || getAdminKey();
  if (!token || !timingSafeStringEqual(token, expected)) {
    return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
  }
  const closed = await closeStaleResolved();
  return NextResponse.json({ success: true, closed });
}

export const GET = logged(GETHandler, { route: '/api/cron/tickets' });

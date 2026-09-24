import { NextRequest, NextResponse } from 'next/server';
import { timingSafeStringEqual } from '@/lib/security/password';
import { getAdminKey } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';
import { purgeOldLogs, retentionDays } from '@/lib/logging/store';

export const dynamic = 'force-dynamic';

/** Daily: deletes log rows older than LOG_RETENTION_DAYS (default 30). Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. */
async function GETHandler(request: NextRequest) {
  const expected = process.env.CRON_SECRET || getAdminKey();
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || request.headers.get('x-cron-secret');
  if (!token || !timingSafeStringEqual(token, expected)) {
    return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
  }
  const days = retentionDays();
  const deleted = await purgeOldLogs(days);
  logEvent({ category: 'cron', event: 'cron.log_retention', meta: { days, deleted } });
  return NextResponse.json({ success: true, days, deleted });
}

export const GET = logged(GETHandler, { route: '/api/cron/log-retention' });

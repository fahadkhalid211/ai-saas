import { NextRequest, NextResponse } from 'next/server';
import { syncDueCalendars } from '@/lib/calendar/sync/sync-link';
import { getAdminKey, getAuthContext } from '@/lib/security/auth';
import { timingSafeStringEqual } from '@/lib/security/password';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Reads the linked calendars that have gone unread for a while and checks upcoming bookings for clashes. The scheduler is external:
 * call this every 5 to 10 minutes with the cron secret in a header (never in the address).
 */
async function GETHandler(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secretHeader = request.headers.get('x-cron-secret');
    const expectedKey = process.env.CRON_SECRET || process.env.ADMIN_API_KEY || getAdminKey();

    // Header only: a secret in the URL ends up in access logs and browser history.
    const token = authHeader?.replace(/^Bearer\s+/i, '') || secretHeader;
    // A signed-in customer must not be able to start the platform-wide run: only the scheduler's secret, or the platform owner's own session, can.
    const isPlatformOwner = (await getAuthContext(request)).isMasterAdmin === true;

    if (!isPlatformOwner && (!token || !timingSafeStringEqual(token, expectedKey))) {
      return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
    }

    const { checked, failed, skipped, clashChecksSkipped } = await syncDueCalendars();
    // skipped = due links not started (budget), clashChecksSkipped = assistants whose clash check did not fit: both are counts only.
    logEvent({ category: 'cron', event: 'cron.calendar_sync_run', meta: { checked, failed, skipped, clashChecksSkipped } });
    return NextResponse.json({ success: true, checked, failed, skipped, clashChecksSkipped });
  } catch (err: any) {
    // The error text could quote a database statement or a calendar address, so only its name is logged and nothing of it is returned.
    console.error('[CronCalendarSync] Execution failed:', err?.name);
    return NextResponse.json({ success: false, error: 'Calendar sync failed.' }, { status: 500 });
  }
}

async function POSTHandler(request: NextRequest) {
  return GETHandler(request);
}

export const GET = logged(GETHandler, { route: '/api/cron/calendar-sync' });
export const POST = logged(POSTHandler, { route: '/api/cron/calendar-sync' });

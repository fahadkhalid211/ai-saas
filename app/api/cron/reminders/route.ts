import { NextRequest, NextResponse } from 'next/server';
import { processScheduledReminders } from '@/lib/reminders';
import { getAdminKey, verifyAdminRequest } from '@/lib/security/auth';
import { timingSafeStringEqual } from '@/lib/security/password';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';

async function GETHandler(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secretHeader = request.headers.get('x-cron-secret');
    const expectedKey = process.env.CRON_SECRET || process.env.ADMIN_API_KEY || getAdminKey();

    // Header only: a secret in the URL ends up in access logs and browser history.
    const token = authHeader?.replace(/^Bearer\s+/i, '') || secretHeader;
    const isSessionAuthed = await verifyAdminRequest(request);

    if (!isSessionAuthed && (!token || !timingSafeStringEqual(token, expectedKey))) {
      return NextResponse.json({ error: 'Unauthorized cron access' }, { status: 401 });
    }

    const result = await processScheduledReminders();
    logEvent({ category: 'cron', event: 'cron.reminders_run', meta: { appointments: result.totalActiveAppointments, sent24h: result.sent24h, sent1h: result.sent1h } });
    return NextResponse.json({
      success: true,
      message: `Processed ${result.totalActiveAppointments} appointments: ${result.sent24h} 24h reminders and ${result.sent1h} 1h reminders sent.`,
      result,
    });
  } catch (err: any) {
    console.error('[CronReminders] Execution failed:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error processing reminders' },
      { status: 500 }
    );
  }
}

async function POSTHandler(request: NextRequest) {
  return GETHandler(request);
}

export const GET = logged(GETHandler, { route: '/api/cron/reminders' });
export const POST = logged(POSTHandler, { route: '/api/cron/reminders' });

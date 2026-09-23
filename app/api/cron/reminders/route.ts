import { NextRequest, NextResponse } from 'next/server';
import { processScheduledReminders } from '@/lib/reminders';
import { getAdminKey, verifyAdminRequest } from '@/lib/security/auth';
import { timingSafeStringEqual } from '@/lib/security/password';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  return GET(request);
}

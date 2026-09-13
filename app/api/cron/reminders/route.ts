import { NextRequest, NextResponse } from 'next/server';
import { processScheduledReminders } from '@/lib/reminders';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Basic auth check via header or search param
    const authHeader = request.headers.get('authorization');
    const secretHeader = request.headers.get('x-cron-secret');
    const searchParams = request.nextUrl.searchParams;
    const queryKey = searchParams.get('key');
    const expectedKey = process.env.CRON_SECRET || process.env.ADMIN_API_KEY || 'admin123';

    const token = authHeader?.replace(/^Bearer\s+/i, '') || secretHeader || queryKey;
    if (expectedKey && token !== expectedKey && process.env.NODE_ENV === 'production') {
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

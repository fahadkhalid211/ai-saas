import { NextResponse } from 'next/server';
import { isCloudDbConfigured, getCloudDbProvider, fetchCloudState } from '@/lib/db/cloud';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isServerless =
      Boolean(process.env.VERCEL) ||
      Boolean(process.env.VERCEL_ENV) ||
      Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
      Boolean(process.env.LAMBDA_TASK_ROOT);

    const configured = isCloudDbConfigured();
    const provider = getCloudDbProvider();

    if (!configured) {
      return NextResponse.json({
        connected: false,
        provider: 'ephemeral',
        isServerless,
        message: isServerless
          ? 'Cloud database is not configured. Serverless memory is ephemeral: booked appointments and active chats will reset across lambdas. Add DATABASE_URL or Supabase credentials in your Vercel Environment Variables.'
          : 'Local filesystem database active (.data/db.json).',
      });
    }

    // Ping cloud database
    let reachable = true;
    try {
      await fetchCloudState();
    } catch {
      reachable = false;
    }

    return NextResponse.json({
      connected: reachable,
      provider,
      isServerless,
      message: reachable
        ? `Cloud database connected (${provider === 'postgres' ? 'PostgreSQL' : 'Supabase'}). All appointments, chats, and settings are permanently persisted.`
        : `Cloud database (${provider}) configured but currently unreachable.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        provider: 'ephemeral',
        error: error?.message || 'Failed to check database status',
      },
      { status: 500 }
    );
  }
}

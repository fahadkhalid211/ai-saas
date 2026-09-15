import { NextResponse } from 'next/server';
import { isCloudDbConfigured, getCloudDbProvider, fetchCloudState } from '@/lib/db/cloud';
import { isSupabaseConfigured, getSupabaseClient, getSupabaseUrl } from '@/lib/db/supabase';

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

    const supabaseDiagnostics: {
      configured: boolean;
      url?: string;
      tableExists?: boolean;
      error?: string;
    } = {
      configured: isSupabaseConfigured(),
    };

    if (supabaseDiagnostics.configured) {
      const sbUrl = getSupabaseUrl();
      supabaseDiagnostics.url = sbUrl ? sbUrl.replace(/^(https?:\/\/[^.]+).*/, '$1.supabase.co') : undefined;
      const sb = getSupabaseClient();
      if (sb) {
        try {
          const { error } = await sb.from('kortex_app_state').select('id').limit(1);
          if (error) {
            supabaseDiagnostics.tableExists = false;
            supabaseDiagnostics.error = error.message;
          } else {
            supabaseDiagnostics.tableExists = true;
          }
        } catch (e: any) {
          supabaseDiagnostics.tableExists = false;
          supabaseDiagnostics.error = e?.message || 'Connection failed';
        }
      }
    }

    if (!configured) {
      return NextResponse.json({
        connected: false,
        provider: 'ephemeral',
        isServerless,
        supabase: supabaseDiagnostics,
        message: isServerless
          ? 'Cloud database is not configured. Serverless memory is ephemeral: booked appointments and active chats will reset across lambdas. Add DATABASE_URL or Supabase credentials in your Vercel Environment Variables.'
          : 'Local filesystem database active (.data/db.json).',
      });
    }

    // Ping cloud database
    let reachable = false;
    let errMessage = '';
    try {
      const state = await fetchCloudState();
      reachable = state !== null;
    } catch (e: any) {
      reachable = false;
      errMessage = e?.message || 'Connection failed';
    }

    let statusMessage = '';
    if (reachable) {
      statusMessage = `Cloud database connected (${provider === 'postgres' ? 'PostgreSQL' : 'Supabase'}). All appointments, chats, and settings are permanently persisted.`;
    } else if (supabaseDiagnostics.configured && supabaseDiagnostics.tableExists === false) {
      statusMessage = `Supabase credentials detected, but table "kortex_app_state" is missing or blocked by RLS (${supabaseDiagnostics.error}). Run the setup SQL in Supabase.`;
    } else {
      statusMessage = `Cloud database (${provider}) configured but currently unreachable. ${errMessage}`.trim();
    }

    return NextResponse.json({
      connected: reachable,
      provider,
      isServerless,
      supabase: supabaseDiagnostics,
      message: statusMessage,
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

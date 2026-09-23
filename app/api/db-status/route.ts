import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/security/auth';
import { isCloudDbConfigured, getCloudDbProvider, pingCloudDb } from '@/lib/db/cloud';
import { isSupabaseConfigured, getSupabaseClient, getSupabaseUrl } from '@/lib/db/supabase';
import { isRedisConfigured, redisPing } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

/** Hide anything that reveals infrastructure (hostnames, driver errors) from everyone but the platform owner. */
function scrub<T extends Record<string, any>>(body: T, isMaster: boolean): T {
  if (isMaster) return body;
  const out: Record<string, any> = { ...body };
  delete out.error;
  if (out.supabase) out.supabase = { configured: out.supabase.configured };
  if (typeof out.message === 'string' && out.connected === false) {
    out.message = 'The database is currently unavailable. Please try again shortly.';
  }
  return out as T;
}

// Signed-in users only. It used to be public and put the database address in its error text.
export async function GET(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const isMaster = ctx.isMasterAdmin;
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

    const redisConfigured = isRedisConfigured();
    let redisConnected = false;
    if (redisConfigured) {
      redisConnected = await redisPing();
    }

    if (!configured) {
      return NextResponse.json(scrub({
        connected: false,
        provider: 'ephemeral',
        isServerless,
        supabase: supabaseDiagnostics,
        redis: {
          configured: redisConfigured,
          connected: redisConnected,
        },
        message: isServerless
          ? 'Cloud database is not configured. Serverless memory is ephemeral: booked appointments and active chats will reset across lambdas. Add DATABASE_URL or Supabase credentials in your Vercel Environment Variables.'
          : 'Local filesystem database active (.data/db.json).',
      }, isMaster));
    }

    // Ping cloud database with lightweight ping
    let reachable = false;
    let errMessage = '';
    try {
      const pingRes = await pingCloudDb();
      reachable = pingRes.reachable;
      if (!reachable && pingRes.error) {
        errMessage = pingRes.error;
      }
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

    return NextResponse.json(scrub({
      connected: reachable,
      provider,
      isServerless,
      supabase: supabaseDiagnostics,
      redis: {
        configured: redisConfigured,
        connected: redisConnected,
      },
      message: statusMessage,
    }, isMaster));
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        provider: 'ephemeral',
        error: isMaster ? error?.message || 'Failed to check database status' : 'Failed to check database status',
      },
      { status: 500 }
    );
  }
}

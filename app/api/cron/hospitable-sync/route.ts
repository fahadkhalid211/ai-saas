/**
 * GET /api/cron/hospitable-sync
 *
 * Scheduled cron endpoint — syncs all enabled Hospitable tenants.
 * Should be called every 15 minutes by your cron runner.
 *
 * Security: protected by CRON_SECRET environment variable.
 *
 * Vercel Cron: add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/hospitable-sync", "schedule": "*\/15 * * * *" }] }
 *
 * Self-host: the docker-compose.hospitable.yml cron service calls this endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncAllTenants } from '@/lib/integrations/hospitable/sync';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min — required for large portfolios

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  console.log('[hospitable-cron] Starting scheduled sync for all tenants');

  try {
    const results = await syncAllTenants();

    const totalSynced = results.reduce((n, r) => n + r.propertiesSynced, 0);
    const allErrors = results.flatMap((r) => r.errors);
    const rateLimited = results.some((r) => r.rateLimited);

    const durationMs = Date.now() - startedAt;
    console.log(
      `[hospitable-cron] Completed: ${results.length} tenants, ${totalSynced} properties, ${allErrors.length} errors in ${durationMs}ms`
    );

    return NextResponse.json({
      ok: true,
      tenantsProcessed: results.length,
      propertiesSynced: totalSynced,
      errors: allErrors.length > 0 ? allErrors : undefined,
      rateLimited,
      durationMs,
    });
  } catch (err: any) {
    console.error('[hospitable-cron] Fatal error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/connectors/hospitable/sync
 *
 * Manually triggers a full sync for the tenant associated with the given
 * assistantId. Called from the dashboard after initial connection or on demand.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { syncTenant } from '@/lib/integrations/hospitable/sync';
import { getPostgresPool } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // allow up to 5 minutes for large portfolios

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

function fail(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'hospitable-sync', {
      windowMs: 60_000,
      max: 5,
    });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { assistantId } = body as { assistantId?: string };

    if (!assistantId) return fail(400, 'assistantId is required');

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) return fail(404, 'Assistant not found');

    const pool = getPostgresPool();
    if (!pool) return fail(503, 'Database not configured');

    // Look up the tenant for this assistant
    const { rows } = await pool.query(
      'SELECT id FROM hospitable_tenants WHERE assistant_id = $1',
      [assistantId]
    );

    if (rows.length === 0) {
      return fail(404, 'No Hospitable connection found. Connect first via /api/connectors/hospitable/connect.');
    }

    const tenantId: string = rows[0].id;

    // Run sync (can take 10–120s depending on portfolio size)
    const result = await syncTenant(tenantId);

    return NextResponse.json(
      {
        success: true,
        propertiesSynced: result.propertiesSynced,
        errors: result.errors,
        rateLimited: result.rateLimited ?? false,
        retryAfterSeconds: result.retryAfterSeconds,
      },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    console.error('[hospitable-sync-route] Error:', err);
    return fail(500, err?.message ?? 'Internal server error');
  }
}

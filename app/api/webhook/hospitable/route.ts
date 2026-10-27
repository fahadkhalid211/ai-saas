/**
 * POST /api/webhook/hospitable
 *
 * Receives real-time event push notifications from Hospitable.
 * Verifies HMAC-SHA256 signature, deduplicates events via Redis,
 * then triggers a targeted re-sync of the affected tenant.
 *
 * Setup:
 *  1. Connect your account via /api/connectors/hospitable/connect
 *  2. Copy the returned webhookUrl and webhookSecret
 *  3. In Hospitable: Apps → Webhooks → Add new
 *     - URL: <your-app-url>/api/webhook/hospitable
 *     - Secret: <webhookSecret>
 *     - Events: Properties, Reservations, Messages, Reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getPostgresPool } from '@/lib/db/postgres';
import { syncTenant } from '@/lib/integrations/hospitable/sync';
import { getRedisClient } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Webhook events that trigger a re-sync */
const RESYNC_EVENTS = new Set([
  'property.created',
  'property.changed',
  'property.deleted',
  'property.merged',
  'reservation.created',
  'reservation.changed',
]);

export async function POST(req: NextRequest) {
  // 1. Read raw body (needed for HMAC verification)
  const rawBody = await req.text();

  if (!rawBody) {
    return NextResponse.json({ error: 'Empty body' }, { status: 400 });
  }

  // 2. Verify HMAC signature
  const signature = req.headers.get('x-hospitable-signature') ?? '';
  const tenant = await resolveTenantBySignature(signature, rawBody);

  if (!tenant) {
    console.warn('[hospitable-webhook] Invalid or missing HMAC signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3. Parse event
  let event: { id?: string; type: string; data?: unknown };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventId = event.id ?? `${event.type}-${Date.now()}`;

  // 4. Deduplicate via Redis (24h TTL)
  const redis = getRedisClient();
  if (redis) {
    try {
      const dedupKey = `hospitable:event:${eventId}`;
      // SET ... NX EX: only set if not exists, return null if already existed
      const result = await redis.set(dedupKey, '1', { nx: true, ex: 86_400 });
      if (result === null) {
        // Already processed
        return NextResponse.json({ ok: true, deduplicated: true });
      }
    } catch (err) {
      console.warn('[hospitable-webhook] Redis dedup failed (non-fatal):', err);
    }
  }

  console.log(`[hospitable-webhook] Received event: ${event.type} (tenant: ${tenant.id})`);

  // 5. Route event to sync engine
  if (RESYNC_EVENTS.has(event.type)) {
    // Fire-and-forget: respond immediately, sync in background
    syncTenant(tenant.id).catch((err) => {
      console.error(`[hospitable-webhook] Background sync error for tenant ${tenant.id}:`, err);
    });
  }

  return NextResponse.json({ ok: true, event: event.type });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface TenantRow {
  id: string;
  webhook_secret: string;
}

/**
 * Find the tenant whose webhook_secret matches the provided signature.
 * Uses timing-safe comparison to prevent timing attacks.
 */
async function resolveTenantBySignature(
  signature: string,
  body: string
): Promise<TenantRow | null> {
  if (!signature) return null;

  const pool = getPostgresPool();
  if (!pool) return null;

  const { rows } = await pool.query<TenantRow>(
    'SELECT id, webhook_secret FROM hospitable_tenants WHERE sync_enabled = TRUE'
  );

  for (const tenant of rows) {
    if (!tenant.webhook_secret) continue;

    try {
      const expected = createHmac('sha256', tenant.webhook_secret)
        .update(body, 'utf8')
        .digest('hex');

      // Pad to equal length before timing-safe compare
      const sigBuf = Buffer.from(signature.padEnd(expected.length, '\0'));
      const expBuf = Buffer.from(expected.padEnd(signature.length, '\0'));

      if (
        sigBuf.length === expBuf.length &&
        timingSafeEqual(sigBuf, expBuf)
      ) {
        return tenant;
      }
    } catch {
      // skip malformed secrets
    }
  }

  return null;
}

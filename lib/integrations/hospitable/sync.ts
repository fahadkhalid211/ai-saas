/**
 * Hospitable Sync Engine
 *
 * Pulls all properties, calendar (12 months), pricing, and reservations
 * from the Hospitable API and upserts them into the local database.
 * Also re-ingests property documents into the knowledge base.
 *
 * Called by:
 *  - /api/cron/hospitable-sync  (scheduled every 15 min)
 *  - /api/webhook/hospitable    (on real-time events)
 *  - /api/connectors/hospitable/sync  (manual trigger from dashboard)
 */

import { getPostgresPool } from '@/lib/db/postgres';
import {
  listProperties,
  getPropertyCalendar,
  getPropertyPricing,
  listReservations,
  RateLimitError,
  type HospitableProperty,
  type HospitableCalendarDay,
  type HospitablePricing,
} from './client';
import { decryptSecret } from '@/lib/security/crypto';
import { buildPropertyDocument, buildPropertySummaryDocument } from './document-builder';
import { ingestHospitableDocument } from './kb-ingestor';

/** How many days ahead to sync the availability calendar */
const CALENDAR_HORIZON_DAYS = 365;

// ---------------------------------------------------------------------------
// Public entrypoints
// ---------------------------------------------------------------------------

/**
 * Sync all data for a single tenant identified by their DB UUID.
 * Gracefully handles rate limiting and logs errors per-property.
 */
export async function syncTenant(tenantId: string): Promise<SyncResult> {
  const pool = getPostgresPool();
  if (!pool) throw new Error('[hospitable-sync] No PostgreSQL pool configured');

  const client = await pool.connect();
  const result: SyncResult = { tenantId, propertiesSynced: 0, errors: [] };

  try {
    const { rows } = await client.query(
      'SELECT id, assistant_id, access_token, sync_enabled FROM hospitable_tenants WHERE id = $1',
      [tenantId]
    );
    const tenant = rows[0];

    if (!tenant) {
      result.errors.push('Tenant not found');
      return result;
    }
    if (!tenant.sync_enabled) {
      console.log(`[hospitable-sync] Tenant ${tenantId} sync disabled — skipping`);
      return result;
    }

    const token = decryptSecret(tenant.access_token);
    if (!token) {
      result.errors.push('Failed to decrypt access token');
      return result;
    }

    // Sync properties (includes calendar, pricing, and KB ingestion)
    await syncProperties(token, tenantId, tenant.assistant_id, result);

    // Sync reservations separately (not per-property to avoid N+1 API calls)
    await syncReservations(token, tenantId);

    // Update last_synced_at timestamp
    await client.query(
      'UPDATE hospitable_tenants SET last_synced_at = NOW(), updated_at = NOW() WHERE id = $1',
      [tenantId]
    );
  } catch (err) {
    if (err instanceof RateLimitError) {
      console.warn(`[hospitable-sync] Rate limited for tenant ${tenantId}. Retry after ${err.retryAfterSeconds}s`);
      result.rateLimited = true;
      result.retryAfterSeconds = err.retryAfterSeconds;
    } else {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(msg);
      console.error(`[hospitable-sync] Error syncing tenant ${tenantId}:`, err);
    }
  } finally {
    client.release();
  }

  return result;
}

/**
 * Sync all enabled tenants. Used by the cron job.
 */
export async function syncAllTenants(): Promise<SyncResult[]> {
  const pool = getPostgresPool();
  if (!pool) return [];

  const { rows: tenants } = await pool.query(
    'SELECT id FROM hospitable_tenants WHERE sync_enabled = TRUE'
  );

  const results = await Promise.allSettled(
    tenants.map((t: { id: string }) => syncTenant(t.id))
  );

  return results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { tenantId: 'unknown', propertiesSynced: 0, errors: [String((r as PromiseRejectedResult).reason)] }
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function syncProperties(
  token: string,
  tenantId: string,
  assistantId: string,
  result: SyncResult
): Promise<void> {
  const { data: properties } = await listProperties(token);

  for (const prop of properties) {
    try {
      const propertyRow = await upsertProperty(prop, tenantId);
      await syncCalendar(token, propertyRow.id, prop.id);
      await syncPricing(token, propertyRow.id, prop.id);
      await ingestPropertyToKB(prop, propertyRow.id, assistantId);
      result.propertiesSynced++;
    } catch (err) {
      if (err instanceof RateLimitError) throw err; // Bubble up to stop sync
      const msg = `Property "${prop.name}" (${prop.id}): ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[hospitable-sync] ${msg}`);
      result.errors.push(msg);
    }
  }
}

async function upsertProperty(prop: HospitableProperty, tenantId: string) {
  const pool = getPostgresPool();
  if (!pool) throw new Error('No pool');

  const address = prop.address ? JSON.stringify(prop.address) : null;
  const amenities = prop.amenities ?? [];
  const photos = (prop.photos ?? []).map((p) =>
    typeof p === 'string' ? p : (p as { url: string }).url
  );

  const { rows } = await pool.query(
    `INSERT INTO hospitable_properties
       (tenant_id, hospitable_id, name, description, address, amenities, photos,
        max_guests, bedrooms, bathrooms, currency,
        base_nightly_rate, weekend_rate, cleaning_fee,
        min_stay, max_stay, booking_url, raw, synced_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW())
     ON CONFLICT (tenant_id, hospitable_id) DO UPDATE SET
       name              = EXCLUDED.name,
       description       = EXCLUDED.description,
       address           = EXCLUDED.address,
       amenities         = EXCLUDED.amenities,
       photos            = EXCLUDED.photos,
       max_guests        = EXCLUDED.max_guests,
       bedrooms          = EXCLUDED.bedrooms,
       bathrooms         = EXCLUDED.bathrooms,
       currency          = EXCLUDED.currency,
       base_nightly_rate = EXCLUDED.base_nightly_rate,
       weekend_rate      = EXCLUDED.weekend_rate,
       cleaning_fee      = EXCLUDED.cleaning_fee,
       min_stay          = EXCLUDED.min_stay,
       max_stay          = EXCLUDED.max_stay,
       booking_url       = EXCLUDED.booking_url,
       raw               = EXCLUDED.raw,
       synced_at         = NOW()
     RETURNING id`,
    [
      tenantId,
      prop.id,
      prop.name,
      prop.description ?? null,
      address,
      amenities,
      photos,
      prop.max_guests ?? null,
      prop.bedrooms ?? null,
      prop.bathrooms ?? null,
      prop.currency ?? 'USD',
      prop.base_nightly_rate ?? null,
      prop.weekend_rate ?? null,
      prop.cleaning_fee ?? null,
      prop.min_stay ?? 1,
      prop.max_stay ?? null,
      prop.booking_link ?? null,
      JSON.stringify(prop),
    ]
  );

  return rows[0] as { id: string };
}

async function syncCalendar(
  token: string,
  dbPropertyId: string,
  hospPropertyId: string
): Promise<void> {
  const pool = getPostgresPool();
  if (!pool) return;

  const today = new Date().toISOString().slice(0, 10);
  const endDate = new Date(Date.now() + CALENDAR_HORIZON_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const { data: days } = await getPropertyCalendar(token, hospPropertyId, today, endDate);

  if (days.length === 0) return;

  // Batch upsert using unnest for performance
  const dates: string[] = [];
  const availabilities: boolean[] = [];
  const minStays: (number | null)[] = [];
  const nightlyPrices: (number | null)[] = [];

  for (const day of days) {
    dates.push(day.date);
    availabilities.push(day.available);
    minStays.push(day.min_stay ?? null);
    nightlyPrices.push(day.nightly_price ?? null);
  }

  await pool.query(
    `INSERT INTO hospitable_calendar (property_id, date, available, min_stay, nightly_price, synced_at)
     SELECT $1, unnest($2::date[]), unnest($3::boolean[]), unnest($4::int[]), unnest($5::numeric[]), NOW()
     ON CONFLICT (property_id, date) DO UPDATE SET
       available     = EXCLUDED.available,
       min_stay      = EXCLUDED.min_stay,
       nightly_price = EXCLUDED.nightly_price,
       synced_at     = NOW()`,
    [dbPropertyId, dates, availabilities, minStays, nightlyPrices]
  );
}

async function syncPricing(
  token: string,
  dbPropertyId: string,
  hospPropertyId: string
): Promise<void> {
  const pool = getPostgresPool();
  if (!pool) return;

  const { data: pricing } = await getPropertyPricing(token, hospPropertyId);
  const currency = pricing.currency ?? 'USD';

  // Delete old rules for this property and re-insert fresh
  await pool.query(
    'DELETE FROM hospitable_pricing WHERE property_id = $1',
    [dbPropertyId]
  );

  const insertRule = async (
    ruleType: string,
    amount: number | undefined,
    startDate?: string,
    endDate?: string
  ) => {
    if (amount == null) return;
    await pool.query(
      `INSERT INTO hospitable_pricing (property_id, rule_type, start_date, end_date, amount, currency, synced_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [dbPropertyId, ruleType, startDate ?? null, endDate ?? null, amount, currency]
    );
  };

  await insertRule('base', pricing.base_nightly_rate);
  await insertRule('weekend', pricing.weekend_rate);
  await insertRule('cleaning_fee', pricing.cleaning_fee);
  await insertRule('extra_guest_fee', pricing.extra_guest_fee);
  await insertRule('pet_fee', pricing.pet_fee);
  await insertRule('resort_fee', pricing.resort_fee);

  for (const rule of pricing.rules ?? []) {
    await insertRule(rule.type, rule.amount, rule.start_date, rule.end_date);
  }
}

async function syncReservations(token: string, tenantId: string): Promise<void> {
  const pool = getPostgresPool();
  if (!pool) return;

  // Fetch up to 200 most recent reservations
  const { data: reservations } = await listReservations(token, {
    per_page: '200',
    include: 'guest,financials',
  });

  for (const res of reservations) {
    const { rows: propRows } = await pool.query(
      'SELECT id FROM hospitable_properties WHERE tenant_id = $1 AND hospitable_id = $2',
      [tenantId, res.property_id]
    );
    if (propRows.length === 0) continue;
    const dbPropertyId = propRows[0].id;

    await pool.query(
      `INSERT INTO hospitable_bookings
         (property_id, hospitable_id, guest_name, guest_email,
          check_in, check_out, status, guest_count,
          total_price, currency, channel, raw, synced_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
       ON CONFLICT (property_id, hospitable_id) DO UPDATE SET
         status       = EXCLUDED.status,
         check_in     = EXCLUDED.check_in,
         check_out    = EXCLUDED.check_out,
         total_price  = EXCLUDED.total_price,
         guest_count  = EXCLUDED.guest_count,
         raw          = EXCLUDED.raw,
         synced_at    = NOW()`,
      [
        dbPropertyId,
        res.id,
        res.guest?.name ?? null,
        res.guest?.email ?? null,
        res.check_in,
        res.check_out,
        res.status,
        res.guest_count ?? null,
        res.financials?.total ?? null,
        res.financials?.currency ?? 'USD',
        res.channel ?? null,
        JSON.stringify(res),
      ]
    );
  }
}

async function ingestPropertyToKB(
  prop: HospitableProperty,
  dbPropertyId: string,
  assistantId: string
): Promise<void> {
  const doc = buildPropertyDocument(prop, dbPropertyId);
  const summary = buildPropertySummaryDocument(prop, dbPropertyId);
  // Prepend summary as a short "overview" chunk so the first chunk acts as an index
  const fullDocument = `${summary}\n\n---\n\n${doc}`;
  await ingestHospitableDocument(assistantId, fullDocument, dbPropertyId, prop.name);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncResult {
  tenantId: string;
  propertiesSynced: number;
  errors: string[];
  rateLimited?: boolean;
  retryAfterSeconds?: number;
}

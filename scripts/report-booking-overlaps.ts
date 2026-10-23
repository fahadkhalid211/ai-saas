/**
 * CLI Report: overlapping bookings (calendar sync, Phase 1). READ ONLY.
 *
 * Usage:
 *   npx tsx scripts/report-booking-overlaps.ts --yes-this-is-the-database
 *
 * Lists pairs of non-cancelled bookings of the same assistant whose [slot_start, slot_end) ranges overlap.
 * Every pair must be fixed (cancel or move one booking) before supabase/schema-relational-v4b-no-overlap-constraint.sql
 * can be applied, because that statement fails while overlaps exist. Exit code 0 = none found, 1 = overlaps found.
 *
 * Also counts non-cancelled bookings with slot_start NULL (time unreadable or not yet backfilled): the
 * constraint does not cover them, so run scripts/backfill-slot-ranges.ts first.
 *
 * Safety: it only runs SELECTs inside a READ ONLY transaction. It still prints the database host (never the
 * password) first and aborts unless --yes-this-is-the-database is passed, because it connects to whatever
 * DATABASE_URL points at.
 */

import fs from 'node:fs';
import { findOverlaps } from '../lib/appointments/overlap-report';
import { parseDbHost } from '../lib/appointments/backfill-plan';

const CONFIRMED = process.argv.includes('--yes-this-is-the-database');

/** Reads .env into process.env without overriding values that are already set (same rule as scripts/apply-schema.mjs). */
function loadEnvFile(): void {
  if (!fs.existsSync('.env')) return;
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

async function main(): Promise<void> {
  loadEnvFile();

  const { getPostgresUrl, isPostgresConfigured, getPostgresPool } = await import('../lib/db/postgres');

  if (!isPostgresConfigured()) {
    console.error('[OverlapReport] Error: Postgres is not configured. Check DATABASE_URL / POSTGRES_URL.');
    process.exit(2);
  }

  const host = parseDbHost(getPostgresUrl());
  if (!host) {
    console.error('[OverlapReport] Aborting: cannot read the database host from the connection URL, so it cannot be confirmed.');
    process.exit(2);
  }
  console.log(`[OverlapReport] Database host: ${host}`);
  console.log('[OverlapReport] Mode: read only');

  if (!CONFIRMED) {
    console.error('[OverlapReport] Aborting: pass --yes-this-is-the-database to confirm this is the database you mean.');
    process.exit(2);
  }

  const pool = getPostgresPool();
  if (!pool) {
    console.error('[OverlapReport] Error: Could not acquire Postgres connection pool.');
    process.exit(2);
  }

  const client = await pool.connect();
  let rows: Array<{ id: string; assistant_id: string; slot_start: Date; slot_end: Date; date: string; time_slot: string; status: string }>;
  let nullCount = 0;
  try {
    await client.query('BEGIN READ ONLY');
    const res = await client.query(
      `SELECT id, assistant_id, slot_start, slot_end, date, time_slot, status
         FROM kortex_appointments
        WHERE slot_start IS NOT NULL AND status <> 'cancelled'`,
    );
    rows = res.rows;
    const nulls = await client.query(`SELECT COUNT(*)::int AS n FROM kortex_appointments WHERE slot_start IS NULL AND status <> 'cancelled'`);
    nullCount = nulls.rows[0]?.n ?? 0;
    await client.query('ROLLBACK');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[OverlapReport] Could not read kortex_appointments. Has schema-relational-v4-booking-ranges.sql been applied?');
    console.error(err);
    client.release();
    await pool.end().catch(() => {});
    process.exit(2);
  }
  client.release();

  const byId = new Map(rows.map((r) => [r.id, r]));
  const pairs = findOverlaps(
    rows.map((r) => ({ id: r.id, assistantId: r.assistant_id, slotStart: new Date(r.slot_start), slotEnd: new Date(r.slot_end) })),
  );

  console.log(`[OverlapReport] Non-cancelled bookings with a range: ${rows.length}`);
  console.log(`[OverlapReport] Non-cancelled bookings with NO range (not covered by the constraint): ${nullCount}`);
  console.log(`[OverlapReport] Overlapping pairs: ${pairs.length}`);

  const describe = (id: string): string => {
    const r = byId.get(id)!;
    return `${id} [${r.status}] ${r.date} ${r.time_slot} (${new Date(r.slot_start).toISOString()} - ${new Date(r.slot_end).toISOString()})`;
  };
  for (const [a, b] of pairs) {
    console.log(`  assistant ${byId.get(a)!.assistant_id}`);
    console.log(`    ${describe(a)}`);
    console.log(`    ${describe(b)}`);
  }

  if (pairs.length > 0) {
    console.log('[OverlapReport] Fix every pair above (delete one booking in the dashboard, or cancel it from the mobile app or the guest manage link), then run this report again.');
  } else {
    console.log('[OverlapReport] No overlaps. The v4b constraint can be applied.');
  }

  await pool.end().catch(() => {});
  process.exit(pairs.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[OverlapReport] Fatal error:', err);
  process.exit(2);
});

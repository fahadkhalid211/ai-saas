/**
 * CLI Backfill Script: slot_start / slot_end for existing bookings (calendar sync, Phase 1)
 *
 * Usage:
 *   npx tsx scripts/backfill-slot-ranges.ts --yes-this-is-the-database            dry run (default): writes nothing
 *   npx tsx scripts/backfill-slot-ranges.ts --yes-this-is-the-database --apply    writes slot_start / slot_end
 *
 * Run it only after supabase/schema-relational-v4-booking-ranges.sql is applied and the new code is deployed.
 *
 * For every kortex_appointments row with slot_start IS NULL it computes the UTC range from the booking's date,
 * time slot and duration in the assistant's timezone (lib/appointments/time-range.ts) and writes it with
 *   UPDATE kortex_appointments SET slot_start=$1, slot_end=$2 WHERE id=$3 AND slot_start IS NULL
 * so a row that already has a range is never changed and a second run does nothing.
 *
 * Bookings whose date or time cannot be read, or whose assistant no longer exists, are listed and left NULL.
 * The no-overlap constraint does not cover them.
 *
 * Safety: the database host (never the password) is printed first, and the script aborts unless
 * --yes-this-is-the-database is passed. This machine's .env may point at the live database.
 */

import fs from 'node:fs';

const APPLY = process.argv.includes('--apply');
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

  // Dynamic imports: the env must be loaded before the database modules are used.
  const { getPostgresUrl, isPostgresConfigured, getPostgresPool } = await import('../lib/db/postgres');

  if (!isPostgresConfigured()) {
    console.error('[SlotBackfill] Error: Postgres is not configured. Check DATABASE_URL / POSTGRES_URL.');
    process.exit(1);
  }

  let host = '(unreadable)';
  try {
    host = new URL(getPostgresUrl()!).hostname;
  } catch {
    // keep the placeholder; never print the raw URL, it contains the password
  }
  console.log(`[SlotBackfill] Database host: ${host}`);
  console.log(`[SlotBackfill] Mode: ${APPLY ? 'APPLY (will write)' : 'DRY RUN (writes nothing)'}`);

  if (!CONFIRMED) {
    console.error('[SlotBackfill] Aborting: pass --yes-this-is-the-database to confirm this is the database you mean.');
    process.exit(1);
  }

  const pool = getPostgresPool();
  if (!pool) {
    console.error('[SlotBackfill] Error: Could not acquire Postgres connection pool.');
    process.exit(1);
  }

  const { Database } = await import('../lib/db');
  const { slotRangeFields } = await import('../lib/appointments/time-range');

  const state = await Database.getState();
  const timezoneById = new Map<string, string | undefined>();
  for (const a of state.assistants || []) timezoneById.set(a.id, a.timezone);

  let rows: Array<{ id: string; assistant_id: string; date: string; time_slot: string; duration_minutes: number | null; status: string }>;
  try {
    const res = await pool.query(
      `SELECT id, assistant_id, date, time_slot, duration_minutes, status
         FROM kortex_appointments
        WHERE slot_start IS NULL
        ORDER BY created_at`,
    );
    rows = res.rows;
  } catch (err) {
    console.error('[SlotBackfill] Could not read kortex_appointments. Has schema-relational-v4-booking-ranges.sql been applied?');
    console.error(err);
    await pool.end().catch(() => {});
    process.exit(1);
  }

  console.log(`[SlotBackfill] Bookings without a range: ${rows.length}`);

  let written = 0;
  let planned = 0;
  const unreadable: string[] = [];
  const unknownAssistant: string[] = [];

  for (const row of rows) {
    if (!timezoneById.has(row.assistant_id)) {
      unknownAssistant.push(`${row.id} (assistant ${row.assistant_id}, ${row.date} ${row.time_slot}, ${row.status})`);
      continue;
    }
    const fields = slotRangeFields(
      { timezone: timezoneById.get(row.assistant_id) },
      { date: row.date, timeSlot: row.time_slot, durationMinutes: row.duration_minutes ?? undefined },
    );
    if (!fields.slotStart || !fields.slotEnd) {
      unreadable.push(`${row.id} (assistant ${row.assistant_id}, "${row.date}" "${row.time_slot}", ${row.status})`);
      continue;
    }
    planned++;
    if (!APPLY) continue;
    const res = await pool.query('UPDATE kortex_appointments SET slot_start=$1, slot_end=$2 WHERE id=$3 AND slot_start IS NULL', [
      fields.slotStart,
      fields.slotEnd,
      row.id,
    ]);
    written += res.rowCount ?? 0;
  }

  console.log('[SlotBackfill] Summary:');
  console.log(`  - Ranges computed: ${planned}`);
  console.log(APPLY ? `  - Rows written: ${written}` : '  - Rows written: 0 (dry run; add --apply to write)');
  console.log(`  - Left NULL, time cannot be read: ${unreadable.length}`);
  for (const line of unreadable) console.log(`      ${line}`);
  console.log(`  - Left NULL, assistant not found: ${unknownAssistant.length}`);
  for (const line of unknownAssistant) console.log(`      ${line}`);
  if (unreadable.length || unknownAssistant.length) {
    console.log('  Rows left NULL are not protected by the no-overlap constraint. Check the non-cancelled ones by hand.');
  }
  console.log('[SlotBackfill] Completed.');

  await pool.end().catch(() => {});
}

main().catch((err) => {
  console.error('[SlotBackfill] Fatal error:', err);
  process.exit(1);
});

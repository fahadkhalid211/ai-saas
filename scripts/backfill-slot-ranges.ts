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
 * Assistant timezones are read with one SELECT from kortex_app_state (id 'default') on the same connection; the script
 * never calls Database.getState(), whose initialisation can read other stores or write state.
 *
 * Safety: the database host (never the password) is printed first, and the script aborts unless
 * --yes-this-is-the-database is passed. This machine's .env may point at the live database.
 */

import fs from 'node:fs';
import type { BackfillRow } from '../lib/appointments/backfill-plan';

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
  // Deliberately NOT lib/db (Database.getState): its init can read Redis or Supabase, fall back to this machine's local
  // JSON state, or write state and run DDL, even in a dry run. Everything below is plain SELECTs on one pool.
  const { getPostgresUrl, isPostgresConfigured, getPostgresPool } = await import('../lib/db/postgres');
  const { parseDbHost, assistantTimezones, planBackfill } = await import('../lib/appointments/backfill-plan');

  if (!isPostgresConfigured()) {
    console.error('[SlotBackfill] Error: Postgres is not configured. Check DATABASE_URL / POSTGRES_URL.');
    process.exit(1);
  }

  const host = parseDbHost(getPostgresUrl());
  if (!host) {
    console.error('[SlotBackfill] Aborting: cannot read the database host from the connection URL, so it cannot be confirmed.');
    process.exit(1);
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

  // Assistant timezones: one read-only SELECT on the same database the bookings are in.
  let timezoneById: Map<string, string | undefined> | null = null;
  try {
    const res = await pool.query(`SELECT data->'assistants' AS assistants FROM kortex_app_state WHERE id = $1 LIMIT 1`, ['default']);
    if (res.rows.length === 0) {
      console.error("[SlotBackfill] Aborting: no kortex_app_state row with id 'default' in this database, so assistant timezones are unknown.");
      await pool.end().catch(() => {});
      process.exit(1);
    }
    timezoneById = assistantTimezones(res.rows[0].assistants);
  } catch (err) {
    console.error('[SlotBackfill] Aborting: could not read assistant timezones from kortex_app_state.');
    console.error(err);
    await pool.end().catch(() => {});
    process.exit(1);
  }
  if (!timezoneById) {
    console.error('[SlotBackfill] Aborting: kortex_app_state.data has no assistants list, so assistant timezones are unknown.');
    await pool.end().catch(() => {});
    process.exit(1);
  }
  console.log(`[SlotBackfill] Assistants with a known timezone setting: ${timezoneById.size}`);

  let rows: BackfillRow[];
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

  const plan = planBackfill(rows, timezoneById);

  // Show the conversion so the owner can eyeball it before --apply (an assistant without a timezone is read as UTC).
  const SAMPLE = 8;
  console.log(`[SlotBackfill] Sample of computed ranges (first ${Math.min(SAMPLE, plan.planned.length)}):`);
  for (const p of plan.planned.slice(0, SAMPLE)) {
    console.log(`      ${p.id}  ${p.date} "${p.timeSlot}"  tz=${p.timezone ?? '(none, UTC)'}  ->  ${p.slotStart} .. ${p.slotEnd}`);
  }

  let written = 0;
  if (APPLY) {
    for (const p of plan.planned) {
      const res = await pool.query('UPDATE kortex_appointments SET slot_start=$1, slot_end=$2 WHERE id=$3 AND slot_start IS NULL', [
        p.slotStart,
        p.slotEnd,
        p.id,
      ]);
      written += res.rowCount ?? 0;
    }
  }

  console.log('[SlotBackfill] Summary:');
  console.log(`  - Ranges computed: ${plan.planned.length}`);
  console.log(APPLY ? `  - Rows written: ${written}` : '  - Rows written: 0 (dry run; add --apply to write)');
  console.log(`  - Left NULL, time cannot be read: ${plan.unreadable.length}`);
  for (const r of plan.unreadable) console.log(`      ${r.id} (assistant ${r.assistant_id}, "${r.date}" "${r.time_slot}", ${r.status})`);
  console.log(`  - Left NULL, assistant not found: ${plan.unknownAssistant.length}`);
  for (const r of plan.unknownAssistant) console.log(`      ${r.id} (assistant ${r.assistant_id}, ${r.date} ${r.time_slot}, ${r.status})`);
  if (plan.unreadable.length || plan.unknownAssistant.length) {
    console.log('  Rows left NULL are not protected by the no-overlap constraint. Check the non-cancelled ones by hand.');
  }
  console.log('[SlotBackfill] Completed.');

  await pool.end().catch(() => {});
}

main().catch((err) => {
  console.error('[SlotBackfill] Fatal error:', err);
  process.exit(1);
});

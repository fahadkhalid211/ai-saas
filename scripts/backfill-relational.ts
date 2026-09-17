/**
 * CLI Backfill Script: Monolithic Blob -> Postgres Relational Tables (Phase 2)
 *
 * Usage:
 *   npx tsx scripts/backfill-relational.ts
 *
 * Idempotently backfills historical data stored in kortex_app_state (or local file)
 * into the 6 dedicated relational tables:
 *   1. kortex_conversations
 *   2. kortex_messages
 *   3. kortex_leads
 *   4. kortex_appointments
 *   5. kortex_notifications
 *   6. kortex_unanswered_queries
 *
 * Preserves original record IDs and timestamps. Uses ON CONFLICT DO NOTHING / UPDATE
 * to guarantee safety on repeated runs.
 */

import { Database } from '../lib/db';
import { isPostgresConfigured, getPostgresPool } from '../lib/db/postgres';
import * as Relational from '../lib/db/relational';

async function runBackfill(): Promise<void> {
  console.log('[Backfill] Starting relational backfill process...');

  if (!isPostgresConfigured()) {
    console.error('[Backfill] Error: Postgres is not configured or currently unreachable.');
    console.error('[Backfill] Please check DATABASE_URL / POSTGRES_URL environment variables.');
    process.exit(1);
  }

  const pool = getPostgresPool();
  if (!pool) {
    console.error('[Backfill] Error: Could not acquire Postgres connection pool.');
    process.exit(1);
  }

  // Load the authoritative database state
  console.log('[Backfill] Loading state from storage...');
  const state = await Database.getState();

  const conversations = state.conversations || [];
  const messages = state.messages || [];
  const leads = state.leads || [];
  const appointments = state.appointments || [];
  const notifications = state.notifications || [];
  const unansweredQueries = state.unansweredQueries || [];

  console.log(`[Backfill] Records discovered in blob:`);
  console.log(`  - Conversations: ${conversations.length}`);
  console.log(`  - Messages: ${messages.length}`);
  console.log(`  - Leads: ${leads.length}`);
  console.log(`  - Appointments: ${appointments.length}`);
  console.log(`  - Notifications: ${notifications.length}`);
  console.log(`  - Unanswered Queries: ${unansweredQueries.length}`);

  let convCount = 0;
  let msgCount = 0;
  let leadCount = 0;
  let aptCount = 0;
  let notifCount = 0;
  let uqCount = 0;

  // 1. Conversations
  console.log('[Backfill] Migrating conversations...');
  for (const conv of conversations) {
    try {
      const ok = await Relational.relationalUpsertConversation(conv);
      if (ok) convCount++;
    } catch (err) {
      console.warn(`[Backfill] Failed to upsert conversation ${conv.id}:`, err);
    }
  }

  // 2. Messages (preserves original msg.id)
  console.log('[Backfill] Migrating messages...');
  for (const msg of messages) {
    try {
      const ok = await Relational.relationalInsertMessage(msg);
      if (ok) msgCount++;
    } catch (err) {
      console.warn(`[Backfill] Failed to insert message ${msg.id}:`, err);
    }
  }

  // 3. Leads
  console.log('[Backfill] Migrating leads...');
  for (const lead of leads) {
    try {
      const ok = await Relational.relationalInsertLead(lead);
      if (ok) leadCount++;
    } catch (err) {
      console.warn(`[Backfill] Failed to insert lead ${lead.id}:`, err);
    }
  }

  // 4. Appointments
  console.log('[Backfill] Migrating appointments...');
  for (const apt of appointments) {
    try {
      const ok = await Relational.relationalUpsertAppointment(apt);
      if (ok) aptCount++;
    } catch (err) {
      console.warn(`[Backfill] Failed to upsert appointment ${apt.id}:`, err);
    }
  }

  // 5. Notifications
  console.log('[Backfill] Migrating notifications...');
  for (const notif of notifications) {
    try {
      const ok = await Relational.relationalInsertNotification(notif);
      if (ok) notifCount++;
    } catch (err) {
      console.warn(`[Backfill] Failed to insert notification ${notif.id}:`, err);
    }
  }

  // 6. Unanswered Queries
  console.log('[Backfill] Migrating unanswered queries...');
  for (const uq of unansweredQueries) {
    try {
      const ok = await Relational.relationalInsertUnansweredQuery(uq);
      if (ok) uqCount++;
    } catch (err) {
      console.warn(`[Backfill] Failed to insert unanswered query ${uq.id}:`, err);
    }
  }

  console.log('[Backfill] Migration summary:');
  console.log(`  - Conversations backfilled: ${convCount} / ${conversations.length}`);
  console.log(`  - Messages backfilled: ${msgCount} / ${messages.length}`);
  console.log(`  - Leads backfilled: ${leadCount} / ${leads.length}`);
  console.log(`  - Appointments backfilled: ${aptCount} / ${appointments.length}`);
  console.log(`  - Notifications backfilled: ${notifCount} / ${notifications.length}`);
  console.log(`  - Unanswered Queries backfilled: ${uqCount} / ${unansweredQueries.length}`);
  console.log('[Backfill] Completed successfully.');

  try {
    await pool.end();
  } catch {}
}

runBackfill().catch((err) => {
  console.error('[Backfill] Fatal error during backfill:', err);
  process.exit(1);
});

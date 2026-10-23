-- ==============================================================================
-- Kortex AI - Booking time ranges (calendar sync and double-booking prevention)
-- ==============================================================================
-- MANUAL RUN: execute in the Supabase SQL Editor (or psql) BEFORE deploying the code that
-- writes slot_start / slot_end. Safe to run twice (IF NOT EXISTS). It only adds nullable
-- columns, so existing bookings and the running app are not affected.
--
-- Run order (see docs/superpowers/plans/2026-10-23-booking-ranges-runbook.md):
--   1. this file
--   2. deploy the code
--   3. scripts/backfill-slot-ranges.ts   (fills slot_start / slot_end for existing bookings)
--   4. scripts/report-booking-overlaps.ts (must report no overlaps)
--   5. supabase/schema-relational-v4b-no-overlap-constraint.sql
--
-- slot_start / slot_end : the booking as absolute UTC instants, half-open [slot_start, slot_end).
--                         NULL for a booking whose date or time could not be read.
-- external_clash_at     : set when an imported calendar block was found to overlap an already
--                         confirmed booking (the owner is notified; the guest is never cancelled).
--
-- LOCKING: this briefly blocks bookings on kortex_appointments while the constraint/index is built (here: while the
-- columns are added); run at a quiet time; if it times out, retry. lock_timeout below makes it give up after 5s
-- instead of queueing behind a long transaction and stalling every booking behind it.
--
-- btree_gist is needed by the exclusion constraint added in the v4b file. It is created
-- here so a database that does not allow it fails early, before any code is deployed.

SET lock_timeout = '5s';

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE kortex_appointments
  ADD COLUMN IF NOT EXISTS slot_start        timestamptz,
  ADD COLUMN IF NOT EXISTS slot_end          timestamptz,
  ADD COLUMN IF NOT EXISTS external_clash_at timestamptz;

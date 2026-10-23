-- ==============================================================================
-- Kortex AI - No overlapping bookings per assistant (database guarantee)
-- ==============================================================================
-- MANUAL RUN: execute in the Supabase SQL Editor (or psql) ONLY AFTER
--   * schema-relational-v4-booking-ranges.sql has been applied,
--   * the code that writes slot_start / slot_end is deployed,
--   * scripts/backfill-slot-ranges.ts --apply has run, and
--   * scripts/report-booking-overlaps.ts reports NO overlaps.
--
-- THIS STATEMENT FAILS WHILE OVERLAPPING BOOKINGS EXIST. Postgres checks every existing row when
-- the constraint is added; one overlapping pair (same assistant, non-cancelled) aborts it and
-- nothing is changed. Fix each pair the report lists (cancel or move one booking), then run it again.
--
-- NOT COVERED: a booking whose date or time could not be read keeps slot_start = NULL (the backfill
-- lists these). The WHERE clause skips such rows, so the constraint does not protect them.
-- Cancelled bookings are skipped too, so a cancelled slot can be booked again.
--
-- Ranges are half-open: 10:00-10:30 followed by 10:30-11:00 is allowed.
-- A violating insert fails with SQLSTATE 23P01, which the app maps to its "already booked" answer.
--
-- Not idempotent: a second run fails with "constraint already exists". To remove it:
--   ALTER TABLE kortex_appointments DROP CONSTRAINT kortex_appointments_no_overlap;

ALTER TABLE kortex_appointments
  ADD CONSTRAINT kortex_appointments_no_overlap
  EXCLUDE USING gist (
    assistant_id WITH =,
    tstzrange(slot_start, slot_end) WITH &&
  )
  WHERE (status <> 'cancelled' AND slot_start IS NOT NULL);

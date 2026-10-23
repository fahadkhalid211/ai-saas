**Merging is deploying. If main auto-deploys, apply supabase/schema-relational-v4-booking-ranges.sql BEFORE merging; until v4 is applied every new booking and reschedule in relational mode returns 503.**

# Booking Ranges Runbook (owner steps P1-P3)

Phase 1 of calendar sync and double-booking prevention needs three owner steps on the live database, in this order.
Nothing in this repo runs them for you. Both scripts print the database host first and refuse to connect unless
`--yes-this-is-the-database` is passed, so check that the host is the one you mean before every run.

The scripts only run SELECTs (plus the `--apply` UPDATE) on that one database and abort if its host cannot be read.
They read `DATABASE_URL` (or `POSTGRES_URL`) from the shell or from `.env` in the current directory.
Run them from the repository root.

`npm run db:schema` (scripts/apply-schema.mjs) now also applies the v4 file, so a new environment set up with it gets the
columns. It never applies v4b: the constraint stays a deliberate step (P3.5).

## P1. Confirm relational mode in production

The database guarantee exists only when `DB_RELATIONAL_MODE=true`. In the JSON-blob mode the app keeps only the
in-process and Redis locks.

1. Open the production environment variables (Vercel project settings, or the server's environment).
2. Confirm `DB_RELATIONAL_MODE` is exactly `true`. If it is not, stop here: setting it needs the relational
   backfill first (`npm run db:backfill`, see the comments in `lib/db/index.ts`).
   **Apply v4 (step P3.1) before running `npm run db:backfill`.** `scripts/backfill-relational.ts` writes the
   `slot_start` / `slot_end` columns; without them every appointment fails with error 42703 (undefined column), and the
   script only prints a warning per appointment and carries on, so it looks finished while no booking was copied.

An environment with `DB_RELATIONAL_MODE=true` but no `DATABASE_URL` (for example a preview deploy that inherits the
variable) refuses every booking, reschedule and cancellation with 503. That is by design: without Postgres nothing can
stop two bookings taking the same time, so the app refuses instead of writing to the JSON state.

## P2. Confirm `btree_gist` is allowed

The exclusion constraint needs the `btree_gist` extension. In the Supabase SQL Editor (or `psql`) run:

```sql
SELECT name, installed_version FROM pg_available_extensions WHERE name = 'btree_gist';
```

One row means it is available. No row means the provider does not allow it: stop and tell the developer.
(Step P3.1 also creates it with `CREATE EXTENSION IF NOT EXISTS btree_gist`, so a refusal shows up there too,
before any code is deployed.)

## Before P3: set every assistant's timezone

The backfill turns each booking's local date and time into UTC with its assistant's timezone (an assistant without one
is read as UTC). Set the correct timezone on every assistant in the dashboard **before** step P3.3. See
"Known limitation" at the end for what to do if a timezone changes later.

## P3. Apply, deploy, backfill, check, constrain

1. **Apply the v4 SQL** (adds the extension and three nullable columns; safe to run twice). Paste the file
   `supabase/schema-relational-v4-booking-ranges.sql` into the Supabase SQL Editor and run it, or:

   Both SQL files set `lock_timeout = '5s'` and briefly block bookings on `kortex_appointments`: run them at a quiet
   time, and if one times out, run it again. With psql, `-v ON_ERROR_STOP=1` stops at the first error (so a refused
   `CREATE EXTENSION` cannot scroll past) and `-1` runs the file in a single transaction.

   ```bash
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f supabase/schema-relational-v4-booking-ranges.sql
   ```

2. **Deploy the code** from this branch to production. (If main auto-deploys, merging is this step: see the line at
   the top.)

3. **Backfill, dry run first.** It writes nothing and lists the bookings whose time cannot be read:

   ```bash
   npx tsx scripts/backfill-slot-ranges.ts --yes-this-is-the-database
   ```

   Check the host line, the sample conversions (date, slot, timezone, UTC range), the counts and the "Left NULL" lists. Then write the ranges:

   ```bash
   npx tsx scripts/backfill-slot-ranges.ts --yes-this-is-the-database --apply
   ```

   It only fills rows where `slot_start IS NULL`, so running it again is harmless. The script writes whenever
   `--apply` is present: `--apply` wins over `--dry-run`, so never pass both expecting a dry run. Leave `--apply` out
   for a dry run.

4. **Overlap report** (read only). It must end with "No overlaps":

   ```bash
   npx tsx scripts/report-booking-overlaps.ts --yes-this-is-the-database
   ```

   For every pair it lists, remove one of the two bookings: **delete** it in the dashboard (the dashboard cannot move a
   booking), or **cancel** it from the mobile app or with the guest's manage link. Cancelling or deleting a past booking that is already `completed` rewrites history and the statistics built
   on it, so for a past pair prefer leaving the completed one and removing the other, and tell the guest when a future
   booking is removed. Then run the report again. Repeat until it reports zero pairs (exit code 0).

   Also read the line "Non-cancelled bookings with NO range (not covered by the constraint)". Every booking it counts
   is outside the database guarantee. Each of them must appear in the backfill's "Left NULL" lists (time cannot be
   read, or assistant not found; those lists also show cancelled bookings, which the report does not count). Explain
   each one (fix its date or time and re-run the backfill, or cancel it) before going on.

5. **Re-run the backfill, then apply the v4b SQL** (the database guarantee). Bookings made between step 3 and now may
   have no range yet, so run the backfill once more right before (idempotent; dry run, then `--apply` if it plans any
   rows), then run the overlap report again and check its "NO range" count as in step 4. Then paste
   `supabase/schema-relational-v4b-no-overlap-constraint.sql` into the SQL Editor and run it, or:

   ```bash
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f supabase/schema-relational-v4b-no-overlap-constraint.sql
   ```

   It fails while overlapping bookings exist; nothing changes if it fails. Go back to step 4.
   Bookings whose time could not be read keep `slot_start` NULL and are not covered by the constraint.

6. **Verify the constraint by hand** (changes nothing). In one transaction, insert two overlapping bookings for a
   throwaway assistant id, check that the second is refused, then roll back. Run it in `psql` (interactive) or the
   SQL Editor:

   ```sql
   BEGIN;
   INSERT INTO kortex_appointments (id, assistant_id, name, email, date, time_slot, slot_start, slot_end)
   VALUES ('apt_v4b_check_1', 'ast_v4b_check_throwaway', 'Constraint check', 'check@example.invalid',
           '2000-01-03', '10:00', '2000-01-03T10:00:00Z', '2000-01-03T11:00:00Z');
   INSERT INTO kortex_appointments (id, assistant_id, name, email, date, time_slot, slot_start, slot_end)
   VALUES ('apt_v4b_check_2', 'ast_v4b_check_throwaway', 'Constraint check', 'check@example.invalid',
           '2000-01-03', '10:30', '2000-01-03T10:30:00Z', '2000-01-03T11:30:00Z');
   ROLLBACK;
   ```

   Expected: the second INSERT fails with `conflicting key value violates exclusion constraint
   "kortex_appointments_no_overlap"` (SQLSTATE `23P01`). The two rows use different start times, so the older unique
   index on (assistant, date, time) is not what refuses it. The ROLLBACK removes both rows either way; if the second
   INSERT succeeded, the constraint is not in place: check step 5. Afterwards
   `SELECT count(*) FROM kortex_appointments WHERE assistant_id = 'ast_v4b_check_throwaway';` must return 0.

## Rollback

To undo step 5:

```sql
ALTER TABLE kortex_appointments DROP CONSTRAINT kortex_appointments_no_overlap;
```

Before rolling the code back after step 5 (v4b applied), drop the constraint: `ALTER TABLE kortex_appointments DROP
CONSTRAINT kortex_appointments_no_overlap;` - old code maps only 23505, so a 23P01 would take its JSON-fallback branch
and save the booking only in the blob.

The v4 columns can stay when the code is rolled back: they are nullable and old code does not read them.

## Known limitation: timezone changes

Stored ranges (`slot_start` / `slot_end`) are computed with the assistant's timezone at the moment a booking is written
or backfilled. They are not recomputed when the timezone changes. So:

- Set every assistant's timezone **before** the backfill (P3.3).
- If an assistant's timezone is changed later, clear that assistant's current and future ranges and run the backfill
  again, otherwise the database constraint can disagree with what the app shows (it would compare the old UTC ranges):

  ```sql
  UPDATE kortex_appointments SET slot_start=NULL, slot_end=NULL WHERE assistant_id='<id>' AND date >= to_char(current_date - 1, 'YYYY-MM-DD');
  ```

  (`date` is a text column holding `YYYY-MM-DD`, so the cut-off is written as text; comparing it with a bare
  `current_date - 1` fails with "operator does not exist: text >= date".)

  Then run the backfill dry run, check the sample conversions show the new timezone, and run it with `--apply`:

  ```bash
  npx tsx scripts/backfill-slot-ranges.ts --yes-this-is-the-database
  npx tsx scripts/backfill-slot-ranges.ts --yes-this-is-the-database --apply
  ```

  Between the UPDATE and `--apply` those bookings are not covered by the constraint (the app's own check still
  applies), so do it at a quiet time.

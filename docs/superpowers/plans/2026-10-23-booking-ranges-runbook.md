# Booking Ranges Runbook (owner steps P1-P3)

Phase 1 of calendar sync and double-booking prevention needs three owner steps on the live database, in this order.
Nothing in this repo runs them for you. Both scripts print the database host first and refuse to connect unless
`--yes-this-is-the-database` is passed, so check that the host is the one you mean before every run.

The scripts read `DATABASE_URL` (or `POSTGRES_URL`) from the shell or from `.env` in the current directory.
Run them from the repository root.

## P1. Confirm relational mode in production

The database guarantee exists only when `DB_RELATIONAL_MODE=true`. In the JSON-blob mode the app keeps only the
in-process and Redis locks.

1. Open the production environment variables (Vercel project settings, or the server's environment).
2. Confirm `DB_RELATIONAL_MODE` is exactly `true`. If it is not, stop here: setting it needs the relational
   backfill first (`npm run db:backfill`, see the comments in `lib/db/index.ts`).

## P2. Confirm `btree_gist` is allowed

The exclusion constraint needs the `btree_gist` extension. In the Supabase SQL Editor (or `psql`) run:

```sql
SELECT name, installed_version FROM pg_available_extensions WHERE name = 'btree_gist';
```

One row means it is available. No row means the provider does not allow it: stop and tell the developer.
(Step P3.1 also creates it with `CREATE EXTENSION IF NOT EXISTS btree_gist`, so a refusal shows up there too,
before any code is deployed.)

## P3. Apply, deploy, backfill, check, constrain

1. **Apply the v4 SQL** (adds the extension and three nullable columns; safe to run twice). Paste the file
   `supabase/schema-relational-v4-booking-ranges.sql` into the Supabase SQL Editor and run it, or:

   ```bash
   psql "$DATABASE_URL" -f supabase/schema-relational-v4-booking-ranges.sql
   ```

2. **Deploy the code** from this branch to production.

3. **Backfill, dry run first.** It writes nothing and lists the bookings whose time cannot be read:

   ```bash
   npx tsx scripts/backfill-slot-ranges.ts --yes-this-is-the-database
   ```

   Check the host line, the counts and the "Left NULL" lists. Then write the ranges:

   ```bash
   npx tsx scripts/backfill-slot-ranges.ts --yes-this-is-the-database --apply
   ```

   It only fills rows where `slot_start IS NULL`, so running it again is harmless.

4. **Overlap report** (read only). It must end with "No overlaps":

   ```bash
   npx tsx scripts/report-booking-overlaps.ts --yes-this-is-the-database
   ```

   For every pair it lists, cancel or move one of the two bookings in the dashboard, then run the report again.
   Repeat until it reports zero pairs (exit code 0).

5. **Apply the v4b SQL** (the database guarantee). Paste
   `supabase/schema-relational-v4b-no-overlap-constraint.sql` into the SQL Editor and run it, or:

   ```bash
   psql "$DATABASE_URL" -f supabase/schema-relational-v4b-no-overlap-constraint.sql
   ```

   It fails while overlapping bookings exist; nothing changes if it fails. Go back to step 4.
   Bookings whose time could not be read keep `slot_start` NULL and are not covered by the constraint.

To undo step 5:

```sql
ALTER TABLE kortex_appointments DROP CONSTRAINT kortex_appointments_no_overlap;
```

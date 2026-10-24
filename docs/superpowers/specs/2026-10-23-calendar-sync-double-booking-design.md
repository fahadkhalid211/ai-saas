# Calendar sync and double-booking prevention for slot booking - design

Status: draft for review (revision 2). No code has been written.
Night stays and the Airbnb/Booking.com/Agoda work were dropped in this revision; this spec is slot booking only.

## Goal

A small business using Crescelo slot booking must never get two bookings for the same time.
That means two things: (1) Crescelo itself can never accept overlapping bookings, and (2) the calendars the owner already
uses (Google, Apple/iCloud, Outlook, others) block Crescelo's slots, and Crescelo's bookings show up in those calendars.

## What "no double booking" can and cannot promise

- **Bookings made through Crescelo:** can be made impossible to double up, enforced by the database itself, on every path
  (web, widget, hosted page, voice, reschedule). This is the part this spec guarantees.
- **Events created in an outside calendar:** cannot be guaranteed to zero by any system that reads a calendar link. If the owner
  types an event into Google at the same second a visitor confirms the same slot, neither system can see the other yet.
  This spec shrinks that window to a few seconds (a fresh read right before every confirmation), detects any clash that
  still happens, and tells the owner immediately. Closing it further needs Google sign-in write-back (a later phase), and
  even that has a window of milliseconds. The product copy must say this accurately and never claim "zero".

## Gaps found in today's code

1. **The lock and the unique index only stop identical start times.** `acquireBookingLock` keys on
   `(assistantId, date, timeSlot)` and `idx_kortex_appointments_slot_unique` is on `(assistant_id, date, time_slot)`.
   A booking at "10:00" for 60 minutes and another at "10:30" are different keys, so both succeed on the web path.
   `createAppointment` only checks overlap when `enforceOverlap` is set, and only voice sets it. The same holds if the owner
   changes the slot length after bookings exist, or a time is stored as a range ("10:00 - 10:30") instead of "10:00".
2. **Reschedule skips the overlap check.** `relationalUpdateAppointment` can move a booking onto an overlapping time;
   only an identical `time_slot` hits the unique index.
3. **A database failure falls back to local JSON storage with no unique index.** In `Database.saveAppointment`, a non-conflict
   Postgres error disables Postgres temporarily and the booking is written to the JSON state, where two instances can both accept the slot.
4. **The shared lock is best-effort.** Without Redis, or when Redis is unreachable, only the in-process lock applies, so
   it does not protect across serverless instances.
5. **No external calendar is read at all.**

## Decisions already made

- Slot booking only. One switch is not needed; this improves the existing slot mode.
- Google, Apple/iCloud, Outlook and any other calendar connect through iCal links in this version. Google write-back is the next phase,
  then Apple CalDAV.
- CRMs stay on the existing webhook, Slack and Google Sheets integrations. Native CRM sync stays on the roadmap.

## Out of scope

Night stays and rentals, Airbnb/Booking.com/Agoda, official platform APIs, Google/Apple write-back (later phases),
payments, buffers, per-service durations, staff assignment.

## Design

### 1. Database-level guarantee (the core fix)

Store each booking's real time range and let Postgres refuse overlaps.

- Add columns `slot_start timestamptz` and `slot_end timestamptz` to `kortex_appointments`, filled by the app when the
  booking is created, moved or backfilled. They are computed from `date`, the start of `time_slot`, the duration, and the
  assistant's timezone (`nowInTimezone` and `parseTimeToMinutes` already work with these).
- Add an exclusion constraint:
  `EXCLUDE USING gist (assistant_id WITH =, tstzrange(slot_start, slot_end) WITH &&) WHERE (status <> 'cancelled' AND slot_start IS NOT NULL)`
  This needs the `btree_gist` extension. Two bookings for the same assistant can then never overlap, whatever the start
  times, the instance, the lock, or the code path. The existing unique index stays as a second layer.
- A violation (Postgres error 23P01) is mapped to the existing `SLOT_CONFLICT` and the visitor gets the normal "already booked" answer.
- Back-to-back bookings (10:00-10:30 then 10:30-11:00) stay allowed: ranges are half-open.
- Bookings whose time cannot be read ("Morning") get no range and are not covered by the constraint; the app-level check
  still runs for them and they are listed in the migration report for the owner to fix.
- **This is a migration against the live Postgres.** The plan delivers the SQL: enable `btree_gist`, add the columns,
  backfill, run a report query that lists existing overlapping bookings (the constraint cannot be created while any exist), then
  add the constraint. The owner applies it. I will not run it against the live database from this session.

### 2. Application checks on every path

- A single function `findBookingConflict(assistant, date, start, duration)` in `lib/appointments/` checks existing bookings and
  external blocks using range overlap (`overlapsExisting` plus the new external blocks). `createAppointment` always uses it;
  `enforceOverlap` stops being optional. Voice and MCP booking go through the same function.
- The lock key becomes per assistant and day (`assistantId:date`), so bookings with different start times on the same day
  are serialised too. The database constraint remains the real guarantee; the lock only avoids wasted work and noisy errors.
- Reschedule and any "move" (`relationalUpdateAppointment` with a new date/time) recompute the range, run the same
  conflict check, and rely on the same constraint.

### 3. Fail closed instead of falling back

When Postgres is configured for the deployment and a booking write fails with a connection error, the booking is rejected
with a clear "please try again in a moment" (HTTP 503) instead of being written to the local JSON state. Local development
without Postgres keeps using JSON, where one process plus the lock is enough. This turns gap 3 from a silent risk into a visible, retryable error.

### 4. External calendars

Import (read):

- Connection settings in the existing booking card in `components/crm/WidgetTab.tsx`, for the direct provider: a list of
  "Calendars that block my slots". Each row: label (Google, Apple/iCloud, Outlook, Other), link, last synced, error, "Sync now", remove.
  Adding a link fetches it once to prove it works. Short help text per label says where to find the calendar's private/secret link.
- New tables `kortex_calendar_connections` (id, assistant_id, label, url, last_synced_at, last_error, etag, last_modified)
  and `kortex_external_blocks` (connection_id, assistant_id, uid, start_at, end_at, all_day), replaced per connection in one transaction.
- `lib/calendar/sync/`: `parse-ical.ts` (all-day and timed events, UTC, `TZID` and floating times, folded lines, cancelled
  events; busy-only and "free"/transparent events are ignored; recurring events are expanded for the booking horizon or the
  connection is flagged "unsupported recurrence" rather than guessed), `fetch-feed.ts` (https only, public addresses only by reusing
  the private-network check, size and time limits, conditional requests), `sync-connection.ts` (fetch, parse, replace blocks,
  record success or error; a failed fetch keeps the old blocks so dates never free up silently).
- `app/api/cron/calendar-sync/route.ts`, authenticated like `cron/reminders`, refreshes connections older than 10 minutes.
- **Refresh before confirming:** `createAppointment` refreshes that assistant's connections (short timeout) immediately before the
  final conflict check. If a refresh fails, the last good blocks are used and the booking is flagged so the owner sees the calendar was stale.
- **Re-check after confirming:** the cron run and the next sync re-compare every future booking against fresh blocks. A clash
  (an outside event that appeared after we confirmed) never cancels the guest; the owner gets a dashboard notification and an
  email naming both items, and the clash is shown on the appointment.

Export (write):

- Route `app/api/calendar/[token]/feed.ics`, read-only, with a long random per-assistant token and a "Reset link" button.
  It lists confirmed and pending Crescelo bookings as timed events titled "Busy", with no guest name, email, phone or notes.
  Imported blocks are never re-exported.
- Owners subscribe to it from Google, Apple or Outlook. These apps refresh subscribed links slowly (often hours), so the panel
  says plainly that the owner's own calendar may show a new booking late; the booking itself is already safe in Crescelo.

Decisions made during implementation:

- **No stale flag on the booking.** A booking confirmed while a linked calendar could not be refreshed is not marked on the
  appointment; the staleness is only logged (`booking.calendar_stale`). The owner still learns about a calendar that keeps failing
  from the 24-hour "not syncing" notice, and about any clash it hid from the clash check after the next good read.
- **The clash is shown** on the appointment (list and details) as "Clashes with an event in your calendar", with an icon. The marker
  (`externalClashAt`) is sent to the dashboard only, never in the guest's manage-link responses.
- **A booking's own event is not a clash.** A block with exactly the booking's start and end is ignored by the clash check and when a
  cancelled booking is restored (an unrelated event with identical times is ignored too); new bookings and reschedules still refuse it.
- **Window and horizon.** Links are read for 400 days ahead; an assistant with a linked calendar refuses bookings beyond that.

### 5. Error handling

Invalid link: rejected when added, with a reason. Feed unreachable, too large, or not iCal: previous blocks stay, the row shows the
error, the next cron run retries, and the owner gets one notification after 24 hours of failure.

### 6. Testing

- Database constraint: integration tests against a real Postgres (the repo's relational tests show the pattern) for overlap
  with different start times, a range stored as "10:00 - 10:30", back-to-back bookings, a cancelled booking freeing the time,
  and a concurrent burst of overlapping requests where exactly one succeeds. A migration test confirms the report query finds existing overlaps.
- Unit tests: the conflict function (overlap, external blocks, all-day blocks, timezone edges), the iCal parser, the export
  feed (no personal data, token handling), the private-address guard on imports, reschedule conflicts.
- `createAppointment` tests: external block rejects the slot, stale-feed flag, 503 on a database failure, and no fallback to JSON when Postgres is configured.
- Manual check at the end with a real Google and Apple calendar link.

## Phases

1. **No-double-booking core:** the migration and database constraint, the shared conflict check on every path, the per-day lock, fail-closed saves, reschedule fixes.
2. **Calendar links:** import, export, cron sync, refresh before booking, clash notices, the settings panel.
3. **Later, separate specs:** Google sign-in write-back, then Apple CalDAV.

## Product copy rule

The guides, pricing text and blog currently say two-way sync is not available. After this ships they should say what is true:
Crescelo never double-books its own slots; it reads your calendar links and refreshes them right before confirming; your own
calendar may show new bookings late until Google/Apple write-back exists; events added in another calendar in the same second
cannot be seen by either system.

## Open points for review

- `btree_gist` must be available on the live Postgres; the plan will check this before relying on it.
- Rejecting bookings when Postgres is briefly down (section 3) trades availability for safety; this is a deliberate choice.
- Cron frequency depends on the scheduler; 10 minutes assumes it can run that often. The refresh before each booking does not depend on it.

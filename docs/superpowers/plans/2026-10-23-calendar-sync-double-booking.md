# Calendar Sync and Double-Booking Prevention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make overlapping slot bookings impossible for bookings made through Crescelo, and make the owner's Google, Apple/iCloud, Outlook or other calendar links block Crescelo slots.

**Architecture:** Every booking stores a real UTC time range, and Postgres refuses overlapping ranges per assistant (the guarantee). One shared conflict function, used by every booking path, checks existing bookings and imported calendar blocks. Imported calendars are fetched from iCal links, normalised to UTC ranges, stored, refreshed right before each confirmation and on a cron.

**Tech Stack:** Next.js (App Router, route handlers), TypeScript, Postgres via `pg` (`lib/db/relational.ts`), vitest, `ical.js` for parsing.

**Spec:** `docs/superpowers/specs/2026-10-23-calendar-sync-double-booking-design.md`

## Global Constraints

- `AGENTS.md`: this Next.js version differs from training data. Before writing any route handler (Tasks 9, 11, 13) read the route-handler guide in `node_modules/next/dist/docs/`.
- Slot booking only. No night stays, no OTA (Airbnb/Booking.com/Agoda) work, no Google/Apple write-back.
- Calendars connect by iCal link, https only (`webcal://` is rewritten to `https://`), public addresses only via `validateSafeExternalUrl(url, { requireHttps: true })` from `lib/security/ssrf.ts`.
- Booking ranges are half-open: 10:00-10:30 then 10:30-11:00 must both be accepted.
- A failed or unreachable feed keeps the previous blocks; dates never free up silently.
- A clash found after confirmation never cancels the guest: notify the owner only.
- Export feed events are titled "Busy" with no name, email, phone or notes. Imported blocks are never re-exported.
- Postgres violation `23P01` (exclusion) maps to the existing `SLOT_CONFLICT` error and the normal "already booked" answer.
- If `DB_RELATIONAL_MODE=true` and Postgres is unavailable, a booking is refused with HTTP 503 and never written to the JSON fallback.
- No new tests may touch a real database: this repo's tests mock the pg pool (see `lib/db/relational-dates.test.ts`). The `.env` of this machine points at the live Postgres, so never run a migration or script against it from this session.
- Several other sessions edit this repo and uncommitted work (`lib/blog/*`, `app/sitemap.ts`) is not yours. Stage only the files you changed, with explicit paths. Never `git add -A` or `git add .`.
- Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- New dashboard strings go through `<T>`; run `npx vitest run lib/i18n` after UI tasks.
- Test command: `npx vitest run <file>`. Full suite: `npm test`.

## Review Focus

1. A `webcal://` link, which is what Apple and Google hand out, must be accepted and rewritten, not rejected as an unsupported protocol (Task 8).
2. A booking stored as a range string ("10:00 AM - 10:30 AM") or a 12-hour time must still produce the right UTC range and conflict (Tasks 1, 2).
3. Bookings on either side of a daylight-saving change must map to the correct UTC instant (Task 1).
4. An all-day event in an imported calendar (a holiday, a day off) must close the whole local day, not just 00:00-00:01 (Task 7).
5. A calendar that returns an empty, HTML or truncated body must not wipe the stored blocks (Task 9).

## Operational prerequisites (owner actions, not code)

These need a human with access to the live infrastructure. The tasks below mark where each applies.

- **P1.** Confirm `DB_RELATIONAL_MODE=true` in production. The database guarantee exists only in relational mode; in the JSON-blob mode the app keeps only the in-process and Redis locks.
- **P2.** Confirm `CREATE EXTENSION btree_gist` is allowed on the live Postgres.
- **P3.** Run order for the database change: apply `supabase/schema-relational-v4-booking-ranges.sql` -> deploy code -> run `scripts/backfill-slot-ranges.ts` -> run `scripts/report-booking-overlaps.ts` and fix every overlap it lists -> apply `supabase/schema-relational-v4b-no-overlap-constraint.sql`.
- **P4.** Schedule `GET /api/cron/calendar-sync` every 10 minutes with the `CRON_SECRET` header. `vercel.json` has no entry for `cron/reminders` either, so the scheduler is external; do not assume Vercel Cron.

---

## Phase 1: No-double-booking core

### Task 1: UTC time ranges for a booking

**Files:**
- Create: `lib/appointments/time-range.ts`
- Test: `lib/appointments/time-range.test.ts`

**Interfaces:**
- Produces: `interface SlotRange { start: Date; end: Date }`
- Produces: `slotRange(date: string, timeSlot: string, durationMinutes: number | undefined, timezone: string | undefined): SlotRange | null`. Null when the date or time cannot be read. Duration rule is the one `occupiedRange` in `lib/appointments/availability.ts` uses: a range string's end wins, else `durationMinutes`, else 30.
- Produces: `slotRangeFields(assistant: { timezone?: string }, input: { date: string; timeSlot: string; durationMinutes?: number }): { slotStart?: string; slotEnd?: string }` returning ISO strings, or `{}` when the range is null.

- [ ] **Step 1: Write failing tests** in `time-range.test.ts`: `slotRange('2026-10-23','10:00',60,'Europe/Stockholm')` has `start.toISOString() === '2026-10-23T08:00:00.000Z'` and `end` an hour later; winter `'2026-12-10','10:00'` in Stockholm starts `09:00Z`; `'10:00 AM - 10:30 AM'` gives a 30-minute range regardless of the duration argument; the DST day `'2026-03-29','03:30'` in Stockholm resolves to `01:30Z`; unknown timezone falls back to UTC; `'Morning'` and `'2026-13-40'` return null; `slotRangeFields({}, {date:'2026-10-23', timeSlot:'09:00'})` returns ISO strings 30 minutes apart.
- [ ] **Step 2: Run** `npx vitest run lib/appointments/time-range.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** both functions. Reuse `parseTimeToMinutes`, `isIsoDate`, `isValidTimezone` from `availability.ts`. To convert local wall time to UTC without a library, guess the UTC instant, read the zone offset at that instant with `Intl.DateTimeFormat(...).formatToParts`, adjust, and re-read once to settle across a DST change.
- [ ] **Step 4: Run** the test file. Expected: PASS.
- [ ] **Step 5: Commit** `lib/appointments/time-range.ts` and its test: `feat(booking): UTC time ranges for bookings`.

### Task 2: One conflict check, with external blocks

**Files:**
- Create: `lib/calendar/sync/types.ts`, `lib/appointments/conflicts.ts`
- Modify: `lib/appointments/availability.ts` (`SlotQuery`, `getAvailableSlots`, `overlapsExisting` callers)
- Test: `lib/appointments/conflicts.test.ts`; extend `lib/appointments/availability.test.ts`

**Interfaces:**
- Produces (types.ts): `interface ExternalBlock { startAt: Date; endAt: Date }` (half-open, UTC).
- Produces (conflicts.ts): `type BookingConflict = { kind: 'booking'; appointmentId?: string } | { kind: 'external' }`
- Produces: `findBookingConflict(q: { date: string; timeSlot: string; durationMinutes?: number; timezone?: string; appointments: Array<ExistingAppointment & { id?: string }>; blocks: ExternalBlock[]; ignoreAppointmentId?: string }): BookingConflict | null`. Existing bookings are compared by `slotRange` overlap, so an unreadable-time booking never matches by range but still matches when `date` and `timeSlot` strings are identical.
- Produces: `blockedSlotStarts(q: { config: AvailabilityConfig; date: string; appointments: ExistingAppointment[]; blocks: ExternalBlock[] }): string[]`: every "HH:MM" grid start in the opening hours that overlaps a booking or block (the public widget greys these out).
- Changes: `SlotQuery` gains `blocks?: ExternalBlock[]`; `getAvailableSlots` also drops any slot whose `slotRange` overlaps a block. `ExistingAppointment` is unchanged.

- [ ] **Step 1: Write failing tests** in `conflicts.test.ts`: 10:00 for 60 min conflicts with a booking at 10:30 (`kind: 'booking'`); 10:30 after a 10:00-10:30 booking does not conflict; a cancelled booking never conflicts; `ignoreAppointmentId` skips that booking (reschedule); an external block 09:00-12:00Z in Stockholm summer blocks the 10:00 local slot (`kind: 'external'`); a block covering the whole local day returns `external` for any time that day; `'10:00 AM - 10:30 AM'` conflicts with `'10:15'`. In `availability.test.ts`: `getAvailableSlots` with a block removes exactly the overlapped slots; `blockedSlotStarts` lists them.
- [ ] **Step 2: Run** both files. Expected: FAIL.
- [ ] **Step 3: Implement** with `slotRange` from Task 1; keep the existing minute-based logic when `blocks` is empty so current tests stay green.
- [ ] **Step 4: Run** `npx vitest run lib/appointments`. Expected: PASS, including the unchanged old tests.
- [ ] **Step 5: Commit** the new and changed files: `feat(booking): shared conflict check with external blocks`.

### Task 3: Per-day booking lock

**Files:**
- Modify: `lib/appointments/booking-lock.ts`
- Test: extend `lib/appointments/concurrency.test.ts`

**Interfaces:**
- Produces: `acquireDayLock(assistantId: string, date: string, timeoutMs?: number): Promise<() => void>`: serialises every booking attempt for one assistant and date, regardless of start time. Built on `acquireBookingLock(assistantId, date, 'day', timeoutMs)`; the existing function stays unchanged.

- [ ] **Step 1: Failing test** in `concurrency.test.ts`: two `acquireDayLock` calls for the same assistant and date run one after the other; two calls for different dates run concurrently (total under 100 ms with 40 ms of work each).
- [ ] **Step 2: Run** `npx vitest run lib/appointments/concurrency.test.ts`. Expected: FAIL (`acquireDayLock` undefined).
- [ ] **Step 3: Implement** the wrapper.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit**: `feat(booking): per-day booking lock`.

### Task 4: Database migrations and ops scripts

**Files:**
- Create: `supabase/schema-relational-v4-booking-ranges.sql`, `supabase/schema-relational-v4b-no-overlap-constraint.sql`, `scripts/backfill-slot-ranges.ts`, `scripts/report-booking-overlaps.ts`, `docs/superpowers/plans/2026-10-23-booking-ranges-runbook.md`
- Test: `lib/appointments/overlap-report.test.ts` (tests the pure overlap finder below)

**Interfaces:**
- Produces (SQL v4): `CREATE EXTENSION IF NOT EXISTS btree_gist;` and `ALTER TABLE kortex_appointments ADD COLUMN IF NOT EXISTS slot_start timestamptz, ADD COLUMN IF NOT EXISTS slot_end timestamptz, ADD COLUMN IF NOT EXISTS external_clash_at timestamptz;`, written in the header style of `schema-relational-v3-widget-events.sql` ("MANUAL RUN ... BEFORE deploying").
- Produces (SQL v4b): `ALTER TABLE kortex_appointments ADD CONSTRAINT kortex_appointments_no_overlap EXCLUDE USING gist (assistant_id WITH =, tstzrange(slot_start, slot_end) WITH &&) WHERE (status <> 'cancelled' AND slot_start IS NOT NULL);` with the header stating it fails while overlaps exist.
- Produces: `findOverlaps(rows: Array<{ id: string; assistantId: string; slotStart: Date; slotEnd: Date }>): Array<[string, string]>` exported from `lib/appointments/overlap-report.ts`; pairs of ids whose half-open ranges overlap for the same assistant.
- Scripts take `--dry-run` as the default and require `--apply` to write; both print the database host first and abort unless `--yes-this-is-the-database` is also passed, so they cannot hit the live database by accident.
- The runbook lists P1-P4 in order with the exact commands.

- [ ] **Step 1: Failing test** for `findOverlaps`: adjacent ranges (10:00-10:30, 10:30-11:00) are not reported; overlapping ones are; different assistants are not; a pair is reported once.
- [ ] **Step 2: Run** `npx vitest run lib/appointments/overlap-report.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `lib/appointments/overlap-report.ts`, then the two SQL files and both scripts. The backfill reads appointments and assistant timezones through `Database`, computes ranges with `slotRangeFields`, and writes `slot_start`/`slot_end` where they are null; it lists the appointments whose time cannot be read and leaves them null.
- [ ] **Step 4: Run** the test file. Expected: PASS. Run `npx tsc --noEmit -p .` for the scripts. Expected: no new errors.
- [ ] **Step 5: Commit** these files: `feat(booking): migrations and runbook for non-overlapping booking ranges`.

### Task 5: Store and enforce ranges in the relational layer

**Files:**
- Modify: `lib/db/index.ts` (`AppointmentData`, `saveAppointment`, `updateAppointment`), `lib/db/relational.ts` (`aptToRow`, `rowToApt`, `relationalUpsertAppointment`, `relationalUpdateAppointment`)
- Test: `lib/db/relational-ranges.test.ts` (mocked pool, same style as `relational-dates.test.ts`)

**Interfaces:**
- Consumes: `slotRangeFields` (Task 1).
- Changes: `AppointmentData` gains `slotStart?: string`, `slotEnd?: string`, `externalClashAt?: string` (ISO). `Database.saveAppointment`'s input type gains `slotStart?: string; slotEnd?: string`.
- Changes: `aptToRow` inserts `slot_start`, `slot_end`; `rowToApt` reads `slot_start`, `slot_end`, `external_clash_at` as ISO strings.
- Changes: `relationalUpsertAppointment` and `relationalUpdateAppointment` map error code `'23P01'` the same way as `'23505'` to `SLOT_CONFLICT`. `relationalUpdateAppointment` also accepts `slotStart`, `slotEnd`, `externalClashAt` in the patch.

- [ ] **Step 1: Failing tests** with a mocked pool whose `query` rejects with `{ code: '23P01' }`: upsert and update both throw an error with `code === 'SLOT_CONFLICT'`; the INSERT statement text contains `slot_start` and the parameter list carries the ISO values; `rowToApt` of a row with `slot_start` as a `Date` returns an ISO string.
- [ ] **Step 2: Run** `npx vitest run lib/db/relational-ranges.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the changes above. `Database.updateAppointment` already forwards the patch; make sure it passes the range fields through to `relationalUpdateAppointment`.
- [ ] **Step 4: Run** the new file plus `npx vitest run lib/db`. Expected: PASS.
- [ ] **Step 5: Commit**: `feat(booking): store booking ranges and map overlap violations to slot conflicts`.

### Task 6: Fail closed when Postgres is down

**Files:**
- Create: `lib/appointments/errors.ts`
- Modify: `lib/db/index.ts` (`saveAppointment`, `updateAppointment`, new `isRelationalModeRequired`)
- Test: `lib/db/fail-closed.test.ts`

**Interfaces:**
- Produces: `class BookingUnavailableError extends Error { code = 'DB_UNAVAILABLE' }`
- Produces: `isRelationalModeRequired(): boolean` in `lib/db/index.ts`, true iff `process.env.DB_RELATIONAL_MODE === 'true'` (independent of the temporary outage flag that `isRelationalModeEnabled` reads).
- Changes: in `saveAppointment` and `updateAppointment`, when `isRelationalModeRequired()` is true and the relational path is not available (`isRelationalModeEnabled()` false) or throws anything other than `SLOT_CONFLICT`, throw `BookingUnavailableError` instead of falling through to the JSON state. When it is false (local development, tests) behaviour is unchanged.

- [ ] **Step 1: Failing tests:** with `DB_RELATIONAL_MODE='true'` and the relational module mocked to throw a connection error, `Database.saveAppointment` rejects with `code 'DB_UNAVAILABLE'` and the JSON state has no new appointment; with the variable unset the same input is saved to the JSON state as before; `SLOT_CONFLICT` still propagates unchanged.
- [ ] **Step 2: Run** `npx vitest run lib/db/fail-closed.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npx vitest run lib/db lib/appointments`. Expected: PASS.
- [ ] **Step 5: Commit**: `feat(booking): refuse bookings instead of using the JSON fallback when Postgres is required`.

### Task 7: Use the conflict check on every booking path

**Files:**
- Modify: `lib/appointments/create.ts`, `app/api/appointments/route.ts` (reschedule and `checkDate` handlers), `lib/mcp/tools/bookings.ts`, `lib/voice/server.ts`, `lib/voice/booking-flow.ts` and `lib/mcp/tools/availability.ts` (pass `blocks` into `getAvailableSlots`)
- Test: extend `lib/appointments/booking-rules.test.ts`; create `lib/appointments/paths-overlap.test.ts`

**Interfaces:**
- Consumes: `findBookingConflict`, `blockedSlotStarts` (Task 2), `acquireDayLock` (Task 3), `slotRangeFields` (Task 1), `BookingUnavailableError` (Task 6).
- Changes: `CreateAppointmentResult` failure variant status becomes `409 | 500 | 503`. `enforceOverlap` is removed from `CreateAppointmentOptions` and its voice call site; overlap is always enforced.
- Changes: `createAppointment` takes the day lock instead of the slot lock, loads blocks with `Database.getExternalBlocks(assistantId: string): Promise<ExternalBlock[]>` (this task adds it to `lib/db/index.ts` as a stub returning `[]`; Task 10 replaces the body), runs `findBookingConflict`, passes `slotRangeFields(assistant, ...)` into `Database.saveAppointment`, and maps `BookingUnavailableError` to `{ ok: false, status: 503, error: 'We could not save your booking right now. Please try again in a moment.' }`.
- Changes: the `client_reschedule` branch takes the day lock for the new date, runs `findBookingConflict` with `ignoreAppointmentId: apt.id` and the booking's own duration, includes `slotRangeFields` in the patch, returns 409 on conflict and 503 on `BookingUnavailableError`.
- Changes: the MCP booking tool replaces its `overlapsExisting` check and slot lock with the same function and passes the range fields; the `GET ?checkDate=` handler returns `bookedSlots` as the union of the exact stored strings and `blockedSlotStarts(...)`.
- The route returns header `Retry-After: 5` with a 503.

- [ ] **Step 1: Failing tests** in `paths-overlap.test.ts` (JSON-mode `Database`, as `concurrency.test.ts` does): a 60-minute booking at 10:00 then a 30-minute booking at 10:30 through `createAppointment` gives the second `{ ok: false, status: 409 }`; the same through the MCP tool throws `BOOKING_CONFLICT`; a reschedule onto an overlapping time returns 409 and onto a free adjacent time succeeds; an external block returned by the (mocked) `Database.getExternalBlocks` rejects the slot; `GET checkDate` lists `'10:30'` as booked after the 10:00 60-minute booking; with `DB_RELATIONAL_MODE='true'` and an unavailable database the route returns 503 with `Retry-After`.
- [ ] **Step 2: Run** `npx vitest run lib/appointments/paths-overlap.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the changes above; keep each call site's existing side effects and messages.
- [ ] **Step 4: Run** `npm test`. Expected: PASS, no previously green test broken.
- [ ] **Step 5: Commit** the touched files by explicit path: `feat(booking): one overlap check on web, widget, voice, MCP and reschedule`.

**Phase 1 checkpoint:** after P1-P3 are done by the owner, this alone closes the double-booking gaps for bookings made through Crescelo. Ship it before Phase 2.

---

## Phase 2: Calendar links

### Task 8: Fetch a calendar link safely

**Files:**
- Create: `lib/calendar/sync/fetch-feed.ts`
- Test: `lib/calendar/sync/fetch-feed.test.ts`

**Interfaces:**
- Produces: `normaliseCalendarUrl(raw: string): string`: trims, rewrites a leading `webcal://` to `https://`.
- Produces: `fetchCalendarFeed(url: string, prev?: { etag?: string; lastModified?: string }): Promise<{ status: 'ok'; text: string; etag?: string; lastModified?: string } | { status: 'not_modified' } | { status: 'error'; error: string }>`. Limits: 8 s timeout, 2 MB body, at most 3 redirects, each hop re-validated with `validateSafeExternalUrl(hop, { requireHttps: true })`; sends `If-None-Match` / `If-Modified-Since` from `prev`; a body that does not contain `BEGIN:VCALENDAR` is an error.

- [ ] **Step 1: Failing tests** (mock `fetch` and `validateSafeExternalUrl`): `webcal://x/y.ics` becomes `https://x/y.ics`; a private-address verdict returns `error`; a redirect to a rejected host returns `error`; 304 returns `not_modified`; an HTML body returns `error`; a body over 2 MB returns `error`; a timeout returns `error`.
- [ ] **Step 2: Run** the file. Expected: FAIL.
- [ ] **Step 3: Implement** with `redirect: 'manual'` and an `AbortController`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit**: `feat(calendar): safe iCal link fetch`.

### Task 9: Parse a feed into busy blocks

**Files:**
- Create: `lib/calendar/sync/parse-ical.ts`
- Modify: `package.json` (add `ical.js`, exact version, at least two weeks old)
- Test: `lib/calendar/sync/parse-ical.test.ts`

**Interfaces:**
- Consumes: `ExternalBlock` (Task 2).
- Produces: `parseIcalBlocks(icsText: string, opts: { timezone: string; from: Date; to: Date }): { blocks: ExternalBlock[]; skipped: number }`. Includes only events that overlap `[from, to)`. Excludes `STATUS:CANCELLED` and `TRANSP:TRANSPARENT`. Recurring events are expanded within the window. All-day events (`VALUE=DATE`) become the whole local day(s) in `opts.timezone`. Floating times are read in `opts.timezone`; `TZID` and UTC are honoured. `skipped` counts events that could not be read (bad recurrence, malformed date); one bad event never fails the feed. A body with no usable events returns an empty list, not an error.

- [ ] **Step 1: Failing tests** with inline ICS strings: a timed UTC event; a `TZID=Europe/Stockholm` event across the DST change; an all-day event closing 00:00-24:00 local; a two-day all-day event; a weekly recurring event within the window; a cancelled and a transparent event ignored; a malformed event counted in `skipped` with the rest still parsed; an empty calendar returns `{ blocks: [], skipped: 0 }`; folded lines.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** on top of `ical.js` (`ICAL.parse`, `ICAL.Component`, `ICAL.Event`, recurrence iteration). Convert times with the same offset method as Task 1 (export a helper from `time-range.ts` if needed).
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `package.json`, `package-lock.json`, the two files: `feat(calendar): parse iCal feeds into busy blocks`.

### Task 10: Store links and blocks

**Files:**
- Create: `supabase/schema-relational-v5-calendar-links.sql`
- Modify: `lib/db/index.ts` (new `CalendarLink` import, `Database` methods, `AssistantData.calendarFeedToken`, notification type union), `lib/db/relational.ts`, `lib/calendar/sync/types.ts`
- Test: `lib/db/calendar-store.test.ts`

**Interfaces:**
- Produces (types.ts): `interface CalendarLink { id: string; assistantId: string; label: 'google' | 'apple' | 'outlook' | 'other'; url: string; lastSyncedAt?: string; lastError?: string; errorSince?: string; etag?: string; lastModified?: string; createdAt: string }`
- Produces on `Database` (follow the relational-then-JSON pattern of the appointment methods): `getCalendarLinks(assistantId: string): Promise<CalendarLink[]>`, `saveCalendarLink(link: CalendarLink): Promise<CalendarLink>`, `deleteCalendarLink(assistantId: string, linkId: string): Promise<boolean>` (also deletes its blocks), `replaceExternalBlocks(linkId: string, assistantId: string, blocks: ExternalBlock[]): Promise<void>` (one transaction in Postgres), `getExternalBlocks(assistantId: string, from?: Date): Promise<ExternalBlock[]>`, `getAllCalendarLinks(): Promise<CalendarLink[]>`.
- SQL v5 creates `kortex_calendar_links` and `kortex_external_blocks (link_id, assistant_id, start_at, end_at)` with an index on `(assistant_id, start_at)`, RLS service-role policy like v3.
- `AssistantData` gains `calendarFeedToken?: string`. `Notification.type` gains `'calendar_clash' | 'calendar_sync_failed'`.
- Replace the Task 7 stub for `getExternalBlocks` with this implementation.

- [ ] **Step 1: Failing tests** (JSON mode): save two links and read them back; `replaceExternalBlocks` replaces rather than appends; `getExternalBlocks` returns blocks from all of an assistant's links and none from another assistant; `deleteCalendarLink` removes the link's blocks; `from` filters out blocks that ended earlier.
- [ ] **Step 2: Run** `npx vitest run lib/db/calendar-store.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** both paths and the SQL file.
- [ ] **Step 4: Run** `npx vitest run lib/db lib/appointments`. Expected: PASS.
- [ ] **Step 5: Commit**: `feat(calendar): store calendar links and external blocks`.

### Task 11: Sync a link, refresh before booking, and warn on clashes

**Files:**
- Create: `lib/calendar/sync/sync-link.ts`, `lib/calendar/sync/clashes.ts`, `app/api/cron/calendar-sync/route.ts`
- Modify: `lib/appointments/create.ts`, `lib/mcp/tools/bookings.ts` (call the refresh before the conflict check)
- Test: `lib/calendar/sync/sync-link.test.ts`, `lib/calendar/sync/clashes.test.ts`

**Interfaces:**
- Consumes: Tasks 8, 9, 10.
- Produces: `syncCalendarLink(link: CalendarLink, assistant: AssistantData, now?: Date): Promise<{ ok: boolean; blocks: number; error?: string }>`. Window is `now` to `now + 180 days`. On error or `not_modified` it keeps the stored blocks; on error it sets `lastError` (and `errorSince` if unset); on success it clears both and sets `lastSyncedAt`. A parse that returns zero blocks from a body that previously produced blocks is still accepted only if the fetch was `ok` and contained `BEGIN:VCALENDAR` (an emptied calendar is legitimate).
- Produces: `refreshAssistantCalendars(assistant: AssistantData, opts?: { timeoutMs?: number; maxAgeMs?: number }): Promise<{ stale: boolean }>`: syncs the assistant's links older than `maxAgeMs` (default 60 s) in parallel under `timeoutMs` (default 3000); `stale` is true when any link failed or timed out.
- Produces: `syncDueCalendars(now?: Date, maxAgeMs?: number): Promise<{ checked: number; failed: number }>` (default 10 minutes).
- Produces: `detectClashes(assistant: AssistantData, now?: Date): Promise<AppointmentData[]>`: future non-cancelled bookings that overlap a block and have no `externalClashAt`; for each, sets `externalClashAt`, adds a `'calendar_clash'` notification and emails `assistant.supportReceiverEmail` through `sendOperationalEmail` in `lib/email.ts`. Runs after each successful sync.
- Route `GET`/`POST /api/cron/calendar-sync`: the same auth block as `app/api/cron/reminders/route.ts`; returns the `syncDueCalendars` counts. After a link has failed for 24 hours, add one `'calendar_sync_failed'` notification (no repeat while `errorSince` is unchanged).
- Changes: `createAppointment` and the MCP tool call `refreshAssistantCalendars` right before the conflict check; a `stale: true` result is logged with `logEvent` event `booking.calendar_stale` and does not block the booking.

- [ ] **Step 1: Failing tests:** a failing fetch keeps the old blocks and sets `lastError`; a successful sync replaces blocks and clears the error; an HTML body keeps the old blocks; `refreshAssistantCalendars` returns `stale: true` when a fetch hangs past the timeout and still resolves; `detectClashes` flags an overlapping future booking once and not again on the next run, and ignores past and cancelled bookings; the cron route returns 401 without the secret.
- [ ] **Step 2: Run** the three test files. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit**: `feat(calendar): sync links, refresh before booking, warn on clashes`.

### Task 12: Export feed

**Files:**
- Create: `lib/calendar/export-feed.ts`, `app/api/calendar/[token]/feed.ics/route.ts`
- Test: `lib/calendar/export-feed.test.ts`

**Interfaces:**
- Produces: `generateBusyFeed(appointments: AppointmentData[], calendarName: string, timezone?: string): string`: confirmed and pending bookings as timed VEVENTs, `SUMMARY:Busy`, UID `<id>@crescelo`, no description or attendee fields. Not derived from `generateIcsFeed`.
- Produces: `ensureFeedToken(assistant: AssistantData): Promise<string>` and `resetFeedToken(assistant: AssistantData): Promise<string>` using `crypto.randomBytes(24).toString('base64url')`, stored on `calendarFeedToken`.
- Route `GET /api/calendar/[token]/feed.ics`: looks the assistant up by token (404 for unknown), responds `text/calendar; charset=utf-8` with `Cache-Control: private, max-age=300`. Rate limit it with the existing helper in `lib/security/rate-limit`.

- [ ] **Step 1: Failing tests:** the feed contains `SUMMARY:Busy` and none of the booking's name, email, phone or notes; cancelled bookings are absent; times are UTC `DTSTART`/`DTEND` matching `slotRange`; an unreadable-time booking is skipped; `resetFeedToken` returns a different value and the old token no longer resolves.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit**: `feat(calendar): private busy-only export feed`.

### Task 13: Settings API and panel

**Files:**
- Create: `app/api/assistants/[id]/calendars/route.ts`, `components/crm/CalendarLinksPanel.tsx`
- Modify: `components/crm/WidgetTab.tsx` (render the panel inside the booking card, direct provider only, below the working-days control)
- Test: `lib/calendar/links-api.test.ts` (route handler), then a manual browser check

**Interfaces:**
- Route `GET` lists links (URLs returned masked to origin plus the first path segment), `POST { label, url }` validates with `normaliseCalendarUrl` + a first `fetchCalendarFeed` + `parseIcalBlocks` and saves only if all succeed (400 with the reason otherwise), `DELETE ?linkId=`, `POST ?action=sync&linkId=` runs `syncCalendarLink`, `POST ?action=reset-feed` returns a new feed URL. Same workspace authorisation pattern as `app/api/assistants/[id]/route.ts`; a user from another workspace gets 404.
- Panel: list of rows (label, masked link, last synced, error text, "Sync now", remove); add form (label select Google / Apple or iCloud / Outlook / Other, URL input, "Add calendar"); the export link with "Copy" and "Reset link"; short help text for each label naming where the private link lives; a fixed note: "Other apps refresh your Crescelo link slowly, often every few hours, so a new booking may show there late. It is already safe in Crescelo."
- All strings through `<T>`; follow the markup and Tailwind classes of the booking card around it.

- [ ] **Step 1: Failing tests** for the route: a valid feed saves; a private-address URL is rejected 400; an HTML page is rejected 400; another workspace gets 404; delete removes blocks; reset returns a new token.
- [ ] **Step 2: Run** `npx vitest run lib/calendar/links-api.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** route and panel.
- [ ] **Step 4: Run** the test file and `npx vitest run lib/i18n`. Expected: PASS. Then start the dev server with `preview_start` and open the assistant's widget settings. Adding a localhost link must show the "internal addresses are not allowed" message; also check the empty state and the layout in light and dark mode with a screenshot. Do not register or delete anything against the live database while doing this.
- [ ] **Step 5: Commit**: `feat(calendar): calendar links settings panel`.

### Task 14: Copy and documentation

**Files:**
- Modify: `lib/platform/guides.ts` (calendar and booking guides), pricing and marketing strings that say two-way sync is unavailable (`grep -rn "two-way\|Two-way" lib components app`), and the memory file `crescelo-product-facts-for-content.md`
- Test: `npx vitest run lib/platform lib/i18n`

**Interfaces:** none.

- [ ] **Step 1:** Replace "two-way sync is not available" with the true statement from the spec's "Product copy rule": Crescelo never double-books its own slots; it reads your calendar links and refreshes them right before confirming; your calendar may show new bookings late; events added in another calendar in the same second cannot be seen by either system; Google and Apple write-back is planned. Do not use the words "zero" or "never double-book" for outside calendars.
- [ ] **Step 2: Run** the test command above. Expected: PASS.
- [ ] **Step 3: Update** the memory file's calendar line to match what shipped.
- [ ] **Step 4: Commit** the changed files by path: `docs(booking): describe calendar link sync accurately`.

---

## Final verification (before claiming done)

- [ ] `npm test` passes in full.
- [ ] `npx tsc --noEmit -p .` shows no new errors; `npm run lint` shows none in the touched files.
- [ ] Manual, on a scratch database, never the live one: apply the two SQL files, then insert two overlapping bookings for one assistant (different start times) and confirm Postgres rejects the second with `23P01`.
- [ ] Manual in the browser: with a published `.ics` link from a real Google or iCloud calendar, add it in the panel, confirm an event on it greys out the matching slot in the public widget, and confirm the widget refuses that slot at submit.

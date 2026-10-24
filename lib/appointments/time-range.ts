/**
 * UTC time ranges for bookings. A booking stores a local date ("YYYY-MM-DD") and a time slot in the
 * business's timezone; calendar sync and double-booking checks need absolute instants instead.
 * Ranges are half-open: [start, end), so a booking ending at 10:30 does not clash with one starting at 10:30.
 */

import { isIsoDate, isValidTimezone, occupiedRange } from './availability';

export interface SlotRange {
  start: Date;
  end: Date;
}

const MINUTE_MS = 60_000;

// Building an Intl.DateTimeFormat is far slower than using one, and the conflict check reads many ranges per request,
// so one formatter per timezone and the validity of each timezone name are kept for the life of the process.
const CACHE_LIMIT = 1000;
const formatters = new Map<string, Intl.DateTimeFormat>();
const timezoneValidity = new Map<string, boolean>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    // Same bound as the validity map below: a cached formatter is only an optimisation, so past the cap it is not kept.
    if (formatters.size < CACHE_LIMIT) formatters.set(timeZone, f);
  }
  return f;
}

/** True when `timeZone` is a name Intl accepts (cached; callers of the helpers below must check this first). */
export function knownTimezone(timeZone: string): boolean {
  let ok = timezoneValidity.get(timeZone);
  if (ok === undefined) {
    ok = isValidTimezone(timeZone);
    // Timezone names come from stored assistants, so the set stays small; the bound only guards against odd input.
    if (timezoneValidity.size < CACHE_LIMIT) timezoneValidity.set(timeZone, ok);
  }
  return ok;
}

/** Offset (ms, local minus UTC) of `timeZone` at the given instant. */
function zoneOffsetMs(timeZone: string, instant: number): number {
  const parts = formatterFor(timeZone).formatToParts(new Date(instant));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  // Drop sub-second part of the instant so the difference is a clean offset.
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** UTC instant (ms) at which the wall clock in `timeZone` reads the given local date and minutes. */
export function wallTimeToUtc(date: string, minutes: number, timeZone: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const wall = Date.UTC(y, m - 1, d, 0, minutes);
  // Guess with the offset at the naive instant, then re-read once so a DST change in between settles.
  const first = wall - zoneOffsetMs(timeZone, wall);
  return wall - zoneOffsetMs(timeZone, first);
}

/**
 * The [start, end) range of a booking as UTC instants, or null when the date or time cannot be read (also when a stored row has no
 * date or time at all, or not as text: one malformed row must never break the busy feed or a clash check).
 * Duration: a range string's end wins ("10:00 AM - 10:30 AM"), else durationMinutes, else 30.
 * An unknown or missing timezone is treated as UTC.
 */
export function slotRange(date: string, timeSlot: string, durationMinutes: number | undefined, timezone: string | undefined): SlotRange | null {
  if (typeof date !== 'string' || typeof timeSlot !== 'string' || !isIsoDate(date)) return null;
  const range = occupiedRange({ date, timeSlot, durationMinutes });
  if (!range) return null;
  const tz = timezone && knownTimezone(timezone) ? timezone : 'UTC';
  const start = wallTimeToUtc(date, range[0], tz);
  return { start: new Date(start), end: new Date(start + (range[1] - range[0]) * MINUTE_MS) };
}

/** `slotStart` / `slotEnd` ISO strings to store on a booking, or `{}` when its time cannot be read. */
export function slotRangeFields(
  assistant: { timezone?: string },
  input: { date: string; timeSlot: string; durationMinutes?: number },
): { slotStart?: string; slotEnd?: string } {
  const r = slotRange(input.date, input.timeSlot, input.durationMinutes, assistant.timezone);
  return r ? { slotStart: r.start.toISOString(), slotEnd: r.end.toISOString() } : {};
}

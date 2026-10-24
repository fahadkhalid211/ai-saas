/**
 * How far linked calendars are read, shared by the sync, the "add a calendar" check and the booking horizon. Pure (no I/O).
 *
 * A link is read for [read time - 1 day, read time + 400 days]. A booking further ahead than that could never be checked against the
 * owner's calendar, so an assistant with at least one linked calendar refuses dates beyond it (see booking-horizon.ts).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const SYNC_WINDOW_BACK_MS = DAY_MS;
export const SYNC_WINDOW_FORWARD_DAYS = 400;
export const SYNC_WINDOW_FORWARD_MS = SYNC_WINDOW_FORWARD_DAYS * DAY_MS;

export const TOO_FAR_AHEAD_MESSAGE = 'That date is too far ahead. Please choose an earlier date.';

/**
 * True when a booking date ("YYYY-MM-DD") may end after the blocks the linked calendars hold. The blocks may be up to a day old (a link is
 * read fully at least once a day) and a local day ends up to about 38 hours after the start of the same UTC date, so the last bookable date
 * starts at least 3 days before the window's end. False for text that is not a date (other checks refuse it).
 */
export function isBeyondCalendarWindow(date: string, now: Date = new Date()): boolean {
  const m = typeof date === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim()) : null;
  if (!m) return false;
  const dayStart = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (!Number.isFinite(dayStart)) return false;
  return dayStart > now.getTime() + SYNC_WINDOW_FORWARD_MS - 3 * DAY_MS;
}

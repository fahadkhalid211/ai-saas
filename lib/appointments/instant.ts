/**
 * The moment (UTC milliseconds) of an appointment booked as a wall-clock date and time ("2026-09-15", "14:30") in a
 * business's own time zone.
 *
 * Reminders used to read these with `new Date(y, m, d, h, min)`, which means the time zone of the SERVER (UTC on Vercel). A
 * 14:30 appointment in New York was treated as 14:30 UTC, four or five hours too early, so the "24 hours before" and "1 hour
 * before" windows opened at the wrong time. A missing or invalid zone is treated as UTC, like the rest of the booking code.
 */

function offsetAt(instantMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instantMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asIfUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asIfUtc - instantMs;
}

export function zonedTimeToUtcMs(date: string, time: string | undefined, timeZone?: string): number {
  const [y, m, d] = date.split('-').map((n) => parseInt(n, 10));
  const [hh, mm] = (time || '09:00').split(':').map((n) => parseInt(n, 10));
  const wall = Date.UTC(y, m - 1, d, hh || 0, mm || 0, 0);
  if (!timeZone) return wall;
  try {
    const first = wall - offsetAt(wall, timeZone);
    // the offset can differ across a daylight-saving change: look it up again at the first answer
    const second = wall - offsetAt(first, timeZone);
    return second;
  } catch {
    return wall; // not a time zone the runtime knows
  }
}

/**
 * Slot generation and availability for appointment booking.
 * Pure functions: callers pass in the existing appointments, so this is easy to test and safe to
 * reuse from any channel (voice today, web/WhatsApp later).
 *
 * Slot strings use "HH:MM" (24h), matching what the hosted business page already submits.
 */

import type { ExternalBlock } from '../calendar/sync/types';
import { slotRange } from './time-range';

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export interface AvailabilityConfig {
  bookingStartHour?: string;
  bookingEndHour?: string;
  bookingAvailableDays?: string[];
  bookingSlotDuration?: number;
  timezone?: string;
}

export interface ExistingAppointment {
  date: string;
  timeSlot: string;
  durationMinutes?: number;
  status?: string;
}

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Parses "14:30", "2:30 PM", "10 AM" or a range ("10:00 - 10:30", start wins). Returns minutes from midnight. */
export function parseTimeToMinutes(input: string): number | null {
  const first = input.split(/\s*(?:-|–|—|to)\s*(?=\d)/i)[0].trim();
  const m = first.match(/^(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const mer = m[3]?.toUpperCase();
  if (mer) {
    if (h < 1 || h > 12) return null;
    if (mer === 'AM' && h === 12) h = 0;
    else if (mer === 'PM' && h !== 12) h += 12;
  } else if (h > 23) {
    return null;
  }
  return h * 60 + min;
}

/** End of a "start - end" range in minutes, if the string is a range. */
function parseRangeEnd(input: string): number | null {
  const parts = input.split(/\s*(?:-|–|—|to)\s*(?=\d)/i);
  if (parts.length < 2) return null;
  return parseTimeToMinutes(parts[1]);
}

export function minutesToHHMM(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** "14:30" -> "2:30 PM" for speaking to a caller. */
export function speakTime(hhmm: string): string {
  const mins = parseTimeToMinutes(hhmm);
  if (mins === null) return hhmm;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function weekdayOf(isoDate: string): string {
  return WEEKDAYS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()];
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Today's date and minutes-since-midnight in the given IANA timezone. Falls back to UTC on a bad zone. */
export function nowInTimezone(timezone: string | undefined, now: Date = new Date()): { date: string; minutes: number } {
  let tz = timezone || 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
  } catch {
    tz = 'UTC';
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '00';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function occupiedRange(a: ExistingAppointment): [number, number] | null {
  const start = parseTimeToMinutes(a.timeSlot);
  if (start === null) return null;
  const rangeEnd = parseRangeEnd(a.timeSlot);
  const end = rangeEnd !== null && rangeEnd > start ? rangeEnd : start + (a.durationMinutes && a.durationMinutes > 0 ? a.durationMinutes : 30);
  return [start, end];
}

/** True when [start, start + duration) overlaps any active appointment on that date. */
export function overlapsExisting(date: string, startMinutes: number, durationMinutes: number, appointments: ExistingAppointment[]): boolean {
  const end = startMinutes + durationMinutes;
  return appointments.some((a) => {
    if (a.date !== date || a.status === 'cancelled') return false;
    const r = occupiedRange(a);
    return r ? startMinutes < r[1] && r[0] < end : false;
  });
}

export interface SlotQuery {
  config: AvailabilityConfig;
  date: string;
  durationMinutes?: number;
  appointments: ExistingAppointment[];
  now?: Date;
  /** Minimum notice before a slot can be booked today. */
  minLeadMinutes?: number;
  /** Busy periods from linked external calendars; any slot overlapping one is dropped. */
  blocks?: ExternalBlock[];
}

/** Open start times ("HH:MM") for a date, honouring opening days/hours, duration, overlaps and the past. */
export function getAvailableSlots(q: SlotQuery): string[] {
  if (!isIsoDate(q.date)) return [];
  const days = q.config.bookingAvailableDays && q.config.bookingAvailableDays.length ? q.config.bookingAvailableDays : DEFAULT_DAYS;
  if (!days.includes(weekdayOf(q.date))) return [];

  const open = parseTimeToMinutes(q.config.bookingStartHour || '09:00');
  const close = parseTimeToMinutes(q.config.bookingEndHour || '17:00');
  if (open === null || close === null || close <= open) return [];

  const step = Math.max(5, Math.min(240, q.config.bookingSlotDuration || 30));
  const duration = Math.max(5, Math.min(480, q.durationMinutes || step));
  const today = nowInTimezone(q.config.timezone, q.now);
  if (q.date < today.date) return [];
  const earliest = q.date === today.date ? today.minutes + (q.minLeadMinutes ?? 30) : 0;

  const blocks = q.blocks ?? [];
  const slots: string[] = [];
  for (let start = open; start + duration <= close; start += step) {
    if (start < earliest) continue;
    if (overlapsExisting(q.date, start, duration, q.appointments)) continue;
    if (blocks.length) {
      const r = slotRange(q.date, minutesToHHMM(start), duration, q.config.timezone);
      if (r && blocks.some((b) => r.start < b.endAt && b.startAt < r.end)) continue;
    }
    slots.push(minutesToHHMM(start));
  }
  return slots;
}

export function isSlotAvailable(q: SlotQuery & { timeSlot: string }): boolean {
  const start = parseTimeToMinutes(q.timeSlot);
  if (start === null) return false;
  return getAvailableSlots(q).includes(minutesToHHMM(start));
}

/** Next `count` dates (from today, or `from` if later, in the assistant's timezone) that have at least one open slot. */
export function nextOpenDates(q: Omit<SlotQuery, 'date'> & { count?: number; horizonDays?: number; from?: string }): { date: string; slots: string[] }[] {
  const today = nowInTimezone(q.config.timezone, q.now).date;
  const start = q.from && isIsoDate(q.from) && q.from > today ? q.from : today;
  const out: { date: string; slots: string[] }[] = [];
  for (let i = 0; i < (q.horizonDays ?? 21) && out.length < (q.count ?? 3); i++) {
    const date = addDays(start, i);
    const slots = getAvailableSlots({ ...q, date });
    if (slots.length) out.push({ date, slots });
  }
  return out;
}

/** True when the business is inside its configured opening days and hours right now (in its timezone). */
export function isOpenNow(config: AvailabilityConfig, now: Date = new Date()): boolean {
  const t = nowInTimezone(config.timezone, now);
  const days = config.bookingAvailableDays && config.bookingAvailableDays.length ? config.bookingAvailableDays : DEFAULT_DAYS;
  if (!days.includes(weekdayOf(t.date))) return false;
  const open = parseTimeToMinutes(config.bookingStartHour || '09:00');
  const close = parseTimeToMinutes(config.bookingEndHour || '17:00');
  if (open === null || close === null) return false;
  return t.minutes >= open && t.minutes < close;
}

/**
 * Why a requested booking falls outside the business's configured opening days or hours, or null when it is fine.
 * Only what the owner actually configured is enforced (an assistant that never set its hours keeps accepting any time, as before),
 * and a time written in a format this cannot read is let through rather than refused.
 */
export function openingHoursProblem(config: AvailabilityConfig, date: string, timeSlot: string): string | null {
  if (!isIsoDate(date)) return null;
  const days = config.bookingAvailableDays;
  if (days && days.length && !days.includes(weekdayOf(date))) {
    return `We are not open on ${weekdayOf(date)}s. Please pick another day.`;
  }
  const start = parseTimeToMinutes(timeSlot);
  if (start === null) return null;
  const open = config.bookingStartHour ? parseTimeToMinutes(config.bookingStartHour) : null;
  const close = config.bookingEndHour ? parseTimeToMinutes(config.bookingEndHour) : null;
  if ((open !== null && start < open) || (close !== null && start >= close)) {
    return `That time is outside our opening hours (${config.bookingStartHour || '00:00'} to ${config.bookingEndHour || '24:00'}). Please pick another time.`;
  }
  return null;
}

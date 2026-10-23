/**
 * The one conflict check every booking path uses: does a requested time clash with an existing booking
 * or with a busy period on a linked external calendar? Pure; callers load the appointments and blocks.
 * All comparisons are half-open ranges, so back-to-back bookings (10:00-10:30, 10:30-11:00) do not clash.
 */

import type { ExternalBlock } from '../calendar/sync/types';
import { isIsoDate, minutesToHHMM, parseTimeToMinutes, type AvailabilityConfig, type ExistingAppointment } from './availability';
import { slotRange } from './time-range';

export type BookingConflict = { kind: 'booking'; appointmentId?: string } | { kind: 'external' };

export interface ConflictQuery {
  date: string;
  timeSlot: string;
  durationMinutes?: number;
  timezone?: string;
  appointments: Array<ExistingAppointment & { id?: string }>;
  blocks: ExternalBlock[];
  /** A booking to leave out of the check, e.g. the one being rescheduled. */
  ignoreAppointmentId?: string;
}

/** The first conflict for the requested time, or null when it is free. Bookings are reported before external blocks. */
export function findBookingConflict(q: ConflictQuery): BookingConflict | null {
  const wanted = slotRange(q.date, q.timeSlot, q.durationMinutes, q.timezone);

  for (const a of q.appointments) {
    if (a.status === 'cancelled') continue;
    if (q.ignoreAppointmentId !== undefined && a.id === q.ignoreAppointmentId) continue;
    const theirs = slotRange(a.date, a.timeSlot, a.durationMinutes, q.timezone);
    const clash =
      wanted && theirs
        ? wanted.start < theirs.end && theirs.start < wanted.end
        : // Unreadable times cannot be compared by range; identical strings are still the same slot.
          a.date === q.date && a.timeSlot === q.timeSlot;
    if (clash) return { kind: 'booking', appointmentId: a.id };
  }

  if (wanted && q.blocks.some((b) => wanted.start < b.endAt && b.startAt < wanted.end)) return { kind: 'external' };
  return null;
}

/** Every "HH:MM" grid start inside the opening hours that overlaps a booking or an external block. */
export function blockedSlotStarts(q: {
  config: AvailabilityConfig;
  date: string;
  appointments: ExistingAppointment[];
  blocks: ExternalBlock[];
}): string[] {
  if (!isIsoDate(q.date)) return [];
  const open = parseTimeToMinutes(q.config.bookingStartHour || '09:00');
  const close = parseTimeToMinutes(q.config.bookingEndHour || '17:00');
  if (open === null || close === null || close <= open) return [];

  const step = Math.max(5, Math.min(240, q.config.bookingSlotDuration || 30));
  const out: string[] = [];
  for (let start = open; start + step <= close; start += step) {
    const timeSlot = minutesToHHMM(start);
    if (findBookingConflict({ date: q.date, timeSlot, durationMinutes: step, timezone: q.config.timezone, appointments: q.appointments, blocks: q.blocks })) {
      out.push(timeSlot);
    }
  }
  return out;
}

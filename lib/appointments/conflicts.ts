/**
 * The one conflict check every booking path uses: does a requested time clash with an existing booking
 * or with a busy period on a linked external calendar? Pure; callers load the appointments and blocks.
 * All comparisons are half-open ranges, so back-to-back bookings (10:00-10:30, 10:30-11:00) do not clash.
 */

import type { ExternalBlock } from '../calendar/sync/types';
import { addDays, isIsoDate, minutesToHHMM, parseTimeToMinutes, type AvailabilityConfig, type ExistingAppointment } from './availability';
import { slotRange } from './time-range';

export type BookingConflict = { kind: 'booking'; appointmentId?: string } | { kind: 'external' };

export type ConflictAppointment = ExistingAppointment & { id?: string };

export interface ConflictQuery {
  date: string;
  timeSlot: string;
  durationMinutes?: number;
  timezone?: string;
  appointments: ConflictAppointment[];
  blocks: ExternalBlock[];
  /** A booking to leave out of the check, e.g. the one being rescheduled. */
  ignoreAppointmentId?: string;
  /**
   * Leave out an external block whose range is EXACTLY the requested one. Only for restoring a cancelled booking: the owner's linked
   * calendar may hold that very booking (added from the booking, or through a merged feed). Never for a new booking or a reschedule:
   * there an identical block is another event.
   */
  ignoreIdenticalBlock?: boolean;
}

/**
 * The active bookings that can overlap a booking on `date`. A booking lasts at most 480 minutes, so only bookings on the
 * day before, the day itself and the day after can reach it; everything else is skipped before its range is computed.
 * Same-date rows are always kept, so an unreadable time still meets the exact-string comparison.
 */
function candidates(appointments: ConflictAppointment[], date: string): ConflictAppointment[] {
  const from = isIsoDate(date) ? addDays(date, -1) : null;
  const to = isIsoDate(date) ? addDays(date, 1) : null;
  return appointments.filter((a) => {
    if (a.status === 'cancelled') return false;
    if (a.date === date) return true;
    return from !== null && to !== null && typeof a.date === 'string' && a.date >= from && a.date <= to;
  });
}

function firstConflict(
  q: Omit<ConflictQuery, 'appointments'>,
  appointments: ConflictAppointment[],
): BookingConflict | null {
  const wanted = slotRange(q.date, q.timeSlot, q.durationMinutes, q.timezone);

  for (const a of appointments) {
    if (q.ignoreAppointmentId !== undefined && a.id === q.ignoreAppointmentId) continue;
    const theirs = slotRange(a.date, a.timeSlot, a.durationMinutes, q.timezone);
    const clash =
      wanted && theirs
        ? wanted.start < theirs.end && theirs.start < wanted.end
        : // Unreadable times cannot be compared by range; identical strings are still the same slot.
          a.date === q.date && a.timeSlot === q.timeSlot;
    if (clash) return { kind: 'booking', appointmentId: a.id };
  }

  const identical = (b: ExternalBlock) =>
    q.ignoreIdenticalBlock === true && !!wanted && b.startAt.getTime() === wanted.start.getTime() && b.endAt.getTime() === wanted.end.getTime();
  if (wanted && q.blocks.some((b) => wanted.start < b.endAt && b.startAt < wanted.end && !identical(b))) return { kind: 'external' };
  return null;
}

/** The first conflict for the requested time, or null when it is free. Bookings are reported before external blocks. */
export function findBookingConflict(q: ConflictQuery): BookingConflict | null {
  return firstConflict(q, candidates(q.appointments, q.date));
}

/** Every "HH:MM" grid start inside the opening hours that overlaps a booking or an external block. */
export function blockedSlotStarts(q: {
  config: AvailabilityConfig;
  date: string;
  appointments: ConflictAppointment[];
  blocks: ExternalBlock[];
}): string[] {
  if (!isIsoDate(q.date)) return [];
  const open = parseTimeToMinutes(q.config.bookingStartHour || '09:00');
  const close = parseTimeToMinutes(q.config.bookingEndHour || '17:00');
  if (open === null || close === null || close <= open) return [];

  // Narrowed once for the whole day instead of once per grid slot.
  const nearby = candidates(q.appointments, q.date);
  const step = Math.max(5, Math.min(240, q.config.bookingSlotDuration || 30));
  const out: string[] = [];
  for (let start = open; start + step <= close; start += step) {
    const timeSlot = minutesToHHMM(start);
    if (firstConflict({ date: q.date, timeSlot, durationMinutes: step, timezone: q.config.timezone, blocks: q.blocks }, nearby)) {
      out.push(timeSlot);
    }
  }
  return out;
}

import { describe, expect, it } from 'vitest';
import { blockedSlotStarts, findBookingConflict } from './conflicts';
import { addDays } from './availability';
import type { ExternalBlock } from '../calendar/sync/types';

const block = (start: string, end: string): ExternalBlock => ({ startAt: new Date(start), endAt: new Date(end) });

describe('findBookingConflict', () => {
  it('conflicts with a booking that overlaps by range', () => {
    const r = findBookingConflict({
      date: '2026-10-23',
      timeSlot: '10:00',
      durationMinutes: 60,
      appointments: [{ id: 'a1', date: '2026-10-23', timeSlot: '10:30', durationMinutes: 30 }],
      blocks: [],
    });
    expect(r).toEqual({ kind: 'booking', appointmentId: 'a1' });
  });

  it('does not conflict when one booking ends exactly as the next starts', () => {
    const appointments = [{ id: 'a1', date: '2026-10-23', timeSlot: '10:00', durationMinutes: 30 }];
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '10:30', durationMinutes: 30, appointments, blocks: [] })).toBeNull();
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '09:30', durationMinutes: 30, appointments, blocks: [] })).toBeNull();
  });

  it('never conflicts with a cancelled booking', () => {
    const appointments = [{ id: 'a1', date: '2026-10-23', timeSlot: '10:00', durationMinutes: 30, status: 'cancelled' }];
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '10:00', appointments, blocks: [] })).toBeNull();
  });

  it('skips the booking named by ignoreAppointmentId (reschedule)', () => {
    const appointments = [{ id: 'a1', date: '2026-10-23', timeSlot: '10:00', durationMinutes: 30 }];
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '10:00', appointments, blocks: [], ignoreAppointmentId: 'a1' })).toBeNull();
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '10:00', appointments, blocks: [], ignoreAppointmentId: 'other' })).toEqual({ kind: 'booking', appointmentId: 'a1' });
  });

  it('blocks the local slot when an external block covers it (Stockholm, winter UTC+1)', () => {
    const blocks = [block('2026-12-10T09:00:00Z', '2026-12-10T12:00:00Z')];
    const q = { date: '2026-12-10', durationMinutes: 30, timezone: 'Europe/Stockholm', appointments: [], blocks };
    expect(findBookingConflict({ ...q, timeSlot: '10:00' })).toEqual({ kind: 'external' });
    expect(findBookingConflict({ ...q, timeSlot: '09:30' })).toBeNull(); // 08:30Z-09:00Z ends as the block starts
  });

  it('applies the timezone offset in summer (Stockholm, UTC+2)', () => {
    const blocks = [block('2026-07-15T09:00:00Z', '2026-07-15T12:00:00Z')];
    const q = { date: '2026-07-15', durationMinutes: 30, timezone: 'Europe/Stockholm', appointments: [], blocks };
    expect(findBookingConflict({ ...q, timeSlot: '10:00' })).toBeNull(); // 08:00Z-08:30Z
    expect(findBookingConflict({ ...q, timeSlot: '11:00' })).toEqual({ kind: 'external' }); // 09:00Z-09:30Z
  });

  it('a block covering the whole local day blocks any time that day', () => {
    // Local day 2026-07-15 in Stockholm is 2026-07-14T22:00Z to 2026-07-15T22:00Z.
    const blocks = [block('2026-07-14T22:00:00Z', '2026-07-15T22:00:00Z')];
    const q = { date: '2026-07-15', timezone: 'Europe/Stockholm', appointments: [], blocks };
    for (const timeSlot of ['00:00', '09:00', '13:45', '23:30']) {
      expect(findBookingConflict({ ...q, timeSlot })).toEqual({ kind: 'external' });
    }
    expect(findBookingConflict({ ...q, date: '2026-07-16', timeSlot: '09:00' })).toBeNull();
  });

  it('reads range strings: "10:00 AM - 10:30 AM" conflicts with 10:15', () => {
    const appointments = [{ id: 'a1', date: '2026-10-23', timeSlot: '10:00 AM - 10:30 AM' }];
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '10:15', durationMinutes: 15, appointments, blocks: [] })).toEqual({ kind: 'booking', appointmentId: 'a1' });
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '10:30', durationMinutes: 15, appointments, blocks: [] })).toBeNull();
  });

  it('an unreadable booking time matches only on identical date and timeSlot strings', () => {
    const appointments = [{ id: 'a1', date: '2026-10-23', timeSlot: 'after lunch' }];
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: 'after lunch', appointments, blocks: [] })).toEqual({ kind: 'booking', appointmentId: 'a1' });
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '13:00', appointments, blocks: [] })).toBeNull();
    expect(findBookingConflict({ date: '2026-10-24', timeSlot: 'after lunch', appointments, blocks: [] })).toBeNull();
  });

  it('finds a booking on the previous day that runs past midnight (UTC)', () => {
    const appointments = [{ id: 'late', date: '2026-10-22', timeSlot: '23:30', durationMinutes: 120 }];
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '00:30', durationMinutes: 30, appointments, blocks: [] })).toEqual({ kind: 'booking', appointmentId: 'late' });
    expect(findBookingConflict({ date: '2026-10-23', timeSlot: '01:30', durationMinutes: 30, appointments, blocks: [] })).toBeNull();
  });

  it('prefers a booking conflict over an external one', () => {
    const r = findBookingConflict({
      date: '2026-10-23',
      timeSlot: '10:00',
      appointments: [{ id: 'a1', date: '2026-10-23', timeSlot: '10:00' }],
      blocks: [block('2026-10-23T00:00:00Z', '2026-10-24T00:00:00Z')],
    });
    expect(r).toEqual({ kind: 'booking', appointmentId: 'a1' });
  });
});

describe('cost of the check with many bookings', () => {
  // 2000 bookings spread over 400 days: the public checkDate list runs one check per grid slot,
  // and createAppointment runs it while holding the day lock.
  const many = Array.from({ length: 2000 }, (_, i) => ({
    id: `m${i}`,
    date: addDays('2026-01-01', i % 400),
    timeSlot: `${String(9 + (i % 8)).padStart(2, '0')}:00`,
    durationMinutes: 30,
  }));
  const config = { bookingStartHour: '07:00', bookingEndHour: '17:00', bookingSlotDuration: 30, timezone: 'Europe/Stockholm' };

  it('blockedSlotStarts over 2000 bookings stays well under 500 ms', () => {
    const started = performance.now();
    const blocked = blockedSlotStarts({ config, date: '2026-03-15', appointments: many, blocks: [] });
    const ms = performance.now() - started;
    // 2026-03-15 is day 73: bookings at 10:00..16:00 local, five of them that day
    expect(blocked.length).toBeGreaterThan(0);
    expect(ms).toBeLessThan(500);
  }, 60_000);

  it('gives the same answers as the unwindowed check', () => {
    const date = '2026-03-15';
    const blocked = blockedSlotStarts({ config, date, appointments: many, blocks: [] });
    const sameDay = many.filter((a) => a.date === date);
    expect(blocked).toEqual(blockedSlotStarts({ config, date, appointments: sameDay, blocks: [] }));
  }, 60_000);
});

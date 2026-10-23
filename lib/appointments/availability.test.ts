import { describe, it, expect } from 'vitest';
import {
  addDays,
  getAvailableSlots,
  isOpenNow,
  isSlotAvailable,
  openingHoursProblem,
  minutesToHHMM,
  nextOpenDates,
  nowInTimezone,
  overlapsExisting,
  parseTimeToMinutes,
  speakTime,
  weekdayOf,
} from './availability';
import { blockedSlotStarts } from './conflicts';

// Monday 2026-09-21, 08:00 UTC
const NOW = new Date('2026-09-21T08:00:00Z');
const config = { bookingStartHour: '09:00', bookingEndHour: '12:00', bookingSlotDuration: 30, bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday'], timezone: 'UTC' };

describe('time helpers', () => {
  it('parses common formats', () => {
    expect(parseTimeToMinutes('14:30')).toBe(870);
    expect(parseTimeToMinutes('2:30 PM')).toBe(870);
    expect(parseTimeToMinutes('12 AM')).toBe(0);
    expect(parseTimeToMinutes('12:15 PM')).toBe(735);
    expect(parseTimeToMinutes('10:00 - 10:30')).toBe(600);
    expect(parseTimeToMinutes('25:00')).toBeNull();
    expect(parseTimeToMinutes('nonsense')).toBeNull();
  });

  it('formats for speech and slots', () => {
    expect(minutesToHHMM(605)).toBe('10:05');
    expect(speakTime('14:30')).toBe('2:30 PM');
    expect(speakTime('09:00')).toBe('9 AM');
    expect(speakTime('00:00')).toBe('12 AM');
  });

  it('computes weekdays and date arithmetic', () => {
    expect(weekdayOf('2026-09-21')).toBe('Monday');
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
  });

  it('reads the current time in a timezone', () => {
    const t = nowInTimezone('Pacific/Auckland', new Date('2026-09-21T20:00:00Z'));
    expect(t.date).toBe('2026-09-22'); // NZ is already the next day
    expect(nowInTimezone('Not/AZone', NOW).date).toBe('2026-09-21'); // bad zone falls back to UTC
  });
});

describe('getAvailableSlots', () => {
  it('lists slots within opening hours', () => {
    const slots = getAvailableSlots({ config, date: '2026-09-22', appointments: [], now: NOW });
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']);
  });

  it('returns nothing on closed days and bad dates', () => {
    expect(getAvailableSlots({ config, date: '2026-09-26', appointments: [], now: NOW })).toEqual([]); // Saturday
    expect(getAvailableSlots({ config, date: '2026-13-40', appointments: [], now: NOW })).toEqual([]);
  });

  it('respects service duration at closing time', () => {
    const slots = getAvailableSlots({ config, date: '2026-09-22', durationMinutes: 60, appointments: [], now: NOW });
    expect(slots[slots.length - 1]).toBe('11:00'); // 11:00-12:00 fits, 11:30-12:30 does not
  });

  it('removes overlapping bookings using their duration', () => {
    const slots = getAvailableSlots({
      config,
      date: '2026-09-22',
      appointments: [{ date: '2026-09-22', timeSlot: '10:00', durationMinutes: 60, status: 'confirmed' }],
      now: NOW,
    });
    expect(slots).not.toContain('10:00');
    expect(slots).not.toContain('10:30');
    expect(slots).toContain('09:30');
    expect(slots).toContain('11:00');
  });

  it('ignores cancelled bookings and other dates', () => {
    const slots = getAvailableSlots({
      config,
      date: '2026-09-22',
      appointments: [
        { date: '2026-09-22', timeSlot: '10:00', durationMinutes: 30, status: 'cancelled' },
        { date: '2026-09-23', timeSlot: '09:00', durationMinutes: 30, status: 'confirmed' },
      ],
      now: NOW,
    });
    expect(slots).toContain('10:00');
    expect(slots).toContain('09:00');
  });

  it('understands 12-hour and range slot strings from other channels', () => {
    expect(overlapsExisting('2026-09-22', 600, 30, [{ date: '2026-09-22', timeSlot: '10:00 AM', durationMinutes: 30 }])).toBe(true);
    expect(overlapsExisting('2026-09-22', 630, 30, [{ date: '2026-09-22', timeSlot: '10:00 - 10:30' }])).toBe(false);
  });

  it('hides past slots today and applies lead time', () => {
    const now = new Date('2026-09-21T09:40:00Z'); // 09:40 Monday
    const slots = getAvailableSlots({ config, date: '2026-09-21', appointments: [], now });
    expect(slots[0]).toBe('10:30'); // 09:40 + 30 min notice = 10:10 -> next slot 10:30
    expect(getAvailableSlots({ config, date: '2026-09-20', appointments: [], now })).toEqual([]); // yesterday
  });

  it('uses the assistant timezone for "today"', () => {
    const cfg = { ...config, timezone: 'America/Los_Angeles' };
    // 08:00 UTC Monday is 01:00 Monday in Los Angeles, so the whole day is still open
    expect(getAvailableSlots({ config: cfg, date: '2026-09-21', appointments: [], now: NOW })[0]).toBe('09:00');
  });

  it('checks a specific slot', () => {
    const base = { config, date: '2026-09-22', appointments: [], now: NOW };
    expect(isSlotAvailable({ ...base, timeSlot: '9:30 AM' })).toBe(true);
    expect(isSlotAvailable({ ...base, timeSlot: '13:00' })).toBe(false);
  });
});

describe('nextOpenDates', () => {
  it('skips closed days and returns the next open dates', () => {
    const out = nextOpenDates({ config, appointments: [], now: new Date('2026-09-23T15:00:00Z'), count: 2 });
    // Wed 23rd is after closing at 15:00; Thu-Sun closed; next open is Mon 28th and Tue 29th
    expect(out.map((d) => d.date)).toEqual(['2026-09-28', '2026-09-29']);
  });
});


describe('isOpenNow', () => {
  it('follows opening days and hours in the business timezone', () => {
    const cfg = { ...config, bookingEndHour: '17:00' };
    expect(isOpenNow(cfg, new Date('2026-09-21T10:00:00Z'))).toBe(true); // Monday 10:00
    expect(isOpenNow(cfg, new Date('2026-09-21T18:00:00Z'))).toBe(false); // after close
    expect(isOpenNow(cfg, new Date('2026-09-26T10:00:00Z'))).toBe(false); // Saturday
    expect(isOpenNow({ ...cfg, timezone: 'Asia/Tokyo' }, new Date('2026-09-21T10:00:00Z'))).toBe(false); // 19:00 in Tokyo
  });
});

describe('openingHoursProblem', () => {
  const owner = { bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], bookingStartHour: '09:00', bookingEndHour: '18:00' };

  it('accepts a time on an open day inside the hours, in any of the formats the booking forms send', () => {
    expect(openingHoursProblem(owner, '2026-11-09', '10:00 AM')).toBeNull(); // Monday
    expect(openingHoursProblem(owner, '2026-11-09', '10:00 AM - 10:30 AM')).toBeNull();
    expect(openingHoursProblem(owner, '2026-11-09', '17:40')).toBeNull();
  });

  it('refuses a closed day and times before opening or from closing time on', () => {
    expect(openingHoursProblem(owner, '2026-11-08', '10:00 AM')).toMatch(/not open on Sundays/);
    expect(openingHoursProblem(owner, '2026-11-09', '03:00 AM')).toMatch(/opening hours/);
    expect(openingHoursProblem(owner, '2026-11-09', '06:00 PM')).toMatch(/opening hours/);
  });

  it('enforces only what the owner configured, and lets unreadable times through', () => {
    expect(openingHoursProblem({}, '2026-11-08', '03:00 AM')).toBeNull();
    expect(openingHoursProblem({ bookingStartHour: '10:00' }, '2026-11-08', '11:00')).toBeNull();
    expect(openingHoursProblem(owner, '2026-11-09', 'sometime after lunch')).toBeNull();
  });
});

describe('external blocks', () => {
  const blockConfig = { ...config, timezone: 'Europe/Stockholm' };
  // Winter, Stockholm is UTC+1: 10:00-11:00 local is 09:00Z-10:00Z.
  const blocks = [{ startAt: new Date('2026-12-08T09:00:00Z'), endAt: new Date('2026-12-08T10:00:00Z') }];
  const NOW_WINTER = new Date('2026-12-01T08:00:00Z');

  it('getAvailableSlots removes exactly the slots a block overlaps', () => {
    const slots = getAvailableSlots({ config: blockConfig, date: '2026-12-08', appointments: [], blocks, now: NOW_WINTER });
    expect(slots).toEqual(['09:00', '09:30', '11:00', '11:30']);
  });

  it('an empty or absent blocks list changes nothing', () => {
    const base = getAvailableSlots({ config: blockConfig, date: '2026-12-08', appointments: [], now: NOW_WINTER });
    expect(getAvailableSlots({ config: blockConfig, date: '2026-12-08', appointments: [], blocks: [], now: NOW_WINTER })).toEqual(base);
  });

  it('respects the service duration against a block', () => {
    const slots = getAvailableSlots({ config: blockConfig, date: '2026-12-08', durationMinutes: 60, appointments: [], blocks, now: NOW_WINTER });
    expect(slots).toEqual(['09:00', '11:00']); // 09:00-10:00 local ends as the block starts; 09:30 and 10:30 overlap it
  });

  it('blockedSlotStarts lists grid starts hit by a block or a booking', () => {
    const appointments = [{ date: '2026-12-08', timeSlot: '11:30', durationMinutes: 30 }];
    expect(blockedSlotStarts({ config: blockConfig, date: '2026-12-08', appointments, blocks })).toEqual(['10:00', '10:30', '11:30']);
  });

  it('blockedSlotStarts is empty with nothing in the way and for bad dates', () => {
    expect(blockedSlotStarts({ config: blockConfig, date: '2026-12-08', appointments: [], blocks: [] })).toEqual([]);
    expect(blockedSlotStarts({ config: blockConfig, date: 'nope', appointments: [], blocks })).toEqual([]);
  });
});

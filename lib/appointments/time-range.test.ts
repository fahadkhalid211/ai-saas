import { describe, expect, it } from 'vitest';
import { knownTimezone, slotRange, slotRangeFields, wallTimeToUtc } from './time-range';

const HOUR = 60 * 60 * 1000;

describe('slotRange', () => {
  it('converts summer wall time in Stockholm to UTC', () => {
    const r = slotRange('2026-10-23', '10:00', 60, 'Europe/Stockholm');
    expect(r).not.toBeNull();
    expect(r!.start.toISOString()).toBe('2026-10-23T08:00:00.000Z');
    expect(r!.end.getTime() - r!.start.getTime()).toBe(HOUR);
  });

  it('converts winter wall time in Stockholm to UTC', () => {
    const r = slotRange('2026-12-10', '10:00', 60, 'Europe/Stockholm');
    expect(r!.start.toISOString()).toBe('2026-12-10T09:00:00.000Z');
  });

  it('lets a range string end win over the duration argument', () => {
    const r = slotRange('2026-10-23', '10:00 AM - 10:30 AM', 120, 'Europe/Stockholm');
    expect(r!.end.getTime() - r!.start.getTime()).toBe(30 * 60 * 1000);
  });

  it('defaults to 30 minutes when no duration is given', () => {
    const r = slotRange('2026-10-23', '09:00', undefined, 'UTC');
    expect(r!.end.getTime() - r!.start.getTime()).toBe(30 * 60 * 1000);
  });

  it('resolves a time on the spring-forward day', () => {
    const r = slotRange('2026-03-29', '03:30', 30, 'Europe/Stockholm');
    expect(r!.start.toISOString()).toBe('2026-03-29T01:30:00.000Z');
  });

  it('falls back to UTC for an unknown or missing timezone', () => {
    expect(slotRange('2026-10-23', '10:00', 30, 'Not/AZone')!.start.toISOString()).toBe('2026-10-23T10:00:00.000Z');
    expect(slotRange('2026-10-23', '10:00', 30, undefined)!.start.toISOString()).toBe('2026-10-23T10:00:00.000Z');
  });

  it('returns null when the time or date cannot be read', () => {
    expect(slotRange('2026-10-23', 'Morning', 30, 'UTC')).toBeNull();
    expect(slotRange('2026-13-40', '10:00', 30, 'UTC')).toBeNull();
  });

  it('returns null instead of throwing for a missing or non-text date or time (one malformed row must not break a feed or a check)', () => {
    for (const bad of [null, undefined, 42, {}, ['10:00']]) {
      expect(slotRange('2026-10-23', bad as unknown as string, 30, 'UTC')).toBeNull();
      expect(slotRange(bad as unknown as string, '10:00', 30, 'UTC')).toBeNull();
    }
  });
});

describe('slotRangeFields', () => {
  it('returns ISO strings 30 minutes apart by default', () => {
    const f = slotRangeFields({}, { date: '2026-10-23', timeSlot: '09:00' });
    expect(f.slotStart).toBe('2026-10-23T09:00:00.000Z');
    expect(f.slotEnd).toBe('2026-10-23T09:30:00.000Z');
  });

  it('uses the assistant timezone and the input duration', () => {
    const f = slotRangeFields({ timezone: 'Europe/Stockholm' }, { date: '2026-10-23', timeSlot: '10:00', durationMinutes: 60 });
    expect(f.slotStart).toBe('2026-10-23T08:00:00.000Z');
    expect(f.slotEnd).toBe('2026-10-23T09:00:00.000Z');
  });

  it('returns an empty object when the range is unreadable', () => {
    expect(slotRangeFields({}, { date: '2026-10-23', timeSlot: 'Morning' })).toEqual({});
  });
});

describe('wallTimeToUtc and the bounded zone caches', () => {
  it('converts a wall time to a UTC instant', () => {
    expect(new Date(wallTimeToUtc('2026-03-29', 4 * 60, 'Europe/Stockholm')).toISOString()).toBe('2026-03-29T02:00:00.000Z');
    expect(new Date(wallTimeToUtc('2026-03-28', 12 * 60, 'Europe/Stockholm')).toISOString()).toBe('2026-03-28T11:00:00.000Z');
  });

  it('keeps giving correct answers past the 1000-entry cache cap', () => {
    // Offset zone names are valid to Intl and cheap to enumerate, so they push both caches over the cap.
    let checked = 0;
    for (let h = -23; h <= 23 && checked < 1100; h++) {
      for (let m = 0; m < 60 && checked < 1100; m++) {
        const name = `${h < 0 ? '-' : '+'}${String(Math.abs(h)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        expect(knownTimezone(name)).toBe(true);
        const sign = h < 0 ? -1 : 1;
        const offsetMs = sign * (Math.abs(h) * 60 + m) * 60_000;
        expect(wallTimeToUtc('2026-06-01', 12 * 60, name)).toBe(Date.UTC(2026, 5, 1, 12) - offsetMs);
        checked++;
      }
    }
    expect(checked).toBe(1100);
    expect(knownTimezone('Not/AZone')).toBe(false);
    expect(knownTimezone('Europe/Stockholm')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { slotRange, slotRangeFields } from './time-range';

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

import { describe, it, expect } from 'vitest';
import { zonedTimeToUtcMs } from './instant';

const iso = (ms: number) => new Date(ms).toISOString();

describe('zonedTimeToUtcMs', () => {
  it('reads the time as UTC when no zone is given', () => {
    expect(iso(zonedTimeToUtcMs('2026-09-15', '14:30'))).toBe('2026-09-15T14:30:00.000Z');
  });

  it('uses the business\'s zone, not the server\'s', () => {
    // New York is UTC-4 in September (daylight time) and UTC-5 in January
    expect(iso(zonedTimeToUtcMs('2026-09-15', '14:30', 'America/New_York'))).toBe('2026-09-15T18:30:00.000Z');
    expect(iso(zonedTimeToUtcMs('2026-01-15', '14:30', 'America/New_York'))).toBe('2026-01-15T19:30:00.000Z');
    // Stockholm is UTC+2 in summer
    expect(iso(zonedTimeToUtcMs('2026-07-01', '09:00', 'Europe/Stockholm'))).toBe('2026-07-01T07:00:00.000Z');
    // a zone with a half-hour offset
    expect(iso(zonedTimeToUtcMs('2026-09-15', '10:00', 'Asia/Kolkata'))).toBe('2026-09-15T04:30:00.000Z');
  });

  it('is right on the day the clocks change', () => {
    // US spring forward 2026-03-08 at 02:00; an appointment at 12:00 that day is already on daylight time (UTC-4)
    expect(iso(zonedTimeToUtcMs('2026-03-08', '12:00', 'America/New_York'))).toBe('2026-03-08T16:00:00.000Z');
    // the morning before the change is still on standard time (UTC-5)
    expect(iso(zonedTimeToUtcMs('2026-03-08', '01:00', 'America/New_York'))).toBe('2026-03-08T06:00:00.000Z');
  });

  it('falls back to UTC for a zone it does not know', () => {
    expect(iso(zonedTimeToUtcMs('2026-09-15', '14:30', 'Not/AZone'))).toBe('2026-09-15T14:30:00.000Z');
  });
});

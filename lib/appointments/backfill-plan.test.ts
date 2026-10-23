import { describe, expect, it } from 'vitest';
import { assistantTimezones, parseDbHost, planBackfill, type BackfillRow } from './backfill-plan';

const row = (over: Partial<BackfillRow>): BackfillRow => ({
  id: 'r1',
  assistant_id: 'a1',
  date: '2026-10-23',
  time_slot: '10:00',
  duration_minutes: 60,
  status: 'confirmed',
  ...over,
});

describe('parseDbHost', () => {
  it('returns only the host, never the password', () => {
    expect(parseDbHost('postgresql://user:secret@db.example.com:5432/app?sslmode=require')).toBe('db.example.com');
  });
  it('returns null for an unparseable or missing url', () => {
    expect(parseDbHost('not a url')).toBeNull();
    expect(parseDbHost('')).toBeNull();
    expect(parseDbHost(undefined)).toBeNull();
  });
});

describe('assistantTimezones', () => {
  it('maps assistant ids to timezones, undefined when none', () => {
    const m = assistantTimezones([{ id: 'a1', timezone: 'Europe/Stockholm' }, { id: 'a2' }, null, { timezone: 'UTC' }]);
    expect(m).not.toBeNull();
    expect(m!.get('a1')).toBe('Europe/Stockholm');
    expect(m!.has('a2')).toBe(true);
    expect(m!.get('a2')).toBeUndefined();
    expect(m!.size).toBe(2);
  });
  it('returns null when the value is not an array', () => {
    expect(assistantTimezones(null)).toBeNull();
    expect(assistantTimezones({})).toBeNull();
  });
});

describe('planBackfill', () => {
  const tz = new Map<string, string | undefined>([['a1', 'Europe/Stockholm']]);

  it('computes the UTC range in the assistant timezone', () => {
    const plan = planBackfill([row({})], tz);
    expect(plan.planned).toHaveLength(1);
    expect(plan.planned[0].slotStart).toBe('2026-10-23T08:00:00.000Z');
    expect(plan.planned[0].slotEnd).toBe('2026-10-23T09:00:00.000Z');
    expect(plan.planned[0].timezone).toBe('Europe/Stockholm');
  });

  it('lists unreadable times and leaves them out of the plan', () => {
    const plan = planBackfill([row({ id: 'bad', time_slot: 'sometime', date: 'soon' })], tz);
    expect(plan.planned).toEqual([]);
    expect(plan.unreadable.map((r) => r.id)).toEqual(['bad']);
  });

  it('lists rows whose assistant is unknown', () => {
    const plan = planBackfill([row({ id: 'x', assistant_id: 'gone' })], tz);
    expect(plan.planned).toEqual([]);
    expect(plan.unknownAssistant.map((r) => r.id)).toEqual(['x']);
  });
});

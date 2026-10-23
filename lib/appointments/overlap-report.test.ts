import { describe, expect, it } from 'vitest';
import { findOverlaps } from './overlap-report';

const at = (hhmm: string) => new Date(`2026-10-23T${hhmm}:00.000Z`);
const row = (id: string, assistantId: string, start: string, end: string) => ({
  id,
  assistantId,
  slotStart: at(start),
  slotEnd: at(end),
});

describe('findOverlaps', () => {
  it('does not report adjacent ranges (half-open)', () => {
    const rows = [row('a', 'x', '10:00', '10:30'), row('b', 'x', '10:30', '11:00')];
    expect(findOverlaps(rows)).toEqual([]);
  });

  it('reports overlapping ranges for the same assistant', () => {
    const rows = [row('a', 'x', '10:00', '10:30'), row('b', 'x', '10:15', '10:45')];
    expect(findOverlaps(rows)).toEqual([['a', 'b']]);
  });

  it('reports a range fully contained in another', () => {
    const rows = [row('a', 'x', '10:00', '12:00'), row('b', 'x', '10:30', '11:00')];
    expect(findOverlaps(rows)).toEqual([['a', 'b']]);
  });

  it('does not report overlapping ranges of different assistants', () => {
    const rows = [row('a', 'x', '10:00', '10:30'), row('b', 'y', '10:00', '10:30')];
    expect(findOverlaps(rows)).toEqual([]);
  });

  it('reports each pair once, whatever the input order', () => {
    const rows = [row('b', 'x', '10:15', '10:45'), row('a', 'x', '10:00', '10:30')];
    const pairs = findOverlaps(rows);
    expect(pairs).toHaveLength(1);
    expect([...pairs[0]].sort()).toEqual(['a', 'b']);
  });

  it('reports every overlapping pair among three bookings', () => {
    const rows = [row('a', 'x', '10:00', '11:00'), row('b', 'x', '10:15', '10:45'), row('c', 'x', '10:30', '11:30')];
    expect(findOverlaps(rows)).toHaveLength(3);
  });

  it('returns nothing for an empty list', () => {
    expect(findOverlaps([])).toEqual([]);
  });
});

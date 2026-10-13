import { describe, it, expect } from 'vitest';
import { newestFirst, newestLast } from './bounds';

describe('state list bounds', () => {
  const stored = Array.from({ length: 80 }, (_, i) => `entry-${80 - i}`); // newest first, as addAuditLog stores it

  it('keeps the newest entries of a newest-first list (audit log, notifications)', () => {
    const kept = newestFirst<string>(stored, 50);
    expect(kept).toHaveLength(50);
    expect(kept[0]).toBe('entry-80');
    expect(kept[49]).toBe('entry-31');
  });

  it('would have kept the oldest entries with the previous slice(-50)', () => {
    expect(stored.slice(-50)[0]).toBe('entry-50'); // the bug: entry-80 .. entry-51 were dropped
  });

  it('keeps the newest entries of an append-ordered list (messages)', () => {
    const appended = Array.from({ length: 150 }, (_, i) => i);
    const kept = newestLast<number>(appended, 100);
    expect(kept[0]).toBe(50);
    expect(kept[99]).toBe(149);
  });

  it('treats a missing list as empty', () => {
    expect(newestFirst(undefined, 50)).toEqual([]);
    expect(newestLast(null, 50)).toEqual([]);
  });
});

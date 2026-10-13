import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { nextPollDelayMs, isHandoffActive, POLL_HANDOFF_MS, POLL_ACTIVE_MS, POLL_QUIET_MS, POLL_IDLE_MS } from './poll-schedule';

describe('nextPollDelayMs', () => {
  it('does not ask while the page is hidden, whatever else is true', () => {
    expect(nextPollDelayMs({ hidden: true, handoffActive: true, msSinceActivity: 0 })).toBeNull();
    expect(nextPollDelayMs({ hidden: true, handoffActive: false, msSinceActivity: 0 })).toBeNull();
  });

  it('asks quickly while a person is involved, even when the visitor is quiet', () => {
    expect(nextPollDelayMs({ hidden: false, handoffActive: true, msSinceActivity: 0 })).toBe(POLL_HANDOFF_MS);
    expect(nextPollDelayMs({ hidden: false, handoffActive: true, msSinceActivity: 3_600_000 })).toBe(POLL_HANDOFF_MS);
  });

  it('slows down as the visitor goes quiet', () => {
    const at = (ms: number) => nextPollDelayMs({ hidden: false, handoffActive: false, msSinceActivity: ms });
    expect(at(0)).toBe(POLL_ACTIVE_MS);
    expect(at(59_000)).toBe(POLL_ACTIVE_MS);
    expect(at(61_000)).toBe(POLL_QUIET_MS);
    expect(at(9 * 60_000)).toBe(POLL_QUIET_MS);
    expect(at(11 * 60_000)).toBe(POLL_IDLE_MS);
  });

  it('makes far fewer requests than the fixed 2.5 second poll it replaces', () => {
    // one forgotten, visible tab for an hour after a single message
    let t = 0;
    let requests = 0;
    while (t < 3_600_000) {
      const d = nextPollDelayMs({ hidden: false, handoffActive: false, msSinceActivity: t })!;
      requests++;
      t += d;
    }
    expect(requests).toBeLessThan(100); // the old behaviour: 1,440 in the same hour (about 90 now)
  });
});

describe('isHandoffActive', () => {
  it('is true only when a person is asked for or writing', () => {
    expect(isHandoffActive({ status: 'bot' })).toBe(false);
    expect(isHandoffActive({ status: 'resolved' })).toBe(false);
    expect(isHandoffActive({ status: 'waiting_for_agent' })).toBe(true);
    expect(isHandoffActive({ status: 'live_agent' })).toBe(true);
    expect(isHandoffActive({ isLiveTakeover: true })).toBe(true);
    expect(isHandoffActive(null)).toBe(false);
  });
});

describe('the copy in public/widget.js', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'public/widget.js'), 'utf8');
  const match = source.match(/function nextPollDelayMs\(hidden, handoffActive, msSinceActivity\) \{[\s\S]*?\n    \}\n/);

  it('exists', () => {
    expect(match).not.toBeNull();
  });

  it('gives the same answer as the TypeScript version for every case', () => {
    const copy = new Function(`${match![0]}; return nextPollDelayMs;`)() as (h: boolean, a: boolean, m: number) => number | null;
    for (const hidden of [true, false]) {
      for (const handoffActive of [true, false]) {
        for (const ms of [0, 1_000, 59_999, 60_000, 60_001, 300_000, 599_999, 600_000, 600_001, 7_200_000]) {
          expect(copy(hidden, handoffActive, ms), `${hidden}/${handoffActive}/${ms}`).toBe(nextPollDelayMs({ hidden, handoffActive, msSinceActivity: ms }));
        }
      }
    }
  });
});

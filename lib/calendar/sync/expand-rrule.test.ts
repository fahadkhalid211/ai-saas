import { writeFileSync } from 'node:fs';
import ICAL from 'ical.js';
import { describe, expect, it } from 'vitest';
import { daysFromCivil, expandOccurrences, RecurrenceLimitError, type LocalDateTime, type RuleParts } from './expand-rrule';
import { recurrenceParts } from './recurrence-rule';

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
const fmt = (t: { y: number; mo: number; d: number; h: number; mi: number; s: number }) =>
  `${pad(t.y, 4)}-${pad(t.mo)}-${pad(t.d)}T${pad(t.h)}:${pad(t.mi)}:${pad(t.s)}`;
const at = (y: number, mo: number, d: number, h = 9, mi = 0, s = 0): LocalDateTime => ({ y, mo, d, h, mi, s });

/** Rule parts from an RRULE value, through the same ical.js parse + allowlist the feed parser uses. */
function parts(rrule: string, start: LocalDateTime): RuleParts {
  return recurrenceParts(ICAL.Recur.fromString(rrule), start);
}

function list(rrule: string, start: LocalDateTime, opts: { take?: number; fromDay?: number; toDay?: number } = {}): string[] {
  const out: string[] = [];
  const take = opts.take ?? 50;
  for (const o of expandOccurrences(start, parts(rrule, start), { maxPeriods: 1_000_000, fromDay: opts.fromDay, toDay: opts.toDay })) {
    out.push(fmt(o));
    if (out.length >= take) break;
  }
  return out;
}
const days = (xs: string[]) => xs.map((x) => x.slice(0, 10));

describe('expandOccurrences: RFC 5545 semantics', () => {
  it('DAILY with INTERVAL and COUNT, DTSTART first', () => {
    expect(list('FREQ=DAILY;INTERVAL=3;COUNT=4', at(2026, 2, 26, 7, 30))).toEqual([
      '2026-02-26T07:30:00', '2026-03-01T07:30:00', '2026-03-04T07:30:00', '2026-03-07T07:30:00',
    ]);
  });

  it('DTSTART that does not match the rule is still the first instance and counts toward COUNT', () => {
    // 2026-03-02 is a Monday.
    expect(days(list('FREQ=WEEKLY;BYDAY=TU;COUNT=3', at(2026, 3, 2)))).toEqual(['2026-03-02', '2026-03-03', '2026-03-10']);
    expect(days(list('FREQ=MONTHLY;BYMONTHDAY=15;COUNT=2', at(2026, 3, 2)))).toEqual(['2026-03-02', '2026-03-15']);
  });

  it('WEEKLY INTERVAL=2 depends on WKST (RFC 5545 examples)', () => {
    expect(days(list('FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO', at(1997, 8, 5)))).toEqual(['1997-08-05', '1997-08-10', '1997-08-19', '1997-08-24']);
    expect(days(list('FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU', at(1997, 8, 5)))).toEqual(['1997-08-05', '1997-08-17', '1997-08-19', '1997-08-31']);
  });

  it('DAILY on weekdays only', () => {
    // 2026-03-06 is a Friday.
    expect(days(list('FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR', at(2026, 3, 6), { take: 4 }))).toEqual(['2026-03-06', '2026-03-09', '2026-03-10', '2026-03-11']);
  });

  it('MONTHLY on the 31st skips months without one; INTERVAL counts calendar months', () => {
    expect(days(list('FREQ=MONTHLY', at(2026, 1, 31), { take: 4 }))).toEqual(['2026-01-31', '2026-03-31', '2026-05-31', '2026-07-31']);
    // Every second month from January: Jan, Mar, May, Jul, Sep (30 days: skipped), Nov (30: skipped), Jan.
    expect(days(list('FREQ=MONTHLY;INTERVAL=2', at(2026, 1, 31), { take: 5 }))).toEqual(['2026-01-31', '2026-03-31', '2026-05-31', '2026-07-31', '2027-01-31']);
  });

  it('MONTHLY BYMONTHDAY negative counts from the month end', () => {
    expect(days(list('FREQ=MONTHLY;BYMONTHDAY=-1', at(2024, 1, 31), { take: 3 }))).toEqual(['2024-01-31', '2024-02-29', '2024-03-31']);
    expect(days(list('FREQ=MONTHLY;BYMONTHDAY=1,-1;COUNT=4', at(2026, 2, 1)))).toEqual(['2026-02-01', '2026-02-28', '2026-03-01', '2026-03-31']);
  });

  it('MONTHLY ordinal BYDAY: the 5th Monday only in months that have one; -1FR is the last Friday', () => {
    expect(days(list('FREQ=MONTHLY;BYDAY=5MO', at(2026, 3, 30), { take: 3 }))).toEqual(['2026-03-30', '2026-06-29', '2026-08-31']);
    expect(days(list('FREQ=MONTHLY;BYDAY=-1FR', at(2026, 1, 30), { take: 3 }))).toEqual(['2026-01-30', '2026-02-27', '2026-03-27']);
    expect(days(list('FREQ=MONTHLY;BYDAY=2TU', at(2026, 3, 10), { take: 3 }))).toEqual(['2026-03-10', '2026-04-14', '2026-05-12']);
  });

  it('MONTHLY BYSETPOS picks from the sorted candidates of each month', () => {
    expect(days(list('FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1', at(2026, 1, 30), { take: 4 }))).toEqual(['2026-01-30', '2026-02-27', '2026-03-31', '2026-04-30']);
    expect(days(list('FREQ=MONTHLY;BYDAY=SA,SU;BYSETPOS=1,-1', at(2026, 3, 1), { take: 4 }))).toEqual(['2026-03-01', '2026-03-29', '2026-04-04', '2026-04-26']);
  });

  it('YEARLY with no BY parts keeps Feb 29 to leap years', () => {
    expect(days(list('FREQ=YEARLY', at(2024, 2, 29), { take: 3 }))).toEqual(['2024-02-29', '2028-02-29', '2032-02-29']);
  });

  it('YEARLY by month and day, and by month and ordinal weekday', () => {
    expect(days(list('FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=29', at(2024, 2, 29), { take: 2 }))).toEqual(['2024-02-29', '2028-02-29']);
    expect(days(list('FREQ=YEARLY;BYMONTH=11;BYDAY=4TH', at(2025, 11, 27), { take: 3 }))).toEqual(['2025-11-27', '2026-11-26', '2027-11-25']);
    expect(days(list('FREQ=YEARLY;BYMONTH=1,7;BYMONTHDAY=1,-1', at(2026, 1, 1), { take: 5 }))).toEqual(['2026-01-01', '2026-01-31', '2026-07-01', '2026-07-31', '2027-01-01']);
  });

  it('never duplicates DTSTART when it matches the rule', () => {
    expect(list('FREQ=WEEKLY;BYDAY=MO,MO;COUNT=2', at(2026, 3, 2))).toEqual(['2026-03-02T09:00:00', '2026-03-09T09:00:00']);
  });
});

describe('expandOccurrences: bounded cost', () => {
  it('jumps arithmetically to fromDay when there is no COUNT (a series from the year 1300)', () => {
    const start = at(1300, 1, 5, 10);
    const stats = { periods: 0 };
    const fromDay = daysFromCivil(2026, 10, 1);
    const out: string[] = [];
    for (const o of expandOccurrences(start, parts('FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1', start), { fromDay, toDay: daysFromCivil(2026, 12, 31), maxPeriods: 100, stats })) {
      out.push(fmt(o));
    }
    expect(out).toEqual(['2026-10-30T10:00:00', '2026-11-30T10:00:00', '2026-12-31T10:00:00']);
    expect(stats.periods).toBeLessThanOrEqual(4);
  });

  it('stops by itself after the last period that starts on or before toDay', () => {
    const start = at(2026, 1, 1);
    const out = list('FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=30', start, { toDay: daysFromCivil(2040, 1, 1) });
    expect(out).toEqual(['2026-01-01T09:00:00']); // Feb 30 never exists: only DTSTART, and the generator returns
  });

  it('throws RecurrenceLimitError past maxPeriods', () => {
    const start = at(1950, 1, 1);
    const run = () => {
      for (const o of expandOccurrences(start, parts('FREQ=DAILY;COUNT=9999999', start), { maxPeriods: 1000 })) void o;
    };
    expect(run).toThrow(RecurrenceLimitError);
  });

  it('with COUNT it counts from DTSTART, cheaply', () => {
    const start = at(1300, 1, 5, 10);
    const t0 = performance.now();
    const out = list('FREQ=MONTHLY;BYDAY=2TU;COUNT=9000', start, { take: 9000, toDay: daysFromCivil(2100, 1, 1) });
    expect(performance.now() - t0).toBeLessThan(300);
    expect(out[0]).toBe('1300-01-05T10:00:00');
    expect(out).toHaveLength(9000); // one second Tuesday a month: COUNT ends in the 2040s, before toDay
    expect(out[8999] < '2051').toBe(true);
  });
});


// ---------------------------------------------------------------------------------------------------------------------
// Differential test. Random allowlisted rules are expanded three ways: by the expander, by ical.js's RecurIterator (used
// here only, as the oracle) and by a slow day-by-day scan written independently below. The expander must equal ical.js
// wherever ical.js follows RFC 5545, and the scan everywhere; the scan must also equal ical.js wherever ical.js is used,
// which checks the scan itself. The committed run is seeded and kept to 1,000 cases (a few seconds, every FREQ well covered);
// RRULE_DIFF_SEED, RRULE_DIFF_CASES and RRULE_DIFF_REPORT (a file for the summary) run a larger one-off, as recorded in the
// Task 9 report.
//
// ical.js defects found by this test (each checked against RFC 5545 3.3.10 and reproduced on its own), whose cases are
// compared with the scan only:
//  A. YEARLY with a negative BYMONTHDAY: ical.js skips DTSTART's own year and then steps INTERVAL from the wrong year
//     (INTERVAL=2;BYMONTH=1;BYMONTHDAY=-26 from 6 Jan 2025 gives 2026, 2028 instead of 2025, 2027), and with several
//     months it counts back from the end of the wrong month (BYMONTH=4,10;BYMONTHDAY=-20 gives Apr 12, not Apr 11). RFC:
//     "-10 represents the tenth to the last day of the month" (of each month), and periods start at DTSTART's year.
//  B. MONTHLY BYDAY + BYSETPOS whose DTSTART does not match: ical.js's first instance is the month's first BYDAY day,
//     with BYSETPOS ignored (BYDAY=FR;BYSETPOS=2,4 from Tue 2 May 2017 gives Fri 5 May first). RFC: BYSETPOS limits the
//     set of every interval.
//  C. MONTHLY BYDAY + a negative BYSETPOS: when a month's matching day is the 1st, ical.js only accepts it for
//     BYSETPOS=1, never for its negative position (BYDAY=TU;BYSETPOS=-5 skips Tue 1 Oct 2024, the -5th Tuesday).
//  D. ical.js throws "Same occurrence found twice" when two BYDAY entries pick the same day (FR and 3FR), and
//     "Recurrence rule has no valid occurrences" when the first few periods hold no match. RFC: the BY parts select a
//     set (a day picked twice is one occurrence); a rule with sparse matches is still valid.
//  E. YEARLY BYDAY with COUNT where two entries name the same weekday (TU,1TU): a day picked twice is emitted once but
//     counted twice, so the series ends early (COUNT=4 gives 3). RFC: COUNT counts occurrences of the set.
//  F. YEARLY on a day the month lacks (BYMONTHDAY Nov 31; BYMONTHDAY Feb 29 from a non-leap DTSTART year; a plain
//     FREQ=YEARLY from Feb 29): ical.js rolls it over to the next month (Dec 1, Mar 1). RFC: "Recurrence rules may
//     generate recurrence instances with an invalid date (e.g., February 30) ... Such recurrence instances MUST be ignored".
// ---------------------------------------------------------------------------------------------------------------------

const LAST_YEAR = 2035;
const TAKE = 40;
const WD = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const leap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const dim = (y: number, m: number) => [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
// The scan uses Date for day numbers and weekdays, so it shares no date arithmetic with the expander.
const dayNo = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) / 86_400_000;
const dowOf = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

interface Case {
  freq: string;
  rule: string;
  start: LocalDateTime;
  count?: number;
}

function randomCase(rnd: () => number): Case {
  const int = (n: number) => Math.floor(rnd() * n);
  const pick = <T,>(xs: T[]) => xs[int(xs.length)];
  const subset = <T,>(xs: T[], min: number, max: number) => {
    const n = min + int(max - min + 1);
    const pool = [...xs];
    const out: T[] = [];
    while (out.length < n && pool.length) out.push(pool.splice(int(pool.length), 1)[0]);
    return out;
  };
  const signed = (max: number) => (rnd() < 0.5 ? 1 : -1) * (1 + int(max));

  const freq = pick(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
  const y = 2015 + int(12);
  const mo = 1 + int(12);
  const d = 1 + int(dim(y, mo));
  // Times of day include 00:00-03:59 (where DST changes happen) often; the expander never looks at the zone.
  const start = at(y, mo, d, rnd() < 0.4 ? int(4) : int(24), pick([0, 0, 15, 30, 45]), rnd() < 0.1 ? 30 : 0);
  const smallMax: Record<string, number> = { DAILY: 10, WEEKLY: 5, MONTHLY: 6, YEARLY: 4 };
  const bigMax: Record<string, number> = { DAILY: 365, WEEKLY: 104, MONTHLY: 60, YEARLY: 20 };
  const interval = rnd() < 0.5 ? 1 : 1 + int(rnd() < 0.9 ? smallMax[freq] : bigMax[freq] - 1);

  const p: string[] = [`FREQ=${freq}`];
  if (interval > 1 || rnd() < 0.2) p.push(`INTERVAL=${interval}`);
  const count = rnd() < 0.5 ? 1 + int(80) : undefined;
  if (count) p.push(`COUNT=${count}`);
  if (rnd() < 0.35) p.push(`WKST=${pick(WD)}`);

  const byday = (plain: boolean) => {
    const xs = Array.from({ length: 1 + int(rnd() < 0.8 ? 3 : 7) }, () => (rnd() < 0.5 ? pick(WD) : `${signed(5)}${pick(WD)}`));
    if (plain && !xs.some((x) => WD.includes(x))) xs.push(pick(WD));
    return xs;
  };

  if (freq === 'DAILY' && rnd() < 0.5) {
    const ds = subset(WD, 1, 7);
    const own = WD[dowOf(y, mo, d)];
    if (interval % 7 === 0 && !ds.includes(own)) ds.push(own); // the allowlist refuses the rule otherwise
    p.push(`BYDAY=${ds.join(',')}`);
  } else if (freq === 'WEEKLY' && rnd() < 0.6) {
    p.push(`BYDAY=${subset(WD, 1, 7).join(',')}`);
  } else if (freq === 'MONTHLY') {
    const r = rnd();
    if (r < 0.3) {
      p.push(`BYMONTHDAY=${Array.from({ length: 1 + int(3) }, () => signed(rnd() < 0.8 ? 28 : 31)).join(',')}`);
    } else if (r < 0.55) {
      p.push(`BYDAY=${byday(false).join(',')}`);
    } else if (r < 0.8) {
      // BYSETPOS mostly over lists holding a plain weekday (several candidates a month), as real feeds use it.
      p.push(`BYDAY=${byday(rnd() < 0.85).join(',')}`);
      p.push(`BYSETPOS=${Array.from({ length: 1 + int(3) }, () => signed(5)).join(',')}`);
    }
  } else if (freq === 'YEARLY' && rnd() < 0.7) {
    const months = subset([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 1, 3);
    p.push(`BYMONTH=${months.join(',')}`);
    if (rnd() < 0.5) {
      // At least one value that exists in one of the months in some year, so the rule can match.
      const longest = Math.max(...months.map((m) => (m === 2 ? 29 : dim(2025, m))));
      const values = Array.from({ length: 1 + int(3) }, () => signed(rnd() < 0.85 ? 28 : 31));
      if (!values.some((v) => Math.abs(v) <= longest)) values.push(signed(28));
      p.push(`BYMONTHDAY=${values.join(',')}`);
    } else {
      p.push(`BYDAY=${byday(false).join(',')}`);
    }
  }
  return { freq, rule: p.join(';'), start, count };
}

/** The independent day-by-day scan: DTSTART, then every later day up to LAST_YEAR that is in an INTERVAL period and matches. */
function scan(c: Case): { list: string[]; startMatches: boolean } {
  const r = parts(c.rule, c.start);
  const { y: sy, mo: sm, d: sd } = c.start;
  const sDay = dayNo(sy, sm, sd);
  const sDow = dowOf(sy, sm, sd);
  const week0 = sDay - ((sDow - r.wkst + 7) % 7);
  const months = new Map<number, Set<number>>();

  const monthDays = (y: number, m: number): Set<number> => {
    const key = y * 12 + m;
    let set = months.get(key);
    if (set) return set;
    const n = dim(y, m);
    const first = dowOf(y, m, 1);
    const list: number[] = [];
    for (let dd = 1; dd <= n; dd++) {
      const wd = (first + dd - 1) % 7;
      const ok = r.bymonthday
        ? r.bymonthday.some((v) => (v > 0 ? v === dd : n + 1 + v === dd))
        : r.byday
          ? r.byday.some((b) => b.day === wd && (b.ord === 0 || (b.ord > 0 ? Math.ceil(dd / 7) === b.ord : -Math.ceil((n - dd + 1) / 7) === b.ord)))
          : dd === sd;
      if (ok) list.push(dd);
    }
    set = new Set(r.freq === 'MONTHLY' && r.bysetpos ? r.bysetpos.map((p) => list[p > 0 ? p - 1 : list.length + p]).filter((x) => x !== undefined) : list);
    months.set(key, set);
    return set;
  };
  const matches = (day: number, y: number, m: number, d: number, wd: number) => {
    switch (r.freq) {
      case 'DAILY':
        return (day - sDay) % r.interval === 0 && (!r.byday || r.byday.some((b) => b.day === wd));
      case 'WEEKLY':
        return Math.floor((day - week0) / 7) % r.interval === 0 && (r.byday ? r.byday.some((b) => b.day === wd) : wd === sDow);
      case 'MONTHLY':
        return (y * 12 + m - (sy * 12 + sm)) % r.interval === 0 && monthDays(y, m).has(d);
      case 'YEARLY':
        return (y - sy) % r.interval === 0 && (r.bymonth ?? [sm]).includes(m) && monthDays(y, m).has(d);
    }
  };

  const limit = Math.min(TAKE, r.count ?? TAKE);
  const list = [fmt(c.start)];
  let [y, m, d, wd] = [sy, sm, sd, sDow];
  for (let day = sDay + 1; list.length < limit; day++) {
    wd = (wd + 1) % 7;
    if (++d > dim(y, m)) {
      d = 1;
      if (++m > 12) [m, y] = [1, y + 1];
    }
    if (y > LAST_YEAR) break;
    if (matches(day, y, m, d, wd)) list.push(fmt({ ...c.start, y, mo: m, d }));
  }
  return { list, startMatches: matches(sDay, sy, sm, sd, sDow) };
}

/** First TAKE occurrences up to LAST_YEAR from ical.js; an Error when ical.js throws. */
function icalList(rule: string, start: LocalDateTime): string[] | Error {
  try {
    const iter = ICAL.Recur.fromString(rule).iterator(
      ICAL.Time.fromData({ year: start.y, month: start.mo, day: start.d, hour: start.h, minute: start.mi, second: start.s, isDate: false }),
    );
    const out: string[] = [];
    for (let t = iter.next(); t && t.year <= LAST_YEAR && out.length <= TAKE; t = iter.next()) {
      out.push(fmt({ y: t.year, mo: t.month, d: t.day, h: t.hour, mi: t.minute, s: t.second }));
    }
    return out;
  } catch (err) {
    return err as Error;
  }
}

/**
 * The RFC 5545 series according to ical.js. ical.js starts with the first instance on or after DTSTART that matches the
 * rule; RFC 5545 3.8.5.3 makes DTSTART the first instance (and counts it toward COUNT) whether or not it matches. So when
 * DTSTART does not match, the series is DTSTART followed by ical.js's instances after it (asked without COUNT), cut at COUNT.
 */
function icalSeries(c: Case, startMatches: boolean): string[] | Error {
  if (startMatches) {
    const l = icalList(c.rule, c.start);
    return l instanceof Error ? l : l.slice(0, TAKE);
  }
  const l = icalList(c.rule.replace(/;COUNT=\d+/, ''), c.start);
  if (l instanceof Error) return l;
  const first = fmt(c.start);
  return [first, ...l.filter((x) => x > first)].slice(0, Math.min(TAKE, c.count ?? TAKE));
}

/** The ical.js defect class above that a case falls in, if any (D is decided when ical.js throws). */
function icalDefect(r: RuleParts, start: LocalDateTime, startMatches: boolean): 'A' | 'B' | 'C' | 'E' | 'F' | null {
  if (r.freq === 'YEARLY' && !r.bymonth && start.mo === 2 && start.d === 29) return 'F';
  if (r.freq === 'YEARLY' && r.bymonthday) {
    if (r.bymonthday.some((v) => v < 0)) return 'A';
    const pairs = (r.bymonth ?? []).flatMap((m) => r.bymonthday!.map((v) => [m, v]));
    if (pairs.some(([m, v]) => v > (m === 2 ? 29 : dim(2025, m)))) return 'F'; // never exists (Nov 31)
    if (!startMatches && pairs.some(([m, v]) => m === 2 && v === 29)) return 'F'; // Feb 29 from a non-leap start
  }
  if (r.freq === 'YEARLY' && r.count !== undefined && r.byday && new Set(r.byday.map((b) => b.day)).size < r.byday.length) return 'E';
  if (r.freq === 'MONTHLY' && r.bysetpos && !startMatches) return 'B';
  if (r.freq === 'MONTHLY' && r.bysetpos?.some((p) => p < 0)) return 'C';
  return null;
}

function mine(c: Case, fromDay?: number): string[] {
  const out: string[] = [];
  for (const o of expandOccurrences(c.start, parts(c.rule, c.start), { maxPeriods: 1_000_000, fromDay, toDay: daysFromCivil(LAST_YEAR, 12, 31) })) {
    if (o.y > LAST_YEAR) break;
    if (fromDay !== undefined && daysFromCivil(o.y, o.mo, o.d) < fromDay) continue;
    out.push(fmt(o));
    if (out.length >= TAKE) break;
  }
  return out;
}

function firstDifference(name: string, c: Case, want: string[], got: string[]): string | null {
  if (JSON.stringify(want) === JSON.stringify(got)) return null;
  let k = 0;
  while (want[k] === got[k]) k++;
  return `${c.rule} from ${fmt(c.start)}: #${k} ${name} ${want[k] ?? '(end)'} vs ${got[k] ?? '(end)'}`;
}

function runDifferential(seed: number, cases: number) {
  const rnd = mulberry32(seed);
  const perFreq: Record<string, number> = { DAILY: 0, WEEKLY: 0, MONTHLY: 0, YEARLY: 0 };
  const byOracle: Record<string, number> = { ical: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  const failures: string[] = [];
  let startNotMatching = 0;
  let jumpChecks = 0;
  for (let i = 0; i < cases; i++) {
    const c = randomCase(rnd);
    // Half the cases move DTSTART onto the rule's next occurrence, as real feeds have it.
    if (rnd() < 0.5) {
      const next = scan(c).list[1];
      if (next) c.start = { ...c.start, y: Number(next.slice(0, 4)), mo: Number(next.slice(5, 7)), d: Number(next.slice(8, 10)) };
    }
    perFreq[c.freq]++;
    const r = parts(c.rule, c.start);
    const brute = scan(c);
    if (!brute.startMatches) startNotMatching++;
    const got = mine(c);

    let problem: string | null;
    const defect = icalDefect(r, c.start, brute.startMatches);
    if (defect) {
      byOracle[defect]++;
      problem = firstDifference('scan', c, brute.list, got);
    } else {
      const want = icalSeries(c, brute.startMatches);
      if (want instanceof Error) {
        if (!/Same occurrence found twice|no valid occurrences/.test(want.message)) failures.push(`${c.rule} from ${fmt(c.start)}: ical.js threw ${want.message}`);
        byOracle.D++;
        problem = firstDifference('scan', c, brute.list, got);
      } else {
        byOracle.ical++;
        problem = firstDifference('ical.js', c, want, got) ?? firstDifference('ical.js (scan check)', c, want, brute.list);
      }
    }
    if (problem) {
      failures.push(problem);
      continue;
    }
    if (c.count === undefined) {
      // Skipping ahead with fromDay gives the same occurrences from that day on.
      const fromDay = daysFromCivil(c.start.y, c.start.mo, c.start.d) + Math.floor(rnd() * 3000);
      const full = mine(c).filter((x) => daysFromCivil(Number(x.slice(0, 4)), Number(x.slice(5, 7)), Number(x.slice(8, 10))) >= fromDay);
      const jumped = mine(c, fromDay).slice(0, full.length);
      jumpChecks++;
      const p = firstDifference(`fromDay ${fromDay}: full`, c, full, jumped);
      if (p) failures.push(p);
    }
  }
  return { perFreq, byOracle, startNotMatching, jumpChecks, failures };
}

describe('expandOccurrences: differential test against ical.js (seeded)', () => {
  it('matches ical.js (and an independent scan) on 1,000 random allowlisted rules', () => {
    const seed = Number(process.env.RRULE_DIFF_SEED ?? 20261023);
    const cases = Number(process.env.RRULE_DIFF_CASES ?? 1000);
    const r = runDifferential(seed, cases);
    // RRULE_DIFF_REPORT=<file> writes the summary (counts per FREQ and per oracle, first failures) for a one-off run.
    if (process.env.RRULE_DIFF_REPORT) writeFileSync(process.env.RRULE_DIFF_REPORT, JSON.stringify({ seed, cases, ...r, failures: r.failures.length, sample: r.failures.slice(0, 30) }, null, 1));
    expect(r.failures).toEqual([]);
    expect(Object.values(r.perFreq).every((n) => n > cases / 8)).toBe(true);
    expect(r.byOracle.ical).toBeGreaterThan(cases * 0.7); // most cases are checked against ical.js itself
  }, 60_000);
});

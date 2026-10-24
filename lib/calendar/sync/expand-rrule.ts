/**
 * Expands the recurrence rule shapes the feed parser allows (see `checkRule` in recurrence-rule.ts) into local wall-clock
 * occurrences. Pure integer arithmetic on civil dates: no Date, no Intl, no I/O, constant memory.
 *
 * Semantics (RFC 5545, 3.3.10 and 3.8.5.3):
 * - The first occurrence is always DTSTART itself, even when it does not match the BY parts, and it counts toward
 *   COUNT. After it come the rule's occurrences strictly after DTSTART's day, in order, each once.
 * - Periods are counted from DTSTART's own period in steps of INTERVAL: DAILY = days; WEEKLY = weeks starting on WKST
 *   (the week holding DTSTART is period 0); MONTHLY = calendar months; YEARLY = calendar years.
 * - DAILY: the day, if BYDAY (plain weekdays) allows it. WEEKLY: the BYDAY weekdays of the week (default DTSTART's).
 *   MONTHLY: BYMONTHDAY days (negative = from the month end); or BYDAY (plain = every such weekday of the month,
 *   ordinal n = the nth / nth-from-last one when it exists) narrowed by BYSETPOS (positions in the sorted set); or,
 *   with neither, DTSTART's day of the month. YEARLY: DTSTART's month and day; or, for each BYMONTH, that month's
 *   BYMONTHDAY or BYDAY days (ordinals count within the month).
 * - Days that do not exist (the 31st in April, Feb 29 in other years, a 5th Monday) are skipped, never clamped.
 * - Every occurrence has DTSTART's time of day; converting it to an instant is the caller's job.
 *
 * Cost: each period is a few dozen integer operations. Without COUNT, `fromDay` jumps straight to the first period that
 * can hold that day, so the age of DTSTART costs nothing; with COUNT the periods from DTSTART must be counted, which
 * `maxPeriods` bounds. The generator returns once a period starts after `toDay`.
 */

export interface LocalDateTime {
  y: number;
  /** 1..12 */
  mo: number;
  d: number;
  h: number;
  mi: number;
  s: number;
}

/** 0 = Sunday .. 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface RuleParts {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  /** >= 1 */
  interval: number;
  /** >= 1 when present. */
  count?: number;
  /** ord 0 = every such weekday; 1..5 / -1..-5 = the nth / nth-from-last in the month (MONTHLY, YEARLY only). */
  byday?: { ord: number; day: Weekday }[];
  /** 1..31 or -31..-1 */
  bymonthday?: number[];
  /** 1..12 */
  bymonth?: number[];
  /** 1..5 or -5..-1 (MONTHLY with BYDAY only) */
  bysetpos?: number[];
  wkst: Weekday;
}

interface ExpandOptions {
  /** Days since 1970-01-01: skip, arithmetically, the periods that end before this day. Ignored when the rule has COUNT. */
  fromDay?: number;
  /** Days since 1970-01-01: stop once a period starts after this day. */
  toDay?: number;
  /** Most periods to scan; scanning one more throws RecurrenceLimitError. */
  maxPeriods: number;
  /** Receives the number of periods scanned (for the caller's budget). */
  stats?: { periods: number };
}

/** The rule needs more periods than `maxPeriods` allows. */
export class RecurrenceLimitError extends Error {
  constructor() {
    super('recurrence needs more periods than allowed');
    this.name = 'RecurrenceLimitError';
  }
}

/** Days from 1970-01-01 to the given proleptic Gregorian date (H. Hinnant's days_from_civil). */
export function daysFromCivil(y: number, m: number, d: number): number {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m > 2 ? m - 3 : m + 9) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Inverse of daysFromCivil. */
export function civilFromDays(days: number): { y: number; m: number; d: number } {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d };
}

/** 0 = Sunday; 1970-01-01 was a Thursday. */
export const weekdayOf = (days: number): Weekday => ((((days + 4) % 7) + 7) % 7) as Weekday;

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const daysInMonth = (y: number, m: number) => (m === 2 && isLeap(y) ? 29 : MONTH_DAYS[m - 1]);
const ceilDiv = (a: number, b: number) => Math.ceil(a / b);

/** Bit (d - 1) set for each day d of the month the rule selects (before BYSETPOS). */
function monthMask(y: number, m: number, rule: RuleParts, defaultDay: number): number {
  const dim = daysInMonth(y, m);
  let mask = 0;
  if (rule.bymonthday) {
    for (const v of rule.bymonthday) {
      const d = v > 0 ? v : dim + 1 + v;
      if (d >= 1 && d <= dim) mask |= 1 << (d - 1);
    }
  } else if (rule.byday) {
    const firstDow = weekdayOf(daysFromCivil(y, m, 1));
    for (const { ord, day } of rule.byday) {
      const first = 1 + ((day - firstDow + 7) % 7); // first such weekday of the month
      if (ord === 0) {
        for (let d = first; d <= dim; d += 7) mask |= 1 << (d - 1);
      } else {
        const d = ord > 0 ? first + 7 * (ord - 1) : first + 7 * Math.floor((dim - first) / 7) + 7 * (ord + 1);
        if (d >= 1 && d <= dim) mask |= 1 << (d - 1);
      }
    }
  } else if (defaultDay <= dim) {
    mask = 1 << (defaultDay - 1);
  }
  return mask;
}

/** Keeps only the BYSETPOS positions (1-based, negative from the end) of the set bits. */
function setPositions(mask: number, positions: number[]): number {
  let n = 0;
  for (let x = mask; x; x &= x - 1) n++;
  let out = 0;
  for (const pos of positions) {
    let idx = pos > 0 ? pos - 1 : n + pos;
    if (idx < 0 || idx >= n) continue;
    for (let x = mask; x; x &= x - 1) {
      if (idx-- === 0) {
        out |= x & -x;
        break;
      }
    }
  }
  return out;
}

/** Writes the day numbers of a month's set bits, ascending, into `buf` from `at`; returns the new length. */
function pushMonth(y: number, m: number, mask: number, buf: number[], at: number): number {
  const first = daysFromCivil(y, m, 1);
  for (let x = mask; x; x &= x - 1) buf[at++] = first + 31 - Math.clz32(x & -x); // lowest set bit b is day b + 1
  return at;
}

/** One kind of period: where period k starts, which period first reaches a day, and its days in order. */
interface Periods {
  startOf(k: number): number;
  firstFor(day: number): number;
  fill(k: number, buf: number[]): number;
}

function periodsOf(start: LocalDateTime, startDay: number, rule: RuleParts): Periods {
  const step = rule.interval;
  switch (rule.freq) {
    case 'DAILY': {
      let allowed = 0x7f;
      if (rule.byday) {
        allowed = 0;
        for (const { day } of rule.byday) allowed |= 1 << day;
      }
      return {
        startOf: (k) => startDay + k * step,
        firstFor: (day) => ceilDiv(day - startDay, step),
        fill: (k, buf) => {
          const day = startDay + k * step;
          if (!(allowed & (1 << weekdayOf(day)))) return 0;
          buf[0] = day;
          return 1;
        },
      };
    }
    case 'WEEKLY': {
      const week0 = startDay - ((weekdayOf(startDay) - rule.wkst + 7) % 7);
      const days = rule.byday ? rule.byday.map((b) => b.day) : [weekdayOf(startDay)];
      const offsets = [...new Set(days.map((d) => (d - rule.wkst + 7) % 7))].sort((a, b) => a - b);
      return {
        startOf: (k) => week0 + 7 * step * k,
        firstFor: (day) => ceilDiv(day - 6 - week0, 7 * step),
        fill: (k, buf) => {
          const ws = week0 + 7 * step * k;
          for (let i = 0; i < offsets.length; i++) buf[i] = ws + offsets[i];
          return offsets.length;
        },
      };
    }
    case 'MONTHLY': {
      const month0 = start.y * 12 + start.mo - 1;
      const ym = (k: number) => {
        const idx = month0 + k * step;
        return [Math.floor(idx / 12), (idx % 12) + 1] as const;
      };
      return {
        startOf: (k) => {
          const [y, m] = ym(k);
          return daysFromCivil(y, m, 1);
        },
        firstFor: (day) => {
          const c = civilFromDays(day);
          return ceilDiv(c.y * 12 + c.m - 1 - month0, step);
        },
        fill: (k, buf) => {
          const [y, m] = ym(k);
          let mask = monthMask(y, m, rule, start.d);
          if (rule.bysetpos) mask = setPositions(mask, rule.bysetpos);
          return pushMonth(y, m, mask, buf, 0);
        },
      };
    }
    case 'YEARLY': {
      const months = rule.bymonth ? [...new Set(rule.bymonth)].sort((a, b) => a - b) : [start.mo];
      return {
        startOf: (k) => daysFromCivil(start.y + k * step, 1, 1),
        firstFor: (day) => ceilDiv(civilFromDays(day).y - start.y, step),
        fill: (k, buf) => {
          const y = start.y + k * step;
          let n = 0;
          for (const m of months) n = pushMonth(y, m, monthMask(y, m, rule, start.d), buf, n);
          return n;
        },
      };
    }
  }
}

/** Occurrences of the rule from DTSTART, in order, as local wall-clock fields (see the file comment). */
export function* expandOccurrences(start: LocalDateTime, rule: RuleParts, opts: ExpandOptions): Generator<LocalDateTime, void, undefined> {
  const startDay = daysFromCivil(start.y, start.mo, start.d);
  const fromDay = rule.count === undefined ? opts.fromDay : undefined;
  const toDay = opts.toDay ?? Infinity;
  let left = rule.count ?? Infinity;
  if (left < 1) return;
  const occurrence = (day: number): LocalDateTime => {
    const c = civilFromDays(day);
    return { y: c.y, mo: c.m, d: c.d, h: start.h, mi: start.mi, s: start.s };
  };

  if (fromDay === undefined || startDay >= fromDay) {
    yield { ...start };
    if (--left < 1) return;
  }

  const periods = periodsOf(start, startDay, rule);
  const buf: number[] = [];
  let scanned = 0;
  for (let k = fromDay === undefined ? 0 : Math.max(0, periods.firstFor(fromDay)); ; k++) {
    if (periods.startOf(k) > toDay) return;
    if (++scanned > opts.maxPeriods) throw new RecurrenceLimitError();
    if (opts.stats) opts.stats.periods++;
    const n = periods.fill(k, buf);
    for (let i = 0; i < n; i++) {
      if (buf[i] <= startDay) continue; // DTSTART and anything before it in its own period
      yield occurrence(buf[i]);
      if (--left < 1) return;
    }
  }
}

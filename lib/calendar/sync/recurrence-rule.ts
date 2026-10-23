/**
 * Which recurrence rules the feed parser expands: a short allowlist of shapes, decided from the rule's parts alone in
 * O(1), and their conversion into the expander's RuleParts (expand-rrule.ts handles exactly these shapes).
 */

import ICAL from 'ical.js';
import { daysFromCivil, weekdayOf, type LocalDateTime, type RuleParts, type Weekday } from './expand-rrule';

/** The recurrence cannot be expanded safely or at all; the event is counted in `unsupported`. */
export class UnsupportedRecurrence extends Error {}

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** BYDAY entries such as MO, 1MO or -1FR as { ord, day } (ord 0 = no ordinal, day 0 = Sunday). */
function weekdaysOf(byDay: unknown[]): { ord: number; day: Weekday }[] {
  return byDay.map((entry) => {
    const m = /^([+-]?\d+)?([A-Za-z]{2})$/.exec(String(entry).trim());
    const day = m ? WEEKDAYS.indexOf(m[2].toUpperCase()) : -1;
    if (!m || day < 0) throw new UnsupportedRecurrence('unreadable BYDAY');
    return { ord: m[1] ? Number(m[1]) : 0, day: day as Weekday };
  });
}

/** Largest INTERVAL accepted per FREQ (a real calendar uses 1 to 4 or so). */
const MAX_INTERVAL: Record<string, number> = { DAILY: 365, WEEKLY: 104, MONTHLY: 60, YEARLY: 20 };
/** Longest BY list accepted in a rule (a real list has at most a few dozen entries). */
const MAX_BY_LIST = 31;
const ALLOWED_BY_PARTS = new Set(['BYMONTH', 'BYMONTHDAY', 'BYDAY', 'BYSETPOS']);

/** Every value must be an integer within [-max, -1] or [1, max]; unsupported otherwise. */
function signedInts(list: unknown[], max: number, what: string): void {
  for (const v of list) {
    const n = Number(v);
    if (!Number.isInteger(n) || n === 0 || Math.abs(n) > max) throw new UnsupportedRecurrence(`${what} out of range`);
  }
}

/**
 * Recurrence safety. Only a short allowlist of shapes is expanded, decided from the rule's parts alone in O(1). Everything
 * else is unsupported (HOURLY, MINUTELY, SECONDLY, a BY part outside the list, long lists, large INTERVALs). The
 * expander's cost is bounded by the window and by the parser's budgets.
 *  - COUNT, UNTIL and WKST are always allowed; INTERVAL has a per-FREQ maximum.
 *  - DAILY: no BY part, or BYDAY of plain weekdays (with INTERVAL a multiple of 7, DTSTART's weekday must be among them).
 *  - WEEKLY: no BY part, or BYDAY of plain weekdays.
 *  - MONTHLY: no BY part; or BYMONTHDAY alone; or BYDAY (ordinals allowed) with optional BYSETPOS.
 *  - YEARLY: no BY part; or BYMONTH with BYMONTHDAY; or BYMONTH with BYDAY (ordinals allowed).
 */
function checkRule(rule: ICAL.Recur, start: LocalDateTime): void {
  const freq = String(rule.freq);
  const maxInterval = MAX_INTERVAL[freq];
  if (!maxInterval) throw new UnsupportedRecurrence(`FREQ=${freq} is not supported`);
  const interval = Number(rule.interval);
  if (!Number.isInteger(interval) || interval < 1 || interval > maxInterval) throw new UnsupportedRecurrence('INTERVAL out of range');

  const keys = Object.keys(rule.parts);
  for (const key of keys) {
    if (!ALLOWED_BY_PARTS.has(key)) throw new UnsupportedRecurrence(`${key} is not supported`);
    const n = rule.getComponent(key).length;
    if (n === 0 || n > MAX_BY_LIST) throw new UnsupportedRecurrence(`${key} list has an unsupported length`);
  }
  const has = (k: string) => keys.includes(k);
  const only = (...allowed: string[]) => {
    if (keys.some((k) => !allowed.includes(k))) throw new UnsupportedRecurrence(`${freq} with ${keys.join('+')} is not supported`);
  };
  const ordinals = () => weekdaysOf(rule.getComponent('BYDAY')).flatMap((b) => (b.ord ? [b.ord] : []));

  if (freq === 'DAILY' || freq === 'WEEKLY') {
    only('BYDAY');
    if (!has('BYDAY')) return;
    const entries = weekdaysOf(rule.getComponent('BYDAY'));
    if (entries.some((b) => b.ord !== 0)) throw new UnsupportedRecurrence('ordinal BYDAY needs MONTHLY or YEARLY');
    // A DAILY rule stepping a whole number of weeks stays on DTSTART's weekday for ever.
    const startDow = weekdayOf(daysFromCivil(start.y, start.mo, start.d));
    if (freq === 'DAILY' && interval % 7 === 0 && !entries.some((b) => b.day === startDow)) throw new UnsupportedRecurrence('BYDAY can never be reached');
    return;
  }

  if (freq === 'MONTHLY') {
    if (keys.length === 0) return;
    if (has('BYMONTHDAY')) {
      only('BYMONTHDAY');
      signedInts(rule.getComponent('BYMONTHDAY'), 31, 'BYMONTHDAY');
      return;
    }
    if (!has('BYDAY')) throw new UnsupportedRecurrence('BYSETPOS needs BYDAY');
    only('BYDAY', 'BYSETPOS');
    signedInts(ordinals(), 5, 'BYDAY ordinal');
    signedInts(rule.getComponent('BYSETPOS'), 5, 'BYSETPOS');
    return;
  }

  // YEARLY
  if (keys.length === 0) return;
  if (!has('BYMONTH')) throw new UnsupportedRecurrence('YEARLY day parts need BYMONTH');
  for (const v of rule.getComponent('BYMONTH')) {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 12) throw new UnsupportedRecurrence('BYMONTH out of range');
  }
  if (has('BYMONTHDAY')) {
    only('BYMONTH', 'BYMONTHDAY');
    signedInts(rule.getComponent('BYMONTHDAY'), 31, 'BYMONTHDAY');
    return;
  }
  if (!has('BYDAY')) throw new UnsupportedRecurrence('YEARLY with BYMONTH alone is not supported');
  only('BYMONTH', 'BYDAY');
  signedInts(ordinals(), 5, 'BYDAY ordinal');
}

/**
 * The parts of an allowlisted rule (see checkRule) for the expander; throws UnsupportedRecurrence for any other rule.
 */
export function recurrenceParts(rule: ICAL.Recur, start: LocalDateTime): RuleParts {
  checkRule(rule, start);
  const count = rule.count == null ? undefined : Number(rule.count);
  if (count !== undefined && (!Number.isInteger(count) || count < 1)) throw new UnsupportedRecurrence('COUNT out of range');
  const nums = (key: string) => (key in rule.parts ? rule.getComponent(key).map(Number) : undefined);
  return {
    freq: rule.freq as RuleParts['freq'],
    interval: Number(rule.interval),
    count,
    byday: 'BYDAY' in rule.parts ? weekdaysOf(rule.getComponent('BYDAY')) : undefined,
    bymonthday: nums('BYMONTHDAY'),
    bymonth: nums('BYMONTH'),
    bysetpos: nums('BYSETPOS'),
    wkst: ((Number(rule.wkst ?? ICAL.Time.MONDAY) - 1 + 7) % 7) as Weekday, // ical.js numbers weekdays 1 = Sunday
  };
}

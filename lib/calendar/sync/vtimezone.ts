/**
 * VTIMEZONE blocks of a feed, for the TZIDs Intl does not know (Outlook's Windows names such as "W. Europe Standard Time").
 *
 * ical.js computes a zone's offsets by running its STANDARD / DAYLIGHT recurrence rules from their DTSTART up to a few years
 * ahead, synchronously. A hostile zone (FREQ=SECONDLY from the year 1, or simply a DAILY rule from 1601) froze the event loop for
 * seconds to hours, and each distinct zone added its own cost. So ical.js only parses the text here; offsets are computed in-house,
 * and only for zones shaped like real ones:
 *  - at most two STANDARD / DAYLIGHT parts;
 *  - each part has TZOFFSETFROM, TZOFFSETTO (under 24 hours) and a date-time DTSTART;
 *  - at most one RRULE per part, FREQ=YEARLY with INTERVAL=1, in the feed parser's allowlist (recurrence-rule.ts: YEARLY alone,
 *    BYMONTH with BYDAY, or BYMONTH with BYMONTHDAY); a COUNT rule has at most 1,000 changes;
 *  - at most 1,000 RDATEs in the whole zone (a zone of RDATEs only is fine).
 * Any other zone is refused (`readVTimezone` throws ZoneRejected): the caller reads its events in the business timezone.
 *
 * Cost: a rule's changes are worked out for one calendar year at a time by the in-house expander, which jumps straight to that
 * year, so the age of DTSTART (1601, or the year 1) and the year asked about (even 9999) cost nothing extra. Years are cached.
 * There is no need to clamp DTSTART: nothing iterates from it.
 */

import ICAL from 'ical.js';
import { civilFromDays, daysFromCivil, expandOccurrences, RecurrenceLimitError, type LocalDateTime, type RuleParts } from './expand-rrule';
import { recurrenceParts, UnsupportedRecurrence } from './recurrence-rule';

/** Most STANDARD / DAYLIGHT parts in one zone (real zones in feeds have one or two). */
export const MAX_ZONE_PARTS = 2;
/** Most RDATE values in one zone. */
export const MAX_ZONE_RDATES = 1000;
/** Most changes a COUNT rule of a zone may describe. */
const MAX_ZONE_COUNT = 1000;
/** A rule that has had no change in this many years is treated as having stopped (a Feb 29 rule changes at least every 8). */
const YEARS_BACK = 10;
const YEAR_CACHE_LIMIT = 64;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The zone is not shaped like a real one; its events are read in the business timezone. */
export class ZoneRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZoneRejected';
  }
}

interface ZonePart {
  offsetFrom: number;
  offsetTo: number;
  start: LocalDateTime;
  /** Every change known up front (DTSTART, RDATEs, all changes of a COUNT rule), as UTC ms, ascending. */
  fixed: number[];
  /** A rule without COUNT, expanded one year at a time. */
  rule: RuleParts | null;
  /** Last instant (UTC ms, inclusive) a change of `rule` may fall on. */
  untilMs: number;
  /** Changes of `rule` per local calendar year, as UTC ms, ascending. */
  years: Map<number, number[]>;
}

export interface VZone {
  tzid: string;
  parts: ZonePart[];
}

const naiveMs = (t: LocalDateTime) => daysFromCivil(t.y, t.mo, t.d) * DAY_MS + ((t.h * 60 + t.mi) * 60 + t.s) * 1000;

function offsetMs(comp: ICAL.Component, name: string): number {
  const v = comp.getFirstPropertyValue(name);
  const seconds = v instanceof ICAL.UtcOffset ? v.toSeconds() : NaN;
  if (!Number.isFinite(seconds) || Math.abs(seconds) >= 24 * 3600) throw new ZoneRejected(`${name} missing or out of range`);
  return seconds * 1000;
}

function timeOf(value: unknown): ICAL.Time {
  const t = value instanceof ICAL.Period ? value.start : value;
  if (!(t instanceof ICAL.Time) || ![t.year, t.month, t.day, t.hour, t.minute, t.second].every(Number.isFinite)) {
    throw new ZoneRejected('unreadable date');
  }
  return t;
}

const localOf = (t: ICAL.Time): LocalDateTime =>
  t.isDate ? { y: t.year, mo: t.month, d: t.day, h: 0, mi: 0, s: 0 } : { y: t.year, mo: t.month, d: t.day, h: t.hour, mi: t.minute, s: t.second };
const isUtc = (t: ICAL.Time) => t.zone?.tzid === 'UTC';

/** UTC instant of a change written as local time in the offset in force before it (RFC 5545), or in UTC when it says so. */
const changeAt = (t: ICAL.Time, offsetFrom: number) => naiveMs(localOf(t)) - (isUtc(t) ? 0 : offsetFrom);

function readPart(comp: ICAL.Component, rdatesLeft: { n: number }): ZonePart {
  const offsetFrom = offsetMs(comp, 'tzoffsetfrom');
  const offsetTo = offsetMs(comp, 'tzoffsetto');
  const startTime = timeOf(comp.getFirstPropertyValue('dtstart'));
  if (startTime.isDate) throw new ZoneRejected('DTSTART must be a date-time');
  const start = localOf(startTime);
  const fixed = [changeAt(startTime, offsetFrom)];

  for (const prop of comp.getAllProperties('rdate')) {
    const values = prop.getValues();
    rdatesLeft.n -= values.length;
    if (rdatesLeft.n < 0) throw new ZoneRejected('too many RDATEs');
    for (const v of values) fixed.push(changeAt(timeOf(v), offsetFrom));
  }

  const rules = comp.getAllProperties('rrule');
  if (rules.length > 1) throw new ZoneRejected('more than one RRULE');
  let rule: RuleParts | null = null;
  let untilMs = Infinity;
  if (rules.length === 1) {
    const recur = rules[0].getFirstValue();
    if (!(recur instanceof ICAL.Recur) || String(recur.freq) !== 'YEARLY' || Number(recur.interval) !== 1) {
      throw new ZoneRejected('only FREQ=YEARLY with INTERVAL=1');
    }
    let parts: RuleParts;
    try {
      parts = recurrenceParts(recur, start);
    } catch (err) {
      if (err instanceof UnsupportedRecurrence) throw new ZoneRejected('rule outside the allowlist');
      throw err;
    }
    if (recur.until) {
      const u = timeOf(recur.until);
      untilMs = u.isDate ? (daysFromCivil(u.year, u.month, u.day) + 1) * DAY_MS - offsetFrom - 1 : changeAt(u, offsetFrom);
    }
    if (parts.count !== undefined) {
      if (parts.count > MAX_ZONE_COUNT) throw new ZoneRejected('COUNT too large');
      try {
        for (const occ of expandOccurrences(start, parts, { maxPeriods: 2 * MAX_ZONE_COUNT })) {
          const at = naiveMs(occ) - offsetFrom;
          if (at <= untilMs) fixed.push(at);
        }
      } catch (err) {
        if (err instanceof RecurrenceLimitError) throw new ZoneRejected('COUNT rule never completes');
        throw err;
      }
    } else {
      rule = parts;
    }
  }
  if (!fixed.every(Number.isFinite)) throw new ZoneRejected('unreadable change');
  fixed.sort((a, b) => a - b);
  return { offsetFrom, offsetTo, start, fixed, rule, untilMs, years: new Map() };
}

/** Reads a parsed VTIMEZONE component; throws ZoneRejected for a zone outside the shapes listed in the file comment. */
export function readVTimezone(comp: ICAL.Component): VZone {
  const tzid = comp.getFirstPropertyValue('tzid');
  if (typeof tzid !== 'string' || tzid.trim() === '') throw new ZoneRejected('no TZID');
  const subs = comp.getAllSubcomponents().filter((c) => c.name === 'standard' || c.name === 'daylight');
  if (subs.length === 0 || subs.length > MAX_ZONE_PARTS) throw new ZoneRejected('unsupported number of STANDARD / DAYLIGHT parts');
  const rdatesLeft = { n: MAX_ZONE_RDATES };
  return { tzid: tzid.trim(), parts: subs.map((c) => readPart(c, rdatesLeft)) };
}

/** Index of the last value <= x in an ascending list, or -1. */
function lastAtOrBefore(list: number[], x: number): number {
  let lo = 0;
  let hi = list.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid] <= x) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
}

function ruleChangesIn(part: ZonePart, rule: RuleParts, year: number): number[] {
  let list = part.years.get(year);
  if (list) return list;
  list = [];
  try {
    const opts = { fromDay: daysFromCivil(year, 1, 1), toDay: daysFromCivil(year, 12, 31), maxPeriods: 2 };
    for (const occ of expandOccurrences(part.start, rule, opts)) {
      const at = naiveMs(occ) - part.offsetFrom;
      if (at <= part.untilMs) list.push(at);
    }
  } catch (err) {
    if (!(err instanceof RecurrenceLimitError)) throw err;
  }
  if (part.years.size >= YEAR_CACHE_LIMIT) part.years.clear();
  part.years.set(year, list);
  return list;
}

/** The latest change of the part at or before `at` (UTC ms), or null. */
function latestChange(part: ZonePart, at: number): number | null {
  const i = lastAtOrBefore(part.fixed, at);
  let best = i >= 0 ? part.fixed[i] : null;
  if (part.rule) {
    const s = Math.min(at, part.untilMs);
    const year = civilFromDays(Math.floor(s / DAY_MS)).y;
    for (let y = year + 1; y >= Math.max(part.start.y, year - YEARS_BACK); y--) {
      const list = ruleChangesIn(part, part.rule, y);
      const j = lastAtOrBefore(list, s);
      if (j >= 0) {
        if (best === null || list[j] > best) best = list[j];
        break;
      }
    }
  }
  return best;
}

/** Offset (ms, local minus UTC) in force at a UTC instant. Before the zone's first change, the offset that change starts from. */
function offsetAt(zone: VZone, at: number): number {
  let best: number | null = null;
  let offset = 0;
  let earliest = Infinity;
  let before = 0;
  for (const part of zone.parts) {
    if (part.fixed[0] < earliest) {
      earliest = part.fixed[0];
      before = part.offsetFrom;
    }
    const change = latestChange(part, at);
    if (change !== null && (best === null || change >= best)) {
      best = change;
      offset = part.offsetTo;
    }
  }
  return best === null ? before : offset;
}

/** UTC instant (ms) at which the zone's wall clock reads `t`; a gap or overlap is settled the way wallTimeToUtc settles it. */
export function zoneWallToMs(zone: VZone, t: LocalDateTime): number {
  const wall = naiveMs(t);
  const first = wall - offsetAt(zone, wall);
  return wall - offsetAt(zone, first);
}

/**
 * Turns the text of an iCal feed (an owner's Google / Apple / Outlook calendar link) into busy blocks.
 *
 * - Only events that overlap the window [from, to) are returned, as half-open UTC ranges.
 * - Cancelled and "free" (TRANSP:TRANSPARENT) events do not block.
 * - Recurring events are expanded inside the window; EXDATE and RECURRENCE-ID overrides are honoured.
 * - Cost: past one-off events (most of a history feed) and series whose UNTIL is past are dropped from the raw text before
 *   ical.js sees them; the parse is async and yields to the event loop about every 10 ms; after 5 s it stops and counts the
 *   events not read yet in `unsupported` (the result is still returned, not an error).
 * - One bad event never fails the feed: it is counted in `skipped`. A recurrence that is unsupported, unsafe to expand
 *   or cut short by a cap is counted in `unsupported` instead (see "Recurrence safety" below). Text that is not a calendar at all throws
 *   CalendarParseError, so the caller keeps the blocks it already has instead of treating it as an emptied calendar.
 *
 * ical.js only parses the text. Recurrences are expanded by `expandOccurrences` (expand-rrule.ts), which works on
 * wall-clock fields, so a weekly 10:00 stays 10:00 across a DST change, and whose cost does not grow with the age of the
 * series. Times are never converted by ical.js: every wall-clock value near the window is turned into a UTC instant with
 * the same Intl offset method bookings use (`wallTimeToUtc`), or, for a TZID Intl does not know, with the feed's own VTIMEZONE
 * read by vtimezone.ts (small YEARLY zones only; any other zone is dropped and its events are read in the business timezone,
 * each counted in `unsupported`).
 */

import ICAL from 'ical.js';
import { knownTimezone, wallTimeToUtc } from '@/lib/appointments/time-range';
import { civilFromDays, daysFromCivil, expandOccurrences, RecurrenceLimitError, type LocalDateTime, type RuleParts } from './expand-rrule';
import { recurrenceParts, UnsupportedRecurrence } from './recurrence-rule';
import { readVTimezone, zoneWallToMs, type VZone } from './vtimezone';
import type { ExternalBlock } from './types';

/** The text is not an iCal calendar (or is cut off), so nothing can be said about the owner's busy times. */
export class CalendarParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalendarParseError';
  }
}

export interface ParseIcalOptions {
  /** The business timezone: floating times and all-day dates are read in it. */
  timezone: string;
  from: Date;
  to: Date;
  /** Wall-clock limit for the whole parse (default 5 s); a lower value is for tests. */
  deadlineMs?: number;
}

export interface ParseIcalResult {
  blocks: ExternalBlock[];
  /** Events that are malformed and could not be read (bad date, bad rule, cut off, no start). Past events dropped unread are not counted. */
  skipped: number;
  /**
   * Events dropped or only partly expanded because their recurrence is unsupported, unsafe or hit a cap; events whose TZID
   * points at a VTIMEZONE that was refused (they are still read, in the business timezone); and events not read before the deadline.
   */
  unsupported: number;
}

/** Most blocks one recurring event may add inside the window. */
const MAX_OCCURRENCES_PER_EVENT = 1000;
/**
 * Most expansion work for one event: periods scanned plus occurrences read. A rule without COUNT starts next to the
 * window, so this only binds a COUNT rule, which is counted from its first date (a daily one reaches about 27 years).
 */
const MAX_SCAN_PER_EVENT = 20_000;
/** Most expansion work for the whole feed, so many long series cannot add up to a long block of the event loop. */
const MAX_SCAN_PER_FEED = 100_000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Default wall-clock limit of one parse. */
const PARSE_DEADLINE_MS = 5000;
/** The parse gives the event loop a turn after this much work. */
const YIELD_EVERY_MS = 10;

const yieldToLoop = () => new Promise<void>((resolve) => (typeof setImmediate === 'function' ? setImmediate(resolve) : setTimeout(resolve, 0)));

type Zone = { kind: 'utc' } | { kind: 'iana'; tz: string } | { kind: 'vtz'; zone: VZone };

interface Context {
  /** Business timezone, always a name Intl accepts. */
  fallbackTz: string;
  /** VTIMEZONE blocks of the feed by TZID; only kept for names Intl does not know (e.g. Outlook's Windows names). */
  vtimezones: Map<string, VZone>;
  /** TZIDs whose VTIMEZONE was refused (see vtimezone.ts). */
  droppedZones: Set<string>;
  /** Set when the event being read used a refused zone (it then counts as unsupported). */
  usedDroppedZone: boolean;
  fromMs: number;
  toMs: number;
  scanLeft: number;
}

interface PreparedEvent {
  vevent: ICAL.Component;
  uid: string | null;
  isOverride: boolean;
}

interface EventResult {
  blocks: ExternalBlock[];
  /** Expansion was cut short by one of the caps. */
  capped: boolean;
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');
const isoDate = (y: number, m: number, d: number) => `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}`;

/** Unfolds the text and splits it into top-level VEVENT / VTIMEZONE chunks (as lines). */
function splitFeed(text: string): { events: string[][]; timezones: string[][]; unterminated: number } {
  const events: string[][] = [];
  const timezones: string[][] = [];
  let unterminated = 0;
  let sawBegin = false;
  let sawEnd = false;
  let current: { kind: 'event' | 'timezone' | 'other'; lines: string[]; depth: number } | null = null;

  // One pass, written for speed on 2 MB feeds: a line starting with a space or tab continues the line before it (unfolding),
  // so each line is handled once the next one shows it is complete. Blank lines are ignored.
  const raw = text.replace(/^\uFEFF/, '').split(/\r\n|\r|\n/);
  let pending: string | null = null;
  for (let r = 0; r <= raw.length; r++) {
    const next = r < raw.length ? raw[r] : null;
    if (next !== null) {
      const first = next.charCodeAt(0);
      if ((first === 32 || first === 9) && pending !== null) {
        pending += next.slice(1);
        continue;
      }
    }
    const line = pending;
    pending = next;
    if (line === null || line === '' || (line.charCodeAt(0) <= 32 && line.trim() === '')) continue;
    const c = line.charCodeAt(0);
    const begin = (c === 66 || c === 98) && line.slice(0, 6).toUpperCase() === 'BEGIN:';
    const end = !begin && (c === 69 || c === 101) && line.slice(0, 4).toUpperCase() === 'END:';
    const name = begin ? line.slice(6).trim().toUpperCase() : end ? line.slice(4).trim().toUpperCase() : '';

    if (!current) {
      if (begin) {
        if (name === 'VCALENDAR') sawBegin = true;
        else if (name === 'VEVENT') current = { kind: 'event', lines: [line], depth: 1 };
        else if (name === 'VTIMEZONE') current = { kind: 'timezone', lines: [line], depth: 1 };
        else current = { kind: 'other', lines: [line], depth: 1 };
      } else if (end && name === 'VCALENDAR' && sawBegin) {
        sawEnd = true;
      }
      continue;
    }

    if (begin && name === 'VEVENT' && current.kind === 'event') {
      // A new event starts before the previous one ended: the previous one was cut off.
      unterminated++;
      current = { kind: 'event', lines: [line], depth: 1 };
      continue;
    }
    current.lines.push(line);
    if (begin) current.depth++;
    else if (end) {
      current.depth--;
      if (current.depth === 0) {
        if (current.kind === 'event') events.push(current.lines);
        else if (current.kind === 'timezone') timezones.push(current.lines);
        current = null;
      }
    }
  }
  if (current?.kind === 'event') unterminated++;

  if (!sawBegin || !sawEnd) {
    throw new CalendarParseError('The feed is not a complete iCal calendar (missing BEGIN:VCALENDAR or END:VCALENDAR).');
  }
  return { events, timezones, unterminated };
}

/** A raw DATE or DATE-TIME value ("20260610", "20260610T090000", "20260610T090000Z") as ms with its fields read as UTC. */
function rawDateMs(raw: string): { ms: number; isDate: boolean } | null {
  const v = raw.trim();
  const isDate = v.length === 8;
  // YYYYMMDD, or YYYYMMDD'T'HHMMSS with an optional 'Z'
  if (!isDate && !((v.length === 15 || (v.length === 16 && v.charCodeAt(15) === 90)) && v.charCodeAt(8) === 84)) return null;
  const num = (from: number, to: number) => {
    let n = 0;
    for (let i = from; i < to; i++) {
      const c = v.charCodeAt(i) - 48;
      if (c < 0 || c > 9) return NaN;
      n = n * 10 + c;
    }
    return n;
  };
  const y = num(0, 4);
  const mo = num(4, 6);
  const d = num(6, 8);
  if (!(mo >= 1 && mo <= 12 && d >= 1 && d <= 31) || Number.isNaN(y)) return null;
  const secs = isDate ? 0 : (num(9, 11) * 60 + num(11, 13)) * 60 + num(13, 15);
  if (Number.isNaN(secs)) return null;
  return { ms: daysFromCivil(y, mo, d) * DAY_MS + secs * 1000, isDate };
}

/** Name and raw value of a content line; the value starts at the first colon outside a quoted parameter. */
function splitLine(line: string): { name: string; value: string } | null {
  if (line.indexOf('"') < 0) {
    // The usual case, without quoted parameters.
    const colon = line.indexOf(':');
    if (colon < 0) return null;
    const semi = line.indexOf(';');
    const nameEnd = semi >= 0 && semi < colon ? semi : colon;
    return { name: line.slice(0, nameEnd).toUpperCase(), value: line.slice(colon + 1) };
  }
  let quoted = false;
  let nameEnd = -1;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') quoted = !quoted;
    else if (!quoted && (c === ';' || c === ':') && nameEnd < 0) nameEnd = i;
    if (!quoted && c === ':') return { name: line.slice(0, nameEnd).toUpperCase(), value: line.slice(i + 1) };
  }
  return null;
}

/**
 * True when an event chunk certainly has nothing at or after `fromMs`, read from the raw text without ical.js. Only plain cases
 * are decided; anything else (an override, RDATE, DURATION, an unreadable or missing value, a rule without UNTIL) is not
 * skipped. Raw values are read as if they were UTC; a zone is less than a day away, and the margins below cover it.
 */
function clearlyPast(lines: string[], fromMs: number): boolean {
  let start: string | null = null;
  let end: string | null = null;
  const rules: string[] = [];
  let depth = 0;
  for (const line of lines) {
    const c = line.charCodeAt(0) & ~32; // upper case of an ASCII letter
    if (c === 66 && line.slice(0, 6).toUpperCase() === 'BEGIN:') {
      depth++;
      continue;
    }
    if (c === 69 && line.slice(0, 4).toUpperCase() === 'END:') {
      depth--;
      continue;
    }
    // Only DTSTART, DTEND, DURATION, RRULE, RDATE and RECURRENCE-ID matter; VALARM and other nested parts are ignored.
    if ((c !== 68 && c !== 82) || depth !== 1) continue;
    const p = splitLine(line);
    if (!p) return false;
    if (p.name === 'RECURRENCE-ID' || p.name === 'RDATE' || p.name === 'DURATION') return false;
    if (p.name === 'DTSTART') start ??= p.value;
    else if (p.name === 'DTEND') end ??= p.value;
    else if (p.name === 'RRULE') rules.push(p.value);
  }
  const s = start === null ? null : rawDateMs(start);
  if (!s) return false;
  const e = end === null ? { ms: s.ms + (s.isDate ? DAY_MS : 0), isDate: s.isDate } : rawDateMs(end);
  if (!e) return false;
  if (rules.length === 0) return e.ms < fromMs - DAY_MS;
  // A series: every rule must end (UNTIL, inclusive) with its last instance, event length included, clearly before the window.
  const span = Math.max(0, e.ms - s.ms);
  for (const rule of rules) {
    const until = /(?:^|;)UNTIL=([^;]+)/i.exec(rule);
    const u = until ? rawDateMs(until[1]) : null;
    if (!u) return false;
    if (u.ms + (u.isDate ? DAY_MS : 0) + span >= fromMs - 3 * DAY_MS) return false;
  }
  return true;
}

/** Parses one chunk of component lines on its own, so a bad line only affects that component. */
function parseChunk(lines: string[], name: string): ICAL.Component {
  const jcal = ICAL.parse(['BEGIN:VCALENDAR', 'VERSION:2.0', ...lines, 'END:VCALENDAR'].join('\r\n'));
  const root = new ICAL.Component(jcal);
  const sub = root.getFirstSubcomponent(name);
  if (!sub) throw new Error(`no ${name} in chunk`);
  return sub;
}

function stringValue(comp: ICAL.Component, prop: string): string | null {
  const v = comp.getFirstPropertyValue(prop);
  return typeof v === 'string' ? v.trim() : null;
}

function zoneOf(time: ICAL.Time, prop: ICAL.Property, ctx: Context): Zone {
  if (time.zone && time.zone.tzid === 'UTC') return { kind: 'utc' };
  const tzid = prop.getParameter('tzid');
  if (typeof tzid === 'string' && tzid !== '') {
    if (knownTimezone(tzid)) return { kind: 'iana', tz: tzid };
    const custom = ctx.vtimezones.get(tzid);
    if (custom) return { kind: 'vtz', zone: custom };
    if (ctx.droppedZones.has(tzid)) ctx.usedDroppedZone = true;
  }
  // Floating time, or a TZID nobody can resolve: read it in the business timezone.
  return { kind: 'iana', tz: ctx.fallbackTz };
}

const dayOf = (t: LocalDateTime) => daysFromCivil(t.y, t.mo, t.d);
const secondsOf = (t: LocalDateTime) => (t.h * 60 + t.mi) * 60 + t.s;
const isoDay = (day: number) => {
  const c = civilFromDays(day);
  return isoDate(c.y, c.m, c.d);
};

/** UTC instant (ms) of wall-clock fields read in `zone`. */
function wallToMs(t: LocalDateTime, zone: Zone): number {
  let ms: number;
  if (zone.kind === 'utc') {
    ms = dayOf(t) * DAY_MS + secondsOf(t) * 1000;
  } else if (zone.kind === 'iana') {
    ms = wallTimeToUtc(isoDate(t.y, t.mo, t.d), t.h * 60 + t.mi, zone.tz) + t.s * 1000;
  } else {
    ms = zoneWallToMs(zone.zone, t);
  }
  if (!Number.isFinite(ms)) throw new Error('unreadable date-time');
  return ms;
}

/** The wall-clock fields of a parsed date or date-time (a date has time 00:00:00). */
function localOf(t: ICAL.Time): LocalDateTime {
  return t.isDate ? { y: t.year, mo: t.month, d: t.day, h: 0, mi: 0, s: 0 } : { y: t.year, mo: t.month, d: t.day, h: t.hour, mi: t.minute, s: t.second };
}

/** UTC instant (ms) of a date-time value whose wall-clock fields are in `zone`. */
const toUtcMs = (t: ICAL.Time, zone: Zone) => wallToMs(localOf(t), zone);

function asTime(value: unknown): ICAL.Time {
  if (!(value instanceof ICAL.Time)) throw new Error('not a date or date-time');
  if (![value.year, value.month, value.day].every(Number.isFinite)) throw new Error('unreadable date');
  return value;
}

/** Key of an instance: `d<day>` for a date, `t<ms>` for a date-time instant (the same form for EXDATE and RECURRENCE-ID). */
const instanceKey = (t: ICAL.Time, zone: Zone) => (t.isDate ? `d${dayOf(localOf(t))}` : `t${toUtcMs(t, zone)}`);

/** The instant a series ends (inclusive), from its UNTIL, read the way RFC 5545 says: DATE and floating values in the event's zone. */
function untilInstant(until: ICAL.Time, zone: Zone): number {
  if (until.isDate) {
    const next = civilFromDays(dayOf(localOf(until)) + 1);
    return wallToMs({ y: next.y, mo: next.m, d: next.d, h: 0, mi: 0, s: 0 }, zone) - 1; // the whole local day counts
  }
  return toUtcMs(until, until.zone && until.zone.tzid === 'UTC' ? { kind: 'utc' } : zone);
}

function eventBlocks(prepared: PreparedEvent, overrideKeys: Set<string> | undefined, ctx: Context): EventResult {
  const { vevent, isOverride } = prepared;
  const blocks: ExternalBlock[] = [];

  const startProp = vevent.getFirstProperty('dtstart');
  if (!startProp) throw new Error('event has no DTSTART');
  const startTime = asTime(startProp.getFirstValue());
  const start = localOf(startTime);
  const zone = zoneOf(startTime, startProp, ctx);
  const isDate = startTime.isDate;

  // Length of the event: whole days for an all-day event, milliseconds otherwise.
  let days = 1;
  let durationMs = 0;
  const endProp = vevent.getFirstProperty('dtend');
  const durationProp = vevent.getFirstProperty('duration');
  if (isDate) {
    if (endProp) {
      days = dayOf(localOf(asTime(endProp.getFirstValue()))) - dayOf(start);
      if (days < 0) throw new Error('event ends before it starts');
    } else if (durationProp) {
      const dur = durationProp.getFirstValue() as ICAL.Duration;
      const seconds = dur.toSeconds();
      if (!Number.isFinite(seconds) || seconds < 0) throw new Error('unreadable duration');
      days = Math.ceil(seconds / 86400);
    }
    if (days < 1) days = 1; // DTSTART == DTEND on a date is not valid, but it still means that day
  } else {
    const startMs = wallToMs(start, zone);
    if (endProp) {
      const end = asTime(endProp.getFirstValue());
      durationMs = toUtcMs(end, zoneOf(end, endProp, ctx)) - startMs;
    } else if (durationProp) {
      const dur = durationProp.getFirstValue() as ICAL.Duration;
      durationMs = dur.toSeconds() * 1000;
    } else {
      return { blocks, capped: false }; // zero-length event: nothing to block
    }
    if (!Number.isFinite(durationMs) || durationMs < 0) throw new Error('event ends before it starts');
    if (durationMs === 0) return { blocks, capped: false };
  }
  const spanMs = isDate ? days * DAY_MS : durationMs;

  const rangeOf = (t: LocalDateTime, z: Zone): { s: number; e: number; key: string } => {
    if (isDate) {
      const day = dayOf(t);
      const s = wallTimeToUtc(isoDay(day), 0, ctx.fallbackTz);
      return { s, e: wallTimeToUtc(isoDay(day + days), 0, ctx.fallbackTz), key: `d${day}` };
    }
    const s = wallToMs(t, z);
    return { s, e: s + durationMs, key: `t${s}` };
  };
  const addIfInWindow = (t: LocalDateTime) => {
    const { s, e } = rangeOf(t, zone);
    if (s < ctx.toMs && e > ctx.fromMs) blocks.push({ startAt: new Date(s), endAt: new Date(e) });
  };

  const recurring = !isOverride && (vevent.hasProperty('rrule') || vevent.hasProperty('rdate'));
  if (!recurring) {
    addIfInWindow(start);
    return { blocks, capped: false };
  }

  const rules = vevent.getAllProperties('rrule');
  if (rules.length > 1) {
    addIfInWindow(start); // several RRULEs are not expanded; the master date is kept
    return { blocks, capped: true };
  }
  const rule = rules.length === 1 ? (rules[0].getFirstValue() as ICAL.Recur) : null;
  // RDATEs: extra instances, each in its own zone (a PERIOD value counts from its start, with the event's length).
  const rdates: { t: LocalDateTime; z: Zone }[] = [];
  for (const prop of vevent.getAllProperties('rdate')) {
    for (const v of prop.getValues()) {
      const t = asTime(v instanceof ICAL.Period ? v.start : v);
      rdates.push({ t: localOf(t), z: zoneOf(t, prop, ctx) });
    }
  }

  // UNTIL ends the rule's instances (not the RDATEs) at an instant read in the event's zone; all-day occurrences are whole
  // days of the business timezone (see rangeOf), so their cut-off day is read there too.
  const untilMs = rule?.until ? untilInstant(rule.until, isDate ? { kind: 'iana', tz: ctx.fallbackTz } : zone) : null;
  if (untilMs !== null && rdates.length === 0 && untilMs + spanMs <= ctx.fromMs) return { blocks, capped: false }; // ended before the window

  let parts: RuleParts | null = null;
  if (rule) {
    try {
      parts = recurrenceParts(rule, start);
    } catch (err) {
      if (!(err instanceof UnsupportedRecurrence)) throw err;
      addIfInWindow(start); // not expanded, but the master date is a real occurrence and is kept
      return { blocks, capped: true };
    }
  }
  if (ctx.scanLeft <= 0) {
    // The feed's expansion budget is spent: keep the one date every series is known to have, and report the rest.
    addIfInWindow(start);
    return { blocks, capped: true };
  }

  // EXDATE matches an instance by instant; a DATE value matches every instance on that day; and, as ical.js did, a value
  // not in UTC also matches an instance not in UTC by wall-clock time (an EXDATE written floating for a TZID series).
  const excluded = new Set<string>();
  for (const prop of vevent.getAllProperties('exdate')) {
    const exZone = zoneOf(asTime(prop.getFirstValue()), prop, ctx);
    for (const v of prop.getValues()) {
      const t = asTime(v);
      excluded.add(instanceKey(t, exZone));
      if (!t.isDate && exZone.kind !== 'utc') excluded.add(`w${dayOf(localOf(t))}:${secondsOf(localOf(t))}`);
    }
  }
  const isExcluded = (t: LocalDateTime, z: Zone, key: string) =>
    excluded.has(key) || excluded.has(`d${dayOf(t)}`) || (z.kind !== 'utc' && excluded.has(`w${dayOf(t)}:${secondsOf(t)}`));

  const seen = new Set<string>();
  /** Adds one instance if it is in the window; 'past' once instances of the rule can no longer reach it. */
  const consider = (t: LocalDateTime, z: Zone, fromRule: boolean): 'ok' | 'past' | 'full' => {
    // Cheap pre-filter on the wall-clock fields read as UTC (a zone is at most about a day away), so the Intl conversion
    // only runs for instances near the window.
    const naive = dayOf(t) * DAY_MS + (isDate ? 0 : secondsOf(t) * 1000);
    if (naive >= ctx.toMs + DAY_MS) return 'past';
    if (naive + spanMs < ctx.fromMs - DAY_MS) return 'ok';
    const { s, e, key } = rangeOf(t, z);
    if (s >= ctx.toMs || (fromRule && untilMs !== null && s > untilMs)) return 'past'; // an instance exactly at UNTIL is kept
    if (e <= ctx.fromMs || seen.has(key) || isExcluded(t, z, key) || overrideKeys?.has(key)) return 'ok';
    if (blocks.length >= MAX_OCCURRENCES_PER_EVENT) return 'full';
    seen.add(key);
    blocks.push({ startAt: new Date(s), endAt: new Date(e) });
    return 'ok';
  };

  const budget = Math.min(MAX_SCAN_PER_EVENT, ctx.scanLeft);
  const stats = { periods: 0 };
  let read = 0;
  let capped = false;
  try {
    // Without an RRULE the series is DTSTART plus the RDATEs. Occurrences come in order, so the first one past the
    // window (or UNTIL) ends the rule.
    const occurrences = parts
      ? expandOccurrences(start, parts, {
          fromDay: Math.floor((ctx.fromMs - DAY_MS - spanMs) / DAY_MS) - 1,
          toDay: Math.floor((ctx.toMs + DAY_MS) / DAY_MS) + 1,
          maxPeriods: budget,
          stats,
        })
      : [start];
    for (const occ of occurrences) {
      if (++read + stats.periods > budget) {
        capped = true;
        break;
      }
      const r = consider(occ, zone, true);
      if (r === 'past') break;
      if (r === 'full') {
        capped = true;
        break;
      }
    }
  } catch (err) {
    if (!(err instanceof RecurrenceLimitError)) throw err;
    capped = true;
  }
  for (const { t, z } of rdates) {
    read++;
    if (consider(t, z, false) === 'full') {
      capped = true;
      break;
    }
  }
  ctx.scanLeft -= read + stats.periods;
  return { blocks, capped };
}

/** Key of the instance an override replaces, from its RECURRENCE-ID (same form as `rangeOf` keys). */
function overrideKey(vevent: ICAL.Component, ctx: Context): string {
  const prop = vevent.getFirstProperty('recurrence-id');
  if (!prop) throw new Error('no RECURRENCE-ID');
  const t = asTime(prop.getFirstValue());
  return instanceKey(t, zoneOf(t, prop, ctx));
}

export async function parseIcalBlocks(icsText: string, opts: ParseIcalOptions): Promise<ParseIcalResult> {
  const chunks = splitFeed(typeof icsText === 'string' ? icsText : '');
  const deadline = performance.now() + (opts.deadlineMs ?? PARSE_DEADLINE_MS);
  let lastYield = performance.now();
  /** True when ~10 ms of work has passed since the event loop last had a turn (checked per event; the await only then). */
  const due = () => performance.now() - lastYield >= YIELD_EVERY_MS;
  const breathe = async () => {
    await yieldToLoop();
    lastYield = performance.now();
  };
  const late = () => performance.now() >= deadline;

  const ctx: Context = {
    fallbackTz: knownTimezone(opts.timezone) ? opts.timezone : 'UTC',
    vtimezones: new Map(),
    droppedZones: new Set(),
    usedDroppedZone: false,
    fromMs: opts.from.getTime(),
    toMs: opts.to.getTime(),
    scanLeft: MAX_SCAN_PER_FEED,
  };

  for (const lines of chunks.timezones) {
    if (due()) await breathe();
    if (late()) break; // the event loop below stops at once and counts what is left
    let comp: ICAL.Component;
    try {
      comp = parseChunk(lines, 'vtimezone');
    } catch {
      continue; // A broken VTIMEZONE only matters to events that use it, and those fall back to the business timezone.
    }
    const tzid = stringValue(comp, 'tzid');
    // A name Intl knows is always read with Intl, so its VTIMEZONE is never needed.
    if (!tzid || knownTimezone(tzid) || ctx.vtimezones.has(tzid)) continue;
    try {
      ctx.vtimezones.set(tzid, readVTimezone(comp));
      ctx.droppedZones.delete(tzid);
    } catch {
      // Refused (hostile or unusual shape) or unreadable: its events are read in the business timezone and counted as unsupported.
      ctx.droppedZones.add(tzid);
    }
  }

  let skipped = chunks.unterminated;
  let unsupported = 0;
  const prepared: PreparedEvent[] = [];
  const overrideKeys = new Map<string, Set<string>>();
  for (let i = 0; i < chunks.events.length; i++) {
    const lines = chunks.events[i];
    // Dropping a past event costs about a microsecond, so the clock (not free on every platform) is only read every 256 of them.
    const past = clearlyPast(lines, ctx.fromMs);
    if (!past || (i & 255) === 0) {
      if (due()) await breathe();
      if (late()) {
        // Out of time: nothing more is read; the events not read yet (here and below) are reported.
        return finish([], skipped, unsupported + (chunks.events.length - i - (past ? 1 : 0)) + prepared.length);
      }
    }
    if (past) continue;
    try {
      const vevent = parseChunk(lines, 'vevent');
      const uid = stringValue(vevent, 'uid');
      const recurrenceId = vevent.getFirstProperty('recurrence-id');
      const isOverride = recurrenceId !== null;
      if (recurrenceId && String(recurrenceId.getParameter('range') ?? '').toUpperCase() === 'THISANDFUTURE') {
        // "This and all later instances": applying it to one instance only would be wrong, so the override is left out
        // and the series stays as the master describes it.
        unsupported++;
        continue;
      }
      if (isOverride && uid) {
        // Registered whatever its status: a cancelled or free override still replaces the instance it points at.
        let keys = overrideKeys.get(uid);
        if (!keys) overrideKeys.set(uid, (keys = new Set()));
        keys.add(overrideKey(vevent, ctx));
      } else if (isOverride) {
        overrideKey(vevent, ctx); // validates; an override with no UID cannot be matched to a series
      }
      prepared.push({ vevent, uid, isOverride });
    } catch {
      skipped++;
    }
  }

  const blocks: ExternalBlock[] = [];
  for (let i = 0; i < prepared.length; i++) {
    // Out of time: the blocks found so far are kept and the events not read yet are reported.
    if (due()) await breathe();
    if (late()) return finish(blocks, skipped, unsupported + (prepared.length - i));
    const p = prepared[i];
    try {
      const status = stringValue(p.vevent, 'status');
      const transp = stringValue(p.vevent, 'transp');
      if (status?.toUpperCase() === 'CANCELLED' || transp?.toUpperCase() === 'TRANSPARENT') continue;
      ctx.usedDroppedZone = false;
      const result = eventBlocks(p, p.uid ? overrideKeys.get(p.uid) : undefined, ctx);
      blocks.push(...result.blocks);
      if (result.capped || ctx.usedDroppedZone) unsupported++;
    } catch (err) {
      if (err instanceof UnsupportedRecurrence) unsupported++;
      else skipped++;
    }
  }

  return finish(blocks, skipped, unsupported);
}

function finish(blocks: ExternalBlock[], skipped: number, unsupported: number): ParseIcalResult {
  blocks.sort((a, b) => a.startAt.getTime() - b.startAt.getTime() || a.endAt.getTime() - b.endAt.getTime());
  return { blocks, skipped, unsupported };
}

/**
 * Turns the text of an iCal feed (an owner's Google / Apple / Outlook calendar link) into busy blocks.
 *
 * - Only events that overlap the window [from, to) are returned, as half-open UTC ranges.
 * - Cancelled and "free" (TRANSP:TRANSPARENT) events do not block.
 * - Recurring events are expanded inside the window; EXDATE and RECURRENCE-ID overrides are honoured.
 * - One bad event never fails the feed: it is counted in `skipped`. A recurrence that is unsupported, unsafe to expand
 *   or cut short by a cap is counted in `unsupported` instead (see "Recurrence safety" below). Text that is not a calendar at all throws
 *   CalendarParseError, so the caller keeps the blocks it already has instead of treating it as an emptied calendar.
 *
 * Times are never converted by ical.js itself. It supplies the parsing and the recurrence arithmetic (which walks
 * wall-clock fields, so a weekly 10:00 stays 10:00 across a DST change); every wall-clock value is then turned into a
 * UTC instant with the same Intl offset method bookings use (`wallTimeToUtc`).
 */

import ICAL from 'ical.js';
import { knownTimezone, wallTimeToUtc } from '@/lib/appointments/time-range';
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
}

export interface ParseIcalResult {
  blocks: ExternalBlock[];
  /** Events that are malformed and could not be read (bad date, bad rule, cut off, no start). */
  skipped: number;
  /** Events dropped or only partly expanded because their recurrence is unsupported, unsafe or hit a cap. */
  unsupported: number;
}

/** Most blocks one recurring event may add inside the window. */
const MAX_OCCURRENCES_PER_EVENT = 1000;
/** Most occurrences the recurrence iterator may step through for one event (from its first date, before the window too). */
const MAX_SCAN_PER_EVENT = 10_000;
/** Most iterator steps for the whole feed, so many pathological events cannot add up to a hang. */
const MAX_SCAN_PER_FEED = 100_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** The recurrence cannot be expanded safely or at all; the event is counted in `unsupported`. */
class UnsupportedRecurrence extends Error {}

type Zone = { kind: 'utc' } | { kind: 'iana'; tz: string } | { kind: 'ical'; zone: ICAL.Timezone };

interface Context {
  /** Business timezone, always a name Intl accepts. */
  fallbackTz: string;
  /** VTIMEZONE blocks of the feed by TZID; only used for names Intl does not know (e.g. Outlook's Windows names). */
  vtimezones: Map<string, ICAL.Timezone>;
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
  const unfolded = text
    .replace(/^﻿/, '')
    .replace(/\r\n|\r|\n/g, '\n')
    .replace(/\n[ \t]/g, '');
  const lines = unfolded.split('\n').filter((l) => l.trim() !== '');

  const events: string[][] = [];
  const timezones: string[][] = [];
  let unterminated = 0;
  let sawBegin = false;
  let sawEnd = false;
  let current: { kind: 'event' | 'timezone' | 'other'; lines: string[]; depth: number } | null = null;

  for (const line of lines) {
    const begin = /^BEGIN:(.*)$/i.exec(line);
    const end = /^END:(.*)$/i.exec(line);
    const name = (begin?.[1] ?? end?.[1] ?? '').trim().toUpperCase();

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
    if (custom) return { kind: 'ical', zone: custom };
  }
  // Floating time, or a TZID nobody can resolve: read it in the business timezone.
  return { kind: 'iana', tz: ctx.fallbackTz };
}

/** UTC instant (ms) of wall-clock fields read in `zone`. */
function wallToMs(y: number, mo: number, d: number, h: number, mi: number, s: number, zone: Zone): number {
  let ms: number;
  if (zone.kind === 'utc') {
    ms = Date.UTC(y, mo - 1, d, h, mi, s);
  } else if (zone.kind === 'iana') {
    ms = wallTimeToUtc(isoDate(y, mo, d), h * 60 + mi, zone.tz) + s * 1000;
  } else {
    const local = new ICAL.Time({ year: y, month: mo, day: d, hour: h, minute: mi, second: s, isDate: false }, zone.zone);
    ms = local.toUnixTime() * 1000;
  }
  if (!Number.isFinite(ms)) throw new Error('unreadable date-time');
  return ms;
}

/** UTC instant (ms) of a date-time value whose wall-clock fields are in `zone`. */
function toUtcMs(t: ICAL.Time, zone: Zone): number {
  return wallToMs(t.year, t.month, t.day, t.hour, t.minute, t.second, zone);
}

function asTime(value: unknown): ICAL.Time {
  if (!(value instanceof ICAL.Time)) throw new Error('not a date or date-time');
  if (![value.year, value.month, value.day].every(Number.isFinite)) throw new Error('unreadable date');
  return value;
}

/** Whole days from date `a` to date `b` (calendar arithmetic on the fields, no timezone involved). */
function daysBetween(a: ICAL.Time, b: ICAL.Time): number {
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / DAY_MS);
}

/** Weekday numbers (0 = Sunday) named in a BYDAY list, and the ordinals of entries such as 1MO or -1FR. */
function weekdaysOf(byDay: unknown[]): { codes: Set<number>; ordinals: number[] } {
  const codes = new Set<number>();
  const ordinals: number[] = [];
  for (const entry of byDay) {
    const m = /^([+-]?\d+)?([A-Za-z]{2})$/.exec(String(entry).trim());
    if (!m) throw new UnsupportedRecurrence('unreadable BYDAY');
    if (m[1]) ordinals.push(Number(m[1]));
    const idx = WEEKDAYS.indexOf(m[2].toUpperCase());
    if (idx < 0) throw new UnsupportedRecurrence('unreadable BYDAY');
    codes.add(idx);
  }
  return { codes, ordinals };
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
 * Recurrence safety. ical.js loops inside a single next() call, with no guard, for rules whose parts can never (or only
 * very rarely) match, and the code is synchronous, so a deadline between calls cannot help. Instead of trying to spot
 * every unsatisfiable rule, only a short allowlist of shapes is expanded, decided from the rule's parts alone in O(1)
 * and before any ical.js iteration. DAILY and WEEKLY shapes always match within a bounded number of steps; the MONTHLY
 * and YEARLY shapes are ones ical.js guards itself. Everything else is unsupported (HOURLY, MINUTELY, SECONDLY, a BY
 * part outside the list, long lists, large INTERVALs).
 *  - COUNT, UNTIL and WKST are always allowed; INTERVAL has a per-FREQ maximum.
 *  - DAILY: no BY part, or BYDAY of plain weekdays (with INTERVAL a multiple of 7, DTSTART's weekday must be among them).
 *  - WEEKLY: no BY part, or BYDAY of plain weekdays.
 *  - MONTHLY: no BY part; or BYMONTHDAY alone; or BYDAY (ordinals allowed) with optional BYSETPOS.
 *  - YEARLY: no BY part; or BYMONTH with BYMONTHDAY; or BYMONTH with BYDAY (ordinals allowed).
 */
function checkRule(rule: ICAL.Recur, start: ICAL.Time): void {
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
  const byDay = () => weekdaysOf(rule.getComponent('BYDAY'));

  if (freq === 'DAILY' || freq === 'WEEKLY') {
    only('BYDAY');
    if (!has('BYDAY')) return;
    const { codes, ordinals } = byDay();
    if (ordinals.length > 0) throw new UnsupportedRecurrence('ordinal BYDAY needs MONTHLY or YEARLY');
    // A DAILY rule stepping a whole number of weeks stays on DTSTART's weekday for ever.
    const startDow = new Date(Date.UTC(start.year, start.month - 1, start.day)).getUTCDay();
    if (freq === 'DAILY' && interval % 7 === 0 && !codes.has(startDow)) throw new UnsupportedRecurrence('BYDAY can never be reached');
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
    signedInts(byDay().ordinals, 5, 'BYDAY ordinal');
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
  signedInts(byDay().ordinals, 5, 'BYDAY ordinal');
}

/** The instant a series ends (inclusive), from its UNTIL, read the way RFC 5545 says: DATE and floating values in the event's zone. */
function untilInstant(until: ICAL.Time, zone: Zone): number {
  if (until.isDate) {
    const next = new Date(Date.UTC(until.year, until.month - 1, until.day + 1));
    return wallToMs(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 0, 0, 0, zone) - 1; // the whole local day counts
  }
  if (until.zone && until.zone.tzid === 'UTC') return Date.UTC(until.year, until.month - 1, until.day, until.hour, until.minute, until.second);
  return toUtcMs(until, zone);
}

/**
 * For a long-running DAILY or WEEKLY series with no COUNT and no BY parts that could be missed (WEEKLY may carry a
 * BYDAY holding DTSTART's weekday), the occurrences far before the window can be skipped by starting the iteration a whole
 * number of INTERVAL steps later: that is the same sequence. Anything else iterates from DTSTART.
 */
function fastForwardStart(start: ICAL.Time, rule: ICAL.Recur | null, hasRdate: boolean, spanMs: number, ctx: Context): ICAL.Time {
  if (!rule || hasRdate || rule.count) return start;
  const freq = String(rule.freq);
  if (freq !== 'DAILY' && freq !== 'WEEKLY') return start;
  const interval = Number(rule.interval);
  if (!Number.isInteger(interval) || interval < 1) return start;
  const parts = Object.keys(rule.parts);
  if (freq === 'DAILY' && parts.length > 0) return start;
  if (freq === 'WEEKLY') {
    if (parts.some((p) => p !== 'BYDAY')) return start;
    const { codes, ordinals } = weekdaysOf(rule.getComponent('BYDAY'));
    const startDow = new Date(Date.UTC(start.year, start.month - 1, start.day)).getUTCDay();
    if (ordinals.length > 0 || (codes.size > 0 && !codes.has(startDow))) return start;
  }
  const stepDays = interval * (freq === 'DAILY' ? 1 : 7);
  const startNaive = Date.UTC(start.year, start.month - 1, start.day, start.hour, start.minute, start.second);
  const k = Math.floor((ctx.fromMs - 3 * DAY_MS - spanMs - startNaive) / (stepDays * DAY_MS));
  if (!Number.isFinite(k) || k <= 0) return start;
  const moved = new Date(Date.UTC(start.year, start.month - 1, start.day + k * stepDays));
  return new ICAL.Time(
    { year: moved.getUTCFullYear(), month: moved.getUTCMonth() + 1, day: moved.getUTCDate(), hour: start.hour, minute: start.minute, second: start.second, isDate: start.isDate },
    start.zone,
  );
}

function eventBlocks(prepared: PreparedEvent, overrideKeys: Set<string> | undefined, ctx: Context): EventResult {
  const { vevent, isOverride } = prepared;
  const blocks: ExternalBlock[] = [];

  const startProp = vevent.getFirstProperty('dtstart');
  if (!startProp) throw new Error('event has no DTSTART');
  const start = asTime(startProp.getFirstValue());
  const zone = zoneOf(start, startProp, ctx);
  const isDate = start.isDate;

  // Length of the event: whole days for an all-day event, milliseconds otherwise.
  let days = 1;
  let durationMs = 0;
  const endProp = vevent.getFirstProperty('dtend');
  const durationProp = vevent.getFirstProperty('duration');
  if (isDate) {
    if (endProp) {
      days = daysBetween(start, asTime(endProp.getFirstValue()));
      if (days < 0) throw new Error('event ends before it starts');
    } else if (durationProp) {
      const dur = durationProp.getFirstValue() as ICAL.Duration;
      const seconds = dur.toSeconds();
      if (!Number.isFinite(seconds) || seconds < 0) throw new Error('unreadable duration');
      days = Math.ceil(seconds / 86400);
    }
    if (days < 1) days = 1; // DTSTART == DTEND on a date is not valid, but it still means that day
  } else {
    const startMs = toUtcMs(start, zone);
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

  const rangeOf = (occ: ICAL.Time): { s: number; e: number; key: string } => {
    if (isDate) {
      const s = wallTimeToUtc(isoDate(occ.year, occ.month, occ.day), 0, ctx.fallbackTz);
      const endDay = new Date(Date.UTC(occ.year, occ.month - 1, occ.day + days));
      const e = wallTimeToUtc(isoDate(endDay.getUTCFullYear(), endDay.getUTCMonth() + 1, endDay.getUTCDate()), 0, ctx.fallbackTz);
      return { s, e, key: `d${Date.UTC(occ.year, occ.month - 1, occ.day)}` };
    }
    const s = toUtcMs(occ, zone);
    return { s, e: s + durationMs, key: `t${s}` };
  };
  const addIfInWindow = (occ: ICAL.Time) => {
    const { s, e } = rangeOf(occ);
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
  const hasRdate = vevent.hasProperty('rdate');

  // UNTIL: ical.js compares it with DTSTART's wall-clock fields as if both were in one zone, which drops the last
  // instance east of UTC (and keeps a wrong one west of it) for a TZID series. Read it here and stop ical.js comparing.
  let untilMs: number | null = null;
  if (rule && rule.until && !hasRdate) {
    // All-day occurrences are whole days of the business timezone (see rangeOf), so the cut-off day is read there too.
    untilMs = untilInstant(rule.until, isDate ? { kind: 'iana', tz: ctx.fallbackTz } : zone);
    rule.until = null;
  }
  if (untilMs !== null && untilMs + spanMs <= ctx.fromMs) return { blocks, capped: false }; // ended before the window

  if (rule) {
    try {
      checkRule(rule, start);
    } catch (err) {
      if (!(err instanceof UnsupportedRecurrence)) throw err;
      // Not expanded, but the master date is a real occurrence and is kept.
      addIfInWindow(start);
      return { blocks, capped: true };
    }
  }

  if (ctx.scanLeft <= 0) {
    // The feed's expansion budget is spent: keep the one date every series is known to have, and report the rest.
    addIfInWindow(start);
    return { blocks, capped: true };
  }

  // Our own EXDATE check on top of ical.js's, so an EXDATE written in another zone form than DTSTART still matches.
  const excluded = new Set<string>();
  for (const prop of vevent.getAllProperties('exdate')) {
    const exZone = zoneOf(asTime(prop.getFirstValue()), prop, ctx);
    for (const v of prop.getValues()) {
      const t = asTime(v);
      excluded.add(t.isDate ? `d${Date.UTC(t.year, t.month - 1, t.day)}` : `t${toUtcMs(t, exZone)}`);
    }
  }

  const expansion = new ICAL.RecurExpansion({ component: vevent, dtstart: fastForwardStart(start, rule, hasRdate, spanMs, ctx) });
  let scanned = 0;
  let capped = false;
  for (;;) {
    const occ = expansion.next();
    if (!occ) break;
    if (++scanned > MAX_SCAN_PER_EVENT || --ctx.scanLeft < 0) {
      capped = true;
      break;
    }
    // Cheap pre-filter on the wall-clock fields read as UTC (a zone is at most about a day away), so the Intl
    // conversion only runs for occurrences near the window.
    const naive = isDate
      ? Date.UTC(occ.year, occ.month - 1, occ.day)
      : Date.UTC(occ.year, occ.month - 1, occ.day, occ.hour, occ.minute, occ.second);
    if (naive >= ctx.toMs + DAY_MS) break; // occurrences come in order: everything after this is past the window
    if (naive + spanMs < ctx.fromMs - DAY_MS) continue;
    const { s, e, key } = rangeOf(occ);
    if (s >= ctx.toMs) break;
    if (untilMs !== null && s > untilMs) break; // an instance starting exactly at UNTIL is still part of the series
    if (excluded.has(key) || overrideKeys?.has(key)) continue;
    if (e <= ctx.fromMs) continue;
    if (blocks.length >= MAX_OCCURRENCES_PER_EVENT) {
      capped = true;
      break;
    }
    blocks.push({ startAt: new Date(s), endAt: new Date(e) });
  }
  return { blocks, capped };
}

/** Key of the instance an override replaces, from its RECURRENCE-ID (same form as `rangeOf` keys). */
function overrideKey(vevent: ICAL.Component, ctx: Context): string {
  const prop = vevent.getFirstProperty('recurrence-id');
  if (!prop) throw new Error('no RECURRENCE-ID');
  const t = asTime(prop.getFirstValue());
  return t.isDate ? `d${Date.UTC(t.year, t.month - 1, t.day)}` : `t${toUtcMs(t, zoneOf(t, prop, ctx))}`;
}

export function parseIcalBlocks(icsText: string, opts: ParseIcalOptions): ParseIcalResult {
  const chunks = splitFeed(typeof icsText === 'string' ? icsText : '');

  const ctx: Context = {
    fallbackTz: knownTimezone(opts.timezone) ? opts.timezone : 'UTC',
    vtimezones: new Map(),
    fromMs: opts.from.getTime(),
    toMs: opts.to.getTime(),
    scanLeft: MAX_SCAN_PER_FEED,
  };

  for (const lines of chunks.timezones) {
    try {
      const zone = new ICAL.Timezone(parseChunk(lines, 'vtimezone'));
      if (zone.tzid) ctx.vtimezones.set(zone.tzid, zone);
    } catch {
      // A broken VTIMEZONE only matters to events that use it, and those fall back to the business timezone.
    }
  }

  let skipped = chunks.unterminated;
  let unsupported = 0;
  const prepared: PreparedEvent[] = [];
  const overrideKeys = new Map<string, Set<string>>();
  for (const lines of chunks.events) {
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
  for (const p of prepared) {
    try {
      const status = stringValue(p.vevent, 'status');
      const transp = stringValue(p.vevent, 'transp');
      if (status?.toUpperCase() === 'CANCELLED' || transp?.toUpperCase() === 'TRANSPARENT') continue;
      const result = eventBlocks(p, p.uid ? overrideKeys.get(p.uid) : undefined, ctx);
      blocks.push(...result.blocks);
      if (result.capped) unsupported++;
    } catch (err) {
      if (err instanceof UnsupportedRecurrence) unsupported++;
      else skipped++;
    }
  }

  blocks.sort((a, b) => a.startAt.getTime() - b.startAt.getTime() || a.endAt.getTime() - b.endAt.getTime());
  return { blocks, skipped, unsupported };
}

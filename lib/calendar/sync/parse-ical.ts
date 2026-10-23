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
 * ical.js only parses the text. Recurrences are expanded by `expandOccurrences` (expand-rrule.ts), which works on
 * wall-clock fields, so a weekly 10:00 stays 10:00 across a DST change, and whose cost does not grow with the age of the
 * series. Times are never converted by ical.js: every wall-clock value near the window is turned into a UTC instant with
 * the same Intl offset method bookings use (`wallTimeToUtc`).
 */

import ICAL from 'ical.js';
import { knownTimezone, wallTimeToUtc } from '@/lib/appointments/time-range';
import { civilFromDays, daysFromCivil, expandOccurrences, RecurrenceLimitError, type LocalDateTime, type RuleParts } from './expand-rrule';
import { recurrenceParts, UnsupportedRecurrence } from './recurrence-rule';
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
/**
 * Most expansion work for one event: periods scanned plus occurrences read. A rule without COUNT starts next to the
 * window, so this only binds a COUNT rule, which is counted from its first date (a daily one reaches about 27 years).
 */
const MAX_SCAN_PER_EVENT = 20_000;
/** Most expansion work for the whole feed, so many long series cannot add up to a long block of the event loop. */
const MAX_SCAN_PER_FEED = 100_000;
const DAY_MS = 24 * 60 * 60 * 1000;

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
    const local = new ICAL.Time({ year: t.y, month: t.mo, day: t.d, hour: t.h, minute: t.mi, second: t.s, isDate: false }, zone.zone);
    ms = local.toUnixTime() * 1000;
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

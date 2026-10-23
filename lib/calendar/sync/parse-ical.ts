/**
 * Turns the text of an iCal feed (an owner's Google / Apple / Outlook calendar link) into busy blocks.
 *
 * - Only events that overlap the window [from, to) are returned, as half-open UTC ranges.
 * - Cancelled and "free" (TRANSP:TRANSPARENT) events do not block.
 * - Recurring events are expanded inside the window; EXDATE and RECURRENCE-ID overrides are honoured.
 * - One bad event never fails the feed: it is counted in `skipped`. Text that is not a calendar at all throws
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
  /** Events that could not be read (or were only partly expanded). */
  skipped: number;
}

/** Most blocks one recurring event may add inside the window. */
const MAX_OCCURRENCES_PER_EVENT = 1000;
/** Most occurrences the recurrence iterator may step through for one event (from its first date, before the window too). */
const MAX_SCAN_PER_EVENT = 10_000;
/** Most iterator steps for the whole feed, so many pathological events cannot add up to a hang. */
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

/** UTC instant (ms) of a date-time value whose wall-clock fields are in `zone`. */
function toUtcMs(t: ICAL.Time, zone: Zone): number {
  let ms: number;
  if (zone.kind === 'utc') {
    ms = Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute, t.second);
  } else if (zone.kind === 'iana') {
    ms = wallTimeToUtc(isoDate(t.year, t.month, t.day), t.hour * 60 + t.minute, zone.tz) + t.second * 1000;
  } else {
    const local = new ICAL.Time({ year: t.year, month: t.month, day: t.day, hour: t.hour, minute: t.minute, second: t.second, isDate: false }, zone.zone);
    ms = local.toUnixTime() * 1000;
  }
  if (!Number.isFinite(ms)) throw new Error('unreadable date-time');
  return ms;
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

  const recurring = !isOverride && (vevent.hasProperty('rrule') || vevent.hasProperty('rdate'));
  if (!recurring) {
    const { s, e } = rangeOf(start);
    if (s < ctx.toMs && e > ctx.fromMs) blocks.push({ startAt: new Date(s), endAt: new Date(e) });
    return { blocks, capped: false };
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

  const expansion = new ICAL.RecurExpansion({ component: vevent, dtstart: start });
  let scanned = 0;
  let capped = false;
  for (;;) {
    const occ = expansion.next();
    if (!occ) break;
    if (++scanned > MAX_SCAN_PER_EVENT || --ctx.scanLeft < 0) {
      capped = true;
      break;
    }
    const { s, e, key } = rangeOf(occ);
    if (s >= ctx.toMs) break; // occurrences come in order: everything after this is past the window
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
  const prepared: PreparedEvent[] = [];
  const overrideKeys = new Map<string, Set<string>>();
  for (const lines of chunks.events) {
    try {
      const vevent = parseChunk(lines, 'vevent');
      const uid = stringValue(vevent, 'uid');
      const isOverride = vevent.hasProperty('recurrence-id');
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
      if (ctx.scanLeft < 0) {
        skipped++;
        continue;
      }
      const result = eventBlocks(p, p.uid ? overrideKeys.get(p.uid) : undefined, ctx);
      blocks.push(...result.blocks);
      if (result.capped) skipped++;
    } catch {
      skipped++;
    }
  }

  blocks.sort((a, b) => a.startAt.getTime() - b.startAt.getTime() || a.endAt.getTime() - b.endAt.getTime());
  return { blocks, skipped };
}

import { describe, expect, it } from 'vitest';
import { CalendarParseError, parseIcalBlocks } from './parse-ical';

const SE = 'Europe/Stockholm';
const HOUR = 60 * 60 * 1000;

const WIDE = { from: new Date('2026-01-01T00:00:00Z'), to: new Date('2027-01-01T00:00:00Z') };

/** Wraps VEVENT bodies (without BEGIN/END) in a calendar, joined with CRLF like a real feed. */
function cal(events: string[], extra: string[] = []): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//test//EN', ...extra];
  for (const e of events) lines.push('BEGIN:VEVENT', ...e.trim().split('\n').map((l) => l.trim()), 'END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

const STOCKHOLM_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Stockholm',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

const WINDOWS_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:W. Europe Standard Time',
  'BEGIN:STANDARD',
  'DTSTART:16011028T030000',
  'RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=10',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'END:STANDARD',
  'BEGIN:DAYLIGHT',
  'DTSTART:16010325T020000',
  'RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=3',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'END:DAYLIGHT',
  'END:VTIMEZONE',
];

const iso = (b: { startAt: Date; endAt: Date }) => [b.startAt.toISOString(), b.endAt.toISOString()];

describe('parseIcalBlocks: timed events', () => {
  it('reads a UTC event as is', () => {
    const ics = cal([`UID:a
DTSTART:20260610T090000Z
DTEND:20260610T100000Z
SUMMARY:Call`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
  });

  it('honours a TZID across the Stockholm DST change, without a VTIMEZONE block', () => {
    const ics = cal([
      `UID:before
DTSTART;TZID=Europe/Stockholm:20260328T100000
DTEND;TZID=Europe/Stockholm:20260328T110000`,
      `UID:after
DTSTART;TZID=Europe/Stockholm:20260330T100000
DTEND;TZID=Europe/Stockholm:20260330T110000`,
      `UID:across
DTSTART;TZID=Europe/Stockholm:20260329T010000
DTEND;TZID=Europe/Stockholm:20260329T040000`,
    ]);
    const r = parseIcalBlocks(ics, { timezone: 'UTC', ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-03-28T09:00:00.000Z', '2026-03-28T10:00:00.000Z'], // CET, +01:00
      ['2026-03-29T00:00:00.000Z', '2026-03-29T02:00:00.000Z'], // 3 wall-clock hours, 2 real hours
      ['2026-03-30T08:00:00.000Z', '2026-03-30T09:00:00.000Z'], // CEST, +02:00
    ]);
  });

  it('gives the same answer with a VTIMEZONE block', () => {
    const ics = cal(
      [
        `UID:before
DTSTART;TZID=Europe/Stockholm:20260328T100000
DTEND;TZID=Europe/Stockholm:20260328T110000`,
        `UID:across
DTSTART;TZID=Europe/Stockholm:20260329T010000
DTEND;TZID=Europe/Stockholm:20260329T040000`,
        `UID:after
DTSTART;TZID=Europe/Stockholm:20260330T100000
DTEND;TZID=Europe/Stockholm:20260330T110000`,
      ],
      STOCKHOLM_VTIMEZONE,
    );
    // Put the VTIMEZONE first like real feeds do: cal() already places extra lines before the events.
    const r = parseIcalBlocks(ics, { timezone: 'UTC', ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-03-28T09:00:00.000Z', '2026-03-28T10:00:00.000Z'],
      ['2026-03-29T00:00:00.000Z', '2026-03-29T02:00:00.000Z'],
      ['2026-03-30T08:00:00.000Z', '2026-03-30T09:00:00.000Z'],
    ]);
  });

  it('resolves a non-IANA TZID through its VTIMEZONE block', () => {
    const ics = cal(
      [
        `UID:w
DTSTART;TZID=W. Europe Standard Time:20260701T100000
DTEND;TZID=W. Europe Standard Time:20260701T113000`,
        `UID:w2
DTSTART;TZID="W. Europe Standard Time":20261201T100000
DTEND;TZID="W. Europe Standard Time":20261201T110000`,
      ],
      WINDOWS_VTIMEZONE,
    );
    const r = parseIcalBlocks(ics, { timezone: 'America/New_York', ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-07-01T08:00:00.000Z', '2026-07-01T09:30:00.000Z'],
      ['2026-12-01T09:00:00.000Z', '2026-12-01T10:00:00.000Z'],
    ]);
  });

  it('falls back to the calendar timezone for an unknown TZID and still counts the event', () => {
    const ics = cal([`UID:x
DTSTART;TZID=Mars/Olympus_Mons:20260701T100000
DTEND;TZID=Mars/Olympus_Mons:20260701T110000`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z']]);
  });

  it('reads a floating time in the calendar timezone', () => {
    const ics = cal([`UID:f
DTSTART:20260701T100000
DTEND:20260701T110000`]);
    const ny = parseIcalBlocks(ics, { timezone: 'America/New_York', ...WIDE });
    expect(ny.blocks.map(iso)).toEqual([['2026-07-01T14:00:00.000Z', '2026-07-01T15:00:00.000Z']]);
    const se = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(se.blocks.map(iso)).toEqual([['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z']]);
  });

  it('uses DURATION when there is no DTEND', () => {
    const ics = cal([`UID:d
DTSTART:20260610T090000Z
DURATION:PT90M`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:30:00.000Z']]);
  });

  it('silently skips a timed event with no end (zero length) without counting it', () => {
    const ics = cal([`UID:z
DTSTART:20260610T090000Z`]);
    expect(parseIcalBlocks(ics, { timezone: SE, ...WIDE })).toEqual({ blocks: [], skipped: 0, unsupported: 0 });
  });

  it('reads folded lines', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'UID:fold',
      'SUMMARY:A very long title that the producer had to fold onto the next li',
      ' ne and then once more onto a third',
      '\t line',
      'DTSTART:2026061',
      ' 0T090000Z',
      'DTEND:20260610T1000',
      ' 00Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
  });

  it('accepts bare LF line endings', () => {
    const ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:lf\nDTSTART:20260610T090000Z\nDTEND:20260610T100000Z\nEND:VEVENT\nEND:VCALENDAR\n';
    expect(parseIcalBlocks(ics, { timezone: SE, ...WIDE }).blocks).toHaveLength(1);
  });

  it('ignores an alarm nested inside an event', () => {
    const ics = cal([`UID:alarm
DTSTART:20260610T090000Z
DTEND:20260610T100000Z
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT15M
DESCRIPTION:Reminder
END:VALARM`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks).toHaveLength(1);
  });
});

describe('parseIcalBlocks: all-day events', () => {
  it('blocks the whole local day, not a minute', () => {
    const ics = cal([`UID:day
DTSTART;VALUE=DATE:20260710
DTEND;VALUE=DATE:20260711`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-07-09T22:00:00.000Z', '2026-07-10T22:00:00.000Z']]);
  });

  it('treats an all-day event with no DTEND as one day', () => {
    const ics = cal([`UID:day
DTSTART;VALUE=DATE:20260710`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-07-09T22:00:00.000Z', '2026-07-10T22:00:00.000Z']]);
  });

  it('blocks two local days for a two-day event (DTEND is exclusive)', () => {
    const ics = cal([`UID:two
DTSTART;VALUE=DATE:20260710
DTEND;VALUE=DATE:20260712`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-07-09T22:00:00.000Z', '2026-07-11T22:00:00.000Z']]);
  });

  it('follows the local day length on a DST change day', () => {
    const ics = cal([`UID:dst
DTSTART;VALUE=DATE:20260329
DTEND;VALUE=DATE:20260330`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-03-28T23:00:00.000Z', '2026-03-29T22:00:00.000Z']]);
    expect(r.blocks[0].endAt.getTime() - r.blocks[0].startAt.getTime()).toBe(23 * HOUR);
  });

  it('uses UTC days when the calendar timezone is unknown', () => {
    const ics = cal([`UID:day
DTSTART;VALUE=DATE:20260710`]);
    const r = parseIcalBlocks(ics, { timezone: 'Nowhere/Land', ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-07-10T00:00:00.000Z', '2026-07-11T00:00:00.000Z']]);
  });
});

describe('parseIcalBlocks: status and transparency', () => {
  it('ignores cancelled and transparent (free) events, keeps tentative and opaque ones', () => {
    const ics = cal([
      `UID:cancelled
DTSTART:20260610T090000Z
DTEND:20260610T100000Z
STATUS:CANCELLED`,
      `UID:free
DTSTART:20260611T090000Z
DTEND:20260611T100000Z
TRANSP:TRANSPARENT`,
      `UID:tentative
DTSTART:20260612T090000Z
DTEND:20260612T100000Z
STATUS:TENTATIVE
TRANSP:OPAQUE`,
    ]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-06-12T09:00:00.000Z', '2026-06-12T10:00:00.000Z']]);
  });
});

describe('parseIcalBlocks: recurring events', () => {
  const window = { from: new Date('2026-06-01T00:00:00Z'), to: new Date('2026-07-01T00:00:00Z') };

  it('expands a weekly event within the window, honouring EXDATE and overridden instances', () => {
    const ics = cal([
      // The overrides come first on purpose: order must not matter.
      `UID:series
RECURRENCE-ID:20260622T090000Z
DTSTART:20260622T130000Z
DTEND:20260622T140000Z
SUMMARY:Moved`,
      `UID:series
RECURRENCE-ID:20260629T090000Z
DTSTART:20260629T090000Z
DTEND:20260629T100000Z
STATUS:CANCELLED`,
      `UID:series
DTSTART:20260601T090000Z
DTEND:20260601T100000Z
RRULE:FREQ=WEEKLY
EXDATE:20260615T090000Z`,
    ]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z'],
      ['2026-06-08T09:00:00.000Z', '2026-06-08T10:00:00.000Z'],
      // 06-15 excluded
      ['2026-06-22T13:00:00.000Z', '2026-06-22T14:00:00.000Z'], // override uses its own times
      // 06-29 override is cancelled: no block
    ]);
  });

  it('applies an EXDATE written in another form than DTSTART', () => {
    const ics = cal([`UID:s
DTSTART;TZID=Europe/Stockholm:20260601T110000
DTEND;TZID=Europe/Stockholm:20260601T120000
RRULE:FREQ=WEEKLY;COUNT=3
EXDATE:20260608T090000Z`]);
    const r = parseIcalBlocks(ics, { timezone: 'UTC', ...window });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z'],
      ['2026-06-15T09:00:00.000Z', '2026-06-15T10:00:00.000Z'],
    ]);
  });

  it('keeps the local wall time of a TZID series across the DST change', () => {
    const ics = cal([`UID:s
DTSTART;TZID=Europe/Stockholm:20260323T100000
DTEND;TZID=Europe/Stockholm:20260323T110000
RRULE:FREQ=WEEKLY;COUNT=3`]);
    const r = parseIcalBlocks(ics, { timezone: 'UTC', ...WIDE });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-03-23T09:00:00.000Z', '2026-03-23T10:00:00.000Z'],
      ['2026-03-30T08:00:00.000Z', '2026-03-30T09:00:00.000Z'],
      ['2026-04-06T08:00:00.000Z', '2026-04-06T09:00:00.000Z'],
    ]);
  });

  it('expands a recurring all-day event into local days', () => {
    const ics = cal([`UID:s
DTSTART;VALUE=DATE:20260601
DTEND;VALUE=DATE:20260603
RRULE:FREQ=WEEKLY;COUNT=2`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-05-31T22:00:00.000Z', '2026-06-02T22:00:00.000Z'],
      ['2026-06-07T22:00:00.000Z', '2026-06-09T22:00:00.000Z'],
    ]);
  });

  it('treats an override with no master as a plain event', () => {
    const ics = cal([`UID:orphan
RECURRENCE-ID:20260622T090000Z
DTSTART:20260622T130000Z
DTEND:20260622T140000Z`]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.blocks.map(iso)).toEqual([['2026-06-22T13:00:00.000Z', '2026-06-22T14:00:00.000Z']]);
  });

  it('includes an override moved into the window from an instance outside it', () => {
    const ics = cal([
      `UID:series
DTSTART:20260525T090000Z
DTEND:20260525T100000Z
RRULE:FREQ=WEEKLY;COUNT=2`,
      `UID:series
RECURRENCE-ID:20260601T090000Z
DTSTART:20260610T090000Z
DTEND:20260610T100000Z`,
    ]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
  });

  it('caps expansion per event and reports the event as unsupported', () => {
    const ics = cal([`UID:daily
DTSTART:20260101T090000Z
DTEND:20260101T093000Z
RRULE:FREQ=DAILY`]);
    const r = parseIcalBlocks(ics, { timezone: SE, from: new Date('2026-01-01T00:00:00Z'), to: new Date('2031-01-01T00:00:00Z') });
    expect(r.blocks).toHaveLength(1000);
    expect(r.skipped).toBe(0);
    expect(r.unsupported).toBe(1);
    expect(r.blocks[0].startAt.toISOString()).toBe('2026-01-01T09:00:00.000Z');
  });

  it('gives up on a rule that needs endless scanning before the window, quickly', () => {
    const ics = cal([`UID:hourly
DTSTART:20100101T090000Z
DTEND:20100101T093000Z
RRULE:FREQ=HOURLY`]);
    const t0 = Date.now();
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r).toEqual({ blocks: [], skipped: 0, unsupported: 1 });
    expect(Date.now() - t0).toBeLessThan(5000);
  });

  it('reaches a window far from the start of a long-running daily series', () => {
    const ics = cal([`UID:old
DTSTART:20220101T090000Z
DTEND:20220101T093000Z
RRULE:FREQ=DAILY`]);
    const r = parseIcalBlocks(ics, { timezone: SE, from: new Date('2026-06-10T00:00:00Z'), to: new Date('2026-06-12T00:00:00Z') });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-10T09:00:00.000Z', '2026-06-10T09:30:00.000Z'],
      ['2026-06-11T09:00:00.000Z', '2026-06-11T09:30:00.000Z'],
    ]);
  });
});

describe('parseIcalBlocks: window', () => {
  const window = { from: new Date('2026-06-10T00:00:00Z'), to: new Date('2026-06-20T00:00:00Z') };

  it('keeps only events that overlap [from, to)', () => {
    const ics = cal([
      `UID:before
DTSTART:20260601T090000Z
DTEND:20260601T100000Z`,
      `UID:ends-at-from
DTSTART:20260609T230000Z
DTEND:20260610T000000Z`,
      `UID:straddles-from
DTSTART:20260609T233000Z
DTEND:20260610T003000Z`,
      `UID:inside
DTSTART:20260615T090000Z
DTEND:20260615T100000Z`,
      `UID:straddles-to
DTSTART:20260619T233000Z
DTEND:20260620T003000Z`,
      `UID:starts-at-to
DTSTART:20260620T000000Z
DTEND:20260620T010000Z`,
      `UID:after
DTSTART:20260701T090000Z
DTEND:20260701T100000Z`,
    ]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-09T23:30:00.000Z', '2026-06-10T00:30:00.000Z'],
      ['2026-06-15T09:00:00.000Z', '2026-06-15T10:00:00.000Z'],
      ['2026-06-19T23:30:00.000Z', '2026-06-20T00:30:00.000Z'],
    ]);
  });

  it('returns blocks sorted by start, whatever the feed order', () => {
    const ics = cal([
      `UID:b
DTSTART:20260618T090000Z
DTEND:20260618T100000Z`,
      `UID:a
DTSTART:20260612T090000Z
DTEND:20260612T100000Z`,
    ]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.blocks.map((b) => b.startAt.toISOString())).toEqual(['2026-06-12T09:00:00.000Z', '2026-06-18T09:00:00.000Z']);
  });
});

describe('parseIcalBlocks: robustness', () => {
  it('counts a malformed event as skipped while the rest parse', () => {
    const ics = cal([
      `UID:bad-date
DTSTART:not-a-date
DTEND:20260610T100000Z`,
      `UID:bad-rrule
DTSTART:20260610T090000Z
DTEND:20260610T100000Z
RRULE:FREQ=BOGUS`,
      `UID:bad-line
DTSTART:20260610T090000Z
this line has no colon or semicolon
DTEND:20260610T100000Z`,
      `UID:no-start
DTEND:20260610T100000Z`,
      `UID:end-before-start
DTSTART:20260610T100000Z
DTEND:20260610T090000Z`,
      `UID:good
DTSTART:20260611T090000Z
DTEND:20260611T100000Z`,
    ]);
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(5);
    expect(r.blocks.map(iso)).toEqual([['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z']]);
  });

  it('counts an event cut off before its END as skipped and still reads the next one', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:open',
      'DTSTART:20260610T090000Z',
      'BEGIN:VEVENT',
      'UID:good',
      'DTSTART:20260611T090000Z',
      'DTEND:20260611T100000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const r = parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(1);
    expect(r.blocks.map(iso)).toEqual([['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z']]);
  });

  it('returns an empty result for an empty calendar', () => {
    expect(parseIcalBlocks(cal([]), { timezone: SE, ...WIDE })).toEqual({ blocks: [], skipped: 0, unsupported: 0 });
  });

  it('returns an empty result for a calendar holding only other component types', () => {
    const ics = cal([], ['BEGIN:VTODO', 'UID:t', 'SUMMARY:todo', 'END:VTODO', 'BEGIN:VJOURNAL', 'UID:j', 'END:VJOURNAL']);
    expect(parseIcalBlocks(ics, { timezone: SE, ...WIDE })).toEqual({ blocks: [], skipped: 0, unsupported: 0 });
  });

  it.each([
    ['plain text', 'this is not a calendar'],
    ['an html page', '<!doctype html><html><body>Sign in to continue</body></html>'],
    ['an empty body', ''],
    ['whitespace', '  \r\n \r\n'],
    ['json', '{"error":"not found"}'],
    ['a calendar cut off before END:VCALENDAR', 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:a\r\nDTSTART:20260610T090000Z\r\nDTEND:20260610T1000'],
  ])('throws CalendarParseError for %s so the caller keeps the previous blocks', (_label, text) => {
    expect(() => parseIcalBlocks(text, { timezone: SE, ...WIDE })).toThrow(CalendarParseError);
  });

  it('never throws on an event with an invalid timezone option', () => {
    const ics = cal([`UID:a
DTSTART:20260610T090000
DTEND:20260610T100000`]);
    const r = parseIcalBlocks(ics, { timezone: '', ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
  });
});

// A hostile recurrence rule used to freeze the (synchronous) parser inside a single ical.js call, so these tests assert
// that the call returns quickly. A hang cannot be interrupted by vitest's timeout, so a regression shows up as a stuck run.
describe('parseIcalBlocks: hostile recurrence rules', () => {
  const run = (rule: string, dtstart = '20260110T090000Z', win = WIDE) => {
    const ics = cal([`UID:h
DTSTART:${dtstart}
DTEND:${dtstart.replace('T09', 'T10')}
RRULE:${rule}`]);
    const t0 = Date.now();
    const r = parseIcalBlocks(ics, { timezone: SE, ...win });
    return { r, ms: Date.now() - t0 };
  };

  it.each([
    ['DAILY never matching', 'FREQ=DAILY;BYMONTH=2;BYMONTHDAY=30'],
    ['HOURLY never matching', 'FREQ=HOURLY;BYMONTH=2;BYMONTHDAY=30'],
    ['WEEKLY never matching', 'FREQ=WEEKLY;BYMONTH=2;BYMONTHDAY=30'],
    ['MONTHLY never matching', 'FREQ=MONTHLY;BYMONTH=2;BYMONTHDAY=30'],
    ['YEARLY never matching', 'FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=30'],
    ['DAILY in a 30-day month asking for day 31', 'FREQ=DAILY;BYMONTH=4;BYMONTHDAY=31'],
    ['SECONDLY', 'FREQ=SECONDLY;BYMONTH=2;BYMONTHDAY=29'],
    ['MINUTELY', 'FREQ=MINUTELY;BYMONTH=2;BYMONTHDAY=29'],
    ['plain SECONDLY', 'FREQ=SECONDLY'],
    ['plain MINUTELY', 'FREQ=MINUTELY'],
    ['DAILY with an interval phase that never lands on the weekday', 'FREQ=DAILY;INTERVAL=7;BYDAY=MO'],
    ['WEEKLY with BYWEEKNO (not allowed outside YEARLY)', 'FREQ=WEEKLY;BYWEEKNO=10'],
    ['an absurdly long BYYEARDAY list', `FREQ=YEARLY;BYYEARDAY=${[...Array(366).keys()].flatMap((i) => [i + 1, -(i + 1)]).join(',')}`],
  ])('returns quickly and reports %s as unsupported', (_label, rule) => {
    const { r, ms } = run(rule);
    expect(r).toEqual({ blocks: [], skipped: 0, unsupported: 1 });
    expect(ms).toBeLessThan(500);
  }, 5000);

  it('still expands a YEARLY Feb 29 rule', () => {
    const { r, ms } = run('FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=29', '20240229T090000Z', { from: new Date('2026-01-01T00:00:00Z'), to: new Date('2029-01-01T00:00:00Z') });
    expect(r.unsupported).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2028-02-29T09:00:00.000Z', '2028-02-29T10:00:00.000Z']]);
    expect(ms).toBeLessThan(500);
  }, 5000);

  it('still expands a DAILY Feb 29 rule (a sparse but possible match)', () => {
    const { r, ms } = run('FREQ=DAILY;BYMONTH=2;BYMONTHDAY=29', '20240229T090000Z', { from: new Date('2026-01-01T00:00:00Z'), to: new Date('2029-01-01T00:00:00Z') });
    expect(r.unsupported).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2028-02-29T09:00:00.000Z', '2028-02-29T10:00:00.000Z']]);
    expect(ms).toBeLessThan(500);
  }, 5000);

  it('still expands an HOURLY rule limited to Feb 29', () => {
    const { r, ms } = run('FREQ=HOURLY;BYMONTH=2;BYMONTHDAY=29;BYHOUR=9,12', '20240229T090000Z', { from: new Date('2026-01-01T00:00:00Z'), to: new Date('2029-01-01T00:00:00Z') });
    expect(r.unsupported).toBe(0);
    expect(r.blocks.map((b) => b.startAt.toISOString())).toEqual(['2028-02-29T09:00:00.000Z', '2028-02-29T12:00:00.000Z']);
    expect(ms).toBeLessThan(1500);
  }, 5000);
});

describe('parseIcalBlocks: UNTIL is read in the event zone', () => {
  const list = (ics: string, tz = SE, win = WIDE) => parseIcalBlocks(ics, { timezone: tz, ...win });

  it('keeps the last instance of an Outlook series (UNTIL equals the final start, east of UTC)', () => {
    const ics = cal([`UID:o
DTSTART;TZID=Europe/Stockholm:20261012T100000
DTEND;TZID=Europe/Stockholm:20261012T110000
RRULE:FREQ=WEEKLY;UNTIL=20261102T090000Z`]);
    const r = list(ics);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-10-12T08:00:00.000Z', '2026-10-12T09:00:00.000Z'],
      ['2026-10-19T08:00:00.000Z', '2026-10-19T09:00:00.000Z'],
      ['2026-10-26T09:00:00.000Z', '2026-10-26T10:00:00.000Z'],
      ['2026-11-02T09:00:00.000Z', '2026-11-02T10:00:00.000Z'],
    ]);
    expect(r.unsupported).toBe(0);
  });

  it('keeps the last instance of a Google series (exact-form UNTIL, across the October DST change)', () => {
    const ics = cal([`UID:g
DTSTART;TZID=Europe/Stockholm:20261024T170000
DTEND;TZID=Europe/Stockholm:20261024T180000
RRULE:FREQ=DAILY;UNTIL=20261026T160000Z`]);
    expect(list(ics).blocks.map(iso)).toEqual([
      ['2026-10-24T15:00:00.000Z', '2026-10-24T16:00:00.000Z'],
      ['2026-10-25T16:00:00.000Z', '2026-10-25T17:00:00.000Z'],
      ['2026-10-26T16:00:00.000Z', '2026-10-26T17:00:00.000Z'],
    ]);
  });

  it('keeps an instance before an end-of-day UNTIL and drops the next one', () => {
    const ics = cal([`UID:e
DTSTART;TZID=Europe/Stockholm:20261005T230000
DTEND;TZID=Europe/Stockholm:20261005T233000
RRULE:FREQ=DAILY;UNTIL=20261007T215959Z`]);
    expect(list(ics).blocks.map(iso)).toEqual([
      ['2026-10-05T21:00:00.000Z', '2026-10-05T21:30:00.000Z'],
      ['2026-10-06T21:00:00.000Z', '2026-10-06T21:30:00.000Z'],
      ['2026-10-07T21:00:00.000Z', '2026-10-07T21:30:00.000Z'],
    ]);
  });

  it('works for Tokyo (UTC+9)', () => {
    const ics = cal([`UID:t
DTSTART;TZID=Asia/Tokyo:20261020T200000
DTEND;TZID=Asia/Tokyo:20261020T210000
RRULE:FREQ=DAILY;UNTIL=20261022T145959Z`]);
    expect(list(ics, 'UTC').blocks.map(iso)).toEqual([
      ['2026-10-20T11:00:00.000Z', '2026-10-20T12:00:00.000Z'],
      ['2026-10-21T11:00:00.000Z', '2026-10-21T12:00:00.000Z'],
      ['2026-10-22T11:00:00.000Z', '2026-10-22T12:00:00.000Z'],
    ]);
  });

  it('works for New York (west of UTC, across the November DST change)', () => {
    const ics = cal([`UID:n
DTSTART;TZID=America/New_York:20261030T200000
DTEND;TZID=America/New_York:20261030T210000
RRULE:FREQ=DAILY;UNTIL=20261102T010000Z`]);
    expect(list(ics, 'UTC').blocks.map(iso)).toEqual([
      ['2026-10-31T00:00:00.000Z', '2026-10-31T01:00:00.000Z'],
      ['2026-11-01T00:00:00.000Z', '2026-11-01T01:00:00.000Z'],
      ['2026-11-02T01:00:00.000Z', '2026-11-02T02:00:00.000Z'], // starts exactly at UNTIL: included
    ]);
  });

  it('reads a DATE-valued UNTIL on an all-day series as that local day, inclusive', () => {
    const ics = cal([`UID:d
DTSTART;VALUE=DATE:20261001
DTEND;VALUE=DATE:20261002
RRULE:FREQ=DAILY;UNTIL=20261003`]);
    expect(list(ics).blocks.map(iso)).toEqual([
      ['2026-09-30T22:00:00.000Z', '2026-10-01T22:00:00.000Z'],
      ['2026-10-01T22:00:00.000Z', '2026-10-02T22:00:00.000Z'],
      ['2026-10-02T22:00:00.000Z', '2026-10-03T22:00:00.000Z'],
    ]);
  });

  it('reads a DATE-valued UNTIL on a timed series as that whole local day', () => {
    const ics = cal([`UID:d2
DTSTART;TZID=Europe/Stockholm:20261001T100000
DTEND;TZID=Europe/Stockholm:20261001T110000
RRULE:FREQ=DAILY;UNTIL=20261003`]);
    expect(list(ics).blocks.map((b) => b.startAt.toISOString())).toEqual([
      '2026-10-01T08:00:00.000Z',
      '2026-10-02T08:00:00.000Z',
      '2026-10-03T08:00:00.000Z',
    ]);
  });

  it('reads a floating UNTIL in the event zone', () => {
    const ics = cal([`UID:fl
DTSTART:20261001T100000
DTEND:20261001T110000
RRULE:FREQ=DAILY;UNTIL=20261003T100000`]);
    expect(list(ics).blocks.map((b) => b.startAt.toISOString())).toEqual([
      '2026-10-01T08:00:00.000Z',
      '2026-10-02T08:00:00.000Z',
      '2026-10-03T08:00:00.000Z',
    ]);
  });

  it('leaves COUNT to ical.js', () => {
    const ics = cal([`UID:c
DTSTART;TZID=Europe/Stockholm:20261012T100000
DTEND;TZID=Europe/Stockholm:20261012T110000
RRULE:FREQ=WEEKLY;COUNT=2`]);
    expect(list(ics).blocks).toHaveLength(2);
  });

  it('skips a series that ended before the window', () => {
    const ics = cal([`UID:old
DTSTART:20200101T090000Z
DTEND:20200101T100000Z
RRULE:FREQ=DAILY;UNTIL=20200301T000000Z`]);
    expect(list(ics)).toEqual({ blocks: [], skipped: 0, unsupported: 0 });
  });
});

describe('parseIcalBlocks: budgets never cost a plain event', () => {
  const PLAIN = `UID:plain
DTSTART:20260611T090000Z
DTEND:20260611T100000Z`;
  const win = { from: new Date('2026-06-10T00:00:00Z'), to: new Date('2026-06-12T00:00:00Z') };

  it('keeps a plain event after many SECONDLY series (unsupported, never expanded)', () => {
    const series = Array.from({ length: 11 }, (_, i) => `UID:s${i}
DTSTART:20100101T090000Z
DTEND:20100101T090001Z
RRULE:FREQ=SECONDLY`);
    const r = parseIcalBlocks(cal([...series, PLAIN]), { timezone: SE, ...win });
    expect(r.blocks.map(iso)).toEqual([['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z']]);
    expect(r.unsupported).toBe(11);
    expect(r.skipped).toBe(0);
  }, 10_000);

  it('parses 30 long-running daily Stockholm series quickly and keeps the plain event', () => {
    const series = Array.from({ length: 30 }, (_, i) => `UID:d${i}
DTSTART;TZID=Europe/Stockholm:20160101T100000
DTEND;TZID=Europe/Stockholm:20160101T110000
RRULE:FREQ=DAILY`);
    const t0 = Date.now();
    const r = parseIcalBlocks(cal([...series, PLAIN]), { timezone: SE, ...win });
    const ms = Date.now() - t0;
    expect(r.unsupported).toBe(0);
    expect(r.skipped).toBe(0);
    expect(r.blocks).toHaveLength(30 * 2 + 1);
    expect(r.blocks.some((b) => b.startAt.toISOString() === '2026-06-11T09:00:00.000Z' && b.endAt.toISOString() === '2026-06-11T10:00:00.000Z')).toBe(true);
    expect(ms).toBeLessThan(3000);
  }, 15_000);

  it('after the feed budget is spent, still reads plain events and the first date of later series', () => {
    // HOURLY series from 2010 each burn the per-event step cap; eleven of them spend the 100k feed budget.
    const heavy = Array.from({ length: 11 }, (_, i) => `UID:h${i}
DTSTART:20100101T090000Z
DTEND:20100101T093000Z
RRULE:FREQ=HOURLY`);
    const later = `UID:monthly
DTSTART:20260611T120000Z
DTEND:20260611T130000Z
RRULE:FREQ=MONTHLY;COUNT=6`;
    const r = parseIcalBlocks(cal([...heavy, PLAIN, later]), { timezone: SE, ...win });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z'],
      ['2026-06-11T12:00:00.000Z', '2026-06-11T13:00:00.000Z'],
    ]);
    expect(r.unsupported).toBe(12);
    expect(r.skipped).toBe(0);
  }, 30_000);
});

describe('parseIcalBlocks: fast-forwarding long-running simple series', () => {
  const win = { from: new Date('2026-03-01T00:00:00Z'), to: new Date('2026-04-15T00:00:00Z') };

  it('gives the same blocks for a fortnightly Monday/Wednesday series as plain expansion (COUNT disables the shortcut)', () => {
    const rule = 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE';
    const fast = parseIcalBlocks(cal([`UID:f
DTSTART;TZID=Europe/Stockholm:20150105T100000
DTEND;TZID=Europe/Stockholm:20150105T110000
RRULE:${rule}`]), { timezone: SE, ...win });
    const slow = parseIcalBlocks(cal([`UID:f
DTSTART;TZID=Europe/Stockholm:20150105T100000
DTEND;TZID=Europe/Stockholm:20150105T110000
RRULE:${rule};COUNT=1000`]), { timezone: SE, ...win });
    expect(fast.blocks.length).toBeGreaterThan(3);
    expect(fast.blocks.map(iso)).toEqual(slow.blocks.map(iso));
    expect(fast.unsupported).toBe(0);
  });

  it('gives the same blocks for an every-third-day series', () => {
    const fast = parseIcalBlocks(cal([`UID:f
DTSTART:20160101T090000Z
DTEND:20160101T100000Z
RRULE:FREQ=DAILY;INTERVAL=3`]), { timezone: SE, ...win });
    const slow = parseIcalBlocks(cal([`UID:f
DTSTART:20160101T090000Z
DTEND:20160101T100000Z
RRULE:FREQ=DAILY;INTERVAL=3;COUNT=3000`]), { timezone: SE, ...win });
    expect(fast.blocks.length).toBeGreaterThan(10);
    expect(fast.blocks.map(iso)).toEqual(slow.blocks.map(iso));
  });
});

describe('parseIcalBlocks: RANGE=THISANDFUTURE', () => {
  it('does not apply a THISANDFUTURE override to a single instance; it is reported as unsupported', () => {
    const ics = cal([
      `UID:series
DTSTART:20260601T090000Z
DTEND:20260601T100000Z
RRULE:FREQ=WEEKLY;COUNT=4`,
      `UID:series
RECURRENCE-ID;RANGE=THISANDFUTURE:20260615T090000Z
DTSTART:20260615T130000Z
DTEND:20260615T140000Z`,
    ]);
    const r = parseIcalBlocks(ics, { timezone: SE, from: new Date('2026-06-01T00:00:00Z'), to: new Date('2026-07-01T00:00:00Z') });
    expect(r.unsupported).toBe(1);
    expect(r.skipped).toBe(0);
    expect(r.blocks.map((b) => b.startAt.toISOString())).toEqual([
      '2026-06-01T09:00:00.000Z',
      '2026-06-08T09:00:00.000Z',
      '2026-06-15T09:00:00.000Z', // the series is left as it was
      '2026-06-22T09:00:00.000Z',
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { CalendarParseError, PARSE_DEADLINE_MS, PARSE_MAX_WALL_MS, parseIcalBlocks } from './parse-ical';

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
  it('reads a UTC event as is', async () => {
    const ics = cal([`UID:a
DTSTART:20260610T090000Z
DTEND:20260610T100000Z
SUMMARY:Call`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
  });

  it('honours a TZID across the Stockholm DST change, without a VTIMEZONE block', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: 'UTC', ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-03-28T09:00:00.000Z', '2026-03-28T10:00:00.000Z'], // CET, +01:00
      ['2026-03-29T00:00:00.000Z', '2026-03-29T02:00:00.000Z'], // 3 wall-clock hours, 2 real hours
      ['2026-03-30T08:00:00.000Z', '2026-03-30T09:00:00.000Z'], // CEST, +02:00
    ]);
  });

  it('gives the same answer with a VTIMEZONE block', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: 'UTC', ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-03-28T09:00:00.000Z', '2026-03-28T10:00:00.000Z'],
      ['2026-03-29T00:00:00.000Z', '2026-03-29T02:00:00.000Z'],
      ['2026-03-30T08:00:00.000Z', '2026-03-30T09:00:00.000Z'],
    ]);
  });

  it('resolves a non-IANA TZID through its VTIMEZONE block', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: 'America/New_York', ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-07-01T08:00:00.000Z', '2026-07-01T09:30:00.000Z'],
      ['2026-12-01T09:00:00.000Z', '2026-12-01T10:00:00.000Z'],
    ]);
  });

  it('falls back to the calendar timezone for an unknown TZID and still counts the event', async () => {
    const ics = cal([`UID:x
DTSTART;TZID=Mars/Olympus_Mons:20260701T100000
DTEND;TZID=Mars/Olympus_Mons:20260701T110000`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z']]);
  });

  it('reads a floating time in the calendar timezone', async () => {
    const ics = cal([`UID:f
DTSTART:20260701T100000
DTEND:20260701T110000`]);
    const ny = await parseIcalBlocks(ics, { timezone: 'America/New_York', ...WIDE });
    expect(ny.blocks.map(iso)).toEqual([['2026-07-01T14:00:00.000Z', '2026-07-01T15:00:00.000Z']]);
    const se = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(se.blocks.map(iso)).toEqual([['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z']]);
  });

  it('uses DURATION when there is no DTEND', async () => {
    const ics = cal([`UID:d
DTSTART:20260610T090000Z
DURATION:PT90M`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:30:00.000Z']]);
  });

  it('silently skips a timed event with no end (zero length) without counting it', async () => {
    const ics = cal([`UID:z
DTSTART:20260610T090000Z`]);
    expect(await parseIcalBlocks(ics, { timezone: SE, ...WIDE })).toEqual({ complete: true, blocks: [], skipped: 0, unsupported: 0 });
  });

  it('reads folded lines', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
  });

  it('accepts bare LF line endings', async () => {
    const ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:lf\nDTSTART:20260610T090000Z\nDTEND:20260610T100000Z\nEND:VEVENT\nEND:VCALENDAR\n';
    expect((await parseIcalBlocks(ics, { timezone: SE, ...WIDE })).blocks).toHaveLength(1);
  });

  it('ignores an alarm nested inside an event', async () => {
    const ics = cal([`UID:alarm
DTSTART:20260610T090000Z
DTEND:20260610T100000Z
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT15M
DESCRIPTION:Reminder
END:VALARM`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks).toHaveLength(1);
  });
});

describe('parseIcalBlocks: all-day events', () => {
  it('blocks the whole local day, not a minute', async () => {
    const ics = cal([`UID:day
DTSTART;VALUE=DATE:20260710
DTEND;VALUE=DATE:20260711`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-07-09T22:00:00.000Z', '2026-07-10T22:00:00.000Z']]);
  });

  it('treats an all-day event with no DTEND as one day', async () => {
    const ics = cal([`UID:day
DTSTART;VALUE=DATE:20260710`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-07-09T22:00:00.000Z', '2026-07-10T22:00:00.000Z']]);
  });

  it('blocks two local days for a two-day event (DTEND is exclusive)', async () => {
    const ics = cal([`UID:two
DTSTART;VALUE=DATE:20260710
DTEND;VALUE=DATE:20260712`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-07-09T22:00:00.000Z', '2026-07-11T22:00:00.000Z']]);
  });

  it('follows the local day length on a DST change day', async () => {
    const ics = cal([`UID:dst
DTSTART;VALUE=DATE:20260329
DTEND;VALUE=DATE:20260330`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-03-28T23:00:00.000Z', '2026-03-29T22:00:00.000Z']]);
    expect(r.blocks[0].endAt.getTime() - r.blocks[0].startAt.getTime()).toBe(23 * HOUR);
  });

  it('uses UTC days when the calendar timezone is unknown', async () => {
    const ics = cal([`UID:day
DTSTART;VALUE=DATE:20260710`]);
    const r = await parseIcalBlocks(ics, { timezone: 'Nowhere/Land', ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-07-10T00:00:00.000Z', '2026-07-11T00:00:00.000Z']]);
  });
});

describe('parseIcalBlocks: status and transparency', () => {
  it('ignores cancelled and transparent (free) events, keeps tentative and opaque ones', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-06-12T09:00:00.000Z', '2026-06-12T10:00:00.000Z']]);
  });
});

describe('parseIcalBlocks: recurring events', () => {
  const window = { from: new Date('2026-06-01T00:00:00Z'), to: new Date('2026-07-01T00:00:00Z') };

  it('expands a weekly event within the window, honouring EXDATE and overridden instances', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z'],
      ['2026-06-08T09:00:00.000Z', '2026-06-08T10:00:00.000Z'],
      // 06-15 excluded
      ['2026-06-22T13:00:00.000Z', '2026-06-22T14:00:00.000Z'], // override uses its own times
      // 06-29 override is cancelled: no block
    ]);
  });

  it('applies an EXDATE written in another form than DTSTART', async () => {
    const ics = cal([`UID:s
DTSTART;TZID=Europe/Stockholm:20260601T110000
DTEND;TZID=Europe/Stockholm:20260601T120000
RRULE:FREQ=WEEKLY;COUNT=3
EXDATE:20260608T090000Z`]);
    const r = await parseIcalBlocks(ics, { timezone: 'UTC', ...window });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z'],
      ['2026-06-15T09:00:00.000Z', '2026-06-15T10:00:00.000Z'],
    ]);
  });

  it('keeps the local wall time of a TZID series across the DST change', async () => {
    const ics = cal([`UID:s
DTSTART;TZID=Europe/Stockholm:20260323T100000
DTEND;TZID=Europe/Stockholm:20260323T110000
RRULE:FREQ=WEEKLY;COUNT=3`]);
    const r = await parseIcalBlocks(ics, { timezone: 'UTC', ...WIDE });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-03-23T09:00:00.000Z', '2026-03-23T10:00:00.000Z'],
      ['2026-03-30T08:00:00.000Z', '2026-03-30T09:00:00.000Z'],
      ['2026-04-06T08:00:00.000Z', '2026-04-06T09:00:00.000Z'],
    ]);
  });

  it('expands a recurring all-day event into local days', async () => {
    const ics = cal([`UID:s
DTSTART;VALUE=DATE:20260601
DTEND;VALUE=DATE:20260603
RRULE:FREQ=WEEKLY;COUNT=2`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-05-31T22:00:00.000Z', '2026-06-02T22:00:00.000Z'],
      ['2026-06-07T22:00:00.000Z', '2026-06-09T22:00:00.000Z'],
    ]);
  });

  it('treats an override with no master as a plain event', async () => {
    const ics = cal([`UID:orphan
RECURRENCE-ID:20260622T090000Z
DTSTART:20260622T130000Z
DTEND:20260622T140000Z`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.blocks.map(iso)).toEqual([['2026-06-22T13:00:00.000Z', '2026-06-22T14:00:00.000Z']]);
  });

  it('includes an override moved into the window from an instance outside it', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
  });

  it('caps expansion per event and reports the event as unsupported', async () => {
    const ics = cal([`UID:daily
DTSTART:20260101T090000Z
DTEND:20260101T093000Z
RRULE:FREQ=DAILY`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, from: new Date('2026-01-01T00:00:00Z'), to: new Date('2031-01-01T00:00:00Z') });
    expect(r.blocks).toHaveLength(1000);
    expect(r.skipped).toBe(0);
    expect(r.unsupported).toBe(1);
    expect(r.blocks[0].startAt.toISOString()).toBe('2026-01-01T09:00:00.000Z');
  });

  it('gives up on a series that needs more than the step cap to reach the window, quickly', async () => {
    const ics = cal([`UID:counted
DTSTART:19900101T090000Z
DTEND:19900101T093000Z
RRULE:FREQ=DAILY;COUNT=100000`]);
    const t0 = Date.now();
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r).toEqual({ complete: true, blocks: [], skipped: 0, unsupported: 1 });
    expect(Date.now() - t0).toBeLessThan(5000);
  });

  it('reaches a window far from the start of a long-running daily series', async () => {
    const ics = cal([`UID:old
DTSTART:20220101T090000Z
DTEND:20220101T093000Z
RRULE:FREQ=DAILY`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, from: new Date('2026-06-10T00:00:00Z'), to: new Date('2026-06-12T00:00:00Z') });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-10T09:00:00.000Z', '2026-06-10T09:30:00.000Z'],
      ['2026-06-11T09:00:00.000Z', '2026-06-11T09:30:00.000Z'],
    ]);
  });
});

describe('parseIcalBlocks: window', () => {
  const window = { from: new Date('2026-06-10T00:00:00Z'), to: new Date('2026-06-20T00:00:00Z') };

  it('keeps only events that overlap [from, to)', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-09T23:30:00.000Z', '2026-06-10T00:30:00.000Z'],
      ['2026-06-15T09:00:00.000Z', '2026-06-15T10:00:00.000Z'],
      ['2026-06-19T23:30:00.000Z', '2026-06-20T00:30:00.000Z'],
    ]);
  });

  it('returns blocks sorted by start, whatever the feed order', async () => {
    const ics = cal([
      `UID:b
DTSTART:20260618T090000Z
DTEND:20260618T100000Z`,
      `UID:a
DTSTART:20260612T090000Z
DTEND:20260612T100000Z`,
    ]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...window });
    expect(r.blocks.map((b) => b.startAt.toISOString())).toEqual(['2026-06-12T09:00:00.000Z', '2026-06-18T09:00:00.000Z']);
  });
});

describe('parseIcalBlocks: robustness', () => {
  it('counts a malformed event as skipped while the rest parse', async () => {
    const ics = cal([
      `UID:bad-date
DTSTART:not-a-date
DTEND:20260610T100000Z`,
      `UID:bad-rrule
DTSTART:20260610T090000Z
DTEND:20260610T100000Z
RRULE:FREQ=BOGUS`,
      // A broken line of a property the parser reads makes the event unreadable.
      `UID:bad-read-line
DTSTART:20260610T090000Z
DTEND 20260610T100000Z`,
      `UID:no-start
DTEND:20260610T100000Z`,
      `UID:end-before-start
DTSTART:20260610T100000Z
DTEND:20260610T090000Z`,
      `UID:good
DTSTART:20260611T090000Z
DTEND:20260611T100000Z`,
    ]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(5);
    expect(r.blocks.map(iso)).toEqual([['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z']]);
  });

  it('a garbage line that is not a property the parser reads is dropped, and its event still blocks (ical.js alone refused it)', async () => {
    const ics = cal([
      `UID:bad-line
DTSTART:20260610T090000Z
this line has no colon or semicolon
DTEND:20260610T100000Z`,
    ]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r).toMatchObject({ skipped: 0, unsupported: 0 });
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
    // Before the reduction (full chunks) the whole event was lost as skipped: a busy time freed by an unrelated bad line.
    expect((await parseIcalBlocks(ics, { timezone: SE, ...WIDE, keepAllProperties: true })).skipped).toBe(1);
  });

  it('counts an event cut off before its END as skipped and still reads the next one', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.skipped).toBe(1);
    expect(r.blocks.map(iso)).toEqual([['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z']]);
  });

  it('returns an empty result for an empty calendar', async () => {
    expect(await parseIcalBlocks(cal([]), { timezone: SE, ...WIDE })).toEqual({ complete: true, blocks: [], skipped: 0, unsupported: 0 });
  });

  it('returns an empty result for a calendar holding only other component types', async () => {
    const ics = cal([], ['BEGIN:VTODO', 'UID:t', 'SUMMARY:todo', 'END:VTODO', 'BEGIN:VJOURNAL', 'UID:j', 'END:VJOURNAL']);
    expect(await parseIcalBlocks(ics, { timezone: SE, ...WIDE })).toEqual({ complete: true, blocks: [], skipped: 0, unsupported: 0 });
  });

  it.each([
    ['plain text', 'this is not a calendar'],
    ['an html page', '<!doctype html><html><body>Sign in to continue</body></html>'],
    ['an empty body', ''],
    ['whitespace', '  \r\n \r\n'],
    ['json', '{"error":"not found"}'],
    ['a calendar cut off before END:VCALENDAR', 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:a\r\nDTSTART:20260610T090000Z\r\nDTEND:20260610T1000'],
  ])('throws CalendarParseError for %s so the caller keeps the previous blocks', async (_label, text) => {
    await expect(parseIcalBlocks(text, { timezone: SE, ...WIDE })).rejects.toThrow(CalendarParseError);
  });

  it('never throws on an event with an invalid timezone option', async () => {
    const ics = cal([`UID:a
DTSTART:20260610T090000
DTEND:20260610T100000`]);
    const r = await parseIcalBlocks(ics, { timezone: '', ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
  });
});

// These rules used to freeze the (synchronous) parser inside ical.js. Expansion is now in-house and bounded, and the
// allowlist refuses these shapes before any expansion: each returns at once, keeps its master date and counts as unsupported.
describe('parseIcalBlocks: hostile recurrence rules', () => {
  async function timed(rule: string, dtstart: string, win = WIDE) {
    const dtend = dtstart.replace(/T(\d\d)/, (_m, h) => `T${String(Number(h) + 1).padStart(2, '0')}`);
    const ics = cal([`UID:h
DTSTART:${dtstart}
DTEND:${dtend}
RRULE:FREQ=${rule}`]);
    const t0 = performance.now();
    const r = await parseIcalBlocks(ics, { timezone: SE, ...win });
    return { ms: performance.now() - t0, skipped: r.skipped, unsupported: r.unsupported, blocks: r.blocks.map(iso) };
  }

  const SAT = '20260110T090000Z'; // a Saturday
  const MON = '20260112T090000Z';
  const TUE = '20260106T090000Z';

  it.each([
    ['DAILY;BYMONTHDAY=-1', SAT],
    ['HOURLY;BYMONTHDAY=-1', SAT],
    ['DAILY;BYDAY=1MO', SAT],
    ['DAILY;BYDAY=-1FR', SAT],
    ['HOURLY;BYDAY=1MO', SAT],
    ['HOURLY;INTERVAL=168;BYDAY=TU', MON],
    ['HOURLY', SAT],
    ['WEEKLY;INTERVAL=99999999', SAT],
    ['WEEKLY;INTERVAL=1000000', SAT],
    ['DAILY;INTERVAL=9999999', SAT],
    ['DAILY;INTERVAL=366', SAT],
    ['MONTHLY;INTERVAL=61;BYMONTHDAY=1', SAT],
    ['YEARLY;INTERVAL=21', SAT],
    ['YEARLY;BYMONTH=2;BYDAY=5MO;BYMONTHDAY=28', SAT],
    ['DAILY;BYMONTH=2;BYMONTHDAY=30', SAT],
    ['HOURLY;BYMONTH=2;BYMONTHDAY=30', SAT],
    ['WEEKLY;BYMONTH=2;BYMONTHDAY=30', SAT],
    ['MONTHLY;BYMONTH=2;BYMONTHDAY=30', SAT],
    ['DAILY;BYMONTH=4;BYMONTHDAY=31', SAT],
    ['DAILY;BYMONTH=2;BYMONTHDAY=29', '20240229T090000Z'],
    ['HOURLY;BYMONTH=2;BYMONTHDAY=29;BYHOUR=9,12', '20240229T090000Z'],
    ['SECONDLY;BYMONTH=2;BYMONTHDAY=29', SAT],
    ['MINUTELY;BYMONTH=2;BYMONTHDAY=29', SAT],
    ['SECONDLY', SAT],
    ['MINUTELY', SAT],
    ['DAILY;INTERVAL=7;BYDAY=MO', TUE],
    ['DAILY;INTERVAL=14;BYDAY=MO', TUE],
    ['WEEKLY;BYWEEKNO=10', SAT],
    ['WEEKLY;BYYEARDAY=100', SAT],
    ['DAILY;BYHOUR=9,10', SAT],
    ['MONTHLY;BYSETPOS=1', SAT],
    ['MONTHLY;BYMONTH=2;BYMONTHDAY=29', SAT],
    ['MONTHLY;BYDAY=MO;BYMONTHDAY=13', SAT],
    ['YEARLY;BYMONTH=2', SAT],
    ['YEARLY;BYDAY=MO', SAT],
    ['YEARLY;BYYEARDAY=100', SAT],
    ['YEARLY;BYWEEKNO=20', SAT],
    ['YEARLY;BYMONTH=2;BYMONTHDAY=29;BYSETPOS=1', SAT],
    [`YEARLY;BYYEARDAY=${[...Array(366).keys()].flatMap((i) => [i + 1, -(i + 1)]).join(',')}`, SAT],
  ])('RRULE:%s is not expanded, returns quickly, and keeps the master date', async (rule, dtstart) => {
    // A 2024 master date is outside the default 2026 window, so give those cases a window that holds it.
    const r = await timed(rule, dtstart, dtstart.startsWith('2024') ? { from: new Date('2024-01-01T00:00:00Z'), to: new Date('2025-01-01T00:00:00Z') } : WIDE);
    expect(r.unsupported).toBe(1);
    expect(r.skipped).toBe(0);
    expect(r.ms).toBeLessThan(600);
    const start = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)}T09:00:00.000Z`;
    expect(r.blocks).toEqual([[start, start.replace('T09', 'T10')]]);
  });

  it('a YEARLY rule with a month and a day that cannot exist only has its master date, quickly', async () => {
    const r = await timed('YEARLY;BYMONTH=2;BYMONTHDAY=30', SAT);
    expect(r.ms).toBeLessThan(600);
    expect(r).toMatchObject({ skipped: 0, unsupported: 0, blocks: [['2026-01-10T09:00:00.000Z', '2026-01-10T10:00:00.000Z']] });
  });

  it('still expands the YEARLY Feb 29 rule', async () => {
    const r = await timed('YEARLY;BYMONTH=2;BYMONTHDAY=29', '20240229T090000Z', { from: new Date('2026-01-01T00:00:00Z'), to: new Date('2029-01-01T00:00:00Z') });
    expect(r.unsupported).toBe(0);
    expect(r.blocks).toEqual([['2028-02-29T09:00:00.000Z', '2028-02-29T10:00:00.000Z']]);
    expect(r.ms).toBeLessThan(600);
  });
});

// Allowlisted rules whose expansion by ical.js grew with the age of DTSTART (seconds to minutes for one event). The
// in-house expander jumps to the window (no COUNT) or counts cheaply within the per-event budget (COUNT).
describe('parseIcalBlocks: old series cost nothing extra', () => {
  const Q4 = { from: new Date('2026-10-01T00:00:00Z'), to: new Date('2027-01-01T00:00:00Z') };
  const series = (uid: string, dtstart: string, rule: string) => `UID:${uid}
DTSTART:${dtstart}
DTEND:${dtstart.replace(/T(\d\d)/, (_m, h) => `T${String(Number(h) + 1).padStart(2, '0')}`)}
RRULE:${rule}`;
  const timedParse = async (events: string[], win: { from: Date; to: Date }) => {
    const t0 = performance.now();
    const r = await parseIcalBlocks(cal(events), { timezone: SE, ...win });
    return { ms: performance.now() - t0, ...r };
  };

  it('the last weekday of the month since the year 1300', async () => {
    const r = await timedParse([series('lw', '13000105T100000Z', 'FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1')], Q4);
    expect(r.ms).toBeLessThan(300);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-10-30T10:00:00.000Z', '2026-10-30T11:00:00.000Z'],
      ['2026-11-30T10:00:00.000Z', '2026-11-30T11:00:00.000Z'],
      ['2026-12-31T10:00:00.000Z', '2026-12-31T11:00:00.000Z'],
    ]);
    expect(r.unsupported).toBe(0);
  });

  it('five second-Tuesday series since the year 1300', async () => {
    const r = await timedParse(Array.from({ length: 5 }, (_, i) => series(`t${i}`, '13000110T100000Z', 'FREQ=MONTHLY;BYDAY=2TU')), Q4);
    expect(r.ms).toBeLessThan(600);
    expect(r.unsupported).toBe(0);
    expect(r.blocks).toHaveLength(15);
    expect([...new Set(r.blocks.map((b) => b.startAt.toISOString()))]).toEqual(['2026-10-13T10:00:00.000Z', '2026-11-10T10:00:00.000Z', '2026-12-08T10:00:00.000Z']);
  });

  it('a 31-entry BYDAY list with ten BYSETPOS values since 1950', async () => {
    const days = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const byday = [...days, ...[1, 2, -1].flatMap((n) => days.map((d) => `${n}${d}`)), '3MO', '3TU', '3WE'];
    expect(byday).toHaveLength(31);
    const r = await timedParse([series('l', '19500101T090000Z', `FREQ=MONTHLY;BYDAY=${byday.join(',')};BYSETPOS=1,2,3,4,5,-1,-2,-3,-4,-5`)], {
      from: new Date('2026-10-01T00:00:00Z'),
      to: new Date('2026-11-01T00:00:00Z'),
    });
    expect(r.ms).toBeLessThan(600);
    expect(r.unsupported).toBe(0);
    expect(r.blocks.map((b) => b.startAt.toISOString().slice(8, 10))).toEqual(['01', '02', '03', '04', '05', '27', '28', '29', '30', '31']);
  });

  it('DAILY and WEEKLY rules with a huge COUNT since 1950', async () => {
    const r = await timedParse(
      [
        series('d', '19500102T090000Z', 'FREQ=DAILY;COUNT=9999999'),
        series('w', '19500102T090000Z', 'FREQ=WEEKLY;COUNT=9999999'),
        series('w7', '19500102T090000Z', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;COUNT=9999999'),
        series('w2', '19500102T090000Z', 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;COUNT=9999999'),
      ],
      WIDE,
    );
    expect(r.ms).toBeLessThan(900);
    // Counting the daily and the every-day-weekly series up to 2026 takes more than the per-event budget: unsupported.
    // The other two reach the window within it: every Monday of 2026, and Mon/Wed/Fri of every other week.
    expect(r.unsupported).toBe(2);
    expect(r.blocks.every((b) => [1, 3, 5].includes(b.startAt.getUTCDay()))).toBe(true);
    expect(r.blocks.filter((b) => b.startAt.getUTCDay() !== 1)).toHaveLength(52); // 26 fortnights x Wed + Fri
  });

  it('twelve old DAILY;COUNT series and a plain event', async () => {
    const old = Array.from({ length: 12 }, (_, i) => series(`o${i}`, '19980101T090000Z', 'FREQ=DAILY;COUNT=20000'));
    const plain = `UID:plain
DTSTART:20260611T090000Z
DTEND:20260611T100000Z`;
    const r = await timedParse([...old, plain], WIDE);
    expect(r.ms).toBeLessThan(1000);
    expect(r.unsupported).toBe(12);
    expect(r.blocks.map(iso)).toEqual([['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z']]);
  });
});

describe('parseIcalBlocks: the supported recurrence shapes expand exactly', () => {
  const starts = async (rule: string, dtstart: string, from: string, to: string, tz = 'UTC') => {
    const ics = cal([`UID:s
DTSTART:${dtstart}
DTEND:${dtstart.replace(/T(\d\d)/, (_m, h) => `T${String(Number(h) + 1).padStart(2, '0')}`)}
RRULE:${rule}`]);
    const r = await parseIcalBlocks(ics, { timezone: tz, from: new Date(from), to: new Date(to) });
    expect(r.unsupported).toBe(0);
    expect(r.skipped).toBe(0);
    return r.blocks.map((b) => b.startAt.toISOString().slice(0, 10));
  };

  it('WEEKLY on Monday, Wednesday and Friday', async () => {
    expect(await starts('FREQ=WEEKLY;BYDAY=MO,WE,FR', '20260302T090000Z', '2026-03-02T00:00:00Z', '2026-03-10T00:00:00Z')).toEqual(['2026-03-02', '2026-03-04', '2026-03-06', '2026-03-09']);
  });
  it('WEEKLY every second week on Tuesday and Thursday', async () => {
    expect(await starts('FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,TH', '20260303T090000Z', '2026-03-01T00:00:00Z', '2026-04-01T00:00:00Z')).toEqual(['2026-03-03', '2026-03-05', '2026-03-17', '2026-03-19', '2026-03-31']);
  });
  it('DAILY on weekdays', async () => {
    expect(await starts('FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR', '20260302T090000Z', '2026-03-02T00:00:00Z', '2026-03-10T00:00:00Z')).toEqual(['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-09']);
  });
  it('MONTHLY on the second Tuesday', async () => {
    expect(await starts('FREQ=MONTHLY;BYDAY=2TU', '20260310T090000Z', '2026-03-01T00:00:00Z', '2026-06-01T00:00:00Z')).toEqual(['2026-03-10', '2026-04-14', '2026-05-12']);
  });
  it('MONTHLY on the last day (BYMONTHDAY=-1)', async () => {
    expect(await starts('FREQ=MONTHLY;BYMONTHDAY=-1', '20260131T090000Z', '2026-01-01T00:00:00Z', '2026-05-01T00:00:00Z')).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });
  it('MONTHLY on the 31st skips the shorter months', async () => {
    expect(await starts('FREQ=MONTHLY;BYMONTHDAY=31', '20260131T090000Z', '2026-01-01T00:00:00Z', '2026-06-01T00:00:00Z')).toEqual(['2026-01-31', '2026-03-31', '2026-05-31']);
  });
  it('MONTHLY on the last Friday', async () => {
    expect(await starts('FREQ=MONTHLY;BYDAY=-1FR', '20260130T090000Z', '2026-01-01T00:00:00Z', '2026-05-01T00:00:00Z')).toEqual(['2026-01-30', '2026-02-27', '2026-03-27', '2026-04-24']);
  });
  it('MONTHLY on the last weekday (BYDAY=MO..FR with BYSETPOS=-1)', async () => {
    expect(await starts('FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1', '20260130T090000Z', '2026-01-01T00:00:00Z', '2026-05-01T00:00:00Z')).toEqual(['2026-01-30', '2026-02-27', '2026-03-31', '2026-04-30']);
  });
  it('YEARLY on a month and day', async () => {
    expect(await starts('FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=9', '20000309T090000Z', '2026-01-01T00:00:00Z', '2028-01-01T00:00:00Z')).toEqual(['2026-03-09', '2027-03-09']);
  });
  it('YEARLY on the fourth Thursday of November', async () => {
    expect(await starts('FREQ=YEARLY;BYMONTH=11;BYDAY=4TH', '20251127T090000Z', '2026-01-01T00:00:00Z', '2027-12-31T00:00:00Z')).toEqual(['2026-11-26', '2027-11-25']);
  });
  it('an all-day yearly birthday lands on the local day', async () => {
    const ics = cal([`UID:b
DTSTART;VALUE=DATE:20000309
RRULE:FREQ=YEARLY`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, from: new Date('2026-01-01T00:00:00Z'), to: new Date('2027-01-01T00:00:00Z') });
    expect(r.blocks.map(iso)).toEqual([['2026-03-08T23:00:00.000Z', '2026-03-09T23:00:00.000Z']]);
    expect(r.unsupported).toBe(0);
  });
});

describe('parseIcalBlocks: cost of ordinary recurring events', () => {
  const win = { from: new Date('2026-06-01T00:00:00Z'), to: new Date('2026-07-01T00:00:00Z') };

  it('parses 1,000 monthly (BYMONTHDAY=15) events in well under a second', async () => {
    const events = Array.from({ length: 1000 }, (_, i) => `UID:m${i}
DTSTART:20240115T090000Z
DTEND:20240115T100000Z
RRULE:FREQ=MONTHLY;BYMONTHDAY=15`);
    const t0 = Date.now();
    const r = await parseIcalBlocks(cal(events), { timezone: SE, ...win });
    const ms = Date.now() - t0;
    expect(r.unsupported).toBe(0);
    expect(r.skipped).toBe(0);
    expect(r.blocks).toHaveLength(1000);
    expect(ms).toBeLessThan(1000); // ical.js expansion took 0.8 s on a quiet machine; the round-1 calendar walk took 20 s
  }, 20_000);

  it('parses 1,000 yearly birthday (BYMONTH=3;BYMONTHDAY=9) events in well under two seconds', async () => {
    const events = Array.from({ length: 1000 }, (_, i) => `UID:y${i}
DTSTART:${1995 + (i % 30)}0309T090000Z
DTEND:${1995 + (i % 30)}0309T100000Z
RRULE:FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=9`);
    const t0 = Date.now();
    const r = await parseIcalBlocks(cal(events), { timezone: SE, from: new Date('2026-03-01T00:00:00Z'), to: new Date('2026-04-01T00:00:00Z') });
    const ms = Date.now() - t0;
    expect(r.unsupported).toBe(0);
    expect(r.skipped).toBe(0);
    expect(r.blocks).toHaveLength(1000);
    expect(ms).toBeLessThan(1500);
  }, 20_000);

  it('parses 1,000 all-day yearly birthdays in well under two seconds', async () => {
    const events = Array.from({ length: 1000 }, (_, i) => `UID:a${i}
DTSTART;VALUE=DATE:${1950 + (i % 70)}0309
RRULE:FREQ=YEARLY;BYMONTH=3;BYMONTHDAY=9`);
    const t0 = Date.now();
    const r = await parseIcalBlocks(cal(events), { timezone: SE, from: new Date('2026-03-01T00:00:00Z'), to: new Date('2026-04-01T00:00:00Z') });
    const ms = Date.now() - t0;
    expect(r.unsupported).toBe(0);
    expect(r.skipped).toBe(0);
    expect(r.blocks).toHaveLength(1000);
    expect(iso(r.blocks[0])).toEqual(['2026-03-08T23:00:00.000Z', '2026-03-09T23:00:00.000Z']);
    expect(ms).toBeLessThan(1500);
  }, 20_000);
});

describe('parseIcalBlocks: all-day series use the business timezone for the days and for UNTIL', () => {
  it('does not invent an extra day when an all-day DTSTART carries a TZID', async () => {
    const ics = cal([`UID:ad
DTSTART;TZID=America/New_York;VALUE=DATE:20261020
RRULE:FREQ=DAILY;UNTIL=20261022`]);
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-10-19T22:00:00.000Z', '2026-10-20T22:00:00.000Z'],
      ['2026-10-20T22:00:00.000Z', '2026-10-21T22:00:00.000Z'],
      ['2026-10-21T22:00:00.000Z', '2026-10-22T22:00:00.000Z'],
    ]);
  });
});

describe('parseIcalBlocks: UNTIL is read in the event zone', () => {
  const list = async (ics: string, tz = SE, win = WIDE) => parseIcalBlocks(ics, { timezone: tz, ...win });

  it('keeps the last instance of an Outlook series (UNTIL equals the final start, east of UTC)', async () => {
    const ics = cal([`UID:o
DTSTART;TZID=Europe/Stockholm:20261012T100000
DTEND;TZID=Europe/Stockholm:20261012T110000
RRULE:FREQ=WEEKLY;UNTIL=20261102T090000Z`]);
    const r = await list(ics);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-10-12T08:00:00.000Z', '2026-10-12T09:00:00.000Z'],
      ['2026-10-19T08:00:00.000Z', '2026-10-19T09:00:00.000Z'],
      ['2026-10-26T09:00:00.000Z', '2026-10-26T10:00:00.000Z'],
      ['2026-11-02T09:00:00.000Z', '2026-11-02T10:00:00.000Z'],
    ]);
    expect(r.unsupported).toBe(0);
  });

  it('keeps the last instance of a Google series (exact-form UNTIL, across the October DST change)', async () => {
    const ics = cal([`UID:g
DTSTART;TZID=Europe/Stockholm:20261024T170000
DTEND;TZID=Europe/Stockholm:20261024T180000
RRULE:FREQ=DAILY;UNTIL=20261026T160000Z`]);
    expect((await list(ics)).blocks.map(iso)).toEqual([
      ['2026-10-24T15:00:00.000Z', '2026-10-24T16:00:00.000Z'],
      ['2026-10-25T16:00:00.000Z', '2026-10-25T17:00:00.000Z'],
      ['2026-10-26T16:00:00.000Z', '2026-10-26T17:00:00.000Z'],
    ]);
  });

  it('keeps an instance before an end-of-day UNTIL and drops the next one', async () => {
    const ics = cal([`UID:e
DTSTART;TZID=Europe/Stockholm:20261005T230000
DTEND;TZID=Europe/Stockholm:20261005T233000
RRULE:FREQ=DAILY;UNTIL=20261007T215959Z`]);
    expect((await list(ics)).blocks.map(iso)).toEqual([
      ['2026-10-05T21:00:00.000Z', '2026-10-05T21:30:00.000Z'],
      ['2026-10-06T21:00:00.000Z', '2026-10-06T21:30:00.000Z'],
      ['2026-10-07T21:00:00.000Z', '2026-10-07T21:30:00.000Z'],
    ]);
  });

  it('works for Tokyo (UTC+9)', async () => {
    const ics = cal([`UID:t
DTSTART;TZID=Asia/Tokyo:20261020T200000
DTEND;TZID=Asia/Tokyo:20261020T210000
RRULE:FREQ=DAILY;UNTIL=20261022T145959Z`]);
    expect((await list(ics, 'UTC')).blocks.map(iso)).toEqual([
      ['2026-10-20T11:00:00.000Z', '2026-10-20T12:00:00.000Z'],
      ['2026-10-21T11:00:00.000Z', '2026-10-21T12:00:00.000Z'],
      ['2026-10-22T11:00:00.000Z', '2026-10-22T12:00:00.000Z'],
    ]);
  });

  it('works for New York (west of UTC, across the November DST change)', async () => {
    const ics = cal([`UID:n
DTSTART;TZID=America/New_York:20261030T200000
DTEND;TZID=America/New_York:20261030T210000
RRULE:FREQ=DAILY;UNTIL=20261102T010000Z`]);
    expect((await list(ics, 'UTC')).blocks.map(iso)).toEqual([
      ['2026-10-31T00:00:00.000Z', '2026-10-31T01:00:00.000Z'],
      ['2026-11-01T00:00:00.000Z', '2026-11-01T01:00:00.000Z'],
      ['2026-11-02T01:00:00.000Z', '2026-11-02T02:00:00.000Z'], // starts exactly at UNTIL: included
    ]);
  });

  it('reads a DATE-valued UNTIL on an all-day series as that local day, inclusive', async () => {
    const ics = cal([`UID:d
DTSTART;VALUE=DATE:20261001
DTEND;VALUE=DATE:20261002
RRULE:FREQ=DAILY;UNTIL=20261003`]);
    expect((await list(ics)).blocks.map(iso)).toEqual([
      ['2026-09-30T22:00:00.000Z', '2026-10-01T22:00:00.000Z'],
      ['2026-10-01T22:00:00.000Z', '2026-10-02T22:00:00.000Z'],
      ['2026-10-02T22:00:00.000Z', '2026-10-03T22:00:00.000Z'],
    ]);
  });

  it('reads a DATE-valued UNTIL on a timed series as that whole local day', async () => {
    const ics = cal([`UID:d2
DTSTART;TZID=Europe/Stockholm:20261001T100000
DTEND;TZID=Europe/Stockholm:20261001T110000
RRULE:FREQ=DAILY;UNTIL=20261003`]);
    expect((await list(ics)).blocks.map((b) => b.startAt.toISOString())).toEqual([
      '2026-10-01T08:00:00.000Z',
      '2026-10-02T08:00:00.000Z',
      '2026-10-03T08:00:00.000Z',
    ]);
  });

  it('reads a floating UNTIL in the event zone', async () => {
    const ics = cal([`UID:fl
DTSTART:20261001T100000
DTEND:20261001T110000
RRULE:FREQ=DAILY;UNTIL=20261003T100000`]);
    expect((await list(ics)).blocks.map((b) => b.startAt.toISOString())).toEqual([
      '2026-10-01T08:00:00.000Z',
      '2026-10-02T08:00:00.000Z',
      '2026-10-03T08:00:00.000Z',
    ]);
  });

  it('counts COUNT from DTSTART', async () => {
    const ics = cal([`UID:c
DTSTART;TZID=Europe/Stockholm:20261012T100000
DTEND;TZID=Europe/Stockholm:20261012T110000
RRULE:FREQ=WEEKLY;COUNT=2`]);
    expect((await list(ics)).blocks).toHaveLength(2);
  });

  it('skips a series that ended before the window', async () => {
    const ics = cal([`UID:old
DTSTART:20200101T090000Z
DTEND:20200101T100000Z
RRULE:FREQ=DAILY;UNTIL=20200301T000000Z`]);
    expect(await list(ics)).toEqual({ complete: true, blocks: [], skipped: 0, unsupported: 0 });
  });
});

describe('parseIcalBlocks: budgets never cost a plain event', () => {
  const PLAIN = `UID:plain
DTSTART:20260611T090000Z
DTEND:20260611T100000Z`;
  const win = { from: new Date('2026-06-10T00:00:00Z'), to: new Date('2026-06-12T00:00:00Z') };

  it('keeps a plain event after many SECONDLY series (unsupported, never expanded)', async () => {
    const series = Array.from({ length: 11 }, (_, i) => `UID:s${i}
DTSTART:20100101T090000Z
DTEND:20100101T090001Z
RRULE:FREQ=SECONDLY`);
    const r = await parseIcalBlocks(cal([...series, PLAIN]), { timezone: SE, ...win });
    expect(r.blocks.map(iso)).toEqual([['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z']]);
    expect(r.unsupported).toBe(11);
    expect(r.skipped).toBe(0);
  }, 10_000);

  it('parses 30 long-running daily Stockholm series quickly and keeps the plain event', async () => {
    const series = Array.from({ length: 30 }, (_, i) => `UID:d${i}
DTSTART;TZID=Europe/Stockholm:20160101T100000
DTEND;TZID=Europe/Stockholm:20160101T110000
RRULE:FREQ=DAILY`);
    const t0 = Date.now();
    const r = await parseIcalBlocks(cal([...series, PLAIN]), { timezone: SE, ...win });
    const ms = Date.now() - t0;
    expect(r.unsupported).toBe(0);
    expect(r.skipped).toBe(0);
    expect(r.blocks).toHaveLength(30 * 2 + 1);
    expect(r.blocks.some((b) => b.startAt.toISOString() === '2026-06-11T09:00:00.000Z' && b.endAt.toISOString() === '2026-06-11T10:00:00.000Z')).toBe(true);
    expect(ms).toBeLessThan(3000);
  }, 15_000);

  it('after the feed budget is spent, still reads plain events and the first date of later series', async () => {
    // COUNT-limited DAILY series from 1990 (no fast-forward) each burn the per-event step cap; eleven of them spend the 100k feed budget.
    const heavy = Array.from({ length: 11 }, (_, i) => `UID:h${i}
DTSTART:19900101T090000Z
DTEND:19900101T093000Z
RRULE:FREQ=DAILY;COUNT=100000`);
    const later = `UID:monthly
DTSTART:20260611T120000Z
DTEND:20260611T130000Z
RRULE:FREQ=MONTHLY;COUNT=6`;
    const r = await parseIcalBlocks(cal([...heavy, PLAIN, later]), { timezone: SE, ...win });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z'],
      ['2026-06-11T12:00:00.000Z', '2026-06-11T13:00:00.000Z'],
    ]);
    expect(r.unsupported).toBe(12);
    expect(r.skipped).toBe(0);
  }, 30_000);
});

describe('parseIcalBlocks: skipping ahead to the window (no COUNT) gives the same blocks as counting from DTSTART', () => {
  const win = { from: new Date('2026-03-01T00:00:00Z'), to: new Date('2026-04-15T00:00:00Z') };

  it('gives the same blocks for a fortnightly Monday/Wednesday series', async () => {
    const rule = 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE';
    const fast = await parseIcalBlocks(cal([`UID:f
DTSTART;TZID=Europe/Stockholm:20150105T100000
DTEND;TZID=Europe/Stockholm:20150105T110000
RRULE:${rule}`]), { timezone: SE, ...win });
    const slow = await parseIcalBlocks(cal([`UID:f
DTSTART;TZID=Europe/Stockholm:20150105T100000
DTEND;TZID=Europe/Stockholm:20150105T110000
RRULE:${rule};COUNT=1000`]), { timezone: SE, ...win });
    expect(fast.blocks.length).toBeGreaterThan(3);
    expect(fast.blocks.map(iso)).toEqual(slow.blocks.map(iso));
    expect(fast.unsupported).toBe(0);
  });

  it('gives the same blocks for an every-third-day series', async () => {
    const fast = await parseIcalBlocks(cal([`UID:f
DTSTART:20160101T090000Z
DTEND:20160101T100000Z
RRULE:FREQ=DAILY;INTERVAL=3`]), { timezone: SE, ...win });
    const slow = await parseIcalBlocks(cal([`UID:f
DTSTART:20160101T090000Z
DTEND:20160101T100000Z
RRULE:FREQ=DAILY;INTERVAL=3;COUNT=3000`]), { timezone: SE, ...win });
    expect(fast.blocks.length).toBeGreaterThan(10);
    expect(fast.blocks.map(iso)).toEqual(slow.blocks.map(iso));
  });

  it.each([
    ['FREQ=MONTHLY;BYDAY=-1FR', 2000],
    ['FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=31', 2000],
    ['FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=1,-1', 2000],
    ['FREQ=YEARLY;BYMONTH=3,10;BYDAY=-1SU', 200],
    ['FREQ=YEARLY;INTERVAL=5;BYMONTH=1,7;BYMONTHDAY=-1,1', 200],
  ])('gives the same blocks for %s since 2001', async (rule, count) => {
    const ev = (r: string) => cal([`UID:f
DTSTART;TZID=Europe/Stockholm:20010131T100000
DTEND;TZID=Europe/Stockholm:20010131T110000
RRULE:${r}`]);
    const wide = { from: new Date('2026-01-01T00:00:00Z'), to: new Date('2028-01-01T00:00:00Z') };
    const fast = await parseIcalBlocks(ev(rule), { timezone: SE, ...wide });
    const slow = await parseIcalBlocks(ev(`${rule};COUNT=${count}`), { timezone: SE, ...wide });
    expect(fast.blocks.length).toBeGreaterThan(3);
    expect(fast.blocks.map(iso)).toEqual(slow.blocks.map(iso));
    expect(fast.unsupported + slow.unsupported).toBe(0);
  });
});

describe('parseIcalBlocks: RANGE=THISANDFUTURE', () => {
  it('does not apply a THISANDFUTURE override to a single instance; it is reported as unsupported', async () => {
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
    const r = await parseIcalBlocks(ics, { timezone: SE, from: new Date('2026-06-01T00:00:00Z'), to: new Date('2026-07-01T00:00:00Z') });
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

describe('parseIcalBlocks: RDATE, EXDATE forms and DTSTART', () => {
  const june = { from: new Date('2026-06-01T00:00:00Z'), to: new Date('2026-07-01T00:00:00Z') };
  const starts = async (ics: string, tz = SE) => {
    const r = await parseIcalBlocks(ics, { timezone: tz, ...june });
    expect(r.skipped).toBe(0);
    expect(r.unsupported).toBe(0);
    return r.blocks.map((b) => b.startAt.toISOString());
  };

  it('adds RDATE instances to the rule, once each, honouring EXDATE', async () => {
    const ics = cal([`UID:r
DTSTART:20260601T090000Z
DTEND:20260601T100000Z
RRULE:FREQ=WEEKLY;COUNT=2
RDATE:20260603T090000Z,20260608T090000Z
RDATE;TZID=Europe/Stockholm:20260610T110000
RDATE;VALUE=PERIOD:20260612T090000Z/PT3H
RDATE:20260615T090000Z
EXDATE:20260615T090000Z`]);
    expect(await starts(ics)).toEqual(['2026-06-01T09:00:00.000Z', '2026-06-03T09:00:00.000Z', '2026-06-08T09:00:00.000Z', '2026-06-10T09:00:00.000Z', '2026-06-12T09:00:00.000Z']);
  });

  it('expands an event with RDATE and no RRULE', async () => {
    const ics = cal([`UID:r
DTSTART:20260601T090000Z
DTEND:20260601T100000Z
RDATE:20260620T090000Z`]);
    expect(await starts(ics)).toEqual(['2026-06-01T09:00:00.000Z', '2026-06-20T09:00:00.000Z']);
  });

  it('a DATE-valued EXDATE removes the instance on that day of a timed series', async () => {
    const ics = cal([`UID:x
DTSTART:20260601T090000Z
DTEND:20260601T100000Z
RRULE:FREQ=WEEKLY;COUNT=3
EXDATE;VALUE=DATE:20260608`]);
    expect(await starts(ics)).toEqual(['2026-06-01T09:00:00.000Z', '2026-06-15T09:00:00.000Z']);
  });

  it('a floating EXDATE removes the instance at that wall-clock time of a TZID series', async () => {
    const ics = cal([`UID:x
DTSTART;TZID=Europe/Stockholm:20260601T110000
DTEND;TZID=Europe/Stockholm:20260601T120000
RRULE:FREQ=WEEKLY;COUNT=3
EXDATE:20260608T110000`]);
    expect(await starts(ics, 'UTC')).toEqual(['2026-06-01T09:00:00.000Z', '2026-06-15T09:00:00.000Z']);
  });

  it('a UTC EXDATE removes only the instance at that instant, not one at the same wall-clock time elsewhere', async () => {
    const ics = cal([`UID:x
DTSTART;TZID=Europe/Stockholm:20260601T090000
DTEND;TZID=Europe/Stockholm:20260601T100000
RRULE:FREQ=WEEKLY;COUNT=3
EXDATE:20260608T090000Z`]);
    // 09:00Z is 11:00 in Stockholm, which is not an instance: nothing is removed.
    expect(await starts(ics)).toEqual(['2026-06-01T07:00:00.000Z', '2026-06-08T07:00:00.000Z', '2026-06-15T07:00:00.000Z']);
  });

  it('DTSTART is the first instance even when it does not match the rule, and counts toward COUNT (RFC 5545)', async () => {
    // 2026-06-01 is a Monday; the rule says Tuesdays.
    const ics = cal([`UID:d
DTSTART:20260601T090000Z
DTEND:20260601T100000Z
RRULE:FREQ=WEEKLY;BYDAY=TU;COUNT=3`]);
    expect(await starts(ics)).toEqual(['2026-06-01T09:00:00.000Z', '2026-06-02T09:00:00.000Z', '2026-06-09T09:00:00.000Z']);
  });

  it('a yearly series from Feb 29 only occurs in leap years', async () => {
    const ics = cal([`UID:l
DTSTART;VALUE=DATE:20240229
RRULE:FREQ=YEARLY`]);
    const r = await parseIcalBlocks(ics, { timezone: 'UTC', from: new Date('2025-01-01T00:00:00Z'), to: new Date('2030-01-01T00:00:00Z') });
    expect(r.blocks.map(iso)).toEqual([['2028-02-29T00:00:00.000Z', '2028-03-01T00:00:00.000Z']]);
  });

  it('WEEKLY with INTERVAL=2 counts weeks from WKST', async () => {
    const rule = (wkst: string) => cal([`UID:w
DTSTART:20260602T090000Z
DTEND:20260602T100000Z
RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=${wkst}`]);
    // RFC 5545's own example, moved to June 2026 (2 June is a Tuesday).
    expect((await starts(rule('MO'))).map((s) => s.slice(0, 10))).toEqual(['2026-06-02', '2026-06-07', '2026-06-16', '2026-06-21']);
    expect((await starts(rule('SU'))).map((s) => s.slice(0, 10))).toEqual(['2026-06-02', '2026-06-14', '2026-06-16', '2026-06-28']);
  });
});

// A VTIMEZONE is only used for a TZID Intl does not know. Its STANDARD / DAYLIGHT rules used to be run by ical.js from their
// DTSTART up to a few years ahead, which a hostile rule (DAILY, HOURLY, SECONDLY ... from the year 1) turned into seconds or hours
// of a frozen event loop. Only small, YEARLY zones are accepted now and their offsets are computed in-house; any other zone is
// dropped, its events are read in the business timezone (like an unknown TZID) and each such event counts as unsupported.
describe('parseIcalBlocks: hostile VTIMEZONE blocks', () => {
  type Sub = { kind: 'STANDARD' | 'DAYLIGHT'; dtstart: string; from: string; to: string; extra?: string[] };
  const zone = (tzid: string, subs: Sub[]) => [
    'BEGIN:VTIMEZONE',
    `TZID:${tzid}`,
    ...subs.flatMap((s) => [`BEGIN:${s.kind}`, `DTSTART:${s.dtstart}`, `TZOFFSETFROM:${s.from}`, `TZOFFSETTO:${s.to}`, ...(s.extra ?? []), `END:${s.kind}`]),
    'END:VTIMEZONE',
  ];
  const event = (uid: string, tzid: string, start = '20260701T100000', end = '20260701T110000') => `UID:${uid}
DTSTART;TZID=${tzid}:${start}
DTEND;TZID=${tzid}:${end}`;
  const run = async (ics: string, timezone = SE) => {
    const t0 = performance.now();
    const r = await parseIcalBlocks(ics, { timezone, ...WIDE });
    return { ms: performance.now() - t0, ...r };
  };

  const HOSTILE_RULES = [
    'FREQ=DAILY',
    'FREQ=HOURLY',
    'FREQ=MINUTELY',
    'FREQ=SECONDLY',
    'FREQ=WEEKLY',
    'FREQ=MONTHLY;BYDAY=-1SU',
    'FREQ=YEARLY;BYWEEKNO=53',
  ];
  const cases = HOSTILE_RULES.flatMap((rule) => [
    [rule, '00010101T000000'],
    [rule, '16010101T000000'],
  ]);

  it.each(cases)('RRULE:%s from %s drops the zone quickly and reads the event in the business timezone', async (rule, dtstart) => {
    const tz = zone('Hostile Standard Time', [
      { kind: 'STANDARD', dtstart, from: '+0200', to: '+0100', extra: [`RRULE:${rule}`] },
      { kind: 'DAYLIGHT', dtstart, from: '+0100', to: '+0200', extra: [`RRULE:${rule}`] },
    ]);
    const r = await run(cal([event('e', 'Hostile Standard Time')], tz));
    expect(r.ms).toBeLessThan(600);
    // Business timezone is Stockholm (+02:00 in July), not the zone's own offsets.
    expect(r.blocks.map(iso)).toEqual([['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z']]);
    expect(r.unsupported).toBe(1);
    expect(r.skipped).toBe(0);
  });

  it('a hostile zone is dropped even when the event is in New York business time', async () => {
    const tz = zone('Hostile Standard Time', [{ kind: 'STANDARD', dtstart: '00010101T000000', from: '+0500', to: '+0500', extra: ['RRULE:FREQ=SECONDLY'] }]);
    const r = await run(cal([event('e', 'Hostile Standard Time')], tz), 'America/New_York');
    expect(r.ms).toBeLessThan(600);
    expect(r.blocks.map(iso)).toEqual([['2026-07-01T14:00:00.000Z', '2026-07-01T15:00:00.000Z']]);
    expect(r.unsupported).toBe(1);
  });

  it('many distinct hostile zones in one feed stay fast', async () => {
    const extra: string[] = [];
    const events: string[] = [];
    for (let i = 0; i < 300; i++) {
      const rule = HOSTILE_RULES[i % HOSTILE_RULES.length];
      extra.push(
        ...zone(`Zone ${i}`, [
          { kind: 'STANDARD', dtstart: '00010101T000000', from: '+0200', to: '+0100', extra: [`RRULE:${rule}`] },
          { kind: 'DAYLIGHT', dtstart: '00010101T000000', from: '+0100', to: '+0200', extra: [`RRULE:${rule}`] },
        ]),
      );
      events.push(event(`e${i}`, `Zone ${i}`));
    }
    const r = await run(cal(events, extra));
    expect(r.ms).toBeLessThan(1500);
    expect(r.blocks).toHaveLength(300);
    expect(r.unsupported).toBe(300);
  });

  it('drops a zone with more than two STANDARD / DAYLIGHT parts', async () => {
    const parts: Sub[] = Array.from({ length: 3 }, (_, i) => ({ kind: i % 2 ? 'DAYLIGHT' : 'STANDARD', dtstart: `${2000 + i}0101T000000`, from: '+0000', to: '+0900' }));
    const r = await run(cal([event('e', 'Three Parts')], zone('Three Parts', parts)));
    expect(r.blocks.map(iso)).toEqual([['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z']]);
    expect(r.unsupported).toBe(1);
  });

  it.each(['FREQ=YEARLY;INTERVAL=2;BYMONTH=10;BYDAY=-1SU', 'FREQ=YEARLY;BYMONTH=10', 'FREQ=YEARLY;BYDAY=-1SU', 'FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU;BYHOUR=3'])(
    'drops a zone whose rule %s is not in the allowlist',
    async (rule) => {
      const tz = zone('Odd Rule Time', [
        { kind: 'STANDARD', dtstart: '16011028T030000', from: '+0200', to: '+0100', extra: [`RRULE:${rule}`] },
        { kind: 'DAYLIGHT', dtstart: '16010325T020000', from: '+0100', to: '+0200', extra: ['RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3'] },
      ]);
      const r = await run(cal([event('e', 'Odd Rule Time')], tz), 'America/New_York');
      expect(r.blocks.map(iso)).toEqual([['2026-07-01T14:00:00.000Z', '2026-07-01T15:00:00.000Z']]);
      expect(r.unsupported).toBe(1);
    },
  );

  it('drops a zone with more than 1,000 RDATEs', async () => {
    const many = Array.from({ length: 1001 }, (_, i) => `${1000 + i}0101T000000`).join(',');
    const big = zone('Many Dates', [{ kind: 'STANDARD', dtstart: '09990101T000000', from: '+0000', to: '+0900', extra: [`RDATE:${many}`] }]);
    const r = await run(cal([event('e', 'Many Dates')], big));
    expect(r.ms).toBeLessThan(600);
    expect(r.blocks.map(iso)).toEqual([['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z']]);
    expect(r.unsupported).toBe(1);
  });

  it('accepts a zone made of DTSTART and RDATE changes only', async () => {
    // +09:00 from 2000; +10:00 from 2026-06-01 00:00 local (read in the offset before the change).
    const few = zone('Few Dates', [
      { kind: 'STANDARD', dtstart: '20000101T000000', from: '+0000', to: '+0900' },
      { kind: 'DAYLIGHT', dtstart: '19990101T000000', from: '+0900', to: '+1000', extra: ['RDATE:20260601T000000'] },
    ]);
    const r = await run(cal([event('a', 'Few Dates', '20260501T100000', '20260501T110000'), event('b', 'Few Dates')], few));
    expect(r.unsupported).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-05-01T01:00:00.000Z', '2026-05-01T02:00:00.000Z'],
      ['2026-07-01T00:00:00.000Z', '2026-07-01T01:00:00.000Z'],
    ]);
  });

  it('an Outlook zone from 1601 converts exactly and fast, across both DST changes', async () => {
    const events = [
      event('a', 'W. Europe Standard Time', '20260329T013000', '20260329T014500'), // before the spring change: +01:00
      event('b', 'W. Europe Standard Time', '20260329T033000', '20260329T034500'), // after it: +02:00
      event('c', 'W. Europe Standard Time', '20261024T100000', '20261024T110000'), // +02:00
      event('d', 'W. Europe Standard Time', '20261026T100000', '20261026T110000'), // +01:00
    ];
    const r = await run(cal(events, WINDOWS_VTIMEZONE), 'America/New_York');
    expect(r.ms).toBeLessThan(600);
    expect(r.unsupported).toBe(0);
    expect(r.skipped).toBe(0);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-03-29T00:30:00.000Z', '2026-03-29T00:45:00.000Z'],
      ['2026-03-29T01:30:00.000Z', '2026-03-29T01:45:00.000Z'],
      ['2026-10-24T08:00:00.000Z', '2026-10-24T09:00:00.000Z'],
      ['2026-10-26T09:00:00.000Z', '2026-10-26T10:00:00.000Z'],
    ]);
  });

  it('an Outlook zone gives the same instants as Intl for Europe/Berlin at noon on every day of 2026 and 2030', async () => {
    const days: string[] = [];
    for (const year of [2026, 2030]) {
      for (let t = Date.UTC(year, 0, 1); t < Date.UTC(year + 1, 0, 1); t += 24 * HOUR) days.push(new Date(t).toISOString().slice(0, 10).replace(/-/g, ''));
    }
    const events = days.map((d, i) => event(`n${i}`, 'W. Europe Standard Time', `${d}T120000`, `${d}T130000`));
    const t0 = performance.now();
    const r = await parseIcalBlocks(cal(events, WINDOWS_VTIMEZONE), { timezone: 'UTC', from: new Date('2026-01-01T00:00:00Z'), to: new Date('2031-01-01T00:00:00Z') });
    expect(performance.now() - t0).toBeLessThan(3000);
    const berlin = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' });
    expect(r.blocks).toHaveLength(days.length);
    for (const b of r.blocks) expect(berlin.format(b.startAt)).toBe('12');
  });

  it('a zone rule with UNTIL stops changing the offset after it', async () => {
    // Daylight time ended after 2010: the zone stays on its standard offset (+01:00) afterwards.
    const tz = zone('Ended DST Time', [
      { kind: 'STANDARD', dtstart: '19701025T030000', from: '+0200', to: '+0100', extra: ['RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU'] },
      { kind: 'DAYLIGHT', dtstart: '19700329T020000', from: '+0100', to: '+0200', extra: ['RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU;UNTIL=20100328T010000Z'] },
    ]);
    const r = await run(cal([event('e', 'Ended DST Time')], tz), 'America/New_York');
    expect(r.unsupported).toBe(0);
    expect(r.blocks.map(iso)).toEqual([['2026-07-01T09:00:00.000Z', '2026-07-01T10:00:00.000Z']]);

    // The same with COUNT: five summers from 2022, the last in 2026.
    const counted = zone('Counted DST Time', [
      { kind: 'STANDARD', dtstart: '19701025T030000', from: '+0200', to: '+0100', extra: ['RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU'] },
      { kind: 'DAYLIGHT', dtstart: '20220327T020000', from: '+0100', to: '+0200', extra: ['RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU;COUNT=5'] },
    ]);
    const c = await parseIcalBlocks(cal([event('a', 'Counted DST Time'), event('b', 'Counted DST Time', '20270701T100000', '20270701T110000')], counted), {
      timezone: 'UTC',
      from: new Date('2026-01-01T00:00:00Z'),
      to: new Date('2028-01-01T00:00:00Z'),
    });
    expect(c.unsupported).toBe(0);
    expect(c.blocks.map(iso)).toEqual([
      ['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z'],
      ['2027-07-01T09:00:00.000Z', '2027-07-01T10:00:00.000Z'],
    ]);
  });

  it('a far-future event in an accepted zone converts without iterating from 1601', async () => {
    const t0 = performance.now();
    const r = await parseIcalBlocks(cal([event('f', 'W. Europe Standard Time', '99990701T100000', '99990701T110000')], WINDOWS_VTIMEZONE), {
      timezone: 'UTC',
      from: new Date('9999-01-01T00:00:00Z'),
      to: new Date('9999-12-31T00:00:00Z'),
    });
    expect(performance.now() - t0).toBeLessThan(600);
    expect(r.blocks.map(iso)).toEqual([['9999-07-01T08:00:00.000Z', '9999-07-01T09:00:00.000Z']]);
  });
});

// A history feed (Google's secret address carries every event ever) is mostly past one-off events; parsing each with ical.js
// blocked the event loop for seconds on the booking request. Past events are now dropped from the raw text, and the parse yields to
// the event loop every ~10 ms. It stops after 15 s of its own work (45 s by the wall clock as a safety net) and then says the result
// is incomplete. Timing limits in this file carry about 3x headroom for slow CI; the hangs they guard against took seconds.
describe('parseIcalBlocks: large feeds', () => {
  const pad2 = (n: number) => String(n).padStart(2, '0');
  /** One-off events on consecutive days from 2000-01-01 (all before the 2026 window), about 2 MB in all. */
  function pastFeed(n: number, extra: string[] = []): string {
    const events: string[] = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(Date.UTC(2000, 0, 1) + (i % 9000) * 24 * HOUR);
      const day = `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
      const form = i % 3;
      events.push(
        form === 0
          ? `UID:past-${i}@example.com\nDTSTART:${day}T090000Z\nDTEND:${day}T100000Z\nSUMMARY:Past meeting number ${i} with a fairly long title\nDESCRIPTION:Notes for meeting ${i}`
          : form === 1
            ? `UID:past-${i}@example.com\nDTSTART;TZID=Europe/Stockholm:${day}T090000\nDTEND;TZID=Europe/Stockholm:${day}T100000\nSUMMARY:Past local meeting number ${i}\nDESCRIPTION:Notes for meeting ${i}`
            : `UID:past-${i}@example.com\nDTSTART;VALUE=DATE:${day}\nDTEND;VALUE=DATE:${day}\nSUMMARY:Past all-day event number ${i}\nDESCRIPTION:Notes for event ${i}`,
      );
    }
    return cal([...events, ...extra]);
  }

  it('a 2 MB feed of past one-off events parses in well under a second and keeps the events that matter', async () => {
    const keep = [
      `UID:future\nDTSTART:20260610T090000Z\nDTEND:20260610T100000Z`,
      // Starts long ago and ends inside the window: kept.
      `UID:long\nDTSTART:20000101T090000Z\nDTEND:20260105T100000Z`,
      // A past series without UNTIL still reaches the window.
      `UID:weekly\nDTSTART:20000103T090000Z\nDTEND:20000103T100000Z\nRRULE:FREQ=YEARLY;BYMONTH=6;BYMONTHDAY=12`,
      // A series whose UNTIL is past: dropped from the raw text, nothing lost.
      `UID:ended\nDTSTART:20000103T090000Z\nDTEND:20000103T100000Z\nRRULE:FREQ=WEEKLY;UNTIL=20100101T000000Z`,
      // Ended just before the window but runs into it through the margin: still read (and not in the window).
      `UID:edge\nDTSTART:20251231T090000Z\nDTEND:20251231T235959Z`,
    ];
    const ics = pastFeed(15_000, keep);
    expect(ics.length).toBeGreaterThan(1_900_000);
    const t0 = performance.now();
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    const ms = performance.now() - t0;
    expect(r.blocks.map(iso)).toEqual([
      ['2000-01-01T09:00:00.000Z', '2026-01-05T10:00:00.000Z'],
      ['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z'],
      ['2026-06-12T09:00:00.000Z', '2026-06-12T10:00:00.000Z'],
    ]);
    expect(r.skipped).toBe(0);
    expect(r.unsupported).toBe(0);
    expect(ms).toBeLessThan(900);
  }, 30_000);

  it('drops past events without misreading what is near the window', async () => {
    const r = await parseIcalBlocks(
      cal([
        // all-day, ends on the window start: no overlap but must be read correctly
        `UID:a\nDTSTART;VALUE=DATE:20251231\nDTEND;VALUE=DATE:20260101`,
        // all-day with no DTEND, on the first day of the window
        `UID:b\nDTSTART;VALUE=DATE:20260101`,
        // DURATION (not read from the raw text): parsed as before
        `UID:c\nDTSTART:20251231T230000Z\nDURATION:PT2H`,
        // an override is never dropped from the raw text
        `UID:s\nDTSTART:20260105T090000Z\nDTEND:20260105T100000Z\nRRULE:FREQ=WEEKLY;COUNT=2`,
        `UID:s\nRECURRENCE-ID:20260112T090000Z\nDTSTART:20200101T090000Z\nDTEND:20200101T100000Z`,
        // TZID with quotes and a colon in the parameter
        `UID:q\nDTSTART;TZID="Europe/Stockholm":20260101T003000\nDTEND;TZID="Europe/Stockholm":20260101T013000`,
      ]),
      { timezone: SE, ...WIDE },
    );
    expect(r.blocks.map(iso)).toEqual([
      ['2025-12-31T23:00:00.000Z', '2026-01-01T01:00:00.000Z'],
      ['2025-12-31T23:00:00.000Z', '2026-01-01T23:00:00.000Z'],
      ['2025-12-31T23:30:00.000Z', '2026-01-01T00:30:00.000Z'],
      ['2026-01-05T09:00:00.000Z', '2026-01-05T10:00:00.000Z'],
    ]);
  });

  /** Plain timed events, all inside the 2026 window, in a TZID (the slowest common form). `k` shifts the days, so feeds differ. */
  const futureFeed = (n: number, k = 0) =>
    cal(
      Array.from({ length: n }, (_, i) => {
        const d = new Date(Date.UTC(2026, 0, 2) + ((i + k * 7) % 360) * 24 * HOUR);
        const day = `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
        return `UID:f-${k}-${i}\nDTSTART;TZID=Europe/Stockholm:${day}T${pad2(8 + (i % 10))}0000\nDTEND;TZID=Europe/Stockholm:${day}T${pad2(9 + (i % 10))}0000`;
      }),
    );

  /** Keeps the event loop busy for `ms` on every turn it gets (other requests, from the parse's point of view). */
  function busyNeighbour(ms: number) {
    let stopped = false;
    let turns = 0;
    const tick = () => {
      if (stopped) return;
      turns++;
      const until = performance.now() + ms;
      while (performance.now() < until) {
        /* busy */
      }
      setTimeout(tick, 0);
    };
    setTimeout(tick, 0);
    return {
      stop: () => {
        stopped = true;
      },
      turns: () => turns,
    };
  }

  it('yields to the event loop while it parses a feed of many future events', async () => {
    let ticks = 0;
    const timer = setInterval(() => ticks++, 2);
    try {
      const t0 = performance.now();
      const r = await parseIcalBlocks(futureFeed(3000), { timezone: SE, ...WIDE });
      const ms = performance.now() - t0;
      expect(r.complete).toBe(true);
      expect(r.blocks).toHaveLength(3000);
      // Long enough for at least two ~10 ms slices of work, so a 2 ms timer must fire in between if the loop is not blocked.
      expect(ms).toBeGreaterThan(30);
      expect(ticks).toBeGreaterThan(0);
    } finally {
      clearInterval(timer);
    }
  }, 30_000);

  it('a feed whose own work passes the deadline is returned as incomplete (never as a full result)', async () => {
    const t0 = performance.now();
    const r = await parseIcalBlocks(futureFeed(8000), { timezone: SE, ...WIDE, deadlineMs: 30 });
    expect(performance.now() - t0).toBeLessThan(3000);
    expect(r.complete).toBe(false);
    expect(r.blocks.length).toBeLessThan(8000);
    // The events not read are not folded into the counts of a result that is not stored anyway.
    expect(r.unsupported).toBe(0);
    expect(r.skipped).toBe(0);
  }, 30_000);

  it('a deadline hit while events are still being prepared is incomplete too', async () => {
    const r = await parseIcalBlocks(futureFeed(8000), { timezone: SE, ...WIDE, deadlineMs: 1 });
    expect(r.complete).toBe(false);
    expect(r.blocks).toEqual([]);
  }, 30_000);

  it('defaults: 15 s of own work (2 MB feeds take 2-4 s here; a slower CPU must not fail them for good) and a 45 s wall-clock net', async () => {
    expect(PARSE_DEADLINE_MS).toBe(15_000);
    expect(PARSE_MAX_WALL_MS).toBe(45_000);
    const cron = await import('../../../app/api/cron/calendar-sync/route');
    expect(PARSE_MAX_WALL_MS).toBeLessThan(cron.maxDuration * 1000);
  });

  it('a complete parse says so', async () => {
    const r = await parseIcalBlocks(cal([`UID:a\nDTSTART:20260610T090000Z\nDTEND:20260610T100000Z`]), { timezone: SE, ...WIDE });
    expect(r.complete).toBe(true);
  });

  it('three large feeds read at the same time each finish completely, with the same blocks as when read alone', async () => {
    const feeds = [0, 1, 2].map((k) => futureFeed(6000, k));
    await parseIcalBlocks(feeds[0], { timezone: SE, ...WIDE }); // warm-up, so the timings below are comparable
    const alone: string[][][] = [];
    let slowest = 0;
    for (const f of feeds) {
      const t0 = performance.now();
      const r = await parseIcalBlocks(f, { timezone: SE, ...WIDE });
      slowest = Math.max(slowest, performance.now() - t0);
      expect(r.complete).toBe(true);
      expect(r.blocks).toHaveLength(6000);
      alone.push(r.blocks.map(iso));
    }
    // Every feed alone fits well inside this work limit; three read at once take about three times as long by the wall clock,
    // which is past it (checked below, so the test proves the point): a wall-clock deadline would cut each of them short.
    const limit = Math.ceil(slowest * 1.5);
    const t0 = performance.now();
    const together = await Promise.all(feeds.map((f) => parseIcalBlocks(f, { timezone: SE, ...WIDE, deadlineMs: limit })));
    const wall = performance.now() - t0;
    expect(wall).toBeGreaterThan(limit);
    together.forEach((r, i) => {
      expect(r.complete).toBe(true);
      expect(r.blocks.map(iso)).toEqual(alone[i]);
    });
  }, 120_000);

  it('time spent on other work while the parse waits does not count against its deadline', async () => {
    const feed = futureFeed(3000);
    const t0 = performance.now();
    const alone = await parseIcalBlocks(feed, { timezone: SE, ...WIDE });
    const limit = Math.ceil((performance.now() - t0) * 2) + 20;
    const neighbour = busyNeighbour(40);
    try {
      const t1 = performance.now();
      const r = await parseIcalBlocks(feed, { timezone: SE, ...WIDE, deadlineMs: limit });
      expect(performance.now() - t1).toBeGreaterThan(limit); // the neighbour really took the time
      expect(neighbour.turns()).toBeGreaterThan(0);
      expect(r.complete).toBe(true);
      expect(r.blocks.map(iso)).toEqual(alone.blocks.map(iso));
    } finally {
      neighbour.stop();
    }
  }, 60_000);

  it('a parse kept waiting past the wall-clock safety limit stops as incomplete', async () => {
    const neighbour = busyNeighbour(40);
    try {
      const r = await parseIcalBlocks(futureFeed(3000), { timezone: SE, ...WIDE, maxWallMs: 100 });
      expect(r.complete).toBe(false);
      expect(r.blocks.length).toBeLessThan(3000);
    } finally {
      neighbour.stop();
    }
  }, 60_000);
});

// ical.js parses one component in one go, without a chance to yield: a single oversized event or zone (a 2 MB EXDATE line,
// 50,000 RDATEs) blocked the event loop for up to ~1.8 s. Such a component is skipped before ical.js sees it.
describe('parseIcalBlocks: oversized components', () => {
  const stampOf = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const normal = [`UID:n1\nDTSTART:20260610T090000Z\nDTEND:20260610T100000Z`, `UID:n2\nDTSTART:20260611T090000Z\nDTEND:20260611T100000Z`];

  it('skips a 2 MB event (one EXDATE line of 120,000 values) quickly, counts it unsupported and keeps the other events', async () => {
    const exdates = Array.from({ length: 120_000 }, (_, i) => stampOf(Date.UTC(1990, 0, 1, 9) + i * 24 * HOUR)).join(',');
    const huge = `UID:huge\nDTSTART:19900101T090000Z\nDTEND:19900101T100000Z\nRRULE:FREQ=DAILY\nEXDATE:${exdates}`;
    const ics = cal([normal[0], huge, normal[1]]);
    expect(ics.length).toBeGreaterThan(1_900_000);
    const t0 = performance.now();
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    const ms = performance.now() - t0;
    expect(r.complete).toBe(true);
    expect(r.blocks.map(iso)).toEqual([
      ['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z'],
      ['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z'],
    ]);
    expect(r.unsupported).toBe(1);
    expect(r.skipped).toBe(0);
    expect(ms).toBeLessThan(500); // ical.js took ~1.8 s on this event alone
  }, 30_000);

  it('still reads an event just under the 128 KB limit, and skips one just over it (measured on the properties it reads)', async () => {
    const LIMIT = 128 * 1024;
    // The size comes from an EXDATE line (a property the parser reads; a long DESCRIPTION is dropped before the check).
    const withText = (uid: string, day: string, size: number) => {
      const head = `UID:${uid}\nDTSTART:${day}T090000Z\nDTEND:${day}T100000Z\nEXDATE:`;
      const values = Math.floor((size - head.length - 40) / 17);
      const ex = Array.from({ length: values }, (_, i) => stampOf(Date.UTC(1990, 0, 1, 9) + i * 24 * HOUR)).join(',');
      return `${head}${ex}`; // about `size` characters with BEGIN/END and line ends
    };
    const under = await parseIcalBlocks(cal([withText('under', '20260612', LIMIT - 200)]), { timezone: SE, ...WIDE });
    expect(under.blocks.map(iso)).toEqual([['2026-06-12T09:00:00.000Z', '2026-06-12T10:00:00.000Z']]);
    expect(under.unsupported).toBe(0);
    const over = await parseIcalBlocks(cal([withText('over', '20260613', LIMIT + 200), normal[0]]), { timezone: SE, ...WIDE });
    expect(over.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
    expect(over.unsupported).toBe(1);
  });

  it('drops a zone with 50,000 RDATEs on one line without parsing it; its event is read in the business timezone', async () => {
    const rdates = Array.from({ length: 50_000 }, (_, i) => `${String(1000 + (i % 8000)).padStart(4, '0')}0101T000000`).join(',');
    const zone = ['BEGIN:VTIMEZONE', 'TZID:Huge Zone', 'BEGIN:STANDARD', 'DTSTART:09990101T000000', 'TZOFFSETFROM:+0000', 'TZOFFSETTO:+0900', `RDATE:${rdates}`, 'END:STANDARD', 'END:VTIMEZONE'];
    const t0 = performance.now();
    const r = await parseIcalBlocks(cal([`UID:e\nDTSTART;TZID=Huge Zone:20260701T100000\nDTEND;TZID=Huge Zone:20260701T110000`], zone), { timezone: SE, ...WIDE });
    const ms = performance.now() - t0;
    expect(r.blocks.map(iso)).toEqual([['2026-07-01T08:00:00.000Z', '2026-07-01T09:00:00.000Z']]); // Stockholm, +02:00
    expect(r.unsupported).toBe(1);
    expect(ms).toBeLessThan(300); // ical.js took ~0.6 s on this zone alone
  });
});

// Only the properties the parser reads are handed to ical.js (UID, DTSTART, DTEND, DURATION, RRULE, RDATE, EXDATE, RECURRENCE-ID,
// STATUS, TRANSP of the VEVENT itself; nested parts such as VALARM are dropped whole). Large descriptions, HTML bodies and
// attachments then never reach the 128 KB limit, and cost nothing to parse.
describe('parseIcalBlocks: only the properties the parser reads reach ical.js', () => {
  /** Folds a content line at 75 characters, as feeds do. */
  const fold = (line: string) => line.match(/.{1,75}/g)!.join('\r\n ');
  /** A feed from raw lines (kept as given: folded lines keep their leading space). */
  const raw = (lines: string[]) => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//test//EN', ...lines, 'END:VCALENDAR'].join('\r\n') + '\r\n';
  const timed = (uid: string, day: string, extra: string[]) => [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    'DTSTAMP:20261001T000000Z',
    `DTSTART:${day}T090000Z`,
    `DTEND:${day}T100000Z`,
    ...extra,
    'END:VEVENT',
  ];
  const both = async (ics: string) => {
    const reduced = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    const full = await parseIcalBlocks(ics, { timezone: SE, ...WIDE, keepAllProperties: true });
    return { reduced, full };
  };

  it('an event with a 300 KB DESCRIPTION still blocks its time', async () => {
    const ics = raw(timed('d', '20260610', [fold(`DESCRIPTION:${'Agenda item\\n'.repeat(25_000)}`)]));
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
    expect(r).toMatchObject({ complete: true, skipped: 0, unsupported: 0 });
  });

  it('an event with a 200 KB base64 ATTACH still blocks its time', async () => {
    const b64 = Buffer.from(Array.from({ length: 150_000 }, (_, i) => (i * 7) & 255)).toString('base64');
    expect(b64.length).toBeGreaterThan(195_000);
    const ics = raw(timed('a', '20260611', [fold(`ATTACH;FMTTYPE=application/pdf;ENCODING=BASE64;VALUE=BINARY;X-FILENAME=agenda.pdf:${b64}`)]));
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-06-11T09:00:00.000Z', '2026-06-11T10:00:00.000Z']]);
    expect(r.unsupported).toBe(0);
  });

  it('an event with a 150 KB X-ALT-DESC HTML body still blocks its time', async () => {
    const html = `<html><body>${'<p style="margin:0">Line of the meeting notes; with: colons</p>'.repeat(2400)}</body></html>`;
    expect(html.length).toBeGreaterThan(150_000);
    const ics = raw(timed('h', '20260612', [fold(`X-ALT-DESC;FMTTYPE=text/html:${html}`)]));
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([['2026-06-12T09:00:00.000Z', '2026-06-12T10:00:00.000Z']]);
    expect(r.unsupported).toBe(0);
  });

  it('lower-case property names, parameters and a nested VALARM still work', async () => {
    const lower = raw([
      'begin:vevent',
      'uid:lower-1',
      'dtstart;tzid=Europe/Stockholm:20260105T090000',
      'dtend;tzid=Europe/Stockholm:20260105T100000',
      'rrule:FREQ=WEEKLY;COUNT=3',
      'exdate;tzid=Europe/Stockholm:20260112T090000',
      `description:${'x'.repeat(200_000)}`,
      'begin:valarm',
      'action:DISPLAY',
      'duration:PT15M',
      'trigger:-PT10M',
      'end:valarm',
      'end:vevent',
      'begin:vevent',
      'uid:lower-2',
      'dtstart:20260301T090000Z',
      'duration:PT30M',
      'transp:TRANSPARENT',
      'end:vevent',
      'Begin:VEVENT',
      'Uid:lower-3',
      'DtStart;Value=Date:20260401',
      'Status:CANCELLED',
      'End:VEVENT',
      'begin:vevent',
      'uid:lower-1',
      'recurrence-id;tzid=Europe/Stockholm:20260119T090000',
      'dtstart;tzid=Europe/Stockholm:20260119T130000',
      'dtend;tzid=Europe/Stockholm:20260119T140000',
      'end:vevent',
    ]);
    const r = await parseIcalBlocks(lower, { timezone: SE, ...WIDE });
    expect(r.blocks.map(iso)).toEqual([
      ['2026-01-05T08:00:00.000Z', '2026-01-05T09:00:00.000Z'],
      ['2026-01-19T12:00:00.000Z', '2026-01-19T13:00:00.000Z'],
    ]);
    expect(r).toMatchObject({ complete: true, skipped: 0, unsupported: 0 });
  });

  // Realistic exports (the shapes Google, Outlook and Apple produce): the reduced chunks give exactly the result of the full ones.
  const GOOGLE = raw([
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:owner@example.com',
    'X-WR-TIMEZONE:Europe/Stockholm',
    ...STOCKHOLM_VTIMEZONE,
    'BEGIN:VEVENT',
    'DTSTART;TZID=Europe/Stockholm:20260105T090000',
    'DTEND;TZID=Europe/Stockholm:20260105T100000',
    'RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=20260330T065959Z;BYDAY=MO',
    'EXDATE;TZID=Europe/Stockholm:20260119T090000',
    'DTSTAMP:20261001T000000Z',
    'UID:7kukuqrfedlm2f9t3ruoh7o0bf@google.com',
    'CREATED:20251201T100000Z',
    fold(`DESCRIPTION:Weekly sync about the roadmap: see https://docs.example.com/a?b=c\\nJoin: https://meet.example.com/abc-defg-hij\\n${'Notes. '.repeat(80)}`),
    'LAST-MODIFIED:20251202T100000Z',
    'LOCATION:Room 1\\, Floor 2',
    'SEQUENCE:0',
    'STATUS:CONFIRMED',
    'SUMMARY:Weekly sync',
    'TRANSP:OPAQUE',
    fold('ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Jane Doe;X-NUM-GUESTS=0:mailto:jane@example.com'),
    'ORGANIZER;CN=owner@example.com:mailto:owner@example.com',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:This is an event reminder',
    'TRIGGER:-P0DT0H10M0S',
    'END:VALARM',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;TZID=Europe/Stockholm:20260126T110000',
    'DTEND;TZID=Europe/Stockholm:20260126T120000',
    'DTSTAMP:20261001T000000Z',
    'UID:7kukuqrfedlm2f9t3ruoh7o0bf@google.com',
    'RECURRENCE-ID;TZID=Europe/Stockholm:20260126T090000',
    'SEQUENCE:1',
    'STATUS:CONFIRMED',
    'SUMMARY:Weekly sync (moved)',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20260704',
    'DTEND;VALUE=DATE:20260706',
    'UID:allday@google.com',
    'SUMMARY:Trip',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20260710',
    'DTEND;VALUE=DATE:20260711',
    'UID:free@google.com',
    'SUMMARY:Reminder only',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART:20260801T090000Z',
    'DTEND:20260801T100000Z',
    'UID:cancelled@google.com',
    'STATUS:CANCELLED',
    'END:VEVENT',
  ]);

  const OUTLOOK = raw([
    'METHOD:PUBLISH',
    'X-MS-OLK-FORCEINSPECTOROPEN:TRUE',
    ...WINDOWS_VTIMEZONE,
    'BEGIN:VEVENT',
    'CLASS:PUBLIC',
    'CREATED:20260201T080000Z',
    'DESCRIPTION:\\n',
    'DTEND;TZID="W. Europe Standard Time":20260310T150000',
    'DTSTAMP:20261001T000000Z',
    'DTSTART;TZID="W. Europe Standard Time":20260310T140000',
    'LAST-MODIFIED:20260201T080000Z',
    'PRIORITY:5',
    'RRULE:FREQ=DAILY;COUNT=5',
    'SEQUENCE:0',
    'SUMMARY;LANGUAGE=en-us:Standup',
    'TRANSP:OPAQUE',
    'UID:040000008200E00074C5B7101A82E00800000000A0B1C2D3E4F5A601000000000000000010000000F1E2D3C4B5A69788',
    fold(`X-ALT-DESC;FMTTYPE=text/html:<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2//EN"><html><body>${'<p>Standup: notes</p>'.repeat(60)}</body></html>`),
    'X-MICROSOFT-CDO-BUSYSTATUS:BUSY',
    'X-MICROSOFT-CDO-IMPORTANCE:1',
    'X-MICROSOFT-CDO-ALLDAYEVENT:FALSE',
    'X-MICROSOFT-DISALLOW-COUNTER:FALSE',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'DTSTART;VALUE=DATE:20260320',
    'DTEND;VALUE=DATE:20260321',
    'UID:outlook-allday',
    'X-MICROSOFT-CDO-ALLDAYEVENT:TRUE',
    'X-MICROSOFT-CDO-BUSYSTATUS:OOF',
    'END:VEVENT',
  ]);

  const APPLE = raw([
    'X-WR-CALNAME:Home',
    'BEGIN:VEVENT',
    'CREATED:20260101T100000Z',
    'UID:8F1C2E8A-1234-4BCD-9EF0-0123456789AB',
    'DTSTART;VALUE=DATE:20260601',
    'DTEND;VALUE=DATE:20260603',
    'RDATE;VALUE=DATE:20260701',
    'SUMMARY:Holiday',
    'URL;VALUE=URI:https://example.com/a:b',
    fold('X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS="Drottninggatan 1\\n111 51 Stockholm\\nSweden";X-APPLE-RADIUS=70;X-TITLE="Office: 3rd floor":geo:59.33,18.06'),
    'X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC',
    'DTSTAMP:20261001T000000Z',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'X-WR-ALARMUID:0A1B2C3D',
    'UID:0A1B2C3D',
    'TRIGGER;VALUE=DATE-TIME:19760401T005545Z',
    'ACTION:NONE',
    'END:VALARM',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:apple-timed',
    'DTSTART;TZID=Europe/Stockholm:20260915T080000',
    'DURATION:PT1H30M',
    'SUMMARY:Dentist',
    'END:VEVENT',
  ]);

  it.each([
    ['Google', GOOGLE, 12], // 11 Mondays (one excluded, one moved) and the two-day trip
    ['Outlook', OUTLOOK, 6],
    ['Apple', APPLE, 3],
  ])('a realistic %s export gives exactly the same result as the full chunks', async (_name, ics, count) => {
    const { reduced, full } = await both(ics);
    expect(reduced).toEqual(full);
    expect(reduced.blocks).toHaveLength(count);
    expect(reduced).toMatchObject({ complete: true, skipped: 0, unsupported: 0 });
  });

  it('the pathological 2 MB EXDATE line is still skipped quickly (EXDATE is a property the parser reads)', async () => {
    const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const exdates = Array.from({ length: 120_000 }, (_, i) => stamp(Date.UTC(1990, 0, 1, 9) + i * 24 * HOUR)).join(',');
    const ics = raw([...timed('huge', '19900101', ['RRULE:FREQ=DAILY', `EXDATE:${exdates}`]), ...timed('ok', '20260610', [])]);
    const t0 = performance.now();
    const r = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    expect(performance.now() - t0).toBeLessThan(500);
    expect(r.blocks.map(iso)).toEqual([['2026-06-10T09:00:00.000Z', '2026-06-10T10:00:00.000Z']]);
    expect(r.unsupported).toBe(1);
  }, 30_000);

  it('a feed whose events carry large descriptions parses faster than with the full chunks, with the same result', async () => {
    const events: string[] = [];
    for (let i = 0; i < 300; i++) {
      const d = new Date(Date.UTC(2026, 0, 2) + i * 24 * HOUR).toISOString().slice(0, 10).replace(/-/g, '');
      events.push(...timed(`big-${i}`, d, [fold(`DESCRIPTION:${`Notes for meeting ${i}\\, with details: `.repeat(400)}`), 'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY', 'END:VALARM']));
    }
    const ics = raw(events);
    await parseIcalBlocks(ics, { timezone: SE, ...WIDE }); // warm-up
    await parseIcalBlocks(ics, { timezone: SE, ...WIDE, keepAllProperties: true });
    const t0 = performance.now();
    const reduced = await parseIcalBlocks(ics, { timezone: SE, ...WIDE });
    const tReduced = performance.now() - t0;
    const t1 = performance.now();
    const full = await parseIcalBlocks(ics, { timezone: SE, ...WIDE, keepAllProperties: true });
    const tFull = performance.now() - t1;
    expect(reduced).toEqual(full);
    expect(reduced.blocks).toHaveLength(300);
    expect(tReduced).toBeLessThan(tFull);
  }, 60_000);
});

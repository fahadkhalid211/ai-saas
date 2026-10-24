import { describe, it, expect } from 'vitest';
import { CALENDAR_LABEL_OPTIONS, maskCalendarUrl, relativeTime, toLinkView } from './link-view';
import type { CalendarLink } from './sync/types';

const SECRET = 'tok9F8e7D6c5B4a3';

describe('maskCalendarUrl', () => {
  it('keeps the origin and a short plain first path segment, nothing else', () => {
    expect(maskCalendarUrl(`https://calendar.google.com/calendar/ical/me%40x.com/private-${SECRET}/basic.ics?sig=${SECRET}`)).toBe('https://calendar.google.com/calendar/…');
    expect(maskCalendarUrl(`https://p12-caldav.icloud.com/published/2/${SECRET}`)).toBe('https://p12-caldav.icloud.com/published/…');
    expect(maskCalendarUrl(`https://outlook.office365.com/owa/calendar/abc@x.com/${SECRET}/calendar.ics`)).toBe('https://outlook.office365.com/owa/…');
  });

  it('shows only the origin when the first segment could itself be the secret', () => {
    for (const url of [
      `https://cal.example.com/${SECRET}.ics`,
      `https://cal.example.com/${SECRET}/feed`,
      `https://cal.example.com/feed.ics?token=${SECRET}`,
      `https://cal.example.com/abcdefghijklmnopqrstuvwxyz/feed`,
      `https://cal.example.com/?token=${SECRET}`,
      `https://cal.example.com`,
    ]) {
      const masked = maskCalendarUrl(url);
      expect(masked, url).toBe('https://cal.example.com/…');
      expect(masked).not.toContain(SECRET);
    }
  });

  it('never contains a query string, fragment, credentials or the full path', () => {
    const masked = maskCalendarUrl(`https://user:pw@cal.example.com:8443/ical/${SECRET}/x.ics?a=1#frag`);
    expect(masked).toBe('https://cal.example.com:8443/ical/…');
    for (const bad of ['user', 'pw', SECRET, '?', '#', 'x.ics']) expect(masked).not.toContain(bad);
  });

  it('rewrites webcal:// as https:// and survives garbage', () => {
    expect(maskCalendarUrl(`webcal://cal.example.com/ical/${SECRET}.ics`)).toBe('https://cal.example.com/ical/…');
    expect(maskCalendarUrl('not a url with a secret')).toBe('Calendar link');
    expect(maskCalendarUrl('')).toBe('Calendar link');
  });
});

describe('relativeTime', () => {
  const now = Date.parse('2026-10-24T12:00:00.000Z');
  const ago = (ms: number) => new Date(now - ms).toISOString();
  it('says never for a missing or unreadable time', () => {
    expect(relativeTime(undefined, now)).toEqual({ kind: 'never' });
    expect(relativeTime(null, now)).toEqual({ kind: 'never' });
    expect(relativeTime('garbage', now)).toEqual({ kind: 'never' });
  });
  it('buckets minutes, hours, days and falls back to a date after 30 days', () => {
    expect(relativeTime(ago(20_000), now)).toEqual({ kind: 'just_now' });
    expect(relativeTime(ago(5 * 60_000), now)).toEqual({ kind: 'minutes', n: 5 });
    expect(relativeTime(ago(59 * 60_000), now)).toEqual({ kind: 'minutes', n: 59 });
    expect(relativeTime(ago(3 * 3600_000 + 5000), now)).toEqual({ kind: 'hours', n: 3 });
    expect(relativeTime(ago(2 * 86400_000), now)).toEqual({ kind: 'days', n: 2 });
    expect(relativeTime(ago(31 * 86400_000), now)).toEqual({ kind: 'date' });
  });
  it('treats a time slightly in the future (clock skew) as just now', () => {
    expect(relativeTime(new Date(now + 30_000).toISOString(), now)).toEqual({ kind: 'just_now' });
  });
});

describe('label help', () => {
  it('has the four labels with help naming where the private link lives', () => {
    expect(CALENDAR_LABEL_OPTIONS.map((o) => o.value)).toEqual(['google', 'apple', 'outlook', 'other']);
    const help = Object.fromEntries(CALENDAR_LABEL_OPTIONS.map((o) => [o.value, o.help]));
    expect(help.google).toContain('Secret address in iCal format');
    expect(help.apple).toContain('Public Calendar');
    expect(help.outlook).toContain('Publish a calendar');
    expect(help.other).toContain('.ics');
    expect(help.other).toContain('webcal://');
  });
});

describe('toLinkView', () => {
  const link: CalendarLink = {
    id: 'cal_1',
    assistantId: 'ast_1',
    label: 'google',
    url: `https://calendar.google.com/calendar/ical/me/private-${SECRET}/basic.ics?sig=${SECRET}`,
    createdAt: '2026-10-01T00:00:00.000Z',
    lastSyncedAt: '2026-10-24T11:00:00.000Z',
    blockCount: 4,
    unsupportedCount: 1,
    etag: `"etag-${SECRET}"`,
    errorSince: '2026-10-23T00:00:00.000Z',
  };
  it('exposes only the listed fields', () => {
    const view = toLinkView(link);
    expect(Object.keys(view).sort()).toEqual(['blockCount', 'createdAt', 'id', 'label', 'lastError', 'lastSyncedAt', 'maskedUrl', 'unsupportedCount']);
    expect(JSON.stringify(view)).not.toContain(SECRET);
    expect(view.blockCount).toBe(4);
    expect(view.lastError).toBeNull();
  });
  it('defaults the counts to 0 and scrubs the address and any other link from the error', () => {
    const view = toLinkView({ ...link, blockCount: undefined, unsupportedCount: undefined, lastError: `Failed https://other.example.com/x?t=${SECRET} and ${link.url} done` });
    expect(view.blockCount).toBe(0);
    expect(view.unsupportedCount).toBe(0);
    expect(view.lastError).not.toContain(SECRET);
    expect(view.lastError).not.toContain('http');
    expect(view.lastError).toContain('done');
  });
});

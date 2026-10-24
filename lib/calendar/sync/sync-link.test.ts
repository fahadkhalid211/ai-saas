import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const feed = vi.hoisted(() => ({ fetch: vi.fn() }));

// Only the network is faked. The parser and the stores are real (a temp DATA_DIR JSON file), so these tests assert what is stored.
vi.mock('./fetch-feed', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./fetch-feed')>();
  return { ...actual, fetchCalendarFeed: (...args: unknown[]) => feed.fetch(...args) };
});

import { Database, resolveDataDir, type AssistantData } from '@/lib/db';
import * as logger from '@/lib/logging/logger';
import type { CalendarLink } from './types';
import * as clashes from './clashes';
import { syncCalendarLink, refreshAssistantCalendars, syncDueCalendars, _resetSyncStateForTesting } from './sync-link';

// Same blanking as lib/db/fail-closed.test.ts: nothing here may reach a real database or cache.
const REAL_BACKEND_ENV = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];
const dataFile = () => path.join(resolveDataDir(), 'calendar-sync.json');

const SECRET = 'SECRETKEY-9f8e7d6c5b4a';
const URL_OF = (n: number | string) => `https://calendar.example.com/private/${SECRET}-${n}/basic.ics`;
const NOW = new Date('2026-10-24T10:00:00.000Z');

let seq = 0;

beforeEach(() => {
  for (const k of REAL_BACKEND_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  fs.rmSync(dataFile(), { force: true });
  feed.fetch.mockReset();
  _resetSyncStateForTesting();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const vevent = (uid: string, start: string, end: string, extra = '') =>
  `BEGIN:VEVENT\r\nUID:${uid}\r\nDTSTAMP:20261001T000000Z\r\nDTSTART:${start}\r\nDTEND:${end}\r\nSUMMARY:Busy\r\n${extra}END:VEVENT\r\n`;
const ics = (...events: string[]) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//test//EN\r\n${events.join('')}END:VCALENDAR\r\n`;
const okFeed = (text: string, extra: Record<string, string> = {}) => ({ status: 'ok' as const, text, ...extra });

async function newAssistant(timezone = 'UTC'): Promise<AssistantData> {
  const created = await Database.createAssistant({ name: 'Sync test', workspaceId: `ws_sync_${Date.now().toString(36)}_${seq++}` });
  return (await Database.updateAssistant(created.id, { timezone, supportReceiverEmail: 'owner@example.com' }))!;
}

async function addLink(assistantId: string, over: Partial<CalendarLink> = {}): Promise<CalendarLink> {
  const l: CalendarLink = {
    id: `cal_${seq++}_${Math.random().toString(36).slice(2, 7)}`,
    assistantId,
    label: 'google',
    url: URL_OF(seq),
    createdAt: new Date(Date.UTC(2026, 9, 1, 8, 0, 0) + seq * 1000).toISOString(),
    ...over,
  };
  await Database.saveCalendarLink(l);
  return l;
}

const reload = async (l: CalendarLink) => (await Database.getCalendarLinks(l.assistantId)).find((x) => x.id === l.id)!;
const storedBlocks = async (assistantId: string) => (await Database.getExternalBlocks(assistantId)).map((b) => [b.startAt.toISOString(), b.endAt.toISOString()]);

const TOMORROW_ICS = ics(vevent('a', '20261025T090000Z', '20261025T100000Z'), vevent('b', '20261026T130000Z', '20261026T140000Z'));

describe('syncCalendarLink', () => {
  it('a successful read replaces the blocks, clears the error and records the status', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id, { lastError: 'old trouble', errorSince: '2026-10-23T00:00:00.000Z' });
    await Database.replaceExternalBlocks(link.id, ast.id, [{ startAt: new Date('2026-10-30T09:00:00Z'), endAt: new Date('2026-10-30T10:00:00Z') }]);
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS, { etag: '"v2"', lastModified: 'Sat, 24 Oct 2026 09:00:00 GMT' }));

    const res = await syncCalendarLink(link, ast, NOW);

    expect(res).toEqual({ ok: true, blocks: 2 });
    expect(await storedBlocks(ast.id)).toEqual([
      ['2026-10-25T09:00:00.000Z', '2026-10-25T10:00:00.000Z'],
      ['2026-10-26T13:00:00.000Z', '2026-10-26T14:00:00.000Z'],
    ]);
    const got = await reload(link);
    expect(got).toMatchObject({ lastSyncedAt: NOW.toISOString(), etag: '"v2"', lastModified: 'Sat, 24 Oct 2026 09:00:00 GMT', blockCount: 2, unsupportedCount: 0 });
    expect(got.lastError).toBeUndefined();
    expect(got.errorSince).toBeUndefined();
  });

  it('sends the stored validators and reads only now-1 day to now+180 days in the assistant timezone', async () => {
    const ast = await newAssistant('America/New_York');
    const link = await addLink(ast.id, {
      etag: '"old"',
      lastModified: 'Fri, 23 Oct 2026 09:00:00 GMT',
      blockCount: 0,
      fullSyncedAt: new Date(NOW.getTime() - 60 * 60_000).toISOString(),
      parsedTimezone: 'America/New_York',
    });
    feed.fetch.mockResolvedValue(
      okFeed(
        ics(
          vevent('inside', '20261101T120000Z', '20261101T130000Z'),
          vevent('too-old', '20261020T120000Z', '20261020T130000Z'),
          vevent('too-far', '20270601T120000Z', '20270601T130000Z'),
          // floating time is read in the business zone: 09:00 New York on 2026-10-27 (EDT) = 13:00 UTC
          vevent('floating', '20261027T090000', '20261027T100000'),
        ),
      ),
    );

    await syncCalendarLink(link, ast, NOW);

    expect(feed.fetch).toHaveBeenCalledWith(link.url, { etag: '"old"', lastModified: 'Fri, 23 Oct 2026 09:00:00 GMT' });
    expect(await storedBlocks(ast.id)).toEqual([
      ['2026-10-27T13:00:00.000Z', '2026-10-27T14:00:00.000Z'],
      ['2026-11-01T12:00:00.000Z', '2026-11-01T13:00:00.000Z'],
    ]);
  });

  it('a failed fetch keeps the old blocks, sets a short error without the link, and keeps errorSince on the next failure', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValueOnce(okFeed(TOMORROW_ICS));
    await syncCalendarLink(link, ast, NOW);
    const before = await storedBlocks(ast.id);

    feed.fetch.mockResolvedValue({ status: 'error', error: 'The calendar at calendar.example.com answered with an error (HTTP 500).' });
    const later = new Date(NOW.getTime() + 60 * 60 * 1000);
    const res = await syncCalendarLink(await reload(link), ast, later);

    expect(res.ok).toBe(false);
    expect(res.blocks).toBe(2);
    expect(res.error).toContain('HTTP 500');
    expect(await storedBlocks(ast.id)).toEqual(before);
    const failed = await reload(link);
    expect(failed.lastError).toContain('HTTP 500');
    expect(failed.lastError).not.toContain(SECRET);
    expect(failed.errorSince).toBe(later.toISOString());
    // a successful read from earlier is not erased by the failure
    expect(failed.lastSyncedAt).toBe(NOW.toISOString());

    const muchLater = new Date(NOW.getTime() + 5 * 60 * 60 * 1000);
    await syncCalendarLink(failed, ast, muchLater);
    expect((await reload(link)).errorSince).toBe(later.toISOString());
  });

  it('removes the link address from an error text before storing it', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValue({ status: 'error', error: `Could not read ${link.url} right now.` });
    const res = await syncCalendarLink(link, ast, NOW);
    expect(res.error).not.toContain(SECRET);
    expect((await reload(link)).lastError).not.toContain(SECRET);
    expect(fs.readFileSync(dataFile(), 'utf-8').split(SECRET).length - 1).toBe(1); // only the stored url itself
  });

  it('a page that is not a calendar (HTML) keeps the old blocks and says the link was not readable', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValueOnce(okFeed(TOMORROW_ICS));
    await syncCalendarLink(link, ast, NOW);

    feed.fetch.mockResolvedValue(okFeed('<!doctype html><html><body>Please sign in</body></html>'));
    const res = await syncCalendarLink(await reload(link), ast, new Date(NOW.getTime() + 1000));

    expect(res).toMatchObject({ ok: false, blocks: 2, error: 'The link did not return a readable calendar' });
    expect(await storedBlocks(ast.id)).toHaveLength(2);
    const got = await reload(link);
    expect(got.lastError).toBe('The link did not return a readable calendar');
    expect(got.errorSince).toBeTruthy();
  });

  it('not_modified keeps the blocks, sets lastSyncedAt and clears an old error', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id, { etag: '"v1"' });
    feed.fetch.mockResolvedValueOnce(okFeed(TOMORROW_ICS, { etag: '"v1"' }));
    await syncCalendarLink(link, ast, NOW);
    await Database.updateCalendarLinkStatus(ast.id, link.id, { lastError: 'earlier trouble', errorSince: '2026-10-23T00:00:00.000Z' });

    feed.fetch.mockResolvedValue({ status: 'not_modified' });
    const later = new Date(NOW.getTime() + 11 * 60 * 1000);
    const res = await syncCalendarLink(await reload(link), ast, later);

    expect(res).toEqual({ ok: true, blocks: 2 });
    expect(await storedBlocks(ast.id)).toHaveLength(2);
    const got = await reload(link);
    expect(got.lastSyncedAt).toBe(later.toISOString());
    expect(got.lastError).toBeUndefined();
    expect(got.errorSince).toBeUndefined();
    expect(got.etag).toBe('"v1"');
  });

  it('a readable calendar with no events is an emptied calendar: the blocks are replaced with none', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValueOnce(okFeed(TOMORROW_ICS));
    await syncCalendarLink(link, ast, NOW);
    expect(await storedBlocks(ast.id)).toHaveLength(2);

    feed.fetch.mockResolvedValue(okFeed(ics()));
    const res = await syncCalendarLink(await reload(link), ast, new Date(NOW.getTime() + 1000));

    expect(res).toEqual({ ok: true, blocks: 0 });
    expect(await storedBlocks(ast.id)).toEqual([]);
    expect((await reload(link)).blockCount).toBe(0);
  });

  it('records how many events have repeats that cannot be followed', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValue(
      okFeed(ics(vevent('plain', '20261025T090000Z', '20261025T100000Z'), vevent('odd', '20261026T090000Z', '20261026T100000Z', 'RRULE:FREQ=SECONDLY;COUNT=5\r\n'))),
    );
    const res = await syncCalendarLink(link, ast, NOW);
    expect(res.ok).toBe(true);
    expect((await reload(link)).unsupportedCount).toBe(1);
  });

  it('a link removed while its feed was being read is not brought back, stores no blocks and makes no error noise', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    const info = vi.spyOn(logger, 'logEvent');
    feed.fetch.mockImplementation(async () => {
      await Database.deleteCalendarLink(ast.id, link.id);
      return okFeed(TOMORROW_ICS);
    });

    const res = await syncCalendarLink(link, ast, NOW);

    expect(res.ok).toBe(false);
    expect(res.error).toBeUndefined();
    expect(await Database.getCalendarLinks(ast.id)).toEqual([]);
    expect(await Database.getExternalBlocks(ast.id)).toEqual([]);
    expect(fs.readFileSync(dataFile(), 'utf-8')).not.toContain(link.id);
    expect(info.mock.calls.filter((c) => c[0].level === 'error' || c[0].level === 'warn')).toEqual([]);
  });

  it('a fetch error for a link removed meanwhile does not re-create it either', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockImplementation(async () => {
      await Database.deleteCalendarLink(ast.id, link.id);
      return { status: 'error', error: 'The calendar at calendar.example.com did not answer.' };
    });
    const res = await syncCalendarLink(link, ast, NOW);
    expect(res.ok).toBe(false);
    expect(await Database.getCalendarLinks(ast.id)).toEqual([]);
  });

  it('two calls for the same link at once share one read', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    let release!: () => void;
    feed.fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = () => resolve(okFeed(TOMORROW_ICS));
        }),
    );

    const first = syncCalendarLink(link, ast, NOW);
    const second = syncCalendarLink(link, ast, NOW);
    await vi.waitFor(() => expect(feed.fetch).toHaveBeenCalledTimes(1));
    release();
    const [a, b] = await Promise.all([first, second]);

    expect(feed.fetch).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
    expect(a).toEqual({ ok: true, blocks: 2 });

    // once finished the next call reads again
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    await syncCalendarLink(link, ast, NOW);
    expect(feed.fetch).toHaveBeenCalledTimes(2);
  });

  it('never throws, even when storing fails: it reports the failure', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    vi.spyOn(Database, 'replaceExternalBlocks').mockRejectedValue(Object.assign(new Error(`write failed for ${link.url}`), { name: 'BookingUnavailableError' }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const events = vi.spyOn(logger, 'logEvent');

    const res = await syncCalendarLink(link, ast, NOW);

    expect(res.ok).toBe(false);
    expect(JSON.stringify([res, events.mock.calls, warn.mock.calls])).not.toContain(SECRET);
  });
});

describe('refreshAssistantCalendars', () => {
  it('an assistant without links costs one read of its links and nothing else', async () => {
    const ast = await newAssistant();
    const getLinks = vi.spyOn(Database, 'getCalendarLinks');
    const getBlocks = vi.spyOn(Database, 'getExternalBlocks');
    const update = vi.spyOn(Database, 'updateCalendarLinkStatus');

    expect(await refreshAssistantCalendars(ast)).toEqual({ stale: false });

    expect(getLinks).toHaveBeenCalledTimes(1);
    expect(getBlocks).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(feed.fetch).not.toHaveBeenCalled();
  });

  it('links read less than maxAgeMs ago are not read again', async () => {
    const ast = await newAssistant();
    await addLink(ast.id, { lastSyncedAt: new Date(Date.now() - 10_000).toISOString() });
    expect(await refreshAssistantCalendars(ast)).toEqual({ stale: false });
    expect(feed.fetch).not.toHaveBeenCalled();
  });

  it('reads links that are older than maxAgeMs or never read, in parallel, and is not stale when they succeed', async () => {
    const ast = await newAssistant();
    const old = await addLink(ast.id, { lastSyncedAt: new Date(Date.now() - 5 * 60_000).toISOString() });
    const never = await addLink(ast.id);
    await addLink(ast.id, { lastSyncedAt: new Date(Date.now() - 1000).toISOString() });
    let inFlight = 0;
    let maxInFlight = 0;
    feed.fetch.mockImplementation(async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 20));
      inFlight--;
      return okFeed(TOMORROW_ICS);
    });

    expect(await refreshAssistantCalendars(ast)).toEqual({ stale: false });

    expect(feed.fetch).toHaveBeenCalledTimes(2);
    expect(maxInFlight).toBe(2);
    expect((await reload(old)).lastSyncedAt).toBeTruthy();
    expect((await reload(never)).blockCount).toBe(2);
    expect((await Database.getExternalBlocks(ast.id)).length).toBeGreaterThan(0);
  });

  it('is stale when a read fails, and also when a link skipped as fresh still carries an error', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    feed.fetch.mockResolvedValue({ status: 'error', error: 'The calendar at calendar.example.com did not answer.' });
    expect(await refreshAssistantCalendars(ast)).toEqual({ stale: true });

    const ast2 = await newAssistant();
    await addLink(ast2.id, { lastSyncedAt: new Date().toISOString(), lastError: 'trouble', errorSince: new Date().toISOString() });
    feed.fetch.mockClear();
    expect(await refreshAssistantCalendars(ast2)).toEqual({ stale: true });
    expect(feed.fetch).not.toHaveBeenCalled();
  });

  it('does not hammer a link that keeps failing: it is retried at most once per maxAgeMs in one process', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    feed.fetch.mockResolvedValue({ status: 'error', error: 'The calendar at calendar.example.com did not answer.' });
    await refreshAssistantCalendars(ast);
    await refreshAssistantCalendars(ast);
    await refreshAssistantCalendars(ast);
    expect(feed.fetch).toHaveBeenCalledTimes(1);
  });

  it('a read that hangs makes it resolve after the 3 second cap with stale: true', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    feed.fetch.mockImplementation(() => new Promise(() => undefined));
    const events = vi.spyOn(logger, 'logEvent');
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    let result: { stale: boolean } | undefined;
    const pending = refreshAssistantCalendars(ast).then((r) => (result = r));
    await vi.advanceTimersByTimeAsync(2900);
    expect(result).toBeUndefined();
    await vi.advanceTimersByTimeAsync(200);
    await pending;

    expect(result).toEqual({ stale: true });
    const logged = events.mock.calls.map((c) => c[0]).find((e) => e.event === 'booking.calendar_stale');
    expect(logged).toBeTruthy();
    expect(JSON.stringify(logged)).not.toContain(SECRET);
    expect(JSON.stringify(logged)).not.toContain('calendar.example.com');
  });

  it('honours a custom timeout', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    feed.fetch.mockImplementation(() => new Promise(() => undefined));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    let result: { stale: boolean } | undefined;
    const pending = refreshAssistantCalendars(ast, { timeoutMs: 500 }).then((r) => (result = r));
    await vi.advanceTimersByTimeAsync(600);
    await pending;
    expect(result).toEqual({ stale: true });
  });

  it('swallows every error: an unreadable links table resolves stale and logs without personal data', async () => {
    const ast = await newAssistant();
    vi.spyOn(Database, 'getCalendarLinks').mockRejectedValue(Object.assign(new Error('connect failed to db.example.com'), { name: 'BookingUnavailableError' }));
    const events = vi.spyOn(logger, 'logEvent');

    await expect(refreshAssistantCalendars(ast)).resolves.toEqual({ stale: true });

    const logged = events.mock.calls.map((c) => c[0]).find((e) => e.event === 'booking.calendar_stale');
    expect(logged).toBeTruthy();
    expect(JSON.stringify(logged)).not.toContain('db.example.com');
    expect(JSON.stringify(logged)).not.toContain('Sync test');
  });

  it('swallows a throwing sync as well', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    feed.fetch.mockImplementation(() => {
      throw new Error('boom');
    });
    await expect(refreshAssistantCalendars(ast)).resolves.toEqual({ stale: true });
  });
});

describe('syncDueCalendars', () => {
  it('reads links never read or older than the age limit, skips fresh ones, and counts failures', async () => {
    const ast = await newAssistant();
    const never = await addLink(ast.id);
    const old = await addLink(ast.id, { lastSyncedAt: new Date(NOW.getTime() - 11 * 60_000).toISOString() });
    const fresh = await addLink(ast.id, { lastSyncedAt: new Date(NOW.getTime() - 5 * 60_000).toISOString() });
    feed.fetch.mockImplementation(async (url: string) => (url === old.url ? { status: 'error', error: 'The calendar at calendar.example.com did not answer.' } : okFeed(TOMORROW_ICS)));

    const res = await syncDueCalendars(NOW);

    expect(res).toEqual({ checked: 2, failed: 1, skipped: 0, clashChecksSkipped: 0 });
    expect(feed.fetch).toHaveBeenCalledTimes(2);
    expect((await reload(never)).lastSyncedAt).toBe(NOW.toISOString());
    expect((await reload(old)).lastError).toBeTruthy();
    expect((await reload(fresh)).lastSyncedAt).toBe(new Date(NOW.getTime() - 5 * 60_000).toISOString());
  });

  it('a custom age limit is used', async () => {
    const ast = await newAssistant();
    await addLink(ast.id, { lastSyncedAt: new Date(NOW.getTime() - 5 * 60_000).toISOString() });
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    expect(await syncDueCalendars(NOW, 60_000)).toEqual({ checked: 1, failed: 0, skipped: 0, clashChecksSkipped: 0 });
  });

  it('one link that throws or fails never stops the others', async () => {
    const ast = await newAssistant();
    const bad = await addLink(ast.id);
    const worse = await addLink(ast.id);
    const good = await addLink(ast.id);
    feed.fetch.mockImplementation(async (url: string) => {
      if (url === bad.url) throw new Error('network exploded');
      if (url === worse.url) return { status: 'error', error: 'The calendar at calendar.example.com did not answer.' };
      return okFeed(TOMORROW_ICS);
    });

    const res = await syncDueCalendars(NOW);

    expect(res).toEqual({ checked: 3, failed: 2, skipped: 0, clashChecksSkipped: 0 });
    expect((await reload(good)).blockCount).toBe(2);
  });

  it('skips a link whose assistant no longer exists without failing the run', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    const orphan = await addLink(`ast_gone_${seq++}`);
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    expect(await syncDueCalendars(NOW)).toEqual({ checked: 1, failed: 0, skipped: 0, clashChecksSkipped: 0 });
    expect(feed.fetch).not.toHaveBeenCalledWith(orphan.url, expect.anything());
  });

  it('reads at most 3 links at a time and stops starting new ones after 35 seconds', async () => {
    // The database is set up on the real clock; only then is time faked.
    const assistants = [await newAssistant(), await newAssistant(), await newAssistant(), await newAssistant()];
    for (const a of assistants) for (let i = 0; i < 5; i++) await addLink(a.id);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(NOW);
    let inFlight = 0;
    let maxInFlight = 0;
    let started = 0;
    feed.fetch.mockImplementation(async () => {
      started++;
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 10_000));
      inFlight--;
      return okFeed(TOMORROW_ICS);
    });

    let res: Awaited<ReturnType<typeof syncDueCalendars>> | undefined;
    const pending = syncDueCalendars(NOW).then((r) => (res = r));
    await vi.advanceTimersByTimeAsync(80_000);
    await pending;

    // 3 at a time, 10 s each: waves start at 0, 10, 20 and 30 s = 12 links; the wave due at 40 s is past the 35 s start budget.
    expect(maxInFlight).toBe(3);
    expect(started).toBe(12);
    expect(res).toEqual({ checked: 12, failed: 0, skipped: 8, clashChecksSkipped: 0 });
  });

  it('runs the clash check after a successful read and flags an overlapping booking', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    const apt = await Database.saveAppointment({ assistantId: ast.id, name: 'Guest', email: 'g@example.com', date: '2026-10-25', timeSlot: '09:30', durationMinutes: 30 });
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));

    await syncDueCalendars(NOW);

    const after = await Database.getAppointmentById(apt.id);
    expect(after?.externalClashAt).toBe(NOW.toISOString());
    expect(after?.status).toBe(apt.status);
    expect(after?.timeSlot).toBe('09:30');
  });

  it('a clash check that throws does not stop the run', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    vi.spyOn(Database, 'getAppointments').mockRejectedValue(new Error('db down'));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(syncDueCalendars(NOW)).resolves.toEqual({ checked: 1, failed: 0, skipped: 0, clashChecksSkipped: 0 });
  });

  describe('the 24 hour failure notice', () => {
    const fail = () => feed.fetch.mockResolvedValue({ status: 'error', error: 'The calendar at calendar.example.com answered with an error (HTTP 500).' });
    const notices = async (assistantId: string) => (await Database.getNotifications(assistantId, 50)).filter((n) => n.type === 'calendar_sync_failed');

    it('is added once after 24 hours of failure, and not again while errorSince is unchanged', async () => {
      const ast = await newAssistant();
      const link = await addLink(ast.id, { errorSince: new Date(NOW.getTime() - 25 * 60 * 60 * 1000).toISOString(), lastError: 'trouble' });
      fail();

      await syncDueCalendars(NOW);
      const first = await notices(ast.id);
      expect(first).toHaveLength(1);
      expect(first[0].assistantId).toBe(ast.id);
      expect(first[0].title + first[0].message).not.toContain(SECRET);
      expect(first[0].title + first[0].message).not.toMatch(/https?:\/\//);
      expect((await reload(link)).failureNotifiedFor).toBe(link.errorSince);

      await syncDueCalendars(new Date(NOW.getTime() + 61 * 60_000));
      await syncDueCalendars(new Date(NOW.getTime() + 122 * 60_000));
      expect(await notices(ast.id)).toHaveLength(1);
    });

    it('also goes out, once, from booking-time refreshes when the scheduled job never gets to the link', async () => {
      // A tenant with a booking attempt every few minutes: each refresh updates lastAttemptAt, so the cron never finds the link due.
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(NOW);
      const ast = await newAssistant();
      const link = await addLink(ast.id, { errorSince: new Date(NOW.getTime() - 25 * 60 * 60 * 1000).toISOString(), lastError: 'trouble' });
      fail();
      for (let i = 0; i < 4; i++) {
        vi.setSystemTime(new Date(NOW.getTime() + i * 2 * 60_000));
        expect(await refreshAssistantCalendars(ast)).toEqual({ stale: true });
      }
      expect(feed.fetch).toHaveBeenCalledTimes(4);
      expect(await notices(ast.id)).toHaveLength(1);
      expect((await reload(link)).failureNotifiedFor).toBe(link.errorSince);
    });

    it('a cron run after a booking-time notice does not notify again', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(NOW);
      const ast = await newAssistant();
      await addLink(ast.id, { errorSince: new Date(NOW.getTime() - 25 * 60 * 60 * 1000).toISOString(), lastError: 'trouble' });
      fail();
      await refreshAssistantCalendars(ast);
      await syncDueCalendars(new Date(NOW.getTime() + 61 * 60_000));
      expect(await notices(ast.id)).toHaveLength(1);
    });

    it('is not added before 24 hours', async () => {
      const ast = await newAssistant();
      await addLink(ast.id, { errorSince: new Date(NOW.getTime() - 23 * 60 * 60 * 1000).toISOString(), lastError: 'trouble' });
      fail();
      await syncDueCalendars(NOW);
      expect(await notices(ast.id)).toHaveLength(0);
    });

    it('a first failure never notifies, and a new run of failures after a recovery can notify again', async () => {
      const ast = await newAssistant();
      const link = await addLink(ast.id);
      fail();
      await syncDueCalendars(NOW);
      expect(await notices(ast.id)).toHaveLength(0);
      const started = (await reload(link)).errorSince!;
      expect(started).toBe(NOW.toISOString());

      // 25 hours later still failing: the notice goes out
      const t1 = new Date(NOW.getTime() + 25 * 60 * 60 * 1000);
      await syncDueCalendars(t1);
      expect(await notices(ast.id)).toHaveLength(1);

      // it recovers: the marker is cleared with the error
      feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
      const t2 = new Date(t1.getTime() + 61 * 60_000);
      await syncDueCalendars(t2);
      const recovered = await reload(link);
      expect(recovered.errorSince).toBeUndefined();
      expect(recovered.failureNotifiedFor).toBeUndefined();

      // a new run of failures starts a new clock and, 24 hours on, one new notice
      fail();
      const t3 = new Date(t2.getTime() + 11 * 60_000);
      await syncDueCalendars(t3);
      const t4 = new Date(t3.getTime() + 25 * 60 * 60 * 1000);
      await syncDueCalendars(t4);
      expect(await notices(ast.id)).toHaveLength(2);
    });

    it('a notification that cannot be saved does not stop the run and is tried again next time', async () => {
      const ast = await newAssistant();
      const link = await addLink(ast.id, { errorSince: new Date(NOW.getTime() - 25 * 60 * 60 * 1000).toISOString(), lastError: 'trouble' });
      fail();
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const add = vi.spyOn(Database, 'addNotification').mockRejectedValueOnce(new Error('db down'));

      await expect(syncDueCalendars(NOW)).resolves.toEqual({ checked: 1, failed: 1, skipped: 0, clashChecksSkipped: 0 });
      expect((await reload(link)).failureNotifiedFor).toBeUndefined();

      add.mockRestore();
      await syncDueCalendars(new Date(NOW.getTime() + 61 * 60_000));
      expect(await notices(ast.id)).toHaveLength(1);
    });
  });
});

// ---------------------------------------------------------------------------------------------------------------------------------
// Fix round 1
// ---------------------------------------------------------------------------------------------------------------------------------

const HOUR = 60 * 60_000;
const DAYS = 24 * HOUR;
const icsDate = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
const after = (base: Date, ms: number) => new Date(base.getTime() + ms);

describe('a feed that keeps answering 304 does not freeze the window', () => {
  // A server that honours validators: 304 whenever they are sent, the full body otherwise.
  const serverWith = (text: string) =>
    feed.fetch.mockImplementation(async (_url: string, prev?: unknown) => (prev ? { status: 'not_modified' } : okFeed(text, { etag: '"v1"' })));

  const NEAR = vevent('near', icsDate(after(NOW, DAYS - HOUR)), icsDate(after(NOW, DAYS)));
  // Starts 180 days and 12 hours after NOW: outside the window of a read at NOW, inside the window of a read a day later.
  const FAR = vevent('far', icsDate(after(NOW, 180 * DAYS + 12 * HOUR)), icsDate(after(NOW, 180 * DAYS + 13 * HOUR)));

  it('a parsed response records fullSyncedAt and parsedTimezone; a 304 within 24 hours keeps the blocks and does not move fullSyncedAt', async () => {
    const ast = await newAssistant('Europe/London');
    const link = await addLink(ast.id);
    serverWith(ics(NEAR, FAR));

    await syncCalendarLink(link, ast, NOW);
    const first = await reload(link);
    expect(first).toMatchObject({ fullSyncedAt: NOW.toISOString(), parsedTimezone: 'Europe/London', lastAttemptAt: NOW.toISOString(), blockCount: 1 });

    const later = after(NOW, 11 * 60_000);
    const res = await syncCalendarLink(first, ast, later);

    expect(feed.fetch).toHaveBeenLastCalledWith(link.url, { etag: '"v1"', lastModified: undefined });
    expect(res).toEqual({ ok: true, blocks: 1 });
    const got = await reload(link);
    expect(got.fullSyncedAt).toBe(NOW.toISOString());
    expect(got.lastSyncedAt).toBe(later.toISOString());
    expect(got.lastAttemptAt).toBe(later.toISOString());
    expect(await storedBlocks(ast.id)).toHaveLength(1);
  });

  it('after 24 hours the read carries no validators and the stored blocks are replaced with the new window', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    serverWith(ics(NEAR, FAR));
    await syncCalendarLink(link, ast, NOW);
    expect(await storedBlocks(ast.id)).toHaveLength(1); // FAR is beyond the first window

    // Exactly 24 hours: still a 304 read.
    await syncCalendarLink(await reload(link), ast, after(NOW, DAYS));
    expect(feed.fetch).toHaveBeenLastCalledWith(link.url, expect.objectContaining({ etag: '"v1"' }));
    expect(await storedBlocks(ast.id)).toHaveLength(1);

    // A little over 24 hours: a full read.
    const later = after(NOW, DAYS + 60_000);
    await syncCalendarLink(await reload(link), ast, later);

    expect(feed.fetch).toHaveBeenLastCalledWith(link.url);
    expect(feed.fetch.mock.calls.at(-1)).toHaveLength(1);
    expect((await storedBlocks(ast.id)).map((b) => b[0])).toEqual([
      after(NOW, DAYS - HOUR).toISOString(),
      after(NOW, 180 * DAYS + 12 * HOUR).toISOString(),
    ]);
    const got = await reload(link);
    expect(got.fullSyncedAt).toBe(later.toISOString());
    expect(got.blockCount).toBe(2);
  });

  it('a link with no stored block count is read in full, whatever else it has', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id, {
      etag: '"v1"',
      fullSyncedAt: after(NOW, -HOUR).toISOString(),
      parsedTimezone: 'UTC',
    });
    serverWith(ics(NEAR));
    await syncCalendarLink(link, ast, NOW);
    expect(feed.fetch).toHaveBeenCalledWith(link.url);
    expect(await storedBlocks(ast.id)).toHaveLength(1);
  });

  it('a link stored before fullSyncedAt existed is read in full', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id, { etag: '"v1"', lastModified: 'Fri, 23 Oct 2026 09:00:00 GMT', blockCount: 3, parsedTimezone: 'UTC' });
    serverWith(ics(NEAR));
    await syncCalendarLink(link, ast, NOW);
    expect(feed.fetch).toHaveBeenCalledWith(link.url);
  });

  it('a changed assistant timezone forces a full read, an unchanged one does not', async () => {
    const ast = await newAssistant('UTC');
    const link = await addLink(ast.id);
    serverWith(ics(NEAR));
    await syncCalendarLink(link, ast, NOW);

    await syncCalendarLink(await reload(link), ast, after(NOW, 5 * 60_000));
    expect(feed.fetch).toHaveBeenLastCalledWith(link.url, expect.objectContaining({ etag: '"v1"' }));

    const moved = { ...ast, timezone: 'Asia/Tokyo' };
    await syncCalendarLink(await reload(link), moved, after(NOW, 10 * 60_000));
    expect(feed.fetch).toHaveBeenLastCalledWith(link.url);
    expect((await reload(link)).parsedTimezone).toBe('Asia/Tokyo');
  });
});

describe('a failed block write is recorded as an error', () => {
  it('sets a short lastError and errorSince, keeps the old blocks and returns the failure', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValueOnce(okFeed(TOMORROW_ICS));
    await syncCalendarLink(link, ast, NOW);
    const before = await storedBlocks(ast.id);

    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    vi.spyOn(Database, 'replaceExternalBlocks').mockRejectedValue(Object.assign(new Error('disk full'), { name: 'BookingUnavailableError' }));
    const later = after(NOW, 11 * 60_000);
    const res = await syncCalendarLink(await reload(link), ast, later);

    expect(res).toMatchObject({ ok: false, error: 'Could not store the calendar' });
    const got = await reload(link);
    expect(got.lastError).toBe('Could not store the calendar');
    expect(got.errorSince).toBe(later.toISOString());
    expect(got.lastAttemptAt).toBe(later.toISOString());
    expect(await storedBlocks(ast.id)).toEqual(before);
  });

  it('does not throw when the status write fails as well', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    vi.spyOn(Database, 'replaceExternalBlocks').mockRejectedValue(new Error('db down'));
    vi.spyOn(Database, 'updateCalendarLinkStatus').mockRejectedValue(new Error('db down'));
    await expect(syncCalendarLink(link, ast, NOW)).resolves.toMatchObject({ ok: false, error: 'Could not store the calendar' });
  });
});

describe('an edited link address is not stuck behind the in-process memory', () => {
  it('is read again at once with the new address, even though the old address was tried a moment ago', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockResolvedValue({ status: 'error', error: 'The calendar at calendar.example.com did not answer.' });
    await refreshAssistantCalendars(ast);
    await refreshAssistantCalendars(ast);
    expect(feed.fetch).toHaveBeenCalledTimes(1);

    const edited = URL_OF('edited');
    await Database.saveCalendarLink({ ...link, url: edited });
    await refreshAssistantCalendars(ast);

    expect(feed.fetch).toHaveBeenCalledTimes(2);
    expect(feed.fetch).toHaveBeenLastCalledWith(edited);
  });

  it('a read still running for the old address is not joined by a read of the new one', async () => {
    const ast = await newAssistant();
    const link = await addLink(ast.id);
    feed.fetch.mockImplementation(() => new Promise(() => undefined));
    void syncCalendarLink(link, ast, NOW);
    await vi.waitFor(() => expect(feed.fetch).toHaveBeenCalledTimes(1));

    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    const res = await syncCalendarLink({ ...link, url: URL_OF('other') }, ast, NOW);
    expect(feed.fetch).toHaveBeenCalledTimes(2);
    expect(res.ok).toBe(true);
  });
});

describe('stale also covers a link that was skipped because it was tried a moment ago', () => {
  it('an attempt that timed out (still running) makes the next refresh stale without reading again', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    feed.fetch.mockImplementation(() => new Promise(() => undefined));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    const first = refreshAssistantCalendars(ast);
    await vi.advanceTimersByTimeAsync(3100);
    expect(await first).toEqual({ stale: true });

    expect(await refreshAssistantCalendars(ast)).toEqual({ stale: true });
    expect(feed.fetch).toHaveBeenCalledTimes(1);
  });

  it('an attempt that ended without recording a success makes it stale (the stored attempt is newer than the last success)', async () => {
    const ast = await newAssistant();
    await addLink(ast.id, {
      lastSyncedAt: new Date(Date.now() - 50_000).toISOString(),
      lastAttemptAt: new Date(Date.now() - 10_000).toISOString(),
    });
    expect(await refreshAssistantCalendars(ast)).toEqual({ stale: true });
    expect(feed.fetch).not.toHaveBeenCalled();
  });

  it('a recent success is not stale', async () => {
    const ast = await newAssistant();
    const t = new Date(Date.now() - 10_000).toISOString();
    await addLink(ast.id, { lastSyncedAt: t, lastAttemptAt: t });
    expect(await refreshAssistantCalendars(ast)).toEqual({ stale: false });
  });
});

describe('scheduled reads: order, back-off, budget and the clash check', () => {
  const run = (over: Parameters<typeof syncDueCalendars>[2] = {}) => syncDueCalendars(NOW, undefined, over);

  it('reads never-tried links first, then the oldest attempt first, so a dead link does not run ahead of other tenants', async () => {
    const ast = await newAssistant();
    // Created first, so a plain created-at order would read it first.
    const dead = await addLink(ast.id, {
      errorSince: after(NOW, -8 * DAYS).toISOString(),
      lastError: 'trouble',
      lastSyncedAt: after(NOW, -9 * DAYS).toISOString(),
      lastAttemptAt: after(NOW, -7 * HOUR).toISOString(),
    });
    const never1 = await addLink(ast.id);
    const never2 = await addLink(ast.id);
    const healthy = await addLink(ast.id, { lastSyncedAt: after(NOW, -30 * 60_000).toISOString(), lastAttemptAt: after(NOW, -30 * 60_000).toISOString() });
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));

    const res = await run({ concurrency: 1 });

    expect(feed.fetch.mock.calls.map((c) => c[0])).toEqual([never1.url, never2.url, dead.url, healthy.url]);
    expect(res).toMatchObject({ checked: 4, failed: 0, skipped: 0 });
  });

  describe('a link that keeps failing is tried less and less often', () => {
    const failingFor = (ms: number, sinceAttemptMs: number) => ({
      errorSince: after(NOW, -ms).toISOString(),
      lastError: 'trouble',
      lastAttemptAt: after(NOW, -sinceAttemptMs).toISOString(),
    });
    const cases: Array<[string, number, number, number]> = [
      // [name, failing for, since last attempt, expected checked]
      ['under 24 hours: 5 minutes after an attempt, not yet', 12 * HOUR, 5 * 60_000, 0],
      ['under 24 hours: 11 minutes after an attempt, again', 12 * HOUR, 11 * 60_000, 1],
      ['24 hours to 7 days: 30 minutes after an attempt, not yet', 3 * DAYS, 30 * 60_000, 0],
      ['24 hours to 7 days: 61 minutes after an attempt, again', 3 * DAYS, 61 * 60_000, 1],
      ['over 7 days: 5 hours after an attempt, not yet', 10 * DAYS, 5 * HOUR, 0],
      ['over 7 days: 6 hours 2 minutes after an attempt, again', 10 * DAYS, 6 * HOUR + 2 * 60_000, 1],
    ];
    it.each(cases)('%s', async (_name, failing, since, expected) => {
      const ast = await newAssistant();
      await addLink(ast.id, failingFor(failing, since));
      feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
      const res = await run();
      expect(res.checked).toBe(expected);
      expect(feed.fetch).toHaveBeenCalledTimes(expected);
    });

    it('saving an edited address resets the wait, so the link is read at once', async () => {
      const ast = await newAssistant();
      const l = await addLink(ast.id, failingFor(10 * DAYS, 60_000));
      expect((await run()).checked).toBe(0);
      await Database.saveCalendarLink({ ...l, url: URL_OF('fixed') });
      feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
      expect((await run()).checked).toBe(1);
      expect(feed.fetch).toHaveBeenCalledWith(URL_OF('fixed'));
    });
  });

  it('every attempt records lastAttemptAt, success or failure', async () => {
    const ast = await newAssistant();
    const good = await addLink(ast.id);
    const bad = await addLink(ast.id);
    feed.fetch.mockImplementation(async (url: string) => (url === bad.url ? { status: 'error', error: 'The calendar at calendar.example.com did not answer.' } : okFeed(TOMORROW_ICS)));
    await run();
    expect((await reload(good)).lastAttemptAt).toBe(NOW.toISOString());
    expect((await reload(bad)).lastAttemptAt).toBe(NOW.toISOString());
  });

  it('reports the due links it did not start as skipped (nothing is started once the budget is gone)', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    await addLink(ast.id);
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    expect(await run({ budgetMs: 0 })).toEqual({ checked: 0, failed: 0, skipped: 2, clashChecksSkipped: 0 });
    expect(feed.fetch).not.toHaveBeenCalled();
  });

  it('checks an assistant for clashes right after its own links were read, even when the sync phase then uses the whole budget', async () => {
    const first = await newAssistant();
    await addLink(first.id);
    const others = [await newAssistant(), await newAssistant(), await newAssistant()];
    for (const a of others) for (let i = 0; i < 5; i++) await addLink(a.id);
    const calls: Array<{ id: string; at: number }> = [];
    vi.spyOn(clashes, 'detectClashes').mockImplementation(async (a) => {
      calls.push({ id: a.id, at: Date.now() });
      return [];
    });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(NOW);
    feed.fetch.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 10_000));
      return okFeed(TOMORROW_ICS);
    });

    let res: Awaited<ReturnType<typeof syncDueCalendars>> | undefined;
    const pending = syncDueCalendars(NOW).then((r) => (res = r));
    await vi.advanceTimersByTimeAsync(120_000);
    await pending;

    // 16 links, 3 at a time, 10 s each: 12 are started (0, 10, 20, 30 s), 4 wait for the next run.
    expect(res).toMatchObject({ checked: 12, skipped: 4, clashChecksSkipped: 0 });
    const at = (id: string) => calls.filter((c) => c.id === id).map((c) => c.at - NOW.getTime());
    // The first assistant had one link: it was checked as soon as that read finished (10 s), not after the others.
    expect(at(first.id)).toEqual([10_000]);
    // Every assistant with a read link was checked exactly once; the one with unstarted links waited for the final pass (after 40 s).
    expect(new Set(calls.map((c) => c.id)).size).toBe(4);
    expect(calls).toHaveLength(4);
    const lastAssistant = calls[calls.length - 1];
    expect(lastAssistant.at - NOW.getTime()).toBeGreaterThanOrEqual(40_000);
  });

  it('starts no clash check after the 55 second hard stop and counts the ones it left out', async () => {
    const synced = await newAssistant();
    await addLink(synced.id);
    const waiting = await newAssistant();
    const t = after(NOW, -60_000).toISOString();
    await addLink(waiting.id, { lastSyncedAt: t, lastAttemptAt: t });
    const calls: string[] = [];
    vi.spyOn(clashes, 'detectClashes').mockImplementation(async (a) => {
      calls.push(a.id);
      await new Promise((r) => setTimeout(r, 56_000));
      return [];
    });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(NOW);
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));

    let res: Awaited<ReturnType<typeof syncDueCalendars>> | undefined;
    const pending = syncDueCalendars(NOW).then((r) => (res = r));
    await vi.advanceTimersByTimeAsync(200_000);
    await pending;

    expect(calls).toEqual([synced.id]);
    expect(res).toEqual({ checked: 1, failed: 0, skipped: 0, clashChecksSkipped: 1 });
  });
});

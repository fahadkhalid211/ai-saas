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
    createdAt: new Date(Date.UTC(2026, 9, 1, 8, 0, seq % 60)).toISOString(),
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
    const link = await addLink(ast.id, { etag: '"old"', lastModified: 'Fri, 23 Oct 2026 09:00:00 GMT' });
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

    expect(res).toEqual({ checked: 2, failed: 1 });
    expect(feed.fetch).toHaveBeenCalledTimes(2);
    expect((await reload(never)).lastSyncedAt).toBe(NOW.toISOString());
    expect((await reload(old)).lastError).toBeTruthy();
    expect((await reload(fresh)).lastSyncedAt).toBe(new Date(NOW.getTime() - 5 * 60_000).toISOString());
  });

  it('a custom age limit is used', async () => {
    const ast = await newAssistant();
    await addLink(ast.id, { lastSyncedAt: new Date(NOW.getTime() - 5 * 60_000).toISOString() });
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    expect(await syncDueCalendars(NOW, 60_000)).toEqual({ checked: 1, failed: 0 });
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

    expect(res).toEqual({ checked: 3, failed: 2 });
    expect((await reload(good)).blockCount).toBe(2);
  });

  it('skips a link whose assistant no longer exists without failing the run', async () => {
    const ast = await newAssistant();
    await addLink(ast.id);
    const orphan = await addLink(`ast_gone_${seq++}`);
    feed.fetch.mockResolvedValue(okFeed(TOMORROW_ICS));
    expect(await syncDueCalendars(NOW)).toEqual({ checked: 1, failed: 0 });
    expect(feed.fetch).not.toHaveBeenCalledWith(orphan.url, expect.anything());
  });

  it('reads at most 3 links at a time and stops starting new ones after 50 seconds', async () => {
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

    let res: { checked: number; failed: number } | undefined;
    const pending = syncDueCalendars(NOW).then((r) => (res = r));
    await vi.advanceTimersByTimeAsync(80_000);
    await pending;

    // 3 at a time, 10 s each: waves start at 0, 10, 20, 30 and 40 s = 15 links; the wave due at 50 s is not started.
    expect(maxInFlight).toBe(3);
    expect(started).toBe(15);
    expect(res).toEqual({ checked: 15, failed: 0 });
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
    await expect(syncDueCalendars(NOW)).resolves.toEqual({ checked: 1, failed: 0 });
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

      await syncDueCalendars(new Date(NOW.getTime() + 11 * 60_000));
      await syncDueCalendars(new Date(NOW.getTime() + 22 * 60_000));
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
      const t2 = new Date(t1.getTime() + 11 * 60_000);
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

      await expect(syncDueCalendars(NOW)).resolves.toEqual({ checked: 1, failed: 1 });
      expect((await reload(link)).failureNotifiedFor).toBeUndefined();

      add.mockRestore();
      await syncDueCalendars(new Date(NOW.getTime() + 11 * 60_000));
      expect(await notices(ast.id)).toHaveLength(1);
    });
  });
});


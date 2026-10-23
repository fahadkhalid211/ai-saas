import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const h = vi.hoisted(() => ({ query: vi.fn(), configured: false, noPool: false }));

// Only the pool and the "configured" check are faked; everything else in ./postgres stays real.
// No database is reached, and vitest.config.mts gives every run its own DATA_DIR for the JSON files.
vi.mock('./postgres', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./postgres')>();
  return {
    ...actual,
    isPostgresConfigured: () => h.configured,
    getPostgresPool: () =>
      h.noPool
        ? null
        : {
            connect: async () => ({ query: h.query, release: () => undefined }),
          },
  };
});

import { Database, resolveDataDir } from './index';
import { BookingUnavailableError } from '../appointments/errors';
import type { CalendarLink, ExternalBlock } from '../calendar/sync/types';

// Every database and shared-cache URL is blanked, so this file can never reach a real database or Redis even when the
// shell exports them (the pool above is faked, but the JSON state's cloud sync reads these too).
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

beforeEach(() => {
  for (const k of REAL_BACKEND_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  h.query.mockReset();
  h.configured = false;
  h.noPool = false;
  fs.rmSync(dataFile(), { force: true });
});

afterEach(() => {
  delete process.env.DB_RELATIONAL_MODE;
  vi.unstubAllEnvs();
});

let seq = 0;
const link = (assistantId: string, over: Partial<CalendarLink> = {}): CalendarLink => ({
  id: `cal_${seq++}_${Math.random().toString(36).slice(2, 8)}`,
  assistantId,
  label: 'google',
  url: 'https://calendar.example.com/private/basic.ics',
  createdAt: new Date(Date.UTC(2026, 9, 1, 8, 0, seq)).toISOString(),
  ...over,
});
const block = (startIso: string, endIso: string): ExternalBlock => ({ startAt: new Date(startIso), endAt: new Date(endIso) });
const iso = (b: ExternalBlock) => [b.startAt.toISOString(), b.endAt.toISOString()];

describe('test isolation', () => {
  it('blanks every real database and cache URL', () => {
    for (const k of REAL_BACKEND_ENV) expect(process.env[k] || '').toBe('');
  });
});

describe('calendar links (JSON mode)', () => {
  it('saves two links and reads them back, oldest first, only for their assistant', async () => {
    const a = `ast_${seq++}_a`;
    const other = `ast_${seq++}_b`;
    const first = link(a, { label: 'google' });
    const second = link(a, { label: 'outlook', url: 'https://outlook.example.com/x.ics' });
    const foreign = link(other);
    await Database.saveCalendarLink(second);
    await Database.saveCalendarLink(first);
    await Database.saveCalendarLink(foreign);

    const got = await Database.getCalendarLinks(a);
    expect(got.map((l) => l.id)).toEqual([first.id, second.id]);
    expect(got[1]).toMatchObject({ label: 'outlook', url: 'https://outlook.example.com/x.ics', assistantId: a });
    expect((await Database.getCalendarLinks(other)).map((l) => l.id)).toEqual([foreign.id]);
  });

  it('saving an existing id updates it, including sync status fields', async () => {
    const a = `ast_${seq++}`;
    const l = link(a);
    await Database.saveCalendarLink(l);
    await Database.saveCalendarLink({ ...l, lastSyncedAt: '2026-10-24T10:00:00.000Z', etag: '"abc"', lastModified: 'Sat, 24 Oct 2026 10:00:00 GMT' });
    await Database.saveCalendarLink({ ...l, lastError: 'Feed unreachable', errorSince: '2026-10-24T11:00:00.000Z' });

    const got = await Database.getCalendarLinks(a);
    expect(got).toHaveLength(1);
    expect(got[0]).toMatchObject({ id: l.id, lastError: 'Feed unreachable', errorSince: '2026-10-24T11:00:00.000Z' });
    expect(got[0].etag).toBeUndefined();
  });

  it('allows at most 5 links per assistant, but still lets an existing one be updated', async () => {
    const a = `ast_${seq++}`;
    const five = Array.from({ length: 5 }, () => link(a));
    for (const l of five) await Database.saveCalendarLink(l);

    await expect(Database.saveCalendarLink(link(a))).rejects.toThrow(/at most 5/i);
    await expect(Database.saveCalendarLink({ ...five[0], label: 'apple' })).resolves.toMatchObject({ label: 'apple' });
    expect(await Database.getCalendarLinks(a)).toHaveLength(5);
    // another assistant is not affected
    await expect(Database.saveCalendarLink(link(`ast_${seq++}`))).resolves.toBeTruthy();
  });

  it('refuses to take over a link id that belongs to another assistant', async () => {
    const a = `ast_${seq++}`;
    const b = `ast_${seq++}`;
    const l = link(a);
    await Database.saveCalendarLink(l);
    await expect(Database.saveCalendarLink({ ...l, assistantId: b, url: 'https://evil.example.com/x.ics' })).rejects.toThrow();
    expect((await Database.getCalendarLinks(a))[0].url).toBe(l.url);
    expect(await Database.getCalendarLinks(b)).toHaveLength(0);
  });

  it('getAllCalendarLinks lists every assistant\'s links', async () => {
    const a = `ast_${seq++}`;
    const b = `ast_${seq++}`;
    const la = link(a);
    const lb = link(b);
    await Database.saveCalendarLink(la);
    await Database.saveCalendarLink(lb);
    const ids = (await Database.getAllCalendarLinks()).map((l) => l.id);
    expect(ids).toEqual(expect.arrayContaining([la.id, lb.id]));
  });

  it('keeps links in their own file, not in the main state', async () => {
    const a = `ast_${seq++}`;
    await Database.saveCalendarLink(link(a));
    expect(fs.existsSync(dataFile())).toBe(true);
    const state = (await Database.getState()) as unknown as Record<string, unknown>;
    expect(state.calendarLinks).toBeUndefined();
    expect(state.externalBlocks).toBeUndefined();
    // atomic write: no temp files left behind
    const leftovers = fs.readdirSync(resolveDataDir()).filter((f) => f.startsWith('calendar-sync.json.'));
    expect(leftovers).toEqual([]);
  });

  it('treats a corrupt or wrong-shaped file as empty and recovers on the next write', async () => {
    const a = `ast_${seq++}`;
    fs.mkdirSync(resolveDataDir(), { recursive: true });
    fs.writeFileSync(dataFile(), '{"links": [ this is not json');
    expect(await Database.getCalendarLinks(a)).toEqual([]);
    expect(await Database.getExternalBlocks(a)).toEqual([]);

    fs.writeFileSync(dataFile(), JSON.stringify({ links: 'nope', blocks: 7 }));
    expect(await Database.getAllCalendarLinks()).toEqual([]);

    const l = link(a);
    await Database.saveCalendarLink(l);
    expect((await Database.getCalendarLinks(a)).map((x) => x.id)).toEqual([l.id]);
  });
});

describe('external blocks (JSON mode)', () => {
  it('replaceExternalBlocks replaces the link\'s blocks rather than appending', async () => {
    const a = `ast_${seq++}`;
    const l = link(a);
    await Database.saveCalendarLink(l);
    await Database.replaceExternalBlocks(l.id, a, [block('2026-11-02T09:00:00Z', '2026-11-02T10:00:00Z'), block('2026-11-03T09:00:00Z', '2026-11-03T10:00:00Z')]);
    await Database.replaceExternalBlocks(l.id, a, [block('2026-11-05T09:00:00Z', '2026-11-05T10:00:00Z')]);

    const got = await Database.getExternalBlocks(a);
    expect(got.map(iso)).toEqual([['2026-11-05T09:00:00.000Z', '2026-11-05T10:00:00.000Z']]);
    expect(got[0].startAt).toBeInstanceOf(Date);
  });

  it('returns blocks from all of an assistant\'s links, sorted by start, and none from another assistant', async () => {
    const a = `ast_${seq++}`;
    const b = `ast_${seq++}`;
    const l1 = link(a);
    const l2 = link(a, { label: 'apple' });
    const lb = link(b);
    for (const l of [l1, l2, lb]) await Database.saveCalendarLink(l);
    await Database.replaceExternalBlocks(l1.id, a, [block('2026-11-04T09:00:00Z', '2026-11-04T10:00:00Z')]);
    await Database.replaceExternalBlocks(l2.id, a, [block('2026-11-02T09:00:00Z', '2026-11-02T10:00:00Z')]);
    await Database.replaceExternalBlocks(lb.id, b, [block('2026-11-03T09:00:00Z', '2026-11-03T10:00:00Z')]);

    expect((await Database.getExternalBlocks(a)).map((x) => x.startAt.toISOString())).toEqual(['2026-11-02T09:00:00.000Z', '2026-11-04T09:00:00.000Z']);
    expect((await Database.getExternalBlocks(b)).map((x) => x.startAt.toISOString())).toEqual(['2026-11-03T09:00:00.000Z']);
    expect(await Database.getExternalBlocks(`ast_${seq++}_nobody`)).toEqual([]);
  });

  it('`from` leaves out blocks that ended earlier (a block ending exactly at `from` is out, one still running is in)', async () => {
    const a = `ast_${seq++}`;
    const l = link(a);
    await Database.saveCalendarLink(l);
    await Database.replaceExternalBlocks(l.id, a, [
      block('2026-11-02T09:00:00Z', '2026-11-02T10:00:00Z'),
      block('2026-11-02T10:00:00Z', '2026-11-02T12:00:00Z'),
      block('2026-11-03T09:00:00Z', '2026-11-03T10:00:00Z'),
    ]);
    const got = await Database.getExternalBlocks(a, new Date('2026-11-02T10:00:00Z'));
    expect(got.map((x) => x.startAt.toISOString())).toEqual(['2026-11-02T10:00:00.000Z', '2026-11-03T09:00:00.000Z']);
    expect(await Database.getExternalBlocks(a, new Date('2026-12-01T00:00:00Z'))).toEqual([]);
    expect(await Database.getExternalBlocks(a)).toHaveLength(3);
  });

  it('ignores blocks for a link that does not exist or belongs to another assistant', async () => {
    const a = `ast_${seq++}`;
    const b = `ast_${seq++}`;
    const l = link(a);
    await Database.saveCalendarLink(l);
    await Database.replaceExternalBlocks('cal_missing', a, [block('2026-11-02T09:00:00Z', '2026-11-02T10:00:00Z')]);
    await Database.replaceExternalBlocks(l.id, b, [block('2026-11-02T09:00:00Z', '2026-11-02T10:00:00Z')]);
    expect(await Database.getExternalBlocks(a)).toEqual([]);
    expect(await Database.getExternalBlocks(b)).toEqual([]);
  });

  it('skips blocks with unreadable or empty ranges', async () => {
    const a = `ast_${seq++}`;
    const l = link(a);
    await Database.saveCalendarLink(l);
    await Database.replaceExternalBlocks(l.id, a, [
      { startAt: new Date('nope'), endAt: new Date('2026-11-02T10:00:00Z') },
      block('2026-11-02T10:00:00Z', '2026-11-02T10:00:00Z'),
      block('2026-11-02T11:00:00Z', '2026-11-02T10:00:00Z'),
      block('2026-11-02T12:00:00Z', '2026-11-02T13:00:00Z'),
    ]);
    expect((await Database.getExternalBlocks(a)).map(iso)).toEqual([['2026-11-02T12:00:00.000Z', '2026-11-02T13:00:00.000Z']]);
  });

  it('keeps the nearest 20,000 blocks of a link (upcoming first) and logs it', async () => {
    const a = `ast_${seq++}`;
    const l = link(a);
    await Database.saveCalendarLink(l);
    const day = 86_400_000;
    const now = Date.now();
    // 20,500 upcoming one-minute blocks, one per 10 minutes, plus a very old one that must be the one dropped
    const upcoming = Array.from({ length: 20_500 }, (_, i) => {
      const s = now + day + i * 600_000;
      return { startAt: new Date(s), endAt: new Date(s + 60_000) };
    });
    const old = block('2020-01-01T09:00:00Z', '2020-01-01T10:00:00Z');
    await Database.replaceExternalBlocks(l.id, a, [old, ...upcoming.slice().reverse()]);

    const got = await Database.getExternalBlocks(a);
    expect(got).toHaveLength(20_000);
    expect(got[0].startAt.getTime()).toBe(upcoming[0].startAt.getTime());
    expect(got[got.length - 1].startAt.getTime()).toBe(upcoming[19_999].startAt.getTime());
    expect(got.some((x) => x.startAt.getFullYear() === 2020)).toBe(false);
  });

  it('deleteCalendarLink removes the link and its blocks', async () => {
    const a = `ast_${seq++}`;
    const keep = link(a);
    const gone = link(a);
    await Database.saveCalendarLink(keep);
    await Database.saveCalendarLink(gone);
    await Database.replaceExternalBlocks(keep.id, a, [block('2026-11-02T09:00:00Z', '2026-11-02T10:00:00Z')]);
    await Database.replaceExternalBlocks(gone.id, a, [block('2026-11-03T09:00:00Z', '2026-11-03T10:00:00Z')]);

    expect(await Database.deleteCalendarLink(a, gone.id)).toBe(true);
    expect((await Database.getCalendarLinks(a)).map((l) => l.id)).toEqual([keep.id]);
    expect((await Database.getExternalBlocks(a)).map((x) => x.startAt.toISOString())).toEqual(['2026-11-02T09:00:00.000Z']);
    expect(await Database.deleteCalendarLink(a, gone.id)).toBe(false);
  });

  it('one assistant can never delete another\'s link or blocks', async () => {
    const a = `ast_${seq++}`;
    const b = `ast_${seq++}`;
    const l = link(a);
    await Database.saveCalendarLink(l);
    await Database.replaceExternalBlocks(l.id, a, [block('2026-11-02T09:00:00Z', '2026-11-02T10:00:00Z')]);

    expect(await Database.deleteCalendarLink(b, l.id)).toBe(false);
    expect((await Database.getCalendarLinks(a)).map((x) => x.id)).toEqual([l.id]);
    expect(await Database.getExternalBlocks(a)).toHaveLength(1);
  });
});

describe('calendar feed token lookup', () => {
  const token = 'tok_' + 'a1b2c3d4e5f6a7b8c9d0e1f2';

  it('finds the assistant that holds the token', async () => {
    const created = await Database.createAssistant({ name: 'Feed owner', workspaceId: `ws_feed_${seq++}` });
    await Database.updateAssistant(created.id, { calendarFeedToken: token });
    const found = await Database.getAssistantByCalendarFeedToken(token);
    expect(found?.id).toBe(created.id);
    expect(found?.calendarFeedToken).toBe(token);
  });

  it('returns null for unknown, empty and short tokens', async () => {
    const created = await Database.createAssistant({ name: 'Short token', workspaceId: `ws_feed_${seq++}` });
    await Database.updateAssistant(created.id, { calendarFeedToken: 'short' });
    expect(await Database.getAssistantByCalendarFeedToken('')).toBeNull();
    expect(await Database.getAssistantByCalendarFeedToken('short')).toBeNull();
    expect(await Database.getAssistantByCalendarFeedToken('x'.repeat(19))).toBeNull();
    expect(await Database.getAssistantByCalendarFeedToken('x'.repeat(40))).toBeNull();
    expect(await Database.getAssistantByCalendarFeedToken(undefined as unknown as string)).toBeNull();
  });

  it('does not match a token that merely starts with the stored one', async () => {
    const created = await Database.createAssistant({ name: 'Prefix', workspaceId: `ws_feed_${seq++}` });
    const t = 'pfx_' + 'z9y8x7w6v5u4t3s2r1q0';
    await Database.updateAssistant(created.id, { calendarFeedToken: t });
    expect(await Database.getAssistantByCalendarFeedToken(t + 'x')).toBeNull();
    expect(await Database.getAssistantByCalendarFeedToken(t.slice(0, -1))).toBeNull();
  });
});

describe('relational mode (pool faked)', () => {
  const sqls = () => h.query.mock.calls.map((c) => String(c[0]));
  const relational = () => {
    vi.stubEnv('DB_RELATIONAL_MODE', 'true');
    h.configured = true;
  };

  it('replaceExternalBlocks runs in ONE transaction and inserts in batches', async () => {
    relational();
    h.query.mockResolvedValue({ rows: [], rowCount: 1 });
    const blocks = Array.from({ length: 12_000 }, (_, i) => {
      const s = Date.now() + (i + 1) * 3_600_000;
      return { startAt: new Date(s), endAt: new Date(s + 1_800_000) };
    });
    await Database.replaceExternalBlocks('cal_1', 'ast_1', blocks);

    const all = sqls();
    expect(all[0]).toMatch(/^\s*BEGIN/i);
    expect(all[all.length - 1]).toMatch(/^\s*COMMIT/i);
    expect(all.filter((s) => /BEGIN/i.test(s))).toHaveLength(1);
    const deletes = all.filter((s) => /DELETE FROM kortex_external_blocks/i.test(s));
    const inserts = all.filter((s) => /INSERT INTO kortex_external_blocks/i.test(s));
    expect(deletes).toHaveLength(1);
    expect(inserts.length).toBeGreaterThan(1);
    expect(inserts.length).toBeLessThanOrEqual(6);
    // delete comes before the inserts, all inside the transaction
    expect(all.indexOf(deletes[0])).toBeLessThan(all.indexOf(inserts[0]));
    // the delete is scoped by link AND assistant
    const delCall = h.query.mock.calls.find((c) => /DELETE FROM kortex_external_blocks/i.test(String(c[0])))!;
    expect(delCall[1]).toEqual(['cal_1', 'ast_1']);
    // every block is sent exactly once across the batches
    const sent = h.query.mock.calls
      .filter((c) => /INSERT INTO kortex_external_blocks/i.test(String(c[0])))
      .reduce((n, c) => n + (c[1][2] as string[]).length, 0);
    expect(sent).toBe(12_000);
  });

  it('rolls back and does not commit when an insert fails', async () => {
    relational();
    h.query.mockImplementation(async (sql: string) => {
      if (/INSERT INTO kortex_external_blocks/i.test(sql)) throw Object.assign(new Error('disk full'), { code: '53100' });
      return { rows: [], rowCount: 1 };
    });
    vi.stubEnv('DB_RELATIONAL_MODE', 'true');
    await expect(
      Database.replaceExternalBlocks('cal_1', 'ast_1', [block('2099-01-01T09:00:00Z', '2099-01-01T10:00:00Z')])
    ).rejects.toBeInstanceOf(BookingUnavailableError);
    const all = sqls();
    expect(all.some((s) => /ROLLBACK/i.test(s))).toBe(true);
    expect(all.some((s) => /^\s*COMMIT/i.test(s))).toBe(false);
  });

  it('getExternalBlocks is scoped by assistant, filters by `from` and maps rows to Dates', async () => {
    relational();
    h.query.mockResolvedValue({
      rows: [{ start_at: new Date('2026-11-02T09:00:00Z'), end_at: new Date('2026-11-02T10:00:00Z') }],
      rowCount: 1,
    });
    const from = new Date('2026-11-01T00:00:00Z');
    const got = await Database.getExternalBlocks('ast_1', from);

    expect(got.map(iso)).toEqual([['2026-11-02T09:00:00.000Z', '2026-11-02T10:00:00.000Z']]);
    const [sql, params] = h.query.mock.calls[0];
    expect(String(sql)).toMatch(/FROM kortex_external_blocks/i);
    expect(String(sql)).toMatch(/assistant_id = \$1/);
    expect(String(sql)).toMatch(/end_at > \$2/);
    expect(String(sql)).toMatch(/ORDER BY start_at/i);
    expect(params).toEqual(['ast_1', from.toISOString()]);
  });

  it('getExternalBlocks without `from` does not filter by time', async () => {
    relational();
    h.query.mockResolvedValue({ rows: [], rowCount: 0 });
    await Database.getExternalBlocks('ast_1');
    const [sql, params] = h.query.mock.calls[0];
    expect(String(sql)).not.toMatch(/end_at >/i);
    expect(params).toEqual(['ast_1']);
  });

  it('deleteCalendarLink deletes by assistant AND link id and reports whether one existed', async () => {
    relational();
    h.query.mockImplementation(async (sql: string) => ({ rows: [], rowCount: /DELETE FROM kortex_calendar_links/i.test(sql) ? 1 : 0 }));
    expect(await Database.deleteCalendarLink('ast_1', 'cal_1')).toBe(true);
    const link = h.query.mock.calls.find((c) => /DELETE FROM kortex_calendar_links/i.test(String(c[0])))!;
    expect(link[1]).toEqual(['cal_1', 'ast_1']);
    const blocks = h.query.mock.calls.find((c) => /DELETE FROM kortex_external_blocks/i.test(String(c[0])))!;
    expect(blocks[1]).toEqual(['cal_1', 'ast_1']);

    h.query.mockResolvedValue({ rows: [], rowCount: 0 });
    expect(await Database.deleteCalendarLink('ast_1', 'cal_missing')).toBe(false);
  });

  it('saveCalendarLink counts the assistant\'s other links under a lock and rejects the 6th', async () => {
    relational();
    h.query.mockImplementation(async (sql: string) => {
      if (/SELECT count\(\*\)/i.test(sql)) return { rows: [{ n: '5' }], rowCount: 1 };
      return { rows: [], rowCount: 1 };
    });
    await expect(Database.saveCalendarLink(link('ast_1'))).rejects.toThrow(/at most 5/i);
    expect(sqls().some((s) => /pg_advisory_xact_lock/i.test(s))).toBe(true);
    expect(sqls().some((s) => /INSERT INTO kortex_calendar_links/i.test(s))).toBe(false);
    expect(sqls().some((s) => /ROLLBACK/i.test(s))).toBe(true);
  });

  it('saveCalendarLink stores the link and maps status fields', async () => {
    relational();
    h.query.mockImplementation(async (sql: string) => {
      if (/SELECT count\(\*\)/i.test(sql)) return { rows: [{ n: '1' }], rowCount: 1 };
      return { rows: [], rowCount: 1 };
    });
    const l = link('ast_1', { lastSyncedAt: '2026-10-24T10:00:00.000Z', etag: '"e"' });
    await expect(Database.saveCalendarLink(l)).resolves.toMatchObject({ id: l.id });
    const ins = h.query.mock.calls.find((c) => /INSERT INTO kortex_calendar_links/i.test(String(c[0])))!;
    expect(String(ins[0])).toMatch(/ON CONFLICT \(id\) DO UPDATE/i);
    expect(ins[1]).toContain(l.id);
    expect(ins[1]).toContain('ast_1');
    expect(ins[1]).toContain('"e"');
    expect(sqls()[sqls().length - 1]).toMatch(/COMMIT/i);
  });

  it('getCalendarLinks maps columns to the app shape', async () => {
    relational();
    h.query.mockResolvedValue({
      rows: [
        {
          id: 'cal_1',
          assistant_id: 'ast_1',
          label: 'apple',
          url: 'https://x.example.com/a.ics',
          last_synced_at: new Date('2026-10-24T10:00:00Z'),
          last_error: null,
          error_since: null,
          etag: null,
          last_modified: 'Sat, 24 Oct 2026 10:00:00 GMT',
          created_at: new Date('2026-10-01T08:00:00Z'),
        },
      ],
      rowCount: 1,
    });
    const got = await Database.getCalendarLinks('ast_1');
    expect(got).toEqual([
      {
        id: 'cal_1',
        assistantId: 'ast_1',
        label: 'apple',
        url: 'https://x.example.com/a.ics',
        lastSyncedAt: '2026-10-24T10:00:00.000Z',
        lastModified: 'Sat, 24 Oct 2026 10:00:00 GMT',
        createdAt: '2026-10-01T08:00:00.000Z',
      },
    ]);
  });

  it('REQUIRED mode: a database failure throws BookingUnavailableError and never falls back to the file', async () => {
    relational();
    h.query.mockRejectedValue(Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), { code: 'ECONNREFUSED' }));
    const l = link('ast_req');
    await expect(Database.getExternalBlocks('ast_req')).rejects.toBeInstanceOf(BookingUnavailableError);
    await expect(Database.getCalendarLinks('ast_req')).rejects.toBeInstanceOf(BookingUnavailableError);
    await expect(Database.getAllCalendarLinks()).rejects.toBeInstanceOf(BookingUnavailableError);
    await expect(Database.saveCalendarLink(l)).rejects.toBeInstanceOf(BookingUnavailableError);
    await expect(Database.deleteCalendarLink('ast_req', l.id)).rejects.toBeInstanceOf(BookingUnavailableError);
    await expect(Database.replaceExternalBlocks(l.id, 'ast_req', [])).rejects.toBeInstanceOf(BookingUnavailableError);
    expect(fs.existsSync(dataFile())).toBe(false);
  });

  it('REQUIRED mode: Postgres not configured or without a pool is also unavailable', async () => {
    vi.stubEnv('DB_RELATIONAL_MODE', 'true');
    h.configured = false;
    await expect(Database.getExternalBlocks('ast_req')).rejects.toBeInstanceOf(BookingUnavailableError);
    h.configured = true;
    h.noPool = true;
    await expect(Database.getExternalBlocks('ast_req')).rejects.toBeInstanceOf(BookingUnavailableError);
    await expect(Database.saveCalendarLink(link('ast_req'))).rejects.toBeInstanceOf(BookingUnavailableError);
    expect(fs.existsSync(dataFile())).toBe(false);
  });

  it('not required (DB_RELATIONAL_MODE unset): the file is used and the pool is never touched', async () => {
    h.configured = true; // Postgres is configured, but this deployment does not use relational mode
    h.query.mockRejectedValue(new Error('boom'));
    expect(process.env.DB_RELATIONAL_MODE).toBe('');
    const l = link('ast_opt');
    await Database.saveCalendarLink(l);
    expect((await Database.getCalendarLinks('ast_opt')).map((x) => x.id)).toEqual([l.id]);
    expect(h.query).not.toHaveBeenCalled();
  });
});

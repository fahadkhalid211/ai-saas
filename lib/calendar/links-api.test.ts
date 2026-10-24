import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Only the network guard and (for one test) the whole fetch are faked. The route, the parser, the sync and the stores are real:
// JSON mode, a temp DATA_DIR, every database and cache URL blanked (like lib/db/fail-closed.test.ts). No test reaches a database or the network.
const h = vi.hoisted(() => ({
  verdict: { safe: true } as { safe: boolean; reason?: string },
  override: null as null | ((...a: unknown[]) => Promise<unknown>),
  fetchCalls: [] as string[],
}));

vi.mock('@/lib/security/ssrf', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/security/ssrf')>();
  return { ...actual, validateSafeExternalUrl: async () => h.verdict };
});
vi.mock('@/lib/calendar/sync/fetch-feed', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/calendar/sync/fetch-feed')>();
  return { ...actual, fetchCalendarFeed: (...a: unknown[]) => (h.override ? h.override(...a) : (actual.fetchCalendarFeed as (...x: unknown[]) => Promise<unknown>)(...a)) };
});

import { Database } from '@/lib/db';
import { BookingUnavailableError } from '@/lib/appointments/errors';
import { generateSessionToken } from '@/lib/security/auth';
import { CalendarLinkRuleError } from '@/lib/calendar/sync/link-rules';
import { _resetSyncStateForTesting } from '@/lib/calendar/sync/sync-link';
import * as logger from '@/lib/logging/logger';
import { GET, POST, DELETE } from '../../app/api/assistants/[id]/calendars/route';

const DB_ENV = [
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

const tag = Math.random().toString(36).slice(2, 8);
const PATH_SECRET = 'PathSecretTok7f3a9c1e5b';
const QUERY_SECRET = 'QuerySecretSig8d2b6f0a4c';
const FEED_URL = (n = 1) => `https://calendar.google.com/calendar/ical/owner%40example.com/private-${PATH_SECRET}${n}/basic.ics?sig=${QUERY_SECRET}${n}`;

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());
beforeEach(() => {
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  h.verdict = { safe: true };
  h.override = null;
  h.fetchCalls = [];
  _resetSyncStateForTesting();
  installFeed();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
function calendarText(): string {
  const start = new Date(Date.now() + 2 * 86400_000);
  start.setUTCHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 3600_000);
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//test//EN\r\nBEGIN:VEVENT\r\nUID:a@test\r\nDTSTAMP:20261001T000000Z\r\nDTSTART:${stamp(start)}\r\nDTEND:${stamp(end)}\r\nSUMMARY:Busy\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
}

/** A pretend calendar server for every address. */
function installFeed(body: () => Response = () => new Response(calendarText(), { status: 200, headers: { 'content-type': 'text/calendar' } })) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      h.fetchCalls.push(String(url));
      return body();
    }),
  );
}

interface Person {
  ws: string;
  assistantId: string;
  cookie: string;
}
async function person(label: string, role = 'owner'): Promise<Person> {
  const t = await Database.createTenantWorkspace({ businessName: `Cal ${label} ${tag}`, ownerEmail: `${label}-${tag}-${Math.random().toString(36).slice(2, 6)}@example.com`, password: 'a-good-password' });
  await Database.updateAssistant(t.assistant.id, { timezone: 'UTC' } as never);
  let memberId = t.owner.id;
  if (role !== 'owner') {
    const m = await Database.addTeamMember({ workspaceId: t.workspace.id, name: 'Member', email: `member-${tag}-${Math.random().toString(36).slice(2, 6)}@example.com`, role: role as 'viewer', status: 'active' });
    memberId = m.id;
  }
  return { ws: t.workspace.id, assistantId: t.assistant.id, cookie: `kortex_admin_session=${generateSessionToken(role, memberId, t.workspace.id)}` };
}

let ipSeq = 0;
const headers = (cookie?: string) => ({
  'content-type': 'application/json',
  ...(cookie ? { cookie } : {}),
  'x-forwarded-for': `10.9.${(ipSeq >> 8) & 255}.${ipSeq++ & 255}`,
});
const ctxOf = (id: string) => ({ params: Promise.resolve({ id }) });
const BASE = (id: string) => `http://localhost/api/assistants/${id}/calendars`;

async function call(method: 'GET' | 'POST' | 'DELETE', who: { assistantId?: string; cookie?: string }, opts: { id?: string; query?: string; body?: unknown; raw?: string } = {}) {
  const id = opts.id ?? who.assistantId!;
  const req = new NextRequest(`${BASE(id)}${opts.query ?? ''}`, {
    method,
    headers: headers(who.cookie),
    ...(opts.raw !== undefined ? { body: opts.raw } : opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });
  const fn = method === 'GET' ? GET : method === 'POST' ? POST : DELETE;
  const res = await fn(req, ctxOf(id));
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, headers: res.headers, text, json };
}
const add = (who: Person, body: unknown = { label: 'google', url: FEED_URL() }) => call('POST', who, { body });

const NOT_SECRET = (text: string) => {
  expect(text).not.toContain(PATH_SECRET);
  expect(text).not.toContain(QUERY_SECRET);
  expect(text).not.toMatch(/https?:\/\/calendar\.google\.com\/calendar\/ical/);
  expect(text).not.toContain('basic.ics');
};

describe('GET /api/assistants/[id]/calendars', () => {
  it('starts empty with a busy feed address and says whether storage is durable', async () => {
    const a = await person('get');
    const res = await call('GET', a);
    expect(res.status).toBe(200);
    expect(res.json.links).toEqual([]);
    expect(res.json.durable).toBe(false); // DB_RELATIONAL_MODE is off here
    expect(res.json.busyFeed.url).toMatch(/^http:\/\/localhost\/api\/calendar\/[A-Za-z0-9_-]{32}\/feed\.ics$/);
    expect(res.headers.get('cache-control')).toMatch(/no-store/);
  });

  it('keeps the same busy feed address between calls and puts it on the assistant\'s own feed route', async () => {
    const a = await person('stable');
    const first = (await call('GET', a)).json.busyFeed.url as string;
    const second = (await call('GET', a)).json.busyFeed.url as string;
    expect(second).toBe(first);
    const token = first.split('/')[5];
    expect((await Database.getAssistantByBusyFeedToken(token))?.id).toBe(a.assistantId);
  });

  it('reports durable when the relational mode is on', async () => {
    vi.stubEnv('DB_RELATIONAL_MODE', 'true');
    const a = await person('durable');
    vi.spyOn(Database, 'getCalendarLinks').mockResolvedValue([]);
    const res = await call('GET', a);
    expect(res.status).toBe(200);
    expect(res.json.durable).toBe(true);
  });

  it('never contains a full calendar address, query string or token anywhere in the response', async () => {
    const a = await person('mask');
    expect((await add(a)).status).toBe(201);
    const res = await call('GET', a);
    expect(res.status).toBe(200);
    expect(res.json.links).toHaveLength(1);
    expect(res.json.links[0]).toMatchObject({ label: 'google', maskedUrl: 'https://calendar.google.com/calendar/…', blockCount: 1, unsupportedCount: 0 });
    expect(Object.keys(res.json.links[0]).sort()).toEqual(['blockCount', 'createdAt', 'id', 'label', 'lastError', 'lastSyncedAt', 'maskedUrl', 'unsupportedCount']);
    NOT_SECRET(res.text);
    expect(res.text).toContain('busyFeed');
  });

  it('scrubs a stored error that quotes an address', async () => {
    const a = await person('scrub');
    await add(a);
    const [link] = await Database.getCalendarLinks(a.assistantId);
    await Database.updateCalendarLinkStatus(a.assistantId, link.id, { lastError: `Broke at ${link.url} and https://elsewhere.example.com/x?t=${QUERY_SECRET}` });
    const res = await call('GET', a);
    NOT_SECRET(res.text);
    expect(res.json.links[0].lastError).toContain('Broke at');
  });
});

describe('POST: add a calendar', () => {
  it('saves a readable calendar, reads it once, stores its blocks and returns the masked link', async () => {
    const a = await person('add');
    const res = await add(a);
    expect(res.status).toBe(201);
    expect(res.json.link).toMatchObject({ label: 'google', maskedUrl: 'https://calendar.google.com/calendar/…', blockCount: 1, unsupportedCount: 0, lastError: null });
    expect(res.json.link.lastSyncedAt).toBeTruthy();
    NOT_SECRET(res.text);

    const stored = await Database.getCalendarLinks(a.assistantId);
    expect(stored).toHaveLength(1);
    expect(stored[0].url).toBe(FEED_URL());
    expect(stored[0].id).toBe(res.json.link.id);
    expect((await Database.getExternalBlocks(a.assistantId)).length).toBe(1);
    expect(stored[0].blockCount).toBe(1);
  });

  it('turns webcal:// into https:// before it is read and saved', async () => {
    const a = await person('webcal');
    const res = await add(a, { label: 'apple', url: `  webcal://p12-caldav.icloud.com/published/2/${PATH_SECRET} ` });
    expect(res.status).toBe(201);
    expect(res.json.link.maskedUrl).toBe('https://p12-caldav.icloud.com/published/…');
    expect((await Database.getCalendarLinks(a.assistantId))[0].url).toBe(`https://p12-caldav.icloud.com/published/2/${PATH_SECRET}`);
    expect(h.fetchCalls.every((u) => u.startsWith('https://'))).toBe(true);
  });

  it.each([
    ['a private address', 'https://192.168.0.5/cal.ics', () => { h.verdict = { safe: false, reason: 'private' }; }, /internal addresses are not allowed/i],
    ['plain http', 'http://calendar.example.com/cal.ics', () => {}, /https/i],
    ['a link with a username and password', 'https://me:hunter2-pw@calendar.example.com/cal.ics', () => {}, /username or password/i],
    ['a web page instead of a calendar', 'https://calendar.example.com/page', () => installFeed(() => new Response('<html><body>Sign in to continue</body></html>', { status: 200 })), /web page|not a calendar|\.ics/i],
    ['a server that is not shared any more', 'https://calendar.example.com/gone.ics', () => installFeed(() => new Response('nope', { status: 404 })), /not allowed to read|refused|shared/i],
    ['a server that cannot be reached', 'https://calendar.example.com/down.ics', () => vi.stubGlobal('fetch', vi.fn(async (u: string) => { throw new Error(`connect ECONNREFUSED ${u}?${QUERY_SECRET}`); })), /could not reach|could not be reached|unreachable/i],
    ['a server that takes too long', 'https://calendar.example.com/slow.ics', () => { h.override = async () => ({ status: 'error', error: `calendar.example.com took too long to answer (over 8 seconds).` }); }, /too long/i],
    ['a calendar that cannot be read', 'https://calendar.example.com/broken.ics', () => installFeed(() => new Response('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\n', { status: 200 })), /readable|read/i],
  ])('rejects %s with 400, a short reason and no address in the response', async (_name, rawUrl, arrange, reason) => {
    const a = await person('reject');
    const url = `${rawUrl}?token=${QUERY_SECRET}`;
    arrange();
    const spies = [vi.spyOn(console, 'log'), vi.spyOn(console, 'warn'), vi.spyOn(console, 'error'), vi.spyOn(console, 'info'), vi.spyOn(logger, 'logEvent')];
    const res = await add(a, { label: 'other', url });
    expect(res.status).toBe(400);
    expect(res.json.error).toMatch(reason);
    expect(res.json.error.length).toBeLessThan(200);
    expect(res.text).not.toContain(QUERY_SECRET);
    expect(res.text).not.toContain('calendar.example.com');
    expect(res.text).not.toContain('hunter2');
    expect(res.text).not.toContain('192.168');
    expect(await Database.getCalendarLinks(a.assistantId)).toEqual([]);
    const everything = JSON.stringify(spies.map((s) => s.mock.calls));
    expect(everything).not.toContain(QUERY_SECRET);
    expect(everything).not.toContain('hunter2');
  });

  it('rejects an unknown label, a missing address and bad JSON with 400', async () => {
    const a = await person('bad-body');
    expect((await add(a, { label: 'yahoo', url: FEED_URL() })).status).toBe(400);
    expect((await add(a, { label: 'google' })).status).toBe(400);
    expect((await add(a, { label: 'google', url: '   ' })).status).toBe(400);
    expect((await add(a, { label: 'google', url: 42 })).status).toBe(400);
    expect((await add(a, { label: 'google', url: `https://x.example.com/${'a'.repeat(2100)}` })).status).toBe(400);
    expect((await call('POST', a, { raw: '{not json' })).status).toBe(400);
    expect(await Database.getCalendarLinks(a.assistantId)).toEqual([]);
    expect(h.fetchCalls).toEqual([]);
  });

  it('rejects an oversized body with 413 before reading it as JSON', async () => {
    const a = await person('big');
    const res = await call('POST', a, { raw: JSON.stringify({ label: 'google', url: 'https://x.example.com/' + 'a'.repeat(10_000) }) });
    expect(res.status).toBe(413);
    expect(h.fetchCalls).toEqual([]);
  });

  it.each([
    ['the busy feed', 'https://localhost/api/calendar/abcdefghijklmnopqrstuvwxyz012345/feed.ics'],
    ['the busy feed as webcal', 'webcal://localhost/api/calendar/abcdefghijklmnopqrstuvwxyz012345/feed.ics'],
    ['the busy feed with a doubled slash', 'https://localhost//api/calendar/abcdefghijklmnopqrstuvwxyz012345/feed.ics'],
    ['the guest-detail feed', 'https://localhost/api/appointments/calendar?assistantId=x&token=y'],
    ['the configured public address', 'https://www.crescelo.example/api/calendar/abcdefghijklmnopqrstuvwxyz012345/feed.ics'],
  ])('refuses %s of this app with a fixed message and never reads it', async (_name, url) => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://crescelo.example');
    const a = await person('own');
    const res = await add(a, { label: 'other', url });
    expect(res.status).toBe(400);
    expect(res.json.error).toBe('That is your own Crescelo calendar link. Add a link from the calendar you use elsewhere.');
    expect(h.fetchCalls).toEqual([]);
    expect(await Database.getCalendarLinks(a.assistantId)).toEqual([]);
  });

  it('accepts another site whose path merely looks like this app\'s feed', async () => {
    const a = await person('lookalike');
    expect((await add(a, { label: 'other', url: 'https://calendar.example.com/api/calendar/abc/feed.ics' })).status).toBe(201);
  });

  it('refuses the same calendar twice', async () => {
    const a = await person('dupe');
    expect((await add(a)).status).toBe(201);
    const again = await add(a, { label: 'outlook', url: FEED_URL().replace('https://', 'webcal://') });
    expect(again.status).toBe(400);
    expect(again.json.error).toMatch(/already/i);
    expect(await Database.getCalendarLinks(a.assistantId)).toHaveLength(1);
  });

  it('refuses a 6th calendar with the rule message and does not read it', async () => {
    const a = await person('limit');
    for (let n = 1; n <= 5; n++) expect((await add(a, { label: 'google', url: FEED_URL(n) })).status).toBe(201);
    h.fetchCalls = [];
    const res = await add(a, { label: 'google', url: FEED_URL(6) });
    expect(res.status).toBe(400);
    expect(res.json.error).toBe('An assistant can link at most 5 calendars.');
    expect(h.fetchCalls).toEqual([]);
    expect(await Database.getCalendarLinks(a.assistantId)).toHaveLength(5);
  });

  it('answers a rule error raised by the store (a race for the last place) with 400 and its own message', async () => {
    const a = await person('race');
    vi.spyOn(Database, 'saveCalendarLink').mockRejectedValue(new CalendarLinkRuleError('An assistant can link at most 5 calendars.'));
    const res = await add(a);
    expect(res.status).toBe(400);
    expect(res.json.error).toBe('An assistant can link at most 5 calendars.');
  });

  it('limits adds to 10 a minute per workspace', async () => {
    const a = await person('rate');
    for (let n = 0; n < 10; n++) expect((await add(a, { label: 'nope', url: 'x' })).status).toBe(400);
    const res = await add(a, { label: 'nope', url: 'x' });
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0);
    // another workspace is not affected
    const b = await person('rate-other');
    expect((await add(b, { label: 'nope', url: 'x' })).status).toBe(400);
  });

  it('keeps the link when the first sync fails afterwards, showing the error', async () => {
    const a = await person('late-fail');
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn(async () => (++calls === 1 ? new Response(calendarText(), { status: 200 }) : new Response('x', { status: 500 }))));
    const res = await add(a);
    expect(res.status).toBe(201);
    expect(res.json.link.lastError).toBeTruthy();
    NOT_SECRET(res.text);
    expect(await Database.getCalendarLinks(a.assistantId)).toHaveLength(1);
  });
});

describe('DELETE ?linkId=', () => {
  it('removes the link and its blocks', async () => {
    const a = await person('del');
    const id = (await add(a)).json.link.id as string;
    expect((await Database.getExternalBlocks(a.assistantId)).length).toBe(1);
    const res = await call('DELETE', a, { query: `?linkId=${id}` });
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ success: true });
    expect(await Database.getCalendarLinks(a.assistantId)).toEqual([]);
    expect(await Database.getExternalBlocks(a.assistantId)).toEqual([]);
  });

  it('answers 404 for an unknown id and for a link of another assistant, and removes nothing', async () => {
    const a = await person('del-a');
    const b = await person('del-b');
    const bId = (await add(b)).json.link.id as string;
    const aId = (await add(a)).json.link.id as string;
    expect((await call('DELETE', a, { query: `?linkId=${bId}` })).status).toBe(404);
    expect((await call('DELETE', a, { query: '?linkId=cal_nope' })).status).toBe(404);
    expect((await call('DELETE', a, { query: '' })).status).toBe(400);
    expect(await Database.getCalendarLinks(b.assistantId)).toHaveLength(1);
    expect((await Database.getExternalBlocks(b.assistantId)).length).toBe(1);
    expect(await Database.getCalendarLinks(a.assistantId)).toHaveLength(1);
    expect(aId).not.toBe(bId);
  });
});

describe('POST ?action=sync&linkId=', () => {
  it('reads the link again and returns the updated masked link', async () => {
    const a = await person('sync');
    const id = (await add(a)).json.link.id as string;
    await Database.updateCalendarLinkStatus(a.assistantId, id, { lastError: 'Old problem', errorSince: new Date().toISOString(), blockCount: 0, fullSyncedAt: null });
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() + 60_000); // past the 30 s pause that the add itself started
    const res = await call('POST', a, { query: `?action=sync&linkId=${id}` });
    expect(res.status).toBe(200);
    expect(res.json.link).toMatchObject({ id, lastError: null, blockCount: 1 });
    NOT_SECRET(res.text);
  });

  it('pauses a link for 30 seconds after an attempt: 429 with Retry-After, then allowed again', async () => {
    const a = await person('sync-rate');
    const id = (await add(a)).json.link.id as string;
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() + 31_000);
    expect((await call('POST', a, { query: `?action=sync&linkId=${id}` })).status).toBe(200);
    vi.setSystemTime(Date.now() + 10_000);
    const blocked = await call('POST', a, { query: `?action=sync&linkId=${id}` });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThanOrEqual(1);
    expect(Number(blocked.headers.get('retry-after'))).toBeLessThanOrEqual(30);
    vi.setSystemTime(Date.now() + 25_000);
    expect((await call('POST', a, { query: `?action=sync&linkId=${id}` })).status).toBe(200);
  });

  it('answers 404 for an unknown link and for another assistant\'s link, and 400 without an id', async () => {
    const a = await person('sync-404');
    const b = await person('sync-404b');
    const bId = (await add(b)).json.link.id as string;
    expect((await call('POST', a, { query: `?action=sync&linkId=${bId}` })).status).toBe(404);
    expect((await call('POST', a, { query: '?action=sync&linkId=cal_none' })).status).toBe(404);
    expect((await call('POST', a, { query: '?action=sync' })).status).toBe(400);
  });

  it('rejects an unknown action', async () => {
    const a = await person('action');
    expect((await call('POST', a, { query: '?action=explode' })).status).toBe(400);
  });
});

describe('POST ?action=reset-feed', () => {
  it('returns a new feed address; the old one stops resolving and GET agrees', async () => {
    const a = await person('reset');
    const before = (await call('GET', a)).json.busyFeed.url as string;
    const res = await call('POST', a, { query: '?action=reset-feed' });
    expect(res.status).toBe(200);
    const after = res.json.busyFeed.url as string;
    expect(after).not.toBe(before);
    expect(after).toMatch(/\/api\/calendar\/[A-Za-z0-9_-]{32}\/feed\.ics$/);
    expect(await Database.getAssistantByBusyFeedToken(before.split('/')[5])).toBeNull();
    expect((await Database.getAssistantByBusyFeedToken(after.split('/')[5]))?.id).toBe(a.assistantId);
    expect((await call('GET', a)).json.busyFeed.url).toBe(after);
  });
});

describe('who may call it', () => {
  it('answers 401 to everything without a session', async () => {
    const a = await person('anon');
    const noSession = { assistantId: a.assistantId };
    expect((await call('GET', noSession)).status).toBe(401);
    expect((await call('POST', noSession, { body: { label: 'google', url: FEED_URL() } })).status).toBe(401);
    expect((await call('POST', noSession, { query: '?action=reset-feed' })).status).toBe(401);
    expect((await call('POST', noSession, { query: '?action=sync&linkId=x' })).status).toBe(401);
    expect((await call('DELETE', noSession, { query: '?linkId=x' })).status).toBe(401);
    expect(h.fetchCalls).toEqual([]);
  });

  it('answers 404 to a member of another workspace on every action, and changes nothing', async () => {
    const a = await person('mine');
    const other = await person('theirs');
    const id = (await add(a)).json.link.id as string;
    const feedBefore = (await call('GET', a)).json.busyFeed.url;
    h.fetchCalls = [];
    const stranger = { cookie: other.cookie };
    const target = { id: a.assistantId };
    expect((await call('GET', stranger, target)).status).toBe(404);
    expect((await call('POST', stranger, { ...target, body: { label: 'google', url: FEED_URL(9) } })).status).toBe(404);
    expect((await call('POST', stranger, { ...target, query: `?action=sync&linkId=${id}` })).status).toBe(404);
    expect((await call('POST', stranger, { ...target, query: '?action=reset-feed' })).status).toBe(404);
    expect((await call('DELETE', stranger, { ...target, query: `?linkId=${id}` })).status).toBe(404);
    expect(h.fetchCalls).toEqual([]);
    expect(await Database.getCalendarLinks(a.assistantId)).toHaveLength(1);
    expect((await call('GET', a)).json.busyFeed.url).toBe(feedBefore);
    // an assistant that does not exist is the same answer
    expect((await call('GET', a, { id: 'ast_does_not_exist' })).status).toBe(404);
  });

  it('keeps the settings to owners and admins', async () => {
    const a = await person('viewer', 'viewer');
    expect((await call('GET', a)).status).toBe(403);
  });
});

describe('when storage is unavailable', () => {
  const MESSAGE = 'Calendar settings are temporarily unavailable. Please try again in a moment.';
  const expect503 = (res: Awaited<ReturnType<typeof call>>) => {
    expect(res.status).toBe(503);
    expect(res.json.error).toBe(MESSAGE);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(res.text).not.toMatch(/booking/i);
  };

  it('answers GET, add, delete, sync and reset with the settings message and Retry-After 60', async () => {
    const a = await person('down');
    const id = (await add(a)).json.link.id as string;

    const down = new BookingUnavailableError();
    const links = vi.spyOn(Database, 'getCalendarLinks').mockRejectedValue(down);
    expect503(await call('GET', a));
    expect503(await add(a, { label: 'google', url: FEED_URL(2) }));
    expect503(await call('POST', a, { query: `?action=sync&linkId=${id}` }));
    links.mockRestore();

    vi.spyOn(Database, 'saveCalendarLink').mockRejectedValue(down);
    expect503(await add(a, { label: 'google', url: FEED_URL(3) }));
    vi.spyOn(Database, 'deleteCalendarLink').mockRejectedValue(down);
    expect503(await call('DELETE', a, { query: `?linkId=${id}` }));
    vi.spyOn(Database, 'setBusyFeedToken').mockRejectedValue(down);
    expect503(await call('POST', a, { query: '?action=reset-feed' }));
  });

  it('never puts raw error text in a response or a log, and treats any other storage failure the same way', async () => {
    const a = await person('raw');
    const spies = [vi.spyOn(console, 'log'), vi.spyOn(console, 'warn'), vi.spyOn(console, 'error'), vi.spyOn(logger, 'logEvent')];
    vi.spyOn(Database, 'getCalendarLinks').mockRejectedValue(new Error(`duplicate key detail: ${FEED_URL()}`));
    const res = await call('GET', a);
    expect(res.status).toBe(503);
    expect(res.json.error).toBe(MESSAGE);
    expect(res.text).not.toContain(PATH_SECRET);
    expect(JSON.stringify(spies.map((s) => s.mock.calls))).not.toContain(PATH_SECRET);
  });
});

describe('audit log', () => {
  it('records each change with the label and link id only, never an address or token', async () => {
    const a = await person('audit');
    const id = (await add(a, { label: 'outlook', url: FEED_URL() })).json.link.id as string;
    await call('POST', a, { query: '?action=reset-feed' });
    const feed = (await call('GET', a)).json.busyFeed.url as string;
    await call('DELETE', a, { query: `?linkId=${id}` });

    const logs = ((await Database.getState()).auditLogs || []).filter((l) => l.targetId === a.assistantId && l.action.startsWith('calendar_'));
    expect(logs.map((l) => l.action).sort()).toEqual(['calendar_feed.reset', 'calendar_link.added', 'calendar_link.removed']);
    const added = logs.find((l) => l.action === 'calendar_link.added')!;
    expect(added.details).toEqual({ label: 'outlook', linkId: id });
    expect(logs.find((l) => l.action === 'calendar_link.removed')!.details).toEqual({ label: 'outlook', linkId: id });
    expect(logs.find((l) => l.action === 'calendar_feed.reset')!.details).toEqual({});
    const text = JSON.stringify(logs);
    expect(text).not.toContain(PATH_SECRET);
    expect(text).not.toContain(QUERY_SECRET);
    expect(text).not.toContain('calendar.google.com');
    expect(text).not.toContain(feed.split('/')[5]);
    expect(added.workspaceId).toBe(a.ws);
  });

  it('writes nothing for a refused change', async () => {
    const a = await person('audit-none');
    const before = ((await Database.getState()).auditLogs || []).length;
    await add(a, { label: 'google', url: 'http://calendar.example.com/x.ics' });
    await call('DELETE', a, { query: '?linkId=nope' });
    expect(((await Database.getState()).auditLogs || []).length).toBe(before);
  });
});

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database, type AppointmentData } from '../db';
import { slotRange } from '../appointments/time-range';
import { generateBusyFeed, ensureBusyFeedToken, resetBusyFeedToken } from './export-feed';
import { GET, HEAD } from '../../app/api/calendar/[token]/feed.ics/route';

// Records every logEvent call (and still runs the real one) so a test can prove what reaches the log.
const logged = vi.hoisted(() => ({ calls: [] as unknown[] }));
vi.mock('../logging/logger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../logging/logger')>();
  return { ...actual, logEvent: (input: unknown) => { logged.calls.push(input); return (actual.logEvent as (i: unknown) => unknown)(input); } };
});

/**
 * The busy-only export feed. JSON mode, every database and cache URL blanked (like lib/db/fail-closed.test.ts), so nothing
 * here can reach a real database or network.
 */

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

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());
beforeEach(() => {
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
});
afterEach(() => vi.restoreAllMocks());

const tag = Math.random().toString(36).slice(2, 8);

// Distinctive strings: each must be absent from the whole feed text.
const SECRET = {
  name: 'Zaphod Quillfeather',
  email: 'zaphod.quillfeather@secret-mail.test',
  phone: '+46 70 555 01 99',
  notes: 'Allergic to ZEBRANOTES and needs a ramp',
  service: 'Deluxe Hot Stone Gorgonzola Massage',
  price: 98765,
  manage: 'manageTok_Xy7Q2pLmN4vB8cRtZ1wK',
  landing: 'landing-page-name-quux',
  reason: 'cancel-reason-plugh',
  id: 'apt_ZZtop123',
};

function booking(over: Partial<AppointmentData> = {}): AppointmentData {
  return {
    id: SECRET.id,
    assistantId: 'ast_feed',
    name: SECRET.name,
    email: SECRET.email,
    phone: SECRET.phone,
    date: '2026-07-15',
    timeSlot: '10:00 AM',
    durationMinutes: 30,
    status: 'confirmed',
    notes: SECRET.notes,
    serviceId: 'svc_1',
    serviceName: SECRET.service,
    price: SECRET.price,
    manageToken: SECRET.manage,
    landingPageName: SECRET.landing,
    cancellationReason: SECRET.reason,
    createdAt: '2026-06-01T00:00:00.000Z',
    ...over,
  };
}

const NOW = new Date('2026-07-01T12:00:00.000Z');
const unfold = (text: string) => text.replace(/\r\n[ \t]/g, '');
const lines = (text: string) => unfold(text).split('\r\n');
const events = (text: string) => unfold(text).split('BEGIN:VEVENT\r\n').slice(1);
const prop = (block: string, name: string) => block.split('\r\n').find((l) => l.startsWith(name + ':') || l.startsWith(name + ';'));

describe('generateBusyFeed', () => {
  it('emits one Busy event per booking and nothing personal', () => {
    const text = generateBusyFeed([booking()], 'Studio Calendar', 'Europe/Stockholm', NOW);
    expect(events(text)).toHaveLength(1);
    expect(text).toContain('SUMMARY:Busy');
    expect(text).toContain('TRANSP:OPAQUE');
    expect(text).toContain('STATUS:CONFIRMED');
    expect(text).toContain('UID:' + SECRET.id + '@crescelo');
    for (const [key, value] of Object.entries(SECRET)) {
      if (key === 'id') continue; // the id is the UID by design
      expect(text, key).not.toContain(String(value));
    }
    // no property that could carry personal data
    for (const forbidden of ['DESCRIPTION', 'ATTENDEE', 'ORGANIZER', 'LOCATION', 'URL', 'CONTACT', 'COMMENT', 'ATTACH', 'CATEGORIES']) {
      expect(text).not.toMatch(new RegExp('^' + forbidden + '[:;]', 'm'));
    }
    // the guest's local parts must not leak in pieces either
    expect(text.toLowerCase()).not.toContain('zaphod');
    expect(text.toLowerCase()).not.toContain('555');
  });

  it('is a valid calendar envelope with the feed refresh hints', () => {
    const text = generateBusyFeed([booking()], 'Studio Calendar', 'Europe/Stockholm', NOW);
    const l = lines(text);
    expect(l[0]).toBe('BEGIN:VCALENDAR');
    expect(l).toContain('VERSION:2.0');
    expect(l).toContain('PRODID:-//Crescelo//Busy Feed//EN');
    expect(l).toContain('METHOD:PUBLISH');
    expect(l).toContain('CALSCALE:GREGORIAN');
    expect(l).toContain('X-WR-CALNAME:Studio Calendar');
    expect(l).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT1H');
    expect(l).toContain('X-PUBLISHED-TTL:PT1H');
    expect(l[l.length - 2]).toBe('END:VCALENDAR');
    expect(l[l.length - 1]).toBe(''); // ends with CRLF
  });

  it('produces an empty but valid calendar when there is nothing to show', () => {
    const text = generateBusyFeed([], 'Empty', 'UTC', NOW);
    expect(text).toContain('BEGIN:VCALENDAR');
    expect(text).not.toContain('BEGIN:VEVENT');
  });

  it('DTSTART and DTEND equal slotRange in UTC (Stockholm summer and winter)', () => {
    const summer = booking({ id: 'apt_summer', date: '2026-07-15', timeSlot: '10:00 AM', durationMinutes: 45 });
    const winter = booking({ id: 'apt_winter', date: '2026-12-15', timeSlot: '10:00 AM - 11:30 AM' });
    const text = generateBusyFeed([summer, winter], 'C', 'Europe/Stockholm', NOW);
    const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    for (const a of [summer, winter]) {
      const r = slotRange(a.date, a.timeSlot, a.durationMinutes, 'Europe/Stockholm')!;
      const block = events(text).find((e) => e.includes('UID:' + a.id + '@crescelo'))!;
      expect(prop(block, 'DTSTART')).toBe('DTSTART:' + stamp(r.start));
      expect(prop(block, 'DTEND')).toBe('DTEND:' + stamp(r.end));
    }
    // 10:00 Stockholm is 08:00Z in summer (UTC+2) and 09:00Z in winter (UTC+1)
    expect(text).toContain('DTSTART:20260715T080000Z');
    expect(text).toContain('DTEND:20260715T084500Z');
    expect(text).toContain('DTSTART:20261215T090000Z');
    expect(text).toContain('DTEND:20261215T103000Z');
    // DTSTAMP is the generation time
    expect(text).toContain('DTSTAMP:20260701T120000Z');
  });

  it('marks pending bookings TENTATIVE and confirmed ones CONFIRMED', () => {
    const text = generateBusyFeed(
      [booking({ id: 'apt_p', status: 'pending' }), booking({ id: 'apt_c', status: 'confirmed', timeSlot: '1:00 PM' })],
      'C',
      'Europe/Stockholm',
      NOW,
    );
    expect(prop(events(text).find((e) => e.includes('apt_p@'))!, 'STATUS')).toBe('STATUS:TENTATIVE');
    expect(prop(events(text).find((e) => e.includes('apt_c@'))!, 'STATUS')).toBe('STATUS:CONFIRMED');
  });

  it('leaves out cancelled bookings and bookings whose time cannot be read', () => {
    const text = generateBusyFeed(
      [
        booking({ id: 'apt_cancelled', status: 'cancelled' }),
        booking({ id: 'apt_garbled', timeSlot: 'sometime after lunch' }),
        booking({ id: 'apt_baddate', date: 'next tuesday' }),
        booking({ id: 'apt_ok', timeSlot: '2:00 PM' }),
      ],
      'C',
      'Europe/Stockholm',
      NOW,
    );
    expect(text).not.toContain('apt_cancelled');
    expect(text).not.toContain('apt_garbled');
    expect(text).not.toContain('apt_baddate');
    expect(events(text)).toHaveLength(1);
    expect(text).toContain('apt_ok@crescelo');
  });

  it('leaves out completed bookings in the past but keeps ones that are still ahead', () => {
    const text = generateBusyFeed(
      [
        booking({ id: 'apt_done_past', status: 'completed', date: '2026-06-30', timeSlot: '10:00 AM' }),
        booking({ id: 'apt_done_future', status: 'completed', date: '2026-07-20', timeSlot: '10:00 AM' }),
      ],
      'C',
      'Europe/Stockholm',
      NOW,
    );
    expect(text).not.toContain('apt_done_past');
    expect(text).toContain('apt_done_future@crescelo');
  });

  it('keeps bookings from yesterday onward and drops older ones', () => {
    const text = generateBusyFeed(
      [
        booking({ id: 'apt_old', date: '2026-06-20' }),
        booking({ id: 'apt_daybefore', date: '2026-06-29', timeSlot: '10:00 AM' }), // ended well over 24 h before NOW
        booking({ id: 'apt_yesterday', date: '2026-06-30', timeSlot: '3:00 PM' }), // ended 17 h before NOW
        booking({ id: 'apt_today', date: '2026-07-01', timeSlot: '9:00 AM' }),
      ],
      'C',
      'Europe/Stockholm',
      NOW,
    );
    expect(text).not.toContain('apt_old@');
    expect(text).not.toContain('apt_daybefore@');
    expect(text).toContain('apt_yesterday@crescelo');
    expect(text).toContain('apt_today@crescelo');
  });

  it('orders events by start time', () => {
    const text = generateBusyFeed(
      [booking({ id: 'apt_b', date: '2026-07-16' }), booking({ id: 'apt_a', date: '2026-07-15' })],
      'C',
      'UTC',
      NOW,
    );
    expect(text.indexOf('apt_a@')).toBeLessThan(text.indexOf('apt_b@'));
  });

  it('uses CRLF line endings only and folds long lines at 75 octets', () => {
    const long = 'Dr. Ångström, Böhm & Söhne – the "very" long; calendar name ' + 'x'.repeat(200) + ' ééé 日本語 end';
    const text = generateBusyFeed([booking()], long, 'Europe/Stockholm', NOW);
    expect(text).not.toMatch(/(^|[^\r])\n/); // every LF follows a CR
    const physical = text.split('\r\n');
    expect(physical.some((p) => p.startsWith(' '))).toBe(true); // something was folded
    for (const p of physical) expect(Buffer.byteLength(p, 'utf8')).toBeLessThanOrEqual(75);
    // folding never splits a multi-byte character
    expect(text).not.toContain('�');
    // and unfolding restores the escaped name exactly
    expect(unfold(text)).toContain(
      'X-WR-CALNAME:Dr. Ångström\\, Böhm & Söhne – the "very" long\\; calendar name ' + 'x'.repeat(200) + ' ééé 日本語 end',
    );
  });

  it('escapes the calendar name (backslash, semicolon, comma, newline) and cannot be used to inject properties', () => {
    const evil = 'A;B,C\\D\r\nBEGIN:VEVENT\r\nSUMMARY:Injected';
    const text = generateBusyFeed([booking()], evil, 'UTC', NOW);
    const l = lines(text);
    expect(l.filter((x) => x === 'BEGIN:VEVENT')).toHaveLength(1);
    expect(l.some((x) => x.startsWith('SUMMARY:Injected'))).toBe(false);
    expect(l).toContain('X-WR-CALNAME:A\\;B\\,C\\\\D\\nBEGIN:VEVENT\\nSUMMARY:Injected');
  });

  it('falls back to a generic calendar name when the name is empty', () => {
    expect(generateBusyFeed([], '   ', 'UTC', NOW)).toContain('X-WR-CALNAME:Crescelo Busy');
  });
});

// --- tokens ---------------------------------------------------------------------------------------------------------

async function owner(label: string) {
  const t = await Database.createTenantWorkspace({ businessName: `Feed ${label} ${tag}`, ownerEmail: `${label}-${tag}@example.com`, password: 'a-good-password' });
  return (await Database.getAssistantById(t.assistant.id))!;
}

describe('ensureBusyFeedToken / resetBusyFeedToken', () => {
  it('first call generates and stores a base64url token of 32 characters; the second returns the same', async () => {
    const a = await owner('ensure');
    expect(a.busyFeedToken).toBeUndefined();
    const t1 = await ensureBusyFeedToken(a);
    expect(t1).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect((await Database.getAssistantById(a.id))!.busyFeedToken).toBe(t1);
    expect((await Database.getAssistantByBusyFeedToken(t1))?.id).toBe(a.id);
    // a stale object (fetched before the token existed) still gets the stored one
    expect(await ensureBusyFeedToken(a)).toBe(t1);
    expect(await ensureBusyFeedToken((await Database.getAssistantById(a.id))!)).toBe(t1);
  });

  it('reset returns a different token and the old one no longer resolves', async () => {
    const a = await owner('reset');
    const t1 = await ensureBusyFeedToken(a);
    const t2 = await resetBusyFeedToken(a);
    expect(t2).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(t2).not.toBe(t1);
    expect(await Database.getAssistantByBusyFeedToken(t1)).toBeNull();
    expect((await Database.getAssistantByBusyFeedToken(t2))?.id).toBe(a.id);
    expect(await ensureBusyFeedToken(a)).toBe(t2);
  });

  it('reset works for an assistant that never had a token', async () => {
    const a = await owner('reset-first');
    const t = await resetBusyFeedToken(a);
    expect((await Database.getAssistantByBusyFeedToken(t))?.id).toBe(a.id);
  });

  it('a concurrent ensure race returns one consistent token, and that one is stored', async () => {
    const a = await owner('race');
    const tokens = await Promise.all(Array.from({ length: 8 }, () => ensureBusyFeedToken(a)));
    expect(new Set(tokens).size).toBe(1);
    expect((await Database.getAssistantById(a.id))!.busyFeedToken).toBe(tokens[0]);
    expect((await Database.getAssistantByBusyFeedToken(tokens[0]))?.id).toBe(a.id);
  });

  it('keeps tokens of different assistants apart', async () => {
    const a = await owner('iso-a');
    const b = await owner('iso-b');
    const [ta, tb] = await Promise.all([ensureBusyFeedToken(a), ensureBusyFeedToken(b)]);
    expect(ta).not.toBe(tb);
    expect((await Database.getAssistantByBusyFeedToken(ta))?.id).toBe(a.id);
    expect((await Database.getAssistantByBusyFeedToken(tb))?.id).toBe(b.id);
  });

  it('throws for an assistant that does not exist', async () => {
    const ghost = { ...(await owner('ghost')), id: 'ast_does_not_exist' };
    await expect(ensureBusyFeedToken(ghost)).rejects.toThrow();
    await expect(resetBusyFeedToken(ghost)).rejects.toThrow();
  });
});

// --- route ----------------------------------------------------------------------------------------------------------

const ctx = (token: string) => ({ params: Promise.resolve({ token }) });
const ip = () => `10.12.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
const req = (token: string, init: { method?: string; ip?: string } = {}) =>
  new NextRequest(`http://localhost/api/calendar/${token}/feed.ics`, { method: init.method ?? 'GET', headers: { 'x-forwarded-for': init.ip ?? ip() } });

function dayOffset(days: number): string {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

describe('GET /api/calendar/[token]/feed.ics', () => {
  it('answers an unknown token and a short token with the same empty 404', async () => {
    const unknown = await GET(req('A'.repeat(32)), ctx('A'.repeat(32)));
    const short = await GET(req('short'), ctx('short'));
    const empty = await GET(req('x'), ctx(''));
    for (const res of [unknown, short, empty]) {
      expect(res.status).toBe(404);
      expect(await res.text()).toBe('');
      expect(res.headers.get('content-type')).toBeNull();
      expect(res.headers.get('access-control-allow-origin')).toBeNull();
    }
    expect([...unknown.headers.entries()].sort()).toEqual([...short.headers.entries()].sort());
  });

  it('serves the busy feed for a valid token with the right headers and no guest data', async () => {
    const a = await owner('route');
    const token = await ensureBusyFeedToken(a);
    await Database.createAppointment({
      assistantId: a.id,
      name: SECRET.name,
      email: SECRET.email,
      phone: SECRET.phone,
      date: dayOffset(3),
      timeSlot: '10:00 AM',
      durationMinutes: 30,
      status: 'confirmed',
      notes: SECRET.notes,
      serviceName: SECRET.service,
      price: SECRET.price,
    } as any);

    const res = await GET(req(token), ctx(token));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/calendar; charset=utf-8');
    expect(res.headers.get('cache-control')).toBe('private, max-age=300');
    expect(res.headers.get('content-disposition')).toBe('inline; filename="crescelo-busy.ics"');
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
    const body = await res.text();
    expect(body.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(events(body)).toHaveLength(1);
    expect(body).toContain('SUMMARY:Busy');
    for (const [key, value] of Object.entries(SECRET)) expect(body, key).not.toContain(String(value));
    expect(body).not.toContain(token);
    expect(body).not.toContain(a.id); // the assistant id is internal too
  });

  it('shows only this assistant\'s own bookings', async () => {
    const a = await owner('route-own-a');
    const b = await owner('route-own-b');
    const token = await ensureBusyFeedToken(a);
    const common = { name: 'N', email: 'n@example.com', date: dayOffset(4), durationMinutes: 30, status: 'confirmed' } as any;
    await Database.createAppointment({ ...common, assistantId: a.id, timeSlot: '9:00 AM' });
    await Database.createAppointment({ ...common, assistantId: b.id, timeSlot: '11:00 AM' });
    const text = await (await GET(req(token), ctx(token))).text();
    expect(events(text)).toHaveLength(1);
    // 9:00 AM is the only event; verify through the same call the route must make
    const spy = vi.spyOn(Database, 'getAppointments');
    await GET(req(token), ctx(token));
    expect(spy).toHaveBeenCalledWith(a.id, undefined, { ownOnly: true });
  });

  it('uses the assistant timezone for the event times', async () => {
    const a = await owner('route-tz');
    await Database.updateAssistant(a.id, { timezone: 'Europe/Stockholm' } as any);
    const token = await ensureBusyFeedToken(a);
    const date = '2099-07-15';
    await Database.createAppointment({ assistantId: a.id, name: 'N', email: 'n@example.com', date, timeSlot: '10:00 AM', durationMinutes: 30, status: 'confirmed' } as any);
    const text = await (await GET(req(token), ctx(token))).text();
    expect(text).toContain('DTSTART:20990715T080000Z');
  });

  it('a reset link stops working at once and the new one works', async () => {
    const a = await owner('route-reset');
    const old = await ensureBusyFeedToken(a);
    expect((await GET(req(old), ctx(old))).status).toBe(200);
    const fresh = await resetBusyFeedToken(a);
    const oldRes = await GET(req(old), ctx(old));
    expect(oldRes.status).toBe(404);
    expect(await oldRes.text()).toBe('');
    expect((await GET(req(fresh), ctx(fresh))).status).toBe(200);
  });

  it('HEAD answers like GET without a body', async () => {
    const a = await owner('route-head');
    const token = await ensureBusyFeedToken(a);
    const res = await HEAD(req(token, { method: 'HEAD' }), ctx(token));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/calendar; charset=utf-8');
    expect(await res.text()).toBe('');
    const missing = await HEAD(req('B'.repeat(32), { method: 'HEAD' }), ctx('B'.repeat(32)));
    expect(missing.status).toBe(404);
  });

  it('is rate limited per client address, before any lookup', async () => {
    const lookup = vi.spyOn(Database, 'getAssistantByBusyFeedToken');
    const who = ip();
    let limited: Response | null = null;
    for (let i = 0; i < 200 && !limited; i++) {
      const res = await GET(req('C'.repeat(32), { ip: who }), ctx('C'.repeat(32)));
      if (res.status === 429) limited = res;
    }
    expect(limited).not.toBeNull();
    expect(limited!.headers.get('retry-after')).toBeTruthy();
    const callsAtLimit = lookup.mock.calls.length;
    await GET(req('C'.repeat(32), { ip: who }), ctx('C'.repeat(32)));
    expect(lookup.mock.calls.length).toBe(callsAtLimit);
    // another client is not affected
    expect((await GET(req('C'.repeat(32), { ip: ip() }), ctx('C'.repeat(32)))).status).toBe(404);
  });

  it('answers 503 with Retry-After 60 and no detail when the lookup fails', async () => {
    vi.spyOn(Database, 'getAssistantByBusyFeedToken').mockRejectedValue(new Error('connect ECONNREFUSED db.internal:5432 secret-detail'));
    const res = await GET(req('D'.repeat(32)), ctx('D'.repeat(32)));
    expect(res.status).toBe(503);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(await res.text()).toBe('');
    expect(res.headers.get('content-type')).toBeNull();
  });

  it('answers 503 with Retry-After 60 and no detail when the bookings cannot be read', async () => {
    const a = await owner('route-503');
    const token = await ensureBusyFeedToken(a);
    vi.spyOn(Database, 'getAppointments').mockRejectedValue(new Error('db down secret-detail'));
    const res = await GET(req(token), ctx(token));
    expect(res.status).toBe(503);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(await res.text()).toBe('');
  });

  it('never writes the token or the URL to the logs', async () => {
    logged.calls.length = 0;
    const a = await owner('route-log');
    const token = await ensureBusyFeedToken(a);
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) => vi.spyOn(console, m).mockImplementation(() => undefined));
    vi.spyOn(Database, 'getAppointments').mockRejectedValue(new Error('db down'));
    await GET(req(token), ctx(token));
    await GET(req('E'.repeat(32)), ctx('E'.repeat(32)));
    for (const s of spies) expect(JSON.stringify(s.mock.calls)).not.toContain(token);
    // the failure was logged (assistant-free, detail-free) and the record holds neither the token nor the URL
    const mine = logged.calls.filter((c) => (c as { event?: string }).event === 'calendar.busy_feed_unavailable');
    expect(mine.length).toBeGreaterThan(0);
    expect(JSON.stringify(logged.calls)).not.toContain(token);
    expect(JSON.stringify(logged.calls)).not.toContain('/feed.ics');
    expect(JSON.stringify(logged.calls)).not.toContain('db down');
  });
});

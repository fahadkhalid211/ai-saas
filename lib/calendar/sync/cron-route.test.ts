import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const sync = vi.hoisted(() => ({ syncDueCalendars: vi.fn() }));
vi.mock('./sync-link', () => ({ syncDueCalendars: (...a: unknown[]) => sync.syncDueCalendars(...a) }));

import * as logger from '@/lib/logging/logger';

const SECRET = 'cron-secret-'.padEnd(32, 'z');
const URL_ = 'http://localhost/api/cron/calendar-sync';

beforeEach(() => {
  vi.stubEnv('CRON_SECRET', SECRET);
  sync.syncDueCalendars.mockReset();
  sync.syncDueCalendars.mockResolvedValue({ checked: 4, failed: 1, skipped: 2, clashChecksSkipped: 3 });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('/api/cron/calendar-sync', () => {
  it('is dynamic and answers GET and POST', async () => {
    const mod = await import('../../../app/api/cron/calendar-sync/route');
    expect(mod.dynamic).toBe('force-dynamic');
    expect(typeof mod.GET).toBe('function');
    expect(typeof mod.POST).toBe('function');
    // A run can take about a minute (reads, clash checks); the sibling cron routes declare the same ceiling.
    expect(mod.maxDuration).toBe(300);
  });

  it('answers 401 without the secret and does no work', async () => {
    const { GET, POST } = await import('../../../app/api/cron/calendar-sync/route');
    expect((await GET(new Request(URL_) as any)).status).toBe(401);
    expect((await POST(new Request(URL_, { method: 'POST' }) as any)).status).toBe(401);
    expect((await GET(new Request(URL_, { headers: { authorization: 'Bearer wrong' } }) as any)).status).toBe(401);
    // the secret in the address is not accepted: it would end up in access logs
    expect((await GET(new Request(`${URL_}?secret=${SECRET}`) as any)).status).toBe(401);
    expect(sync.syncDueCalendars).not.toHaveBeenCalled();
  });

  it('answers 200 with the counts for the bearer secret and for x-cron-secret, on GET and POST', async () => {
    const events = vi.spyOn(logger, 'logEvent');
    const { GET, POST } = await import('../../../app/api/cron/calendar-sync/route');

    const a = await GET(new Request(URL_, { headers: { authorization: `Bearer ${SECRET}` } }) as any);
    expect(a.status).toBe(200);
    expect(await a.json()).toEqual({ success: true, checked: 4, failed: 1, skipped: 2, clashChecksSkipped: 3 });

    const b = await POST(new Request(URL_, { method: 'POST', headers: { 'x-cron-secret': SECRET } }) as any);
    expect(b.status).toBe(200);
    expect(await b.json()).toEqual({ success: true, checked: 4, failed: 1, skipped: 2, clashChecksSkipped: 3 });

    expect(sync.syncDueCalendars).toHaveBeenCalledTimes(2);
    const cron = events.mock.calls.map((c) => c[0]).filter((e) => e.category === 'cron' && e.event === 'cron.calendar_sync_run');
    expect(cron).toHaveLength(2);
    expect(cron[0].meta).toEqual({ checked: 4, failed: 1, skipped: 2, clashChecksSkipped: 3 });
  });

  it('answers 500 with a generic message when the run itself fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sync.syncDueCalendars.mockRejectedValue(new Error('db down at secret.example.com'));
    const { GET } = await import('../../../app/api/cron/calendar-sync/route');
    const res = await GET(new Request(URL_, { headers: { authorization: `Bearer ${SECRET}` } }) as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(JSON.stringify(body)).not.toContain('secret.example.com');
  });
});

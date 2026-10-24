import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const logged = vi.hoisted(() => ({ calls: [] as unknown[] }));
vi.mock('../logging/logger', () => ({ logEvent: (input: unknown) => void logged.calls.push(input) }));

import { proxy } from '../../proxy';

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());

const TOKEN = 'proxyFeedTok_' + 'q8Wm2ZxC5vLr9TnB';

describe('proxy and the private busy-feed address', () => {
  it('lets the public feed path through without a session or a locale redirect', () => {
    const res = proxy(new NextRequest(`http://localhost:3000/api/calendar/${TOKEN}/feed.ics`, { headers: { host: 'localhost:3000', 'x-forwarded-for': '203.0.113.50' } }));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('access-control-allow-origin')).toBeNull(); // not a widget endpoint: no CORS
  });

  it('keeps the token out of the log when it rate-limits the path', () => {
    const headers = { host: 'localhost:3000', 'x-forwarded-for': '203.0.113.77' };
    let limited = false;
    for (let i = 0; i < 400 && !limited; i++) {
      limited = proxy(new NextRequest(`http://localhost:3000/api/calendar/${TOKEN}/feed.ics`, { headers })).status === 429;
    }
    expect(limited).toBe(true);
    const events = logged.calls.filter((c) => (c as { event?: string }).event === 'security.rate_limited');
    expect(events.length).toBeGreaterThan(0);
    expect(JSON.stringify(logged.calls)).not.toContain(TOKEN);
    expect(JSON.stringify(events[0])).toContain('/api/calendar/[token]/feed.ics');
  });

  it.each([
    ['with no segment after the token', `/api/calendar/${TOKEN}`, '203.0.113.78'],
    ['after a doubled slash', `/api/calendar//${TOKEN}/feed.ics`, '203.0.113.79'],
  ])('keeps the token out of the log %s', (_name, path, ip) => {
    logged.calls.length = 0;
    const headers = { host: 'localhost:3000', 'x-forwarded-for': ip };
    let limited = false;
    for (let i = 0; i < 400 && !limited; i++) limited = proxy(new NextRequest(`http://localhost:3000${path}`, { headers })).status === 429;
    expect(limited).toBe(true);
    expect(logged.calls.length).toBeGreaterThan(0);
    expect(JSON.stringify(logged.calls)).not.toContain(TOKEN);
    expect(JSON.stringify(logged.calls)).toContain('/api/calendar/[token]');
  });
});

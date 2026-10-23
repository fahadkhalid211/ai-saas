import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/security/ssrf', () => ({ validateSafeExternalUrl: vi.fn() }));

import { validateSafeExternalUrl } from '@/lib/security/ssrf';
import { fetchCalendarFeed, normaliseCalendarUrl } from './fetch-feed';

const ICS = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n';
const SECRET = 'tok_super_secret_123';

const validate = vi.mocked(validateSafeExternalUrl);
const fetchMock = vi.fn();

function ok() {
  validate.mockImplementation(async (u: string) => ({ safe: true, url: u }));
}

beforeEach(() => {
  validate.mockReset();
  fetchMock.mockReset();
  ok();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('normaliseCalendarUrl', () => {
  it('rewrites webcal:// to https:// (Apple and Google hand out webcal links)', () => {
    expect(normaliseCalendarUrl('webcal://x/y.ics')).toBe('https://x/y.ics');
  });

  it('rewrites case-insensitively and trims whitespace', () => {
    expect(normaliseCalendarUrl('  WebCal://x/y.ics \n')).toBe('https://x/y.ics');
  });

  it('leaves an https link untouched', () => {
    expect(normaliseCalendarUrl('https://x/y.ics')).toBe('https://x/y.ics');
  });
});

describe('fetchCalendarFeed', () => {
  it('accepts a webcal:// link: validates and requests the https:// form', async () => {
    fetchMock.mockResolvedValueOnce(new Response(ICS, { status: 200 }));
    const r = await fetchCalendarFeed('webcal://cal.example.com/a.ics');
    expect(r).toEqual({ status: 'ok', text: ICS, etag: undefined, lastModified: undefined });
    expect(validate).toHaveBeenCalledWith('https://cal.example.com/a.ics', { requireHttps: true });
    expect(fetchMock.mock.calls[0][0]).toBe('https://cal.example.com/a.ics');
    expect(fetchMock.mock.calls[0][1].redirect).toBe('manual');
  });

  it('returns etag and last-modified from the response', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(ICS, { status: 200, headers: { ETag: '"abc"', 'Last-Modified': 'Wed, 21 Oct 2026 07:28:00 GMT' } }),
    );
    const r = await fetchCalendarFeed('https://cal.example.com/a.ics');
    expect(r).toMatchObject({ status: 'ok', etag: '"abc"', lastModified: 'Wed, 21 Oct 2026 07:28:00 GMT' });
  });

  it('sends If-None-Match and If-Modified-Since from prev', async () => {
    fetchMock.mockResolvedValueOnce(new Response(ICS, { status: 200 }));
    await fetchCalendarFeed('https://cal.example.com/a.ics', { etag: '"abc"', lastModified: 'Wed, 21 Oct 2026 07:28:00 GMT' });
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers['If-None-Match']).toBe('"abc"');
    expect(headers['If-Modified-Since']).toBe('Wed, 21 Oct 2026 07:28:00 GMT');
  });

  it('returns not_modified on 304', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 304 }));
    expect(await fetchCalendarFeed('https://cal.example.com/a.ics', { etag: '"abc"' })).toEqual({ status: 'not_modified' });
  });

  it('refuses a plain http link even outside production, without fetching', async () => {
    const r = await fetchCalendarFeed('http://cal.example.com/a.ics');
    expect(r.status).toBe('error');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error when the SSRF guard rejects the address, without fetching, and does not echo the link', async () => {
    validate.mockResolvedValueOnce({ safe: false, error: 'private' });
    const r = await fetchCalendarFeed(`https://10.0.0.5/a.ics?token=${SECRET}`);
    expect(r.status).toBe('error');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.stringify(r)).not.toContain(SECRET);
  });

  it('follows a redirect and re-validates the new hop', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { Location: 'https://cdn.example.com/b.ics' } }))
      .mockResolvedValueOnce(new Response(ICS, { status: 200 }));
    const r = await fetchCalendarFeed('https://cal.example.com/a.ics');
    expect(r.status).toBe('ok');
    expect(validate).toHaveBeenCalledTimes(2);
    expect(validate).toHaveBeenLastCalledWith('https://cdn.example.com/b.ics', { requireHttps: true });
  });

  it('resolves a relative redirect against the current hop', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { Location: '/moved.ics' } }))
      .mockResolvedValueOnce(new Response(ICS, { status: 200 }));
    await fetchCalendarFeed('https://cal.example.com/a.ics');
    expect(fetchMock.mock.calls[1][0]).toBe('https://cal.example.com/moved.ics');
  });

  it('returns error when a redirect points at a rejected host, and never requests it', async () => {
    validate.mockImplementation(async (u: string) =>
      u.includes('169.254.169.254') ? { safe: false, error: 'metadata' } : { safe: true, url: u },
    );
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 302, headers: { Location: 'https://169.254.169.254/latest' } }));
    const r = await fetchCalendarFeed('https://cal.example.com/a.ics');
    expect(r.status).toBe('error');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns error when a redirect downgrades to http', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 302, headers: { Location: 'http://cal.example.com/b.ics' } }));
    const r = await fetchCalendarFeed('https://cal.example.com/a.ics');
    expect(r.status).toBe('error');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('allows exactly 3 redirects and errors on the 4th', async () => {
    const redirect = (n: number) => new Response(null, { status: 302, headers: { Location: `https://cal.example.com/r${n}` } });
    fetchMock
      .mockResolvedValueOnce(redirect(1))
      .mockResolvedValueOnce(redirect(2))
      .mockResolvedValueOnce(redirect(3))
      .mockResolvedValueOnce(new Response(ICS, { status: 200 }));
    expect((await fetchCalendarFeed('https://cal.example.com/a.ics')).status).toBe('ok');

    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce(redirect(1))
      .mockResolvedValueOnce(redirect(2))
      .mockResolvedValueOnce(redirect(3))
      .mockResolvedValueOnce(redirect(4));
    expect((await fetchCalendarFeed('https://cal.example.com/a.ics')).status).toBe('error');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('returns error when a redirect has no Location', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 302 }));
    expect((await fetchCalendarFeed('https://cal.example.com/a.ics')).status).toBe('error');
  });

  it('returns error for an HTML body', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html><body>Sign in</body></html>', { status: 200 }));
    const r = await fetchCalendarFeed('https://cal.example.com/a.ics');
    expect(r.status).toBe('error');
  });

  it('returns error for a non-2xx status without leaking the link', async () => {
    fetchMock.mockResolvedValueOnce(new Response('nope', { status: 404 }));
    const r = await fetchCalendarFeed(`https://cal.example.com/a.ics?token=${SECRET}`);
    expect(r.status).toBe('error');
    expect(JSON.stringify(r)).not.toContain(SECRET);
  });

  it('returns error for a body over 2 MB (no content-length)', async () => {
    const big = 'BEGIN:VCALENDAR\r\n' + 'X'.repeat(2 * 1024 * 1024 + 10);
    fetchMock.mockResolvedValueOnce(new Response(big, { status: 200 }));
    const r = await fetchCalendarFeed('https://cal.example.com/a.ics');
    expect(r.status).toBe('error');
  });

  it('stops reading a streamed body once it passes 2 MB', async () => {
    let pulls = 0;
    const chunk = new Uint8Array(512 * 1024).fill(65);
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls++;
        if (pulls > 100) return controller.close();
        controller.enqueue(chunk);
      },
    });
    fetchMock.mockResolvedValueOnce(new Response(stream, { status: 200 }));
    const r = await fetchCalendarFeed('https://cal.example.com/a.ics');
    expect(r.status).toBe('error');
    expect(pulls).toBeLessThan(10);
  });

  it('rejects early when content-length already exceeds 2 MB', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(ICS, { status: 200, headers: { 'Content-Length': String(3 * 1024 * 1024) } }),
    );
    expect((await fetchCalendarFeed('https://cal.example.com/a.ics')).status).toBe('error');
  });

  it('accepts a body just under 2 MB', async () => {
    const body = 'BEGIN:VCALENDAR\r\n' + 'X'.repeat(2 * 1024 * 1024 - 100);
    fetchMock.mockResolvedValueOnce(new Response(body, { status: 200 }));
    expect((await fetchCalendarFeed('https://cal.example.com/a.ics')).status).toBe('ok');
  });

  it('returns error on timeout (8 s) when the server never answers', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_u: string, init: { signal: AbortSignal }) =>
        new Promise((_res, rej) => {
          init.signal.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')));
        }),
    );
    const p = fetchCalendarFeed('https://cal.example.com/a.ics');
    await vi.advanceTimersByTimeAsync(8000);
    const r = await p;
    expect(r.status).toBe('error');
    if (r.status === 'error') expect(r.error).toMatch(/too long|time/i);
  });

  it('returns error when fetch throws, naming the host but not the secret', async () => {
    fetchMock.mockRejectedValueOnce(new Error(`connect ECONNREFUSED https://cal.example.com/a.ics?token=${SECRET}`));
    const r = await fetchCalendarFeed(`https://cal.example.com/a.ics?token=${SECRET}`);
    expect(r.status).toBe('error');
    expect(JSON.stringify(r)).not.toContain(SECRET);
  });

  it('returns error for an unparseable link', async () => {
    expect((await fetchCalendarFeed('not a url')).status).toBe('error');
  });
});

import { validateSafeExternalUrl } from '@/lib/security/ssrf';

const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;

export type FetchFeedResult =
  | { status: 'ok'; text: string; etag?: string; lastModified?: string }
  | { status: 'not_modified' }
  | { status: 'error'; error: string };

/** Trims the link and rewrites webcal:// (what Apple and Google hand out) to https://. */
export function normaliseCalendarUrl(raw: string): string {
  return raw.trim().replace(/^webcal:\/\//i, 'https://');
}

class FeedError extends Error {}

/** Reads the body, stopping as soon as it passes the size limit rather than trusting content-length. */
async function readLimitedText(res: Response, host: string): Promise<string> {
  const declared = Number(res.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new FeedError(`The calendar from ${host} is too large to read.`);
  }
  if (!res.body) return '';

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => {});
      throw new FeedError(`The calendar from ${host} is too large to read.`);
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder('utf-8').decode(all);
}

/**
 * Downloads an iCalendar feed. https only and public addresses only (every redirect hop is re-checked),
 * 8 s overall, 2 MB, at most 3 redirects. Never puts the link (which may hold a secret token) in an error.
 */
export async function fetchCalendarFeed(
  url: string,
  prev?: { etag?: string; lastModified?: string },
): Promise<FetchFeedResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let host = 'the calendar server';

  try {
    let current = normaliseCalendarUrl(url);

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      let parsed: URL;
      try {
        parsed = new URL(current);
      } catch {
        throw new FeedError('That does not look like a valid calendar link.');
      }
      host = parsed.hostname;
      if (parsed.protocol !== 'https:') {
        throw new FeedError(`The calendar link on ${host} must start with https:// (or webcal://).`);
      }

      const verdict = await validateSafeExternalUrl(current, { requireHttps: true });
      if (!verdict.safe) {
        throw new FeedError(`The calendar address ${host} is not allowed (it must be a public https address).`);
      }

      const headers: Record<string, string> = {
        Accept: 'text/calendar, text/plain;q=0.9, */*;q=0.1',
        'User-Agent': 'CresceloCalendarSync/1.0',
      };
      if (prev?.etag) headers['If-None-Match'] = prev.etag;
      if (prev?.lastModified) headers['If-Modified-Since'] = prev.lastModified;

      const res = await fetch(current, { redirect: 'manual', headers, signal: controller.signal });

      if (res.status === 304) return { status: 'not_modified' };

      if (res.status >= 300 && res.status < 400) {
        await res.body?.cancel().catch(() => {});
        const location = res.headers.get('location');
        if (!location) throw new FeedError(`${host} redirected without saying where.`);
        try {
          current = new URL(location, current).toString();
        } catch {
          throw new FeedError(`${host} redirected to an invalid address.`);
        }
        continue;
      }

      if (!res.ok) {
        await res.body?.cancel().catch(() => {});
        throw new FeedError(`${host} answered with HTTP ${res.status}. Check that the calendar link is still shared.`);
      }

      const text = await readLimitedText(res, host);
      if (!text.includes('BEGIN:VCALENDAR')) {
        throw new FeedError(`${host} did not return a calendar. Use the secret iCal (.ics) address, not the page address.`);
      }
      return {
        status: 'ok',
        text,
        etag: res.headers.get('etag') ?? undefined,
        lastModified: res.headers.get('last-modified') ?? undefined,
      };
    }

    throw new FeedError(`${host} redirected too many times.`);
  } catch (err) {
    if (err instanceof FeedError) return { status: 'error', error: err.message };
    if (controller.signal.aborted) {
      return { status: 'error', error: `${host} took too long to answer (over ${TIMEOUT_MS / 1000} seconds).` };
    }
    return { status: 'error', error: `Could not reach ${host}.` };
  } finally {
    clearTimeout(timer);
  }
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap, { dynamic } from '../../app/sitemap';
import { ARTICLES_PER_DAY, FIRST_RELEASE } from './schedule';

afterEach(() => vi.useRealTimers());

const articlesAt = (iso: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
  return sitemap().filter((e) => e.url.includes('/blog/')).length;
};

describe('the sitemap and the daily article release', () => {
  it('is built for every request, so a cached copy can never freeze the release', () => {
    expect(dynamic).toBe('force-dynamic');
  });

  it('holds no article before the first release day, then ARTICLES_PER_DAY more each day', () => {
    const start = new Date(FIRST_RELEASE).getTime();
    const at = (days: number, hours = 12) => new Date(start + days * 86_400_000 + hours * 3_600_000).toISOString();
    expect(articlesAt(new Date(start - 3_600_000).toISOString())).toBe(0);
    expect(articlesAt(at(0))).toBe(ARTICLES_PER_DAY);
    expect(articlesAt(at(1))).toBe(ARTICLES_PER_DAY * 2);
    expect(articlesAt(at(2))).toBe(ARTICLES_PER_DAY * 3);
    expect(articlesAt(at(9))).toBe(ARTICLES_PER_DAY * 10);
  });

  it('never loses an article from one day to the next', () => {
    const start = new Date(FIRST_RELEASE).getTime();
    const urlsAt = (days: number) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(start + days * 86_400_000 + 3_600_000));
      return new Set(sitemap().map((e) => e.url));
    };
    let before = urlsAt(0);
    for (let d = 1; d < 12; d++) {
      const now = urlsAt(d);
      for (const u of before) expect(now.has(u), `${u} on day ${d}`).toBe(true);
      before = now;
    }
  });
});

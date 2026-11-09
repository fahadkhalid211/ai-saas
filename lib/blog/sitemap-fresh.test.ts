import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap, { dynamic } from '../../app/sitemap';
import { ARTICLES_PER_DAY, FIRST_RELEASE } from './schedule';
import { translatedSlugs } from './translations';

afterEach(() => vi.useRealTimers());

const articlesAt = (iso: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
  return sitemap().filter((e) => e.url.includes('/blog/') && !e.url.includes('/blog/topic/') && !/\/(sv|fi|it|es)\//.test(e.url)).length; // the English articles, which are released daily
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

  it('submits the Spanish pages and the translated Spanish articles from the first day, with every language as an alternate', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(new Date(FIRST_RELEASE).getTime() - 3_600_000)); // before any English article is released
    const urls = sitemap();
    const es = urls.filter((e) => e.url.includes('/es'));
    expect(es.some((e) => e.url === 'https://www.crescelo.com/es')).toBe(true);
    expect(es.some((e) => e.url === 'https://www.crescelo.com/es/pricing')).toBe(true);
    const spanishArticles = es.filter((e) => e.url.includes('/es/blog/'));
    expect(spanishArticles.map((e) => e.url.split('/es/blog/')[1]).sort()).toEqual(translatedSlugs('es').sort());
    // the target article, with its alternates complete (the page itself lists all five)
    const target = urls.find((e) => e.url === 'https://www.crescelo.com/es/blog/conversational-lead-capture');
    expect(Object.keys((target?.alternates?.languages as Record<string, string>) || {}).sort()).toEqual(['en', 'es', 'fi', 'it', 'sv', 'x-default']);
    // Swedish, Finnish and Italian are not submitted yet
    expect(urls.some((e) => /crescelo\.com\/(sv|fi|it)(\/|$)/.test(e.url))).toBe(false);
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

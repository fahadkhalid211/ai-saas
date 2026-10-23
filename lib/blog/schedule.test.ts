import { describe, expect, it } from 'vitest';
import { ARTICLES_PER_DAY, FIRST_RELEASE, lastReleaseDate, releaseDate, releasedSlugs } from './schedule';
import { isIndexable } from './indexing';
import { NOT_CRAWLED_SLUGS } from './not-indexed';
import { PUBLISHED_INDEX } from './index';

const day = (n: number) => new Date(new Date(FIRST_RELEASE).getTime() + n * 86_400_000);

describe('article release schedule', () => {
  it('submits no article before the first release day', () => {
    expect(releasedSlugs(new Date(new Date(FIRST_RELEASE).getTime() - 1))).toEqual([]);
  });

  it('releases a fixed number each day, cumulatively and in a stable order', () => {
    const d0 = releasedSlugs(day(0));
    const d1 = releasedSlugs(day(1));
    expect(d0).toHaveLength(ARTICLES_PER_DAY);
    expect(d1).toHaveLength(ARTICLES_PER_DAY * 2);
    expect(d1.slice(0, ARTICLES_PER_DAY)).toEqual(d0);
    expect(releasedSlugs(new Date(day(1).getTime() + 3_600_000))).toEqual(d1); // later the same day: no change
  });

  it('never releases a held-back article, and eventually releases all the others', () => {
    const all = releasedSlugs(day(10_000));
    expect(all.every(isIndexable)).toBe(true);
    expect(all).toHaveLength(PUBLISHED_INDEX.filter((p) => isIndexable(p.slug)).length);
  });

  it('submits the articles Google has not crawled before the ones it already has', () => {
    const order = releasedSlugs(day(10_000));
    const firstKnown = order.findIndex((s) => !NOT_CRAWLED_SLUGS.has(s));
    expect(order.slice(0, firstKnown).every((s) => NOT_CRAWLED_SLUGS.has(s))).toBe(true);
    expect(order.slice(firstKnown).some((s) => NOT_CRAWLED_SLUGS.has(s))).toBe(false);
  });

  it('only ever holds back articles Google has not crawled', () => {
    for (const p of PUBLISHED_INDEX) if (!isIndexable(p.slug)) expect(NOT_CRAWLED_SLUGS.has(p.slug), p.slug).toBe(true);
    expect(isIndexable('how-to-grow-a-salon-in-new-york-with-ai')).toBe(false);
    expect(isIndexable('how-to-grow-a-dental-practice-in-london-with-ai')).toBe(true); // matches the pattern but Google already has it
  });

  it('lists only articles that exist', () => {
    const slugs = new Set(PUBLISHED_INDEX.map((p) => p.slug));
    for (const s of NOT_CRAWLED_SLUGS) expect(slugs.has(s), s).toBe(true);
  });

  it('agrees with releaseDate', () => {
    const first = releasedSlugs(day(0))[0];
    expect(releaseDate(first)?.getTime()).toBe(day(0).getTime());
    expect(releaseDate('how-to-grow-a-med-spa-in-miami-with-ai')).toBeNull();
    expect(releaseDate('how-to-grow-a-dental-practice-in-london-with-ai')).not.toBeNull();
    expect(lastReleaseDate()!.getTime()).toBeGreaterThan(day(0).getTime());
  });
});

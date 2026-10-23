import { PUBLISHED_INDEX } from './index';
import { isIndexable } from './indexing';
import { NOT_CRAWLED_SLUGS } from './not-indexed';

/**
 * When each article is submitted to search engines (put in the sitemap).
 *
 * All 275 articles appeared on one day, and Google read very few of them. So the sitemap starts with the core pages only and gains
 * a few articles every day. The articles Google has not crawled yet come first (in the order of the article index, product topics
 * first), then the ones it already has. Nothing is hidden or removed: every article stays live, and an article Google already has
 * stays in its index whether or not it is in the sitemap. Only the sitemap is paced.
 *
 * To go faster or slower change ARTICLES_PER_DAY; to start later change FIRST_RELEASE.
 */
export const FIRST_RELEASE = '2026-10-24';
export const ARTICLES_PER_DAY = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Slugs in release order: indexable articles only (the held-back ones in lib/blog/indexing.ts are never submitted). */
const submittable = PUBLISHED_INDEX.filter((p) => isIndexable(p.slug)).map((p) => p.slug);
const ORDER: string[] = [...submittable.filter((s) => NOT_CRAWLED_SLUGS.has(s)), ...submittable.filter((s) => !NOT_CRAWLED_SLUGS.has(s))];

/** The day (UTC midnight) an article joins the sitemap, or null if it is never submitted. */
export function releaseDate(slug: string): Date | null {
  const i = ORDER.indexOf(slug);
  if (i < 0) return null;
  return new Date(new Date(FIRST_RELEASE).getTime() + Math.floor(i / ARTICLES_PER_DAY) * DAY_MS);
}

/** The articles that may be in the sitemap at this moment. */
export function releasedSlugs(now: Date = new Date()): string[] {
  const start = new Date(FIRST_RELEASE).getTime();
  if (now.getTime() < start) return [];
  const days = Math.floor((now.getTime() - start) / DAY_MS) + 1;
  return ORDER.slice(0, days * ARTICLES_PER_DAY);
}

/** The day the last article joins the sitemap. */
export function lastReleaseDate(): Date | null {
  return ORDER.length ? releaseDate(ORDER[ORDER.length - 1]) : null;
}

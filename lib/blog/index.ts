import meta from './meta.json';
import type { BlogCard } from './card';

/**
 * The article index: titles, dates and topics, without the text. Generated from the articles by `npm run blog:meta`
 * (a test fails when it is out of date). Use this for anything that lists or looks up articles; only the article page itself
 * needs lib/blog/posts.ts, which carries the text.
 */
export const BLOG_INDEX: BlogCard[] = meta as BlogCard[];

/** Articles that are written for readers and are listed in search: everything except the unrewritten placeholders. */
export const PUBLISHED_INDEX: BlogCard[] = BLOG_INDEX.filter((p) => !p.thin);

const slugs = new Set(BLOG_INDEX.map((p) => p.slug));
const bySlug = new Map(BLOG_INDEX.map((p) => [p.slug, p]));

export const hasPost = (slug: string): boolean => slugs.has(slug);
export const getCard = (slug: string): BlogCard | undefined => bySlug.get(slug);

/** Newest first. */
export function sortedCards(): BlogCard[] {
  return [...PUBLISHED_INDEX].sort((a, b) => {
    const d = b.datePublished.localeCompare(a.datePublished);
    return d !== 0 ? d : a.title.localeCompare(b.title);
  });
}

export interface ClusterSummary {
  id: number;
  name: string;
  count: number;
}

/** The topic clusters with their article counts. */
export function getClusterSummaries(): ClusterSummary[] {
  const map = new Map<number, { name: string; count: number }>();
  PUBLISHED_INDEX.forEach((p) => {
    if (p.clusterId && p.clusterName) {
      const cur = map.get(p.clusterId) || { name: p.clusterName, count: 0 };
      cur.count += 1;
      map.set(p.clusterId, cur);
    }
  });
  return Array.from(map.entries())
    .map(([id, info]) => ({ id, name: info.name, count: info.count }))
    .sort((a, b) => a.id - b.id);
}

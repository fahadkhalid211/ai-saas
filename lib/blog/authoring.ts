import allGeneratedPosts from './data/all-posts.json';
import type { BlogBlock, BlogPost } from './posts';
import { slugify, wordCount } from './blocks';

/** Date the rewritten articles were published. */
export const REWRITE_DATE = '2026-09-26';

export const p = (text: string): BlogBlock => ({ type: 'p', text });
export const h2 = (text: string): BlogBlock => ({ type: 'h2', text, id: slugify(text) });
export const h3 = (text: string): BlogBlock => ({ type: 'h3', text });
export const faq = (...items: [string, string][]): BlogBlock => ({ type: 'faq', items: items.map(([q, a]) => ({ q, a })) });
export const ul = (...items: string[]): BlogBlock => ({ type: 'ul', items });
export const ol = (...items: string[]): BlogBlock => ({ type: 'ol', items });
export const note = (text: string): BlogBlock => ({ type: 'note', text });
export const table = (headers: string[], ...rows: string[][]): BlogBlock => ({ type: 'table', headers, rows });

type Meta = Pick<BlogPost, 'slug' | 'title' | 'description' | 'body'> & Partial<Pick<BlogPost, 'tags' | 'related' | 'funnel' | 'primaryKeyword' | 'secondaryKeywords' | 'readMinutes' | 'clusterId' | 'clusterName'>>;

const generated = new Map((allGeneratedPosts as unknown as BlogPost[]).map((g) => [g.slug, g]));

/** A rewritten article. Cluster, tags, related links and keywords carry over from the placeholder it replaces unless given. */
export function article(m: Meta): BlogPost {
  const old = generated.get(m.slug);
  const words = wordCount(m.body);
  return {
    slug: m.slug,
    title: m.title,
    description: m.description,
    excerpt: m.description,
    datePublished: REWRITE_DATE,
    dateModified: REWRITE_DATE,
    readMinutes: m.readMinutes ?? Math.max(3, Math.round(words / 220)),
    tags: m.tags ?? old?.tags ?? [],
    clusterId: m.clusterId ?? old?.clusterId,
    clusterName: m.clusterName ?? old?.clusterName,
    funnel: m.funnel ?? old?.funnel,
    primaryKeyword: m.primaryKeyword ?? old?.primaryKeyword,
    secondaryKeywords: m.secondaryKeywords ?? old?.secondaryKeywords,
    related: m.related ?? old?.related ?? [],
    body: m.body,
  };
}

/** The date the in-depth versions of the highest-value articles were published. */
export const PILLAR_DATE = '2026-09-27';

/** A long, in-depth article for a competitive search. Keeps the original publish date and shows the update date. */
export function pillar(m: Meta): BlogPost {
  const base = article(m);
  const old = generated.get(m.slug);
  return { ...base, datePublished: old?.datePublished ?? '2026-09-25', dateModified: PILLAR_DATE };
}

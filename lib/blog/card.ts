import type { BlogPost } from './posts';

/**
 * Everything about an article except its text: what lists, feeds, the sitemap, share images and the view counter need.
 * Keeping the text out is the point. The text of all 275 articles is about 4.5 MB of code; a page that only lists articles
 * must not load it, and must not send it to the browser (the blog index used to be 3.9 MB because of that).
 */
export interface BlogCard {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  excerpt: string;
  datePublished: string;
  dateModified: string;
  readMinutes: number;
  tags: string[];
  clusterId?: number;
  clusterName?: string;
  funnel?: 'TOFU' | 'MOFU' | 'BOFU';
  primaryKeyword?: string;
  /** A placeholder article: reachable by its address, but not listed, not in the feed and not in the sitemap. */
  thin?: boolean;
}

export function toCard(p: BlogPost): BlogCard {
  const card: BlogCard = {
    slug: p.slug,
    title: p.title,
    description: p.description,
    excerpt: p.excerpt,
    datePublished: p.datePublished,
    dateModified: p.dateModified,
    readMinutes: p.readMinutes,
    tags: p.tags,
  };
  if (p.seoTitle) card.seoTitle = p.seoTitle;
  if (p.clusterId !== undefined) card.clusterId = p.clusterId;
  if (p.clusterName) card.clusterName = p.clusterName;
  if (p.funnel) card.funnel = p.funnel;
  if (p.primaryKeyword) card.primaryKeyword = p.primaryKeyword;
  if (p.thin) card.thin = true;
  return card;
}

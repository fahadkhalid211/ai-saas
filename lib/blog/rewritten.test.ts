import { describe, expect, it } from 'vitest';
import { BLOG_POSTS, PUBLISHED_POSTS, sortedPosts } from './posts';
import { REWRITTEN_POSTS } from './rewritten';

const text = (p: (typeof BLOG_POSTS)[number]) => JSON.stringify(p.body);

describe('rewritten articles', () => {
  it('replace an existing address and are published', () => {
    const slugs = new Set(BLOG_POSTS.map((p) => p.slug));
    for (const r of REWRITTEN_POSTS) {
      expect(slugs.has(r.slug), r.slug).toBe(true);
      expect(PUBLISHED_POSTS.some((p) => p.slug === r.slug), r.slug).toBe(true);
    }
  });

  it('do not use the placeholder template', () => {
    for (const r of REWRITTEN_POSTS) {
      expect(text(r), r.slug).not.toContain('Why Traditional Approaches to');
      expect(text(r), r.slug).not.toContain('The Operational Framework');
    }
  });

  it('have their own headings, enough text and working internal blog links', () => {
    const slugs = new Set(BLOG_POSTS.map((p) => p.slug));
    for (const r of REWRITTEN_POSTS) {
      expect(r.body.filter((b) => b.type === 'h2').length, r.slug).toBeGreaterThanOrEqual(4);
      for (const m of text(r).matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) expect(slugs.has(m[1]), `${r.slug} -> ${m[1]}`).toBe(true);
    }
  });

  it('are long enough to be useful', () => {
    const short = REWRITTEN_POSTS.filter((r) => text(r).length <= 1700).map((r) => `${r.slug} (${text(r).length})`);
    expect(short).toEqual([]);
  });

  it('keep the unrewritten placeholders out of the hub, feed and sitemap list', () => {
    const thin = BLOG_POSTS.filter((p) => p.thin);
    const listed = new Set(sortedPosts().map((p) => p.slug));
    for (const t of thin) expect(listed.has(t.slug), t.slug).toBe(false);
  });
});

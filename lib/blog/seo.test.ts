import { describe, it, expect } from 'vitest';
import { BLOG_POSTS } from './posts';
import { seoDescription, seoTitle } from './seo';

describe('blog search-result polish', () => {
  it('has 200+ posts to check', () => {
    expect(BLOG_POSTS.length).toBeGreaterThanOrEqual(200);
  });

  it('every title fits a search result and is unique', () => {
    const seen = new Set<string>();
    for (const p of BLOG_POSTS) {
      expect(p.seoTitle!.length, `${p.slug}: ${p.seoTitle}`).toBeLessThanOrEqual(64);
      expect(p.seoTitle!.length, p.slug).toBeGreaterThanOrEqual(20);
      expect(seen.has(p.seoTitle!), `duplicate title ${p.seoTitle}`).toBe(false);
      seen.add(p.seoTitle!);
    }
  });

  it('descriptions and excerpts fit and never end in an ellipsis', () => {
    for (const p of BLOG_POSTS) {
      expect(p.description.length, p.slug).toBeLessThanOrEqual(160);
      expect(p.description, p.slug).not.toMatch(/\.\.\.$|…$/);
      expect(p.excerpt, p.slug).toBe(p.description);
    }
  });

  it('every post cites at least one outside source', () => {
    for (const p of BLOG_POSTS) {
      expect(JSON.stringify(p.body), p.slug).toMatch(/\]\(https:\/\//);
    }
  });

  it('shortens sensibly', () => {
    expect(seoTitle({ title: 'Rule-Based Chatbots vs. AI Website Assistants: Key Architectural Differences' })).toBe('Rule-Based Chatbots vs. AI Website Assistants | Crescelo');
    expect(seoDescription('x'.repeat(200))).toMatch(/\.$/);
  });
});

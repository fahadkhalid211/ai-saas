import { describe, it, expect } from 'vitest';
import { blogPostingSchema, blogSchema, breadcrumbSchema, organizationSchema, siteNavigationSchema, websiteSchema } from './schema';
import { sortedPosts } from './blog/posts';

describe('structured data', () => {
  it('names the site and organisation for search results', () => {
    const w = websiteSchema() as any;
    expect(w.name).toBe('Crescelo');
    expect(w.alternateName).toContain('Crescelo AI');
    const o = organizationSchema() as any;
    expect(o.logo.width).toBeGreaterThanOrEqual(112);
    expect(JSON.stringify(o)).not.toMatch(/Pakistan|"PK"|@crescelo\.com/);
  });

  it('lists the main sections as navigation elements', () => {
    const g = (siteNavigationSchema() as any)['@graph'];
    expect(g.map((n: any) => n.name)).toEqual(expect.arrayContaining(['Product', 'Pricing', 'Blog', 'Contact']));
    for (const n of g) expect(n.url).toMatch(/^https:\/\//);
  });

  it('every blog post has a complete article record', () => {
    for (const post of sortedPosts()) {
      const a = blogPostingSchema(post) as any;
      expect(a.headline.length, post.slug).toBeLessThanOrEqual(110);
      expect(a.image.url, post.slug).toContain(`/blog/${post.slug}/opengraph-image`);
      expect(a.datePublished, post.slug).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(a.wordCount, post.slug).toBeGreaterThan(150);
      expect(a.publisher['@id']).toContain('#organization');
    }
    expect((blogSchema(sortedPosts()) as any)['@type']).toBe('Blog');
  });

  it('breadcrumbs start at Home exactly once', () => {
    const b = breadcrumbSchema([{ name: 'Blog', path: '/blog' }, { name: 'Post', path: '/blog/x' }]) as any;
    expect(b.itemListElement.map((i: any) => i.name)).toEqual(['Home', 'Blog', 'Post']);
  });
});

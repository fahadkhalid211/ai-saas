import { describe, expect, it } from 'vitest';
import { BLOG_POSTS, PUBLISHED_POSTS, getPost } from './posts';
import { generateMetadata } from '../../app/(marketing)/blog/[slug]/page';

describe('verify noindex status for all articles', () => {
  it('has zero thin articles', () => {
    const thinArticles = BLOG_POSTS.filter((p) => p.thin);
    expect(thinArticles.length).toBe(0);
    expect(BLOG_POSTS.length).toBe(212);
    expect(PUBLISHED_POSTS.length).toBe(212);
  });

  for (const post of BLOG_POSTS) {
    it(`${post.slug} has explicit index: true and is NOT noindex`, async () => {
      expect(post.thin).toBeFalsy();
      const meta = await generateMetadata({ params: Promise.resolve({ slug: post.slug }) });
      expect(meta.robots).toBeDefined();
      if (typeof meta.robots === 'object' && meta.robots !== null) {
        expect(meta.robots.index).toBe(true);
        expect(meta.robots.follow).toBe(true);
      }
    });
  }
});

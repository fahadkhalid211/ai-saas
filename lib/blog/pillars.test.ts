import { describe, expect, it } from 'vitest';
import { BLOG_POSTS } from './posts';
import { faqItems, wordCount } from './blocks';
import { PILLAR_DATE } from './authoring';

/** The articles written in depth for competitive searches. Grows as each batch is added. */
const PILLARS = BLOG_POSTS.filter((p) => p.dateModified === PILLAR_DATE).map((p) => p.slug);

describe('in-depth articles', () => {
  it('there are at least 30', () => {
    expect(PILLARS.length).toBeGreaterThanOrEqual(30);
  });

  for (const slug of PILLARS) {
    it(`${slug} is long, structured and has an FAQ`, () => {
      const post = BLOG_POSTS.find((p) => p.slug === slug)!;
      expect(post, slug).toBeTruthy();
      expect(wordCount(post.body), slug).toBeGreaterThanOrEqual(1200);
      expect(post.body.filter((b) => b.type === 'h2').length).toBeGreaterThanOrEqual(8);
      expect(faqItems(post.body).length).toBeGreaterThanOrEqual(5);
      expect(post.body.some((b) => b.type === 'table')).toBe(true);
      expect(post.dateModified >= post.datePublished).toBe(true);
      const text = JSON.stringify(post.body);
      expect(text.match(/\]\(\/(?:product|pricing|playground|login)/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
      expect(text.match(/\]\(\/blog\//g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    });
  }

  it('descriptions fit a search result', () => {
    for (const slug of PILLARS) {
      const post = BLOG_POSTS.find((p) => p.slug === slug)!;
      expect(post.description.length, slug).toBeGreaterThanOrEqual(110);
      expect(post.description.length, slug).toBeLessThanOrEqual(165);
    }
  });
});

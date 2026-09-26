import { describe, expect, it } from 'vitest';
import { fromMarkup, toMarkup, validateMarkup } from './markup';
import { BLOG_POSTS } from './posts';
import { wordCount } from './blocks';

describe('article markup', () => {
  it('turns every article into text and back without losing a block', () => {
    for (const post of BLOG_POSTS.slice(0, 60)) {
      const round = fromMarkup(toMarkup(post.body));
      expect(round.length, post.slug).toBe(post.body.length);
      expect(wordCount(round), post.slug).toBe(wordCount(post.body));
    }
  });

  it('reads headings, lists, notes, tables and FAQ pairs', () => {
    const blocks = fromMarkup('## One\n\nText with [a link](/pricing)\n\n- a\n- b\n\n1. x\n2. y\n\n> note\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n### Sub\n\nQ: Why?\nA: Because.\n\nQ: How?\nA: Like this.');
    expect(blocks.map((b) => b.type)).toEqual(['h2', 'p', 'ul', 'ol', 'note', 'table', 'h3', 'faq']);
    const faq = blocks[7];
    expect(faq.type === 'faq' && faq.items).toHaveLength(2);
  });

  it('refuses text that would publish a broken page', () => {
    expect(validateMarkup('## A\n\nx\n\n## B\n\ny\n\nz\n\nw').length).toBe(0);
    expect(validateMarkup('just a line').length).toBeGreaterThan(0);
    expect(validateMarkup('## A\n\nx\n\n## B\n\n[bad](javascript:alert(1))\n\nz\n\nw').join(' ')).toContain('must start with');
    expect(validateMarkup('## A\n\nx\n\n## B\n\n<script>x</script>\n\nz\n\nw').join(' ')).toContain('HTML');
  });
});

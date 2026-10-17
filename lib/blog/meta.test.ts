import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BLOG_POSTS, getClusters, sortedPosts } from './posts';
import { toCard } from './card';
import { PUBLISHED_INDEX, getClusterSummaries, sortedCards } from './index';

const FILE = path.join(__dirname, 'meta.json');
const expected = BLOG_POSTS.map(toCard);

// `npm run blog:meta` runs this file with BLOG_META_WRITE=1 to regenerate lib/blog/meta.json.
if (process.env.BLOG_META_WRITE) {
  fs.writeFileSync(FILE, JSON.stringify(expected) + '\n');
}

describe('blog index (lib/blog/meta.json)', () => {
  it('matches the articles, so lists never show something that has changed (run npm run blog:meta to refresh it)', () => {
    const actual = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    expect(actual).toEqual(JSON.parse(JSON.stringify(expected)));
  });

  it('lists the same articles, in the same order, as the full article module', () => {
    expect(sortedCards().map((p) => p.slug)).toEqual(sortedPosts().map((p) => p.slug));
    expect(PUBLISHED_INDEX.length).toBe(sortedPosts().length);
  });

  it('has the same topic clusters', () => {
    expect(getClusterSummaries()).toEqual(getClusters());
  });

  it('carries no article text', () => {
    expect(fs.readFileSync(FILE, 'utf8')).not.toContain('"body"');
    expect(fs.statSync(FILE).size).toBeLessThan(400 * 1024);
  });
});

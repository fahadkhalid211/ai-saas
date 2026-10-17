/**
 * Regenerates lib/blog/meta.json (the article index without the article text). Run after adding or editing an article:
 *   npm run blog:meta
 * The file is produced by the blog test, which loads the articles the same way the site does.
 */
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['vitest', 'run', 'lib/blog/meta.test.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, BLOG_META_WRITE: '1' },
});
process.exit(r.status ?? 1);

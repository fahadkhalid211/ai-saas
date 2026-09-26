import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { BLOG_POSTS } from '@/lib/blog/posts';
import { wordCount } from '@/lib/blog/blocks';
import { listOverrides, viewTotals } from '@/lib/blog/store';
import { withOverride } from '@/lib/blog/resolve';

export const dynamic = 'force-dynamic';

/** Platform owner only: every article with its length, whether it has been edited, and its views. */
async function GETHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const [overrides, views] = await Promise.all([listOverrides(), viewTotals()]);
  const edited = new Map(overrides.map((o) => [o.slug, o]));
  const zero = { total: 0, last7: 0, last30: 0, today: 0 };
  const posts = BLOG_POSTS.map((base) => {
    const o = edited.get(base.slug);
    const p = withOverride(base, o);
    return {
      slug: p.slug,
      title: p.title,
      cluster: p.clusterName || '',
      words: wordCount(p.body),
      published: !p.thin,
      datePublished: p.datePublished,
      dateModified: p.dateModified,
      edited: Boolean(o),
      views: views[p.slug] ?? zero,
    };
  });
  const sum = (k: keyof typeof zero) => posts.reduce((n, p) => n + p.views[k], 0);
  return NextResponse.json({ posts, totals: { total: sum('total'), last30: sum('last30'), last7: sum('last7'), today: sum('today') } }, { headers: { 'Cache-Control': 'no-store' } });
}

export const GET = logged(GETHandler, { route: '/api/master/blog', sample: 0.1 });

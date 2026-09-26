import { NextResponse } from 'next/server';
import { logged } from '@/lib/logging/route';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { getPost } from '@/lib/blog/posts';
import { recordView } from '@/lib/blog/store';

export const dynamic = 'force-dynamic';

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|lighthouse|headless|python-requests|curl\/|wget/i;

/** Counts one read of a blog article. The page sends this once per visitor session; crawlers and unknown addresses are ignored. */
async function POSTHandler(req: Request) {
  if (BOT.test(req.headers.get('user-agent') || '')) return new NextResponse(null, { status: 204 });
  const limited = await enforceDistributedRateLimit(req, 'blog-view', { windowMs: 60 * 60 * 1000, max: 200 });
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === 'string' ? body.slug.slice(0, 120) : '';
  if (!slug || !getPost(slug)) return new NextResponse(null, { status: 204 });
  try {
    await recordView(slug);
  } catch (err) {
    console.warn('[Blog] view not recorded:', (err as Error)?.message);
  }
  return new NextResponse(null, { status: 204 });
}

export const POST = logged(POSTHandler, { route: '/api/blog/view', sample: 0.02 });

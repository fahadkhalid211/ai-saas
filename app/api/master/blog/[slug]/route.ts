import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { getPost, getRawPost } from '@/lib/blog/posts';
import { wordCount } from '@/lib/blog/blocks';
import { fromMarkup, toMarkup, validateMarkup } from '@/lib/blog/markup';
import { deleteOverride, getOverride, saveOverride, viewSeries } from '@/lib/blog/store';
import { getMasterEmail } from '@/lib/security/master';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ slug: string }> };

const refresh = (slug: string) => {
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
};

/** The article as the editor shows it: the saved edit if there is one, otherwise the version in the code. */
async function GETHandler(req: Request, { params }: Ctx) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const { slug } = await params;
  const base = getPost(slug);
  const raw = getRawPost(slug);
  if (!base || !raw) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  const o = await getOverride(slug);
  return NextResponse.json(
    {
      slug,
      title: o?.title ?? raw.title,
      description: o?.description ?? raw.description,
      bodyMarkup: o?.bodyMarkup ?? toMarkup(raw.body),
      edited: Boolean(o),
      updatedAt: o?.updatedAt ?? null,
      words: wordCount(o ? fromMarkup(o.bodyMarkup) : raw.body),
      series: await viewSeries(slug, 30),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

async function PUTHandler(req: Request, { params }: Ctx) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const { slug } = await params;
  if (!getPost(slug)) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const bodyMarkup = typeof body?.bodyMarkup === 'string' ? body.bodyMarkup : '';
  const problems: string[] = [];
  if (title.length < 10 || title.length > 120) problems.push('The title must be 10 to 120 characters.');
  if (description.length < 50 || description.length > 320) problems.push('The description must be 50 to 320 characters (search results show about 155).');
  if (bodyMarkup.length > 200_000) problems.push('The article is too long.');
  problems.push(...validateMarkup(bodyMarkup));
  if (problems.length) return NextResponse.json({ error: problems[0], problems }, { status: 400 });
  const saved = await saveOverride({ slug, title, description, bodyMarkup, updatedBy: getMasterEmail() });
  refresh(slug);
  return NextResponse.json({ success: true, updatedAt: saved.updatedAt, words: wordCount(fromMarkup(bodyMarkup)) });
}

/** Puts the article back to the version in the code. */
async function DELETEHandler(req: Request, { params }: Ctx) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const { slug } = await params;
  await deleteOverride(slug);
  refresh(slug);
  return NextResponse.json({ success: true });
}

export const GET = logged(GETHandler, { route: '/api/master/blog/[slug]', sample: 0.1 });
export const PUT = logged(PUTHandler, { route: '/api/master/blog/[slug]' });
export const DELETE = logged(DELETEHandler, { route: '/api/master/blog/[slug]' });

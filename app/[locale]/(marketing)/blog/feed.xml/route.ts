import { SITE } from '@/components/marketing/content';
import { sortedCards } from '@/lib/blog';

export const dynamic = 'force-static';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** RSS feed of the blog (/blog/feed.xml). */
export function GET() {
  const posts = sortedCards();
  const items = posts
    .map(
      (p) => `<item><title>${esc(p.title)}</title><link>${SITE.url}/blog/${p.slug}</link><guid isPermaLink="true">${SITE.url}/blog/${p.slug}</guid><pubDate>${new Date(p.datePublished).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`
    )
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Crescelo Blog</title><link>${SITE.url}/blog</link><description>Practical guides for service businesses on AI chatbots, online booking, costs and privacy.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });
}

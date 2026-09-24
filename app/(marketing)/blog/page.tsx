import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { SectionHead } from '@/components/marketing/ui';
import { SITE } from '@/components/marketing/content';
import { sortedPosts } from '@/lib/blog/posts';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';

const description = 'Practical guides for service businesses on AI chatbots, online booking, bring-your-own-key AI costs and website chatbot privacy.';

export const metadata: Metadata = withSocial(
  {
    title: 'Blog: AI Chatbots, Booking & Privacy for Service Businesses | Crescelo',
    description,
    alternates: { canonical: '/blog', types: { 'application/rss+xml': `${SITE.url}/blog/feed.xml` } },
  },
  '/blog'
);

export default function BlogIndexPage() {
  const posts = sortedPosts();
  return (
    <>
      <JsonLd data={[webPageSchema('Crescelo Blog', description, '/blog', 'CollectionPage'), breadcrumbSchema([{ name: 'Blog', path: '/blog' }])]} />
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
            <SectionHead as="h1" id="blog-title" eyebrow="BLOG" title="Practical guides for service businesses" intro="Straight answers on AI assistants, online booking, costs and privacy. No hype, no invented numbers." align="center" />
            <div style={{ display: 'grid', gap: '1.25rem', marginTop: '2.5rem' }}>
              {posts.map((p) => (
                <article key={p.slug} className="mk-card" style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--mk-muted)' }}>
                    {p.tags.join(' · ').toUpperCase()} · {p.readMinutes} MIN READ
                  </p>
                  <h2 style={{ fontSize: '1.5rem', margin: '0.4rem 0' }}>
                    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  </h2>
                  <p style={{ color: 'var(--mk-muted)', lineHeight: 1.6 }}>{p.excerpt}</p>
                  <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    <time dateTime={p.datePublished}>{new Date(p.datePublished).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                    {' · '}
                    <Link href={`/blog/${p.slug}`} style={{ textDecoration: 'underline', fontWeight: 600 }}>
                      Read the article
                    </Link>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

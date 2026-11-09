import { localizeMetaEnglishOnly } from '@/lib/i18n/metadata';
import { T } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { SectionHead } from '@/components/marketing/ui';
import { BLOG_TOPICS, cardsInTopic, topicBySlug } from '@/lib/blog/topics';
import { isIndexable } from '@/lib/blog/indexing';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const t = topicBySlug(topic);
  if (!t) return {};
  const path = `/blog/topic/${t.slug}`;
  const description = t.intro.length <= 160 ? t.intro : t.intro.slice(0, 157).replace(/\s+\S*$/, '') + '.';
  const meta = withSocial({ title: `${t.name} Guides | Crescelo`, description, alternates: { canonical: path } }, path);
  const localized = await localizeMetaEnglishOnly(meta, { path });
  // Topics that are not about the product stay out of search results (the page still works for anyone who follows a link).
  return t.offTopic ? { ...localized, robots: { index: false, follow: true } } : localized;
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = topicBySlug(topic);
  if (!t) notFound();
  const cards = cardsInTopic(t);
  const others = BLOG_TOPICS.filter((o) => o.id !== t.id && !o.offTopic);
  const path = `/blog/topic/${t.slug}`;

  return (
    <>
      <JsonLd
        data={[
          webPageSchema(`${t.name}: guides`, t.intro, path, 'CollectionPage'),
          breadcrumbSchema([{ name: 'Knowledge Hub', path: '/blog' }, { name: t.name, path }]),
          itemListSchema(cards, 50),
        ]}
      />
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '60rem' }}>
            <nav aria-label="Breadcrumb" style={{ fontSize: '0.86rem', marginBottom: '1rem', color: 'var(--mk-muted)' }}>
              <Link href="/blog" style={{ color: 'inherit', textDecoration: 'underline' }}><T>Knowledge Hub</T></Link> / <span>{t.name}</span>
            </nav>
            <SectionHead as="h1" id="topic-title" eyebrow="TOPIC" title={`${t.name}: guides for service businesses`} intro={t.intro} align="left" />
            <p style={{ color: 'var(--mk-muted)', margin: '0.5rem 0 1.5rem' }}>
              {cards.length} {cards.length === 1 ? 'article' : 'articles'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
              {cards.map((c) => (
                <li key={c.slug} className="mk-card" style={{ padding: '1.1rem 1.4rem' }}>
                  <Link href={`/blog/${c.slug}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--mk-ink)' }}>{c.title}</Link>
                  <p style={{ margin: '0.4rem 0 0', color: 'var(--mk-muted)' }}>{c.excerpt}</p>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--mk-muted)' }}>
                    {c.readMinutes} min read{!isIndexable(c.slug) ? ' · not listed in search' : ''}
                  </p>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: '2.5rem', color: 'var(--mk-muted)' }}>
              <T>More topics:</T>{' '}
              {others.map((o, i) => (
                <span key={o.id}>
                  {i > 0 ? ' · ' : ''}
                  <Link href={`/blog/topic/${o.slug}`} style={{ textDecoration: 'underline' }}>{o.name}</Link>
                </span>
              ))}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

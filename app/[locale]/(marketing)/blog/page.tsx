import { localizeMeta } from '@/lib/i18n/metadata';
import { T } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import type { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { SectionHead } from '@/components/marketing/ui';
import { SITE } from '@/components/marketing/content';
import { sortedCards, getClusterSummaries } from '@/lib/blog';
import type { BlogCard } from '@/lib/blog/card';
import { blogSchema, breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';
import { getLocale, getT } from '@/lib/i18n/server';
import { postsForHub } from '@/lib/blog/translations';
import { BlogGlossaryHub, type HubCard } from '@/components/marketing/BlogGlossaryHub';

const description =
  'Guides for service businesses on AI website assistants, online booking, lead capture and knowledge bases, with a glossary of the terms.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial(
  {
    title: 'Knowledge Hub: AI Assistants, Booking & Leads | Crescelo',
    description,
    alternates: { canonical: '/blog', types: { 'application/rss+xml': `${SITE.url}/blog/feed.xml` } },
  },
  '/blog'
));
}

/** Every article grouped by topic, as plain links. The hub above pages through articles in the browser, so without this
 *  only the first page of posts has a link a crawler can follow. */
function groupByTopic(posts: BlogCard[]) {
  const groups = new Map<string, typeof posts>();
  for (const p of posts) {
    const key = p.clusterName || 'More guides';
    groups.set(key, [...(groups.get(key) || []), p]);
  }
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}

export default async function BlogIndexPage() {
  const locale = await getLocale();
  const t = await getT();
  const { posts, translated } = await postsForHub(sortedCards(), locale);
  const clusters = getClusterSummaries();
  const topics = groupByTopic(posts);
  // The excerpt is the description (see polish() in lib/blog/posts.ts), so the browser gets it once.
  const hubCards: HubCard[] = posts.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, datePublished: p.datePublished, readMinutes: p.readMinutes, tags: p.tags, clusterId: p.clusterId, clusterName: p.clusterName, primaryKeyword: p.primaryKeyword }));

  return (
    <>
      <JsonLd
        data={[
          webPageSchema('Crescelo Knowledge Hub & Glossary', description, '/blog', 'CollectionPage'),
          breadcrumbSchema([{ name: 'Blog', path: '/blog' }]),
          blogSchema(posts),
          itemListSchema(posts),
        ]}
      />
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '72rem' }}>
            <SectionHead
              as="h1"
              id="blog-title"
              eyebrow="KNOWLEDGE HUB & GLOSSARY"
              title="Practical guides for service businesses"
              intro="Practical guides on AI website assistants, online booking, lead capture, costs and security, written for owners of appointment-based businesses."
              align="center"
            />
            <BlogGlossaryHub posts={hubCards} clusters={clusters} translated={translated} />

            <nav aria-labelledby="all-articles" style={{ marginTop: '4rem' }}>
              <h2 id="all-articles" className="mk-h3" style={{ marginBottom: '1.5rem' }}>
                {t('All {count} articles by topic', { count: posts.length })}
              </h2>
              {topics.map(([topic, list]) => (
                <section key={topic} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                    <T>{topic}</T> <span style={{ fontWeight: 400, color: 'var(--mk-muted)' }}>(<T>{list.length}</T>)</span>
                  </h3>
                  <ul style={{ columns: '18rem', columnGap: '2rem', margin: 0, paddingLeft: '1.1rem', lineHeight: 1.7 }}>
                    {list.map((p) => (
                      <li key={p.slug} style={{ breakInside: 'avoid', listStyle: 'disc' }}>
                        <Link href={`/blog/${p.slug}`} locale={translated.includes(p.slug) ? undefined : 'en'} style={{ textDecoration: 'underline' }}><T>{p.title}</T></Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

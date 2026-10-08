import type { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { SectionHead } from '@/components/marketing/ui';
import { SITE } from '@/components/marketing/content';
import { sortedPosts, getClusters } from '@/lib/blog/posts';
import { blogSchema, breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';
import { BlogGlossaryHub } from '@/components/marketing/BlogGlossaryHub';

const description =
  'Guides for service businesses on AI website assistants, online booking, lead capture and knowledge bases, with a glossary of the terms.';

export const metadata: Metadata = withSocial(
  {
    title: 'Knowledge Hub: AI Assistants, Booking & Leads | Crescelo',
    description,
    alternates: { canonical: '/blog', types: { 'application/rss+xml': `${SITE.url}/blog/feed.xml` } },
  },
  '/blog'
);

/** Every article grouped by topic, as plain links. The hub above pages through articles in the browser, so without this
 *  only the first page of posts has a link a crawler can follow. */
function groupByTopic(posts: ReturnType<typeof sortedPosts>) {
  const groups = new Map<string, typeof posts>();
  for (const p of posts) {
    const key = p.clusterName || 'More guides';
    groups.set(key, [...(groups.get(key) || []), p]);
  }
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}

export default function BlogIndexPage() {
  const posts = sortedPosts();
  const clusters = getClusters();
  const topics = groupByTopic(posts);

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
            <BlogGlossaryHub posts={posts} clusters={clusters} />

            <nav aria-labelledby="all-articles" style={{ marginTop: '4rem' }}>
              <h2 id="all-articles" className="mk-h3" style={{ marginBottom: '1.5rem' }}>
                All {posts.length} articles by topic
              </h2>
              {topics.map(([topic, list]) => (
                <section key={topic} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                    {topic} <span style={{ fontWeight: 400, color: 'var(--mk-muted)' }}>({list.length})</span>
                  </h3>
                  <ul style={{ columns: '18rem', columnGap: '2rem', margin: 0, paddingLeft: '1.1rem', lineHeight: 1.7 }}>
                    {list.map((p) => (
                      <li key={p.slug} style={{ breakInside: 'avoid', listStyle: 'disc' }}>
                        <a href={`/blog/${p.slug}`} style={{ textDecoration: 'underline' }}>{p.title}</a>
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

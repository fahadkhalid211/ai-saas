import type { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { SectionHead } from '@/components/marketing/ui';
import { SITE } from '@/components/marketing/content';
import { sortedPosts, getClusters } from '@/lib/blog/posts';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';
import { BlogGlossaryHub } from '@/components/marketing/BlogGlossaryHub';

const description =
  'The definitive knowledge hub and glossary for appointment-based service businesses. Comprehensive guides on AI website assistants, in-chat scheduling, lead capture, and RAG architecture.';

export const metadata: Metadata = withSocial(
  {
    title: 'Knowledge Hub & Glossary: AI Assistants, Booking & Service CRO | Crescelo',
    description,
    alternates: { canonical: '/blog', types: { 'application/rss+xml': `${SITE.url}/blog/feed.xml` } },
  },
  '/blog'
);

export default function BlogIndexPage() {
  const posts = sortedPosts();
  const clusters = getClusters();

  return (
    <>
      <JsonLd
        data={[
          webPageSchema('Crescelo Knowledge Hub & Glossary', description, '/blog', 'CollectionPage'),
          breadcrumbSchema([{ name: 'Blog', path: '/blog' }]),
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
              intro="Browse 200+ comprehensive playbooks, architecture whitepapers, and industry blueprints. Straight answers on AI assistants, online booking, costs, and customer conversion."
              align="center"
            />
            <BlogGlossaryHub posts={posts} clusters={clusters} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

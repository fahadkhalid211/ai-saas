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

export default function BlogIndexPage() {
  const posts = sortedPosts();
  const clusters = getClusters();

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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

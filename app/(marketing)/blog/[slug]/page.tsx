import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { BlogBody } from '@/components/marketing/BlogBody';
import { ButtonLink } from '@/components/marketing/ui';
import { SITE } from '@/components/marketing/content';
import { BLOG_POSTS, getPost } from '@/lib/blog/posts';
import { breadcrumbSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const meta = withSocial({ title: `${post.title} | Crescelo`, description: post.description, alternates: { canonical: `/blog/${post.slug}` } }, `/blog/${post.slug}`);
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: 'article', publishedTime: post.datePublished, modifiedTime: post.dateModified, authors: ['Crescelo'], tags: post.tags },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE.url}/blog/${post.slug}`;
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${SITE.url}/opengraph-image`,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: 'en',
    keywords: post.tags.join(', '),
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@id': `${SITE.url}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const toc = post.body.filter((b): b is Extract<(typeof post.body)[number], { type: 'h2' }> => b.type === 'h2');
  const related = post.related.map((s) => getPost(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <JsonLd data={[article, breadcrumbSchema([{ name: 'Blog', path: '/blog' }, { name: post.title, path: `/blog/${post.slug}` }])]} />
      <Header />
      <main id="main">
        <article className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '46rem' }}>
            <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              <Link href="/blog" style={{ textDecoration: 'underline' }}>
                Blog
              </Link>{' '}
              / <span>{post.tags[0]}</span>
            </nav>
            <h1 className="mk-h2" style={{ maxWidth: 'none' }}>
              {post.title}
            </h1>
            <p style={{ color: 'var(--mk-muted)', margin: '0.75rem 0 1.5rem', fontSize: '0.9rem' }}>
              By the Crescelo team · <time dateTime={post.datePublished}>{new Date(post.datePublished).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time> · {post.readMinutes} min read
            </p>

            {toc.length > 2 && (
              <nav aria-label="In this article" className="mk-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.4rem' }}>In this article</p>
                <ol style={{ paddingLeft: '1.2rem', listStyle: 'decimal', fontSize: '0.92rem', display: 'grid', gap: '0.2rem' }}>
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} style={{ textDecoration: 'underline' }}>
                        {h.text.replace(/^\d+\.\s*/, '')}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <BlogBody blocks={post.body} />

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <ButtonLink href="/login?mode=register">Start your 14-day free trial</ButtonLink>
            </div>

            {related.length > 0 && (
              <aside aria-label="Related articles" style={{ marginTop: '3rem' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Keep reading</h2>
                <ul style={{ display: 'grid', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
                  {related.map((r) => (
                    <li key={r.slug} className="mk-card" style={{ padding: '0.9rem 1.1rem' }}>
                      <Link href={`/blog/${r.slug}`} style={{ fontWeight: 700, textDecoration: 'underline' }}>
                        {r.title}
                      </Link>
                      <p style={{ fontSize: '0.88rem', color: 'var(--mk-muted)', marginTop: '0.2rem' }}>{r.excerpt}</p>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

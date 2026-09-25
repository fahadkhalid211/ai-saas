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
  const meta = withSocial(
    {
      title: `${post.title} | Crescelo Knowledge Hub`,
      description: post.description,
      alternates: { canonical: `/blog/${post.slug}` },
    },
    `/blog/${post.slug}`
  );
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: 'article',
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: ['Crescelo Technical Editorial'],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE.url}/blog/${post.slug}`;

  // Extract FAQs if present in body
  const faqQuestions: { '@type': 'Question'; name: string; acceptedAnswer: { '@type': 'Answer'; text: string } }[] = [];
  post.body.forEach((b) => {
    if (b.type === 'p' && b.text.startsWith('**Q:')) {
      const match = b.text.match(/^\*\*Q:\s*([^*]+)\*\*\s*\n([\s\S]+)$/);
      if (match) {
        faqQuestions.push({
          '@type': 'Question',
          name: match[1].trim(),
          acceptedAnswer: {
            '@type': 'Answer',
            text: match[2].trim(),
          },
        });
      }
    }
  });

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${SITE.url}/opengraph-image`,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: 'en',
    keywords: post.tags.join(', '),
    author: {
      '@type': 'Organization',
      name: 'Crescelo Technical Editorial Team',
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE.url}/logo.png`,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog & Glossary', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  const jsonLdData: object[] = [articleSchema, breadcrumbs];
  if (faqQuestions.length > 0) {
    jsonLdData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqQuestions,
    });
  }

  const toc = post.body.filter((b): b is Extract<(typeof post.body)[number], { type: 'h2' }> => b.type === 'h2');
  const related = post.related.map((s) => getPost(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <JsonLd data={jsonLdData} />
      <Header />
      <main id="main">
        <section className="mk-section" style={{ paddingTop: '2.5rem' }}>
          <div className="mk-wrap" style={{ maxWidth: '72rem' }}>
            
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" style={{ fontSize: '0.86rem', marginBottom: '1.25rem', color: 'var(--mk-muted)' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                Home
              </Link>{' '}
              / <Link href="/blog" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Knowledge Hub
              </Link>{' '}
              {post.clusterName && (
                <>
                  / <span>{post.clusterName}</span>
                </>
              )}
            </nav>

            {/* Article Header */}
            <header style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                {post.clusterName && (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--mk-accent, #2563eb)',
                      background: 'rgba(37, 99, 235, 0.08)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    {post.clusterName}
                  </span>
                )}
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--mk-ink, #0f172a)',
                    background: 'var(--mk-surface-muted, #f1f5f9)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  ⏱️ {post.readMinutes} min read
                </span>
              </div>

              <h1 className="mk-h2" style={{ maxWidth: 'none', fontSize: '2.4rem', lineHeight: 1.25, marginBottom: '1rem', color: 'var(--mk-ink, #0f172a)' }}>
                {post.title}
              </h1>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.9rem',
                  color: 'var(--mk-muted)',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid var(--mk-border, #e2e8f0)',
                }}
              >
                <span>
                  Published by <strong>Crescelo</strong>
                </span>
                <span>·</span>
                <time dateTime={post.datePublished}>
                  {new Date(post.datePublished).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 600 }}>
                  ✓ Fact-Checked & Grounded
                </span>
              </div>
            </header>

            {/* Two-Column Responsive Layout */}
            <div className="mk-article-layout">
              {/* Main Content Column */}
              <article style={{ minWidth: 0 }}>
                {/* Mobile Table of Contents */}
                {toc.length > 2 && (
                  <div className="mk-card mk-mobile-only" style={{ padding: '1.25rem', marginBottom: '2rem', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.95rem' }}>Quick Navigation</p>
                    <ol style={{ paddingLeft: '1.2rem', listStyle: 'decimal', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {toc.map((h) => (
                        <li key={h.id}>
                          <a href={`#${h.id}`} className="mk-animated-link" style={{ textDecoration: 'none' }}>
                            {h.text.replace(/^\d+\.\s*/, '')}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <BlogBody blocks={post.body} />

                {/* Mid-Article / Post-Article Conversion Card */}
                <div
                  className="mk-card"
                  style={{
                    marginTop: '3rem',
                    padding: 'clamp(1.25rem, 4vw, 2rem)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--mk-surface-muted, #f8fafc) 0%, rgba(37, 99, 235, 0.05) 100%)',
                    border: '1px solid var(--mk-border, #cbd5e1)',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-accent, #2563eb)', marginBottom: '0.5rem' }}>
                    ANSWER EVERY VISITOR. BOOK THE ONES WHO ARE READY.
                  </p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--mk-ink)' }}>
                    Deploy Crescelo on your website in 15 minutes
                  </h3>
                  <p style={{ maxWidth: '36rem', margin: '0 auto 1.5rem', color: 'var(--mk-muted)', lineHeight: 1.6 }}>
                    Train your assistant on your price lists, documents, and service policies. Enable 24/7 grounded answers and conflict-free in-chat appointment booking.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <ButtonLink href="/login?mode=register">Start 14-Day Free Trial</ButtonLink>
                    <Link
                      href="/pricing"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '6px',
                        border: '1px solid var(--mk-border, #cbd5e1)',
                        background: 'var(--mk-surface, #ffffff)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: 'var(--mk-ink)',
                        textDecoration: 'none',
                      }}
                    >
                      View Pricing & Plans
                    </Link>
                  </div>
                </div>

                {/* Related Articles Bottom Grid */}
                {related.length > 0 && (
                  <aside aria-label="Related articles" style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--mk-border, #e2e8f0)' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--mk-ink)' }}>
                      Recommended Next Reading
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
                      {related.map((r) => (
                        <div key={r.slug} className="mk-card" style={{ padding: '1.25rem', borderRadius: '8px' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mk-accent, #2563eb)', marginBottom: '0.4rem' }}>
                            {r.clusterName || 'Guide'} · ⏱️ {r.readMinutes}m
                          </p>
                          <Link href={`/blog/${r.slug}`} className="mk-animated-link" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--mk-ink)' }}>
                            {r.title}
                          </Link>
                          <p style={{ fontSize: '0.85rem', color: 'var(--mk-muted)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                            {r.excerpt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </aside>
                )}
              </article>

              {/* Right Sticky Sidebar */}
              <aside
                aria-label="Table of contents & related guides"
                className="mk-sidebar-sticky mk-sidebar-scroll"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  paddingRight: '0.45rem',
                }}
              >
                {/* Sticky Table of Contents Card */}
                {toc.length > 0 && (
                  <div
                    style={{
                      padding: '1.25rem',
                      borderRadius: '10px',
                      background: 'var(--mk-surface)',
                      border: '1px solid var(--mk-border, #cbd5e1)',
                    }}
                  >
                    <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mk-muted)', marginBottom: '0.75rem' }}>
                      TABLE OF CONTENTS
                    </p>
                    <ol style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.4 }}>
                      {toc.map((h) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className="mk-animated-link"
                            style={{
                              color: 'var(--mk-ink, #0f172a)',
                              fontWeight: 500,
                            }}
                          >
                            {h.text.replace(/^\d+\.\s*/, '')}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Sibling Articles / Related Topics in Cluster */}
                {related.length > 0 && (
                  <div
                    style={{
                      padding: '1.25rem',
                      borderRadius: '10px',
                      background: 'var(--mk-surface)',
                      border: '1px solid var(--mk-border, #e2e8f0)',
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mk-muted)', marginBottom: '0.6rem' }}>
                      MORE IN THIS TOPIC
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {related.map((r) => (
                        <li key={r.slug} style={{ fontSize: '0.85rem', lineHeight: 1.35 }}>
                          <Link href={`/blog/${r.slug}`} className="mk-animated-link" style={{ color: 'var(--mk-ink)', fontWeight: 600 }}>
                            {r.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--mk-border, #f1f5f9)' }}>
                      <Link href="/blog" className="mk-animated-link" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--mk-accent, #2563eb)' }}>
                        Browse all 200 guides →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Mini Trial Promo */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '10px',
                    background: 'var(--mk-surface-muted, #f8fafc)',
                    border: '1px solid var(--mk-border, #e2e8f0)',
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>Stop missing bookings</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--mk-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    Crescelo installs on WordPress, Webflow, Squarespace, or plain HTML in minutes.
                  </p>
                  <Link
                    href="/login?mode=register"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: 'var(--mk-accent, #2563eb)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    Start Free Trial
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

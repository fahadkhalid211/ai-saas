import { T } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import type { Metadata } from 'next';
import Link from '@/components/i18n/Link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { BlogBody } from '@/components/marketing/BlogBody';
import { ButtonLink } from '@/components/marketing/ui';
import { SITE } from '@/components/marketing/content';
import { PUBLISHED_INDEX } from '@/lib/blog';
import { isIndexable } from '@/lib/blog/indexing';
import { blogLanguages, getPostInLocale, hasBlogTranslation, translatedSlugs } from '@/lib/blog/translated';
import { getLocale } from '@/lib/i18n/server';
import { LocaleAlternates } from '@/components/i18n/LocaleAlternates';
import { localizeHref } from '@/lib/i18n/paths';
import { localizeMeta } from '@/lib/i18n/metadata';
import { redirect } from 'next/navigation';
import { DATE_LOCALE } from '@/lib/i18n/format';
import { isLocaleCode } from '@/lib/i18n/paths';
import { faqItems } from '@/lib/blog/blocks';
import { BlogViewBeacon } from '@/components/marketing/BlogViewBeacon';
import { blogImageUrl, blogPostingSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';
import { Check, Clock } from 'lucide-react';
import { GoogleTranslateFallback } from '@/components/i18n/GoogleTranslateFallback';

/**
 * Pages are built at deploy time, refreshed straight away when the owner saves an edit (app/api/master/blog), and rebuilt in the
 * background at most once a week as a safety net. Each rebuild is a server function run, and rebuilding every article hourly
 * (about 44,000 rebuilds in one billing period) was the largest single use of server CPU.
 */
export const revalidate = 604800;
export const dynamicParams = true;

/**
 * The written (published) articles are built at deploy time. A placeholder article, if one is ever added, stays reachable and is built
 * the first time someone opens it, so it never slows a deploy. Another language has only the articles that were translated.
 */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const { locale } = params;
  if (!isLocaleCode(locale)) return PUBLISHED_INDEX.map((p) => ({ slug: p.slug }));
  // Pre-render all published articles across all supported locales so none 404
  return PUBLISHED_INDEX.map((p) => ({ slug: p.slug }));
}



export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const found = await getPostInLocale(slug, locale);
  if (!found) return {};
  const post = found.post;
  const meta = withSocial(
    {
      title: post.seoTitle || post.title,
      description: post.description,
      alternates: { canonical: `/blog/${post.slug}` },
      robots: {
        index: isIndexable(post.slug),
        follow: true,
        googleBot: {
          index: isIndexable(post.slug),
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      },
    },
    `/blog/${post.slug}`
  );
  const image = { url: blogImageUrl(post.slug), width: 1200, height: 630, alt: post.title };
  return localizeMeta({
    ...meta,
    twitter: { ...meta.twitter, title: post.seoTitle || post.title, images: [image] },
    openGraph: {
      ...meta.openGraph,
      title: post.seoTitle || post.title,
      images: [image],
      section: post.clusterName,
      type: 'article',
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: ['Crescelo'],
      tags: post.tags,
    },
  }, { languages: blogLanguages(post.slug) });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const found = await getPostInLocale(slug, locale);
  if (!found) notFound();
  const post = found.post;
  const alternates = Object.fromEntries(blogLanguages(post.slug).map((l) => [l, localizeHref(`/blog/${post.slug}`, l)]));
  // Related articles: shown in the reader's language when they exist in it, otherwise in English.
  const relatedFound = (await Promise.all(post.related.map((s) => getPostInLocale(s, locale)))).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const url = `${SITE.url}${localizeHref(`/blog/${post.slug}`, locale)}`;

  const breadcrumbs = breadcrumbSchema([
    { name: 'Blog & Glossary', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  // The FAQ answers in these articles are shared boilerplate, so they are not marked up as FAQPage (marking up identical
  // answers on hundreds of URLs would look like manipulation, and Google shows FAQ results only to a few site types anyway).
  const faq = faqItems(post.body);
  const jsonLdData: object[] = [blogPostingSchema(post), breadcrumbs, ...(faq.length >= 2 ? [faqSchema(faq)] : [])];

  const toc = post.body.filter((b): b is Extract<(typeof post.body)[number], { type: 'h2' }> => b.type === 'h2');
  const related = relatedFound.map((r) => r.post);
  const relatedHere = new Set(relatedFound.map((r) => r.post.slug));

  return (
    <>
      <JsonLd data={jsonLdData} />
      <LocaleAlternates map={alternates} />
      <BlogViewBeacon slug={post.slug} />
      <Header />
      <main id="main">
        <section className="mk-section" style={{ paddingTop: '2.5rem' }}>
          <div className="mk-wrap" style={{ maxWidth: '72rem' }}>
            
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" style={{ fontSize: '0.86rem', marginBottom: '1.25rem', color: 'var(--mk-muted)' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                <T>Home</T>
              </Link>{' '}
              / <Link href="/blog" style={{ color: 'inherit', textDecoration: 'underline' }}>
                <T>Knowledge Hub</T>
              </Link>{' '}
              {post.clusterName && (
                <>
                  / <span><T>{post.clusterName}</T></span>
                </>
              )}
            </nav>

            {locale !== 'en' && !found.translated && (
              <GoogleTranslateFallback targetLocale={locale} />
            )}

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
                      color: '#2563eb',
                      background: 'rgba(37, 99, 235, 0.08)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    <T>{post.clusterName}</T>
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
                  <Clock className="h-3.5 w-3.5 inline mr-1 text-slate-500" /> <T>{post.readMinutes}</T> <T>min read</T>
                </span>
              </div>

              <h1 className="mk-h2" style={{ maxWidth: 'none', fontSize: '2.4rem', lineHeight: 1.25, marginBottom: '1rem', color: 'var(--mk-ink, #0f172a)' }}>
                <T>{post.title}</T>
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
                  <T>Published by</T> <strong><T>Crescelo</T></strong>
                </span>
                <span>·</span>
                <time dateTime={post.datePublished}>
                  {new Date(post.datePublished).toLocaleDateString(DATE_LOCALE[locale], {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 600 }}>
                  <Check className="h-3.5 w-3.5 text-emerald-600 inline" /> <T>Fact-Checked & Grounded</T>
                </span>
              </div>
            </header>

            {/* Two-Column Responsive Layout */}
            <div className="mk-article-layout">
              {/* Main Content Column */}
              <article style={{ minWidth: 0 }}>
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
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb', marginBottom: '0.5rem' }}>
                    <T>ANSWER EVERY VISITOR. BOOK THE ONES WHO ARE READY.</T>
                  </p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--mk-ink)' }}>
                    <T>Deploy Crescelo on your website in 15 minutes</T>
                  </h3>
                  <p style={{ maxWidth: '36rem', margin: '0 auto 1.5rem', color: 'var(--mk-muted)', lineHeight: 1.6 }}>
                    <T>Train your assistant on your price lists, documents, and service policies. Enable 24/7 grounded answers and conflict-free in-chat appointment booking.</T>
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <ButtonLink href="/login?mode=register" className="mk-btn-blue"><T>Start Free Trial</T></ButtonLink>
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
                      <T>View Pricing & Plans</T>
                    </Link>
                  </div>
                </div>

                {/* Related Articles Bottom Grid */}
                {related.length > 0 && (
                  <aside aria-label="Related articles" style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--mk-border, #e2e8f0)' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--mk-ink)' }}>
                      <T>Recommended Next Reading</T>
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
                      {related.map((r) => (
                        <div key={r.slug} className="mk-card" style={{ padding: '1.25rem', borderRadius: '8px' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', marginBottom: '0.4rem' }}>
                            <T>{r.clusterName || 'Guide'}</T> · ⏱️ <T>{r.readMinutes}</T>m
                          </p>
                          <Link href={`/blog/${r.slug}`} locale={relatedHere.has(r.slug) ? undefined : 'en'} className="mk-animated-link" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--mk-ink)' }}>
                            <T>{r.title}</T>
                          </Link>
                          <p style={{ fontSize: '0.85rem', color: 'var(--mk-muted)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                            <T>{r.excerpt}</T>
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
                      <T>TABLE OF CONTENTS</T>
                    </p>
                    <ol style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.4 }}>
                      {toc.map((h) => (
                        <li key={h.id}>
                          <A
                            href={`#${h.id}`}
                            className="mk-animated-link"
                            style={{
                              color: 'var(--mk-ink, #0f172a)',
                              fontWeight: 500,
                            }}
                          >
                            {h.text.replace(/^\d+\.\s*/, '')}
                          </A>
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
                      <T>MORE IN THIS TOPIC</T>
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {related.map((r) => (
                        <li key={r.slug} style={{ fontSize: '0.85rem', lineHeight: 1.35 }}>
                          <Link href={`/blog/${r.slug}`} locale={relatedHere.has(r.slug) ? undefined : 'en'} className="mk-animated-link" style={{ color: 'var(--mk-ink)', fontWeight: 600 }}>
                            <T>{r.title}</T>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--mk-border, #f1f5f9)' }}>
                      <Link href="/blog" className="mk-animated-link" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb' }}>
                        <T>Browse all 200 guides →</T>
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
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}><T>Stop missing bookings</T></p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--mk-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    <T>Crescelo installs on WordPress, Webflow, Squarespace, or plain HTML in minutes.</T>
                  </p>
                  <Link
                    href="/login?mode=register"
                    className="mk-btn mk-btn-blue mk-btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      textDecoration: 'none',
                    }}
                  >
                    <T>Start Free Trial</T>
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

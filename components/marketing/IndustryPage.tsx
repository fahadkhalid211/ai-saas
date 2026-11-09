import { T } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF, SITE } from '@/components/marketing/content';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { INDUSTRIES, type Industry } from '@/lib/industries';
import { featureBySlug } from '@/lib/product-features';
import { getCard } from '@/lib/blog';

/**
 * One industry page. Server-rendered, so everything on it (the example chat, the checklist, the FAQ) is in the HTML a crawler reads.
 * The copy is English; other languages see the same text in their page layout and the page is not offered to them as a translation.
 */
export function IndustryPage({ industry }: { industry: Industry }) {
  const path = `/use-case/${industry.slug}`;
  const features = industry.features.map((s) => featureBySlug(s)).filter((f): f is NonNullable<ReturnType<typeof featureBySlug>> => Boolean(f));
  const articles = industry.articles.map((s) => getCard(s)).filter((c): c is NonNullable<ReturnType<typeof getCard>> => Boolean(c));
  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug);

  return (
    <>
      <JsonLd
        data={[
          webPageSchema(industry.seoTitle, industry.seoDescription, path),
          breadcrumbSchema([{ name: 'Who it is for', path: '/use-case' }, { name: industry.name, path }]),
          faqSchema(industry.faq),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${SITE.url}${path}#service`,
            name: `AI website assistant for ${industry.audience}`,
            serviceType: 'AI website assistant',
            description: industry.seoDescription,
            url: `${SITE.url}${path}`,
            provider: { '@id': `${SITE.url}/#organization` },
            audience: { '@type': 'BusinessAudience', name: industry.audience },
          },
        ]}
      />
      <Header />
      <main id="main">
        <section className="mk-hero" style={{ marginTop: '1rem' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <nav aria-label="Breadcrumb" className="mk-rise" style={{ ['--mk-delay' as string]: '0ms', fontSize: '0.86rem', marginBottom: '1rem', color: '#cfe3d6' }}>
              <Link href="/use-case" style={{ color: 'inherit', textDecoration: 'underline' }}><T>Who it is for</T></Link>
              {' / '}
              <span>{industry.name}</span>
            </nav>
            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '24ch', marginInline: 'auto', fontSize: 'clamp(2.2rem, 5.4vw, 4rem)', ['--mk-delay' as string]: '140ms' }}>
              {industry.title}
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '62ch', ['--mk-delay' as string]: '320ms' }}>
              {industry.intro}
            </p>
            <div className="mk-cta-row mk-rise" style={{ justifyContent: 'center', ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
              <ButtonLink href="/playground" variant="ghost"><T>Try the playground</T></ButtonLink>
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="ind-problem">
          <div className="mk-wrap">
            <SectionHead eyebrow="THE PROBLEM" title={`What ${industry.name.toLowerCase()} lose without a website assistant`} id="ind-problem" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))', marginTop: '2rem' }}>
              {industry.problems.map((p, i) => (
                <Reveal as="article" key={p.title} className="mk-card" delay={i * 60}>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="ind-does">
          <div className="mk-wrap">
            <SectionHead eyebrow="WHAT CRESCELO DOES" title={`How the assistant works for ${industry.audience}`} id="ind-does" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))', marginTop: '2rem' }}>
              {industry.does.map((d, i) => (
                <Reveal as="article" key={d.title} className="mk-card" delay={i * 60}>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="ind-chat">
          <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
            <SectionHead eyebrow="EXAMPLE" title="What a conversation looks like" id="ind-chat" align="center" intro="An illustration of how the assistant answers from your own content. It is not a customer result." />
            <figure style={{ margin: '2rem auto 0', maxWidth: '34rem', display: 'grid', gap: '0.6rem' }}>
              <blockquote style={{ margin: 0, justifySelf: 'end', maxWidth: '88%', padding: '0.7rem 1rem', borderRadius: '1.1rem 1.1rem 0.3rem 1.1rem', background: 'var(--mk-surface)', border: '1.5px solid var(--mk-ink)' }}>
                <p style={{ margin: 0 }}><span className="mk-sr"><T>Visitor:</T> </span>{industry.chat.visitor}</p>
              </blockquote>
              <blockquote style={{ margin: 0, justifySelf: 'start', maxWidth: '92%', padding: '0.7rem 1rem', borderRadius: '1.1rem 1.1rem 1.1rem 0.3rem', background: 'var(--mk-lime)', color: 'var(--mk-deep)', fontWeight: 600 }}>
                <p style={{ margin: 0 }}><span className="mk-sr"><T>Assistant:</T> </span>{industry.chat.assistant}</p>
              </blockquote>
              <figcaption style={{ fontSize: '0.82rem', color: 'var(--mk-muted)' }}>{industry.chat.source}</figcaption>
            </figure>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="ind-knowledge">
          <div className="mk-wrap" style={{ maxWidth: '60rem' }}>
            <SectionHead eyebrow="GET STARTED" title="What to add to its knowledge base first" id="ind-knowledge" align="center" intro="The assistant is only as good as the content it answers from. These are the documents that matter most for this kind of business." />
            <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0', display: 'grid', gap: '0.6rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}>
              {industry.knowledge.map((k) => (
                <li key={k} className="mk-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span aria-hidden="true" style={{ color: 'var(--mk-accent)', fontWeight: 800 }}>✓</span>
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="ind-limits">
          <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
            <SectionHead eyebrow="HONEST LIMITS" title="What it does not do today" id="ind-limits" align="center" />
            <div role="note" className="mk-card" style={{ marginTop: '1.5rem', background: 'var(--mk-warn-soft)', borderColor: 'var(--mk-warn)' }}>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.5rem' }}>
                {industry.limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p style={{ marginTop: '0.9rem', fontSize: '0.9rem' }}>
                <T>See the</T> <Link href="/roadmap" style={{ textDecoration: 'underline' }}><T>roadmap</T></Link> <T>for what is available now and what is planned.</T>
              </p>
            </div>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="ind-faq">
          <div className="mk-wrap" style={{ maxWidth: '52rem' }}>
            <SectionHead eyebrow="QUESTIONS" title={`Questions from ${industry.audience}`} id="ind-faq" align="center" />
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '2rem' }}>
              {industry.faq.map((f) => (
                <details key={f.q} className="mk-card" style={{ padding: '1.1rem 1.4rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{f.q}</summary>
                  <p style={{ marginTop: '0.6rem' }}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="ind-more">
          <div className="mk-wrap">
            <SectionHead eyebrow="GO DEEPER" title="Features and guides for this kind of business" id="ind-more" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))', marginTop: '2rem' }}>
              {features.map((f) => (
                <Link key={f.slug} href={`/product/${f.slug}`} className="mk-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <h3><T>{f.name}</T></h3>
                  <p><T>{f.seoDescription}</T></p>
                  <span style={{ color: 'var(--mk-accent)', fontWeight: 700 }}><T>Learn more →</T></span>
                </Link>
              ))}
              {articles.map((a) => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="mk-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mk-accent)', marginBottom: '0.4rem' }}><T>Guide</T></p>
                  <h3>{a.title}</h3>
                  <p>{a.excerpt}</p>
                </Link>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--mk-muted)' }}>
              <T>Other industries:</T>{' '}
              {others.map((o, i) => (
                <span key={o.slug}>
                  {i > 0 ? ' · ' : ''}
                  <Link href={`/use-case/${o.slug}`} style={{ textDecoration: 'underline' }}>{o.name}</Link>
                </span>
              ))}
              {' · '}
              <Link href="/use-case" style={{ textDecoration: 'underline' }}><T>All industries</T></Link>
            </p>
          </div>
        </section>

        <section className="mk-final" style={{ margin: '48px 0.75rem 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}><T>TRY IT</T></p>
            <h2 className="mk-h2 mk-h2-wide" style={{ color: 'var(--mk-bg)' }}>
              <T>See it work on your own business.</T>
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              <T>Every Growth feature free for 14 days. A card is required to start, and it is charged when the trial ends unless you cancel first.</T>
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
              <ButtonLink href="/pricing" variant="ghost"><T>See pricing</T></ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

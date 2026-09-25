import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { LOGIN_HREF, SIGNUP_HREF } from '@/components/marketing/content';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { featureBySlug, PRODUCT_FEATURES, type ProductFeature } from '@/lib/product-features';

/** One product feature page: hero with a sample chat, benefits, how it works, what you control, an honest note, FAQ and related features. */
export function FeaturePage({ feature }: { feature: ProductFeature }) {
  const path = `/product/${feature.slug}`;
  const related = feature.related.map((s) => featureBySlug(s)).filter((f): f is ProductFeature => Boolean(f));

  return (
    <>
      <JsonLd
        data={[
          webPageSchema(feature.seoTitle, feature.seoDescription, path),
          breadcrumbSchema([{ name: 'Product', path: '/product' }, { name: feature.name, path }]),
          faqSchema(feature.faq),
        ]}
      />
      <Header />
      <main id="main">
        <section className="mk-hero" style={{ marginTop: '1rem' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow">{feature.eyebrow}</p>
            <h1 className="mk-h1" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
              {feature.title}
            </h1>
            <p className="mk-lead" style={{ maxWidth: '62ch' }}>
              {feature.intro}
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}>Start free trial</ButtonLink>
              <ButtonLink href="/pricing" variant="ghost">
                See pricing
              </ButtonLink>
            </div>

            <div aria-hidden="true" style={{ margin: '2.25rem auto 0', maxWidth: '30rem', display: 'grid', gap: '0.6rem', textAlign: 'left' }}>
              <span style={{ justifySelf: 'end', maxWidth: '85%', padding: '0.65rem 0.95rem', borderRadius: '1.1rem 1.1rem 0.3rem 1.1rem', background: 'rgba(255,254,235,0.14)', color: 'var(--mk-bg)', fontSize: '0.95rem' }}>
                {feature.chat.visitor}
              </span>
              <span style={{ justifySelf: 'start', maxWidth: '88%', padding: '0.65rem 0.95rem', borderRadius: '1.1rem 1.1rem 1.1rem 0.3rem', background: 'var(--mk-lime)', color: 'var(--mk-deep)', fontWeight: 600, fontSize: '0.95rem' }}>
                {feature.chat.assistant}
              </span>
              {feature.chat.footnote ? <small style={{ color: '#cfe3d6', fontSize: '0.78rem', justifySelf: 'start' }}>{feature.chat.footnote}</small> : null}
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="feat-benefits">
          <div className="mk-wrap">
            <SectionHead eyebrow="WHAT YOU GET" title={`${feature.name}, in practice.`} id="feat-benefits" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))', marginTop: '2rem' }}>
              {feature.benefits.map((b, i) => (
                <Reveal as="article" key={b.title} className="mk-card" delay={i * 60}>
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="feat-how">
          <div className="mk-wrap" style={{ maxWidth: '60rem' }}>
            <SectionHead eyebrow="HOW IT WORKS" title="From set-up to live." id="feat-how" align="center" />
            <ol style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0', display: 'grid', gap: '1rem' }}>
              {feature.steps.map((s, i) => (
                <li key={s.title} className="mk-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span aria-hidden="true" style={{ flex: 'none', width: '2.25rem', height: '2.25rem', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--mk-lime)', color: 'var(--mk-deep)', border: '1.5px solid var(--mk-ink)', fontWeight: 800 }}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="feat-control">
          <div className="mk-wrap" style={{ maxWidth: '60rem' }}>
            <SectionHead eyebrow="YOU STAY IN CONTROL" title="What you can set." id="feat-control" align="center" />
            <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0', display: 'grid', gap: '0.6rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}>
              {feature.controls.map((c) => (
                <li key={c} className="mk-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <span aria-hidden="true" style={{ color: 'var(--mk-accent)', fontWeight: 800 }}>✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            {feature.notice ? (
              <div role="note" className="mk-card" style={{ marginTop: '1.5rem', background: 'var(--mk-warn-soft)', borderColor: 'var(--mk-warn)' }}>
                <p style={{ color: 'var(--mk-warn)', fontWeight: 600 }}>{feature.notice}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="feat-faq">
          <div className="mk-wrap" style={{ maxWidth: '52rem' }}>
            <SectionHead eyebrow="QUESTIONS" title="Good to know." id="feat-faq" align="center" />
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '2rem' }}>
              {feature.faq.map((f) => (
                <details key={f.q} className="mk-card" style={{ padding: '1.1rem 1.4rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{f.q}</summary>
                  <p style={{ marginTop: '0.6rem' }}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="feat-related">
          <div className="mk-wrap">
            <SectionHead eyebrow="KEEP EXPLORING" title="Works together with." id="feat-related" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))', marginTop: '2rem' }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/product/${r.slug}`} className="mk-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <h3>{r.name}</h3>
                  <p>{r.seoDescription}</p>
                  <span style={{ color: 'var(--mk-accent)', fontWeight: 700 }}>Learn more →</span>
                </Link>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--mk-muted)' }}>
              {feature.guides.map((g, i) => (
                <span key={g.href}>
                  {i > 0 ? ' · ' : 'Guides: '}
                  <Link href={g.href} style={{ textDecoration: 'underline' }}>
                    {g.label}
                  </Link>
                </span>
              ))}
              {' · '}
              <Link href="/product" style={{ textDecoration: 'underline' }}>
                All features
              </Link>
            </p>
          </div>
        </section>

        <section className="mk-final" style={{ margin: '48px 0.75rem 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>
              TRY IT
            </p>
            <h2 className="mk-h2 mk-h2-wide" style={{ color: 'var(--mk-bg)' }}>
              See it work on your own business.
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              Every Growth feature free for 14 days. A card is required to start, and it is charged when the trial ends unless you cancel first.
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}>Start free trial</ButtonLink>
              <ButtonLink href={LOGIN_HREF} variant="ghost">
                Log in
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export const FEATURE_SLUGS = PRODUCT_FEATURES.map((f) => f.slug);

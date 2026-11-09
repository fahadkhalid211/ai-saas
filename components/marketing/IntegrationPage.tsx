import { T } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { INTEGRATION_PAGES, type IntegrationPageData } from '@/lib/integration-pages';
import { featureBySlug } from '@/lib/product-features';

/** One integration page: what it does, how to set it up, what it needs and what it does not do. Server-rendered English copy. */
export function IntegrationPage({ integration }: { integration: IntegrationPageData }) {
  const path = `/integrations/${integration.slug}`;
  const features = integration.features.map((s) => featureBySlug(s)).filter((f): f is NonNullable<ReturnType<typeof featureBySlug>> => Boolean(f));
  const others = INTEGRATION_PAGES.filter((i) => i.slug !== integration.slug);

  return (
    <>
      <JsonLd
        data={[
          webPageSchema(integration.seoTitle, integration.seoDescription, path),
          breadcrumbSchema([{ name: 'Integrations', path: '/integrations' }, { name: integration.name, path }]),
          faqSchema(integration.faq),
          {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: `How to connect ${integration.name} to Crescelo`,
            step: integration.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.body })),
          },
        ]}
      />
      <Header />
      <main id="main">
        <section className="mk-hero" style={{ marginTop: '1rem' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <nav aria-label="Breadcrumb" className="mk-rise" style={{ ['--mk-delay' as string]: '0ms', fontSize: '0.86rem', marginBottom: '1rem', color: '#cfe3d6' }}>
              <Link href="/integrations" style={{ color: 'inherit', textDecoration: 'underline' }}><T>Integrations</T></Link>
              {' / '}
              <span>{integration.name}</span>
            </nav>
            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '24ch', marginInline: 'auto', fontSize: 'clamp(2.2rem, 5.4vw, 4rem)', ['--mk-delay' as string]: '140ms' }}>
              {integration.title}
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '62ch', ['--mk-delay' as string]: '320ms' }}>
              {integration.intro}
            </p>
            <div className="mk-cta-row mk-rise" style={{ justifyContent: 'center', ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
              <ButtonLink href="/pricing" variant="ghost"><T>See pricing</T></ButtonLink>
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="int-does">
          <div className="mk-wrap">
            <SectionHead eyebrow="WHAT YOU GET" title={`What the ${integration.name} integration does`} id="int-does" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))', marginTop: '2rem' }}>
              {integration.does.map((d, i) => (
                <Reveal as="article" key={d.title} className="mk-card" delay={i * 60}>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="int-steps">
          <div className="mk-wrap" style={{ maxWidth: '60rem' }}>
            <SectionHead eyebrow="SET-UP" title={`How to connect ${integration.name}`} id="int-steps" align="center" />
            <ol style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0', display: 'grid', gap: '1rem' }}>
              {integration.steps.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 80} className="mk-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span aria-hidden="true" style={{ flex: 'none', width: '2.25rem', height: '2.25rem', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--mk-lime)', color: 'var(--mk-deep)', border: '1.5px solid var(--mk-ink)', fontWeight: 800 }}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="int-needs">
          <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
            <SectionHead eyebrow="BEFORE YOU START" title="What you need, and what it does not do" id="int-needs" align="center" />
            <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))' }}>
              <div className="mk-card">
                <h3>Requirements</h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.5rem' }}>
                  {integration.needs.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </div>
              <div role="note" className="mk-card" style={{ background: 'var(--mk-warn-soft)', borderColor: 'var(--mk-warn)' }}>
                <h3>Limits</h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.5rem' }}>
                  {integration.limits.map((l) => <li key={l}>{l}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="int-faq">
          <div className="mk-wrap" style={{ maxWidth: '52rem' }}>
            <SectionHead eyebrow="QUESTIONS" title={`${integration.name} questions answered`} id="int-faq" align="center" />
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '2rem' }}>
              {integration.faq.map((f) => (
                <details key={f.q} className="mk-card" style={{ padding: '1.1rem 1.4rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{f.q}</summary>
                  <p style={{ marginTop: '0.6rem' }}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="int-more">
          <div className="mk-wrap">
            <SectionHead eyebrow="KEEP EXPLORING" title="Related features and integrations" id="int-more" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))', marginTop: '2rem' }}>
              {features.map((f) => (
                <Link key={f.slug} href={`/product/${f.slug}`} className="mk-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <h3><T>{f.name}</T></h3>
                  <p><T>{f.seoDescription}</T></p>
                  <span style={{ color: 'var(--mk-accent)', fontWeight: 700 }}><T>Learn more →</T></span>
                </Link>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--mk-muted)' }}>
              <T>More integrations:</T>{' '}
              {others.map((o, i) => (
                <span key={o.slug}>
                  {i > 0 ? ' · ' : ''}
                  <Link href={`/integrations/${o.slug}`} style={{ textDecoration: 'underline' }}>{o.name}</Link>
                </span>
              ))}
              {integration.links.map((l) => (
                <span key={l.href}>
                  {' · '}
                  <Link href={l.href} style={{ textDecoration: 'underline' }}>{l.label}</Link>
                </span>
              ))}
              {' · '}
              <Link href="/integrations" style={{ textDecoration: 'underline' }}><T>All integrations</T></Link>
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
              <ButtonLink href="/support/contact" variant="ghost"><T>Contact support</T></ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import { T } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { LOGIN_HREF, SIGNUP_HREF } from '@/components/marketing/content';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { FeatureVisual, type VisualKind } from '@/components/marketing/mocks';
import { featureBySlug, PRODUCT_FEATURES, type ProductFeature } from '@/lib/product-features';

/** The product screen shown for each feature, so visitors see what they get and not only read about it. */
const VISUAL: Record<string, { kind: VisualKind; title: string; body: string }> = {
  'ai-assistant': { kind: 'retrieval', title: 'It finds the answer in your content.', body: 'Every reply is built from passages in your own documents. This is what happens behind a single question.' },
  'appointment-booking': { kind: 'calendar', title: 'Customers pick a real free slot.', body: 'The assistant shows open times from your calendar and books in the chat. No back and forth.' },
  'lead-capture': { kind: 'inbox', title: 'Every lead lands in one inbox.', body: 'Name, contact details and the conversation behind them, ready for your team to follow up.' },
  'knowledge-base': { kind: 'sources', title: 'Add your content in minutes.', body: 'Upload files, paste text or add web pages. The assistant learns them and stays in sync.' },
  'website-widget': { kind: 'config', title: 'Make it look like your brand.', body: 'Choose the tone, colours and greeting, then paste one line of code on your site.' },
  'human-handover': { kind: 'inbox', title: 'Your team steps in when it matters.', body: 'Conversations that need a person show up in the inbox with the full history attached.' },
  'messaging-channels': { kind: 'channels', title: 'One assistant, every channel.', body: 'Website, WhatsApp and Telegram share the same knowledge and the same conversation history.' },
};

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
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}><T>{feature.eyebrow}</T></p>
            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '22ch', marginInline: 'auto', ['--mk-delay' as string]: '140ms' }}>
              <T>{feature.title}</T>
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '62ch', ['--mk-delay' as string]: '320ms' }}>
              <T>{feature.intro}</T>
            </p>
            <div className="mk-cta-row mk-rise" style={{ justifyContent: 'center', ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
              <ButtonLink href="/pricing" variant="ghost">
                <T>See pricing</T>
              </ButtonLink>
            </div>

            <div aria-hidden="true" style={{ margin: '2.25rem auto 0', maxWidth: '30rem', display: 'grid', gap: '0.6rem', textAlign: 'left' }}>
              <span style={{ justifySelf: 'end', maxWidth: '85%', padding: '0.65rem 0.95rem', borderRadius: '1.1rem 1.1rem 0.3rem 1.1rem', background: 'rgba(255,254,235,0.14)', color: 'var(--mk-bg)', fontSize: '0.95rem' }}>
                <T>{feature.chat.visitor}</T>
              </span>
              <span style={{ justifySelf: 'start', maxWidth: '88%', padding: '0.65rem 0.95rem', borderRadius: '1.1rem 1.1rem 1.1rem 0.3rem', background: 'var(--mk-lime)', color: 'var(--mk-deep)', fontWeight: 600, fontSize: '0.95rem' }}>
                <T>{feature.chat.assistant}</T>
              </span>
              {feature.chat.footnote ? <small style={{ color: '#cfe3d6', fontSize: '0.78rem', justifySelf: 'start' }}><T>{feature.chat.footnote}</T></small> : null}
            </div>
          </div>
        </section>

        {VISUAL[feature.slug] ? (
          <section className="mk-section" aria-labelledby="feat-see">
            <div className="mk-wrap" style={{ display: 'grid', gap: '2rem', alignItems: 'center', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))' }}>
              <Reveal>
                <p className="mk-eyebrow"><T>SEE IT</T></p>
                <h2 id="feat-see" className="mk-h2"><T>{VISUAL[feature.slug].title}</T></h2>
                <p className="mk-lead"><T>{VISUAL[feature.slug].body}</T></p>
              </Reveal>
              <Reveal delay={120} className="mk-path-visual">
                <FeatureVisual kind={VISUAL[feature.slug].kind} />
              </Reveal>
            </div>
          </section>
        ) : null}

        <section className="mk-section mk-section-tint" aria-labelledby="feat-benefits">
          <div className="mk-wrap">
            <SectionHead eyebrow="WHAT YOU GET" title={`${feature.name}, in practice.`} id="feat-benefits" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))', marginTop: '2rem' }}>
              {feature.benefits.map((b, i) => (
                <Reveal as="article" key={b.title} className="mk-card" delay={i * 60}>
                  <h3><T>{b.title}</T></h3>
                  <p><T>{b.body}</T></p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section" aria-labelledby="feat-how">
          <div className="mk-wrap" style={{ maxWidth: '60rem' }}>
            <SectionHead eyebrow="HOW IT WORKS" title="From set-up to live." id="feat-how" align="center" />
            <ol style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0', display: 'grid', gap: '1rem' }}>
              {feature.steps.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 80} className="mk-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span aria-hidden="true" style={{ flex: 'none', width: '2.25rem', height: '2.25rem', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--mk-lime)', color: 'var(--mk-deep)', border: '1.5px solid var(--mk-ink)', fontWeight: 800 }}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}><T>{s.title}</T></h3>
                    <p><T>{s.body}</T></p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="feat-control">
          <div className="mk-wrap" style={{ maxWidth: '60rem' }}>
            <SectionHead eyebrow="YOU STAY IN CONTROL" title="What you can set." id="feat-control" align="center" />
            <ul style={{ listStyle: 'none', padding: 0, margin: '2rem 0 0', display: 'grid', gap: '0.6rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))' }}>
              {feature.controls.map((c) => (
                <li key={c} className="mk-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <span aria-hidden="true" style={{ color: 'var(--mk-accent)', fontWeight: 800 }}>✓</span>
                  <span><T>{c}</T></span>
                </li>
              ))}
            </ul>

            {feature.notice ? (
              <div role="note" className="mk-card" style={{ marginTop: '1.5rem', background: 'var(--mk-warn-soft)', borderColor: 'var(--mk-warn)' }}>
                <p style={{ color: 'var(--mk-warn)', fontWeight: 600 }}><T>{feature.notice}</T></p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mk-section" aria-labelledby="feat-faq">
          <div className="mk-wrap" style={{ maxWidth: '52rem' }}>
            <SectionHead eyebrow="QUESTIONS" title="Good to know." id="feat-faq" align="center" />
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '2rem' }}>
              {feature.faq.map((f) => (
                <details key={f.q} className="mk-card" style={{ padding: '1.1rem 1.4rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}><T>{f.q}</T></summary>
                  <p style={{ marginTop: '0.6rem' }}><T>{f.a}</T></p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section mk-section-tint" aria-labelledby="feat-related">
          <div className="mk-wrap">
            <SectionHead eyebrow="KEEP EXPLORING" title="Works together with." id="feat-related" align="center" />
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))', marginTop: '2rem' }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/product/${r.slug}`} className="mk-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <h3><T>{r.name}</T></h3>
                  <p><T>{r.seoDescription}</T></p>
                  <span style={{ color: 'var(--mk-accent)', fontWeight: 700 }}><T>Learn more →</T></span>
                </Link>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--mk-muted)' }}>
              {feature.guides.map((g, i) => (
                <span key={g.href}>
                  <T>{i > 0 ? ' · ' : 'Guides: '}</T>
                  <Link href={g.href} style={{ textDecoration: 'underline' }}>
                    <T>{g.label}</T>
                  </Link>
                </span>
              ))}
              {' · '}
              <Link href="/product" style={{ textDecoration: 'underline' }}>
                <T>All features</T>
              </Link>
            </p>
          </div>
        </section>

        <section className="mk-final" style={{ margin: '48px 0.75rem 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>
              <T>TRY IT</T>
            </p>
            <h2 className="mk-h2 mk-h2-wide" style={{ color: 'var(--mk-bg)' }}>
              <T>See it work on your own business.</T>
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              <T>Every Growth feature free for 14 days. A card is required to start, and it is charged when the trial ends unless you cancel first.</T>
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
              <ButtonLink href={LOGIN_HREF} variant="ghost">
                <T>Log in</T>
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

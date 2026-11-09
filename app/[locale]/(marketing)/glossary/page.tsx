import { localizeMetaEnglishOnly } from '@/lib/i18n/metadata';
import { T } from '@/lib/i18n/context';
import Link from '@/components/i18n/Link';
import type { Metadata } from 'next';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { SectionHead } from '@/components/marketing/ui';
import { SITE } from '@/components/marketing/content';
import { GLOSSARY } from '@/lib/glossary';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';

const title = 'AI Chatbot & Booking Glossary | Crescelo';
const description = 'Plain-language definitions of the terms behind AI website assistants: RAG, embeddings, hallucination, BYOK, webhooks, double booking and more.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMetaEnglishOnly(withSocial({ title, description, alternates: { canonical: '/glossary' } }, '/glossary'), { path: '/glossary' });
}

const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

export default function GlossaryPage() {
  const termSet = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE.url}/glossary#set`,
    name: 'Crescelo glossary of AI website assistant terms',
    url: `${SITE.url}/glossary`,
    inLanguage: 'en',
    publisher: { '@id': `${SITE.url}/#organization` },
    hasDefinedTerm: sorted.map((g) => ({
      '@type': 'DefinedTerm',
      '@id': `${SITE.url}/glossary#${g.slug}`,
      name: g.term,
      description: g.definition,
      url: `${SITE.url}/glossary#${g.slug}`,
      inDefinedTermSet: { '@id': `${SITE.url}/glossary#set` },
    })),
  };
  return (
    <>
      <JsonLd data={[webPageSchema('Glossary', description, '/glossary', 'CollectionPage'), breadcrumbSchema([{ name: 'Knowledge Hub', path: '/blog' }, { name: 'Glossary', path: '/glossary' }]), termSet]} />
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '56rem' }}>
            <SectionHead as="h1" id="glossary-title" eyebrow="GLOSSARY" title="The terms behind AI website assistants" intro="Short, plain definitions, with what each one means in Crescelo where the product does something specific." align="left" />
            <nav aria-label="Terms" style={{ margin: '1.5rem 0 2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 0.9rem' }}>
              {sorted.map((g) => (
                <a key={g.slug} href={`#${g.slug}`} style={{ textDecoration: 'underline', fontSize: '0.9rem' }}>{g.term}</a>
              ))}
            </nav>
            <dl style={{ display: 'grid', gap: '1rem', margin: 0 }}>
              {sorted.map((g) => (
                <div key={g.slug} id={g.slug} className="mk-card" style={{ scrollMarginTop: '5rem' }}>
                  <dt style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.35rem' }}>{g.term}</dt>
                  <dd style={{ margin: 0 }}>
                    <p style={{ margin: 0 }}>{g.definition}</p>
                    {g.inCrescelo ? (
                      <p style={{ margin: '0.6rem 0 0' }}>
                        <strong>In Crescelo:</strong> {g.inCrescelo}
                      </p>
                    ) : null}
                    {g.link ? (
                      <p style={{ margin: '0.6rem 0 0' }}>
                        <Link href={g.link.href} style={{ textDecoration: 'underline', fontWeight: 700 }}>{g.link.label} →</Link>
                      </p>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
            <p style={{ marginTop: '2rem', color: 'var(--mk-muted)' }}>
              <T>Keep reading:</T> <Link href="/blog" style={{ textDecoration: 'underline' }}><T>Knowledge Hub</T></Link>
              {' · '}
              <Link href="/product" style={{ textDecoration: 'underline' }}><T>Product overview</T></Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

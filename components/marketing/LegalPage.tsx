import { T } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import Link from '@/components/i18n/Link';
import type { ReactNode } from 'react';
import { EnglishOnlyNotice } from '@/components/i18n/EnglishOnlyNotice';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { LEGAL } from '@/lib/legal/config';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import type { Block, LegalDocument } from '@/lib/legal/documents';

const RELATED = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/acceptable-use', label: 'Acceptable Use' },
  { href: '/dpa', label: 'Data Processing Addendum' },
  { href: '/subprocessors', label: 'Sub-processors' },
];

const PATHS = /(\/(?:privacy|terms|cookies|acceptable-use|dpa|subprocessors)\b)/g;
const IS_PATH = /^\/(privacy|terms|cookies|acceptable-use|dpa|subprocessors)$/;

/** Turns bare "/path" mentions inside legal text into links to those pages. */
function linkify(text: string): ReactNode {
  return text.split(PATHS).map((part, i) =>
    IS_PATH.test(part) ? (
      <Link key={i} href={part} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
        <T>{part}</T>
      </Link>
    ) : (
      <span key={i}><T>{part}</T></span>
    )
  );
}

function renderBlock(block: Block, i: number) {
  if (typeof block === 'string') return <p key={i}>{linkify(block)}</p>;
  return (
    <ul key={i} style={{ paddingLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'disc' }}>
      {block.list.map((item, j) => (
        <li key={j}>{linkify(item)}</li>
      ))}
    </ul>
  );
}

/** Shared layout for every legal page: title, dates, contents list, numbered sections, links to the other documents. */
export function LegalPage({ doc, children }: { doc: LegalDocument; children?: ReactNode }) {
  const path = `/${doc.slug}`;
  return (
    <>
      <JsonLd data={[webPageSchema(doc.title, doc.summary, path), breadcrumbSchema([{ name: doc.title, path }])]} />
      <Header />
      <main id="main">
        <section className="mk-hero" style={{ marginTop: '1rem' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow"><T>{doc.eyebrow}</T></p>
            <h1 className="mk-h1" style={{ maxWidth: '24ch', marginInline: 'auto' }}>
              <T>{doc.title}</T>
            </h1>
            <p className="mk-lead" style={{ maxWidth: '62ch' }}>
              <T>{doc.summary}</T>
            </p>
            <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--mk-lime)', fontWeight: 600 }}>
              <T>Last updated</T> <T>{LEGAL.lastUpdated}</T> <T>· Effective</T> <T>{LEGAL.effectiveDate}</T>
            </p>
          </div>
        </section>

        <section className="mk-section" style={{ paddingTop: '1.5rem' }}>
          <div className="mk-wrap" style={{ maxWidth: '52rem' }}>
            <EnglishOnlyNotice />
            <nav aria-label="On this page" className="mk-card" style={{ padding: '1.25rem clamp(1rem, 4vw, 1.5rem)', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}><T>On this page</T></p>
              <ol style={{ display: 'grid', gap: '0.25rem 1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))', fontSize: '0.92rem' }}>
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <A href={`#${s.id}`} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      <T>{s.heading}</T>
                    </A>
                  </li>
                ))}
              </ol>
            </nav>

            <article
              className="mk-card"
              style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', lineHeight: 1.75, fontSize: '0.97rem', color: 'var(--mk-deep)', display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              {doc.sections.map((s, idx) => (
                <div key={s.id} id={s.id} style={{ borderTop: idx === 0 ? undefined : '1px solid var(--mk-line)', paddingTop: idx === 0 ? 0 : '1.5rem', scrollMarginTop: '6rem' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--mk-ink)' }}><T>{s.heading}</T></h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>{s.body.map(renderBlock)}</div>
                </div>
              ))}
              {children}
              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--mk-ink)' }}><T>Contact</T></h2>
                <p>
                  <T>{LEGAL.operatorLine}</T>
                  {LEGAL.registrationNumber ? `, company registration no. ${LEGAL.registrationNumber}` : ''}
                  {LEGAL.registeredAddress ? `, ${LEGAL.registeredAddress}` : ''}<T>. Contact us through the</T>{' '}
                  <A href="/support/contact" style={{ textDecoration: 'underline' }}>
                    <T>contact form</T>
                  </A>
                </p>
              </div>
            </article>

            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {RELATED.map((r, i) => (
                <span key={r.href}>
                  {i > 0 && ' · '}
                  <Link href={r.href} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    <T>{r.label}</T>
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import Link from '@/components/i18n/Link';
import { T } from '@/lib/i18n/context';
import { EB_Garamond } from 'next/font/google';
import '@/components/marketing/marketing.css';
import '@/components/marketing/theme.css';
import '@/components/marketing/sections.css';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';

// This page sits outside the marketing layout, so it loads the same fonts and styles itself.
const wordmark = EB_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-mk-wordmark' });

export const metadata: Metadata = {
  title: 'Page not found | Crescelo',
  description: 'The page you are looking for does not exist or has moved.',
  robots: { index: false, follow: true },
};

const POPULAR = [
  { href: '/product', label: 'Product and features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/use-case', label: 'Solutions by industry' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/blog', label: 'Blog' },
  { href: '/support', label: 'Help center' },
];

export default function NotFound() {
  return (
    <div className={`mk ${wordmark.variable}`}>
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '760px', textAlign: 'center' }}>
            <p className="mk-eyebrow"><T>Error 404</T></p>
            <h1 className="mk-h2" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', marginBottom: '12px' }}>
              <T>We could not find that page.</T>
            </h1>
            <p className="mk-lead" style={{ marginInline: 'auto', maxWidth: '54ch' }}>
              <T>The link may be old, mistyped, or the page may have moved. Here is where you can go next.</T>
            </p>

            <div className="mk-cta-row" style={{ justifyContent: 'center', marginTop: '28px' }}>
              <ButtonLink href="/"><T>Back to the homepage</T></ButtonLink>
              <ButtonLink href={SIGNUP_HREF} variant="ghost">
                <T>Start free trial</T>
              </ButtonLink>
            </div>

            <nav aria-label="Popular pages" style={{ marginTop: '44px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-muted)', marginBottom: '12px' }}>
                <T>Popular pages</T>
              </p>
              <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', listStyle: 'none', padding: 0, margin: 0 }}>
                {POPULAR.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="mk-btn mk-btn-ghost mk-btn-sm">
                      <T>{l.label}</T>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p style={{ marginTop: '40px', fontSize: '14px', color: 'var(--mk-muted)' }}>
              <T>Followed a link from our site or an e-mail and it led here?</T>{' '}
              <Link href="/support/contact?category=General%20Support" style={{ textDecoration: 'underline' }}>
                <T>Tell us and we will fix it</T>
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

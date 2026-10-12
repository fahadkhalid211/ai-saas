'use client';

import { T, useT } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import { LEGAL } from '@/lib/legal/config';
import { CookieSettingsLink } from '@/components/legal/CookieConsent';
import { useId, useState, type FormEvent } from 'react';
import Link from '@/components/i18n/Link';
import { FAQ, FINAL_CTA, FOOTER, LOGIN_HREF, SIGNUP_HREF, SITE } from './content';
import { ButtonLink, Logo, Reveal, SectionHead } from './ui';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { localizeHref } from '@/lib/i18n/paths';
import { useI18n } from '@/lib/i18n/context';

export function Faq() {
  const { dict } = useI18n();
  const faq = dict?.faq || FAQ;
  const items = faq.items || FAQ.items;
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section id="faq" className="mk-section" aria-labelledby="mk-faq-title">
      <div className="mk-wrap mk-faq-grid">
        <SectionHead id="mk-faq-title" eyebrow={faq.eyebrow} title={faq.title} />
        <Reveal className="mk-faq">
          {items.map((it, i) => {
            const isOpen = open === i;
            const btnId = `${base}-b-${i}`;
            const panelId = `${base}-p-${i}`;
            return (
              <div key={it.q} className={`mk-faq-item ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    id={btnId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span><T>{it.q}</T></span>
                    <span className="mk-faq-plus" aria-hidden="true" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} className="mk-faq-panel">
                  <div>
                    <p><T>{it.a}</T></p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  const { dict } = useI18n();
  const cta = dict?.finalCta || FINAL_CTA;

  return (
    <section className="mk-final" aria-labelledby="mk-final-title">
      <div className="mk-wrap">
        <Reveal className="mk-final-inner">
          <h2 id="mk-final-title" className="mk-h2 mk-h2-wide">
            <T>{cta.title}</T>
          </h2>
          <p className="mk-lead"><T>{cta.body}</T></p>
          <div className="mk-cta-row">
            <ButtonLink href={SIGNUP_HREF}><T>{cta.primary}</T></ButtonLink>
            <ButtonLink href={LOGIN_HREF} variant="ghost">
              <T>{cta.secondary}</T>
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Newsletter() {
  const { dict, locale } = useI18n();
  const news = dict?.newsletter;
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const errId = useId();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!EMAIL_RE.test(v) || v.length > 254) {
      setError(news?.error || 'Enter a valid email address, like name@example.com.');
      setSent(false);
      return;
    }
    setError('');
    setSent(true);
    window.location.href = localizeHref(`/support/contact?topic=newsletter&email=${encodeURIComponent(v)}`, locale);
  };

  return (
    <form className="mk-news" onSubmit={submit} noValidate>
      <label htmlFor="mk-news-email"><T>{news?.title || 'Email updates'}</T></label>
      <div className="mk-news-row">
        <input
          id="mk-news-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={news?.placeholder || 'you@company.com'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          maxLength={254}
        />
        <button type="submit" className="mk-btn mk-btn-primary mk-btn-sm">
          <T>{news?.button || 'Subscribe'}</T>
        </button>
      </div>
      <p id={errId} className="mk-news-msg" role={error ? 'alert' : 'status'}>
        <T>{error || (sent ? (news?.success || 'Thank you! You have been subscribed to Crescelo updates.') : '')}</T>
      </p>
    </form>
  );
}

export function Footer() {
  const __t = useT();
  const { dict } = useI18n();
  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <div className="mk-footer-top">
          <div className="mk-footer-brand">
            <Logo />
            <p><T>{dict?.footer?.blurb || FOOTER.blurb}</T></p>
            <A href="/support/contact" className="mk-footer-mail">
              {dict.footer.contactSupport}
            </A>
            {SITE.socials.length > 0 && (
              <ul className="mk-social" aria-label={__t("Official community channels")}>
                {SITE.socials.map((s) => (
                  <li key={s.label}>
                    <A href={s.href} target="_blank" rel="noopener noreferrer">
                      <T>{s.label}</T>
                    </A>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {FOOTER.columns.map((c) => (
            <nav key={c.title} aria-label={c.title} className="mk-footer-col">
              <h3><T>{c.title}</T></h3>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith('#') ? <A href={l.href}><T>{l.label}</T></A> : <Link href={l.href}><T>{l.label}</T></Link>}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <Newsletter />
        </div>
        <div className="mk-footer-bottom flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} <T>{LEGAL.operatorLine}</T>. {dict.footer.allRightsReserved}</span>
          <span><T>{dict?.footer?.legalNote || FOOTER.legalNote}</T></span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="footer" />
            <CookieSettingsLink className="underline cursor-pointer" />
          </div>
        </div>
        <div className="mk-footer-giant-word" aria-hidden="true">
          <svg viewBox="0 0 1000 195" width="100%" preserveAspectRatio="xMidYMid meet" className="mk-footer-wordmark-svg">
            <text x="50.3%" y="81.5%" textAnchor="middle" className="mk-footer-wordmark-shadow">
              <T>Crescelo</T>
            </text>
            <text x="50%" y="79%" textAnchor="middle" className="mk-footer-wordmark-text">
              <T>Crescelo</T>
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}

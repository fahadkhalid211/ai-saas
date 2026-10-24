'use client';

import { T, useT } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import { LEGAL } from '@/lib/legal/config';
import { CookieSettingsLink } from '@/components/legal/CookieConsent';
import { useId, useState } from 'react';
import Link from '@/components/i18n/Link';
import { FAQ, FINAL_CTA, FOOTER, LOGIN_HREF, SIGNUP_HREF, SITE } from './content';
import { ButtonLink, Logo, Reveal, SectionHead } from './ui';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
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
            <a className="mk-footer-badge" href="https://saasbrowser.com/en/saas/1685880/crescelo" target="_blank" rel="nofollow noopener">
              {/* eslint-disable-next-line @next/next/no-img-element -- third-party badge SVG, served as-is */}
              <img src="https://static-files.saasbrowser.com/saas-browser-badge-17.svg" alt="Crescelo - SaaS search engine" width={200} />
            </a>
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
        </div>
        <div className="mk-footer-bottom flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} <T>{LEGAL.operatorLine}</T>. {dict.footer.allRightsReserved}</span>
          <span><T>{dict?.footer?.legalNote || FOOTER.legalNote}</T></span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="footer" />
            <CookieSettingsLink className="underline cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

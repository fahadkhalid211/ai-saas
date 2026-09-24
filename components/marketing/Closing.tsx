'use client';

import { CookieSettingsLink } from '@/components/legal/CookieConsent';
import { useId, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { FAQ, FINAL_CTA, FOOTER, LOGIN_HREF, SIGNUP_HREF, SITE } from './content';
import { ButtonLink, Logo, Reveal, SectionHead } from './ui';

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" className="mk-section" aria-labelledby="mk-faq-title">
      <div className="mk-wrap mk-faq-grid">
        <SectionHead id="mk-faq-title" eyebrow={FAQ.eyebrow} title={FAQ.title} />
        <Reveal className="mk-faq">
          {FAQ.items.map((it, i) => {
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
                    <span>{it.q}</span>
                    <span className="mk-faq-plus" aria-hidden="true" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} className="mk-faq-panel">
                  <div>
                    <p>{it.a}</p>
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
  return (
    <section className="mk-final" aria-labelledby="mk-final-title">
      <div className="mk-wrap">
        <Reveal className="mk-final-inner">
          <h2 id="mk-final-title" className="mk-h2 mk-h2-wide">
            {FINAL_CTA.title}
          </h2>
          <p className="mk-lead">{FINAL_CTA.body}</p>
          <div className="mk-cta-row">
            <ButtonLink href={SIGNUP_HREF}>{FINAL_CTA.primary}</ButtonLink>
            <ButtonLink href={LOGIN_HREF} variant="ghost">
              {FINAL_CTA.secondary}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * No newsletter provider is connected yet. A valid address opens a pre-filled email to
 * the contact address instead of pretending to subscribe. Swap `onSubmit` for a real endpoint later.
 */
function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const errId = useId();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!EMAIL_RE.test(v) || v.length > 254) {
      setError('Enter a valid email address, like name@example.com.');
      setSent(false);
      return;
    }
    setError('');
    setSent(true);
    const subject = encodeURIComponent('Newsletter sign-up');
    const body = encodeURIComponent(`Please add ${v} to the Crescelo newsletter.`);
    window.location.href = `mailto:${SITE.contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <form className="mk-news" onSubmit={submit} noValidate>
      <label htmlFor="mk-news-email">Email updates</label>
      <div className="mk-news-row">
        <input
          id="mk-news-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          maxLength={254}
        />
        <button type="submit" className="mk-btn mk-btn-primary mk-btn-sm">
          Subscribe
        </button>
      </div>
      <p id={errId} className="mk-news-msg" role={error ? 'alert' : 'status'}>
        {error || (sent ? 'Thank you! You have been subscribed to Crescelo updates.' : '')}
      </p>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <div className="mk-footer-top">
          <div className="mk-footer-brand">
            <Logo />
            <p>{FOOTER.blurb}</p>
            <a href={`mailto:${SITE.contactEmail}`} className="mk-footer-mail">
              {SITE.contactEmail}
            </a>
            {SITE.socials.length > 0 && (
              <ul className="mk-social" aria-label="Official community channels">
                {SITE.socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {FOOTER.columns.map((c) => (
            <nav key={c.title} aria-label={c.title} className="mk-footer-col">
              <h3>{c.title}</h3>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith('#') ? <a href={l.href}>{l.label}</a> : <Link href={l.href}>{l.label}</Link>}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <Newsletter />
        </div>
        <div className="mk-footer-bottom">
          <span>© {new Date().getFullYear()} Fahad Khalid, trading as Crescelo. All rights reserved.</span>
          <span>{FOOTER.legalNote}</span>
          <CookieSettingsLink className="underline cursor-pointer" />
        </div>
        <div className="mk-footer-giant-word" aria-hidden="true">
          <svg viewBox="0 0 1000 195" width="100%" preserveAspectRatio="xMidYMid meet" className="mk-footer-wordmark-svg">
            <text x="50.3%" y="81.5%" textAnchor="middle" className="mk-footer-wordmark-shadow">
              Crescelo
            </text>
            <text x="50%" y="79%" textAnchor="middle" className="mk-footer-wordmark-text">
              Crescelo
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}

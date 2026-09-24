'use client';

import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics/track';
import { PLANS, PRICING, SIGNUP_HREF } from './content';
import { ButtonLink, Check, Reveal, SectionHead } from './ui';

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        trackEvent('pricing_viewed', { page: 'home' });
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="mk-section mk-section-tint" aria-labelledby="mk-pricing-title">
      <div className="mk-wrap">
        <SectionHead id="mk-pricing-title" eyebrow={PRICING.eyebrow} title={PRICING.title} intro={PRICING.intro} />

        <div className="mk-billing" role="group" aria-label="Billing period">
          <button type="button" aria-pressed={!annual} className={!annual ? 'is-on' : ''} onClick={() => setAnnual(false)}>
            Monthly
          </button>
          <button type="button" aria-pressed={annual} className={annual ? 'is-on' : ''} onClick={() => setAnnual(true)}>
            Annual
          </button>
        </div>

        <ul className="mk-plans">
          {PLANS.map((p, i) => {
            const price = annual ? p.annualMonthly : p.monthly;
            return (
              <Reveal as="li" key={p.id} delay={i * 80} className={`mk-plan ${p.popular ? 'is-popular' : ''}`}>
                {p.popular ? <span className="mk-plan-flag">Recommended</span> : null}
                <h3>{p.name}</h3>
                <p className="mk-plan-tag">{p.tagline}</p>
                <p className="mk-price" aria-live="polite">
                  <span className="mk-price-num">${price}</span>
                  <span className="mk-price-per"> / month</span>
                </p>
                <p className="mk-price-note">{annual ? `Billed annually: $${price * 12} per year (instead of $${p.monthly * 12} if paid monthly)` : 'Billed monthly, cancel any time'}</p>
                <ul className="mk-ticks">
                  {p.highlights.map((h) => (
                    <li key={h}>
                      <Check />
                      {h}
                    </li>
                  ))}
                </ul>
                <ButtonLink href={`${SIGNUP_HREF}&plan=${p.id}&billing=${annual ? 'annual' : 'monthly'}`} variant={p.popular ? 'primary' : 'ghost'} className="mk-plan-cta" onClick={() => trackEvent('plan_selected', { plan: p.id, billing: annual ? 'annual' : 'monthly' })}>
                  Choose {p.name}
                </ButtonLink>
              </Reveal>
            );
          })}
        </ul>

        <p className="mk-footnote">{PRICING.note}</p>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { PLANS, PRICING, SIGNUP_HREF } from './content';
import { ButtonLink, Check, Reveal, SectionHead } from './ui';

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="mk-section mk-section-tint" aria-labelledby="mk-pricing-title">
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
                <p className="mk-price-note">{annual ? `Billed annually ($${price * 12} per year)` : 'Billed monthly'}</p>
                <ul className="mk-ticks">
                  {p.highlights.map((h) => (
                    <li key={h}>
                      <Check />
                      {h}
                    </li>
                  ))}
                </ul>
                <ButtonLink href={SIGNUP_HREF} variant={p.popular ? 'primary' : 'ghost'} className="mk-plan-cta">
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

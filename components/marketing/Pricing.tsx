'use client';

import { T, useT } from '@/lib/i18n/context';
import { useEffect, useRef, useState } from 'react';
import { annualSavingsPercent } from '@/lib/billing/plans';
import { trackEvent } from '@/lib/analytics/track';
import { PLANS, PRICING, SIGNUP_HREF } from './content';
import { ButtonLink, Check, Reveal, SectionHead } from './ui';
import { useI18n } from '@/lib/i18n/context';

export function Pricing() {
  const __t = useT();
  const { dict } = useI18n();
  const pr = dict?.pricing || PRICING;
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
        <SectionHead id="mk-pricing-title" eyebrow={pr.eyebrow} title={pr.title} intro={pr.intro} />

        <div className="mk-billing" role="group" aria-label={__t("Billing period")}>
          <button type="button" aria-pressed={!annual} className={!annual ? 'is-on' : ''} onClick={() => setAnnual(false)}>
            <T>{pr.monthly || 'Monthly'}</T>
          </button>
          <button type="button" aria-pressed={annual} className={annual ? 'is-on' : ''} onClick={() => setAnnual(true)}>
            <T>{pr.annual || 'Annual'}</T> <small style={{ fontWeight: 700 }}>· <T>{pr.save || 'save'}</T> {annualSavingsPercent()}%</small>
          </button>
        </div>

        <ul className="mk-plans">
          {PLANS.map((p, i) => {
            const price = annual ? p.annualMonthly : p.monthly;
            const billedAnnuallyText = pr.billedAnnually
              ? pr.billedAnnually.replace('${price}', `$${price * 12}`).replace('${monthlyTotal}', `$${p.monthly * 12}`)
              : `Billed annually: $${price * 12} per year (instead of $${p.monthly * 12} if paid monthly)`;

            return (
              <Reveal as="li" key={p.id} delay={i * 80} className={`mk-plan ${p.popular ? 'is-popular' : ''}`}>
                {p.popular ? <span className="mk-plan-flag"><T>{pr.recommended || 'Recommended'}</T></span> : null}
                <h3><T>{p.name}</T></h3>
                <p className="mk-plan-tag"><T>{p.tagline}</T></p>
                <p className="mk-price" aria-live="polite">
                  <span className="mk-price-num">$<T>{price}</T></span>
                  <span className="mk-price-per"> <T>{pr.perMonth || '/ month'}</T></span>
                </p>
                <p className="mk-price-note" style={{ fontWeight: 600 }}>
                  <T>{pr.trialNote || '14 days free (card required, cancel any time). Then:'}</T>
                </p>
                <p className="mk-price-note">
                  <T>{annual ? billedAnnuallyText : (pr.billedMonthly || 'Billed monthly, cancel any time')}</T>
                </p>
                <ul className="mk-ticks">
                  {p.highlights.map((h) => (
                    <li key={h}>
                      <Check />
                      <T>{h}</T>
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href={`${SIGNUP_HREF}&plan=${p.id}&billing=${annual ? 'annual' : 'monthly'}`}
                  variant={p.popular ? 'primary' : 'ghost'}
                  className="mk-plan-cta"
                  onClick={() => trackEvent('plan_selected', { plan: p.id, billing: annual ? 'annual' : 'monthly' })}
                >
                  <T>{dict?.nav?.signup || 'Start free trial'}</T>
                </ButtonLink>
              </Reveal>
            );
          })}
        </ul>

        <p className="mk-footnote"><T>{pr.byokNote || PRICING.note}</T></p>
      </div>
    </section>
  );
}

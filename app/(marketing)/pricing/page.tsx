'use client';

import { useState } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead, Check } from '@/components/marketing/ui';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { SIGNUP_HREF } from '@/components/marketing/content';

const COMPARISON_ROWS = [
  { feature: 'Included Chat Sessions', starter: '100 / mo', growth: '500 / mo', scale: '2,000 / mo' },
  { feature: 'Assistant Bots', starter: '1 Bot', growth: '5 Bots', scale: 'Unlimited' },
  { feature: 'Hosted Business Landing Pages', starter: '1 Included', growth: '3 Included', scale: '7 Included' },
  { feature: 'Knowledge Base Storage', starter: '50 MB (~50k pages)', growth: '500 MB', scale: '5 GB' },
  { feature: 'Grounded RAG (No Hallucinations)', starter: 'Included', growth: 'Included', scale: 'Included' },
  { feature: 'Zero Token Markup (BYOK)', starter: 'Included', growth: 'Included', scale: 'Included' },
  { feature: 'Calendar Slot Picker', starter: 'Basic', growth: 'Full Mutex Locking', scale: 'Full Mutex Locking' },
  { feature: 'Google Calendar & Outlook Sync', starter: '—', growth: 'Included', scale: 'Included' },
  { feature: 'Inbound Phone Voice Calling', starter: '—', growth: 'Add-on ($15/mo)', scale: 'Included (1 Number)' },
  { feature: 'WhatsApp Cloud & Telegram Bots', starter: '—', growth: '—', scale: 'Included' },
  { feature: 'Live Staff Audio Chimes & Takeover', starter: 'Email only', growth: 'Audio + Desktop', scale: 'Priority Multi-seat' },
  { feature: 'Custom Domain CNAME Mapping', starter: '—', growth: 'Included', scale: 'Included (Multi-domain)' },
  { feature: 'API & Outbound Webhooks', starter: 'Standard', growth: 'High-frequency', scale: 'Dedicated Webhooks' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <Header />
      <main id="main">
        {/* Pricing Hero */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow">PREDICTABLE INVESTMENT</p>
            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              Transparent pricing. <span className="mk-echo-em">Zero</span> token markup.
            </h1>
            <p className="mk-lead">
              Every plan includes grounded RAG memory, lead detection, and deterministic scheduling.
              Save 20% by choosing annual billing.
            </p>

            {/* Annual Switcher */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '32px',
                padding: '6px 8px',
                borderRadius: '999px',
                background: 'var(--mk-surface)',
                border: '1.5px solid var(--mk-ink)',
              }}
            >
              <button
                type="button"
                onClick={() => setAnnual(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 0,
                  cursor: 'pointer',
                  background: !annual ? 'var(--mk-deep)' : 'transparent',
                  color: !annual ? 'var(--mk-bg)' : 'var(--mk-muted)',
                  transition: 'all 0.2s',
                }}
              >
                Monthly billing
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 0,
                  cursor: 'pointer',
                  background: annual ? 'var(--mk-lime)' : 'transparent',
                  color: 'var(--mk-deep)',
                  transition: 'all 0.2s',
                }}
              >
                <span>Annual billing</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-lime)',
                    fontWeight: 800,
                  }}
                >
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="mk-section">
          <div className="mk-wrap">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                gap: '24px',
              }}
            >
              {BILLING_PLANS.map((plan) => {
                const price = annual ? plan.annualMonthlyPrice : plan.monthlyPrice;
                const isPop = plan.popular;
                return (
                  <Reveal
                    key={plan.id}
                    as="article"
                    className={`mk-card mk-plan ${isPop ? 'is-popular' : ''}`}
                    style={{
                      padding: '36px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: isPop ? 'var(--mk-lime-soft)' : 'var(--mk-surface)',
                      borderColor: 'var(--mk-ink)',
                      position: 'relative',
                    }}
                  >
                    <div>
                      {isPop && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-14px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--mk-deep)',
                            color: 'var(--mk-lime)',
                            padding: '4px 14px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            border: '1.5px solid var(--mk-ink)',
                          }}
                        >
                          Most Popular
                        </span>
                      )}

                      <h3 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>{plan.name}</h3>
                      <p style={{ color: 'var(--mk-muted)', fontSize: '14px', minHeight: '42px' }}>
                        {plan.tagline}
                      </p>

                      <div style={{ margin: '24px 0 20px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--mk-muted)' }}>$</span>
                        <strong style={{ fontFamily: 'var(--mk-display)', fontSize: '3.6rem', color: 'var(--mk-deep)', lineHeight: 1 }}>
                          {price}
                        </strong>
                        <span style={{ fontSize: '14px', color: 'var(--mk-muted)' }}>/ month</span>
                      </div>

                      <p style={{ fontSize: '13px', color: 'var(--mk-accent)', fontWeight: 600, marginBottom: '24px' }}>
                        {annual ? `Billed annually ($${price * 12}/yr)` : 'Billed month-to-month'}
                      </p>

                      <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '20px' }}>
                        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--mk-muted)', marginBottom: '14px' }}>
                          What is included
                        </p>
                        <ul style={{ display: 'grid', gap: '11px' }}>
                          {plan.features.map((f, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--mk-deep)' }}>
                              <span style={{ marginTop: '3px' }}><Check /></span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div style={{ marginTop: '36px' }}>
                      <ButtonLink
                        href={`${SIGNUP_HREF}&plan=${plan.id}`}
                        variant={isPop ? 'primary' : 'ghost'}
                        style={{ width: '100%', textAlign: 'center' }}
                      >
                        Choose {plan.name}
                      </ButtonLink>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="mk-section mk-section-tint">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Comparison"
              title="Compare plan features side-by-side."
              intro="Everything you need to select the right tier for your call volume, website traffic, and team size."
              id="feature-matrix"
              align="center"
            />

            <div
              style={{
                overflowX: 'auto',
                marginTop: '40px',
                border: '1.5px solid var(--mk-ink)',
                borderRadius: '20px',
                background: 'var(--mk-surface)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--mk-ink)', background: 'var(--mk-lav)' }}>
                    <th style={{ padding: '18px 24px', fontSize: '14px', fontWeight: 700, color: 'var(--mk-deep)' }}>Feature</th>
                    <th style={{ padding: '18px 20px', fontSize: '14px', fontWeight: 700, color: 'var(--mk-deep)' }}>Starter</th>
                    <th style={{ padding: '18px 20px', fontSize: '14px', fontWeight: 700, color: 'var(--mk-deep)', background: 'var(--mk-lime-soft)' }}>Growth</th>
                    <th style={{ padding: '18px 20px', fontSize: '14px', fontWeight: 700, color: 'var(--mk-deep)' }}>Agency / Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid var(--mk-line)' : 'none',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                      }}
                    >
                      <td style={{ padding: '14px 24px', fontSize: '14.5px', fontWeight: 600, color: 'var(--mk-deep)' }}>{row.feature}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--mk-muted)' }}>{row.starter}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--mk-deep)', fontWeight: 600, background: 'rgba(171, 255, 68, 0.08)' }}>{row.growth}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--mk-deep)', fontWeight: 600 }}>{row.scale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing FAQ */}
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '840px' }}>
            <SectionHead
              eyebrow="FAQ"
              title="Frequently asked billing questions."
              id="billing-faq"
              align="center"
            />
            <div style={{ display: 'grid', gap: '16px', marginTop: '36px' }}>
              <div className="mk-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>How does Bring-Your-Own-Key (BYOK) work?</h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px' }}>
                  You paste your own API key (Groq, OpenAI, Anthropic, or Google Gemini) in your assistant dashboard. When visitors converse with your assistant, the inference is billed directly by your provider at wholesale rates. Crescelo takes zero cut of your token consumption.
                </p>
              </div>
              <div className="mk-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>What happens if I exceed my monthly chat sessions?</h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px' }}>
                  Your assistant never cuts off visitors in the middle of a booking. Extra sessions are simply billed at the plan’s overage rate ($0.50 for Starter, $0.40 for Growth, $0.30 for Scale). You can also upgrade tiers at any time.
                </p>
              </div>
              <div className="mk-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Can I cancel or switch plans at any time?</h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '15px' }}>
                  Yes. All payments and subscriptions are handled securely through the Stripe Customer Portal. You can change your plan, download invoices, or cancel with a single click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mk-final" style={{ margin: '48px 12px 12px 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>GET STARTED</p>
            <h2 className="mk-h2" style={{ color: 'var(--mk-bg)' }}>
              Start booking appointments on autopilot.
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              Set up your assistant, train it on your services, and start taking bookings today.
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}>Create your assistant</ButtonLink>
              <ButtonLink href="/support/contact" variant="ghost" style={{ borderColor: '#fff', color: '#fff' }}>
                Ask a billing question
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

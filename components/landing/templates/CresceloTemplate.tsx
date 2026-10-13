'use client';

import React, { useState, useEffect, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';
import { CresceloOrb } from '@/components/brand/CresceloOrb';
import { IndustryTemplateProps } from '../types';
import '@/components/marketing/marketing.css';
import '@/components/marketing/theme.css';
import '@/components/marketing/sections.css';
import { SmoothScroll } from '@/components/marketing/SmoothScroll';
import { LogoStrip } from '@/components/marketing/LogoStrip';
import { ProblemSolution } from '@/components/marketing/ProblemSolution';
import { BehindTheScenes, FeatureCarousel, Tools } from '@/components/marketing/Showpieces';
import { Demo } from '@/components/marketing/Features';
import { Playground } from '@/components/marketing/Playground';
import { Compare, DiagonalBenefits, IntegrationsStage, Paths } from '@/components/marketing/Sections2';
import { Metrics, Security, UseCases } from '@/components/marketing/Sections';
import { Pricing } from '@/components/marketing/Pricing';
import { Faq } from '@/components/marketing/Closing';
import { HERO, STORY, DEMO, FAQ, PLANS, SITE, FOOTER } from '@/components/marketing/content';
import { BEHIND, CAROUSEL } from '@/components/marketing/content-extra';
import { usePrefersReducedMotion, useInView } from '@/components/marketing/hooks';
import { ButtonLink, Eyebrow, Reveal, SectionHead, Logo } from '@/components/marketing/ui';
import {
  Star,
  Calendar,
  Clock,
  ArrowRight,
  Check,
  Sparkles,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Zap,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Assistant orb (a faceless crescent; replaces the old cursor-tracking mascot) */
/* -------------------------------------------------------------------------- */
function Mascot() {
  return (
    <div className="mk-orb-perch">
      <CresceloOrb size={80} followPointer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Interactive Prompt Demo                                                    */
/* -------------------------------------------------------------------------- */
interface Turn {
  q: string;
  a: string;
  source: string;
  booking?: boolean;
}

const DEFAULT_TURNS: Turn[] = [
  {
    q: 'How much is a standard consultation?',
    a: 'A standard initial consultation is $45 and takes about 30 minutes. Full services start at $75.',
    source: 'Services & Pricing Document',
  },
  {
    q: 'Are you open on weekends?',
    a: 'Saturday hours are 10am to 4pm. Sunday appointments can be scheduled directly online.',
    source: 'Business Hours Policy',
  },
  {
    q: 'Can I book Saturday at 10?',
    a: 'Saturday at 10:00 is open. I have reserved the slot for you. Click confirm to finish booking.',
    source: 'Real-time Calendar Sync',
    booking: true,
  },
];

function PromptDemo({
  businessName,
  onOpenBooking,
}: {
  businessName: string;
  onOpenBooking: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [turn, setTurn] = useState(0);
  const [typed, setTyped] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paused, setPaused] = useState(false);
  const cur = DEFAULT_TURNS[turn];

  useEffect(() => {
    if (reduced || paused) return;
    let t: ReturnType<typeof setTimeout>;
    if (typed < cur.q.length) {
      t = setTimeout(() => setTyped((n) => n + 1), 38);
    } else if (!showAnswer) {
      t = setTimeout(() => setShowAnswer(true), 450);
    } else {
      t = setTimeout(() => {
        setTurn((n) => (n + 1) % DEFAULT_TURNS.length);
        setTyped(0);
        setShowAnswer(false);
        setConfirmed(false);
      }, 5200);
    }
    return () => clearTimeout(t);
  }, [reduced, paused, typed, showAnswer, cur.q.length]);

  const pick = (i: number) => {
    setPaused(true);
    setTurn(i);
    setTyped(DEFAULT_TURNS[i].q.length);
    setShowAnswer(true);
    setConfirmed(false);
  };

  const isStatic = reduced || paused;
  const question = isStatic ? cur.q : cur.q.slice(0, typed);
  const answerVisible = isStatic ? true : showAnswer;

  return (
    <div className="mk-prompt-wrap">
      <Mascot />
      <div className="mk-prompt">
        <div className="mk-prompt-top">
          <span className="mk-live" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>Live visitor conversation • {businessName || 'Apex AI Assistant'}</span>
        </div>
        <div className="mk-prompt-body" role="log" aria-live="polite" aria-label="Customer conversation preview">
          <p className="mk-prompt-q">
            {question}
            {!isStatic && typed < cur.q.length ? <span className="mk-caret" aria-hidden="true" /> : null}
          </p>
          {answerVisible ? (
            <div className="mk-prompt-a">
              <p>
                {cur.a}
                <span className="mk-source">Source: {cur.source}</span>
              </p>
              {cur.booking ? (
                <div className="mk-booking-card">
                  <div>
                    <strong>Sat, 10:00 – 10:30</strong>
                    <span>Standard consultation · Confirmed</span>
                  </div>
                  <button
                    type="button"
                    className="mk-btn mk-btn-primary mk-btn-sm"
                    onClick={() => {
                      setConfirmed(true);
                      onOpenBooking();
                    }}
                  >
                    {confirmed ? 'Booked ✓' : 'Confirm & Book'}
                  </button>
                </div>
              ) : null}
              {cur.booking && confirmed ? (
                <p className="mk-logline">Booking saved and synced to live calendar.</p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="mk-chips" aria-label="Suggested customer inquiries">
          {DEFAULT_TURNS.map((t, i) => (
            <button
              key={t.q}
              type="button"
              className={`mk-chip ${i === turn ? 'is-on' : ''}`}
              aria-pressed={i === turn}
              onClick={() => pick(i)}
            >
              {t.q}
            </button>
          ))}
        </div>
      </div>
      <p className="mk-caption">Interactive preview · Select an inquiry above to test grounded responses.</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Floating Header Navbar                                                     */
/* -------------------------------------------------------------------------- */
function FloatingHeader({
  businessName,
  logoUrl,
  onOpenBooking,
  onOpenChat,
}: {
  businessName: string;
  logoUrl?: string;
  onOpenBooking: () => void;
  onOpenChat: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`mk-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="mk-wrap">
        <div className="mk-header-row">
          <a href="#" className="mk-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }}
              />
            ) : (
              <Logo />
            )}
            <span className="mk-logo" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              {businessName || 'Crescelo'}
            </span>
          </a>

          <nav aria-label="Primary" className="mk-nav-desktop">
            <a href="#problem" className="mk-nav-link">Problem</a>
            <a href="#product" className="mk-nav-link">Toolkit</a>
            <a href="#agent" className="mk-nav-link">Features</a>
            <a href="#services" className="mk-nav-link">Services</a>
            <a href="#pricing" className="mk-nav-link">Pricing</a>
            <a href="#faq" className="mk-nav-link">FAQ</a>
          </nav>

          <div className="mk-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onOpenChat}
              className="mk-btn mk-btn-ghost mk-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <MessageSquare size={14} />
              <span>Ask AI</span>
            </button>
            <button
              type="button"
              onClick={onOpenBooking}
              className="mk-btn mk-btn-primary mk-btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Calendar size={14} />
              <span>Book Appointment</span>
            </button>
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="mk-burger"
              style={{ marginLeft: '4px' }}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile menu sheet */}
        {open && (
          <div className="mk-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            <a href="#problem" className="mk-mobile-link" onClick={() => setOpen(false)}>Problem</a>
            <a href="#product" className="mk-mobile-link" onClick={() => setOpen(false)}>Toolkit</a>
            <a href="#agent" className="mk-mobile-link" onClick={() => setOpen(false)}>Features</a>
            <a href="#services" className="mk-mobile-link" onClick={() => setOpen(false)}>Services</a>
            <a href="#pricing" className="mk-mobile-link" onClick={() => setOpen(false)}>Pricing</a>
            <a href="#faq" className="mk-mobile-link" onClick={() => setOpen(false)}>FAQ</a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenBooking();
                }}
                className="mk-btn mk-btn-primary"
              >
                Book Appointment
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenChat();
                }}
                className="mk-btn mk-btn-ghost"
              >
                Chat with Assistant
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Dynamic Services Section (Supports user-edited services)                  */
/* -------------------------------------------------------------------------- */
function DynamicServicesSection({
  config,
  onOpenBooking,
}: {
  config: IndustryTemplateProps['config'];
  onOpenBooking: (serviceId?: string) => void;
}) {
  const services = config.services && config.services.length > 0 ? config.services : [
    {
      id: 'srv_starter',
      name: 'Starter AI Assistant Onboarding',
      description: 'Single assistant trained on your knowledge base with embeddable web widget, lead capture, and basic triage.',
      durationMinutes: 30,
      price: 49,
      popular: false,
    },
    {
      id: 'srv_growth',
      name: 'Growth Calendar & Booking Suite',
      description: 'Full calendar booking engine, multi-channel messaging (Web, WhatsApp), email notifications, and live takeover.',
      durationMinutes: 45,
      price: 149,
      popular: true,
    },
    {
      id: 'srv_scale',
      name: 'Scale & Enterprise Integration',
      description: 'Unlimited documents, hybrid search with neural re-ranking, custom API integrations, and SLA guarantees.',
      durationMinutes: 60,
      price: 399,
      popular: false,
    },
  ];

  return (
    <section id="services" className="mk-section mk-section-tint" aria-labelledby="mk-services-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow>{config.badgeText || 'Offerings & Reservations'}</Eyebrow>
          <h2 id="mk-services-title" className="mk-h2 mk-h2-center">
            {config.servicesTitle || 'Select a Service to Schedule'}
          </h2>
          <p className="mk-lead" style={{ maxWidth: '600px', margin: '16px auto 0' }}>
            {config.servicesSubtitle || 'Choose a service tier below. Real-time availability is verified before confirmation.'}
          </p>
        </Reveal>

        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginTop: '48px',
            listStyle: 'none',
            padding: 0,
          }}
        >
          {services.map((svc, i) => (
            <Reveal
              as="li"
              key={svc.id || i}
              delay={i * 120}
              style={{
                background: 'var(--mk-surface)',
                border: '1.5px solid var(--mk-ink)',
                borderRadius: 'var(--mk-radius)',
                boxShadow: svc.popular ? '0 6px 0 var(--mk-ink)' : '0 3px 0 var(--mk-ink)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {svc.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'var(--mk-lime)',
                    color: 'var(--mk-deep)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: '1px solid var(--mk-ink)',
                    zIndex: 2,
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Service image if provided by user */}
              {svc.imageUrl && (
                <div style={{ height: '180px', width: '100%', overflow: 'hidden', borderBottom: '1.5px solid var(--mk-ink)' }}>
                  <img
                    src={svc.imageUrl}
                    alt={svc.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
                <h3 className="mk-h3" style={{ fontSize: '1.6rem', margin: 0 }}>
                  {svc.name}
                </h3>
                <p style={{ color: 'var(--mk-muted)', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, margin: 0 }}>
                  {svc.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    paddingTop: '16px',
                    borderTop: '1px dashed var(--mk-line)',
                  }}
                >
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--mk-deep)', letterSpacing: '-0.03em' }}>
                    ${svc.price}
                  </span>
                  {svc.durationMinutes ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--mk-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {svc.durationMinutes} min
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenBooking(svc.id)}
                  className="mk-btn mk-btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                  }}
                >
                  <Calendar size={15} />
                  <span>Book Appointment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Dynamic Testimonials Section                                               */
/* -------------------------------------------------------------------------- */
function DynamicTestimonials({
  config,
}: {
  config: IndustryTemplateProps['config'];
}) {
  const testimonials = config.testimonials && config.testimonials.length > 0 ? config.testimonials : [
    {
      id: 't1',
      clientName: 'Jordan K.',
      clientRole: 'Barbershop Owner',
      comment: 'The AI answered questions at 11pm that I used to handle myself. Woke up to two booked appointments without touching my phone.',
      rating: 5,
    },
    {
      id: 't2',
      clientName: 'Priya M.',
      clientRole: 'Clinic Operations Lead',
      comment: 'Clients started booking without ever calling. The handover to my front-desk team is seamless — they see the whole conversation history.',
      rating: 5,
    },
    {
      id: 't3',
      clientName: 'David R.',
      clientRole: 'Fitness Studio Founder',
      comment: 'Leads were getting lost across WhatsApp and email. Now they all land in one place with context and calendar sync. Night and day.',
      rating: 5,
    },
  ];

  return (
    <section className="mk-section" aria-labelledby="mk-reviews-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow>Customer Feedback</Eyebrow>
          <h2 id="mk-reviews-title" className="mk-h2 mk-h2-center">
            {config.testimonialsTitle || 'Loved by Businesses & Their Visitors'}
          </h2>
          <p className="mk-lead" style={{ maxWidth: '600px', margin: '16px auto 0' }}>
            {config.testimonialsSubtitle || 'Real results from teams running automated booking and grounded answers.'}
          </p>
        </Reveal>

        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '48px',
            listStyle: 'none',
            padding: 0,
          }}
        >
          {testimonials.map((t, idx) => (
            <Reveal
              as="li"
              key={t.id || idx}
              delay={idx * 110}
              className="mk-card"
              style={{
                background: 'var(--mk-surface)',
                border: '1.5px solid var(--mk-ink)',
                borderRadius: 'var(--mk-radius)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 3px 0 var(--mk-ink)',
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--mk-amber)" stroke="var(--mk-ink)" strokeWidth={1.5} />
                ))}
              </div>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic', flex: 1, margin: 0 }}>
                "{t.comment}"
              </p>
              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '16px' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--mk-deep)' }}>
                  {t.clientName}
                </strong>
                {t.clientRole && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--mk-muted)' }}>
                    {t.clientRole}
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Dynamic Final CTA Banner                                                   */
/* -------------------------------------------------------------------------- */
function DynamicFinalCta({
  config,
  onOpenBooking,
  onOpenChat,
}: {
  config: IndustryTemplateProps['config'];
  onOpenBooking: () => void;
  onOpenChat: () => void;
}) {
  return (
    <section className="mk-final" aria-labelledby="mk-final-title">
      <div className="mk-wrap">
        <Reveal className="mk-final-inner" style={{ textAlign: 'center' }}>
          <Mascot />
          <h2 id="mk-final-title" className="mk-h2 mk-h2-wide" style={{ margin: '24px auto 16px' }}>
            {config.ctaHeadline || 'Ready to answer every visitor?'}
          </h2>
          <p className="mk-lead" style={{ maxWidth: '620px', margin: '0 auto 32px' }}>
            {config.ctaSubheadline || 'Set up your assistant from your existing content in minutes. Connect your calendar and start booking today.'}
          </p>
          <div className="mk-cta-row" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onOpenBooking}
              className="mk-btn mk-btn-primary"
              style={{ padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Calendar size={16} />
              <span>{config.ctaButtonText || 'Book an Appointment'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenChat}
              className="mk-btn mk-btn-ghost"
              style={{ padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <MessageSquare size={16} />
              <span>Chat With Assistant</span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Dynamic Footer                                                             */
/* -------------------------------------------------------------------------- */
function DynamicFooter({
  config,
}: {
  config: IndustryTemplateProps['config'];
}) {
  const businessName = config.businessName || 'Crescelo';

  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <div className="mk-footer-top">
          <div className="mk-footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={businessName}
                  style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }}
                />
              ) : (
                <Logo />
              )}
              <span className="mk-logo" style={{ fontSize: '22px', fontWeight: 700 }}>
                {businessName}
              </span>
            </div>
            <p style={{ marginTop: '12px' }}>
              {config.tagline || config.aboutText || FOOTER.blurb}
            </p>
            {config.email && (
              <a href={`mailto:${config.email}`} className="mk-footer-mail">
                {config.email}
              </a>
            )}
            {config.phone && (
              <a href={`tel:${config.phone}`} className="mk-footer-mail">
                {config.phone}
              </a>
            )}
            {config.address && (
              <p style={{ fontSize: '0.85rem', color: 'var(--mk-muted)', marginTop: '4px' }}>
                {config.address}
              </p>
            )}
          </div>

          <nav aria-label="Quick links" className="mk-footer-col">
            <h3>Navigation</h3>
            <ul>
              <li><a href="#problem">The Problem</a></li>
              <li><a href="#product">Toolkit</a></li>
              <li><a href="#agent">Behind The Scenes</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="/roadmap">Roadmap</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </nav>

          <nav aria-label="Hours & Contact" className="mk-footer-col">
            <h3>Operating Hours</h3>
            <ul>
              {config.workingHours && config.workingHours.length > 0 ? (
                config.workingHours.map((wh, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--mk-muted)' }}>
                    <strong>{wh.days}:</strong> {wh.hours}
                  </li>
                ))
              ) : (
                <>
                  <li style={{ fontSize: '0.9rem', color: 'var(--mk-muted)' }}>Mon–Fri: 9:00 AM – 6:00 PM</li>
                  <li style={{ fontSize: '0.9rem', color: 'var(--mk-muted)' }}>Sat: 10:00 AM – 4:00 PM</li>
                  <li style={{ fontSize: '0.9rem', color: 'var(--mk-muted)' }}>Sun: 24/7 Automated AI Assistant</li>
                </>
              )}
            </ul>
          </nav>

          <div className="mk-footer-col">
            <h3>Live Concierge</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--mk-muted)', lineHeight: 1.6 }}>
              Instant answers and appointment scheduling running 24/7 with zero token tax.
            </p>
          </div>
        </div>

        <div className="mk-footer-bottom">
          <span>© {new Date().getFullYear()} {businessName}. All rights reserved.</span>
          <span>{config.footerText || FOOTER.legalNote}</span>
        </div>

        <div className="mk-footer-giant-word" aria-hidden="true">
          <svg viewBox="0 0 1000 195" width="100%" preserveAspectRatio="xMidYMid meet" className="mk-footer-wordmark-svg">
            <text x="50.3%" y="81.5%" textAnchor="middle" className="mk-footer-wordmark-shadow">
              {businessName}
            </text>
            <text x="50%" y="79%" textAnchor="middle" className="mk-footer-wordmark-text">
              {businessName}
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Crescelo Template Component                                           */
/* -------------------------------------------------------------------------- */
export const CresceloTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  onOpenBooking,
  onOpenChat,
}) => {
  const businessName = config.businessName || 'Crescelo';

  // Parse headline into normal and italicized echo
  const rawHeadline = config.heroHeadline?.trim() || 'Answer every visitor. Book the ones who are ready.';
  let line1 = rawHeadline;
  let line2 = '';

  if (rawHeadline.includes('.')) {
    const parts = rawHeadline.split('.');
    line1 = parts[0].trim() + (parts[0].trim() ? '.' : '');
    line2 = parts.slice(1).join('.').trim();
  } else if (rawHeadline.includes('—')) {
    const parts = rawHeadline.split('—');
    line1 = parts[0].trim();
    line2 = parts[1]?.trim() || '';
  }

  const eyebrow = config.badgeText || HERO.eyebrow;
  const leadText = config.heroSubheadline || config.aboutText || config.tagline || HERO.body;
  const ctaPrimary = config.heroCtaText || HERO.primaryCta;

  return (
    <div className="mk">
      <noscript>
        <style>{'.mk-reveal{opacity:1!important;transform:none!important}'}</style>
      </noscript>
      <SmoothScroll />

      {/* Floating Header */}
      <FloatingHeader
        businessName={businessName}
        logoUrl={config.logoUrl}
        onOpenBooking={() => onOpenBooking()}
        onOpenChat={onOpenChat}
      />

      <main id="main">
        {/* Hero Section */}
        <section className="mk-hero" aria-labelledby="mk-hero-title">
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              {eyebrow}
            </p>

            <h1 id="mk-hero-title" className="mk-h1">
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                {line1}
              </span>
              {line2 ? (
                <span className="mk-echo mk-echo-em" style={{ ['--mk-delay' as string]: '360ms' }}>
                  {line2}
                </span>
              ) : null}
            </h1>

            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '520ms', maxWidth: '640px' }}>
              {leadText}
            </p>

            <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '640ms' }}>
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="mk-btn mk-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px' }}
              >
                <Calendar size={16} />
                <span>{ctaPrimary}</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={onOpenChat}
                className="mk-btn mk-btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px' }}
              >
                <MessageSquare size={16} />
                <span>Chat with our assistant</span>
              </button>
            </div>

            <ul className="mk-trust mk-rise" style={{ ['--mk-delay' as string]: '760ms' }}>
              {HERO.trust.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            {/* Prompt Demo with Mascot */}
            <PromptDemo businessName={businessName} onOpenBooking={() => onOpenBooking()} />

            {/* USER EDITABLE HERO IMAGE */}
            {config.heroImageUrl && (
              <div
                className="mk-rise"
                style={{
                  ['--mk-delay' as string]: '880ms',
                  width: '100%',
                  maxWidth: '820px',
                  marginTop: '48px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(8, 37, 26, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--mk-lime)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid rgba(171, 255, 68, 0.4)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 2,
                  }}
                >
                  <Sparkles size={12} />
                  <span>Featured Visual Preview</span>
                </div>
                <img
                  src={config.heroImageUrl}
                  alt={businessName}
                  style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Industry strip */}
        <LogoStrip />

        {/* Problem and Solution Stacked Pinned Section */}
        <ProblemSolution />

        {/* Tools Section */}
        <Tools />

        {/* Behind The Scenes Orbit Stage */}
        <BehindTheScenes />

        {/* Feature Carousel */}
        <FeatureCarousel />

        {/* Interactive Before/After Comparison Demo Slider */}
        <Demo />

        {/* Diagonal Benefits and Architectural Journey */}
        <DiagonalBenefits />
        <Paths />

        {/* Interactive Pipeline Playground */}
        <Playground />

        {/* Dynamic User Services Section */}
        <DynamicServicesSection config={config} onOpenBooking={(id) => onOpenBooking(id)} />

        {/* Dynamic User Testimonials */}
        <DynamicTestimonials config={config} />

        {/* Metrics & Enterprise Trust */}
        <Metrics />
        <IntegrationsStage />
        <Security />

        {/* Comparison Table */}
        <Compare />

        {/* Pricing Tiers */}
        <Pricing />

        {/* FAQ Accordion */}
        <Faq />

        {/* Final CTA Banner */}
        <DynamicFinalCta
          config={config}
          onOpenBooking={() => onOpenBooking()}
          onOpenChat={onOpenChat}
        />
      </main>

      {/* Footer */}
      <DynamicFooter config={config} />
    </div>
  );
};

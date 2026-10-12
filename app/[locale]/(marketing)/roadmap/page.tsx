'use client';

import { T } from '@/lib/i18n/context';
import { useState } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { CheckCircle2, Check } from 'lucide-react';

interface ArchetypePreview {
  name: string;
  slug: string;
  category: string;
  status: 'In Polish' | 'Beta Preview' | 'Candidate';
  tagline: string;
  highlights: string[];
  tone: 'lime' | 'lav' | 'mint' | 'pink' | 'amber';
  icon: string;
}

const ARCHETYPES: ArchetypePreview[] = [
  {
    name: 'Artisanal Barbershop & Grooming',
    slug: 'classic-barbershop',
    category: 'Local Service & Appointments',
    status: 'In Polish',
    tagline: 'Precision chair booking, barber preference selection, and real-time service menu.',
    highlights: ['Multi-barber roster', 'Time-slot availability locks', 'Automated SMS/Email confirmations'],
    tone: 'amber',
    icon: '✂️',
  },
  {
    name: 'Dental & Healthcare Practice',
    slug: 'dental-clinic',
    category: 'Healthcare & Wellness',
    status: 'In Polish',
    tagline: 'New patient intake triage, insurance coverage queries, and doctor consultation routing.',
    highlights: ['HIPAA-conscious knowledge bounds', 'Insurance pre-check capture', 'Emergency vs routine triage'],
    tone: 'mint',
    icon: '🦷',
  },
  {
    name: 'Prestige Legal & Law Firm',
    slug: 'legal-law-firm',
    category: 'Professional Services',
    status: 'In Polish',
    tagline: 'Discreet initial case evaluations, practice area guides, and confidential consultations.',
    highlights: ['Conflict-free intake questionnaires', 'Direct attorney calendar sync', 'Zero token data caching'],
    tone: 'lav',
    icon: '⚖️',
  },
  {
    name: 'Luxury Real Estate & Brokerage',
    slug: 'real-estate',
    category: 'High-Ticket Sales',
    status: 'In Polish',
    tagline: 'Property viewing bookings, price-bracket qualification, and instant agent dispatch.',
    highlights: ['Interactive listing inquiries', 'Buyer vs seller routing', 'Private tour scheduling'],
    tone: 'lime',
    icon: '🏡',
  },
  {
    name: 'Fitness & Athletic Club',
    slug: 'fitness-gym',
    category: 'Health & Memberships',
    status: 'In Polish',
    tagline: 'VIP trial pass acquisition, class timetable queries, and personal trainer booking.',
    highlights: ['1-Day pass lead capture', 'Class capacity checks', 'Membership tier explanation'],
    tone: 'pink',
    icon: '⚡',
  },
  {
    name: 'High-Growth B2B SaaS',
    slug: 'b2b-saas',
    category: 'B2B Software',
    status: 'In Polish',
    tagline: 'Interactive API sandbox answers, enterprise security posture, and AE demo scheduling.',
    highlights: ['SOC2/GDPR compliance answers', 'Team seat pricing calculator', 'Executive calendar locking'],
    tone: 'lav',
    icon: '🚀',
  },
  {
    name: 'Modern E-Commerce Store',
    slug: 'ecommerce-store',
    category: 'Retail & Brands',
    status: 'Beta Preview',
    tagline: 'Order tracking lookup, sizing recommendations, and instant return/refund routing.',
    highlights: ['Order number verification', 'Product catalog search', 'Wholesale inquiry funnel'],
    tone: 'mint',
    icon: '🛍️',
  },
  {
    name: 'Nexus Autonomous AI Platform',
    slug: 'nexus-ai',
    category: 'Deep Tech & Compute',
    status: 'Beta Preview',
    tagline: 'Ultra-fast dark-mode canvas for GPU cluster, API token, and vector orchestration services.',
    highlights: ['Zero-latency code snippets', 'Developer-first terminal theme', 'Custom WebGL aesthetics'],
    tone: 'lime',
    icon: '🔮',
  },
  {
    name: 'Hyperion Global Creative Studio',
    slug: 'hyperion-agency',
    category: 'Design & Agency',
    status: 'Beta Preview',
    tagline: 'High-end design studio showcase with bespoke portfolio cards and project scope estimation.',
    highlights: ['Creative scope questionnaire', 'Client showcase carousels', 'High-ticket budget discovery'],
    tone: 'amber',
    icon: '🎨',
  },
  {
    name: 'Aether Private Wealth & Capital',
    slug: 'aether-finance',
    category: 'Fintech & Capital',
    status: 'Beta Preview',
    tagline: 'Discreet client onboarding for family offices, private equity, and wealth managers.',
    highlights: ['Accredited investor vetting', 'AUM tier qualification', 'Encrypted lead channel'],
    tone: 'lav',
    icon: '🏛️',
  },
  {
    name: 'Crescelo Flagship Experience',
    slug: 'crescelo',
    category: 'AI Platform & Concierge',
    status: 'In Polish',
    tagline: 'Full 1:1 authentic flagship experience with interactive prompt demo, problem stack, and cursor mascot.',
    highlights: ['Cursor mascot tracker', 'Pinned problem card stack', 'Live multi-tab service explorer'],
    tone: 'lime',
    icon: '✨',
  },
];

interface Milestone {
  quarter: string;
  title: string;
  badge: 'Shipped' | 'In Polish' | 'In Development' | 'Planned';
  tone: 'lime' | 'lav' | 'amber' | 'mint';
  description: string;
  items: string[];
}

const MILESTONES: Milestone[] = [
  {
    quarter: 'Available today',
    title: 'The core assistant',
    badge: 'Shipped',
    tone: 'lime',
    description: 'Included in every plan unless the plan says otherwise.',
    items: [
      'Answers from your own documents, with hybrid search and an "I do not know" path that offers a booking or a person',
      'Appointment booking in the chat with slot locking to prevent double bookings',
      'Bring your own AI provider (OpenAI, Anthropic, Google Gemini, Groq, DeepSeek or a self-hosted model) with no markup on usage',
      'Embeddable chat widget, hosted business page and lead capture',
      'Live agent hand-over and notifications',
      'Webhooks, Slack and Google Sheets delivery of leads and bookings',
    ],
  },
  {
    quarter: 'Available, setup required',
    title: 'Channels: WhatsApp and Telegram',
    badge: 'In Polish',
    tone: 'amber',
    description: 'Working, with prerequisites you provide yourself. We call these out so nobody buys expecting more.',
    items: [
      'WhatsApp Cloud API and Telegram bots: you create the accounts and connect the webhooks',
      'Calendar: bookings are exported as a calendar feed you subscribe to; two-way sync with Google Calendar or Outlook is not available yet',
      'Industry starter templates for common service businesses',
    ],
  },
  {
    quarter: 'In development',
    title: 'Deeper calendar and domain support',
    badge: 'In Development',
    tone: 'lav',
    description: 'Work in progress. Dates are goals, not commitments.',
    items: [
      'Two-way Google Calendar and Outlook 365 availability sync',
      'Custom domain mapping for hosted business pages with automatic SSL',
      'Inbound phone assistant (voice calls)',
      'More messaging channels',
    ],
  },
  {
    quarter: 'Planned',
    title: 'Agencies and integrations',
    badge: 'Planned',
    tone: 'mint',
    description: 'On the list, not started. Priorities change with customer feedback.',
    items: [
      'Native two-way sync with HubSpot, Salesforce and Pipedrive',
      'Expanded agency workspace with client provisioning and permissions',
      'Multimodal document intake such as menus and price books',
    ],
  },
];

export default function RoadmapPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'appointments' | 'high-ticket' | 'tech'>('all');

  const filteredArchetypes = ARCHETYPES.filter((a) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'appointments') {
      return a.category.toLowerCase().includes('appointments') || a.category.toLowerCase().includes('healthcare') || a.category.toLowerCase().includes('memberships');
    }
    if (activeFilter === 'high-ticket') {
      return a.category.toLowerCase().includes('high-ticket') || a.category.toLowerCase().includes('professional') || a.category.toLowerCase().includes('finance');
    }
    if (activeFilter === 'tech') {
      return a.category.toLowerCase().includes('software') || a.category.toLowerCase().includes('tech') || a.category.toLowerCase().includes('platform') || a.category.toLowerCase().includes('agency');
    }
    return true;
  });

  return (
    <>
      <Header />
      <main id="main">
        {/* Hero Section */}
        <section className="mk-hero" style={{ marginTop: '16px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              <T>PRODUCT ROADMAP &amp; FEATURE STATUS</T>
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                <T>What works today,</T> <span className="mk-echo-em"><T>and what comes next</T></span>.
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '64ch', marginInline: 'auto', ['--mk-delay' as string]: '320ms' }}>
              <T>A plain list of what is available now, what needs setup on your side, what we are building and what is only planned.
              Last reviewed September 2026.</T>
            </p>

            <div
              className="mk-rise"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '32px',
                padding: '6px 16px',
                borderRadius: '999px',
                background: 'var(--mk-surface)',
                border: '1.5px solid var(--mk-ink)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--mk-ink)',
                ['--mk-delay' as string]: '460ms',
              }}
            >
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span><T>Feature status reviewed September 2026</T></span>
              <span style={{ color: 'var(--mk-muted)' }}>•</span>
              <span style={{ color: 'var(--mk-muted)' }}><T>Zero Token Markup BYOK Architecture</T></span>
            </div>
          </div>
        </section>

        {/* Product Milestones Timeline */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              id="milestones"
              eyebrow="ENGINEERING HORIZON"
              title="Execution timeline & milestones."
              intro="Transparent visibility into what has been delivered, what is being polished in active beta, and what is scheduled next."
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '24px',
                marginTop: '40px',
              }}
            >
              {MILESTONES.map((m, idx) => (
                <Reveal key={m.quarter} delay={idx * 80}>
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: 'clamp(18px, 4vw, 28px)',
                      borderRadius: '16px',
                      border: '1.5px solid var(--mk-ink)',
                      background: 'var(--mk-surface)',
                      boxShadow: m.badge === 'In Polish' ? '0 12px 30px rgba(0,0,0,0.06)' : 'none',
                      position: 'relative',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '16px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--mk-font-mono, monospace)',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            color: 'var(--mk-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          <T>{m.quarter}</T>
                        </span>
                        <span
                          className={`mk-badge mk-badge-${m.tone}`}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            border: '1px solid currentColor',
                          }}
                        >
                          <T>{m.badge}</T>
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'var(--mk-ink)',
                          marginBottom: '10px',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        <T>{m.title}</T>
                      </h3>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--mk-muted)',
                          lineHeight: 1.6,
                          marginBottom: '20px',
                        }}
                      >
                        <T>{m.description}</T>
                      </p>

                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {m.items.map((item, iIdx) => (
                          <li
                            key={iIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              fontSize: '0.85rem',
                              color: 'var(--mk-ink)',
                              lineHeight: 1.45,
                            }}
                          >
                            <span
                              style={{
                                color: m.badge === 'Shipped' ? '#10b981' : m.badge === 'In Polish' ? '#f59e0b' : 'var(--mk-muted)',
                                flexShrink: 0,
                                marginTop: '2px',
                              }}
                            >
                              <CheckCircle2 style={{ width: '15px', height: '15px' }} />
                            </span>
                            <span><T>{item}</T></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Landing Pages Showcase Section */}
        <section id="archetypes" className="mk-section" style={{ background: 'var(--mk-sand)' }}>
          <div className="mk-wrap">
            <div style={{ textAlign: 'center', maxWidth: '720px', marginInline: 'auto', marginBottom: '40px' }}>
              <p className="mk-eyebrow"><T>IN POLISH &amp; BETA TESTING</T></p>
              <h2 className="mk-h2" style={{ marginBottom: '16px' }}>
                <T>Pre-configured industry landing pages.</T>
              </h2>
              <p className="mk-lead" style={{ fontSize: '1.05rem', marginInline: 'auto' }}>
                <T>Each archetype bundles a dedicated high-conversion hosted surface, customized domain knowledge,
                service pricing hierarchies, and calendar booking mutex locks. We are polishing these before wide release.</T>
              </p>

              {/* Category Filter Pills */}
              <div
                style={{
                  display: 'inline-flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '28px',
                }}
              >
                {[
                  { id: 'all', label: 'All 11 Archetypes' },
                  { id: 'appointments', label: 'Appointments & Clinics' },
                  { id: 'high-ticket', label: 'High-Ticket & Legal' },
                  { id: 'tech', label: 'SaaS & Modern Tech' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id as any)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1.5px solid var(--mk-ink)',
                      background: activeFilter === f.id ? 'var(--mk-deep)' : 'var(--mk-surface)',
                      color: activeFilter === f.id ? 'var(--mk-bg)' : 'var(--mk-ink)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <T>{f.label}</T>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Archetypes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '24px',
              }}
            >
              {filteredArchetypes.map((tpl, idx) => (
                <Reveal key={tpl.slug} delay={idx * 50}>
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: 'clamp(16px, 4vw, 24px)',
                      borderRadius: '16px',
                      border: '1.5px solid var(--mk-ink)',
                      background: 'var(--mk-surface)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <div>
                      {/* Top tags row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '14px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--mk-font-mono, monospace)',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'var(--mk-sand)',
                            color: 'var(--mk-muted)',
                            border: '1px solid rgba(0,0,0,0.08)',
                          }}
                        >
                          <T>{tpl.category}</T>
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: tpl.status === 'In Polish' ? '#fef3c7' : '#ecfdf5',
                            color: tpl.status === 'In Polish' ? '#b45309' : '#047857',
                            border: `1px solid ${tpl.status === 'In Polish' ? '#fde68a' : '#a7f3d0'}`,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: tpl.status === 'In Polish' ? '#d97706' : '#10b981',
                            }}
                          />
                          <T>{tpl.status}</T>
                        </span>
                      </div>

                      {/* Header title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{tpl.icon}</span>
                        <h3
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: 'var(--mk-ink)',
                            letterSpacing: '-0.02em',
                            margin: 0,
                          }}
                        >
                          <T>{tpl.name}</T>
                        </h3>
                      </div>

                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--mk-muted)',
                          lineHeight: 1.55,
                          marginBottom: '18px',
                        }}
                      >
                        <T>{tpl.tagline}</T>
                      </p>

                      {/* Bullet highlights */}
                      <div
                        style={{
                          paddingTop: '12px',
                          borderTop: '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mk-muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                          <T>Included Archetype DNA</T>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {tpl.highlights.map((h, hIdx) => (
                            <li
                              key={hIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.82rem',
                                color: 'var(--mk-ink)',
                              }}
                            >
                              <span style={{ color: '#10b981', display: 'flex' }}>
                                <Check style={{ width: '13px', height: '13px' }} />
                              </span>
                              <span><T>{h}</T></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Suggest an Archetype / Community Request */}
        <section className="mk-section">
          <div className="mk-wrap">
            <div
              style={{
                borderRadius: '24px',
                border: '2px solid var(--mk-ink)',
                background: 'var(--mk-surface)',
                padding: 'clamp(20px, 4vw, 48px) clamp(16px, 4vw, 36px)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '36px',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  className="mk-badge mk-badge-lav"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    border: '1px solid currentColor',
                    marginBottom: '16px',
                    display: 'inline-block',
                  }}
                >
                  <T>COMMUNITY VOTING</T>
                </span>
                <h3
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: 'var(--mk-ink)',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  <T>Need a custom domain archetype?</T>
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--mk-muted)', lineHeight: 1.6, maxWidth: '48ch' }}>
                  <T>If your business or agency serves a specialized vertical not listed above, tell our product engineering
                  team. We build and calibrate pre-trained conversational schemas based on partner demand.</T>
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--mk-sand)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    width: '100%',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--mk-ink)', lineHeight: 1.5 }}>
                    <strong><T>Next in queue:</T></strong> <T>Veterinary Clinics, Auto Detailing, Architecture Studios, and CPA Tax Firms.</T>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <ButtonLink href="/support/contact" variant="primary">
                    <T>Request an Industry Archetype</T>
                  </ButtonLink>
                  <ButtonLink href="/product" variant="ghost">
                    <T>Platform Overview</T>
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

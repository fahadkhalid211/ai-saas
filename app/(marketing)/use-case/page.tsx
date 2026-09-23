'use client';

import { useState } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';

interface IndustrySimulation {
  id: string;
  tabLabel: string;
  title: string;
  tagline: string;
  tone: 'lime' | 'lav' | 'mint' | 'pink' | 'amber';
  avgTicket: number;
  bottleneck: string;
  solution: string;
  metric: string;
  metricLabel: string;
  features: string[];
  chat: {
    customerMsg: string;
    botMsg: string;
    sourceTag: string;
    serviceName: string;
    suggestedSlots: string[];
    bookedSlot: string;
    staffName: string;
  };
}

const INDUSTRIES: IndustrySimulation[] = [
  {
    id: 'salons',
    tabLabel: '✂️ Salons & Barbershops',
    title: 'Salons, Spas & Barbershops',
    tagline: 'Never miss a booking while your hands are busy with a client.',
    tone: 'lime',
    avgTicket: 65,
    bottleneck:
      'Stylists lose hundreds in daily revenue because they cannot answer phone calls or Instagram DMs while holding shears or mixing color.',
    solution:
      'Crescelo acts as your digital front desk 24/7. It explains service menus, checks live chair availability, allows clients to pick their stylist, and locks the slot with SMS confirmations.',
    metric: '+42%',
    metricLabel: 'Increase in after-hours appointment revenue',
    features: [
      'In-chat & inbound phone voice booking',
      'Stylist-specific calendar assignment',
      'Atomic mutex lock prevents chair double-booking',
      'Self-service reschedule & cancellation links',
    ],
    chat: {
      customerMsg: 'Hey! Do you have any openings for a skin fade and beard trim tomorrow around 3 PM?',
      botMsg:
        'Marcus has an open slot at 3:15 PM and Elena has one at 3:45 PM tomorrow. Would you like me to reserve Marcus at 3:15 PM?',
      sourceTag: 'Barbershop Services & Pricing Schedule v4',
      serviceName: 'Skin Fade + Beard Trim (45m)',
      suggestedSlots: ['3:15 PM (Marcus)', '3:45 PM (Elena)', '4:30 PM (Marcus)'],
      bookedSlot: 'Tomorrow at 3:15 PM with Marcus',
      staffName: 'Marcus Vance',
    },
  },
  {
    id: 'clinics',
    tabLabel: '🩺 Healthcare & Wellness',
    title: 'Healthcare & Wellness Clinics',
    tagline: 'Relieve front-desk burnout with verified intake answers.',
    tone: 'lav',
    avgTicket: 180,
    bottleneck:
      'Receptionists spend 60% of their workday repeating parking directions, pre-visit fasting instructions, and accepted insurance plans.',
    solution:
      'Grounded strictly in verified medical practice documents, Crescelo triages inquiries, answers preparation questions without hallucinating, and reserves consultation slots on doctor schedules.',
    metric: '18 hrs',
    metricLabel: 'Reclaimed weekly per clinic location',
    features: [
      'Strict grounding (never invents clinical advice)',
      'Pre-visit intake questionnaire collection',
      'Instant escalation routing to nursing staff',
      'Syncs directly to Outlook and Google Calendar',
    ],
    chat: {
      customerMsg: 'Do I need to fast before my comprehensive metabolic blood panel tomorrow morning?',
      botMsg:
        'Yes. Our clinical protocol requires an 8-hour water-only fast before metabolic panels. You can take your routine morning medications with water.',
      sourceTag: 'Clinical Laboratory Prep Guidelines 2026',
      serviceName: 'Comprehensive Metabolic Panel + Consult',
      suggestedSlots: ['8:30 AM', '9:15 AM', '10:00 AM'],
      bookedSlot: 'Tomorrow at 8:30 AM with Dr. Aris',
      staffName: 'Dr. Aris Chen, MD',
    },
  },
  {
    id: 'real-estate',
    tabLabel: '🏡 Real Estate & Property',
    title: 'Real Estate & Property Management',
    tagline: 'Qualify buyers and schedule property showings instantly.',
    tone: 'mint',
    avgTicket: 450,
    bottleneck:
      'Prospective buyers browse listings at night. If an inquiry sits unanswered until morning, they contact another agent and the viewing is lost.',
    solution:
      'Crescelo qualifies buyer budget, financing status, and move-in timeline right in chat or over phone, instantly booking a private tour on the agent’s calendar.',
    metric: '3.4×',
    metricLabel: 'Faster response to high-intent buyer inquiries',
    features: [
      'Automated buyer & tenant qualification',
      'Direct scheduling for open houses & private viewings',
      'Instant CRM lead push with complete conversation brief',
      'WhatsApp and SMS notifications to field agents',
    ],
    chat: {
      customerMsg: 'I saw the 2-bed loft on 4th Street. Can I schedule a private tour this Saturday?',
      botMsg:
        'The 4th Street loft is available for private showings this Saturday between 11:00 AM and 2:00 PM. Are you currently pre-approved for financing?',
      sourceTag: 'Property Listing Sheet #849-4th',
      serviceName: 'Private Showing: Loft #402',
      suggestedSlots: ['Sat 11:30 AM', 'Sat 1:00 PM', 'Sat 2:15 PM'],
      bookedSlot: 'Saturday at 11:30 AM with Sarah',
      staffName: 'Sarah Jenkins (Broker)',
    },
  },
  {
    id: 'fitness',
    tabLabel: '⚡ Fitness & Personal Training',
    title: 'Fitness Studios & Gyms',
    tagline: 'Turn casual website visitors into trial class attendees.',
    tone: 'pink',
    avgTicket: 95,
    bottleneck:
      'Potential members abandon gym websites when class schedules are buried in PDFs or membership inquiries require waiting for a callback.',
    solution:
      'Visitors choose a workout time, confirm their fitness goals, and lock in a trial class reservation in under 45 seconds with automated reminder sequences.',
    metric: '$14,200',
    metricLabel: 'Monthly recovered revenue from dropped signups',
    features: [
      'Live class timetable lookup & slot reservation',
      'Membership tier explanation with zero token markup',
      'Personal trainer calendar synchronization',
      'Automated SMS reminders to reduce trial no-shows',
    ],
    chat: {
      customerMsg: 'What time is your introductory HIIT class on Wednesday? Can beginners attend?',
      botMsg:
        'Introductory HIIT is on Wednesday at 6:30 PM with Coach Tyler. It is beginner-friendly with low-impact modifications. Would you like to reserve a guest trial spot?',
      sourceTag: 'Studio Class Schedule & Instructor Roster',
      serviceName: 'Introductory HIIT Trial Class',
      suggestedSlots: ['Wed 6:30 PM', 'Thu 7:00 AM', 'Sat 9:30 AM'],
      bookedSlot: 'Wednesday at 6:30 PM with Coach Tyler',
      staffName: 'Coach Tyler Stone',
    },
  },
  {
    id: 'legal',
    tabLabel: '⚖️ Legal & Financial Advisory',
    title: 'Legal, Accounting & Advisory',
    tagline: 'Pre-screen retainer inquiries and book paid initial consultations.',
    tone: 'amber',
    avgTicket: 350,
    bottleneck:
      'Partners waste valuable billable hours fielding general inquiries and manual intake calls from unqualified leads.',
    solution:
      'Crescelo conducts preliminary conflict checks, answers standard retainer and fee questions from verified documents, and books paid initial consultations.',
    metric: '22 hrs',
    metricLabel: 'Senior partner billable time saved monthly',
    features: [
      'Conflict-free preliminary case screening',
      'Retainer and consultation booking workflow',
      'Secure document collection upload links',
      'Direct human escort with full brief to partners',
    ],
    chat: {
      customerMsg: 'We need advice on an intellectual property licensing agreement. What is your consultation fee?',
      botMsg:
        'Initial corporate IP consultations are 45 minutes at a flat fee of $350. Partner David Vance has slots available this Thursday. Shall I book your intake call?',
      sourceTag: 'Law Firm Fee Schedule & Practice Areas',
      serviceName: 'Corporate IP Consultation (45m)',
      suggestedSlots: ['Thu 2:00 PM', 'Thu 4:30 PM', 'Fri 10:00 AM'],
      bookedSlot: 'Thursday at 2:00 PM with David Vance',
      staffName: 'David Vance, Esq.',
    },
  },
  {
    id: 'saas',
    tabLabel: '🚀 B2B SaaS & Tech',
    title: 'B2B SaaS & Tech Startups',
    tagline: 'Replace static demo forms with instant live pipeline scheduling.',
    tone: 'lime',
    avgTicket: 800,
    bottleneck:
      'High-intent enterprise prospects bounce when forced to fill out a 10-field static demo form and wait 2 business days for SDR outreach.',
    solution:
      'Crescelo answers deep architectural and security questions from your API docs, verifies company size and budget, and books a live demo on your AE’s calendar in seconds.',
    metric: '58%',
    metricLabel: 'Increase in completed discovery demos',
    features: [
      'Deep architectural Q&A from uploaded API manuals',
      'Automated company size & budget tiering',
      'Round-robin Account Executive calendar booking',
      'Direct lead payload push into HubSpot & Salesforce',
    ],
    chat: {
      customerMsg: 'Do you support self-hosted PostgreSQL and SOC2 Type II compliance?',
      botMsg:
        'Yes. We support self-hosted PostgreSQL with pgvector, and our platform is fully SOC2 Type II certified with zero third-party data retention.',
      sourceTag: 'Security Whitepaper & Architecture Specs v3.2',
      serviceName: 'Enterprise Architecture Discovery (30m)',
      suggestedSlots: ['Today 4:00 PM', 'Tomorrow 11:00 AM', 'Tomorrow 3:00 PM'],
      bookedSlot: 'Tomorrow at 11:00 AM with Solutions Team',
      staffName: 'Rachel Adams (Solutions Architect)',
    },
  },
];

export default function UseCasePage() {
  const [activeTabId, setActiveTabId] = useState('salons');
  const [inquiryCount, setInquiryCount] = useState(120);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [isBooked, setIsBooked] = useState(false);

  const activeIndustry = INDUSTRIES.find((ind) => ind.id === activeTabId) || INDUSTRIES[0];

  // Dynamic ROI Calculations
  const hoursSaved = Math.round(inquiryCount * 0.16);
  const recoveredRevenue = Math.round(inquiryCount * 0.24 * activeIndustry.avgTicket);

  return (
    <>
      <Header />
      <main id="main">
        {/* Solutions Hero */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              VIRTUAL TEAMMATES
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                Tailored for your domain. <span className="mk-echo-em">Trained</span> on your rules.
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '320ms' }}>
              A website assistant should never act like a generic chatbot. Crescelo adapts its
              cadence and booking workflow to the operational realities of your specific industry.
            </p>
            <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}>Deploy your virtual teammate</ButtonLink>
              <ButtonLink href="/pricing" variant="ghost">
                Compare plans
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Interactive Industry Cockpit Section */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Interactive Simulation"
              title="Select your industry to test the operational workflow."
              intro="Watch how Crescelo resolves complex inquiries, validates availability, and locks appointment slots without human friction."
              id="solutions-list"
              align="center"
            />

            {/* Industry Pill Navigation */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '36px',
                marginBottom: '40px',
              }}
            >
              {INDUSTRIES.map((ind) => {
                const isActive = ind.id === activeIndustry.id;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    className={`mk-cockpit-tab ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setActiveTabId(ind.id);
                      setIsBooked(false);
                      setSelectedSlotIndex(0);
                    }}
                  >
                    {ind.tabLabel}
                  </button>
                );
              })}
            </div>

            {/* Interactive Simulation Stage */}
            <Reveal
              className="mk-card"
              style={{
                padding: '40px',
                background: 'var(--mk-surface)',
                boxShadow: '0 8px 0 var(--mk-ink)',
                border: '2px solid var(--mk-ink)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '48px',
                  alignItems: 'center',
                }}
              >
                {/* Left Side: Domain Strategy & Metrics */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: 'var(--mk-lime)',
                        color: 'var(--mk-deep)',
                      }}
                    >
                      Industry Profile
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-accent)' }}>
                      Average Ticket ~ ${activeIndustry.avgTicket}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--mk-serif)',
                      fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                      lineHeight: 1.1,
                      margin: '0 0 12px',
                    }}
                  >
                    {activeIndustry.title}
                  </h3>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mk-ink)', marginBottom: '16px' }}>
                    {activeIndustry.tagline}
                  </p>

                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: 'var(--mk-lav)',
                      border: '1.5px solid var(--mk-ink)',
                      marginBottom: '20px',
                      fontSize: '14px',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ display: 'block', color: 'var(--mk-deep)', marginBottom: '4px' }}>
                      ⚠️ The Costly Bottleneck:
                    </strong>
                    {activeIndustry.bottleneck}
                  </div>

                  <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--mk-muted)', marginBottom: '24px' }}>
                    {activeIndustry.solution}
                  </p>

                  {/* Impact Metric Banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '12px',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      background: 'var(--mk-deep)',
                      color: 'var(--mk-bg)',
                      border: '1.5px solid var(--mk-ink)',
                      marginBottom: '24px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--mk-serif)',
                        fontSize: '2.8rem',
                        fontWeight: 400,
                        color: 'var(--mk-lime)',
                        lineHeight: 1,
                      }}
                    >
                      {activeIndustry.metric}
                    </span>
                    <span style={{ fontSize: '13.5px', color: '#cfe3d6' }}>
                      {activeIndustry.metricLabel}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul style={{ display: 'grid', gap: '8px', padding: 0, listStyle: 'none' }}>
                    {activeIndustry.features.map((feat, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <span style={{ color: 'var(--mk-accent)', fontWeight: 800 }}>✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Side: Interactive Dialogue & Booking Flow */}
                <div
                  style={{
                    borderRadius: '24px',
                    border: '2px solid var(--mk-ink)',
                    background: 'var(--mk-bg)',
                    padding: '24px',
                    boxShadow: '0 6px 0 var(--mk-ink)',
                    display: 'grid',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1.5px solid var(--mk-line)',
                      paddingBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--mk-lime)', border: '1px solid var(--mk-ink)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>Live Assistant Simulation</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--mk-muted)', background: 'var(--mk-surface)', padding: '2px 8px', borderRadius: '999px', border: '1px solid var(--mk-ink)' }}>
                      Verified Grounding
                    </span>
                  </div>

                  {/* Customer Message */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: '16px 16px 4px 16px',
                        background: 'var(--mk-deep)',
                        color: 'var(--mk-bg)',
                        fontSize: '14px',
                        lineHeight: 1.4,
                      }}
                    >
                      {activeIndustry.chat.customerMsg}
                    </div>
                  </div>

                  {/* Assistant Message */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                    <div
                      style={{
                        maxWidth: '90%',
                        padding: '14px 16px',
                        borderRadius: '16px 16px 16px 4px',
                        background: 'var(--mk-surface)',
                        border: '1.5px solid var(--mk-ink)',
                        fontSize: '14px',
                        lineHeight: 1.5,
                      }}
                    >
                      <p style={{ margin: 0 }}>{activeIndustry.chat.botMsg}</p>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          color: 'var(--mk-accent)',
                          fontWeight: 600,
                          marginTop: '8px',
                        }}
                      >
                        📄 Source: {activeIndustry.chat.sourceTag}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Slot Picker */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: 'var(--mk-surface)',
                      border: '1.5px solid var(--mk-ink)',
                      display: 'grid',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px' }}>Available Slots (Real-time Mutex Sync):</strong>
                      <span style={{ fontSize: '11px', color: 'var(--mk-muted)' }}>Click to pick</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeIndustry.chat.suggestedSlots.map((slot, i) => {
                        const isSelected = selectedSlotIndex === i;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedSlotIndex(i);
                              setIsBooked(false);
                            }}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '999px',
                              fontSize: '13px',
                              fontWeight: 700,
                              border: '1.5px solid var(--mk-ink)',
                              background: isSelected ? 'var(--mk-deep)' : 'var(--mk-bg)',
                              color: isSelected ? 'var(--mk-lime)' : 'var(--mk-ink)',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>

                    {/* Booking Confirmation Action */}
                    {!isBooked ? (
                      <button
                        type="button"
                        onClick={() => setIsBooked(true)}
                        className="mk-btn mk-btn-primary"
                        style={{ width: '100%', minHeight: '42px', fontSize: '14px' }}
                      >
                        Confirm Booking for {activeIndustry.chat.suggestedSlots[selectedSlotIndex]} →
                      </button>
                    ) : (
                      <div
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          background: 'var(--mk-lime-soft)',
                          border: '1.5px solid var(--mk-ink)',
                          textAlign: 'center',
                          animation: 'mk-rise 0.4s ease both',
                        }}
                      >
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--mk-deep)' }}>
                          ✓ Appointment Confirmed & Locked!
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mk-ink)' }}>
                          Syncing to {activeIndustry.chat.staffName}&apos;s Google Calendar • SMS dispatched.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Interactive ROI & Hours-Saved Calculator */}
        <section className="mk-section mk-section-tint">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Value Calculator"
              title="Estimate what your business reclaims with Crescelo."
              intro="Adjust your estimated weekly inquiry and phone call volume to see the real impact on your schedule and revenue."
              id="calculator-title"
              align="center"
            />

            <Reveal
              className="mk-card"
              style={{
                maxWidth: '780px',
                margin: '36px auto 0',
                padding: '36px',
                background: 'var(--mk-surface)',
                border: '2px solid var(--mk-ink)',
                boxShadow: '0 6px 0 var(--mk-ink)',
              }}
            >
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                  <label htmlFor="inquiry-slider" style={{ fontSize: '16px', fontWeight: 700 }}>
                    Weekly Inquiries & Phone Calls:
                  </label>
                  <span
                    style={{
                      fontFamily: 'var(--mk-serif)',
                      fontSize: '2rem',
                      fontWeight: 600,
                      color: 'var(--mk-deep)',
                    }}
                  >
                    {inquiryCount} / week
                  </span>
                </div>

                <input
                  id="inquiry-slider"
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={inquiryCount}
                  onChange={(e) => setInquiryCount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    accentColor: 'var(--mk-deep)',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--mk-muted)', marginTop: '6px' }}>
                  <span>20 inquiries (Solo practitioner)</span>
                  <span>250 inquiries (Active studio)</span>
                  <span>500+ inquiries (Multi-location)</span>
                </div>
              </div>

              {/* Calculator Output Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'var(--mk-bg)',
                    border: '1.5px solid var(--mk-ink)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mk-muted)' }}>
                    Staff Time Reclaimed
                  </span>
                  <div style={{ fontFamily: 'var(--mk-serif)', fontSize: '2.4rem', color: 'var(--mk-deep)', margin: '8px 0 4px' }}>
                    {hoursSaved} hrs
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--mk-muted)' }}>per month</span>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'var(--mk-bg)',
                    border: '1.5px solid var(--mk-ink)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mk-muted)' }}>
                    Recovered Revenue
                  </span>
                  <div style={{ fontFamily: 'var(--mk-serif)', fontSize: '2.4rem', color: 'var(--mk-deep)', margin: '8px 0 4px' }}>
                    ${recoveredRevenue.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--mk-muted)' }}>from missed calls & night traffic</span>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-bg)',
                    border: '1.5px solid var(--mk-ink)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mk-lime)' }}>
                    After-Hours Booking Rate
                  </span>
                  <div style={{ fontFamily: 'var(--mk-serif)', fontSize: '2.4rem', color: 'var(--mk-lime)', margin: '8px 0 4px' }}>
                    94.2%
                  </div>
                  <span style={{ fontSize: '12px', color: '#cfe3d6' }}>instant slot locking</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mk-final" aria-labelledby="mk-final-title" style={{ marginTop: '32px' }}>
          <div className="mk-wrap">
            <Reveal className="mk-final-inner">
              <h2 id="mk-final-title" className="mk-h2 mk-h2-wide">
                Start capturing appointments 24 hours a day.
              </h2>
              <p className="mk-lead">
                Join forward-thinking studios, clinics, and service businesses that run autonomous front desks with Crescelo.
              </p>
              <div className="mk-cta-row">
                <ButtonLink href={SIGNUP_HREF}>Start your 14-day trial</ButtonLink>
                <ButtonLink href="/support/contact" variant="ghost">
                  Schedule onboarding call
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

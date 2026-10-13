'use client';

import { T } from '@/lib/i18n/context';
import { useEffect, useState } from 'react';
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
      'Crescelo acts as your digital front desk 24/7. It explains service menus, shows open times from your opening hours, and holds the slot while the client books. A confirmation email with a reschedule link goes out automatically.',
    metric: '24/7',
    metricLabel: 'prices, hours and open slots, even mid-haircut',
    features: [
      'In-chat booking (phone voice coming soon)',
      'Calendly or Cal.com links for each stylist',
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
      'Receptionists spend much of the day repeating parking directions, pre-visit fasting instructions, and accepted insurance plans.',
    solution:
      'Crescelo answers preparation questions from your own practice documents, says so when it does not know, and offers consultation times.',
    metric: '1 click',
    metricLabel: 'for your team to take over any conversation',
    features: [
      'Answers only from your documents and says when it does not know',
      'Contact details and questions captured as a lead',
      'Handover to your team with the whole conversation',
      'Bookings appear in a calendar feed for Google, Apple or Outlook',
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
      'Crescelo asks about budget, financing and move-in timeline in the chat, and offers viewing times through your booking link or the built-in slot picker.',
    metric: 'Any hour',
    metricLabel: 'enquiries are answered and viewing times offered',
    features: [
      'Buyer and tenant questions asked in the chat',
      'Viewing times through your booking link or the slot picker',
      'Leads sent to email, Slack, Google Sheets or a webhook with the conversation',
      'Email and Slack alerts for new leads',
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
      'Visitors ask about classes and pricing, choose a time and reserve a trial class in the chat, and get a reminder by email.',
    metric: '1 line',
    metricLabel: 'of code puts the assistant on your website',
    features: [
      'Class timetable answers and trial-class booking',
      'Membership tiers explained from your own price list',
      'Booking links for each trainer (Calendly or Cal.com)',
      'Email reminders before the trial class',
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
      'Crescelo answers standard retainer and fee questions from your documents, collects the details you ask for and offers consultation times. Complex or sensitive matters go to a person.',
    metric: '14 days',
    metricLabel: 'free trial to test it on your own documents',
    features: [
      'First-round questions answered from your fee and practice documents',
      'Consultation booking through the slot picker or your booking link',
      'Contact details and matter summary captured as a lead',
      'Handover to a person with the whole conversation',
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
      'Crescelo answers product and security questions from your docs, asks about company size and needs, and offers demo times through your Calendly or Cal.com link.',
    metric: '0%',
    metricLabel: 'markup on AI usage when you bring your own key',
    features: [
      'Product Q&A from your uploaded docs and pages',
      'Company size and needs captured as lead fields',
      'Demo booking through your Calendly or Cal.com link',
      'Leads sent to Slack, Google Sheets or any CRM through a webhook',
    ],
    chat: {
      customerMsg: 'Do you have SOC2 Type II compliance?',
      botMsg:
        'Not at this time. We do not hold a SOC 2 report and do not claim any compliance certification. Our security page lists exactly which controls are in place today.',
      sourceTag: 'Security Whitepaper & Architecture Specs v3.2',
      serviceName: 'Enterprise Architecture Discovery (30m)',
      suggestedSlots: ['Today 4:00 PM', 'Tomorrow 11:00 AM', 'Tomorrow 3:00 PM'],
      bookedSlot: 'Tomorrow at 11:00 AM with Solutions Team',
      staffName: 'Rachel Adams (Solutions Architect)',
    },
  },
  {
    id: 'ecommerce',
    tabLabel: '🛍️ E-Commerce & Retail',
    title: 'E-Commerce & Online Stores',
    tagline: 'Convert hesitant shoppers and eliminate pre-purchase doubts.',
    tone: 'pink',
    avgTicket: 85,
    bottleneck:
      'Shoppers abandon carts late at night when sizing charts, shipping policies, or ingredient lists require digging through confusing pages.',
    solution:
      'Crescelo answers sizing, material, delivery and return questions from your own product pages and policies, and points visitors to the right product.',
    metric: 'Any page',
    metricLabel: 'one script tag adds the chat to your site',
    features: [
      'Instant catalog & product specification search',
      'Shipping and returns policies explained from your own pages',
      'Product recommendations from your catalog',
      'Product cards with links (WordPress and WooCommerce plugin)',
    ],
    chat: {
      customerMsg: 'Are the organic cotton hoodies preshrunk? What is your return window?',
      botMsg:
        'Yes! All our organic cotton hoodies are pre-washed and pre-shrunk so they stay true to size. We also provide hassle-free 30-day free returns with prepaid shipping labels.',
      sourceTag: 'Store Catalog & Sizing/Returns Policy v2',
      serviceName: 'Premium Organic Hoodie (M / Charcoal)',
      suggestedSlots: ['Add to Cart ($78)', 'View Size Chart', 'Order Tracking'],
      bookedSlot: 'Added to Cart with 30-day guarantee',
      staffName: 'Apex Store Concierge',
    },
  },
  {
    id: 'trades',
    tabLabel: '🔨 Contractors & Home Services',
    title: 'Roofing, Plumbing & Contractors',
    tagline: 'Capture job specs and book on-site estimates while on the ladder.',
    tone: 'mint',
    avgTicket: 1200,
    bottleneck:
      'Contractors are driving or on job sites all day. Homeowners with emergency leaks or renovations call whichever contractor responds first.',
    solution:
      'Crescelo separates emergencies from routine jobs, gathers the job details you ask for, answers service-area questions from your documents and offers estimate times.',
    metric: 'Instant',
    metricLabel: 'lead alert by email or Slack when a job comes in',
    features: [
      'Service-area questions answered from your coverage document',
      'Project scope & damage description intake',
      'On-site estimate inspection scheduling',
      'Instant email or Slack alerts for new leads',
    ],
    chat: {
      customerMsg: 'We had storm damage last night and a shingle blew off our roof. Do you service North Austin for roof inspections?',
      botMsg:
        'Yes, North Austin is within our primary service zone! For storm damage, we can send an inspector tomorrow to perform a 21-point roof check. Would 10:00 AM or 1:30 PM work best for you?',
      sourceTag: 'Service Area Map & Storm Damage Protocol 2026',
      serviceName: 'On-Site 21-Point Roof Inspection',
      suggestedSlots: ['Tomorrow 10:00 AM', 'Tomorrow 1:30 PM', 'Thursday 9:00 AM'],
      bookedSlot: 'Tomorrow at 10:00 AM with Mark',
      staffName: 'Mark Miller (Lead Inspector)',
    },
  },
  {
    id: 'restaurants',
    tabLabel: '🍽️ Restaurants & Dining',
    title: 'Restaurants, Lounges & Catering',
    tagline: 'Book dining reservations and answer dietary menus instantly.',
    tone: 'amber',
    avgTicket: 110,
    bottleneck:
      'Hosts and servers cannot answer phone calls during peak lunch and dinner rushes, causing parties of 6+ to reserve at rival venues.',
    solution:
      'Crescelo answers wine lists, dietary substitutions and private-dining questions from your real menu, takes reservation requests and collects private-dining enquiries as leads.',
    metric: 'Rush hour',
    metricLabel: 'questions still get answered while the team is busy',
    features: [
      'Reservation requests with party size and time',
      'Dietary & allergen menu verification',
      'Private dining & catering lead capture',
      'Confirmation email with a link to change or cancel',
    ],
    chat: {
      customerMsg: 'Do you have gluten-free options and can we reserve a table for 5 this Friday at 7:30 PM?',
      botMsg:
        'Yes! Over 60% of our dinner menu is gluten-free or can be prepared gluten-free upon request. We have an open booth for 5 this Friday at 7:30 PM. Shall I reserve it under your name?',
      sourceTag: 'Evening Dining Menu & Allergen Guide v5',
      serviceName: 'Table Reservation (5 Guests)',
      suggestedSlots: ['Fri 7:15 PM', 'Fri 7:30 PM', 'Fri 8:00 PM'],
      bookedSlot: 'Friday at 7:30 PM for 5 guests',
      staffName: 'Host Desk (Main Dining Room)',
    },
  },
];

export default function UseCasePage() {
  const [activeTabId, setActiveTabId] = useState('salons');

  // Direct links such as /use-case#clinics (the footer uses these) open that industry, on a fresh visit and when the hash changes.
  useEffect(() => {
    const alias: Record<string, string> = { startups: 'saas', contractors: 'trades', retail: 'ecommerce', barbershops: 'salons', dining: 'restaurants' };
    const apply = () => {
      const raw = decodeURIComponent(window.location.hash.replace('#', ''));
      const id = alias[raw] ?? raw;
      if (INDUSTRIES.some((ind) => ind.id === id)) {
        setActiveTabId(id);
        requestAnimationFrame(() => document.getElementById('solutions-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);
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
              <T>BUILT FOR YOUR BUSINESS</T>
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                <T>Your industry. Your rules.</T> <span className="mk-echo-em"><T>Your assistant.</T></span>
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '320ms' }}>
              <T>Crescelo is not a generic chatbot. It learns from your content, speaks your terminology, and follows your specific booking workflow — from salons and clinics to law firms and SaaS companies.</T>
            </p>
            <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
              <ButtonLink href="/pricing" variant="ghost">
                <T>Compare plans</T>
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Interactive Industry Cockpit Section */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="See it in action"
              title="Pick your industry and watch it work."
              intro="Select your business type below to see how Crescelo handles a real enquiry — from the opening question to a confirmed booking."
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
                    id={ind.id}
                    type="button"
                    className={`mk-cockpit-tab ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setActiveTabId(ind.id);
                      setIsBooked(false);
                      setSelectedSlotIndex(0);
                    }}
                  >
                    <T>{ind.tabLabel}</T>
                  </button>
                );
              })}
            </div>

            {/* Interactive Simulation Stage */}
            <Reveal
              className="mk-card"
              style={{
                padding: 'clamp(18px, 4vw, 40px)',
                background: 'var(--mk-surface)',
                boxShadow: '0 8px 0 var(--mk-ink)',
                border: '2px solid var(--mk-ink)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                  gap: 'clamp(20px, 3.5vw, 48px)',
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
                      <T>Industry Profile</T>
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-accent)' }}>
                      <T>Average Ticket ~ $</T><T>{activeIndustry.avgTicket}</T>
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
                    <T>{activeIndustry.title}</T>
                  </h3>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mk-ink)', marginBottom: '16px' }}>
                    <T>{activeIndustry.tagline}</T>
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
                      <T>⚠️ The Costly Bottleneck:</T>
                    </strong>
                    <T>{activeIndustry.bottleneck}</T>
                  </div>

                  <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--mk-muted)', marginBottom: '24px' }}>
                    <T>{activeIndustry.solution}</T>
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
                      <T>{activeIndustry.metric}</T>
                    </span>
                    <span style={{ fontSize: '13.5px', color: '#cfe3d6' }}>
                      <T>{activeIndustry.metricLabel}</T>
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul style={{ display: 'grid', gap: '8px', padding: 0, listStyle: 'none' }}>
                    {activeIndustry.features.map((feat, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <span style={{ color: 'var(--mk-accent)', fontWeight: 800 }}>✓</span>
                        <span><T>{feat}</T></span>
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
                    padding: 'clamp(16px, 3.5vw, 24px)',
                    boxShadow: '0 6px 0 var(--mk-ink)',
                    maxWidth: '100%',
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
                      <span style={{ fontSize: '13px', fontWeight: 700 }}><T>Live Assistant Simulation</T></span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--mk-muted)', background: 'var(--mk-surface)', padding: '2px 8px', borderRadius: '999px', border: '1px solid var(--mk-ink)' }}>
                      <T>Verified Grounding</T>
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
                      <T>{activeIndustry.chat.customerMsg}</T>
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
                      <p style={{ margin: 0 }}><T>{activeIndustry.chat.botMsg}</T></p>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          color: 'var(--mk-accent)',
                          fontWeight: 600,
                          marginTop: '8px',
                        }}
                      >
                        <T>📄 Source:</T> <T>{activeIndustry.chat.sourceTag}</T>
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
                      <strong style={{ fontSize: '13px' }}><T>Available Slots (Real-time Mutex Sync):</T></strong>
                      <span style={{ fontSize: '11px', color: 'var(--mk-muted)' }}><T>Click to pick</T></span>
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
                            <T>{slot}</T>
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
                        <T>Confirm Booking for</T> <T>{activeIndustry.chat.suggestedSlots[selectedSlotIndex]}</T> →
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
                          <T>✓ Booking confirmed (sample conversation)</T>
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--mk-ink)' }}>
                          <T>Booked with</T> <T>{activeIndustry.chat.staffName}</T><T>. Confirmation email sent.</T>
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
                    <T>Weekly Inquiries & Phone Calls:</T>
                  </label>
                  <span
                    style={{
                      fontFamily: 'var(--mk-serif)',
                      fontSize: '2rem',
                      fontWeight: 600,
                      color: 'var(--mk-deep)',
                    }}
                  >
                    <T>{inquiryCount}</T> <T>/ week</T>
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
                  <span><T>20 inquiries (Solo practitioner)</T></span>
                  <span><T>250 inquiries (Active studio)</T></span>
                  <span><T>500+ inquiries (Multi-location)</T></span>
                </div>
              </div>

              {/* Calculator Output Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
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
                    <T>Estimated Staff Time Reclaimed</T>
                  </span>
                  <div style={{ fontFamily: 'var(--mk-serif)', fontSize: '2.4rem', color: 'var(--mk-deep)', margin: '8px 0 4px' }}>
                    <T>{hoursSaved}</T> <T>hrs</T>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--mk-muted)' }}><T>per month</T></span>
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
                    <T>Estimated Recovered Revenue</T>
                  </span>
                  <div style={{ fontFamily: 'var(--mk-serif)', fontSize: '2.4rem', color: 'var(--mk-deep)', margin: '8px 0 4px' }}>
                    ${recoveredRevenue.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--mk-muted)' }}><T>if 24% of enquiries would have booked at the average ticket</T></span>
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
                    <T>How this is estimated</T>
                  </span>
                  <div style={{ fontSize: '13px', color: '#cfe3d6', margin: '10px 0 0', lineHeight: 1.5, textAlign: 'left' }}>
                    <T>An illustration, not a forecast. It assumes about 10 minutes saved per enquiry and that 24% of enquiries would have booked. Change the slider to match your volume, and judge the result against your own numbers.</T>
                  </div>
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
                <T>Start capturing appointments 24 hours a day.</T>
              </h2>
              <p className="mk-lead">
                <T>Try it on your own documents in the playground, or start the 14-day free trial.</T>
              </p>
              <div className="mk-cta-row">
                <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
                <ButtonLink href="/support/contact" variant="ghost">
                  <T>Schedule onboarding call</T>
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

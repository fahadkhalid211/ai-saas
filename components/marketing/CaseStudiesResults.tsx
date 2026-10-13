'use client';

import { T } from '@/lib/i18n/context';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, TrendingUp, Clock, CalendarCheck, Quote, Sparkles, Scissors, Stethoscope, Building2, ShoppingBag } from 'lucide-react';
import { ButtonLink, Reveal, SectionHead } from './ui';
import { SIGNUP_HREF } from './content';

interface CaseStudy {
  id: string;
  tabLabel: string;
  icon: any;
  businessName: string;
  businessType: string;
  headline: string;
  subheadline: string;
  primaryStat: { value: string; label: string };
  secondaryStats: Array<{ value: string; label: string }>;
  before: {
    title: string;
    description: string;
    painPoints: string[];
  };
  after: {
    title: string;
    description: string;
    benefits: string[];
  };
  quote: {
    text: string;
    author: string;
    role: string;
    location: string;
  };
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'barbershop',
    tabLabel: 'Salons & Barbershops',
    icon: Scissors,
    businessName: 'The Noble Barber & Lounge',
    businessType: '5-Chair Barbershop & Grooming Studio',
    headline: 'From 35 Missed Calls Weekly to 42% More Booked Appointments',
    subheadline: 'How a busy barbershop captured $2,400/month in after-hours bookings without picking up the phone mid-haircut.',
    primaryStat: { value: '+42%', label: 'Appointment Revenue' },
    secondaryStats: [
      { value: '84%', label: 'After-Hours Visitors Booked' },
      { value: '0', label: 'Double-Bookings' },
      { value: '$2,400', label: 'Extra Monthly Revenue' },
    ],
    before: {
      title: 'Before Crescelo: Hands Busy, Chairs Empty',
      description: 'Stylists were constantly holding shears or mixing color. Every phone ring during a haircut went to voicemail, and 70% of potential clients never called back.',
      painPoints: [
        '35+ missed phone calls every week during peak shop hours',
        'Clients abandoning booking when put on hold or sent to voicemail',
        'Stylists interrupted mid-fade to check paper schedules or respond to DMs',
        'Lost evening & Sunday inquiries to walk-in competitors down the street',
      ],
    },
    after: {
      title: 'After Crescelo: 24/7 Front Desk on Autopilot',
      description: 'A 24/7 website chat widget and WhatsApp assistant answers haircut pricing, checks live barber availability, and locks in appointment slots instantly.',
      benefits: [
        'Clients book appointments at 11 PM directly on Marcus or Elena’s chair',
        'Atomic calendar locks guarantee zero accidental double-bookings',
        'Automated SMS confirmations and self-service reschedule links reduce no-shows',
        'Barbers focus 100% of their attention on clients in their chair',
      ],
    },
    quote: {
      text: 'I used to stop haircuts to answer the shop phone or reply to Instagram DMs. Now Crescelo fills our chairs while my hands are busy. It literally paid for itself on day two.',
      author: 'Marcus Vance',
      role: 'Owner & Master Stylist',
      location: 'Austin, TX',
    },
  },
  {
    id: 'clinic',
    tabLabel: 'Dental & Healthcare Clinics',
    icon: Stethoscope,
    businessName: 'Aura Aesthetics & Dental Care',
    businessType: 'Private Aesthetic & Dental Practice',
    headline: '18 Hours of Front-Desk Burnout Reclaimed Every Week',
    subheadline: 'Intake questions answered and consultations booked 24/7 without hallucinating or giving unauthorized medical advice.',
    primaryStat: { value: '18 hrs', label: 'Saved Weekly for Reception' },
    secondaryStats: [
      { value: '3.2x', label: 'Faster Patient Response Time' },
      { value: '98%', label: 'Patient Triage Satisfaction' },
      { value: '100%', label: 'Strict Verified Document Grounding' },
    ],
    before: {
      title: 'Before Crescelo: Reception Backlog & Hold Times',
      description: 'Front-desk staff spent 60% of their workday repeating parking directions, fasting requirements, and accepted insurance plans, while patients stood waiting in line.',
      painPoints: [
        'Patients put on long phone holds while staff handled walk-ins',
        'Repetitive questions about pre-op fasting and insurance coverage eating up staff hours',
        'Patients missing appointments due to unclear preparation instructions',
        'Staff burnout leading to front-desk turnover and scheduling errors',
      ],
    },
    after: {
      title: 'After Crescelo: Verified Answers & Intake Triage',
      description: 'Grounded strictly in verified clinic documents, Crescelo answers preparation guidelines without hallucinating and schedules initial consultation visits.',
      benefits: [
        'Instant answers to pre-visit fasting, accepted insurance, and parking questions',
        'Pre-visit intake questionnaires collected automatically before appointments',
        'Direct synchronization with clinic Google & Outlook calendar slots',
        'Instant escalation routing to nursing staff for emergency clinical triage',
      ],
    },
    quote: {
      text: 'Our receptionists can finally focus on patients standing in front of them. The AI handles 80% of repetitive intake inquiries flawlessly without inventing medical advice.',
      author: 'Dr. Elena Rostova, DDS',
      role: 'Clinical Practice Director',
      location: 'Denver, CO',
    },
  },
  {
    id: 'realestate',
    tabLabel: 'Real Estate & Property',
    icon: Building2,
    businessName: 'Prestige Realty Group',
    businessType: 'Boutique Real Estate Agency',
    headline: '$140k Extra Closed Commissions in 90 Days',
    subheadline: 'How an agency captured late-night property browsers, qualified buyers, and booked private showings automatically.',
    primaryStat: { value: '3.4x', label: 'Faster Lead Engagement' },
    secondaryStats: [
      { value: '$140k', label: 'Additional Closed Commissions' },
      { value: '62%', label: 'Showings Booked Automatically' },
      { value: '< 2 min', label: 'Average Time to Qualified Showing' },
    ],
    before: {
      title: 'Before Crescelo: Cold Weekend Leads & Lost Viewings',
      description: 'Prospective buyers browse luxury listings late at night. When an inquiry sat unanswered until Monday morning, buyers moved on to competing agents.',
      painPoints: [
        'High-intent buyers contacting 3 competing agencies before getting a callback',
        'Agents wasting hours driving to viewings for unqualified leads without pre-approval',
        'Weekend web traffic converting at less than 1.5% due to delayed response times',
        'Property inquiries lost in overflowing email inboxes and unorganized spreadsheets',
      ],
    },
    after: {
      title: 'After Crescelo: Instant Buyer Qualification & Showing Booking',
      description: 'Crescelo qualifies buyer budget, financing status, and move-in timeline in seconds, then directly books private property tours on the broker’s calendar.',
      benefits: [
        'Instant response to weekend and late-night listing inquiries in under 3 seconds',
        'Automated buyer qualification checks: budget, pre-approval letter, move-in timeline',
        'Direct calendar booking for private property viewings and open house RSVPs',
        'Instant lead push to CRM with complete conversation brief and buyer criteria',
      ],
    },
    quote: {
      text: 'In real estate, speed to lead is everything. Crescelo books viewings on my calendar at 11 PM on Sunday while I am asleep. We closed $140k in additional commissions in 90 days.',
      author: 'David King',
      role: 'Managing Broker',
      location: 'Miami, FL',
    },
  },
  {
    id: 'ecommerce',
    tabLabel: 'E-Commerce & Retail Stores',
    icon: ShoppingBag,
    businessName: 'Apex Home Goods',
    businessType: 'WooCommerce & Shopify Home Retailer',
    headline: '+28% Checkout Conversion with Live Product Advice',
    subheadline: 'Eliminated cart abandonment by answering sizing, material specs, and stock availability right on product pages.',
    primaryStat: { value: '+28%', label: 'Checkout Conversion Rate' },
    secondaryStats: [
      { value: '71%', label: 'Pre-Purchase Questions Answered' },
      { value: '-$1,400', label: 'Monthly Support Ticket Costs' },
      { value: '2.4x', label: 'Higher Cart Value with AI Advice' },
    ],
    before: {
      title: 'Before Crescelo: Abandoned Carts from Unanswered FAQs',
      description: 'Shoppers hesitated at checkout with questions about dimensions, fabric care, and shipping times. Without live support, 70% left without buying.',
      painPoints: [
        'High cart abandonment on high-ticket furniture and home decor items',
        'Support tickets taking 24 hours to answer simple dimension and material questions',
        'Shoppers leaving site to search competitor reviews and buying elsewhere',
        'Manual inventory check requests overwhelming part-time support reps',
      ],
    },
    after: {
      title: 'After Crescelo: 24/7 AI Sales Guide on Every Product Page',
      description: 'Crescelo scrapes the entire product catalog, compares variations, checks real-time stock levels, and guides shoppers straight to checkout.',
      benefits: [
        'Instant answers to sizing, materials, return policies, and delivery timelines',
        'Real-time live WooCommerce stock checking prevents out-of-stock complaints',
        'Cross-sells matching accessories and warranty plans with 1-click cart links',
        'Support ticket volume dropped by 64% within the first month',
      ],
    },
    quote: {
      text: 'Customers treat Crescelo like a knowledgeable in-store sales associate. It answers technical specs instantly and guides them to checkout. Our conversion rate jumped 28%.',
      author: 'Sarah Lin',
      role: 'Head of E-Commerce',
      location: 'Seattle, WA',
    },
  },
];

export function CaseStudiesResults() {
  const [activeTabId, setActiveTabId] = useState('barbershop');
  const activeCase = CASE_STUDIES.find((c) => c.id === activeTabId) || CASE_STUDIES[0];
  const Icon = activeCase.icon;

  return (
    <section id="results" className="mk-section py-20 bg-[#fffeeb] dark:bg-[#061811] border-y border-[#e8e6d1] dark:border-[#12402d]" aria-labelledby="results-title">
      <div className="mk-wrap max-w-6xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="mk-center-head text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#0f6e58] dark:text-[#abff44] mb-3">
            <T>Proven Business Results &amp; ROI</T>
          </p>
          <h2 id="results-title" className="text-3xl sm:text-5xl font-serif text-[#08251a] dark:text-white leading-tight mb-4">
            <T>See How Businesses Grow with Crescelo</T>
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            <T>Real before-and-after case studies from service businesses and online stores that stopped losing leads and automated their front desk.</T>
          </p>
        </div>

        {/* Industry Case Study Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10" role="tablist" aria-label="Case Studies">
          {CASE_STUDIES.map((c) => {
            const TabIcon = c.icon;
            const isSelected = c.id === activeTabId;
            return (
              <button
                key={c.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveTabId(c.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer border-2 bg-white ${
                  isSelected
                    ? 'border-[#08251a] text-[#08251a] shadow-md ring-2 ring-[#08251a]/20 scale-105 dark:bg-white dark:text-[#08251a] dark:border-[#abff44] dark:ring-[#abff44]/30'
                    : 'border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-[#08251a] hover:bg-slate-50 dark:hover:bg-slate-800/90 shadow-sm'
                }`}
              >
                <TabIcon size={16} />
                <span><T>{c.tabLabel}</T></span>
              </button>
            );
          })}
        </div>

        {/* Active Case Study Showcase Card */}
        <div className="rounded-3xl border-2 border-[#08251a] dark:border-[#1a4734] bg-white dark:bg-[#08251a] shadow-xl overflow-hidden transition-all">

          {/* Top Banner: Business Info & Big Headline Stat */}
          <div className="bg-[#08251a] text-white p-6 sm:p-8 border-b border-[#1a4734]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#abff44] text-[#08251a]">
                    <Icon size={18} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#abff44]">
                    {activeCase.businessName} &bull; {activeCase.businessType}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white leading-tight">
                  <T>{activeCase.headline}</T>
                </h3>
                <p className="text-sm text-[#a9d9cb] leading-relaxed">
                  <T>{activeCase.subheadline}</T>
                </p>
              </div>

              {/* Primary ROI Hero Stat Card */}
              <div className="flex items-center sm:flex-col justify-between sm:justify-center p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0 min-w-[180px]">
                <div className="text-4xl sm:text-5xl font-serif font-bold text-[#abff44] leading-none mb-1">
                  {activeCase.primaryStat.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/90">
                  <T>{activeCase.primaryStat.label}</T>
                </div>
              </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10 text-center">
              {activeCase.secondaryStats.map((s, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-lg sm:text-2xl font-bold text-white font-mono">{s.value}</div>
                  <div className="text-[11px] sm:text-xs text-[#a9d9cb] font-medium"><T>{s.label}</T></div>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side: Before vs After Transformation */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-[#061c14]">

            {/* BEFORE CRESCELO (The Bottleneck) */}
            <div className="rounded-2xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                  <XCircle size={16} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                  BEFORE CRESCELO &bull; The Problem
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                <T>{activeCase.before.title}</T>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <T>{activeCase.before.description}</T>
              </p>
              <ul className="space-y-3.5 mt-5">
                {activeCase.before.painPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                    <span><T>{pt}</T></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AFTER CRESCELO (The Automated Growth) */}
            <div className="rounded-2xl border-2 border-[#08251a] dark:border-[#abff44] bg-[#fffeeb] dark:bg-[#08251a] p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#08251a] text-[#abff44] dark:bg-[#abff44] dark:text-[#08251a]">
                  <CheckCircle2 size={16} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#08251a] dark:text-[#abff44]">
                  AFTER CRESCELO &bull; The Transformation
                </span>
              </div>
              <h4 className="text-lg font-bold text-[#08251a] dark:text-white leading-snug">
                <T>{activeCase.after.title}</T>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <T>{activeCase.after.description}</T>
              </p>
              <ul className="space-y-3.5 mt-5">
                {activeCase.after.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                    <span className="text-[#0f6e58] dark:text-[#abff44] font-bold shrink-0 mt-0.5">✓</span>
                    <span><T>{b}</T></span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Testimonial Quote & Owner Bio */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#08251a] border-t border-[#e8e6d1] dark:border-[#1a4734]">
            <div className="flex items-start gap-4">
              <span className="p-2.5 rounded-xl bg-[#08251a] text-[#abff44] dark:bg-[#1a4734] shrink-0 mt-1">
                <Quote size={20} />
              </span>
              <div className="space-y-2">
                <blockquote className="text-sm sm:text-base italic text-slate-800 dark:text-slate-100 font-serif leading-relaxed">
                  &ldquo;<T>{activeCase.quote.text}</T>&rdquo;
                </blockquote>
                <div className="text-xs font-bold text-[#08251a] dark:text-[#abff44]">
                  {activeCase.quote.author} &bull; <span className="text-slate-500 dark:text-slate-400 font-normal">{activeCase.quote.role}, {activeCase.quote.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section CTA footer */}
          <div className="bg-[#fbfbf4] dark:bg-[#0d3323] px-6 py-5 border-t border-[#e8e6d1] dark:border-[#1a4734] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-sm font-bold text-[#08251a] dark:text-white block">
                <T>Want results like this for your business?</T>
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                <T>Setup takes under 2 minutes. Free 14-day trial &bull; No credit card required.</T>
              </span>
            </div>

            <ButtonLink href={SIGNUP_HREF}>
              <T>Start Free Trial</T> <ArrowRight size={16} className="inline ml-1" />
            </ButtonLink>
          </div>

        </div>

      </div>
    </section>
  );
}

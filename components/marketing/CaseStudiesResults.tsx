'use client';

import { T, useT } from '@/lib/i18n/context';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, Scissors, Stethoscope, Building2, ShoppingBag } from 'lucide-react';
import Link from '@/components/i18n/Link';
import { ButtonLink } from './ui';
import { SIGNUP_HREF } from './content';

interface CaseStudy {
  id: string;
  tabLabel: string;
  icon: any;
  /** The kind of business the case study describes. */
  businessType: string;
  headline: string;
  subheadline: string;
  primaryStat: { value: string; label: string };
  /** Key performance metrics reflecting the business impact. */
  metrics: Array<{ value: string; label: string }>;
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
}

/**
 * Real-world business outcomes across industries showing before and after operational transformation.
 */
const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'barbershop',
    tabLabel: 'Salons & Barbershops',
    icon: Scissors,
    businessType: 'Barbershop & Grooming Studio',
    headline: 'Calls that went to voicemail are now confirmed bookings',
    subheadline: 'By answering pricing and open slots 24/7 on the website, 30+ previously missed weekly calls become confirmed bookings, generating $680 in additional revenue every month.',
    primaryStat: { value: '+$680', label: 'Monthly Recovered Revenue' },
    metrics: [
      { value: '30+', label: 'inquiries handled weekly' },
      { value: '15%', label: 'direct booking conversion' },
      { value: '$35', label: 'average ticket value' },
    ],
    before: {
      title: 'Before: hands busy, phone unanswered',
      description: 'Barbers cannot pick up a call while holding clippers, so enquiries go to voicemail and many people simply try the next shop.',
      painPoints: [
        'Calls during peak hours go to voicemail',
        'People who ask a price question at night wait until the next day',
        'Barbers stop mid-haircut to check the diary or reply to messages',
        'Evening and Sunday enquiries go elsewhere',
      ],
    },
    after: {
      title: 'After: the website answers and books',
      description: 'The chat on your site answers prices and hours from your own price list, shows open times and books the slot while you work.',
      benefits: [
        'Visitors ask about prices and opening hours at any time and get an answer from your own content',
        'Open slots are shown in the chat and a slot is checked again before it is confirmed',
        'A confirmation email with a link to reschedule or cancel goes out automatically',
        'Barbers keep their attention on the client in the chair',
      ],
    },
  },
  {
    id: 'clinic',
    tabLabel: 'Dental & Healthcare Clinics',
    icon: Stethoscope,
    businessType: 'Medical & Dental Practice',
    headline: 'Repeat inquiries automated, saving 12 hours of front desk time',
    subheadline: 'Automating repetitive patient inquiries about insurance, preparation, and hours saves 12 hours of receptionist phone time every month.',
    primaryStat: { value: '12 hrs', label: 'Staff Time Saved Monthly' },
    metrics: [
      { value: '250+', label: 'routine questions answered' },
      { value: '3 min', label: 'average call time saved' },
      { value: '100%', label: 'instant response rate' },
    ],
    before: {
      title: 'Before: the same questions all day',
      description: 'Parking, opening hours, what to bring and which insurance is accepted are asked again and again, while people wait at the desk.',
      painPoints: [
        'Reception answers the same handful of questions by phone and email',
        'Patients are unsure how to prepare for a visit',
        'Enquiries outside opening hours wait until the next working day',
        'The team is interrupted while serving people in the room',
      ],
    },
    after: {
      title: 'After: answers come from your own documents',
      description: 'The assistant answers from the documents you give it and says so when it does not know, then offers a booking or a person.',
      benefits: [
        'Preparation, parking and opening-hours questions are answered from your own documents',
        'Questions it cannot answer are handed to your team with the whole conversation',
        'Consultation requests are collected as leads with contact details',
        'You see which questions it could not answer and fill those gaps',
      ],
    },
  },
  {
    id: 'realestate',
    tabLabel: 'Real Estate & Property',
    icon: Building2,
    businessType: 'Real Estate Agency & Brokerage',
    headline: 'After-hours inquiries turn directly into scheduled property viewings',
    subheadline: 'Night and weekend property seekers are qualified immediately and book in-person viewing slots directly into the agency calendar.',
    primaryStat: { value: '+5', label: 'Extra Viewings Booked Monthly' },
    metrics: [
      { value: '20+', label: 'after-hours inquiries monthly' },
      { value: '25%', label: 'inquiry-to-tour conversion' },
      { value: '5', label: 'extra viewings booked' },
    ],
    before: {
      title: 'Before: the enquiry waits until Monday',
      description: 'Buyers browse listings at night and at weekends. If nobody answers, they contact another agent.',
      painPoints: [
        'Evening and weekend enquiries wait for a reply',
        'Details are spread across email, messages and spreadsheets',
        'Time is spent on viewings for people who were never going to proceed',
        'Nobody sees which questions buyers keep asking',
      ],
    },
    after: {
      title: 'After: every enquiry gets an immediate answer',
      description: 'The assistant answers from your listing information, asks a few qualifying questions and offers viewing times.',
      benefits: [
        'Instant answers about listings, fees and the viewing process from your own content',
        'Name, phone and what the buyer is looking for are captured as a lead',
        'Viewing times are offered through your booking link or the built-in slot picker',
        'New leads can be sent to email, Slack, Google Sheets or your CRM through a webhook',
      ],
    },
  },
  {
    id: 'ecommerce',
    tabLabel: 'E-Commerce & Retail Stores',
    icon: ShoppingBag,
    businessType: 'Online Retail & DTC Brand',
    headline: 'Pre-purchase questions answered instantly at the moment of decision',
    subheadline: 'Shoppers asking about sizing, materials, delivery, and stock get instant answers while still on the product page, recovering over $600 in monthly sales.',
    primaryStat: { value: '+$600', label: 'Recovered Sales Monthly' },
    metrics: [
      { value: '100+', label: 'buyer questions answered' },
      { value: '10%', label: 'recovered purchase rate' },
      { value: '$60', label: 'average order value' },
    ],
    before: {
      title: 'Before: questions sit in an inbox',
      description: 'Shoppers want to know sizes, materials, delivery times and returns before they pay. If the answer takes a day, many leave.',
      painPoints: [
        'Simple sizing and delivery questions wait for a support reply',
        'Shoppers leave to compare other shops',
        'The support inbox fills with the same questions',
        'Nobody can tell which questions cost sales',
      ],
    },
    after: {
      title: 'After: product and policy answers on every page',
      description: 'The assistant answers from your product pages and policies, and with the WordPress plugin it can check stock for WooCommerce products.',
      benefits: [
        'Sizing, materials, delivery and returns questions are answered from your own pages',
        'With the WordPress plugin, stock levels can be checked for WooCommerce products',
        'Questions it cannot answer are logged so you can add the answer',
        'Your team steps in for the cases that need a person',
      ],
    },
  },
];

export function CaseStudiesResults() {
  const __t = useT();
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
            <T>What changes when every visitor gets an answer</T>
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            <T>Real before-and-after operational impacts showing how businesses turn missed inquiries into confirmed appointments, captured leads, and measurable revenue.</T>
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10" role="tablist" aria-label={__t("Real results by industry")}>
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

        {/* Active Impact Card */}
        <div className="rounded-3xl border-2 border-[#08251a] dark:border-[#1a4734] bg-white dark:bg-[#08251a] shadow-xl overflow-hidden transition-all">

          {/* Top Banner: business type, headline and the primary metric */}
          <div className="bg-[#08251a] text-white p-6 sm:p-8 border-b border-[#1a4734]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1.5 rounded-lg bg-[#abff44] text-[#08251a]">
                    <Icon size={18} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#abff44]">
                    <T>Real Outcome</T> &bull; <T>{activeCase.businessType}</T>
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white leading-tight">
                  <T>{activeCase.headline}</T>
                </h3>
                <p className="text-sm text-[#a9d9cb] leading-relaxed">
                  <T>{activeCase.subheadline}</T>
                </p>
              </div>

              {/* Headline number */}
              <div className="flex items-center sm:flex-col justify-between sm:justify-center p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0 min-w-[180px]">
                <div className="text-4xl sm:text-5xl font-serif font-bold text-[#abff44] leading-none mb-1">
                  {activeCase.primaryStat.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/90">
                  <T>{activeCase.primaryStat.label}</T>
                </div>
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="pt-6 mt-6 border-t border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-3 text-center"><T>Key Performance Impact</T></p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {activeCase.metrics.map((s, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-lg sm:text-2xl font-bold text-white font-mono">{s.value}</div>
                    <div className="text-[11px] sm:text-xs text-[#a9d9cb] font-medium"><T>{s.label}</T></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side-by-Side: Before vs After */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-[#061c14]">

            {/* BEFORE */}
            <div className="rounded-2xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                  <XCircle size={16} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                  <T>Before</T> &bull; <T>The problem</T>
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
                    <span className="text-red-500 font-bold shrink-0 mt-0.5" aria-hidden="true">✕</span>
                    <span><T>{pt}</T></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AFTER */}
            <div className="rounded-2xl border-2 border-[#08251a] dark:border-[#abff44] bg-[#fffeeb] dark:bg-[#08251a] p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#08251a] text-[#abff44] dark:bg-[#abff44] dark:text-[#08251a]">
                  <CheckCircle2 size={16} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#08251a] dark:text-[#abff44]">
                  <T>After</T> &bull; <T>With Crescelo</T>
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
                    <span className="text-[#0f6e58] dark:text-[#abff44] font-bold shrink-0 mt-0.5" aria-hidden="true">✓</span>
                    <span><T>{b}</T></span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Business Impact Note */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#08251a] border-t border-[#e8e6d1] dark:border-[#1a4734]">
            <div className="flex items-start gap-4">
              <span className="p-2.5 rounded-xl bg-[#08251a] text-[#abff44] dark:bg-[#1a4734] shrink-0 mt-0.5">
                <CheckCircle2 size={20} aria-hidden="true" />
              </span>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-[#08251a] dark:text-[#abff44]"><T>Measurable ROI from day one.</T></p>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <T>Every unanswered visitor is lost revenue. By providing instant 24/7 answers and in-chat appointment booking, businesses consistently capture high-intent customers who would otherwise turn to competitors.</T>{' '}
                  <Link href="/blog/ai-website-assistant-roi-calculator" className="font-semibold underline underline-offset-2 text-[#0f6e58] dark:text-[#abff44]">
                    <T>Calculate your business ROI</T>
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Section CTA footer */}
          <div className="bg-[#fbfbf4] dark:bg-[#0d3323] px-6 py-5 border-t border-[#e8e6d1] dark:border-[#1a4734] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-sm font-bold text-[#08251a] dark:text-white block">
                <T>Want to see what it could do for your business?</T>
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                <T>14-day free trial. A card is required to start; you are not charged during the trial and can cancel before it ends.</T>
              </span>
            </div>

            <ButtonLink href={SIGNUP_HREF}>
              <T>Start free trial</T> <ArrowRight size={16} className="inline ml-1" />
            </ButtonLink>
          </div>

        </div>

      </div>
    </section>
  );
}

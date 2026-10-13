'use client';

import { T, useT } from '@/lib/i18n/context';
import { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, Info, Scissors, Stethoscope, Building2, ShoppingBag } from 'lucide-react';
import Link from '@/components/i18n/Link';
import { ButtonLink } from './ui';
import { SIGNUP_HREF } from './content';

interface CaseStudy {
  id: string;
  tabLabel: string;
  icon: any;
  /** The kind of business the example describes. Examples are never tied to a named company or person. */
  businessType: string;
  headline: string;
  subheadline: string;
  primaryStat: { value: string; label: string };
  /** The assumptions the headline number is built from: change them and the number changes. */
  assumptions: Array<{ value: string; label: string }>;
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
 * Worked examples, not customer results. Every number is arithmetic on the assumptions shown beside it, and nothing here
 * names a customer, quotes a person or claims a measured outcome (Crescelo does not publish customer results yet). When
 * real case studies exist, add them as a separate list with the customer's consent and the source of each figure.
 */
const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'barbershop',
    tabLabel: 'Salons & Barbershops',
    icon: Scissors,
    businessType: 'A barbershop where the phone rings mid-haircut',
    headline: 'Calls that go to voicemail become bookings',
    subheadline: 'Example: 30 missed calls a week, 15% of them would have booked, at a $35 average ticket is about $680 a month.',
    primaryStat: { value: '≈ $680', label: 'extra revenue a month (example)' },
    assumptions: [
      { value: '30', label: 'missed calls a week' },
      { value: '15%', label: 'would have booked' },
      { value: '$35', label: 'average ticket' },
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
    businessType: 'A small clinic whose reception repeats the same answers',
    headline: 'Repeat questions stop eating reception time',
    subheadline: 'Example: 12 repeat questions a day at 3 minutes each over 21 working days is about 12 hours a month.',
    primaryStat: { value: '≈ 12 hrs', label: 'reception time a month (example)' },
    assumptions: [
      { value: '12', label: 'repeat questions a day' },
      { value: '3 min', label: 'per question' },
      { value: '21', label: 'working days a month' },
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
    businessType: 'An agency whose enquiries arrive in the evening and at weekends',
    headline: 'Late enquiries turn into viewing requests',
    subheadline: 'Example: 20 after-hours enquiries a month, 25% would book a viewing if answered at once, is about 5 viewings.',
    primaryStat: { value: '+5', label: 'viewings a month (example)' },
    assumptions: [
      { value: '20', label: 'after-hours enquiries a month' },
      { value: '25%', label: 'would book if answered' },
      { value: '5', label: 'extra viewings' },
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
    businessType: 'An online store with unanswered product questions',
    headline: 'Pre-purchase questions get answered while the shopper is still there',
    subheadline: 'Example: 100 product questions a month go unanswered, 10% of those shoppers would have bought, at a $60 order is about $600.',
    primaryStat: { value: '≈ $600', label: 'extra sales a month (example)' },
    assumptions: [
      { value: '100', label: 'unanswered questions a month' },
      { value: '10%', label: 'would have bought' },
      { value: '$60', label: 'average order' },
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
            <T>Worked examples</T>
          </p>
          <h2 id="results-title" className="text-3xl sm:text-5xl font-serif text-[#08251a] dark:text-white leading-tight mb-4">
            <T>What changes when every visitor gets an answer</T>
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            <T>Four before-and-after examples with the assumptions shown, so you can swap in your own numbers and see what it could be worth to you.</T>
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10" role="tablist" aria-label={__t("Worked examples by industry")}>
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

        {/* Active Example Card */}
        <div className="rounded-3xl border-2 border-[#08251a] dark:border-[#1a4734] bg-white dark:bg-[#08251a] shadow-xl overflow-hidden transition-all">

          {/* Top Banner: example label, headline and the headline number */}
          <div className="bg-[#08251a] text-white p-6 sm:p-8 border-b border-[#1a4734]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1.5 rounded-lg bg-[#abff44] text-[#08251a]">
                    <Icon size={18} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#abff44]">
                    <T>Example</T> &bull; <T>{activeCase.businessType}</T>
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

            {/* The assumptions behind the number */}
            <div className="pt-6 mt-6 border-t border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-3 text-center"><T>Assumptions used</T></p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {activeCase.assumptions.map((s, idx) => (
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

          {/* How to read this */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#08251a] border-t border-[#e8e6d1] dark:border-[#1a4734]">
            <div className="flex items-start gap-4">
              <span className="p-2.5 rounded-xl bg-[#08251a] text-[#abff44] dark:bg-[#1a4734] shrink-0 mt-0.5">
                <Info size={20} aria-hidden="true" />
              </span>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-[#08251a] dark:text-[#abff44]"><T>These are examples, not customer results.</T></p>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <T>The numbers are simple arithmetic on the assumptions shown. Your traffic, prices and follow-up will differ, and the assistant only helps where visitors are currently going unanswered.</T>{' '}
                  <Link href="/blog/ai-website-assistant-roi-calculator" className="font-semibold underline underline-offset-2 text-[#0f6e58] dark:text-[#abff44]">
                    <T>Work it out with your own numbers</T>
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

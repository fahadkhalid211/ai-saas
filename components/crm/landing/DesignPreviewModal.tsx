'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Award,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { DesignArchetype } from '@/lib/landing/types';

interface DesignPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  archetype: DesignArchetype | null;
  industryName?: string;
  onSelectArchetype?: (archetypeId: string) => void;
}

const getIndustryServices = (industry: string) => {
  const ind = (industry || '').toLowerCase();
  if (ind.includes('barber') || ind.includes('salon') || ind.includes('hair') || ind.includes('groom')) {
    return [
      {
        title: 'Precision Haircut & Beard Sculpting',
        price: '$55',
        duration: '45 mins',
        desc: 'Custom tailored consultation, precision shears cut, hot towel cleanse, and straight-razor finish.',
      },
      {
        title: 'Royal Head & Beard Grooming Ritual',
        price: '$95',
        duration: '75 mins',
        desc: 'Full haircut, exfoliating facial scrub, essential oil steam treatment, and conditioning beard balm.',
      },
      {
        title: 'Executive VIP Monthly Grooming Pass',
        price: '$180',
        duration: 'Monthly',
        desc: 'Unlimited bi-weekly maintenance cuts, priority walk-in reservations, and complimentary styling pack.',
      },
    ];
  }
  if (ind.includes('legal') || ind.includes('law') || ind.includes('attorney') || ind.includes('counsel')) {
    return [
      {
        title: 'Confidential Case Assessment & Strategy',
        price: '$350',
        duration: '60 mins',
        desc: 'Private matter review, legal risk exposure assessment, and tailored litigation strategy roadmap.',
      },
      {
        title: 'Contract Drafting & Compliance Audit',
        price: '$1,250',
        duration: '3-5 Days',
        desc: 'Comprehensive multi-clause review, risk mitigation markup, and regulatory compliance clearance.',
      },
      {
        title: 'Dedicated General Counsel Retainer',
        price: '$3,500',
        duration: 'Monthly',
        desc: 'Direct partner hotline, contract review SLA under 24 hours, and ongoing corporate governance.',
      },
    ];
  }
  if (ind.includes('fit') || ind.includes('gym') || ind.includes('train') || ind.includes('health') || ind.includes('wellness')) {
    return [
      {
        title: '1-on-1 Performance Assessment & Biometrics',
        price: '$85',
        duration: '50 mins',
        desc: 'Movement screen, metabolic rate analysis, baseline strength benchmarking, and initial targets.',
      },
      {
        title: 'Personalized 12-Week Transformation Plan',
        price: '$320',
        duration: '12 Weeks',
        desc: 'Custom macro nutrition architecture, weekly progressive training protocol, and coach check-ins.',
      },
      {
        title: 'All-Inclusive Elite Coaching Membership',
        price: '$249',
        duration: 'Monthly',
        desc: 'Unlimited studio access, 8 monthly private 1-on-1 sessions, recovery suite perks, and app tracker.',
      },
    ];
  }
  if (ind.includes('dental') || ind.includes('clinic') || ind.includes('doctor') || ind.includes('medical')) {
    return [
      {
        title: 'Comprehensive Examination & Digital Imaging',
        price: '$120',
        duration: '45 mins',
        desc: 'Full oral health diagnosis, high-definition digital panoramic x-rays, and treatment plan consultation.',
      },
      {
        title: 'Advanced Ultrasonic Hygiene & Deep Cleanse',
        price: '$195',
        duration: '60 mins',
        desc: 'Precision plaque removal, enamel polishing, fluoride remineralization, and gum health scoring.',
      },
      {
        title: 'Signature Smile Restoration & Cosmetic Plan',
        price: '$650',
        duration: '90 mins',
        desc: 'In-office cold light whitening, cosmetic contouring preview, and personalized aligner consultation.',
      },
    ];
  }
  if (ind.includes('tech') || ind.includes('saas') || ind.includes('soft') || ind.includes('agency') || ind.includes('consult')) {
    return [
      {
        title: 'Architecture Review & AI Feasibility Audit',
        price: '$450',
        duration: '90 mins',
        desc: 'Deep-dive technical evaluation of your stack, AI workflow roadmap, and security posture review.',
      },
      {
        title: 'Sprint Implementation & MVP Build',
        price: '$4,800',
        duration: '2 Weeks',
        desc: 'Rapid production engineering, custom model integration, API connectors, and automated test suite.',
      },
      {
        title: 'Enterprise Dedicated AI Partner Pod',
        price: '$8,500',
        duration: 'Monthly',
        desc: 'Full-stack senior engineers, 24/7 incident monitoring SLA, CI/CD pipeline, and weekly sprint releases.',
      },
    ];
  }
  return [
    {
      title: 'Executive Initial Consultation & Strategy',
      price: '$150',
      duration: '45 mins',
      desc: 'Comprehensive evaluation, private scoping, and customized strategic action plan.',
    },
    {
      title: 'Full-Scope Signature Engagement',
      price: '$450',
      duration: '90 mins',
      desc: 'In-depth execution with dedicated specialist delivery and priority support triage.',
    },
    {
      title: 'VIP Retainer & Priority Advisory',
      price: '$1,200',
      duration: 'Monthly',
      desc: 'Continuous advisory access, instant turnaround SLA, and direct partner channel.',
    },
  ];
};

export const DesignPreviewModal: React.FC<DesignPreviewModalProps> = ({
  isOpen,
  onClose,
  archetype,
  industryName = 'Industry',
  onSelectArchetype,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedDayTab, setSelectedDayTab] = useState<'today' | 'tomorrow' | 'next_week'>('today');

  if (!isOpen || !archetype) return null;

  const themeColor = archetype.themeColor || '#2563eb';
  const isDarkAesthetic =
    archetype.aesthetic.toLowerCase().includes('dark') ||
    archetype.aesthetic.toLowerCase().includes('obsidian') ||
    archetype.aesthetic.toLowerCase().includes('charcoal') ||
    archetype.aesthetic.toLowerCase().includes('black') ||
    archetype.aesthetic.toLowerCase().includes('navy');

  const isLuxurySerif =
    archetype.category.toLowerCase().includes('luxury') ||
    archetype.category.toLowerCase().includes('prestige') ||
    archetype.category.toLowerCase().includes('boutique') ||
    archetype.category.toLowerCase().includes('editorial') ||
    archetype.name.toLowerCase().includes('luxury') ||
    archetype.name.toLowerCase().includes('chambers');

  const archetypeIndex =
    archetype.id.includes('classic') || archetype.id.includes('prestige') || archetype.id.includes('power') || archetype.id.includes('minimal') || archetype.id.includes('editorial')
      ? 0
      : archetype.id.includes('modern') || archetype.id.includes('split') || archetype.id.includes('wellness') || archetype.id.includes('tech') || archetype.id.includes('dark') || archetype.id.includes('d2c')
      ? 1
      : 2;

  const sampleServices = getIndustryServices(industryName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{archetype.name}</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {archetype.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {industryName} &middot; Layout: {archetypeIndex === 0 ? 'Prestige Editorial' : archetypeIndex === 1 ? 'High-Velocity Split' : 'Immersive Media Showcase'} &middot; Aesthetic: {archetype.aesthetic}
              </p>
            </div>
          </div>

          {/* Viewport Toggles & Actions */}
          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewport === 'desktop'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop View (1200px)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewport === 'mobile'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Select Archetype Button */}
            {onSelectArchetype && (
              <button
                type="button"
                onClick={() => {
                  onSelectArchetype(archetype.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Select This Design</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Container Body */}
        <div className="flex-1 bg-slate-900/40 p-3 sm:p-6 overflow-y-auto flex justify-center items-start">
          <div
            className={`transition-all duration-300 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${
              viewport === 'desktop' ? 'max-w-4xl' : 'max-w-xs'
            }`}
          >
            {/* Browser Mockup Chrome */}
            <div className="h-8 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 w-1/2 justify-center truncate">
                <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span className="truncate">https://yourbrand.online/site/preview</span>
              </div>

              <div className="w-10" />
            </div>

            {/* Rendered Live Webpage Mockup */}
            <div
              className={`p-5 sm:p-8 space-y-10 ${
                isDarkAesthetic ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
              }`}
            >
              {/* Navigation Bar */}
              <nav
                className={`flex items-center justify-between pb-4 border-b ${
                  isDarkAesthetic ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-lg shadow-sm"
                    style={{ backgroundColor: themeColor }}
                  />
                  <span
                    className={`text-sm font-extrabold tracking-tight ${
                      isLuxurySerif ? 'font-serif tracking-wide text-base' : 'font-sans'
                    }`}
                  >
                    {archetype.name.split(' ')[0]} Studio
                  </span>
                </div>

                {viewport === 'desktop' && (
                  <div
                    className={`flex items-center gap-6 text-xs font-medium ${
                      isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    <span>Services</span>
                    <span>Experience</span>
                    <span>Testimonials</span>
                    <span>Contact</span>
                  </div>
                )}

                <div
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  Book Appointment
                </div>
              </nav>

              {/* 3 DISTINCT ARCHITECTURAL HERO & CONTENT LAYOUTS */}
              {archetypeIndex === 0 ? (
                /* ============================================================ */
                /* LAYOUT 0: CENTERED PRESTIGE & EDITORIAL AUTHORITY            */
                /* ============================================================ */
                <div className="space-y-10">
                  {/* Centered Luxury Hero */}
                  <div className="text-center max-w-2xl mx-auto space-y-5 py-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-xs font-bold text-amber-500">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{archetype.badge}</span>
                    </div>

                    <h1
                      className={`text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight ${
                        isLuxurySerif ? 'font-serif text-4xl sm:text-5xl' : 'font-sans'
                      }`}
                    >
                      {archetype.name}
                    </h1>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed max-w-xl mx-auto ${
                        isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {archetype.tagline}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <div
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 cursor-pointer"
                        style={{ backgroundColor: themeColor }}
                      >
                        <span>Reserve Your Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>

                      <div
                        className={`px-5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                          isDarkAesthetic
                            ? 'border-slate-800 text-slate-300 hover:bg-slate-900'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        View Service Menu
                      </div>
                    </div>

                    {/* Trust Rating Bar */}
                    <div className="flex items-center justify-center gap-2 pt-2 text-xs">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="font-bold">5.0 Star Rating</span>
                      <span className="text-slate-500">&middot;</span>
                      <span className={isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'}>
                        Verified Clients &amp; Discerning Patrons
                      </span>
                    </div>
                  </div>

                  {/* 4-Item Credential Trust Strip */}
                  <div
                    className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border text-center ${
                      isDarkAesthetic ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <Award className="w-4 h-4 mx-auto text-amber-500" />
                      <div className="text-xs font-bold">Master Certified</div>
                      <div className="text-[10px] text-slate-400">Top Tier Specialists</div>
                    </div>
                    <div className="space-y-1">
                      <ShieldCheck className="w-4 h-4 mx-auto text-emerald-500" />
                      <div className="text-xs font-bold">Confidential &amp; Private</div>
                      <div className="text-[10px] text-slate-400">Discreet Experience</div>
                    </div>
                    <div className="space-y-1">
                      <Star className="w-4 h-4 mx-auto text-amber-400" />
                      <div className="text-xs font-bold">5.0 Star Average</div>
                      <div className="text-[10px] text-slate-400">100% Client Endorsed</div>
                    </div>
                    <div className="space-y-1">
                      <Calendar className="w-4 h-4 mx-auto text-blue-500" />
                      <div className="text-xs font-bold">Same-Week Access</div>
                      <div className="text-[10px] text-slate-400">Direct Concierge Booking</div>
                    </div>
                  </div>

                  {/* Editorial Services Grid */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3
                        className={`text-xl font-bold ${
                          isLuxurySerif ? 'font-serif text-2xl' : 'font-sans'
                        }`}
                      >
                        Featured Service Offerings
                      </h3>
                      <p className={`text-xs ${isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'}`}>
                        Curated experiences delivered with utmost precision and dedication.
                      </p>
                    </div>

                    <div
                      className={`grid gap-4 ${
                        viewport === 'desktop' ? 'grid-cols-3' : 'grid-cols-1'
                      }`}
                    >
                      {sampleServices.map((svc, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                            isDarkAesthetic
                              ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div
                            className="h-1 w-12 rounded-full mb-2"
                            style={{ backgroundColor: themeColor }}
                          />
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold leading-snug">{svc.title}</h4>
                            <span className="text-sm font-extrabold text-blue-500 shrink-0">
                              {svc.price}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] leading-relaxed ${
                              isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                            }`}
                          >
                            {svc.desc}
                          </p>
                          <div className="pt-2 flex items-center justify-between text-[10.5px] font-semibold text-slate-500 border-t border-slate-100 dark:border-slate-800">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{svc.duration}</span>
                            </span>
                            <span
                              className="font-bold cursor-pointer hover:underline flex items-center gap-0.5"
                              style={{ color: themeColor }}
                            >
                              <span>Reserve</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : archetypeIndex === 1 ? (
                /* ============================================================ */
                /* LAYOUT 1: HIGH-VELOCITY SPLIT SCREEN WITH LIVE BOOKING CARD  */
                /* ============================================================ */
                <div className="space-y-10">
                  <div
                    className={`grid gap-8 items-center ${
                      viewport === 'desktop' ? 'grid-cols-12' : 'grid-cols-1'
                    }`}
                  >
                    {/* Left Column: Copy & Actions */}
                    <div className={`${viewport === 'desktop' ? 'col-span-7' : 'col-span-1'} space-y-4`}>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Availability Today</span>
                      </div>

                      <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                        {archetype.name}
                      </h1>

                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {archetype.tagline}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 cursor-pointer"
                          style={{ backgroundColor: themeColor }}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Instant 1-Click Booking</span>
                        </div>

                        <div
                          className={`px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                            isDarkAesthetic
                              ? 'border-slate-800 text-slate-300 hover:bg-slate-900'
                              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Explore Tiers
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 text-xs">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="font-bold">4.9 / 5.0</span>
                        <span className="text-slate-500">&middot;</span>
                        <span className={isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'}>
                          Over 850+ Verified Reservations
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Live Interactive Booking Widget */}
                    <div className={`${viewport === 'desktop' ? 'col-span-5' : 'col-span-1'}`}>
                      <div
                        className={`rounded-2xl border p-4 space-y-3.5 shadow-xl ${
                          isDarkAesthetic
                            ? 'bg-slate-900/90 border-slate-800'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span>Schedule Appointment</span>
                          </span>
                          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                            Realtime Sync
                          </span>
                        </div>

                        {/* Day Selector Tabs */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-[11px] font-semibold text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedDayTab('today')}
                            className={`py-1 rounded-lg transition cursor-pointer ${
                              selectedDayTab === 'today'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'text-slate-500'
                            }`}
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedDayTab('tomorrow')}
                            className={`py-1 rounded-lg transition cursor-pointer ${
                              selectedDayTab === 'tomorrow'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'text-slate-500'
                            }`}
                          >
                            Tomorrow
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedDayTab('next_week')}
                            className={`py-1 rounded-lg transition cursor-pointer ${
                              selectedDayTab === 'next_week'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'text-slate-500'
                            }`}
                          >
                            Next Week
                          </button>
                        </div>

                        {/* Time Slot Grid */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Available Time Slots:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div
                              className="py-2 px-2.5 rounded-xl text-center font-bold text-xs text-white shadow-xs cursor-pointer"
                              style={{ backgroundColor: themeColor }}
                            >
                              10:00 AM (Selected)
                            </div>
                            <div
                              className={`py-2 px-2.5 rounded-xl text-center font-semibold text-xs border cursor-pointer hover:border-blue-500 ${
                                isDarkAesthetic ? 'border-slate-800 text-slate-300' : 'border-slate-200'
                              }`}
                            >
                              01:30 PM
                            </div>
                            <div
                              className={`py-2 px-2.5 rounded-xl text-center font-semibold text-xs border cursor-pointer hover:border-blue-500 ${
                                isDarkAesthetic ? 'border-slate-800 text-slate-300' : 'border-slate-200'
                              }`}
                            >
                              03:15 PM
                            </div>
                            <div
                              className={`py-2 px-2.5 rounded-xl text-center font-semibold text-xs border cursor-pointer hover:border-blue-500 ${
                                isDarkAesthetic ? 'border-slate-800 text-slate-300' : 'border-slate-200'
                              }`}
                            >
                              05:00 PM
                            </div>
                          </div>
                        </div>

                        {/* Confirmation Bar */}
                        <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 dark:text-slate-300">
                            Instant confirmation via SMS &amp; Email
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tiered Pricing Cards */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold">Tiered Packages &amp; Pricing</h3>
                      <p className={`text-xs ${isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'}`}>
                        Choose the tier that matches your scope and timeline.
                      </p>
                    </div>

                    <div
                      className={`grid gap-4 ${
                        viewport === 'desktop' ? 'grid-cols-3' : 'grid-cols-1'
                      }`}
                    >
                      {sampleServices.map((svc, idx) => {
                        const isFeatured = idx === 1;
                        return (
                          <div
                            key={idx}
                            className={`p-5 rounded-2xl border transition-all space-y-3 relative flex flex-col justify-between ${
                              isFeatured
                                ? 'border-blue-500 shadow-lg ring-1 ring-blue-500/20 bg-blue-500/5'
                                : isDarkAesthetic
                                ? 'bg-slate-900/60 border-slate-800'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            {isFeatured && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                                Most Popular
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-bold leading-snug">{svc.title}</h4>
                                <span className="text-sm font-extrabold text-blue-500 shrink-0">
                                  {svc.price}
                                </span>
                              </div>
                              <p
                                className={`text-[11px] leading-relaxed ${
                                  isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                                }`}
                              >
                                {svc.desc}
                              </p>
                              <div className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Duration: {svc.duration}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className={`w-full py-2 rounded-xl text-xs font-bold transition mt-3 cursor-pointer ${
                                isFeatured
                                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md'
                                  : isDarkAesthetic
                                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                              }`}
                            >
                              Choose Plan
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* ============================================================ */
                /* LAYOUT 2: IMMERSIVE VISUAL SHOWCASE & METRIC PROOF           */
                /* ============================================================ */
                <div className="space-y-10">
                  {/* Full-Bleed Media Hero Showcase */}
                  <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl min-h-[320px] flex flex-col justify-end p-6 sm:p-8">
                    <img
                      src={archetype.previewImage}
                      alt={archetype.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

                    <div className="relative z-10 space-y-4 max-w-2xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-xs font-bold text-blue-300">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>{archetype.badge} &middot; Signature Experience</span>
                      </div>

                      <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                        {archetype.name}
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl drop-shadow-sm">
                        {archetype.tagline}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 cursor-pointer"
                          style={{ backgroundColor: themeColor }}
                        >
                          <span>Reserve VIP Experience</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* High-Impact Stat Metrics Grid */}
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border ${
                      isDarkAesthetic ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-xl font-extrabold text-blue-500">99.4%</div>
                      <div className="text-xs font-bold">Client Satisfaction</div>
                      <div className="text-[10.5px] text-slate-400">Based on verified reviews</div>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-xl font-extrabold text-emerald-500">1,500+</div>
                      <div className="text-xs font-bold">Confirmed Reservations</div>
                      <div className="text-[10.5px] text-slate-400">Handled automatically</div>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-xl font-extrabold text-indigo-500">&lt; 15 sec</div>
                      <div className="text-xs font-bold">AI Concierge Triage</div>
                      <div className="text-[10.5px] text-slate-400">Instant answers 24/7</div>
                    </div>
                  </div>

                  {/* Horizontal Capability / Service Rows */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold">Studio Capabilities &amp; Services</h3>
                      <p className={`text-xs ${isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'}`}>
                        Comprehensive services designed to deliver peak satisfaction.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {sampleServices.map((svc, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            isDarkAesthetic
                              ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold">{svc.title}</h4>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {svc.duration}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] leading-relaxed max-w-xl ${
                                isDarkAesthetic ? 'text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {svc.desc}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-blue-500">{svc.price}</div>
                              <div className="text-[9px] text-slate-400">All-Inclusive</div>
                            </div>
                            <button
                              type="button"
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                              style={{ backgroundColor: themeColor }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Architectural Features Overview */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  isDarkAesthetic
                    ? 'bg-slate-900/40 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Archetype Architectural Specs:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {archetype.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: themeColor }}
                      />
                      <span className={isDarkAesthetic ? 'text-slate-300' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            Back to Design Archetypes
          </button>

          {onSelectArchetype && (
            <button
              type="button"
              onClick={() => {
                onSelectArchetype(archetype.id);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Select &amp; Apply {archetype.name}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  Scale,
  Shield,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Briefcase,
  Users,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  CheckCheck,
  XCircle,
  Building2,
  Lock,
  Zap,
  Gavel,
  FileCheck,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';
import { getThemePalette } from '@/lib/landing/types';

export const LegalTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  currentTheme,
  onOpenBooking,
  onOpenChat,
}) => {
  const [claimAmount, setClaimAmount] = useState<number>(2500000);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Dynamic theme palette ensuring NO amber bleed when blue, emerald, etc. is chosen
  const palette = currentTheme || getThemePalette(config.themeColor, 'legal');

  // Archetype variation: legal_prestige, legal_modern, legal_trial
  const archetype = config.designArchetype || 'legal_prestige';

  const honors = [
    'CHAMBERS GLOBAL BAND 1: COMMERCIAL LITIGATION',
    'THE AMERICAN LAWYER: TOP 50 LITIGATION DEPARTMENT',
    'OVER $850M RECOVERED FOR CORPORATE PLAINTIFFS',
    'FORMER SDNY ASSISTANT US ATTORNEYS ON PARTNERSHIP',
    '98.4% VERIFIED ARBITRATION & TRIAL SUCCESS RATE',
    'LEXISNEXIS PEER REVIEWED: AV PREEMINENT RATING',
  ];

  const practices = [
    {
      title: 'Commercial Litigation & Arbitration',
      desc: 'Complex breach of contract, joint venture dissolutions, and multi-jurisdictional ICC/LCIA arbitration proceedings.',
      badge: 'Trial Practice',
    },
    {
      title: 'Cross-Border M&A & Private Equity',
      desc: 'Structuring strategic buyouts, CFIUS clearance reviews, and hostile takeover defense for international conglomerates.',
      badge: 'Corporate Advisory',
    },
    {
      title: 'Intellectual Property & Trade Secrets',
      desc: 'High-stakes patent infringement trials, semiconductor ITC exclusion orders, and non-compete injunctive relief.',
      badge: 'Patent Trial & Appeal',
    },
    {
      title: 'White Collar & Regulatory Enforcement',
      desc: 'DOJ, SEC, and CFTC enforcement defense, internal FCPA corporate investigations, and congressional subpoenas.',
      badge: 'Federal Defense',
    },
  ];

  const caseResults = [
    {
      result: '$142,500,000 Verdict',
      matter: 'Breach of Fiduciary Duty & Trade Secret Theft',
      court: 'Delaware Court of Chancery',
      summary: 'Secured full damages and permanent worldwide injunction for enterprise software innovator against former majority shareholder.',
    },
    {
      result: 'Complete Defense Dismissal',
      matter: '$85M Securities Fraud Class Action',
      court: 'U.S. District Court, SDNY',
      summary: 'Won pre-discovery Rule 12(b)(6) dismissal with prejudice for publicly traded biotechnology client.',
    },
    {
      result: '$64,000,000 Settlement',
      matter: 'Cross-Border Supply Chain Distruption',
      court: 'ICC International Court of Arbitration, Paris',
      summary: 'Favorable multi-currency settlement recovered for international logistics holding group.',
    },
  ];

  const partners = [
    {
      name: 'Eleanor Vance, JD',
      role: 'Managing Partner · Commercial Litigation',
      cred: 'Former Assistant U.S. Attorney, SDNY · Harvard Law Review',
      focus: 'Bet-the-company jury trials, securities defense, Chancery Court',
    },
    {
      name: 'Sterling Montgomery, LLM',
      role: 'Head of M&A & Private Equity',
      cred: '22 Years Leading Cross-Border Buyouts · Oxford & Columbia Law',
      focus: 'Hostile takeovers, sovereign wealth capital, CFIUS filings',
    },
    {
      name: 'Dr. Arthur Sterling, PhD, JD',
      role: 'Director of IP & Patent Litigation',
      cred: 'PhD in Electrical Engineering (MIT) · Stanford Law',
      focus: 'Semiconductor patents, federal appellate defense, ITC disputes',
    },
  ];

  const faqs = [
    {
      q: 'Are initial consultations protected under Attorney-Client Privilege?',
      a: 'Yes. All communications submitted through our intake portal or discussed with our senior attorneys are strictly governed by legal ethics rules and Attorney-Client Privilege.',
    },
    {
      q: 'What billing models do you offer for corporate litigation?',
      a: 'We offer traditional hourly retainers, blended fee caps, risk-sharing contingency arrangements for plaintiffs, and fixed monthly advisory retainers for general counsel outsourcing.',
    },
    {
      q: 'How rapidly can your firm file for emergency temporary restraining orders (TROs)?',
      a: 'Our emergency litigation squad can mobilize and file federal or state court TRO applications within 12 to 24 hours to freeze contested assets or stop trade secret dissipation.',
    },
    {
      q: 'Do you handle cross-border disputes outside the United States?',
      a: 'Yes. Our attorneys are admitted to practice in New York, London, and international tribunals including the ICC, LCIA, and Singapore International Arbitration Centre (SIAC).',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#080B10] text-slate-100' : 'bg-[#FAFAF9] text-slate-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color={palette.accentBg} />

      {/* 1. TOP HONORS & PRIVILEGE RIBBON */}
      <div className={`border-b py-2 px-4 text-xs font-serif ${
        isDark ? 'border-slate-800 bg-[#05070B] text-slate-400' : 'border-slate-200 bg-white text-slate-700 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className={`w-3.5 h-3.5 ${palette.accentText}`} />
            <span className="font-bold text-slate-900 dark:text-white uppercase">{config.businessName || 'APEX LEGAL PARTNERS LLP'}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>
              {archetype === 'legal_trial'
                ? 'High-Impact Emergency Litigation Squad'
                : archetype === 'legal_modern'
                ? 'Corporate Governance & Tech Advisory'
                : 'Chambers Global Band 1 Litigation'}
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Attorney-Client Privilege Protected</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-sans text-slate-500">
            <span>New York · London · Washington D.C.</span>
            <span>24/7 Emergency Injunction Hotline</span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-serif tracking-wider uppercase border ${palette.accentBorder} ${palette.lightBg} ${palette.accentText}`}>
              <Shield className="w-3.5 h-3.5" />
              <span>
                {config.badgeText ||
                  (archetype === 'legal_trial'
                    ? 'Emergency Trial Squad & Asset Freezes'
                    : archetype === 'legal_modern'
                    ? 'Premier M&A & General Counsel Advisory'
                    : 'Uncompromising Defense & Strategic Corporate Counsel')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.08]">
              {config.heroHeadline || (
                archetype === 'legal_trial' ? (
                  <>
                    Courtroom Precision. <br />
                    <span className={`italic ${palette.accentText}`}>
                      Aggressive Verdict Recovery.
                    </span>
                  </>
                ) : archetype === 'legal_modern' ? (
                  <>
                    Strategic Counsel. <br />
                    <span className={`italic ${palette.accentText}`}>
                      Built for Modern Enterprise.
                    </span>
                  </>
                ) : (
                  <>
                    Defending Capital. <br />
                    <span className={`italic ${palette.accentText}`}>
                      Securing Defining Outcomes.
                    </span>
                  </>
                )
              )}
            </h1>

            <p className={`text-base sm:text-xl ${isDark ? 'text-slate-300' : 'text-slate-600'} font-light max-w-2xl leading-relaxed`}>
              {config.heroSubheadline ||
                `${config.businessName || 'Apex Legal Partners'} provides premier trial representation, cross-border governance, and regulatory defense for market leaders and high-stakes innovators.`}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className={`px-8 py-4 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-serif font-bold text-sm tracking-wide shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer`}
              >
                <Lock className="w-4 h-4" />
                <span>{config.heroCtaText || 'Confidential Case Evaluation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenChat}
                className={`px-6 py-4 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <MessageSquare className={`w-4 h-4 ${palette.accentText}`} />
                <span>Privileged Intake Chat</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCheck className={`w-4 h-4 ${palette.accentText}`} />
                <span>Attorney-Client Privileged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${palette.accentText}`} />
                <span>2-Hour Rapid Intake Review</span>
              </div>
            </div>
          </div>

          {/* Hero Media / Image Column */}
          <div className="lg:col-span-5 relative">
            {config.heroImageUrl ? (
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl group">
                <img
                  src={config.heroImageUrl}
                  alt={config.businessName || 'Legal Firm'}
                  className="w-full h-96 sm:h-[440px] object-cover object-center group-hover:scale-102 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Overlay Credentials Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl backdrop-blur-md bg-black/60 border border-white/10 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      {archetype === 'legal_trial' ? 'EMERGENCY TRIAL SQUAD' : 'VERIFIED LITIGATION BENCH'}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">98.4% Win Rate</span>
                  </div>
                  <div className="text-lg font-serif font-bold">$850,000,000+ Recovered &amp; Defended</div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Across Federal District Courts, Delaware Chancery, and international arbitration tribunals.
                  </p>
                </div>
              </div>
            ) : (
              <TiltCard
                maxTilt={6}
                className={`p-8 rounded-3xl border shadow-xl ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono font-bold uppercase text-slate-500">VERIFIED LITIGATION BENCH</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">98.4% Win Rate</span>
                </div>

                <div className="py-6 space-y-4">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs font-mono text-slate-500 uppercase">Capital Recovered &amp; Defended</div>
                    <div className="text-3xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">$850,000,000+</div>
                    <div className="text-xs text-slate-500 mt-1">Across federal, Delaware Chancery, and arbitration panels.</div>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs font-mono text-slate-500 uppercase">Judicial Injunction Response</div>
                    <div className={`text-2xl font-serif font-bold ${palette.accentText} mt-0.5`}>&lt; 18 Hours</div>
                    <div className="text-xs text-slate-500 mt-1">Rapid emergency asset-freeze mobilization.</div>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono text-slate-500 text-center">
                  All inquiries reviewed by partner within 2 hours.
                </div>
              </TiltCard>
            )}
          </div>
        </div>
      </section>

      {/* 3. KINETIC TICKER */}
      <section className={`py-5 border-y ${
        isDark ? 'border-slate-800 bg-[#05070B]' : 'border-slate-200 bg-slate-100/70'
      }`}>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {honors.map((honor, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider whitespace-nowrap ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-800 shadow-2xs'
              }`}
            >
              {honor}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* ABOUT THE FIRM SECTION (IF CONFIGURED) */}
      {(config.aboutTitle || config.aboutText) && (
        <section className={`py-20 border-b ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-white'}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>
                  {config.aboutSubtitle || 'About Our Practice'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                  {config.aboutTitle || `About ${config.businessName}`}
                </h2>
                <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {config.aboutText}
                </p>
                {config.founderName && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    {config.founderImageUrl && (
                      <img src={config.founderImageUrl} alt={config.founderName} className="w-12 h-12 rounded-full object-cover" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{config.founderName}</div>
                      <div className="text-xs text-slate-500 font-mono">{config.founderRole || 'Managing Partner'}</div>
                    </div>
                  </div>
                )}
              </div>
              {config.aboutImageUrl && (
                <div className="md:col-span-4">
                  <img src={config.aboutImageUrl} alt={config.aboutTitle || 'About'} className="w-full h-64 object-cover rounded-2xl shadow-md border border-slate-700/40" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. FOUR CORE PRACTICE AREAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>
            {config.featuresSubtitle || 'Practice Groups'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            {config.featuresTitle || 'Core Areas of Distinction'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practices.map((practice, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-mono font-bold ${palette.accentText}`}>{practice.badge}</span>
                <span className="text-xs font-mono text-slate-400">PRACTICE 0{idx + 1}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">{practice.title}</h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                {practice.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LANDMARK RESULTS SUMMARY */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Precedent Record</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              Representative Case Precedents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseResults.map((item, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-2xl border flex flex-col justify-between ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="text-xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mb-2">{item.result}</div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{item.matter}</h4>
                  <div className="text-xs font-mono text-slate-500 mb-3">{item.court}</div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 5-PHASE LITIGATION ROADMAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Litigation Strategy</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            The 5-Phase Trial Lifecycle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { num: '01', name: 'Privileged Intake', desc: 'Comprehensive evidentiary review under strict attorney-client protection.' },
            { num: '02', name: 'Motion Practice', desc: 'Aggressive pre-discovery motions to dismiss or compel jurisdiction.' },
            { num: '03', name: 'Electronic Discovery', desc: 'Digital forensic extraction, predictive coding, and deposition subpoenas.' },
            { num: '04', name: 'Settlement Caucus', desc: 'High-leverage mediation to force capitulation on client terms.' },
            { num: '05', name: 'Trial & Verdict', desc: 'Mastery of jury persuasion and federal appellate preservation.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`text-xl font-mono font-bold ${palette.accentText} mb-2`}>{item.num}</div>
              <h4 className="text-sm font-serif font-bold text-slate-900 dark:text-white mb-1.5">{item.name}</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SERVICES & RETAINERS (FROM CONFIG.SERVICES) */}
      <section id="services" className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>
              {config.servicesSubtitle || 'Retainer Schedules'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              {config.servicesTitle || 'Legal Retainers & Consultations'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(config.services || []).map((service) => (
              <TiltCard
                key={service.id}
                className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                  service.popular
                    ? isDark
                      ? `bg-slate-900 ${palette.accentBorder} shadow-xl ring-1 ring-blue-500/30`
                      : `bg-white ${palette.accentBorder} shadow-md ring-1 ring-blue-500`
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div>
                  {service.popular && (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${palette.lightBg} ${palette.accentText} border ${palette.accentBorder} mb-3`}>
                      Priority Representation
                    </span>
                  )}
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{service.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className={`text-3xl font-mono font-bold ${palette.accentText}`}>
                      {service.price === 0 ? 'Complimentary' : `$${service.price}`}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/ {service.durationMinutes} min</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-3 leading-relaxed`}>
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    onClick={() => onOpenBooking(service.id)}
                    className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                      service.popular
                        ? `${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} shadow-sm`
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reserve Retainer Slot</span>
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 8. COMPARISON TABLE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Standard of Excellence</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-1 text-slate-900 dark:text-white">
            {config.businessName || 'Apex Tier-1'} vs Standard Law Firms
          </h2>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <th className="p-4 sm:p-5 font-semibold">Litigation Metric</th>
                  <th className={`p-4 sm:p-5 font-bold ${palette.accentText}`}>{config.businessName || 'Apex Legal Partners'}</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-500">Standard Billable Law Firms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  {
                    m: 'Lead Trial Attorney Experience',
                    apex: 'Former Federal Prosecutors & Equity Partners',
                    trad: 'Delegated to first- and second-year associates',
                  },
                  {
                    m: 'Emergency Injunction Agility',
                    apex: 'Sub-18 hour statewide emergency filing capability',
                    trad: '3-5 business days administrative delay',
                  },
                  {
                    m: 'Fee Alignment & Transparency',
                    apex: 'Capped budgets, success bonuses, value retainers',
                    trad: 'Uncapped hourly billables incentivizing protracted litigation',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                    <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-white">{row.m}</td>
                    <td className={`p-4 sm:p-5 font-semibold ${palette.accentText} flex items-center gap-2`}>
                      <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.apex}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{row.trad}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. PARTNER PROFILES */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Leadership</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              Senior Trial Partners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="text-lg font-serif font-bold text-slate-900 dark:text-white">{partner.name}</div>
                <div className={`text-xs font-mono ${palette.accentText} mb-1`}>{partner.role}</div>
                <div className="text-xs text-slate-500 font-mono mb-3">{partner.cred}</div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Specialization: {partner.focus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Intake &amp; Ethics</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Legal Consultation FAQ</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors ${
                  isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 ${palette.accentText} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`px-5 pb-4 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className={`text-3xl sm:text-5xl font-serif font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {config.ctaHeadline || 'Schedule a Confidential Case Evaluation'}
          </h3>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-xl mx-auto`}>
            {config.ctaSubheadline || 'Discuss your dispute or corporate matter under full Attorney-Client Privilege protection.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className={`px-8 py-3.5 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-serif font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer`}
            >
              {config.ctaButtonText || 'Request Partner Retainer Review'}
            </button>
            <button
              onClick={onOpenChat}
              className={`px-6 py-3.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'} font-semibold text-xs tracking-wider uppercase border transition-colors flex items-center gap-2 cursor-pointer`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${palette.accentText}`} />
              <span>Privileged Counsel Chat</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

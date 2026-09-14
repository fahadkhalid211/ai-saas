'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Lock,
  Wallet,
  Landmark,
  CreditCard,
  Percent,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sliders,
  DollarSign,
  Activity,
  Cpu,
  CheckCheck,
  XCircle,
  FileCheck2,
  Building,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';

export const FintechTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(500000);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const annualApy = 0.086; // 8.6% real blended fiduciary yield

  const estimatedOneYear = Math.round(depositAmount * (1 + annualApy));
  const estimatedThreeYear = Math.round(depositAmount * Math.pow(1 + annualApy, 3));
  const annualGains = estimatedOneYear - depositAmount;

  const yieldPartners = [
    'BLACKROCK TOKENIZED TREASURIES (BUIDL)',
    'FIDELITY DIGITAL ASSETS',
    'BNY MELLON CUSTODY',
    'STATE STREET GLOBAL ADVISORS',
    'FRANKLIN TEMPLETON ONSITE',
    'COINBASE PRIME LIQUIDITY',
    'ANCHORAGE DIGITAL BANK',
  ];

  const pillars = [
    {
      title: 'Automated Tax Alpha & Harvesting',
      desc: 'Daily algorithmic micro-loss harvesting offsetting capital gains to generate 1.8% to 2.4% net annualized tax alpha.',
      badge: 'Direct Indexing',
    },
    {
      title: 'Multi-Jurisdictional Vault Custody',
      desc: 'Air-gapped cryptographic MPC key shards distributed across sovereign Swiss and Singaporean deep-rock facilities.',
      badge: 'FIPS 140-3 L4',
    },
    {
      title: 'Real-Time Merkle Proof of Reserves',
      desc: 'Continuous on-chain solvency verification with automated public attestations published every 60 seconds.',
      badge: 'Continuous Audit',
    },
    {
      title: 'Intergenerational Estate Architecture',
      desc: 'Smart contract inheritance vaults paired with irrevocable trust governance ensuring seamless succession without probate.',
      badge: 'Dynasty Trusts',
    },
  ];

  const tiers = [
    {
      name: 'Private Client',
      minimum: '$250,000 Minimum',
      fee: '35 bps AUM',
      features: ['Direct Indexing & Loss Harvesting', 'Dedicated Fiduciary Advisor', 'FDIC Sweep Accounts up to $5M', 'Monthly Fiduciary Review'],
      recommended: false,
    },
    {
      name: 'Qualified Purchaser',
      minimum: '$2,500,000 Minimum',
      fee: '20 bps AUM',
      features: ['Private Credit Co-Investments', 'Multi-Jurisdiction Sovereign Vaults', 'Custom Algorithmic Treasury Routing', 'Weekly CIO Briefing & Concierge'],
      recommended: true,
    },
    {
      name: 'Multi-Family Office',
      minimum: '$10,000,000+ Minimum',
      fee: 'Bespoke Advisory Fee',
      features: ['Single-Tenant Smart Contracts', 'Direct Custody Node In-House', 'Off-Market Secondary Liquidity Access', '24/7 Priority Emergency Line'],
      recommended: false,
    },
  ];

  const faqs = [
    {
      q: 'How are client assets protected against institutional insolvency?',
      a: 'All assets are held in segregated, bankruptcy-remote trust accounts at qualified custodians (including BNY Mellon and State Street). Assets are never rehypothecated or commingled.',
    },
    {
      q: 'What is the fiduciary fee structure and are there hidden commissions?',
      a: 'We operate as an uncompromised fee-only fiduciary. We accept zero 12b-1 kickbacks, zero payment for order flow (PFOF), and zero soft-dollar arrangements.',
    },
    {
      q: 'How does automated tax-loss harvesting operate in practice?',
      a: 'Our algorithmic trading engine monitors your direct index portfolio continually, replacing down-trending equities with correlated proxies to harvest tax deductions while preserving market exposure.',
    },
    {
      q: 'What is the onboarding protocol for existing brokerage transfers?',
      a: 'We execute ACATS transfers with zero liquidation requirements, preventing involuntary capital gains tax realization during transition.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#050B0A] text-emerald-50' : 'bg-[#F4F9F7] text-slate-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color="bg-gradient-to-r from-emerald-400 via-teal-500 to-amber-400" />

      {/* 1. TOP REGULATORY & CUSTODY BANNER */}
      <div className={`border-b py-2.5 px-4 text-xs font-mono ${
        isDark ? 'border-emerald-950 bg-[#020706] text-emerald-300/80' : 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-bold">SEC REGISTERED INVESTMENT ADVISOR</span>
            <span className="hidden sm:inline text-emerald-400/40">|</span>
            <span className="text-emerald-700 dark:text-emerald-400">FDIC-Insured Sweeps up to $5M</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-emerald-600 dark:text-emerald-400/70">
            <span>FIPS 140-3 Level 4 Custody</span>
            <span>100% Real-Time Reserves</span>
          </div>
        </div>
      </div>

      {/* 2. HERO: OBSIDIAN & EMERALD LASER WEALTH MANAGEMENT */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest ${
              isDark ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sovereign Wealth &amp; Algorithmic Yield Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium tracking-tight leading-[1.08]">
              {config.heroHeadline || (
                <>
                  Sovereign Capital <br />
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300 bg-clip-text text-transparent">
                    In The Algorithmic Era
                  </span>
                </>
              )}
            </h1>

            <p className={`text-base sm:text-xl ${isDark ? 'text-emerald-100/70' : 'text-slate-600'} font-light max-w-2xl leading-relaxed`}>
              {config.heroSubheadline ||
                'Direct treasury management, on-chain asset segregation, and zero-counterparty algorithmic yield for private family offices and ultra-high-net-worth founders.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenBooking()}
                className="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Schedule Fiduciary Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenChat}
                className={`px-6 py-4 rounded-xl border font-semibold text-sm transition-all flex items-center gap-2.5 cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-emerald-900 text-emerald-100'
                    : 'bg-white hover:bg-slate-50 border-emerald-200 text-slate-800 shadow-sm'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ask Portfolio Strategist</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Yield Simulator Dial */}
          <div className="lg:col-span-5">
            <TiltCard
              maxTilt={6}
              className={`p-8 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-950/80 border-emerald-900/60 shadow-xl shadow-emerald-950/20' : 'bg-white border-emerald-200 shadow-lg shadow-emerald-100'
              }`}
            >
              <div className="flex items-center justify-between pb-6 border-b border-emerald-100 dark:border-emerald-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Active Fiduciary Yield
                  </span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  8.6% Net APY
                </span>
              </div>

              {/* Slider Controls */}
              <div className="py-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-mono text-slate-500 uppercase">Principal Allocation</span>
                  <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                    ${depositAmount.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="50000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>$100,000</span>
                  <span>$2,500,000</span>
                  <span>$5,000,000+</span>
                </div>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-slate-900/70 border-emerald-950' : 'bg-emerald-50/60 border-emerald-100'
                }`}>
                  <div className="text-[11px] font-mono text-slate-500">12-Month Net Growth</div>
                  <div className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    +${annualGains.toLocaleString()}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-slate-900/70 border-emerald-950' : 'bg-emerald-50/60 border-emerald-100'
                }`}>
                  <div className="text-[11px] font-mono text-slate-500">36-Month Compounded</div>
                  <div className="text-lg font-mono font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                    ${estimatedThreeYear.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lock In Qualified Custody</span>
                </button>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* 3. KINETIC CUSTODIAL MARQUEE */}
      <section className={`py-6 border-y ${
        isDark ? 'border-emerald-950 bg-[#020706]' : 'border-emerald-200 bg-white shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
            Settled via Sovereign Institutional Custodians &amp; Liquidity Partners
          </span>
        </div>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {yieldPartners.map((item, idx) => (
            <div
              key={idx}
              className={`px-5 py-2 rounded-xl border text-xs font-mono font-bold tracking-wider whitespace-nowrap ${
                isDark
                  ? 'border-emerald-950 bg-slate-900/60 text-emerald-300 hover:border-emerald-700'
                  : 'border-emerald-200 bg-emerald-50/40 text-emerald-900 hover:border-emerald-300'
              }`}
            >
              {item}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 4. FOUR PILLARS OF WEALTH ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">Institutional Defense</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Architecture of Capital Preservation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-950/70 border-emerald-950 hover:border-emerald-800' : 'bg-white border-emerald-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.badge}</span>
                <span className="text-xs font-mono text-slate-400">0{idx + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-emerald-100/70' : 'text-slate-600'} leading-relaxed`}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ASSET TIER MATRIX */}
      <section className={`py-20 border-t ${isDark ? 'border-emerald-950 bg-[#020706]' : 'border-emerald-200 bg-emerald-50/40'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">Client Classification</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              Institutional Tier Structure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl border flex flex-col justify-between transition-all ${
                  tier.recommended
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 shadow-xl ring-1 ring-emerald-500/30'
                      : 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : isDark
                    ? 'bg-slate-950/80 border-emerald-950 shadow-xs'
                    : 'bg-white border-emerald-200 shadow-xs'
                }`}
              >
                <div>
                  {tier.recommended && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-3">
                      Primary Institutional Tier
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                  <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 mt-1">{tier.minimum}</div>
                  <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-4">{tier.fee}</div>

                  <ul className="space-y-2.5 mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-950 text-xs text-slate-600 dark:text-slate-300">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6">
                  <button
                    onClick={() => onOpenBooking()}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer ${
                      tier.recommended
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Apply for Qualification
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 4-STAGE ONBOARDING ROADMAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">Fiduciary Process</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Seamless Custody Transfer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Confidential Audit', desc: 'Holistic portfolio diagnostic uncovering hidden expense ratios and embedded capital gains liabilities.' },
            { step: '02', title: 'Tax-Neutral ACATS', desc: 'Direct in-kind asset transfer into qualified custodian trust accounts without triggering taxable sales.' },
            { step: '03', title: 'Algorithmic Direct Index', desc: 'Reconstruction of core equity holdings into bespoke direct-index baskets with daily tax harvesting.' },
            { step: '04', title: 'Sovereign Rebalance', desc: 'Continuous risk-adjusted yield optimization across Treasury sweeps and qualified private credit.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${
                isDark ? 'bg-slate-950/70 border-emerald-950' : 'bg-white border-emerald-200'
              }`}
            >
              <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">{item.step}</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className={`text-xs ${isDark ? 'text-emerald-100/70' : 'text-slate-600'} leading-relaxed`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. VERIFIED FAMILY OFFICE CASE STUDIES */}
      <section className={`py-20 border-t ${isDark ? 'border-emerald-950 bg-[#020706]' : 'border-emerald-200 bg-emerald-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">Proven Outcomes</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Representative Engagements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: '$48M Tech Founder Liquidity Event',
                situation: 'Founder exited AI enterprise software firm with heavy California state and federal capital gains exposure.',
                solution: 'Constructed an in-kind Charitable Remainder Unitrust (CRUT) paired with algorithmic direct index tax harvesting.',
                results: ['$6.4M Immediate Tax Savings', '8.2% Annualized Distribution Yield', 'Zero Single-Stock Concentration Risk'],
              },
              {
                title: '$85M Intergenerational Manufacturing Succession',
                situation: 'Family patriarch transitioning multi-state industrial manufacturing holding company to 3rd generation heirs.',
                solution: 'Established multi-jurisdictional Wyoming dynasty trusts and diversified liquid treasury reserves into tokenized bills.',
                results: ['100% Probate Avoidance', 'Estate Tax Burden Reduced by 38%', 'Quarterly Automated Distribution Vaults'],
              },
            ].map((cs, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-emerald-950' : 'bg-white border-emerald-200 shadow-sm'
                }`}
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{cs.title}</h3>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-3`}>
                  <strong>Situation:</strong> {cs.situation}
                </p>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-5`}>
                  <strong>Fiduciary Solution:</strong> {cs.solution}
                </p>
                <div className="border-t border-emerald-100 dark:border-emerald-900/60 pt-4 space-y-2">
                  {cs.results.map((res, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FIDUCIARY VS TRADITIONAL BROKERAGE COMPARISON */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">Fiduciary Standard</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Why Pure Fiduciary Matters</h2>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-emerald-950 bg-slate-950' : 'border-emerald-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-emerald-950 bg-slate-900 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
                  <th className="p-4 sm:p-5 font-semibold">Standard of Care</th>
                  <th className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400">Aether Fiduciary Advisory</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-500">Traditional Wirehouse Brokerage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 dark:divide-emerald-950">
                {[
                  {
                    standard: 'Legal Obligation',
                    aether: 'Strict Fiduciary Duty to Client at All Times',
                    wire: 'Suitability Standard only (Sales quota driven)',
                  },
                  {
                    standard: 'Revenue Sources',
                    aether: 'Transparent AUM fee only. Zero kickbacks.',
                    wire: 'Hidden commissions, 12b-1 fees, PFOF spreads',
                  },
                  {
                    standard: 'Tax Optimization',
                    aether: 'Daily Algorithmic Direct Index Loss Harvesting',
                    wire: 'Annual manual review or mutual fund capital distributions',
                  },
                  {
                    standard: 'Custody Independence',
                    aether: 'Segregated BNY Mellon / State Street Custody',
                    wire: 'Proprietary balance sheet commingled risk',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                    <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-white">{row.standard}</td>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.aether}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{row.wire}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. SERVICES & FIDUCIARY CONSULTATIONS (FROM CONFIG) */}
      <section id="services" className={`py-20 border-t ${isDark ? 'border-emerald-950 bg-[#020706]' : 'border-emerald-200 bg-emerald-50/40'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">Advisory Sessions</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Confidential Consultation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(config.services || []).map((service) => (
              <TiltCard
                key={service.id}
                className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                  service.popular
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 shadow-xl ring-1 ring-emerald-500/30'
                      : 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : isDark
                    ? 'bg-slate-950/80 border-emerald-950 shadow-xs'
                    : 'bg-white border-emerald-200 shadow-xs'
                }`}
              >
                <div>
                  {service.popular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-3">
                      Recommended Initial Session
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{service.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {service.price === 0 ? 'Complimentary' : `$${service.price}`}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/ {service.durationMinutes} min</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-emerald-100/70' : 'text-slate-600'} mt-3 leading-relaxed`}>
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    onClick={() => onOpenBooking(service.id)}
                    className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                      service.popular
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reserve Fiduciary Slot</span>
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">Custody &amp; Compliance</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Frequently Addressed Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors ${
                  isDark ? 'border-emerald-950 bg-slate-950' : 'border-emerald-200 bg-white shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`px-5 pb-4 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-emerald-100/70' : 'text-slate-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. INVESTMENT COMMITTEE & CHIEF FIDUCIARY OFFICERS */}
      <section className={`py-20 border-t ${isDark ? 'border-emerald-950 bg-[#020706]' : 'border-emerald-200 bg-emerald-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">Leadership</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">The Investment Committee</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Arthur Kensington, CFA',
                role: 'Chief Investment Officer',
                bio: 'Former Managing Director of Quantitative Fixed Income at BlackRock. 24 years leading sovereign asset allocation.',
              },
              {
                name: 'Victoria Chen, JD, LLM',
                role: 'Head of Estate Architecture',
                bio: 'Former Partner at Sullivan & Cromwell specializing in intergenerational trust structuring and cross-border tax treaty optimization.',
              },
              {
                name: 'Dr. Henrik Staehelin',
                role: 'Head of Algorithmic Execution',
                bio: 'PhD in Stochastic Calculus from ETH Zurich. Architected the direct-index high-frequency tax loss harvesting engine.',
              },
            ].map((member, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-slate-950/70 border-emerald-950' : 'bg-white border-emerald-200'
                }`}
              >
                <div className="text-base font-bold text-slate-900 dark:text-white">{member.name}</div>
                <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 mb-3">{member.role}</div>
                <p className={`text-xs ${isDark ? 'text-emerald-100/70' : 'text-slate-600'} leading-relaxed`}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FINAL DISCLOSURE & CONSULTATION CTA */}
      <section className={`py-20 border-t ${isDark ? 'border-emerald-950 bg-slate-950' : 'border-emerald-200 bg-slate-900 text-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
            Protect &amp; Compound Your Family Balance Sheet
          </h3>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-light">
            Private client onboarding is strictly limited to ensure institutional-grade attention for every qualified account.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              Initiate Private Client Onboarding
            </button>
            <button
              onClick={onOpenChat}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs tracking-wider uppercase border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confidential Fiduciary Chat</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  Award,
  ChevronRight,
  ChevronDown,
  Sparkles,
  MessageSquare,
  ArrowRight,
  DollarSign,
  Building,
  CheckCheck,
  XCircle,
  Key,
  Compass,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';
import { getThemePalette } from '@/lib/landing/types';

export const RealEstateTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  currentTheme,
  onOpenBooking,
  onOpenChat,
}) => {
  const palette = currentTheme || getThemePalette(config.themeColor, 'real_estate');

  const [propertyPrice, setPropertyPrice] = useState<number>(4500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.2);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const loanAmount = propertyPrice * (1 - downPaymentPercent / 100);
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = 360; // 30-year fixed
  const estimatedMonthly =
    monthlyRate > 0
      ? Math.round(
          (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
            (Math.pow(1 + monthlyRate, numPayments) - 1)
        )
      : Math.round(loanAmount / numPayments);

  const marketStats = [
    'MANHATTAN ULTRA-LUXURY: $3,420 / SQFT',
    'BEVERLY HILLS TROPHY ESTATES: 42 DAYS AVG DOM',
    'ASPEN MOUNTAIN RESIDENCES: 94% ASKING REALIZATION',
    'MIAMI BRICKELL PENTHOUSES: +14.2% YOY CAPITAL APPRECIATION',
    'OFF-MARKET PRIVATE INVENTORY: $420M CONFIGURED',
  ];

  const properties = [
    {
      title: 'The Sky Penthouse at Central Park',
      price: '$18,500,000',
      beds: 5,
      baths: 6.5,
      sqft: '6,420 sqft',
      location: 'Central Park South, New York',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
    },
    {
      title: 'Montecito Coastal Architectural Estate',
      price: '$14,200,000',
      beds: 6,
      baths: 8,
      sqft: '8,900 sqft',
      location: 'Montecito, California',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    },
    {
      title: 'The Bel-Air Promontory Villa',
      price: '$22,000,000',
      beds: 7,
      baths: 9.5,
      sqft: '11,200 sqft',
      location: 'Bel-Air, Los Angeles',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
    },
  ];

  const acquisitionStages = [
    { step: '01', title: 'Confidential Profiling', desc: 'NDA execution, liquidity verification, and tailored search criteria definition.' },
    { step: '02', title: 'Off-Market Access', desc: 'Direct access to pocket listings and private family trust dispositions before public MLS.' },
    { step: '03', title: 'Private Showing & Escort', desc: 'White-glove private viewings with architectural and structural engineering specialists.' },
    { step: '04', title: 'Contract & Escrow Security', desc: 'Custom purchase agreement structuring with high-tier privacy shielding and title defense.' },
  ];

  const faqs = [
    {
      q: 'How do you preserve confidentiality for high-profile buyers?',
      a: 'We routinely execute non-disclosure agreements prior to property disclosure and structure acquisitions through blind trusts or LLC entities to maintain absolute privacy.',
    },
    {
      q: 'Can you provide access to off-market and pocket properties?',
      a: 'Yes. Over 40% of our closed transactional volume occurs off-market through our direct network of private family offices and estate attorneys.',
    },
    {
      q: 'Do you assist with international foreign buyer regulations and tax structuring?',
      a: 'Our advisory team works directly with cross-border tax counsel and private banking partners to coordinate FIRPTA compliance and sovereign capital transfers.',
    },
    {
      q: 'What is your commission structure for seller representation?',
      a: 'We offer performance-tiered representation fees tailored to property tier, comprehensive architectural 3D media production, and global syndication.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#090C10] text-slate-100' : 'bg-[#FAFAF9] text-slate-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

      {/* 1. TOP PRIVATE ESTATES NETWORK BANNER */}
      <div className={`border-b py-2 px-4 text-xs font-mono ${
        isDark ? 'border-slate-800 bg-[#06080B] text-slate-400' : 'border-slate-200 bg-white text-slate-600 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-slate-900 dark:text-white">PRIME INTERNATIONAL REALTY</span>
            <span className="text-slate-400">|</span>
            <span>$1.4B+ Verified Closed Transactions</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Off-Market Private Inventory Desk</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Licensed in NY, CA, FL, CO</span>
            <span>Sotheby’s Alliance Member</span>
          </div>
        </div>
      </div>

      {/* 2. HERO: EDITORIAL LUXURY SHOWCASE */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-serif tracking-wider uppercase border ${
              isDark ? `${palette.accentBorder} ${palette.lightBg} ${palette.accentText}` : `${palette.accentBorder} ${palette.lightBg} ${palette.accentText}`
            }`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{config.badgeText || 'Curated Prime Residential & Architectural Estates'}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight leading-[1.08]">
              {config.heroHeadline || (
                <>
                  Exceptional Residences. <br />
                  <span className={`italic ${palette.accentText}`}>
                    Uncompromised Discretion.
                  </span>
                </>
              )}
            </h1>

            <p className={`text-base sm:text-xl ${isDark ? 'text-slate-300' : 'text-slate-600'} font-light max-w-2xl leading-relaxed`}>
              {config.heroSubheadline ||
                'Access the world’s most coveted off-market estates, penthouses, and coastal properties through our private client advisory.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenBooking()}
                className={`px-8 py-4 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-serif font-bold text-sm tracking-wide shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer`}
              >
                <Calendar className="h-4 w-4" />
                <span>{config.heroCtaText || 'Request Private Showing'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenChat}
                className={`px-6 py-4 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <MessageSquare className={`h-4 w-4 ${palette.accentText}`} />
                <span>Inquire With Estate Advisor</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl group">
              <img decoding="async"
                src={config.heroImageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'}
                alt={config.businessName || 'Luxury Estate'}
                className="w-full h-96 sm:h-[420px] object-cover object-center group-hover:scale-102 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl backdrop-blur-md bg-black/60 border border-white/10 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">Verified Prime Portfolio</div>
                  <div className="text-base font-serif font-bold">$1.4B+ Volume Closed</div>
                </div>
                <button
                  onClick={() => onOpenBooking()}
                  className={`px-3.5 py-1.5 rounded-lg ${palette.btnBg} ${palette.btnText} text-xs font-bold transition cursor-pointer`}
                >
                  Tour Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KINETIC TICKER */}
      <section className={`py-5 border-y ${
        isDark ? 'border-slate-800 bg-[#06080B]' : 'border-slate-200 bg-slate-100/70'
      }`}>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {marketStats.map((stat, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider whitespace-nowrap ${
                isDark ? 'border-slate-800 bg-slate-900 text-emerald-400' : 'border-slate-200 bg-white text-emerald-800 shadow-2xs'
              }`}
            >
              {stat}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 4. CURATED ESTATE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Featured Portfolio</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Curated Signature Residences
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {properties.map((prop, idx) => (
            <TiltCard
              key={idx}
              className={`rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="relative aspect-4/3 overflow-hidden bg-slate-950">
                  <img decoding="async" src={prop.image} alt={prop.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full font-mono text-xs font-bold bg-black/70 text-white backdrop-blur-md">
                    {prop.price}
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{prop.location}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4">{prop.title}</h3>

                  <div className={`flex items-center justify-between text-xs font-mono pt-4 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'}`}>
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {prop.beds} Beds</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.baths} Baths</span>
                    <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {prop.sqft}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-serif text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Schedule Confidential Viewing
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE MORTGAGE & FINANCING ESTIMATOR */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Investment Modeling</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-1 text-slate-900 dark:text-white">Luxury Financing Estimator</h2>
          </div>

          <div className={`p-8 rounded-3xl border space-y-6 ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-mono text-slate-500 uppercase">Target Property Valuation</span>
                <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">${propertyPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="25000000"
                step="250000"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-500 uppercase block mb-1">Down Payment ({downPaymentPercent}%)</label>
                <input
                  type="number"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border text-sm font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-500 uppercase block mb-1">Interest Rate ({interestRate}%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border text-sm font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border text-center ${isDark ? 'bg-slate-950 border-emerald-950' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="text-xs font-mono text-slate-500 uppercase">Estimated Monthly Principal &amp; Interest</div>
              <div className="text-3xl font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                ${estimatedMonthly.toLocaleString()} / mo
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">Based on 30-year fixed luxury jumbo debt structuring.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 4-STAGE ACQUISITION PROTOCOL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Confidential Process</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            The White-Glove Acquisition Journey
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {acquisitionStages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">{stage.step}</div>
              <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white mb-2">{stage.title}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>{stage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT US / HERITAGE & FIRM VALUES SECTION */}
      {(config.aboutTitle || config.aboutText) && (
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>
                {config.aboutSubtitle || 'Pedigree & Off-Market Intelligence'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                {config.aboutTitle || `About ${config.businessName}`}
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {config.aboutText}
              </p>
              {config.founderName && (
                <div className="pt-2 flex items-center gap-3">
                  {config.founderImageUrl && (
                    <img loading="lazy" decoding="async" src={config.founderImageUrl} alt={config.founderName} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{config.founderName}</div>
                    <div className="text-xs text-slate-500">{config.founderRole || 'Founder & Principal Broker'}</div>
                  </div>
                </div>
              )}
            </div>
            {config.aboutImageUrl && (
              <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-800">
                <img loading="lazy" decoding="async" src={config.aboutImageUrl} alt="About Us" className="w-full h-72 object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 7. SERVICES & PRIVATE CONSULTATIONS (FROM CONFIG.SERVICES) */}
      <section id="services" className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Advisory Tiers</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              {config.servicesTitle || 'Representation Services'}
            </h2>
            {config.servicesSubtitle && (
              <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {config.servicesSubtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(config.services || []).map((service) => (
              <TiltCard
                key={service.id}
                className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                  service.popular
                    ? isDark
                      ? 'bg-slate-900 border-emerald-500/60 shadow-xl ring-1 ring-emerald-500/30'
                      : 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div>
                  {service.popular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-3">
                      Priority Representation
                    </span>
                  )}
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{service.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-emerald-700 dark:text-emerald-400">
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
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reserve Showing Slot</span>
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
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Standard Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-1 text-slate-900 dark:text-white">Prime Private Advisory vs Traditional Brokers</h2>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <th className="p-4 sm:p-5 font-semibold">Service Level</th>
                  <th className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400">Prime Private Client Advisory</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-500">Traditional High-Street Brokers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  {
                    item: 'Off-Market Pocket Inventory',
                    prime: 'Direct private desk access to unlisted assets',
                    trad: 'Public MLS and Zillow search only',
                  },
                  {
                    item: 'Buyer Identity Protection',
                    prime: 'Mandatory NDA + Blind LLC Trust Structuring',
                    trad: 'Standard publicly accessible closing records',
                  },
                  {
                    item: 'Due Diligence Depth',
                    prime: 'Full architectural & structural engineering audits',
                    trad: 'Standard general home inspector checklist',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                    <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-white">{row.item}</td>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.prime}</span>
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

      {/* 9. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Frequently Addressed</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Luxury Acquisition FAQ</h2>
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
                  <ChevronDown className={`w-4 h-4 text-emerald-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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

      {/* 10. FINAL CTA */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className={`text-3xl sm:text-5xl font-serif font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {config.ctaHeadline || 'Schedule an Off-Market Consultation'}
          </h3>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-xl mx-auto`}>
            {config.ctaSubheadline || 'Connect with our managing directors to review pocket listings in Manhattan, Beverly Hills, and Miami.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className={`px-8 py-3.5 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-serif font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer`}
            >
              {config.ctaButtonText || 'Request Private Portfolio Access'}
            </button>
            <button
              onClick={onOpenChat}
              className={`px-6 py-3.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'} font-semibold text-xs tracking-wider uppercase border transition-colors flex items-center gap-2 cursor-pointer`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct Advisor Chat</span>
            </button>
          </div>
          {config.footerText && (
            <div className="pt-8 border-t border-slate-800/60 text-center text-xs text-slate-500">
              {config.footerText}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

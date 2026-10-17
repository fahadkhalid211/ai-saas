'use client';

import React, { useState } from 'react';
import {
  Scissors,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  CheckCheck,
  Flame,
  Users,
  Coffee,
  Check,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';
import { getThemePalette } from '@/lib/landing/types';

export const BarbershopTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const palette = getThemePalette(config.themeColor, 'barbershop');
  const archetype = config.designArchetype || 'barber_classic';

  const marqueeBadges = [
    'MASTER CRAFTSMANSHIP SINCE 2018',
    'TRADITIONAL JAPANESE STEEL STRAIGHT RAZORS',
    'COMPLIMENTARY ROASTED ESPRESSO & BOURBON',
    'HOT TOWEL STEAM WITH ORGANIC EUCALYPTUS',
    'EXECUTIVE MEMBERSHIP PRIVILEGES',
    'VINTAGE BELMONT BARBER CHAIRS',
  ];

  const styles = [
    {
      name: 'The Executive Scissor Cut',
      length: 'Medium / Textured',
      bestFor: 'Business leaders, timeless professional silhouette',
      tools: 'Handcrafted Japanese shears, organic matte pomade',
    },
    {
      name: 'The Low Taper Skin Fade',
      length: 'Graduated / Sharp',
      bestFor: 'Modern clean lines, angular jawline framing',
      tools: 'Zero-gap foil shaver, straight razor perimeter outline',
    },
    {
      name: 'The Royal Beard Sculpt & Shave',
      length: 'Custom Beard Architecture',
      bestFor: 'Full beard density, clean cheek and neck line definition',
      tools: 'Steam towel, botanical pre-shave oil, sandalwood balm',
    },
  ];

  const protocolSteps = [
    { step: '01', title: 'Consultation & Hair Diagnostic', desc: 'Face shape analysis, hair growth pattern inspection, and bespoke cut tailoring.' },
    { step: '02', title: 'Aromatherapy Pre-Wash', desc: 'Invigorating scalp wash using organic tea tree oil and warm water rinse.' },
    { step: '03', title: 'Precision Shear & Clipper Work', desc: 'Layered scissor tapering and graduation with micron-level hairline blending.' },
    { step: '04', title: 'Hot Eucalyptus Towel Steam', desc: 'Dual hot towel treatment relaxing the facial pores and softening coarse follicles.' },
    { step: '05', title: 'Japanese Straight Razor Edge', desc: 'Featherweight straight razor perimeter lining for razor-sharp edge definition.' },
    { step: '06', title: 'Cold Compress & Bay Rum Splash', desc: 'Iced botanical towel pore closure followed by heritage aftershave hydration.' },
    { step: '07', title: 'Signature Styling & Blowout', desc: 'Handcrafted blow-dry styling with custom matte clay or classic high-shine tonic.' },
  ];

  const masterBarbers = [
    {
      name: 'Julian Vance',
      title: 'Master Barber & Founder',
      exp: '16 Years in London & NYC',
      spec: 'Classic Scissor Taper & Scalloped Fades',
    },
    {
      name: 'Dario Moretti',
      title: 'Senior Grooming Specialist',
      exp: '11 Years in Milan & Florence',
      spec: 'Traditional Italian Hot Towel Straight Razor Shaving',
    },
    {
      name: 'Marcus Sterling',
      title: 'Beard Architect & Stylist',
      exp: '9 Years in Brooklyn Atelier',
      spec: 'Precision Beard Sculpting & Scalp Therapy',
    },
  ];

  const faqs = [
    {
      q: 'Do I need an appointment or do you accept walk-ins?',
      a: 'We accept walk-ins based on daily chair availability, though booking in advance with our AI scheduling assistant guarantees zero wait time upon arrival.',
    },
    {
      q: 'What complimentary amenities are provided with each appointment?',
      a: 'Every patron enjoys complimentary single-origin espresso, cold craft beverages, and our signature eucalyptus hot towel relaxation session.',
    },
    {
      q: 'What is your cancellation and rescheduling policy?',
      a: 'We kindly request a 2-hour advance notice for rescheduling so our master barbers can release the chair slot to waiting patrons.',
    },
    {
      q: 'Do you offer grooming packages for weddings and private events?',
      a: 'Yes. Our private atelier is available for full-shop buyouts, complete with private master barber staffing for bachelor and groomsmen parties.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#110D0A] text-amber-50' : 'bg-[#FCFAF7] text-slate-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500" />

      {/* 1. TOP ATELIER ANNOUNCEMENT BAR */}
      <div className={`border-b py-2 px-4 text-xs font-mono ${
        isDark ? 'border-amber-900/40 bg-[#0A0705] text-amber-200/80' : 'border-amber-200 bg-amber-50 text-amber-900'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold">HERITAGE BARBERSHOP &amp; ATELIER</span>
            <span className="hidden sm:inline text-amber-400/40">|</span>
            <span>Walk-in Wait: 15 Mins</span>
            <span className="hidden sm:inline text-amber-400/40">|</span>
            <span>Complimentary Espresso &amp; Bourbon</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-amber-700 dark:text-amber-400">
            <span>Tue-Sat: 9:00 AM - 8:00 PM</span>
            <span>SoHo, New York</span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION: HERITAGE LEATHER & STEEL */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Vintage Quality Badge */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border ${
              isDark ? 'border-amber-500/30 bg-amber-950/40 text-amber-400' : 'border-amber-300 bg-amber-100 text-amber-900'
            }`}>
              <Scissors className="h-3.5 w-3.5" />
              <span>{config.badgeText || 'Master Craftsmanship Since 2018 · NYC Premier Grooming'}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.1]">
              {config.heroHeadline || (
                <>
                  Look Sharp. Feel Confident. <br />
                  <span className="text-amber-600 dark:text-amber-400 italic">
                    The Premier Grooming Experience.
                  </span>
                </>
              )}
            </h1>

            {/* Subheadline */}
            <p className={`text-base sm:text-lg ${isDark ? 'text-amber-100/70' : 'text-slate-600'} max-w-2xl font-normal leading-relaxed`}>
              {config.heroSubheadline ||
                'Step into Crown & Blade where traditional craftsmanship meets modern style. Book your chair in under 60 seconds with our AI appointment assistant.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className={`px-7 py-3.5 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-bold text-sm shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer`}
              >
                <Calendar className="h-4 w-4" />
                <span>{config.heroCtaText || 'Reserve Your Chair'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenChat}
                className={`px-6 py-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? 'border-amber-900/60 bg-[#1A1410] text-amber-200 hover:bg-amber-950'
                    : 'border-amber-200 bg-white text-slate-800 hover:bg-amber-50/50 shadow-sm'
                }`}
              >
                <MessageSquare className="h-4 w-4 text-amber-500" />
                <span>Ask Barber Concierge</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-amber-700 dark:text-amber-300 font-medium">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Master Barbers Only</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Hot Towel Included</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className={`relative rounded-3xl overflow-hidden border-2 shadow-xl ${
              isDark ? 'border-amber-900/60 shadow-amber-950/40' : 'border-amber-300/80 shadow-amber-900/10'
            }`}>
              <img decoding="async"
                src={
                  config.heroImageUrl ||
                  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200'
                }
                alt="Crown & Blade Interior"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>LIVE CHAIR AVAILABILITY</span>
                </div>
                <div className="text-xl font-serif font-bold">Chair 1 &amp; 3 Available This Afternoon</div>
                <p className="text-xs text-slate-300 mt-1">Book now to secure Julian or Dario before walk-in rush.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KINETIC TICKER */}
      <section className={`py-5 border-y ${
        isDark ? 'border-amber-900/40 bg-[#0A0705]' : 'border-amber-200 bg-amber-50/70'
      }`}>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {marqueeBadges.map((badge, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider whitespace-nowrap ${
                isDark
                  ? 'border-amber-900/50 bg-[#1A1410] text-amber-300'
                  : 'border-amber-200 bg-white text-amber-900 shadow-2xs'
              }`}
            >
              {badge}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 4. INTERACTIVE CUT & BEARD MATCHER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Style Matcher</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Find Your Signature Silhouette
          </h2>
          <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-amber-100/70' : 'text-slate-600'}`}>
            Explore our hallmark cuts tailored to distinct head shapes and hair textures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {styles.map((style, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedStyle(idx)}
              className={`p-7 rounded-2xl border cursor-pointer transition-all ${
                selectedStyle === idx
                  ? isDark
                    ? 'border-amber-500 bg-[#1E1712] shadow-lg shadow-amber-950/40 ring-1 ring-amber-500'
                    : 'border-amber-500 bg-amber-50/60 shadow-md ring-1 ring-amber-500'
                  : isDark
                  ? 'border-amber-900/40 bg-[#16100C]'
                  : 'border-amber-200/80 bg-white shadow-xs'
              }`}
            >
              <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold mb-2">{style.length}</div>
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-2">{style.name}</h3>
              <p className={`text-xs ${isDark ? 'text-amber-100/70' : 'text-slate-600'} mb-4`}>{style.bestFor}</p>
              <div className="pt-4 border-t border-amber-100 dark:border-amber-900/50 text-xs font-mono text-amber-800 dark:text-amber-300">
                <span>Tools: {style.tools}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. THE 7-STEP TRADITIONAL SHAVE PROTOCOL */}
      <section className={`py-20 border-t ${isDark ? 'border-amber-900/40 bg-[#0C0806]' : 'border-amber-200 bg-amber-50/40'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Atelier Ritual</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              The 7-Step Traditional Shave Protocol
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {protocolSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-[#16100C] border-amber-900/40' : 'bg-white border-amber-200'
                }`}
              >
                <div className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400 mb-1">{step.step}</div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{step.title}</h4>
                <p className={`text-[11px] ${isDark ? 'text-amber-100/60' : 'text-slate-600'} leading-snug`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US / HERITAGE SECTION */}
      {(config.aboutTitle || config.aboutText) && (
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>
                {config.aboutSubtitle || 'Heritage & Craftsmanship'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                {config.aboutTitle || `About ${config.businessName}`}
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-amber-100/80' : 'text-slate-600'}`}>
                {config.aboutText}
              </p>
              {config.founderName && (
                <div className="pt-2 flex items-center gap-3">
                  {config.founderImageUrl && (
                    <img decoding="async" src={config.founderImageUrl} alt={config.founderName} className="w-12 h-12 rounded-full object-cover border border-amber-500/40" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{config.founderName}</div>
                    <div className="text-xs text-slate-500">{config.founderRole || 'Founder & Master Craftsman'}</div>
                  </div>
                </div>
              )}
            </div>
            {config.aboutImageUrl && (
              <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-amber-900/30">
                <img loading="lazy" decoding="async" src={config.aboutImageUrl} alt="About Us" className="w-full h-72 object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. FULL TRANSPARENT SERVICE LEDGER (FROM CONFIG.SERVICES) */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Grooming Menu</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            {config.servicesTitle || 'Services & Transparent Rates'}
          </h2>
          <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-amber-100/70' : 'text-slate-600'}`}>
            {config.servicesSubtitle || 'Every service includes consultation, hot towel steam, and signature pomade finish.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(config.services || []).map((service) => (
            <TiltCard
              key={service.id}
              className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                service.popular
                  ? isDark
                    ? 'bg-[#1F1712] border-amber-500/60 shadow-xl ring-1 ring-amber-500/30'
                    : 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500'
                  : isDark
                  ? 'bg-[#16100C] border-amber-900/40 shadow-xs'
                  : 'bg-white border-amber-200/90 shadow-xs'
              }`}
            >
              <div>
                {service.popular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-3">
                    Most Requested Service
                  </span>
                )}
                <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{service.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-400">
                    ${service.price}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ {service.durationMinutes} min</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-amber-100/70' : 'text-slate-600'} mt-3 leading-relaxed`}>
                  {service.description}
                </p>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => onOpenBooking(service.id)}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                    service.popular
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                      : isDark
                      ? 'bg-amber-950 hover:bg-amber-900 text-amber-200'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book This Chair</span>
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 7. MASTER BARBER ROSTER */}
      <section className={`py-20 border-t ${isDark ? 'border-amber-900/40 bg-[#0C0806]' : 'border-amber-200 bg-amber-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">The Artisans</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              Meet Our Master Barbers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {masterBarbers.map((barber, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-2xl border ${
                  isDark ? 'bg-[#16100C] border-amber-900/40' : 'bg-white border-amber-200 shadow-sm'
                }`}
              >
                <div className="text-lg font-serif font-bold text-slate-900 dark:text-white">{barber.name}</div>
                <div className="text-xs font-mono text-amber-600 dark:text-amber-400 mb-2">{barber.title}</div>
                <div className="text-xs text-slate-500 font-mono mb-3">{barber.exp}</div>
                <p className={`text-xs ${isDark ? 'text-amber-100/70' : 'text-slate-600'}`}>
                  Specialty: {barber.spec}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BEFORE & AFTER GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Visual Proof</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Transformations &amp; Chair Moments
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(config.galleryImages || [
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=800',
          ]).map((item, idx) => {
            const imgSrc = typeof item === 'string' ? item : (item as any)?.url || '';
            return (
              <div key={idx} className="rounded-2xl overflow-hidden border border-amber-900/30 aspect-4/3 group relative">
                <img loading="lazy" decoding="async" src={imgSrc} alt="Client Transformation" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. THE GENTLEMANS PASS MEMBERSHIP */}
      <section className={`py-20 border-t ${isDark ? 'border-amber-900/40 bg-[#0C0806]' : 'border-amber-200 bg-amber-50/50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 ${
            isDark ? 'bg-[#1C140E] border-amber-500/40 shadow-xl' : 'bg-white border-amber-300 shadow-md'
          }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>Exclusive Club</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
              The Crown &amp; Blade Executive Pass
            </h3>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-amber-100/70' : 'text-slate-600'} max-w-xl mx-auto`}>
              Unlimited haircuts, priority Saturday chair reservations, complimentary guest passes, and access to private bourbon locker tastings for $149/month.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onOpenBooking()}
                className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                Inquire About Club Membership
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">Common Inquiries</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Barbershop FAQ</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors ${
                  isDark ? 'border-amber-900/40 bg-[#16100C]' : 'border-amber-200 bg-white shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`px-5 pb-4 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-amber-100/70' : 'text-slate-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. LOCATION & WORKING HOURS */}
      <section className={`py-16 border-t ${isDark ? 'border-amber-900/40 bg-[#0A0705]' : 'border-amber-200 bg-amber-50/70'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Atelier Address</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-amber-100/70' : 'text-slate-600'} leading-relaxed`}>
                {config.address || '482 Broome Street, SoHo, New York, NY 10013'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Operating Hours</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-amber-100/70' : 'text-slate-600'} leading-relaxed`}>
                Tuesday - Saturday: 9:00 AM - 8:00 PM <br />
                Sunday: 10:00 AM - 6:00 PM <br />
                Monday: Closed for Sanitization
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-slate-900 dark:text-white">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>Contact &amp; Concierge</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-amber-100/70' : 'text-slate-600'} leading-relaxed`}>
                Phone: {config.phone || '+1 (212) 555-0198'} <br />
                Email: concierge@crownbladebarbers.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FINAL PRIORITY CHAIR CTA */}
      <section className={`py-20 border-t ${isDark ? 'border-amber-900/60 bg-[#0A0705] text-amber-50' : 'border-amber-200 bg-amber-50/70 text-slate-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className={`text-3xl sm:text-5xl font-serif font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {config.ctaHeadline || 'Reserve Your Chair Today'}
          </h3>
          <p className={`text-sm sm:text-base ${isDark ? 'text-amber-200/70' : 'text-slate-600'} max-w-xl mx-auto`}>
            {config.ctaSubheadline || 'Experience the gold standard in master grooming. Walk out confident.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className={`px-8 py-3.5 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer`}
            >
              {config.ctaButtonText || 'Book Online In 60 Seconds'}
            </button>
            <button
              onClick={onOpenChat}
              className={`px-6 py-3.5 rounded-xl ${isDark ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-200 border-amber-800' : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300 shadow-sm'} font-semibold text-xs tracking-wider uppercase border transition-colors flex items-center gap-2 cursor-pointer`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask Available Chairs</span>
            </button>
          </div>
          {config.footerText && (
            <div className="pt-8 border-t border-amber-900/20 text-center text-xs text-slate-500">
              {config.footerText}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

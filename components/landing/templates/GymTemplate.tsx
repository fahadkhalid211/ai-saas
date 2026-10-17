'use client';

import React, { useState } from 'react';
import {
  Dumbbell,
  Flame,
  Zap,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
  Phone,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Activity,
  Heart,
  Target,
  ShieldCheck,
  CheckCheck,
  XCircle,
  Thermometer,
  Wind,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';
import { getThemePalette } from '@/lib/landing/types';

export const GymTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const [goal, setGoal] = useState<'strength' | 'hypertrophy' | 'endurance'>('strength');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const palette = getThemePalette(config.themeColor, 'gym');
  const archetype = config.designArchetype || 'gym_hardcore';

  const tickerItems = [
    'ELEIKO OLYMPIC LIFTING BARS & BUMPERS',
    '39°F CRYOTHERAPY & COLD PLUNGE SUITE',
    'FAR-INFRARED CEDAR SAUNA WITH CHROMOTHERAPY',
    'INBODY 770 CLINICAL BODY COMPOSITION SCANS',
    'ROGUE MONOLIFTS & CALIBRATED POWER BARS',
    'HYPOXIC ENDURANCE ALTITUDE CHAMBER',
  ];

  const zones = [
    {
      title: 'Olympic Weightlifting & Power Bay',
      desc: '12 dedicated platforms equipped with Eleiko IWF-certified plates, calibrated steel, and chalk stations.',
      badge: 'Heavy Steel',
    },
    {
      title: 'Metabolic Conditioning & Turf Track',
      desc: '60-meter sprint turf with sled drags, assault air bikes, Concept2 rowers, and dynamic kettlebell racks.',
      badge: 'High Intensity',
    },
    {
      title: 'Thermal Contrast Recovery Spa',
      desc: 'Dual 39°F stainless steel cold plunges and 195°F Finnish dry saunas for rapid lactic acid clearance.',
      badge: 'Contrast Therapy',
    },
    {
      title: 'Biometric Diagnostic Lab',
      desc: 'Quarterly DEXA scans, VO2 Max testing, and resting metabolic rate analysis with clinical exercise physiologists.',
      badge: 'Clinical Assessment',
    },
  ];

  const transformations = [
    {
      name: 'Dr. David Chen',
      role: 'Venture Partner & Triathlete',
      timeframe: '16 Weeks at FitZone',
      metrics: '-14% Body Fat · +22kg Deadlift 1RM',
      quote: 'The data-driven coaching and thermal contrast recovery enabled me to train 5 days a week without joint fatigue.',
    },
    {
      name: 'Sarah Jenkins',
      role: 'Tech Executive & Marathoner',
      timeframe: '12 Weeks at FitZone',
      metrics: '-18m Marathon PR · +12% Lean Mass',
      quote: 'Unlike big-box gyms, every trainer here holds CSCS certifications and writes periodized programs tailored to your goals.',
    },
  ];

  const coaches = [
    {
      name: 'Marcus Vance, CSCS',
      role: 'Head of Strength & Power',
      exp: '14 Years · Former D1 Collegiate Strength Coach',
      spec: 'Biomechanical barbell trajectory & powerlifting peaking',
    },
    {
      name: 'Coach Maya Kowalski',
      role: 'Director of Conditioning & Recovery',
      exp: '10 Years · Olympic Weightlifting National Finalist',
      spec: 'Olympic snatch technique & anaerobic threshold capacity',
    },
    {
      name: 'Dr. Liam O’Connor, DPT',
      role: 'Director of Sports Physical Therapy',
      exp: '12 Years · Physical Therapist to Pro Athletes',
      spec: 'Rotator cuff stabilization & lumbar spine resilience',
    },
  ];

  const faqs = [
    {
      q: 'Do you offer a free trial pass for new local athletes?',
      a: 'Yes. We provide a complimentary 1-Day All-Access Pass including full gym floor access, sauna/cold plunge recovery, and a group class of your choice.',
    },
    {
      q: 'Are personal training sessions included in the monthly membership?',
      a: 'Our Standard All-Access plan includes quarterly biometric scans, while our VIP Performance Tier includes 2 monthly 1-on-1 private coaching sessions with our CSCS staff.',
    },
    {
      q: 'What is your locker room and recovery suite policy?',
      a: 'All members have full access to executive locker rooms, eucalyptus steam showers, private infrared saunas, and plunge tubs with complimentary towel service.',
    },
    {
      q: 'Can I freeze or cancel my membership if traveling?',
      a: 'Yes. Memberships have zero multi-year lock-in contracts and can be paused or cancelled anytime with a simple 30-day notice.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#0B0D11] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color="bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500" />

      {/* 1. TOP FACILITY CAPACITY & AIR QUALITY RIBBON */}
      <div className={`border-b py-2 px-4 text-xs font-mono ${
        isDark ? 'border-slate-800 bg-[#07090D] text-slate-400' : 'border-slate-200 bg-white text-slate-600 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-white">FACILITY LIVE STATUS: OPEN</span>
            <span className="text-slate-400">|</span>
            <span>Floor Density: 38% (Optimal)</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Cold Plunge: 39°F · Sauna: 195°F</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Hospital-Grade HEPA (8 Air Changes/hr)</span>
            <span>SoHo &amp; Chelsea Locations</span>
          </div>
        </div>
      </div>

      {/* 2. ATHLETIC HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border ${
              isDark ? 'border-rose-500/30 bg-rose-950/40 text-rose-400' : 'border-rose-300 bg-rose-100 text-rose-900'
            }`}>
              <Flame className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>{config.badgeText || 'Elite Performance Training & Thermal Recovery'}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              {config.heroHeadline || (
                <>
                  Built For Athletes. <br />
                  <span className="bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    Engineered For Results.
                  </span>
                </>
              )}
            </h1>

            <p className={`text-base sm:text-xl ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl font-normal leading-relaxed`}>
              {config.heroSubheadline ||
                'High-density Eleiko platforms, metabolic conditioning tracks, and thermal contrast suites paired with Olympic-certified coaching.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className={`px-8 py-4 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-bold text-sm shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer`}
              >
                <Calendar className="h-4 w-4" />
                <span>{config.heroCtaText || 'Claim Free 1-Day Trial Pass'}</span>
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
                <MessageSquare className="h-4 w-4 text-rose-500" />
                <span>Ask Coach Concierge</span>
              </button>
            </div>
          </div>

          {/* Hero Media Card */}
          <div className="lg:col-span-5 relative">
            <div className={`relative rounded-3xl overflow-hidden border shadow-2xl ${
              isDark ? 'border-slate-800 shadow-rose-950/20' : 'border-slate-200 shadow-slate-200'
            }`}>
              <img decoding="async"
                src={
                  config.heroImageUrl ||
                  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200'
                }
                alt="FitZone Performance Gym"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="text-xs font-mono text-rose-400 font-bold mb-1">TODAYS PEAK SCHEDULE</div>
                <div className="text-xl font-bold">Hyrox Functional Endurance @ 5:30 PM</div>
                <p className="text-xs text-slate-300 mt-0.5">8 spots remaining · Lead Coach: Maya Kowalski</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KINETIC TICKER */}
      <section className={`py-5 border-y ${
        isDark ? 'border-slate-800/80 bg-[#07090D]' : 'border-slate-200 bg-slate-100/70'
      }`}>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {tickerItems.map((item, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider whitespace-nowrap ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-700 shadow-2xs'
              }`}
            >
              {item}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 4. FOUR TRAINING & RECOVERY ZONES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Facility Specs</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">
            Four Specialized Training Zones
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zones.map((zone, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold">{zone.badge}</span>
                <span className="text-xs font-mono text-slate-400">ZONE 0{idx + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{zone.title}</h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                {zone.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE GOAL & CALORIE CALCULATOR */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Target Estimator</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">Your Periodized Training Track</h2>
          </div>

          <div className={`p-8 rounded-3xl border space-y-6 ${
            isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="grid grid-cols-3 gap-3">
              {(['strength', 'hypertrophy', 'endurance'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition cursor-pointer ${
                    goal === g
                      ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                      : isDark
                      ? 'border-slate-800 bg-slate-900 text-slate-400'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-mono text-slate-500 uppercase">Training Frequency</span>
                <span className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400">{daysPerWeek} Days / Week</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs font-mono text-slate-500">Estimated 12-Week Lean Mass Gain</div>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                  +{Math.round(daysPerWeek * 1.8)} lbs
                </div>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs font-mono text-slate-500">Recommended Recovery Protocol</div>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {daysPerWeek >= 4 ? 'Contrast Sauna + Plunge (3x/wk)' : 'Standard Active Rest'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US / FACILITY PHILOSOPHY SECTION */}
      {(config.aboutTitle || config.aboutText) && (
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>
                {config.aboutSubtitle || 'The Facility Philosophy'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {config.aboutTitle || `About ${config.businessName}`}
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {config.aboutText}
              </p>
              {config.founderName && (
                <div className="pt-2 flex items-center gap-3">
                  {config.founderImageUrl && (
                    <img decoding="async" src={config.founderImageUrl} alt={config.founderName} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{config.founderName}</div>
                    <div className="text-xs text-slate-500">{config.founderRole || 'Head Strength Coach & Founder'}</div>
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

      {/* 6. FULL MEMBERSHIP TIERS (FROM CONFIG.SERVICES) */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Membership Plans</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">
            {config.servicesTitle || 'Transparent Membership Tiers'}
          </h2>
          <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {config.servicesSubtitle || 'No long-term contracts. 30-day cancellation notice on all plans.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(config.services || []).map((service) => (
            <TiltCard
              key={service.id}
              className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                service.popular
                  ? isDark
                    ? 'bg-slate-900 border-rose-500/60 shadow-xl ring-1 ring-rose-500/30'
                    : 'bg-white border-rose-500 shadow-md ring-1 ring-rose-500'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 shadow-xs'
                  : 'bg-white border-slate-200/90 shadow-xs'
              }`}
            >
              <div>
                {service.popular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 mb-3">
                    Most Popular Plan
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-rose-600 dark:text-rose-400">
                    ${service.price}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ Month</span>
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
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Activate Membership</span>
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 7. VERIFIED ATHLETE TRANSFORMATIONS */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Proof of Progress</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">Real Athletes. Real Metrics.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {transformations.map((item, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h3>
                  <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold">{item.timeframe}</span>
                </div>
                <div className="text-xs font-mono text-slate-500 mb-3">{item.role}</div>
                <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-4 p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  {item.metrics}
                </div>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} italic leading-relaxed`}>
                  "{item.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FITZONE VS COMMERCIAL GYMS COMPARISON */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Standard Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">Why FitZone Outperforms Big-Box Gyms</h2>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  <th className="p-4 sm:p-5 font-semibold">Training Dimension</th>
                  <th className="p-4 sm:p-5 font-bold text-rose-600 dark:text-rose-400">FitZone Performance Club</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-500">Commercial Big-Box Gyms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  {
                    dim: 'Floor Congestion & Wait Times',
                    fit: 'Capped memberships, zero waiting for squat racks',
                    box: 'Over-crowded, lines for cables & benches',
                  },
                  {
                    dim: 'Equipment Calibration',
                    fit: 'Eleiko, Rogue, Concept2 IWF calibrated bars',
                    box: 'Worn generic fixed-weight pin machines',
                  },
                  {
                    dim: 'Recovery Infrastructure',
                    fit: '39°F Cold Plunges + 195°F Finnish Saunas',
                    box: 'Basic hot tub or broken dry sauna',
                  },
                  {
                    dim: 'Coach Certifications',
                    fit: '100% CSCS / DPT certified strength coaches',
                    box: 'Weekend online certificate trainers',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}>
                    <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-white">{row.dim}</td>
                    <td className="p-4 sm:p-5 font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.fit}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{row.box}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. ELITE COACHING STAFF */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Coaching Staff</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">World-Class Strength Coaches</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coaches.map((coach, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="text-lg font-bold text-slate-900 dark:text-white">{coach.name}</div>
                <div className="text-xs font-mono text-rose-600 dark:text-rose-400 mb-1">{coach.role}</div>
                <div className="text-xs text-slate-500 font-mono mb-3">{coach.exp}</div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Specialty: {coach.spec}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Frequently Addressed</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-1 text-slate-900 dark:text-white">Membership &amp; Facility FAQ</h2>
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
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-rose-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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

      {/* 11. FINAL CTA & ALL-ACCESS PASS */}
      <section className={`py-20 border-t ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {config.ctaHeadline || 'Ready to Redefine Your Potential?'}
          </h3>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-xl mx-auto`}>
            {config.ctaSubheadline || 'Experience our Eleiko weightlifting floor and thermal contrast suite with a complimentary 1-day pass.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className={`px-8 py-3.5 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer`}
            >
              {config.ctaButtonText || 'Get Free 1-Day Trial Pass'}
            </button>
            <button
              onClick={onOpenChat}
              className={`px-6 py-3.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'} font-semibold text-xs tracking-wider uppercase border transition-colors flex items-center gap-2 cursor-pointer`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
              <span>Ask Coach Questions</span>
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

'use client';

import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  CheckCheck,
  XCircle,
  Activity,
  Smile,
  Stethoscope,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';
import { getThemePalette } from '@/lib/landing/types';

export const HealthcareTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  currentTheme,
  onOpenBooking,
  onOpenChat,
}) => {
  const palette = currentTheme || getThemePalette(config.themeColor, 'healthcare');

  const [selectedCare, setSelectedCare] = useState<'preventive' | 'cosmetic' | 'implants'>('cosmetic');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const insurancePartners = [
    'DELTA DENTAL PREMIER PPO',
    'METLIFE DENTAL NETWORK',
    'CIGNA TOTAL CARE',
    'AETNA DENTAL PPO',
    'GUARDIAN DIRECT',
    'BLUECROSS BLUESHIELD DENTAL',
    'CARECREDIT 0% FINANCING AVAILABLE',
  ];

  const suites = [
    {
      title: 'Preventive Hygiene & Periodontal Care',
      desc: 'Gentle ultrasonic scaling, airflow air-polishing, and computerized periodontal charting to safeguard systemic health.',
      badge: 'Preventive Foundation',
    },
    {
      title: 'Clear Aligner Orthodontics',
      desc: 'Discreet, digital 3D-planned tooth alignment correcting crowding, spacing, and bite alignment without metallic brackets.',
      badge: 'Invisible Aesthetics',
    },
    {
      title: '3D Computer-Guided Dental Implants',
      desc: 'Micron-precise titanium and zirconia implants planned via cone-beam CT scans with lifetime osseointegration warranties.',
      badge: 'Surgical Precision',
    },
    {
      title: 'Relaxation & Sedation Dentistry',
      desc: 'Complimentary nitrous oxide, warm aromatherapy blankets, and certified IV twilight sedation for anxiety-free procedures.',
      badge: 'Zero Anxiety',
    },
  ];

  const restorations = [
    {
      patient: 'Michael Vance, 42',
      treatment: 'Full Upper Arch Porcelain Veneers',
      timeframe: '2 Visits · 10 Days',
      outcome: 'Corrected decade-long enamel discoloration and chipping with custom hand-layered feldspathic porcelain.',
    },
    {
      patient: 'Sarah Sterling, 36',
      treatment: 'Guided Single Molar Implant + Crown',
      timeframe: 'Painless Same-Day Procedure',
      outcome: 'Restored full chewing functionality with computer-guided surgical stent. Zero post-operative downtime.',
    },
  ];

  const doctors = [
    {
      name: 'Dr. Evelyn Hayes, DDS, FAGD',
      role: 'Founding Clinical Director · Cosmetic Dentistry',
      cred: 'Columbia University College of Dental Medicine · Fellow, AGD',
      spec: 'Minimally invasive porcelain veneers & smile design aesthetics',
    },
    {
      name: 'Dr. Daniel Chen, DMD, MD',
      role: 'Oral & Maxillofacial Surgeon',
      cred: 'Harvard School of Dental Medicine · NYU Langone Surgery',
      spec: 'Complex bone grafting & 3D computer-guided implantology',
    },
    {
      name: 'Dr. Chloe Aris, DDS',
      role: 'Director of Periodontal Therapy',
      cred: 'University of Pennsylvania Dental Medicine',
      spec: 'Laser regenerative periodontics & biological tissue preservation',
    },
  ];

  const faqs = [
    {
      q: 'Does Aura accept my PPO dental insurance plan?',
      a: 'We are in-network or work directly with all major PPO insurance providers including Delta Dental, MetLife, Cigna, Aetna, and Guardian. We file all claims on your behalf.',
    },
    {
      q: 'How does sedation dentistry help patients with dental anxiety?',
      a: 'We offer multiple comfort levels, ranging from mild nitrous oxide relaxation to conscious oral and IV twilight sedation administered by board-certified anesthesiologists.',
    },
    {
      q: 'Are same-day emergency appointments available for tooth pain?',
      a: 'Yes. We reserve daily emergency chair blocks for acute toothaches, chipped teeth, and traumatic oral injuries with immediate relief.',
    },
    {
      q: 'Do you provide payment plans for cosmetic veneers and implants?',
      a: 'We partner with CareCredit and Proceed Finance to offer 0% APR financing up to 24 months with zero pre-payment penalties.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#060D0D] text-teal-50' : 'bg-[#F4F9F9] text-slate-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color="bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />

      {/* 1. TOP STERILIZATION & ACCREDITATION BANNER */}
      <div className={`border-b py-2 px-4 text-xs font-mono ${
        isDark ? 'border-teal-950 bg-[#030808] text-teal-300/80' : 'border-teal-200 bg-teal-50 text-teal-900'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-bold">AURA DENTAL &amp; SURGICAL SUITE</span>
            <span className="text-teal-400/40">|</span>
            <span>Class-B Hospital Autoclave Sterilization</span>
            <span className="text-teal-400/40 hidden sm:inline">|</span>
            <span className="hidden sm:inline">All Major PPO Insurance Accepted</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-teal-700 dark:text-teal-400">
            <span>Same-Day Emergency Relief</span>
            <span>SoHo, New York</span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION: BOUTIQUE MEDICAL WELLNESS */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border ${
              isDark ? 'border-teal-500/30 bg-teal-950/40 text-teal-300' : 'border-teal-200 bg-teal-100 text-teal-900'
            }`}>
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{config.badgeText || 'Modern Laser Dentistry & Gentle Sedation Care'}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium tracking-tight leading-[1.08]">
              {config.heroHeadline || (
                <>
                  Gentle Clinical Care. <br />
                  <span className="italic text-teal-600 dark:text-teal-400">
                    Confidence In Every Smile.
                  </span>
                </>
              )}
            </h1>

            <p className={`text-base sm:text-xl ${isDark ? 'text-teal-100/70' : 'text-slate-600'} font-light max-w-2xl leading-relaxed`}>
              {config.heroSubheadline ||
                'Experience biological, minimally invasive dental medicine in a spa-like clinic designed to eliminate anxiety and deliver enduring smile health.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-teal-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Patient Consultation</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onOpenChat}
                className={`px-6 py-4 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? 'border-teal-900 bg-slate-900 text-teal-100 hover:bg-slate-800'
                    : 'border-teal-200 bg-white text-slate-800 hover:bg-teal-50 shadow-xs'
                }`}
              >
                <MessageSquare className="h-4 w-4 text-teal-600" />
                <span>Ask Clinical Concierge</span>
              </button>
            </div>
          </div>

          {/* Hero Media Card */}
          <div className="lg:col-span-5 relative">
            {config.heroImageUrl ? (
              <div className="relative rounded-3xl overflow-hidden border border-teal-800/40 shadow-2xl group">
                <img decoding="async"
                  src={config.heroImageUrl}
                  alt={config.businessName || 'Clinical Care'}
                  className="w-full h-96 sm:h-[440px] object-cover object-center group-hover:scale-102 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl backdrop-blur-md bg-black/60 border border-white/10 text-white space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-teal-300 font-bold uppercase">Biological Standard</span>
                    <span className="text-emerald-400">Zero-Anxiety Protocol</span>
                  </div>
                  <div className="text-base font-serif font-bold">State-of-the-Art Care Suite</div>
                  <p className="text-[11px] text-slate-300">HEPA filtered operatories &amp; digital scanning.</p>
                </div>
              </div>
            ) : (
              <TiltCard
                maxTilt={6}
                className={`p-8 rounded-3xl border shadow-xl ${
                  isDark ? 'bg-slate-950/80 border-teal-950' : 'bg-white border-teal-200 shadow-teal-100'
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-teal-100 dark:border-teal-950">
                  <span className="text-xs font-mono font-bold uppercase text-slate-500">CLINICAL EXCELLENCE</span>
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">Zero-Anxiety Protocol</span>
                </div>

                <div className="py-6 space-y-4">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-teal-950' : 'bg-teal-50/60 border-teal-100'}`}>
                    <div className="text-xs font-mono text-slate-500 uppercase">Hospital-Grade Air Purity</div>
                    <div className="text-2xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">8 Air Changes / Hr</div>
                    <div className="text-xs text-slate-500 mt-1">Medical HEPA filtration in every private operatory.</div>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-teal-950' : 'bg-teal-50/60 border-teal-100'}`}>
                    <div className="text-xs font-mono text-slate-500 uppercase">Digital Scanner Accuracy</div>
                    <div className="text-2xl font-serif font-bold text-teal-600 dark:text-teal-400 mt-0.5">Sub-20 Microns</div>
                    <div className="text-xs text-slate-500 mt-1">Zero gag-inducing putty impressions.</div>
                  </div>
                </div>

                <div className="pt-2 text-xs font-mono text-slate-500 text-center">
                  Insurance benefits verified prior to your visit.
                </div>
              </TiltCard>
            )}
          </div>
        </div>
      </section>

      {/* 3. KINETIC TICKER */}
      <section className={`py-5 border-y ${
        isDark ? 'border-teal-950 bg-[#030808]' : 'border-teal-200 bg-white shadow-2xs'
      }`}>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {insurancePartners.map((item, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider whitespace-nowrap ${
                isDark ? 'border-teal-950 bg-slate-900 text-teal-300' : 'border-teal-200 bg-teal-50/40 text-teal-900 shadow-2xs'
              }`}
            >
              {item}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 4. FOUR SPECIALIZED CARE SUITES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">Comprehensive Care</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Specialized Treatment Suites
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suites.map((suite, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-950/70 border-teal-950 hover:border-teal-800' : 'bg-white border-teal-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">{suite.badge}</span>
                <span className="text-xs font-mono text-slate-400">SUITE 0{idx + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{suite.title}</h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-teal-100/70' : 'text-slate-600'} leading-relaxed`}>
                {suite.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 4-STAGE STRESS-FREE PATIENT JOURNEY */}
      <section className={`py-20 border-t ${isDark ? 'border-teal-950 bg-[#030808]' : 'border-teal-200 bg-teal-50/40'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">Patient Experience</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              The Stress-Free Visit Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: '3D Optical Scan', desc: 'Comfortable 60-second digital scan creating high-resolution 3D models of your dentition.' },
              { step: '02', title: 'Treatment Preview', desc: 'Review simulated before-and-after smile outcomes and transparent itemized fee estimates.' },
              { step: '03', title: 'Gentle Treatment', desc: 'Laser-assisted or sedation-supported procedure with noise-canceling headphones and Netflix.' },
              { step: '04', title: 'Long-Term Health', desc: 'Tailored biological hygiene program ensuring your dental restorations last decades.' },
            ].map((st, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-slate-950/70 border-teal-950' : 'bg-white border-teal-200'
                }`}
              >
                <div className="text-2xl font-mono font-bold text-teal-600 dark:text-teal-400 mb-2">{st.step}</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{st.title}</h3>
                <p className={`text-xs ${isDark ? 'text-teal-100/70' : 'text-slate-600'} leading-relaxed`}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US / CLINICAL EXCELLENCE SECTION */}
      {(config.aboutTitle || config.aboutText) && (
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>
                {config.aboutSubtitle || 'Patient-First Clinical Excellence'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                {config.aboutTitle || `About ${config.businessName}`}
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-teal-100/80' : 'text-slate-600'}`}>
                {config.aboutText}
              </p>
              {config.founderName && (
                <div className="pt-2 flex items-center gap-3">
                  {config.founderImageUrl && (
                    <img decoding="async" src={config.founderImageUrl} alt={config.founderName} className="w-12 h-12 rounded-full object-cover border border-teal-500/40" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{config.founderName}</div>
                    <div className="text-xs text-slate-500">{config.founderRole || 'Lead Clinical Director'}</div>
                  </div>
                </div>
              )}
            </div>
            {config.aboutImageUrl && (
              <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-teal-900/30">
                <img loading="lazy" decoding="async" src={config.aboutImageUrl} alt="About Us" className="w-full h-72 object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. SERVICES & PATIENT CONSULTATIONS (FROM CONFIG.SERVICES) */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className={`text-xs font-mono uppercase tracking-widest ${palette.accentText} font-bold`}>Treatment Menu</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            {config.servicesTitle || 'Clinical Services & Fees'}
          </h2>
          <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-teal-100/70' : 'text-slate-600'}`}>
            {config.servicesSubtitle || 'Covered in part or full by participating PPO insurance carriers.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(config.services || []).map((service) => (
            <TiltCard
              key={service.id}
              className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                service.popular
                  ? isDark
                    ? 'bg-slate-900 border-teal-500/60 shadow-xl ring-1 ring-teal-500/30'
                    : 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500'
                  : isDark
                  ? 'bg-slate-950/80 border-teal-950 shadow-xs'
                  : 'bg-white border-teal-200/90 shadow-xs'
              }`}
            >
              <div>
                {service.popular && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800 mb-3">
                    Recommended Patient Session
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-teal-600 dark:text-teal-400">
                    {service.price === 0 ? 'Free Intake' : `$${service.price}`}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ {service.durationMinutes} min</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-teal-100/70' : 'text-slate-600'} mt-3 leading-relaxed`}>
                  {service.description}
                </p>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => onOpenBooking(service.id)}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                    service.popular
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Chair Slot</span>
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* 7. COMPARISON TABLE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">Standard Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-1 text-slate-900 dark:text-white">Aura Modern Dentistry vs Traditional Clinics</h2>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-teal-950 bg-slate-950' : 'border-teal-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-teal-950 bg-slate-900 text-teal-400' : 'border-teal-200 bg-teal-50 text-teal-900'}`}>
                  <th className="p-4 sm:p-5 font-semibold">Clinical Dimension</th>
                  <th className="p-4 sm:p-5 font-bold text-teal-600 dark:text-teal-400">Aura Boutique Practice</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-500">Traditional Drill Practices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100 dark:divide-teal-950">
                {[
                  {
                    dim: 'Impression Technique',
                    aura: 'Instant 3D optical scanning in 60 seconds',
                    trad: 'Messy silicone putty tray causing gag reflex',
                  },
                  {
                    dim: 'Anxiety & Pain Control',
                    aura: 'Sedation options, warm blankets, soothing video',
                    trad: 'Standard local anesthetic injection only',
                  },
                  {
                    dim: 'Cavity Treatment',
                    aura: 'Waterlase hydrokinetic laser (often no shot needed)',
                    trad: 'High-speed vibration mechanical drills',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                    <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-white">{row.dim}</td>
                    <td className="p-4 sm:p-5 font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.aura}</span>
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

      {/* 8. CLINICIANS ROSTER */}
      <section className={`py-20 border-t ${isDark ? 'border-teal-950 bg-[#030808]' : 'border-teal-200 bg-teal-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">Clinical Team</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              Board-Certified Specialists
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doc, idx) => (
              <div
                key={idx}
                className={`p-7 rounded-2xl border ${
                  isDark ? 'bg-slate-950/70 border-teal-950' : 'bg-white border-teal-200 shadow-sm'
                }`}
              >
                <div className="text-lg font-serif font-bold text-slate-900 dark:text-white">{doc.name}</div>
                <div className="text-xs font-mono text-teal-600 dark:text-teal-400 mb-1">{doc.role}</div>
                <div className="text-xs text-slate-500 font-mono mb-3">{doc.cred}</div>
                <p className={`text-xs ${isDark ? 'text-teal-100/70' : 'text-slate-600'}`}>
                  Focus: {doc.spec}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">Patient Inquiries</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mt-1 text-slate-900 dark:text-white">Dental Health &amp; Insurance FAQ</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors ${
                  isDark ? 'border-teal-950 bg-slate-950' : 'border-teal-200 bg-white shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-teal-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`px-5 pb-4 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-teal-100/70' : 'text-slate-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className={`py-20 border-t ${isDark ? 'border-teal-950 bg-slate-950 text-slate-100' : 'border-teal-200 bg-teal-50/60 text-slate-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className={`text-3xl sm:text-5xl font-serif font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {config.ctaHeadline || 'Begin Your Smile Health Journey'}
          </h3>
          <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-xl mx-auto font-light`}>
            {config.ctaSubheadline || 'New patients welcome. Book your comprehensive exam and digital scan in under 60 seconds.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className={`px-8 py-3.5 rounded-xl ${palette.btnBg} ${palette.btnHoverBg} ${palette.btnText} font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer`}
            >
              {config.ctaButtonText || 'Schedule New Patient Visit'}
            </button>
            <button
              onClick={onOpenChat}
              className={`px-6 py-3.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-teal-100/60 text-teal-900 border-teal-200 shadow-xs'} font-semibold text-xs tracking-wider uppercase border transition-colors flex items-center gap-2 cursor-pointer`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
              <span>Ask Insurance Questions</span>
            </button>
          </div>
          {config.footerText && (
            <div className="pt-8 border-t border-teal-950/40 text-center text-xs text-slate-500">
              {config.footerText}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

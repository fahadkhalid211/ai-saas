'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Eye,
  Calendar,
  MessageSquare,
  Award,
  Layers,
  Compass,
  Palette,
  Layout,
  CheckCircle2,
  ChevronDown,
  Globe,
  Sliders,
  CheckCheck,
  XCircle,
  Briefcase,
  Monitor,
  Box,
  TrendingUp,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';

export const CreativeAgencyTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const [activeProject, setActiveProject] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const awards = [
    'AWWWARDS SITE OF THE YEAR',
    'D&AD YELLOW PENCIL 2025',
    'CANNES LIONS GRAND PRIX',
    'FWA OF THE DAY (X18)',
    'RED DOT BEST OF BEST',
    'FAST COMPANY INNOVATION IN DESIGN',
    'TYPE DIRECTORS CLUB NEW YORK',
  ];

  const projects = [
    {
      title: 'Aura Spatial OS',
      category: 'Spatial UI & VisionOS Design System',
      year: '2026',
      client: 'Aura Reality Inc.',
      awards: 'Site of the Day · Awwwards',
      impact: '+340% User Retention',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Solstice Electric Hypercar',
      category: '3D WebGL Configurator & Brand Film',
      year: '2025',
      client: 'Solstice Motors Zurich',
      awards: 'FWA of the Month',
      impact: '$42M Pre-orders in 48h',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Kinetix Autonomous Robotics',
      category: 'Design Language & Industrial Hardware UI',
      year: '2026',
      client: 'Kinetix Labs Tokyo',
      awards: 'Red Dot Best of the Best',
      impact: 'Series B Over-subscribed',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Monolith Fine Chronometry',
      category: 'Luxury E-Commerce & Micro-Interactions',
      year: '2025',
      client: 'Monolith Geneva',
      awards: 'CSS Design Awards Winner',
      impact: '185% Higher Basket Value',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const disciplines = [
    {
      step: '01',
      title: 'Digital Flagships & Immersive Web',
      desc: 'High-performance Next.js and WebGL interactive experiences that load in under a second and convert high-ticket buyers.',
      details: ['Custom GLSL Shaders', 'Micro-Interactions & Parallax', 'Dynamic Headless Architecture'],
    },
    {
      step: '02',
      title: 'Brand Architecture & Identity',
      desc: 'Bespoke typographic systems, motion guidelines, physical packaging, and unified design token libraries.',
      details: ['Custom Type Foundry Collaboration', 'Motion Choreography Guides', 'Physical Print & Debossing Specs'],
    },
    {
      step: '03',
      title: 'AI Product Interfaces & Spatial Systems',
      desc: 'Designing intuitive mental models for complex autonomous systems, LLM agents, and spatial VisionOS environments.',
      details: ['Multi-Modal Feedback Loops', 'Adaptive UI Systems', 'Spatial Depth Hierarchy'],
    },
    {
      step: '04',
      title: 'Motion Choreography & 3D Assets',
      desc: 'Cinema-grade 3D product renders, programmatic scroll motion, and brand films engineered for global product rollouts.',
      details: ['Houdini Procedural Visuals', 'Unreal Engine 5 Pipelines', 'Sound Design Integration'],
    },
  ];

  const faqs = [
    {
      q: 'What is Hyperion typical project engagement timeline?',
      a: 'Sprint engagements range from 4-week brand architecture intensives to 12-week comprehensive digital flagship redesigns from discovery to global deployment.',
    },
    {
      q: 'Do you work with early-stage venture startups or established enterprises?',
      a: 'We partner with both: Series A+ venture-backed disruptors looking to define their category and Fortune 500 enterprises modernizing legacy product suites.',
    },
    {
      q: 'How does your team collaborate with our in-house engineering squad?',
      a: 'We ship fully documented Figma tokens, accessible React/Next.js components with 60fps interaction polish, and participate in daily pairing during engineering handoff.',
    },
    {
      q: 'What makes Hyperion distinct from traditional design agencies?',
      a: 'Zero junior bloat. Every client partners directly with our founding principals and principal creative technologists with equity-level skin in the game.',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-[#0A0A0A] text-neutral-100' : 'bg-[#FAFAF9] text-neutral-900'} overflow-x-hidden font-sans transition-colors duration-200`}>
      {/* 1. SCROLL PROGRESS */}
      <ScrollProgress color="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500" />

      {/* 1. TOP GLOBAL AWARDS RIBBON */}
      <div className={`border-b py-2.5 px-4 text-xs font-mono ${
        isDark ? 'border-neutral-800 bg-neutral-950 text-neutral-400' : 'border-neutral-200 bg-white text-neutral-600 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-neutral-900 dark:text-neutral-100">GLOBAL DESIGN STUDIO</span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">/</span>
            <span className="text-neutral-500">Zurich · London · Tokyo · New York</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500 text-[11px]">
            <span>18x Awwwards SOTD</span>
            <span>2025 Red Dot Best of the Best</span>
          </div>
        </div>
      </div>

      {/* 2. HERO: HIGH-FASHION EDITORIAL */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-8 max-w-5xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest ${
            isDark ? 'bg-neutral-900 text-neutral-300 border border-neutral-800' : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>{config.badgeText || 'Independent Creative Direction & Engineering'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05]">
            {config.heroHeadline || (
              <>
                We Build Digital Flagships <br />
                <span className="font-serif italic font-normal text-rose-600 dark:text-rose-400">
                  That Redefine Industries.
                </span>
              </>
            )}
          </h1>

          <p className={`text-base sm:text-xl ${isDark ? 'text-neutral-400' : 'text-neutral-600'} font-light max-w-2xl leading-relaxed`}>
            {config.heroSubheadline ||
              'Hyperion is an award-winning creative consultancy crafting bespoke digital flagships, tactile brand identities, and high-frequency motion systems.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="px-8 py-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Initiate Strategy Sprint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenChat}
              className={`px-6 py-4 rounded-full border font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                  : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 shadow-2xs'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
              <span>Consult Principal Director</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. KINETIC AWARDS MARQUEE */}
      <section className={`py-6 border-y ${
        isDark ? 'border-neutral-800/80 bg-neutral-950' : 'border-neutral-200 bg-neutral-100/70'
      }`}>
        <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
            Industry Recognition &amp; International Honours
          </span>
        </div>
        <KineticMarquee speed={22} pauseOnHover={true}>
          {awards.map((award, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-semibold tracking-wider whitespace-nowrap ${
                isDark
                  ? 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-rose-400'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:text-rose-600 shadow-2xs'
              }`}
            >
              {award}
            </div>
          ))}
        </KineticMarquee>
      </section>

      {/* 4. FOUR CORE DISCIPLINES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Capabilities Matrix</span>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight mt-1 text-neutral-900 dark:text-white">
            Architecture of Distinction
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disciplines.map((item, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border transition-all ${
                isDark ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-200/90 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold mb-3">{item.step}</div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{item.title}</h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed mb-5`}>
                {item.desc}
              </p>
              <div className="space-y-1.5 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                {item.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SELECTED WORK & CLIENT SHOWCASE */}
      <section className={`py-20 border-t ${isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-neutral-200 bg-neutral-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Selected Portfolio</span>
              <h2 className="text-3xl sm:text-5xl font-light tracking-tight mt-1 text-neutral-900 dark:text-white">
                Work That Moves Markets
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {projects.map((_, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => setActiveProject(pIdx)}
                  className={`w-8 h-1.5 rounded-full transition-all cursor-pointer ${
                    activeProject === pIdx ? 'bg-rose-500 w-12' : isDark ? 'bg-neutral-800' : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Featured Case */}
          <div className={`rounded-3xl border overflow-hidden transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-md'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 aspect-video lg:aspect-auto relative overflow-hidden bg-neutral-950">
                <img
                  src={projects[activeProject].image}
                  alt={projects[activeProject].title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-2">
                    <span>{projects[activeProject].category}</span>
                    <span>{projects[activeProject].year}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 dark:text-white">
                    {projects[activeProject].title}
                  </h3>
                  <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-mono bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    {projects[activeProject].awards}
                  </div>
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="text-xs font-mono uppercase text-neutral-400">Measurable Commercial Impact</div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                      {projects[activeProject].impact}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => onOpenBooking()}
                    className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Request Full Case Deck</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DELIVERABLES & PRODUCTION SCOPE MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Standard of Excellence</span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight mt-1 text-neutral-900 dark:text-white">Comprehensive Production Matrix</h2>
          <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Every engagement produces definitive, production-ready assets with complete IP ownership transfer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Layout,
              title: 'Design System & Token Architecture',
              items: ['Figma Variables & Color Tokens', 'Multi-brand Typography Scales', 'Component Accessibility QA', 'Dark/Light Mode Schemas'],
            },
            {
              icon: Monitor,
              title: 'Production Engineering & WebGL',
              items: ['Next.js App Router Architecture', 'Custom Three.js / R3F Canvas', 'Sub-1s LCP Page Speed Budget', 'Zero-CLS Motion Choreography'],
            },
            {
              icon: Box,
              title: 'Sensory & Motion Identity',
              items: ['Micro-sound Audio Palettes', 'Procedural 3D Render Library', 'Executive Pitch Decks', 'Interactive Brand Books'],
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-7 rounded-2xl border transition-all ${
                  isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">{card.title}</h3>
                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  {card.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. 5-PHASE COLLABORATIVE SPRINT METHODOLOGY */}
      <section className={`py-20 border-t ${isDark ? 'border-neutral-800 bg-neutral-950/70' : 'border-neutral-200 bg-neutral-50/70'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Methodology</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight mt-1 text-neutral-900 dark:text-white">The Hyperion Sprint Protocol</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { num: '01', name: 'Strategic Immersion', desc: 'Category audit, executive interviews, and technical constraint mapping.' },
              { num: '02', name: 'Radical Divergence', desc: '3 distinct creative directions explored without initial technical compromise.' },
              { num: '03', name: 'System Synthesis', desc: 'Chosen direction formalized into rigorous tokens, components, and layout grids.' },
              { num: '04', name: 'Headless Build', desc: 'Pixel-perfect Next.js implementation with 60fps micro-interaction polish.' },
              { num: '05', name: 'Global Deployment', desc: 'Edge cache warming, analytics tagging, and executive team enablement.' },
            ].map((st, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border ${
                  isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'
                }`}
              >
                <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 mb-2">{st.num}</div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">{st.name}</h4>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed`}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. AGENCY VS IN-HOUSE / FREELANCERS COMPARISON */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Why Hyperion</span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight mt-1 text-neutral-900 dark:text-white">Comparative Engagement Models</h2>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-neutral-800 bg-neutral-900/40' : 'border-neutral-200 bg-white shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b font-mono ${isDark ? 'border-neutral-800 bg-neutral-900 text-neutral-400' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}>
                  <th className="p-4 sm:p-5 font-semibold">Evaluation Criteria</th>
                  <th className="p-4 sm:p-5 font-bold text-rose-600 dark:text-rose-400">Hyperion Studio</th>
                  <th className="p-4 sm:p-5 font-semibold text-neutral-500">Traditional Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {[
                  {
                    aspect: 'Leadership Involvement',
                    hyperion: 'Direct partner & principal involvement daily',
                    trad: 'Pitched by seniors, handed to juniors',
                  },
                  {
                    aspect: 'Engineering Capability',
                    hyperion: 'Native Next.js, WebGL & shader development',
                    trad: 'Design handoff with outsourced dev',
                  },
                  {
                    aspect: 'Delivery Velocity',
                    hyperion: 'Rapid 4-12 week sprint delivery',
                    trad: '6-9 month bloated retainers',
                  },
                  {
                    aspect: 'Commercial Accountability',
                    hyperion: 'Proven conversion & revenue lift metrics',
                    trad: 'Subjective aesthetic awards only',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className={isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-neutral-50/80'}>
                    <td className="p-4 sm:p-5 font-medium text-neutral-900 dark:text-white">{row.aspect}</td>
                    <td className="p-4 sm:p-5 font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.hyperion}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-neutral-500">
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

      {/* 9. SERVICES & STRATEGY SPRINTS (FROM CONFIG) */}
      <section id="services" className={`py-20 border-t ${isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-neutral-200 bg-neutral-50/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Engagement Sprints</span>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight mt-1 text-neutral-900 dark:text-white">Studio Offerings</h2>
            <p className={`mt-2 text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Reserve a structured design sprint or technical feasibility assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(config.services || []).map((service) => (
              <TiltCard
                key={service.id}
                className={`p-7 rounded-2xl border flex flex-col justify-between transition-all ${
                  service.popular
                    ? isDark
                      ? 'bg-neutral-900 border-rose-500/50 shadow-xl ring-1 ring-rose-500/30'
                      : 'bg-white border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                    : isDark
                    ? 'bg-neutral-900/60 border-neutral-800 shadow-xs'
                    : 'bg-white border-neutral-200/90 shadow-xs'
                }`}
              >
                <div>
                  {service.popular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-3">
                      High Demand
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{service.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-rose-600 dark:text-rose-400">
                      {service.price === 0 ? 'Free' : `$${service.price}`}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">/ {service.durationMinutes} min</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} mt-3 leading-relaxed`}>
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    onClick={() => onOpenBooking(service.id)}
                    className={`w-full py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                      service.popular
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                        : isDark
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reserve Sprint Window</span>
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
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Inquiry &amp; Protocol</span>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight mt-1 text-neutral-900 dark:text-white">Frequently Addressed</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors ${
                  isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-white shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180 text-rose-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className={`px-5 pb-4 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. LEADERSHIP & STUDIO DIRECTORS */}
      <section className={`py-20 border-t ${isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-neutral-200 bg-neutral-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold">Studio Partners</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight mt-1 text-neutral-900 dark:text-white">Direct Principal Oversight</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Elena Rostova',
                role: 'Partner, Creative Direction',
                bio: 'Former Executive Design Director at Pentagram London. Led spatial OS identity design for 4 unicorn IPOs.',
              },
              {
                name: 'Marcus Vance',
                role: 'Partner, Creative Technology',
                bio: 'Pioneered WebGL shader performance optimizations. Former lead creative engineer at Droga5.',
              },
              {
                name: 'Soren Lindqvist',
                role: 'Partner, Brand Systems',
                bio: 'Copenhagen Type Foundry founder. Designed bespoke typography for luxury automotive and Swiss horology.',
              },
            ].map((member, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/90'
                }`}
              >
                <div className="text-base font-bold text-neutral-900 dark:text-white">{member.name}</div>
                <div className="text-xs font-mono text-rose-600 dark:text-rose-400 mt-0.5 mb-3">{member.role}</div>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed`}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. PROJECT INQUIRY CTA & FOOTER */}
      <section className={`py-20 border-t ${isDark ? 'border-neutral-800 bg-neutral-950 text-neutral-100' : 'border-neutral-200 bg-neutral-50 text-neutral-900'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className={`text-3xl sm:text-5xl font-light tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Have a Defining Project in Mind?
          </h3>
          <p className={`text-sm sm:text-base ${isDark ? 'text-neutral-400' : 'text-neutral-600'} max-w-xl mx-auto font-light`}>
            We accept four new flagship engagements per calendar quarter. Connect with our principals.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="px-8 py-3.5 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
            >
              Submit Project Brief
            </button>
            <button
              onClick={onOpenChat}
              className={`px-6 py-3.5 rounded-full ${isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700' : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300 shadow-xs'} font-semibold text-xs tracking-wider uppercase border transition-colors flex items-center gap-2 cursor-pointer`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
              <span>Direct Studio Chat</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

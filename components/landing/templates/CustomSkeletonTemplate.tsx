'use client';

import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Calendar,
  MessageSquare,
  ArrowRight,
  Check,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Sliders,
  Code,
  Layout,
  Cpu,
  ShieldCheck,
  Plus,
  Box,
  ChevronRight,
} from 'lucide-react';
import { IndustryTemplateProps } from '../types';
import { ScrollProgress } from '../effects/ScrollProgress';
import { TiltCard } from '../effects/TiltCard';
import { KineticMarquee } from '../effects/KineticMarquee';

export const CustomSkeletonTemplate: React.FC<IndustryTemplateProps> = ({
  config,
  isDark,
  onOpenBooking,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'blueprint'>('preview');

  const skeletonSections = [
    {
      num: '01',
      title: 'Hero & Value Proposition',
      desc: 'Introduce your company mission, primary headline, and call-to-action button.',
      status: 'Ready to Customize',
    },
    {
      num: '02',
      title: 'Service Catalog & Bookings',
      desc: 'Display service durations, rates, and enable real-time client calendar booking.',
      status: 'Ready to Customize',
    },
    {
      num: '03',
      title: 'RAG Knowledge Concierge',
      desc: 'AI assistant trained on your documents, FAQs, and pricing to answer visitors 24/7.',
      status: 'Ready to Customize',
    },
    {
      num: '04',
      title: 'Social Proof & Credentials',
      desc: 'Embed verified client testimonials, ratings, and institutional credentials.',
      status: 'Ready to Customize',
    },
  ];

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans`}>
      <ScrollProgress />

      {/* Blueprint Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          {/* Blueprint Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <Layers className="w-3.5 h-3.5 animate-pulse" />
            <span>{config.badgeText || '[CUSTOM MODULAR SKELETON BLUEPRINT]'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {config.heroHeadline || 'Craft Your Bespoke Presence. Convert Visitors Seamlessly.'}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {config.heroSubheadline ||
              'This is a clean, modular skeleton template designed for bespoke businesses and agencies. Replace this placeholder copy with your core value proposition, upload your brand assets, and connect appointments directly.'}
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{config.heroCtaText || 'Schedule Custom Consultation'}</span>
            </button>
            <button
              onClick={() => onOpenChat()}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Ask AI Concierge</span>
            </button>
          </div>
        </div>

        {/* Interactive Skeleton Mockup Preview */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Window Bar */}
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  https://{config.slug || 'custom-page'}.kortex.site
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Visual Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('blueprint')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeTab === 'blueprint'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Blueprint Architecture
                </button>
              </div>
            </div>

            {/* Mockup Body */}
            {activeTab === 'preview' ? (
              <div className="p-6 sm:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="inline-block px-3 py-1 rounded-md border border-dashed border-indigo-400/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-mono">
                      [HERO MEDIA ZONE]
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {config.businessName || 'Your Business Name'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {config.aboutText ||
                        'Upload your custom photography, brand artwork, or product showcase here. Your visitors experience instant online scheduling and multi-turn RAG chat assistant.'}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {config.industry || 'custom'}
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Live Booking Enabled</span>
                      </span>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-video group">
                    <img
                      src={
                        config.heroImageUrl ||
                        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={config.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xs font-mono text-white/90">
                        [Brand Hero Photo · 1200x800 recommended]
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skeletonSections.map((sec) => (
                    <div
                      key={sec.num}
                      className="p-4 rounded-xl border border-dashed border-indigo-400/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          SECTION {sec.num}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                          {sec.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sec.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sec.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Kinetic Marquee */}
      <div className="py-6 border-y border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 overflow-hidden">
        <KineticMarquee speed={22} pauseOnHover={true}>
          {[
            'CUSTOM WIREFRAME BLUEPRINT',
            'RAG KNOWLEDGE RETRIEVAL',
            'ONE-CLICK CALENDAR SYNC',
            'CUSTOM PRICING TIERS',
            '24/7 AI LIVE ASSISTANT',
            'ENTERPRISE MULTI-TENANT',
          ].map((item, idx) => (
            <div
              key={idx}
              className={`px-5 py-1.5 rounded-full border text-xs font-mono font-semibold tracking-wider whitespace-nowrap ${
                isDark
                  ? 'border-indigo-900/50 bg-indigo-950/40 text-indigo-300'
                  : 'border-indigo-200 bg-white text-indigo-700 shadow-2xs'
              }`}
            >
              {item}
            </div>
          ))}
        </KineticMarquee>
      </div>

      {/* Modular Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold">
            [MODULAR SERVICE CATALOG]
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Custom Services &amp; Solution Tiers
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Define your service offerings, durations, and rates. Clients can schedule immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(config.services || []).map((service, index) => (
            <TiltCard key={service.id || index} className="h-full">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-full space-y-4 shadow-sm hover:shadow-xl transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      TIER 0{index + 1}
                    </span>
                    {service.popular && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{service.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      ${service.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {service.durationMinutes} minutes
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenBooking(service.id)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Book This Service</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* About & Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 sm:p-12 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                [ABOUT &amp; BACKGROUND]
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {config.aboutTitle || 'About Your Company & Mission'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {config.aboutText ||
                  'Introduce your company story, core vision, and client commitments here. This clean skeleton layout is fully customizable: update services, working hours, pricing tiers, and embed customer testimonials with one click.'}
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
                {config.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{config.address}</span>
                  </div>
                )}
                {config.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{config.phone}</span>
                  </div>
                )}
                {config.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{config.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Operating Hours</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {(config.workingHours || []).map((wh, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{wh.days}</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">{wh.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
              [SOCIAL PROOF &amp; REVIEWS]
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Client Feedback
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.testimonials.map((test) => (
              <div
                key={test.id}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs"
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: test.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{test.comment}"
                </p>
                <div className="pt-2 text-xs font-bold text-slate-900 dark:text-white">
                  {test.clientName}{' '}
                  {test.clientRole && (
                    <span className="text-slate-400 font-normal text-[11px]">({test.clientRole})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Call to Action */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-slate-900 dark:text-white text-sm">
            {config.businessName || 'Your Company Name'}
          </div>
          <div className="text-xs font-mono">
            Powered by Kortex AI Enterprise Platform
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenBooking()}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Book Now
            </button>
            <span>&middot;</span>
            <button
              onClick={() => onOpenChat()}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Live Chat
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ScrambleText, CountUp } from '../effects';

interface HeroSectionProps {
  theme: 'light' | 'dark';
  onOpenAuth: (mode: 'admin' | 'staff' | 'register') => void;
}

const TRUST_METRICS = [
  {
    value: '0%',
    label: 'Token Markup',
    desc: 'Wholesale BYOK at provider cost',
    color: 'text-blue-500',
  },
  {
    value: 'Stream',
    label: 'Fast Response',
    desc: 'Sub-second token streaming',
    color: 'text-emerald-500',
  },
  {
    value: 'Mutex',
    label: 'Slot Locking',
    desc: 'Zero double-booking guarantee',
    color: 'text-indigo-500',
  },
  {
    countUp: 11,
    label: 'Industry Templates',
    desc: 'Pre-trained domain archetypes',
    color: 'text-amber-500',
  },
] as const;

export function HeroSection({ theme, onOpenAuth }: HeroSectionProps) {
  const isLight = theme === 'light';

  return (
    <section
      id="hero"
      className={`relative pt-20 sm:pt-28 pb-20 sm:pb-28 overflow-hidden ${
        isLight ? 'bg-white' : 'bg-slate-950'
      }`}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isLight ? '#64748b' : '#94a3b8'} 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border mb-8 ${
              isLight
                ? 'bg-blue-50 border-blue-200/80 text-blue-700'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <ScrambleText text="Next-Gen Autonomous Website Agents" />
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            AI Agents That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Book Appointments
            </span>{' '}
            & Close Leads
          </h1>

          {/* Subheading */}
          <p
            className={`mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Turn passive website visitors into confirmed calendar reservations and CRM leads.
            Zero token markup. Strict RAG grounding. One-click human takeover.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Deploy Free Website Agent
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#how-it-works"
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 border ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  : 'bg-slate-900/50 hover:bg-slate-800/50 text-slate-200 border-slate-800/50'
              }`}
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Trust Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          {TRUST_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center transition-colors ${
                isLight
                  ? 'bg-slate-50/80 border-slate-200/80 text-slate-800'
                  : 'bg-slate-900/40 border-slate-800/50 text-slate-200'
              }`}
            >
              <div className={`text-2xl sm:text-3xl font-bold ${metric.color}`}>
                {'countUp' in metric ? <CountUp end={metric.countUp} /> : metric.value}
              </div>
              <div className={`text-sm font-semibold mt-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                {metric.label}
              </div>
              <div className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                {metric.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

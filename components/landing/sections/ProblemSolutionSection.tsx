'use client';

import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';

interface ProblemSolutionSectionProps {
  theme: 'light' | 'dark';
}

const PROBLEMS = [
  {
    title: 'Chatbots that don\'t convert',
    desc: 'Traditional bots answer questions but never book appointments or capture leads.',
  },
  {
    title: '300–800% AI token markups',
    desc: 'Most platforms resell AI tokens at massive markups on top of provider costs.',
  },
  {
    title: 'Double-bookings & scheduling chaos',
    desc: 'Manual booking flows have no concurrency control, leading to conflicts.',
  },
  {
    title: 'Leads trapped in chat logs',
    desc: 'Contact info buried in conversation transcripts that nobody reviews.',
  },
];

const SOLUTIONS = [
  {
    title: 'AI that books autonomously',
    desc: 'Native in-chat calendar with slot selection, confirmation, and calendar sync.',
  },
  {
    title: 'Zero markup BYOK pricing',
    desc: 'Paste your own API keys and pay wholesale rates directly to providers.',
  },
  {
    title: 'Atomic mutex slot locking',
    desc: 'In-memory concurrency locks prevent double-bookings at the system level.',
  },
  {
    title: 'Auto-extracted leads to CRM',
    desc: 'AI detects emails, phones, and intent from conversation text automatically.',
  },
];

export function ProblemSolutionSection({ theme }: ProblemSolutionSectionProps) {
  const isLight = theme === 'light';

  return (
    <section
      className={`py-24 lg:py-32 border-t scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
        isLight
          ? 'bg-slate-50/50 border-slate-200/60'
          : 'bg-slate-900/20 border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            The Problem With{' '}
            <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>
              Today&apos;s Chatbots
            </span>
          </h2>
          <p className={`mt-4 text-lg ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Most AI chat solutions stop at Q&A. Crescelo goes further — booking appointments,
            capturing leads, and locking slots, all autonomously.
          </p>
        </div>

        {/* Two Column Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Problems Column */}
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 ${
                isLight
                  ? 'bg-red-50 text-red-700 border border-red-200/80'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Traditional Solutions
            </div>
            <div className="space-y-5">
              {PROBLEMS.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex gap-4 ${
                    isLight
                      ? 'bg-white border-slate-200/80'
                      : 'bg-slate-900/40 border-slate-800/50'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    <XCircle className="h-5 w-5 text-red-400/70" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Crescelo Platform
            </div>
            <div className="space-y-5">
              {SOLUTIONS.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex gap-4 ${
                    isLight
                      ? 'bg-white border-emerald-200/50'
                      : 'bg-slate-900/40 border-emerald-900/30'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

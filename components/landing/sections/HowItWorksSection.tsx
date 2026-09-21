'use client';

import React from 'react';
import { Code, FileCheck, MessageSquare, Calendar } from 'lucide-react';

interface HowItWorksSectionProps {
  theme: 'light' | 'dark';
}

const STEPS = [
  {
    step: '01',
    icon: Code,
    title: 'Install Widget',
    desc: 'Add one script tag to your website. Works with any platform — WordPress, Shopify, Webflow, or custom HTML.',
    accent: 'blue',
  },
  {
    step: '02',
    icon: FileCheck,
    title: 'Train Your Agent',
    desc: 'Upload documents, scrape your site URL, or paste FAQs. Your AI learns your business knowledge in minutes.',
    accent: 'indigo',
  },
  {
    step: '03',
    icon: MessageSquare,
    title: 'Engage Visitors',
    desc: 'AI handles conversations 24/7, answers questions with grounded RAG retrieval, and captures leads automatically.',
    accent: 'emerald',
  },
  {
    step: '04',
    icon: Calendar,
    title: 'Book & Convert',
    desc: 'Native in-chat calendar booking with concurrency locks. Appointments sync directly to your calendar.',
    accent: 'amber',
  },
] as const;

const ACCENT_COLORS = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-500',
    line: 'bg-blue-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-500',
    line: 'bg-indigo-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-500',
    line: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-500',
    line: 'bg-amber-500',
  },
} as const;

export function HowItWorksSection({ theme }: HowItWorksSectionProps) {
  const isLight = theme === 'light';

  return (
    <section
      id="how-it-works"
      className={`py-24 lg:py-32 border-t scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
        isLight ? 'border-slate-200/60' : 'border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
              isLight ? 'text-blue-600' : 'text-blue-400'
            }`}
          >
            How It Works
          </p>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Live in Minutes, Not Months
          </h2>
          <p className={`mt-4 text-lg ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Four steps from installation to your first AI-booked appointment.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STEPS.map((step, idx) => {
            const colors = ACCENT_COLORS[step.accent];
            const Icon = step.icon;
            return (
              <div key={idx} className="relative">
                {/* Connecting line (hidden on last item and on mobile) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+32px)] right-0 h-px">
                    <div
                      className={`h-full w-full ${
                        isLight ? 'bg-slate-200' : 'bg-slate-800'
                      }`}
                    />
                  </div>
                )}

                <div
                  className={`relative p-6 rounded-2xl border h-full transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200/80 hover:border-slate-300'
                      : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  {/* Step number */}
                  <div
                    className={`text-xs font-bold mb-4 ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Step {step.step}
                  </div>

                  {/* Icon */}
                  <div
                    className={`h-12 w-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text} mb-5`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

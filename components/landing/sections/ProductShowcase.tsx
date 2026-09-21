'use client';

import React from 'react';
import { Zap, Calendar, Activity } from 'lucide-react';

interface ProductShowcaseProps {
  theme: 'light' | 'dark';
  demoInput: string;
  setDemoInput: (value: string) => void;
  demoMessages: Array<{ role: 'user' | 'assistant'; text: string; hasBooking?: boolean }>;
  isDemoStreaming: boolean;
  sandboxTraceState: 'idle' | 'input' | 'intent' | 'rag' | 'brain' | 'firebreak' | 'action';
  handleDemoSend: (textToSend?: string) => void;
}

const TRACE_STEPS = [
  { key: 'input', label: 'INPUT', color: 'cyan' },
  { key: 'intent', label: 'INTENT', color: 'blue' },
  { key: 'rag', label: 'RAG', color: 'indigo' },
  { key: 'brain', label: 'BRAIN', color: 'blue' },
  { key: 'firebreak', label: 'VERIFY', color: 'emerald' },
  { key: 'action', label: 'ACTION', color: 'emerald' },
] as const;

const TRACE_ACTIVE_STYLES: Record<string, string> = {
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
};

const STARTER_PROMPTS = [
  { label: 'Book appointment', text: 'Can I book an appointment tomorrow at 10:00 AM?' },
  { label: 'Leave contact info', text: 'My email is alex@acme.com and phone is 555-0199. Send me enterprise info.' },
  { label: 'Ask about pricing', text: 'How does your zero-markup BYOK pricing work?' },
];

export function ProductShowcase({
  theme,
  demoInput,
  setDemoInput,
  demoMessages,
  isDemoStreaming,
  sandboxTraceState,
  handleDemoSend,
}: ProductShowcaseProps) {
  const isLight = theme === 'light';

  return (
    <section
      id="sandbox"
      className={`py-24 lg:py-32 border-t scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
        isLight
          ? 'bg-slate-50/50 border-slate-200/60'
          : 'bg-slate-900/20 border-slate-800/40'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border mb-4 ${
              isLight
                ? 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Interactive Demo
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Test It Right Now
          </h2>
          <p className={`mt-3 text-base max-w-xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Ask about pricing, test booking, or leave contact info to see how Kortex handles real customer interactions.
          </p>
        </div>

        {/* Chat Surface — Browser Chrome */}
        <div
          className={`rounded-2xl border overflow-hidden shadow-2xl transition-colors ${
            isLight
              ? 'border-slate-200 bg-white shadow-slate-200/50'
              : 'border-slate-800/70 bg-slate-900/90 shadow-black/30'
          }`}
        >
          {/* Top Bar */}
          <div
            className={`px-5 py-3.5 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800/70 bg-slate-950/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Kortex AI Concierge
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                }`}
              >
                Grounded RAG
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-blue-950/60 text-blue-400 border-blue-800/40'
                }`}
              >
                Mutex Armed
              </span>
            </div>
          </div>

          {/* Architecture Trace Ribbon */}
          <div
            className={`px-5 py-2 border-b text-[10px] font-mono flex items-center gap-2 overflow-x-auto no-scrollbar ${
              isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/80 border-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-1.5 shrink-0 text-slate-500 font-semibold">
              <Activity className="h-3 w-3" />
              <span>Trace:</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {TRACE_STEPS.map((step, idx) => (
                <React.Fragment key={step.key}>
                  {idx > 0 && <span className="text-slate-600 mx-0.5">→</span>}
                  <span
                    className={`px-2 py-0.5 rounded border transition-all ${
                      sandboxTraceState === step.key
                        ? TRACE_ACTIVE_STYLES[step.color]
                        : isLight
                          ? 'bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
                    }`}
                  >
                    {step.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div
            className={`p-5 space-y-4 max-h-96 overflow-y-auto min-h-[200px] ${
              isLight ? 'bg-white' : 'bg-slate-950/30'
            }`}
          >
            {demoMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : isLight
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-slate-800/70 text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.hasBooking && (
                  <div
                    className={`mt-3 w-full max-w-md p-4 rounded-2xl border space-y-3 ${
                      isLight
                        ? 'bg-blue-50/50 border-blue-200/60'
                        : 'bg-blue-950/20 border-blue-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        <Calendar className="h-4 w-4" />
                        <span>Executive Demo Consultation</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          isLight
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                        }`}
                      >
                        Available
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoSend('I want to book Tomorrow at 10:00 AM')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer text-sm ${
                          isLight
                            ? 'border-slate-200 bg-white hover:border-blue-400'
                            : 'border-slate-700/50 bg-slate-900/60 hover:border-blue-500'
                        }`}
                      >
                        <div className="font-semibold text-blue-600 dark:text-blue-400">Tomorrow</div>
                        <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          10:00 AM – 10:45 AM
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoSend('I want to book Tomorrow at 2:30 PM')}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer text-sm ${
                          isLight
                            ? 'border-slate-200 bg-white hover:border-blue-400'
                            : 'border-slate-700/50 bg-slate-900/60 hover:border-blue-500'
                        }`}
                      >
                        <div className="font-semibold text-blue-600 dark:text-blue-400">Tomorrow</div>
                        <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          2:30 PM – 3:15 PM
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isDemoStreaming && (
              <div className="flex items-center gap-2 text-sm text-blue-500 font-mono">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Synthesizing grounded response...</span>
              </div>
            )}
          </div>

          {/* Starter Prompts */}
          <div
            className={`px-5 py-3 border-t flex flex-wrap items-center gap-2 ${
              isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800/50 bg-slate-950/50'
            }`}
          >
            <span className={`text-xs font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Try:
            </span>
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.label}
                type="button"
                onClick={() => handleDemoSend(prompt.text)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 text-slate-300'
                }`}
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div
            className={`px-5 py-4 border-t flex items-center gap-3 ${
              isLight ? 'border-slate-200 bg-white' : 'border-slate-800/50 bg-slate-950/60'
            }`}
          >
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDemoSend()}
              placeholder="Ask a question or test booking..."
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white placeholder:text-slate-400'
                  : 'bg-slate-900/50 border-slate-700/50 text-white focus:border-blue-500 placeholder:text-slate-500'
              }`}
            />
            <button
              type="button"
              onClick={() => handleDemoSend()}
              disabled={!demoInput.trim() || isDemoStreaming}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition disabled:opacity-40 cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

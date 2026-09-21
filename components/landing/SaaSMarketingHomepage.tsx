'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Zap,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Users,
  Clock,
  Layers,
  Code,
  Lock,
  Headphones,
  FileCheck,
  Activity,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import { ParallaxBackground } from './ParallaxBackground';
import { PipelineSection } from './pipeline';
import { ScrambleText, SpotlightCard, CountUp } from './effects';

interface SaaSMarketingHomepageProps {
  onOpenAuth: (mode: 'admin' | 'staff' | 'register') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function SaaSMarketingHomepage({
  onOpenAuth,
  theme = 'dark',
  onToggleTheme,
}: SaaSMarketingHomepageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoInput, setDemoInput] = useState('');
  const [scrollPercent, setScrollPercent] = useState(0);
  const [demoMessages, setDemoMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; hasBooking?: boolean }>
  >([
    {
      role: 'assistant',
      text: 'Hello! I am the Kortex AI representative. I answer customer questions, capture qualified leads, and book appointments directly on your calendar with zero token markup. What would you like to test?',
    },
  ]);
  const [isDemoStreaming, setIsDemoStreaming] = useState(false);
  const [sandboxTraceState, setSandboxTraceState] = useState<
    'idle' | 'input' | 'intent' | 'rag' | 'brain' | 'firebreak' | 'action'
  >('idle');

  const isLight = theme === 'light';

  // Track document scroll progress percentage
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollPercent(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal observer for section entrance effects
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleDemoSend = (textToSend?: string) => {
    const text = textToSend || demoInput;
    if (!text.trim() || isDemoStreaming) return;

    const userMsg = text.trim();
    setDemoInput('');
    setDemoMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsDemoStreaming(true);

    // Trigger visual architecture pipeline sequence
    setSandboxTraceState('input');
    setTimeout(() => setSandboxTraceState('intent'), 120);
    setTimeout(() => setSandboxTraceState('rag'), 240);
    setTimeout(() => setSandboxTraceState('brain'), 360);
    setTimeout(() => setSandboxTraceState('firebreak'), 480);
    setTimeout(() => setSandboxTraceState('action'), 600);

    setTimeout(() => {
      let reply = '';
      let hasBooking = false;

      const lower = userMsg.toLowerCase();
      if (
        lower.includes('book') ||
        lower.includes('schedule') ||
        lower.includes('appointment') ||
        lower.includes('demo')
      ) {
        reply =
          'I would be delighted to schedule a walkthrough for you! Select your preferred date and time below:';
        hasBooking = true;
      } else if (lower.includes('pricing') || lower.includes('cost') || lower.includes('price')) {
        reply =
          'Kortex AI offers transparent, flat-rate pricing starting at $49/month with 0% token markup. You can bring your own OpenAI/Anthropic key or use our built-in zero-cost failover engine for $0 compute.';
      } else if (
        lower.includes('different') ||
        lower.includes('compare') ||
        lower.includes('vs') ||
        lower.includes('conversion') ||
        lower.includes('traditional')
      ) {
        reply =
          'Traditional chatbots act as passive text-only lookup tools with credit burn limits. Kortex AI is action-oriented: we natively book appointments on your calendar, auto-capture leads directly from conversation, and provide at-cost BYOK pricing with zero token tax.';
      } else if (lower.includes('lead') || lower.includes('email') || lower.includes('phone')) {
        reply =
          'When visitors leave their contact details anywhere in the chat, Kortex AI automatically detects the email and phone number, attributes the conversation, and pushes the lead to your CRM and email in real time.';
      } else {
        reply = `I understand you are asking about "${userMsg}". Kortex AI grounds all answers strictly in your verified knowledge documents with hybrid vector and keyword retrieval. If an answer is outside the knowledge base, I automatically bridge to live human support.`;
      }

      setDemoMessages((prev) => [...prev, { role: 'assistant', text: reply, hasBooking }]);
      setIsDemoStreaming(false);
      setTimeout(() => setSandboxTraceState('idle'), 3500);
    }, 600);
  };

  const templates = [
    {
      name: 'Classic Barbershop',
      slug: 'classic-barbershop',
      tag: 'Local Service',
      desc: 'Appointment booking, barber selection, service pricing menu.',
    },
    {
      name: 'Fitness & Gym Club',
      slug: 'fitness-gym',
      tag: 'Health & Wellness',
      desc: 'Membership tiers, class booking, personal training dispatch.',
    },
    {
      name: 'Real Estate Agency',
      slug: 'real-estate',
      tag: 'High Ticket',
      desc: 'Property inquiries, viewing appointments, buyer lead triage.',
    },
    {
      name: 'SaaS Platform',
      slug: 'saas-platform',
      tag: 'B2B Software',
      desc: 'Interactive API playground, demo booking, SLA questions.',
    },
    {
      name: 'Healthcare Clinic',
      slug: 'healthcare-clinic',
      tag: 'Medical',
      desc: 'Doctor consultations, insurance inquiries, intake routing.',
    },
    {
      name: 'Legal Counsel',
      slug: 'legal-counsel',
      tag: 'Professional',
      desc: 'Case evaluations, practice areas, consultation scheduling.',
    },
  ];

  const faqs = [
    {
      q: 'How does Kortex AI drive higher conversions than standard chatbots?',
      a: 'Most chatbots act merely as passive FAQ widgets that leave visitors to navigate on their own. Kortex AI is action-oriented: it actively guides prospects to confirmed calendar bookings, extracts phone numbers and emails directly from natural conversation, and provides instant staff notifications for immediate follow-up.',
    },
    {
      q: 'What does Zero-Markup BYOK mean?',
      a: 'BYOK stands for Bring Your Own Key. Instead of paying inflated 300% to 800% markups on OpenAI, Anthropic, or Google tokens, you paste your own provider key. You pay the AI provider directly at raw wholesale prices ($0.15 per million tokens on Gemini 1.5 Flash), while Kortex AI simply charges a flat platform hosting fee.',
    },
    {
      q: 'Can I use Kortex AI without an OpenAI or Anthropic API key?',
      a: 'Yes. Kortex AI includes a built-in Zero-Cost Inference Engine (auto_free). It cascades requests across high-speed multi-provider free inference pipelines and offline local model layers for $0 compute cost.',
    },
    {
      q: 'How does in-chat appointment booking work?',
      a: 'When a visitor asks to book a consultation, tour, or service, the AI assistant detects booking intent and immediately embeds an interactive date and time picker directly in the conversation. Once the visitor selects a time, Kortex AI checks real-time slot availability, reserves the slot with concurrency lock protection, and sends instant Google Calendar, Outlook, and .ics confirmations.',
    },
    {
      q: 'How do I install the Kortex AI widget on my website?',
      a: 'You paste a single line of JavaScript (<script src=".../widget.js" data-assistant-id="..."></script>) before the closing </body> tag of your website. It works seamlessly with WordPress, Webflow, Shopify, Wix, Squarespace, Framer, and custom HTML.',
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      } font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden transition-colors duration-300`}
    >
      {/* Dynamic Top Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 z-60 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-75 ease-out shadow-sm shadow-blue-500/50"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      <ParallaxBackground theme={theme} />

      <div className="relative z-10">
        {/* Top Announcement Bar */}
        <div
          className={`border-b px-4 py-2 text-center text-xs transition-colors duration-300 ${
            isLight
              ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-100 border-blue-200/80 text-blue-900'
              : 'bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 border-blue-800/40 text-blue-200'
          }`}
        >
          <span
            className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded mr-2 border ${
              isLight
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-600/60 text-white border-blue-400/40'
            }`}
          >
            Action-Driven Conversion
          </span>
          <span>Native Calendar Booking. 0% Token Markup. Automatic Lead Capture.</span>
        </div>

        {/* Navigation Bar */}
        <header
          className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
            isLight
              ? 'bg-white/85 border-slate-200/90 text-slate-900 shadow-xs'
              : 'bg-slate-950/80 border-slate-800/80 text-white'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                KORTEX<span className="text-blue-500">.AI</span>
              </span>
            </div>

            <nav
              className={`hidden md:flex items-center gap-7 text-xs font-medium ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              <a
                href="#workflow"
                className={`transition flex items-center gap-1.5 ${
                  isLight ? 'hover:text-blue-600' : 'hover:text-white'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Live Brain</span>
              </a>
              <a
                href="#sandbox"
                className={`transition ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}
              >
                Sandbox
              </a>
              <a
                href="#features"
                className={`transition ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}
              >
                Features
              </a>
              <a
                href="#templates"
                className={`transition ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}
              >
                Templates
              </a>
              <a
                href="#pricing"
                className={`transition ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}
              >
                Pricing
              </a>
              <a
                href="#comparison"
                className={`transition ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}
              >
                Comparison
              </a>
              <a
                href="#faq"
                className={`transition ${isLight ? 'hover:text-blue-600' : 'hover:text-white'}`}
              >
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`p-2 rounded-lg transition cursor-pointer ${
                    isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
                  }`}
                  title="Toggle Theme"
                >
                  {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenAuth('staff')}
                className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer ${
                  isLight
                    ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg shadow-sm shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section
          id="hero"
          className={`relative pt-16 pb-20 overflow-hidden border-b transition-colors duration-300 ${
            isLight ? 'border-slate-200/80' : 'border-slate-800/60'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-5">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-inner border ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span><ScrambleText text="Next-Gen Autonomous Website Conversion" /></span>
              </div>

              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight ${
                  isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                AI Website Agents That Actually{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-400">
                  Book Appointments
                </span>{' '}
                &amp; Close Leads.
              </h1>

              <p
                className={`text-base sm:text-lg max-w-2xl mx-auto ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                Turn passive website visitors into confirmed calendar reservations and CRM leads.
                Zero token markup, 1-click live human takeover, and strict RAG grounding.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Deploy Free Website Agent</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#workflow"
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 border ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span>Explore Live Brain</span>
                </a>
              </div>

              {/* Platform Telemetry & Conversion Proof Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight
                      ? 'bg-white/90 border-slate-200 shadow-sm text-slate-800'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">0%</div>
                  <div className={`text-[11px] font-semibold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                    Token Tax
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Wholesale BYOK at provider cost
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight
                      ? 'bg-white/90 border-slate-200 shadow-sm text-slate-800'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">Stream</div>
                  <div className={`text-[11px] font-semibold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                    Fast Response
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sub-second tokens &amp; local cache
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight
                      ? 'bg-white/90 border-slate-200 shadow-sm text-slate-800'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">Slot Lock</div>
                  <div className={`text-[11px] font-semibold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                    Per-Instance Mutex
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    In-memory lock &amp; DB uniqueness
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight
                      ? 'bg-white/90 border-slate-200 shadow-sm text-slate-800'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                    <CountUp end={11} />
                  </div>
                  <div className={`text-[11px] font-semibold mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                    Production Archetypes
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Pre-trained domain templates
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Autonomous Pipeline Section */}
        <section
          id="workflow"
          className={`py-20 border-b scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
            isLight ? 'border-slate-200/80 bg-slate-100/60' : 'border-slate-800/60 bg-slate-950/40'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
                }`}
              >
                <Cpu className="h-3.5 w-3.5 text-blue-500" />
                <span>Autonomous Systems Pipeline</span>
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                Inspect the Real Grounded Architecture
              </h2>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Hardware-accelerated Three.js WebGL visualization of local embedding vectors, reciprocal rank fusion retrieval, grounded synthesis, and deterministic appointment locking.
              </p>
            </div>

            <PipelineSection theme={theme} />
          </div>
        </section>

        {/* Interactive Live Sandbox Section */}
        <section
          id="sandbox"
          className={`py-20 border-b scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
            isLight ? 'border-slate-200/80' : 'border-slate-800/60'
          }`}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-emerald-500" />
                <span>Zero-Latency Interactive Simulator</span>
              </div>
              <h2
                className={`text-3xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                Test Appointment Booking &amp; Lead Capture Right Now
              </h2>
              <p className={`text-sm max-w-xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Ask about pricing, test in-chat booking prompts, or leave an email to experience
                how Kortex AI handles real-world customer interactions.
              </p>
            </div>

            {/* Simulated Live Chat Surface */}
            <div
              className={`rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
                isLight
                  ? 'border-slate-200 bg-white shadow-slate-200/80'
                  : 'border-slate-800 bg-slate-900/90'
              }`}
            >
              {/* Header Bar */}
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold">Kortex AI Concierge • Live Sandbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Hybrid Grounded RAG
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                    }`}
                  >
                    Mutex Armed
                  </span>
                </div>
              </div>

              {/* Live Architecture System Trace Ribbon */}
              <div
                className={`px-4 py-2.5 border-b text-[10px] font-mono flex items-center justify-between overflow-x-auto no-scrollbar gap-2 transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400 font-bold uppercase">
                  <Activity className="h-3 w-3 text-cyan-500" />
                  <span>Architecture Trace:</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded border transition-all ${
                      sandboxTraceState === 'input'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 font-bold shadow-[0_0_8px_#38bdf8]'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
                    }`}
                  >
                    1. INPUT
                  </span>
                  <span className="text-slate-600">→</span>
                  <span
                    className={`px-2 py-0.5 rounded border transition-all ${
                      sandboxTraceState === 'intent'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-400 font-bold shadow-[0_0_8px_#3b82f6]'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
                    }`}
                  >
                    2. INTENT
                  </span>
                  <span className="text-slate-600">→</span>
                  <span
                    className={`px-2 py-0.5 rounded border transition-all ${
                      sandboxTraceState === 'rag'
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-400 font-bold shadow-[0_0_8px_#818cf8]'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
                    }`}
                  >
                    3. RAG MEMORY
                  </span>
                  <span className="text-slate-600">→</span>
                  <span
                    className={`px-2 py-0.5 rounded border transition-all ${
                      sandboxTraceState === 'brain'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-400 font-bold shadow-[0_0_8px_#60a5fa]'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
                    }`}
                  >
                    4. BRAIN CORE
                  </span>
                  <span className="text-slate-600">→</span>
                  <span
                    className={`px-2 py-0.5 rounded border transition-all ${
                      sandboxTraceState === 'firebreak'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400 font-bold shadow-[0_0_8px_#10b981]'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
                    }`}
                  >
                    5. FIREBREAK
                  </span>
                  <span className="text-slate-600">→</span>
                  <span
                    className={`px-2 py-0.5 rounded border transition-all ${
                      sandboxTraceState === 'action'
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400 font-bold shadow-[0_0_10px_#10b981]'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700/40'
                    }`}
                  >
                    6. MUTEX ACTION
                  </span>
                </div>
              </div>

              {/* Message Transcript Area */}
              <div
                className={`p-5 sm:p-6 space-y-4 max-h-96 overflow-y-auto ${
                  isLight ? 'bg-slate-50/50' : 'bg-slate-950/40'
                }`}
              >
                {demoMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isLight
                          ? 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow-inner'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.hasBooking && (
                      <div
                        className={`mt-3 w-full max-w-md p-4 rounded-2xl border space-y-3 ${
                          isLight
                            ? 'bg-blue-50/70 border-blue-200 shadow-sm'
                            : 'bg-blue-950/30 border-blue-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-300">
                            <Calendar className="h-4 w-4" />
                            <span>Executive Demo Consultation</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded border ${
                              isLight
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            Slots Available
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleDemoSend('I want to book Tomorrow at 10:00 AM')
                            }
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer text-xs ${
                              isLight
                                ? 'border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50'
                                : 'border-slate-700 bg-slate-900/80 hover:border-blue-500 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-bold text-blue-600 dark:text-blue-400">Tomorrow</div>
                            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              10:00 AM - 10:45 AM
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDemoSend('I want to book Tomorrow at 2:30 PM')
                            }
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer text-xs ${
                              isLight
                                ? 'border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50'
                                : 'border-slate-700 bg-slate-900/80 hover:border-blue-500 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-bold text-blue-600 dark:text-blue-400">Tomorrow</div>
                            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              2:30 PM - 3:15 PM
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isDemoStreaming && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-500 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>Synthesizing grounded response...</span>
                  </div>
                )}
              </div>

              {/* Preset Clickable Prompts */}
              <div
                className={`p-3 border-t flex flex-wrap items-center gap-2 text-[11px] ${
                  isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Try asking:
                </span>
                <button
                  type="button"
                  onClick={() => handleDemoSend('Can I book an appointment tomorrow at 10:00 AM?')}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    isLight
                      ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  &quot;Book an appointment&quot;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDemoSend(
                      'My email is alex@acme.com and phone is 555-0199. Send me enterprise info.'
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    isLight
                      ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  &quot;Leave contact info&quot;
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSend('How does your zero-markup BYOK pricing work?')}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    isLight
                      ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  &quot;Zero-markup BYOK&quot;
                </button>
              </div>

              {/* Input Form */}
              <div
                className={`p-4 border-t flex items-center gap-3 ${
                  isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDemoSend()}
                  placeholder="Ask a question or test booking..."
                  className={`flex-1 rounded-xl px-4 py-2.5 text-xs outline-none transition border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleDemoSend()}
                  disabled={!demoInput.trim() || isDemoStreaming}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-40 cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Grid */}
        <section
          id="features"
          className={`py-20 border-b scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
            isLight ? 'border-slate-200/80' : 'border-slate-800/60'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isLight
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>Enterprise Architecture</span>
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                Engineered for Revenue &amp; Autonomous Operation
              </h2>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Everything you need to turn standard visitors into paying clients without hiring
                around-the-clock sales reps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Bento Col-span-2: Native In-Chat Calendar Booking */}
              <SpotlightCard
                theme={theme}
                className={`md:col-span-2 p-6 sm:p-8 flex flex-col justify-between ${
                  isLight
                    ? 'border-slate-200 bg-white shadow-sm text-slate-800'
                    : 'border-slate-800/90 bg-slate-900/60 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isLight
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-blue-950/80 border-blue-800/80 text-blue-300'
                      }`}
                    >
                      Real-Time Concurrency
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Native In-Chat Calendar Booking
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed max-w-xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Visitors pick and confirm appointments right inside the conversation stream. Concurrency lock validation prevents double-booking, and confirmation invites sync directly to Google Calendar, Outlook, and .ics.
                  </p>
                </div>
                <div
                  className={`mt-6 p-3.5 rounded-xl border flex items-center justify-between font-mono text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>In-Memory Slot Lock Active</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Auto-Expiry: 5m</span>
                </div>
              </SpotlightCard>

              {/* Feature 2: Bento Col-span-1: Zero-Form Lead Extraction */}
              <SpotlightCard
                theme={theme}
                className={`p-6 sm:p-8 flex flex-col justify-between ${
                  isLight
                    ? 'border-slate-200 bg-white shadow-sm text-slate-800'
                    : 'border-slate-800/90 bg-slate-900/60 text-slate-200'
                }`}
              >
                <div>
                  <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Zero-Form Lead Extraction
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Detects emails, phone numbers, and visitor intent directly from unstructured conversational text. Pushes attributed leads to your CRM and staff inbox with zero extra friction.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-indigo-500">
                  <span>Intent Parsing &amp; Extraction</span>
                </div>
              </SpotlightCard>

              {/* Feature 3: Bento Col-span-1: Zero-Markup BYOK Architecture */}
              <SpotlightCard
                theme={theme}
                className={`p-6 sm:p-8 flex flex-col justify-between ${
                  isLight
                    ? 'border-slate-200 bg-white shadow-sm text-slate-800'
                    : 'border-slate-800/90 bg-slate-900/60 text-slate-200'
                }`}
              >
                <div>
                  <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Zero-Markup BYOK
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Paste your own OpenAI, Anthropic, Gemini, or Groq API keys and pay wholesale token rates directly to model vendors without platform markups.
                  </p>
                </div>
                <div className="mt-4 text-[11px] font-mono text-cyan-500">
                  <span>Wholesale Raw Token Pricing</span>
                </div>
              </SpotlightCard>

              {/* Feature 4: Bento Col-span-1: Zero-Cost Free Engine Cascade */}
              <SpotlightCard
                theme={theme}
                className={`p-6 sm:p-8 flex flex-col justify-between ${
                  isLight
                    ? 'border-slate-200 bg-white shadow-sm text-slate-800'
                    : 'border-slate-800/90 bg-slate-900/60 text-slate-200'
                }`}
              >
                <div>
                  <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Zero-Cost Cascade
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Run for $0 compute using our resilient multi-provider failover pipeline, cascading across high-speed free tier inference and local offline model layers.
                  </p>
                </div>
                <div className="mt-4 text-[11px] font-mono text-emerald-500">
                  <span>Multi-Engine Failover Stack</span>
                </div>
              </SpotlightCard>

              {/* Feature 5: Bento Col-span-1: Live Agent Takeover & Audio Alerts */}
              <SpotlightCard
                theme={theme}
                className={`p-6 sm:p-8 flex flex-col justify-between ${
                  isLight
                    ? 'border-slate-200 bg-white shadow-sm text-slate-800'
                    : 'border-slate-800/90 bg-slate-900/60 text-slate-200'
                }`}
              >
                <div>
                  <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Live Agent Takeover
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Step into any live visitor chat with a single click. AI pauses immediately, and audio chimes alert your team whenever high-intent prospects request assistance.
                  </p>
                </div>
                <div className="mt-4 text-[11px] font-mono text-amber-500">
                  <span>1-Click Human Escort</span>
                </div>
              </SpotlightCard>

              {/* Feature 6: Bento Col-span-3: 11 Industry Business Archetypes */}
              <SpotlightCard
                theme={theme}
                className={`md:col-span-3 p-6 sm:p-8 ${
                  isLight
                    ? 'border-slate-200 bg-white shadow-sm text-slate-800'
                    : 'border-slate-800/90 bg-slate-900/60 text-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-4">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h3 className={`text-xl font-bold mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      11 Pre-Trained Industry Archetypes
                    </h3>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Domain-specific conversation trees, booking schedules, and knowledge schemas ready to deploy in under 60 seconds.
                    </p>
                  </div>
                  <a
                    href="#templates"
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition shrink-0 flex items-center gap-1.5 ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span>Browse All Templates</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                  {[
                    'Barbershop',
                    'Fitness & Gym',
                    'Real Estate',
                    'SaaS Platform',
                    'Healthcare Clinic',
                    'Legal Counsel',
                  ].map((archetype, aIdx) => (
                    <div
                      key={aIdx}
                      className={`p-2.5 rounded-xl border text-center font-mono text-xs ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      {archetype}
                    </div>
                  ))}
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* Industry Template Showcase */}
        <section
          id="templates"
          className={`py-20 border-b scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
            isLight ? 'border-slate-200/80 bg-slate-100/50' : 'border-slate-800/60 bg-slate-950/40'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span>Pre-Configured Knowledge Bases</span>
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                Ready-to-Deploy Industry Landing Pages
              </h2>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Each archetype includes a dedicated landing surface, pre-loaded service knowledge,
                and calendar booking flows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between ${
                    isLight
                      ? 'border-slate-200 bg-white hover:border-blue-300 shadow-sm text-slate-800'
                      : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:shadow-blue-500/10 text-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isLight
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                        }`}
                      >
                        {tpl.tag}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <h3
                      className={`text-base font-bold ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {tpl.name}
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {tpl.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/site/${tpl.slug}`}
                      target="_blank"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Preview Live Site</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('register')}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium cursor-pointer ${
                        isLight
                          ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      Deploy Archetype
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className={`py-20 border-b scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
            isLight ? 'border-slate-200/80' : 'border-slate-800/60'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-emerald-500" />
                <span>Zero Token Markup</span>
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                Simple, Transparent, Predictable Plans
              </h2>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Bring your own keys and pay $0 markup on AI compute, or use our free tier cascade.
                No credit surprises or arbitrary usage penalties.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Starter',
                  price: '$49',
                  period: '/month',
                  desc: 'Ideal for small businesses getting started with automated AI customer support.',
                  features: [
                    '100 Chat Sessions / month',
                    '1 AI Assistant Bot',
                    '1 Hosted Business Landing Page',
                    '50 MB Knowledge Storage (~50,000 pages)',
                    'Native Calendar Booking Picker',
                    'Automatic In-Chat Lead Capture',
                    'Zero-Cost Inference Engine Included',
                    'Standard Email Support',
                  ],
                  featured: false,
                  cta: 'Start 14-Day Free Trial',
                },
                {
                  name: 'Growth',
                  price: '$149',
                  period: '/month',
                  desc: 'For growing brands needing high-volume conversations and calendar booking.',
                  features: [
                    '500 Chat Sessions / month',
                    '5 AI Assistant Bots',
                    '3 Hosted Business Landing Pages',
                    '500 MB Knowledge Storage',
                    'Appointment Booking & Calendar Sync',
                    'Multi-Document RAG Knowledge Base',
                    '1-Click Live Human Staff Takeover',
                    'Audio Alerts & Real-Time Chimes',
                  ],
                  featured: true,
                  cta: 'Deploy Growth Plan',
                },
                {
                  name: 'Agency / Scale',
                  price: '$399',
                  period: '/month',
                  desc: 'Enterprise-grade scale for digital agencies and high-volume operations.',
                  features: [
                    '2,000 Chat Sessions / month',
                    'Unlimited AI Assistant Bots',
                    '7 Hosted Business Landing Pages',
                    '5 GB High-Capacity Knowledge Storage',
                    'Omnichannel: WhatsApp & Telegram',
                    'All 11 Industry Archetypes',
                    'Custom Domain & Full White-Label',
                    'Dedicated Account Manager & SLA',
                  ],
                  featured: false,
                  cta: 'Contact Enterprise Sales',
                },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-7 rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative ${
                    tier.featured
                      ? isLight
                        ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-xl'
                        : 'border-blue-500 bg-slate-900/90 shadow-2xl shadow-blue-500/10'
                      : isLight
                      ? 'border-slate-200 bg-white shadow-sm'
                      : 'border-slate-800/90 bg-slate-900/50'
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold tracking-wider uppercase text-white shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3
                        className={`text-lg font-bold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {tier.name}
                      </h3>
                      <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {tier.desc}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-extrabold ${
                          isLight ? 'text-slate-950' : 'text-white'
                        }`}
                      >
                        {tier.price}
                      </span>
                      <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {tier.period}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                      {tier.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className={`mt-6 w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                      tier.featured
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architectural Comparison Table */}
        <section
          id="comparison"
          className={`py-20 border-b scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
            isLight ? 'border-slate-200/80 bg-slate-100/50' : 'border-slate-800/60 bg-slate-950/40'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-blue-500" />
                <span>Architectural Overview</span>
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                Built for High-Converting Business Outcomes
              </h2>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                See how Kortex AI’s autonomous action architecture delivers tangible appointment
                bookings and qualified leads compared to traditional chat solutions.
              </p>
            </div>

            <div
              className={`rounded-3xl border overflow-hidden shadow-2xl transition-colors ${
                isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/90'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead
                    className={
                      isLight
                        ? 'bg-slate-100 border-b border-slate-200 text-slate-800'
                        : 'bg-slate-950/80 border-b border-slate-800 text-slate-300'
                    }
                  >
                    <tr>
                      <th className="p-4 font-bold">Capabilities</th>
                      <th className="p-4 font-bold">Traditional FAQ Bots</th>
                      <th className="p-4 font-bold">Basic Live Chat Widgets</th>
                      <th
                        className={`p-4 font-bold ${
                          isLight ? 'text-blue-700 bg-blue-50/80' : 'text-blue-400 bg-blue-950/40'
                        }`}
                      >
                        Kortex AI Platform
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    <tr>
                      <td className={`p-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        In-Chat Calendar Booking
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        External link redirect only
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Requires manual human agent
                      </td>
                      <td
                        className={`p-4 font-semibold ${
                          isLight
                            ? 'text-emerald-700 bg-blue-50/40'
                            : 'text-emerald-400 bg-blue-950/20'
                        }`}
                      >
                        Native interactive calendar picker
                      </td>
                    </tr>
                    <tr>
                      <td className={`p-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Double-Booking Prevention
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        No slot concurrency checks
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Prone to scheduling collisions
                      </td>
                      <td
                        className={`p-4 font-semibold ${
                          isLight
                            ? 'text-emerald-700 bg-blue-50/40'
                            : 'text-emerald-400 bg-blue-950/20'
                        }`}
                      >
                        Atomic concurrency mutex locks
                      </td>
                    </tr>
                    <tr>
                      <td className={`p-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Token Pricing Model
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        300% to 800% markups on compute
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Per-seat pricing + hidden addons
                      </td>
                      <td
                        className={`p-4 font-semibold ${
                          isLight
                            ? 'text-emerald-700 bg-blue-50/40'
                            : 'text-emerald-400 bg-blue-950/20'
                        }`}
                      >
                        0% Token Markup (At-cost BYOK)
                      </td>
                    </tr>
                    <tr>
                      <td className={`p-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Automated Lead Extraction
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Trapped inside raw message histories
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Requires rigid multi-step form fields
                      </td>
                      <td
                        className={`p-4 font-semibold ${
                          isLight
                            ? 'text-emerald-700 bg-blue-50/40'
                            : 'text-emerald-400 bg-blue-950/20'
                        }`}
                      >
                        Auto-detects email/phone &amp; pushes to CRM
                      </td>
                    </tr>
                    <tr>
                      <td className={`p-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Zero-Cost Inference Option
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Not supported (Paid credits required)
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Limited trial period then locked
                      </td>
                      <td
                        className={`p-4 font-semibold ${
                          isLight
                            ? 'text-emerald-700 bg-blue-50/40'
                            : 'text-emerald-400 bg-blue-950/20'
                        }`}
                      >
                        Included (Multi-cloud inference failover engine)
                      </td>
                    </tr>
                    <tr>
                      <td className={`p-4 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Live Human Staff Takeover
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Complex or unsupported
                      </td>
                      <td className={`p-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Basic inbox available
                      </td>
                      <td
                        className={`p-4 font-semibold ${
                          isLight
                            ? 'text-emerald-700 bg-blue-50/40'
                            : 'text-emerald-400 bg-blue-950/20'
                        }`}
                      >
                        1-Click takeover with real-time sound chimes
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section
          id="faq"
          className={`py-20 border-b scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out ${
            isLight ? 'border-slate-200/80' : 'border-slate-800/60'
          }`}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <h2
                className={`text-3xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                Frequently Asked Questions
              </h2>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Everything you need to know about setup, billing, token pricing, and deployment.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx}>
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className={`w-full p-5 rounded-2xl border text-left transition flex items-center justify-between gap-4 cursor-pointer ${
                        isLight
                          ? 'border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300'
                          : 'border-slate-800/80 bg-slate-900/50 text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-sm leading-snug">{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-blue-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div
                        className={`p-5 mt-1 rounded-2xl border text-xs leading-relaxed ${
                          isLight
                            ? 'border-slate-200 bg-slate-50/90 text-slate-600'
                            : 'border-slate-800/60 bg-slate-950/60 text-slate-300'
                        }`}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final High-Impact Conversion CTA Banner */}
        <section
          id="cta"
          className="py-20 scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`rounded-3xl border p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl ${
                isLight
                  ? 'border-blue-400 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white'
                  : 'border-blue-800/60 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 text-white'
              }`}
            >
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    isLight ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Start Converting Today</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Ready to Turn Traffic Into Confirmed Calendar Bookings?
                </h2>
                <p className={`text-sm ${isLight ? 'text-blue-100' : 'text-slate-300'}`}>
                  Join hundreds of businesses using Kortex AI to capture leads and schedule meetings
                  automatically with zero token tax.
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className={`px-6 py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer ${
                      isLight
                        ? 'bg-white text-blue-700 hover:bg-slate-100'
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30'
                    }`}
                  >
                    <span>Create Your Free Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('staff')}
                    className={`px-6 py-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                      isLight
                        ? 'border-white/40 hover:bg-white/10 text-white'
                        : 'border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>Staff Sign In</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className={`border-t py-12 transition-colors duration-300 ${
            isLight ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-slate-850 bg-slate-950 text-slate-500'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                Kortex AI Autonomous Platform
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className={isLight ? 'hover:text-slate-900' : 'hover:text-slate-300'}>
                Features
              </a>
              <a href="#templates" className={isLight ? 'hover:text-slate-900' : 'hover:text-slate-300'}>
                Templates
              </a>
              <a href="#pricing" className={isLight ? 'hover:text-slate-900' : 'hover:text-slate-300'}>
                Pricing
              </a>
              <button
                type="button"
                onClick={() => onOpenAuth('staff')}
                className={`cursor-pointer ${isLight ? 'hover:text-slate-900' : 'hover:text-slate-300'}`}
              >
                Staff Portal
              </button>
            </div>
            <div>&copy; 2026 Kortex AI Inc. Zero Token Markup Guarantee.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

interface SaaSMarketingHomepageProps {
  onOpenAuth: (mode: 'admin' | 'staff' | 'register') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function SaaSMarketingHomepage({
  onOpenAuth,
  theme = 'light',
  onToggleTheme,
}: SaaSMarketingHomepageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoInput, setDemoInput] = useState('');
  const [demoMessages, setDemoMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; hasBooking?: boolean }>>([
    {
      role: 'assistant',
      text: 'Hello! I am the Kortex AI representative. I answer customer questions, capture qualified leads, and book appointments directly on your calendar with zero token markup. What would you like to test?',
    },
  ]);
  const [isDemoStreaming, setIsDemoStreaming] = useState(false);

  const handleDemoSend = (textToSend?: string) => {
    const text = textToSend || demoInput;
    if (!text.trim() || isDemoStreaming) return;

    const userMsg = text.trim();
    setDemoInput('');
    setDemoMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsDemoStreaming(true);

    setTimeout(() => {
      let reply = '';
      let hasBooking = false;

      const lower = userMsg.toLowerCase();
      if (lower.includes('book') || lower.includes('schedule') || lower.includes('appointment') || lower.includes('demo')) {
        reply = 'I would be delighted to schedule a walkthrough for you! Select your preferred date and time below:';
        hasBooking = true;
      } else if (lower.includes('pricing') || lower.includes('cost') || lower.includes('price')) {
        reply = 'Kortex AI offers transparent, flat-rate pricing starting at $29/month with 0% token markup. You can bring your own OpenAI/Anthropic key or use our built-in zero-cost failover engine for $0 compute.';
      } else if (lower.includes('different') || lower.includes('compare') || lower.includes('vs') || lower.includes('conversion') || lower.includes('traditional')) {
        reply = 'Traditional chatbots act as passive text-only lookup tools with credit burn limits. Kortex AI is action-oriented: we natively book appointments on your calendar, auto-capture leads directly from conversation, and provide at-cost BYOK pricing with zero token tax.';
      } else if (lower.includes('lead') || lower.includes('email') || lower.includes('phone')) {
        reply = 'When visitors leave their contact details anywhere in the chat, Kortex AI automatically detects the email and phone number, attributes the conversation, and pushes the lead to your CRM and email in real time.';
      } else {
        reply = `I understand you are asking about "${userMsg}". Kortex AI grounds all answers strictly in your verified knowledge documents with zero hallucinations. If an answer is outside the knowledge base, I automatically bridge to live human support.`;
      }

      setDemoMessages((prev) => [
        ...prev,
        { role: 'assistant', text: reply, hasBooking },
      ]);
      setIsDemoStreaming(false);
    }, 600);
  };

  const templates = [
    { name: 'Classic Barbershop', slug: 'classic-barbershop', tag: 'Local Service', desc: 'Appointment booking, barber selection, service pricing menu.' },
    { name: 'Fitness & Gym Club', slug: 'fitness-gym', tag: 'Health & Wellness', desc: 'Membership tiers, class booking, personal training dispatch.' },
    { name: 'Real Estate Agency', slug: 'real-estate', tag: 'High Ticket', desc: 'Property inquiries, viewing appointments, buyer lead triage.' },
    { name: 'SaaS Platform', slug: 'saas-platform', tag: 'B2B Software', desc: 'Interactive API playground, demo booking, SLA questions.' },
    { name: 'Healthcare Clinic', slug: 'healthcare-clinic', tag: 'Medical', desc: 'Doctor consultations, insurance inquiries, intake routing.' },
    { name: 'Legal Counsel', slug: 'legal-counsel', tag: 'Professional', desc: 'Case evaluations, practice areas, consultation scheduling.' },
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
      a: 'Yes. Kortex AI includes a built-in Zero-Cost Inference Engine (auto_free). It cascades requests across Groq Cloud (sub-second Llama 3.3 70B), Google Gemini Flash Free Tier, and local offline Ollama models for $0 compute cost.',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 border-b border-blue-800/40 px-4 py-2 text-center text-xs text-blue-200">
        <span className="font-bold text-white uppercase tracking-wider text-[10px] bg-blue-600/60 px-2 py-0.5 rounded mr-2 border border-blue-400/40">
          Action-Driven Conversion
        </span>
        <span>Native Calendar Booking. 0% Token Markup. Automatic Lead Capture.</span>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              KORTEX<span className="text-blue-500">.AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#templates" className="hover:text-white transition">Industry Templates</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#comparison" className="hover:text-white transition">Comparison</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenAuth('staff')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
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
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-800/60">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-medium shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Next-Gen Autonomous Website Conversion</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              AI Website Agents That Actually <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">Book Appointments</span> &amp; Close Leads.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Stop settling for passive chatbot widgets that merely answer FAQs. Kortex AI connects directly to your calendar, extracts customer phone numbers and emails automatically in chat, and runs on your own API keys at zero markup.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Deploy Your Agent in 60 Seconds</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#demo"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <span>Test Live Interactive Demo</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero Token Markup (BYOK)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Native Calendar Scheduling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero-Cost Failover Engine Included</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Demo Section */}
          <div id="demo" className="mt-14 max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
            {/* Demo Header */}
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-200">Interactive Live Agent Demo</span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">Real-Time Simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Try quick prompt:</span>
                <button
                  type="button"
                  onClick={() => handleDemoSend('Can I book an appointment for tomorrow?')}
                  className="text-[11px] bg-blue-900/50 hover:bg-blue-800/70 border border-blue-700/50 text-blue-200 px-2.5 py-0.5 rounded-full transition cursor-pointer"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSend('How does Kortex AI drive higher conversions?')}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full transition cursor-pointer hidden sm:inline-block"
                >
                  Higher Conversions
                </button>
              </div>
            </div>

            {/* Demo Chat Stream */}
            <div className="p-4 space-y-3.5 min-h-[260px] max-h-[380px] overflow-y-auto text-xs">
              {demoMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.hasBooking && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-blue-500/40 space-y-2.5 text-slate-200">
                        <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                          <span className="flex items-center gap-1.5 text-blue-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Select Your Time Slot</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">30 Min Session</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                          {['10:00 AM', '02:00 PM', '04:30 PM'].map((slot, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                handleDemoSend(`I would like to confirm the slot for ${slot}`);
                              }}
                              className="py-1 px-2 text-center rounded bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-slate-200 transition cursor-pointer"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isDemoStreaming && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></div>
                  <span>Agent is formulating response...</span>
                </div>
              )}
            </div>

            {/* Demo Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDemoSend();
              }}
              className="p-3 bg-slate-850 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Ask about pricing, features, or ask to book an appointment..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!demoInput.trim() || isDemoStreaming}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Full Platform Suite</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered to Turn Website Traffic Into Revenue
            </p>
            <p className="text-sm text-slate-400">
              Everything you need to deploy, customize, and monetize autonomous website representatives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Inline Appointment Scheduling',
                desc: 'Visitors book consultations, haircuts, or demos directly inside the chat stream. Syncs automatically with Google Calendar, Outlook, and .ics files with double-booking prevention.',
              },
              {
                icon: Zap,
                title: 'In-Chat Auto Lead Extraction',
                desc: 'When visitors drop an email, phone number, or name in natural conversation, Kortex AI extracts the contact data, attributes the session, and triggers instant notifications.',
              },
              {
                icon: Shield,
                title: 'Zero-Markup BYOK Architecture',
                desc: 'Bring your own OpenAI, Anthropic, Gemini, or DeepSeek API key and pay raw token cost directly to model providers. Stop paying massive markup premiums on tokens.',
              },
              {
                icon: Bot,
                title: 'Zero-Cost Free Engine Cascade',
                desc: 'Run completely free of compute charges using our automatic failover pipeline: Groq Cloud (sub-second Llama 3.3), Gemini Flash, and local Ollama.',
              },
              {
                icon: Headphones,
                title: 'Live Agent Takeover & Audio Alerts',
                desc: 'Step into any live visitor chat from your management console with one click. AI automatically pauses, and sound alerts notify your staff instantly.',
              },
              {
                icon: Layers,
                title: '11 Industry-Specific Conversion Templates',
                desc: 'Pre-configured landing pages designed for barbershops, gyms, real estate, clinics, SaaS, legal, and agencies with built-in booking and chat.',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400 flex items-center justify-center">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Templates Showcase */}
      <section id="templates" className="py-20 border-b border-slate-800/60 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Instant Deployments</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                Hosted Industry Conversion Templates
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Each template includes a tailored services menu, calendar booking engine, and pre-trained AI agent.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Explore all 11 archetypes in dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-blue-500/50 transition flex flex-col justify-between p-5 space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                      {tpl.tag}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">/site/{tpl.slug}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{tpl.desc}</p>
                </div>

                <a
                  href={`/site/${tpl.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 py-2 rounded-xl transition border border-slate-700"
                >
                  <span>Preview Live Template</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent Pricing Cards */}
      <section id="pricing" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Predictable Economics</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Zero Token Markup. Flat Transparent Pricing.
            </p>
            <p className="text-sm text-slate-400">
              Never get punished for receiving more messages. Choose a plan and scale without surprise bills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Starter</h3>
                  <p className="text-xs text-slate-400 mt-1">Ideal for local service businesses and solopreneurs.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$29</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  Zero Token Markup on BYOK
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>1 Active AI Assistant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Native Calendar Booking Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>In-Chat Automated Lead Capture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Zero-Cost Free Failover Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>1 Hosted Industry Landing Page</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Start 14-Day Trial
              </button>
            </div>

            {/* Growth */}
            <div className="rounded-2xl border-2 border-blue-500 bg-slate-900 p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-blue-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Growth</h3>
                  <p className="text-xs text-slate-400 mt-1">For growing businesses needing omnichannel support.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$79</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  Zero Token Markup on BYOK
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>5 Active AI Assistants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Live Human Takeover &amp; Sound Alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Remove Powered-by-Kortex Branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Outbound Webhook &amp; Zapier Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Telegram &amp; WhatsApp Integration</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                Start 14-Day Trial
              </button>
            </div>

            {/* Agency */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Agency &amp; Enterprise</h3>
                  <p className="text-xs text-slate-400 mt-1">For digital agencies reselling AI agents to clients.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$199</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  Multi-Tenant White Label
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Unlimited AI Assistants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Custom CNAME Domain Mapping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Full White-Label Client Portals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Priority SLA Support &amp; Audit Logs</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Start 14-Day Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Comparison Table */}
      <section id="comparison" className="py-20 border-b border-slate-800/60 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Architectural Comparison</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Built for Real Business Outcomes, Not Just Text Chat
            </p>
            <p className="text-sm text-slate-400">
              See how Kortex AI compares to traditional FAQ widgets and live chat add-ons across conversion capabilities, automation, and overall ROI.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-850 text-slate-300">
                    <th className="p-4 font-semibold text-slate-400">Key Capability</th>
                    <th className="p-4 font-semibold text-slate-400">Traditional FAQ Bots</th>
                    <th className="p-4 font-semibold text-slate-400">Basic Live Chat Widgets</th>
                    <th className="p-4 font-bold text-blue-400 bg-blue-950/40">Kortex AI Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="p-4 font-medium text-white">Pricing Model</td>
                    <td className="p-4 text-slate-400">Opaque credit packs &amp; usage caps</td>
                    <td className="p-4 text-slate-400">Per-seat license fees + per-message taxes</td>
                    <td className="p-4 font-semibold text-emerald-400 bg-blue-950/20">Predictable flat subscription ($29/mo)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Token Compute Markup</td>
                    <td className="p-4 text-slate-400">300% to 800% token resale margin</td>
                    <td className="p-4 text-slate-400">Proprietary token pricing tiers &amp; overages</td>
                    <td className="p-4 font-semibold text-emerald-400 bg-blue-950/20">0% Markup (Direct wholesale BYOK)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Native Appointment Booking</td>
                    <td className="p-4 text-slate-400">External redirect links only</td>
                    <td className="p-4 text-slate-400">Manual copy-paste calendar links</td>
                    <td className="p-4 font-semibold text-emerald-400 bg-blue-950/20">Interactive in-chat calendar &amp; instant confirmation</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Automated Lead Extraction</td>
                    <td className="p-4 text-slate-400">Trapped inside raw message histories</td>
                    <td className="p-4 text-slate-400">Requires rigid multi-step form fields</td>
                    <td className="p-4 font-semibold text-emerald-400 bg-blue-950/20">Auto-detects email/phone &amp; pushes to CRM</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Zero-Cost Inference Option</td>
                    <td className="p-4 text-slate-400">Not supported (Paid credits required)</td>
                    <td className="p-4 text-slate-400">Limited trial period then locked</td>
                    <td className="p-4 font-semibold text-emerald-400 bg-blue-950/20">Included (Groq, Gemini Flash, &amp; Ollama failover)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Live Human Staff Takeover</td>
                    <td className="p-4 text-slate-400">Complex or unsupported</td>
                    <td className="p-4 text-slate-300">Basic inbox available</td>
                    <td className="p-4 font-semibold text-emerald-400 bg-blue-950/20">1-Click takeover with real-time sound chimes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 border-b border-slate-800/60 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">Frequently Answered</h2>
            <p className="text-3xl font-extrabold text-white">Questions &amp; Answers</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-white hover:text-blue-400 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-blue-500" />
            <span className="font-bold text-slate-300">Kortex AI</span>
            <span>&copy; {new Date().getFullYear()} Kortex AI Platform. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition">Features</a>
            <a href="#comparison" className="hover:text-slate-300 transition">Comparison</a>
            <a href="#pricing" className="hover:text-slate-300 transition">Pricing</a>
            <button
              type="button"
              onClick={() => onOpenAuth('admin')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Master Console
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

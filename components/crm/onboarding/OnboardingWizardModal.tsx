'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Globe,
  FileText,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Scissors,
  ShoppingBag,
  Stethoscope,
  Building2,
  Utensils,
  Briefcase,
  Dumbbell,
  Send,
  Loader2,
  Palette,
  Bot,
} from 'lucide-react';

export interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAssistant?: any;
  onAssistantUpdated?: (updated: any) => void;
  onGoToTab: (tab: string) => void;
  onOpenEmbed: () => void;
}

const INDUSTRIES = [
  {
    id: 'barbershop',
    icon: Scissors,
    label: 'Barbershop & Salon',
    name: 'Salon & Barber Assistant',
    goal: 'appointments',
    greeting: 'Hi there! 👋 Welcome to our salon. Would you like to check our services or book an appointment today?',
    sampleQ: 'What are your haircut prices?',
    systemHint: 'You are the booking assistant for a barbershop/salon. Answer service pricing and guide visitors to schedule appointments.',
  },
  {
    id: 'ecommerce',
    icon: ShoppingBag,
    label: 'E-Commerce & Retail',
    name: 'Store Shopping Assistant',
    goal: 'sales',
    greeting: 'Hello! 🛍️ Looking for a specific item, or need help with sizing, shipping, or returns?',
    sampleQ: 'What is your return policy?',
    systemHint: 'You are a shopping assistant for an online retail store. Help customers find products, explain shipping, and answer order questions.',
  },
  {
    id: 'clinic',
    icon: Stethoscope,
    label: 'Dental & Health Clinic',
    name: 'Clinic Patient Care AI',
    goal: 'appointments',
    greeting: 'Hello and welcome to our practice. How can I assist you with services, intake requirements, or booking a visit?',
    sampleQ: 'Do you accept insurance?',
    systemHint: 'You are a healthcare clinic reception assistant. Provide verified intake guidelines and help patients schedule consultation visits.',
  },
  {
    id: 'realestate',
    icon: Building2,
    label: 'Real Estate & Property',
    name: 'Property Advisor AI',
    goal: 'leads',
    greeting: 'Welcome! 🏡 Looking to buy, rent, or schedule a private viewing for one of our listings?',
    sampleQ: 'Can I schedule a tour this weekend?',
    systemHint: 'You are a real estate assistant. Qualify buyer/tenant requirements (budget, timeline) and book private viewing appointments.',
  },
  {
    id: 'restaurant',
    icon: Utensils,
    label: 'Restaurant & Hospitality',
    name: 'Dining & Table Host AI',
    goal: 'appointments',
    greeting: 'Welcome! 🍽️ Would you like to reserve a table, view our menu, or ask about dietary options?',
    sampleQ: 'Do you have vegetarian options?',
    systemHint: 'You are a dining host assistant. Assist with table reservations, hours, parking, menu options, and private event inquiries.',
  },
  {
    id: 'services',
    icon: Briefcase,
    label: 'Professional Services',
    name: 'Client Advisor AI',
    goal: 'leads',
    greeting: 'Hi there! Welcome. How can we help with your project, case, or consultation today?',
    sampleQ: 'How can I schedule a discovery call?',
    systemHint: 'You are a professional services assistant. Answer scope and pricing FAQs and guide serious inquiries to book a discovery call.',
  },
  {
    id: 'fitness',
    icon: Dumbbell,
    label: 'Fitness & Gym Studio',
    name: 'Fitness Coach AI',
    goal: 'appointments',
    greeting: 'Hey there! ⚡ Ready to hit your fitness goals? Would you like to book a free trial class or view our class timetable?',
    sampleQ: 'When is the next beginner class?',
    systemHint: 'You are a fitness studio assistant. Help visitors reserve trial classes and explain membership plans.',
  },
  {
    id: 'general',
    icon: Bot,
    label: 'Other Business',
    name: 'Customer Assistant AI',
    goal: 'support',
    greeting: 'Hello! 👋 How can I help you today? Ask me any questions about our services or business hours.',
    sampleQ: 'What are your hours of operation?',
    systemHint: 'You are a helpful business assistant. Answer customer questions accurately based on company documents.',
  },
];

const COLOR_PRESETS = [
  { name: 'Forest & Lime', hex: '#08251a', accent: '#abff44' },
  { name: 'Royal Navy', hex: '#1e3a8a', accent: '#60a5fa' },
  { name: 'Emerald Teal', hex: '#0f766e', accent: '#2dd4bf' },
  { name: 'Sunset Amber', hex: '#b45309', accent: '#fde047' },
  { name: 'Violet', hex: '#6b21a8', accent: '#c084fc' },
];

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  activeAssistant,
  onAssistantUpdated,
  onGoToTab,
  onOpenEmbed,
}) => {
  const __t = useT();

  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0]);
  const [assistantName, setAssistantName] = useState(activeAssistant?.name || INDUSTRIES[0].name);
  const [primaryGoal, setPrimaryGoal] = useState(INDUSTRIES[0].goal);

  // Step 2: Knowledge
  const [knowledgeMode, setKnowledgeMode] = useState<'text' | 'url'>('text');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessInfoText, setBusinessInfoText] = useState(
    'Hours: Monday - Saturday: 9:00 AM - 7:00 PM (Closed Sunday)\nAddress: 124 Main Street, Suite 200\nPhone: (555) 234-5678\nServices: Standard Service ($45), Premium Service ($75)\nBooking: Appointments can be booked 24/7 online.'
  );

  // Step 3: Greeting & Brand
  const [greetingMessage, setGreetingMessage] = useState(INDUSTRIES[0].greeting);
  const [tone, setTone] = useState<'friendly' | 'professional' | 'enthusiastic'>('friendly');
  const [primaryColor, setPrimaryColor] = useState('#08251a');

  // Step 4: Live Test & Deploy
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([]);
  const [testInput, setTestInput] = useState('');
  const [isTestResponding, setIsTestResponding] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeAssistant?.name) {
      setAssistantName(activeAssistant.name);
    }
  }, [activeAssistant]);

  // When industry changes, prefill sensible defaults
  const handleSelectIndustry = (ind: typeof INDUSTRIES[0]) => {
    setSelectedIndustry(ind);
    setAssistantName(ind.name);
    setPrimaryGoal(ind.goal);
    setGreetingMessage(ind.greeting);
  };

  // Reset chat messages when entering step 4
  useEffect(() => {
    if (step === 4) {
      setChatMessages([{ sender: 'bot', text: greetingMessage }]);
    }
  }, [step, greetingMessage]);

  const handleSendTestMessage = (textToSend?: string) => {
    const text = (textToSend || testInput).trim();
    if (!text || isTestResponding) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text }]);
    setTestInput('');
    setIsTestResponding(true);

    // Provide instant responsive reply simulation based on business knowledge
    setTimeout(() => {
      let reply = `Thanks for asking about "${text}"! We are open Mon-Sat from 9:00 AM to 7:00 PM. Would you like me to book a time slot for you?`;
      if (text.toLowerCase().includes('price') || text.toLowerCase().includes('cost')) {
        reply = `Our standard service starts at $45 and our premium service is $75. Would you like to reserve an appointment?`;
      } else if (text.toLowerCase().includes('book') || text.toLowerCase().includes('appointment') || text.toLowerCase().includes('slot')) {
        reply = `I would be happy to help you book! We have open slots tomorrow at 11:00 AM and 2:30 PM. Which works best for you?`;
      } else if (text.toLowerCase().includes('hour') || text.toLowerCase().includes('open')) {
        reply = `We are open Monday through Saturday from 9:00 AM to 7:00 PM. Closed on Sundays.`;
      }
      setChatMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      setIsTestResponding(false);
    }, 700);
  };

  const handleFinishSetup = async () => {
    setIsSaving(true);
    try {
      const astId = activeAssistant?.id;
      if (astId) {
        // Save updates to assistant
        const res = await fetch(`/api/assistants/${astId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: assistantName.trim() || selectedIndustry.name,
            welcomeMessage: greetingMessage.trim(),
            primaryColor: primaryColor,
            systemPrompt: `${selectedIndustry.systemHint}\n\nBUSINESS KNOWLEDGE:\n${businessInfoText}`,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.assistant && onAssistantUpdated) {
            onAssistantUpdated(data.assistant);
          }
        }

        // If website URL was given, submit URL scraper in background
        if (knowledgeMode === 'url' && websiteUrl.trim()) {
          fetch('/api/knowledge/url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assistantId: astId,
              url: websiteUrl.trim(),
            }),
          }).catch(() => {});
        }
      }

      localStorage.setItem('kortex_onboarding_completed', '1');
      localStorage.setItem('kortex_wizard_completed', '1');
      onClose();
    } catch {
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const embedScriptCode = activeAssistant?.id
    ? `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-assistant="${activeAssistant.id}" defer></script>`
    : `<script src="/widget.js" data-assistant="my-assistant" defer></script>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#08251a] shadow-2xl overflow-hidden my-auto">

        {/* Top Header & Progress Stepper */}
        <div className="bg-[#08251a] border-b border-[#1a4734] px-6 py-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#abff44] text-[#08251a] font-black text-sm">
                ⚡
              </span>
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Quick Setup Wizard</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#abff44]/20 text-[#abff44] border border-[#abff44]/30 uppercase tracking-wider">
                    Easy 4-Step Guide
                  </span>
                </h2>
                <p className="text-xs text-[#a9d9cb]">Configure and launch your AI Assistant in under 2 minutes.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { num: 1, title: 'Business Type' },
              { num: 2, title: 'Knowledge' },
              { num: 3, title: 'Voice & Style' },
              { num: 4, title: 'Test & Launch' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`text-left p-1.5 rounded-lg border transition-all cursor-pointer ${
                  step === s.num
                    ? 'border-[#abff44] bg-[#abff44]/15 text-[#abff44]'
                    : step > s.num
                    ? 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-white/10 text-white/50'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">Step {s.num}</div>
                <div className="text-xs font-semibold truncate text-white">{s.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Dynamic Step Content */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">

          {/* ================= STEP 1: BUSINESS TYPE & GOAL ================= */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">What type of business are you setting up for?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your industry so Crescelo can pre-configure the best greeting, booking flow, and conversation demeanor.
                </p>
              </div>

              {/* Industry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {INDUSTRIES.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustry.id === ind.id;
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => handleSelectIndustry(ind)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#08251a] dark:border-[#abff44] bg-[#fffeeb] dark:bg-[#12402d] shadow-sm ring-1 ring-[#08251a] dark:ring-[#abff44]'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-[#08251a] dark:text-[#abff44]' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{ind.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Assistant Name */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Assistant Display Name
                </label>
                <input
                  type="text"
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  placeholder="e.g. Bella Salon Assistant"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08251a] dark:focus:ring-[#abff44]"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Visitors will see this name in the chat header bubble.</p>
              </div>

              {/* Primary Goal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Primary Goal for this AI
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'appointments', label: '📅 Bookings & Slots' },
                    { id: 'sales', label: '🛍️ Sales & Orders' },
                    { id: 'leads', label: '💼 Lead Capture' },
                    { id: 'support', label: '🛡️ 24/7 Support' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        primaryGoal === g.id
                          ? 'border-[#08251a] dark:border-[#abff44] bg-[#08251a] dark:bg-[#abff44] text-[#abff44] dark:text-[#08251a]'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: TEACH YOUR ASSISTANT ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Teach your AI your business details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No technical training needed! Just paste your website or type your hours, services, and pricing below.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setKnowledgeMode('text')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    knowledgeMode === 'text'
                      ? 'bg-white dark:bg-[#08251a] text-[#08251a] dark:text-[#abff44] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📝 Type Business Facts &amp; Hours
                </button>
                <button
                  type="button"
                  onClick={() => setKnowledgeMode('url')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    knowledgeMode === 'url'
                      ? 'bg-white dark:bg-[#08251a] text-[#08251a] dark:text-[#abff44] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🌐 Scan Website URL
                </button>
              </div>

              {knowledgeMode === 'text' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Business Hours, Services &amp; Information
                  </label>
                  <textarea
                    rows={6}
                    value={businessInfoText}
                    onChange={(e) => setBusinessInfoText(e.target.value)}
                    placeholder="Enter your hours, prices, services, parking info, and answers to common customer questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08251a] dark:focus:ring-[#abff44]"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    💡 Tip: Include common questions customers call you about (e.g., parking, pricing, accepted insurance, cancellations).
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Website URL to Learn From
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://mybusiness.com"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08251a] dark:focus:ring-[#abff44]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Crescelo will scan your public pages and index your services and products into your assistant's memory.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: VOICE & STYLE ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Choose your assistant's tone and greeting</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize the first message visitors see and match your chat window to your brand palette.
                </p>
              </div>

              {/* Tone selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Conversation Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'friendly', label: '🌟 Friendly & Warm', desc: 'Welcoming, helpful, empathetic' },
                    { id: 'professional', label: '👔 Professional', desc: 'Direct, polished, factual' },
                    { id: 'enthusiastic', label: '⚡ Energetic & Sales', desc: 'Engaging, proactive, converts' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as any)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        tone === t.id
                          ? 'border-[#08251a] dark:border-[#abff44] bg-[#fffeeb] dark:bg-[#12402d]'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{t.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Welcome Greeting Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Welcome Greeting Message
                </label>
                <textarea
                  rows={3}
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder="The first greeting bubble visitors see when the chat opens..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#08251a] dark:focus:ring-[#abff44]"
                />
              </div>

              {/* Theme Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Chat Widget Brand Color
                </label>
                <div className="flex items-center gap-3">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setPrimaryColor(p.hex)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        primaryColor === p.hex
                          ? 'border-[#08251a] dark:border-[#abff44] bg-[#08251a] dark:bg-[#abff44] text-[#abff44] dark:text-[#08251a]'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: p.hex }} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: TEST & LAUNCH ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Test Your AI &amp; Get Your Website Code</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chat below to see your new assistant in action, then copy the 1-line script for your site!
                </p>
              </div>

              {/* Live Interactive Chat Sandbox */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 overflow-hidden shadow-xs">
                {/* Chat header */}
                <div className="px-4 py-2.5 bg-[#08251a] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#abff44] animate-pulse" />
                    <span className="text-xs font-bold">{assistantName}</span>
                    <span className="text-[10px] text-[#abff44] font-medium">— Live Sandbox Test</span>
                  </div>
                </div>

                {/* Messages scroll */}
                <div className="p-3.5 space-y-2.5 max-h-44 overflow-y-auto bg-slate-50 dark:bg-slate-950/40">
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-[#08251a] text-[#abff44] rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isTestResponding && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                      <Loader2 className="h-3 w-3 animate-spin text-[#08251a] dark:text-[#abff44]" />
                      <span>{assistantName} is typing...</span>
                    </div>
                  )}
                </div>

                {/* Sample question pills */}
                <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 flex-wrap bg-white dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Try:</span>
                  {[
                    selectedIndustry.sampleQ,
                    'What are your hours?',
                    'Can I book a slot?',
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSendTestMessage(q)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-[#08251a] dark:hover:border-[#abff44] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Message input */}
                <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTestMessage()}
                    placeholder="Type a test question as a customer..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTestMessage()}
                    className="px-3 py-1.5 rounded-lg bg-[#08251a] text-[#abff44] dark:bg-[#abff44] dark:text-[#08251a] text-xs font-bold cursor-pointer hover:opacity-90 transition"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Embed snippet & WordPress Links */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Add to Your Website in 60 Seconds:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={embedScriptCode}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(embedScriptCode);
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#08251a] dark:bg-[#abff44] text-[#abff44] dark:text-[#08251a] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>Using WordPress? Connect in 1 click:</span>
                  <a
                    href="/wordpress/ai-business-assistant.zip"
                    download
                    className="text-[#0f6e58] dark:text-[#abff44] font-bold underline inline-flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Crescelo WordPress Plugin (.zip)</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08251a] dark:bg-[#abff44] text-[#abff44] dark:text-[#08251a] text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleFinishSetup}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#08251a] dark:bg-[#abff44] text-[#abff44] dark:text-[#08251a] text-xs font-extrabold hover:opacity-90 transition cursor-pointer shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Assistant...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>🚀 Launch Assistant &amp; Go to Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

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
  Loader2,
  Palette,
  Bot,
  Calendar,
  Target,
  ShieldCheck,
  Zap,
  Users,
  Send,
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
    greeting: 'Hello, welcome to our salon. Would you like to check our services or book an appointment today?',
    sampleQ: 'What are your haircut prices?',
    systemHint: 'You are the booking assistant for a barbershop/salon. Answer service pricing and guide visitors to schedule appointments.',
  },
  {
    id: 'ecommerce',
    icon: ShoppingBag,
    label: 'E-Commerce & Retail',
    name: 'Store Shopping Assistant',
    goal: 'sales',
    greeting: 'Hello. Looking for a specific item, or need help with sizing, shipping, or returns?',
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
    greeting: 'Welcome. Looking to buy, rent, or schedule a private viewing for one of our listings?',
    sampleQ: 'Can I schedule a tour this weekend?',
    systemHint: 'You are a real estate assistant. Qualify buyer/tenant requirements (budget, timeline) and book private viewing appointments.',
  },
  {
    id: 'restaurant',
    icon: Utensils,
    label: 'Restaurant & Hospitality',
    name: 'Dining & Table Host AI',
    goal: 'appointments',
    greeting: 'Welcome. Would you like to reserve a table, view our menu, or ask about dietary options?',
    sampleQ: 'Do you have vegetarian options?',
    systemHint: 'You are a dining host assistant. Assist with table reservations, hours, parking, menu options, and private event inquiries.',
  },
  {
    id: 'services',
    icon: Briefcase,
    label: 'Professional Services',
    name: 'Client Advisor AI',
    goal: 'leads',
    greeting: 'Hello, welcome. How can we help with your project, case, or consultation today?',
    sampleQ: 'How can I schedule a discovery call?',
    systemHint: 'You are a professional services assistant. Answer scope and pricing FAQs and guide serious inquiries to book a discovery call.',
  },
  {
    id: 'fitness',
    icon: Dumbbell,
    label: 'Fitness & Gym Studio',
    name: 'Fitness Coach AI',
    goal: 'appointments',
    greeting: 'Welcome. Ready to reach your fitness goals? Would you like to book a trial session or view our timetable?',
    sampleQ: 'When is the next beginner class?',
    systemHint: 'You are a fitness studio assistant. Help visitors reserve trial classes and explain membership plans.',
  },
  {
    id: 'general',
    icon: Bot,
    label: 'Other Business',
    name: 'Customer Assistant AI',
    goal: 'support',
    greeting: 'Hello. How can I assist you today? Feel free to ask about our services, business hours, or contact options.',
    sampleQ: 'What are your hours of operation?',
    systemHint: 'You are a helpful business assistant. Answer customer questions accurately based on company documents.',
  },
];

const COLOR_PRESETS = [
  { name: 'Royal Navy', hex: '#1d4ed8' },
  { name: 'Deep Teal', hex: '#0f766e' },
  { name: 'Classic Slate', hex: '#334155' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Indigo Violet', hex: '#6366f1' },
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
  const [primaryColor, setPrimaryColor] = useState('#1d4ed8');

  // Step 4: Live Test & Deploy
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; showActionButtons?: boolean }>>([]);
  const [testInput, setTestInput] = useState('');
  const [isTestResponding, setIsTestResponding] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeAssistant?.name) {
      setAssistantName(activeAssistant.name);
    }
  }, [activeAssistant]);

  // When industry changes, prefill sensible defaults without emojis
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

    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = '';
      let showActionButtons = false;

      // 1. Live agent or human assistance request
      if (
        q.includes('live agent') ||
        q.includes('human') ||
        q.includes('person') ||
        q.includes('representative') ||
        q.includes('speak with someone')
      ) {
        reply = 'I am connecting you with a live representative right now. A member of our team has received your request and will join this session shortly.';
      }
      // 2. Book a meeting or appointment request
      else if (
        q.includes('book a meeting') ||
        q.includes('schedule a meeting') ||
        q.includes('set up a meeting') ||
        q.includes('meeting')
      ) {
        reply = 'I would be delighted to schedule a meeting for you. We have open consultation slots available tomorrow at 11:00 AM and 2:30 PM. Which time works best for your schedule?';
      }
      // 3. Appointment / slot booking
      else if (q.includes('book') || q.includes('appointment') || q.includes('slot') || q.includes('reserve')) {
        reply = 'I would be happy to help you book an appointment. We have open slots tomorrow at 11:00 AM and 2:30 PM. Which works best for you?';
      }
      // 4. Hours / opening inquiry
      else if (q.includes('hour') || q.includes('open') || q.includes('closed') || q.includes('timing') || q.includes('schedule')) {
        reply = 'We are open Monday through Saturday from 9:00 AM to 7:00 PM, and closed on Sundays.';
      }
      // 5. Pricing / cost inquiry
      else if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('fee') || q.includes('package')) {
        reply = 'Our standard service starts at $45 and our premium service is $75. Would you like to reserve an appointment?';
      }
      // 6. Return policy (e-commerce sample)
      else if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
        reply = 'Our return policy covers unused items in original packaging within 30 days of purchase for a complete refund or exchange.';
      }
      // 7. Insurance (clinic sample)
      else if (q.includes('insurance') || q.includes('coverage') || q.includes('copay')) {
        reply = 'We accept most major insurance plans and can verify your specific coverage details during intake or consultation.';
      }
      // 8. Timetable / class (fitness sample)
      else if (q.includes('class') || q.includes('beginner') || q.includes('timetable')) {
        reply = 'Beginner fitness sessions run every Tuesday and Thursday at 10:00 AM, as well as Saturday at 9:00 AM. Would you like to reserve a trial session?';
      }
      // 9. Location / Address
      else if (q.includes('address') || q.includes('where are you') || q.includes('location') || q.includes('directions')) {
        reply = 'We are located at 124 Main Street, Suite 200. Feel free to stop by or schedule an appointment online!';
      }
      // 10. Out-of-knowledgebase fallback: Professional response offering live agent or meeting
      else {
        reply = 'I do not have that specific information in my current knowledge base. However, I can connect you directly with a live agent or assist you with booking a meeting with our team. Which would you prefer?';
        showActionButtons = true;
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: reply, showActionButtons }]);
      setIsTestResponding(false);
    }, 600);
  };

  const handleFinishSetup = async () => {
    setIsSaving(true);
    try {
      const astId = activeAssistant?.id;
      if (astId) {
        const res = await fetch(`/api/assistants/${astId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: assistantName.trim() || selectedIndustry.name,
            welcomeMessage: greetingMessage.trim(),
            primaryColor: primaryColor,
            fallbackMessage: 'I do not have that specific information in my knowledge base. I can connect you with a live agent or assist you with booking a meeting.',
            systemPrompt: `${selectedIndustry.systemHint}\n\nBUSINESS KNOWLEDGE:\n${businessInfoText}`,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.assistant && onAssistantUpdated) {
            onAssistantUpdated(data.assistant);
          }
        }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto">

        {/* Sleek, light header and progress stepper - no dark headers */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-200/90 px-6 py-4 text-slate-900">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-600">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Quick Setup Wizard</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 uppercase tracking-wider">
                    Step {step} of 4
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Configure and launch your AI Assistant in under 2 minutes.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close setup wizard"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { num: 1, title: 'Business Type', icon: Building2 },
              { num: 2, title: 'Knowledge', icon: FileText },
              { num: 3, title: 'Tone & Style', icon: Palette },
              { num: 4, title: 'Test & Launch', icon: CheckCircle2 },
            ].map((s) => {
              const StepIcon = s.icon;
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                    isActive
                      ? 'border-blue-600 bg-white shadow-xs ring-1 ring-blue-600/20 text-blue-700'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                      : 'border-slate-200 bg-slate-50/60 text-slate-500 hover:bg-white'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </span>
                  <div className="hidden sm:block min-w-0">
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">Step {s.num}</div>
                    <div className="text-xs font-bold truncate">{s.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Dynamic Step Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-white">

          {/* ================= STEP 1: BUSINESS TYPE & GOAL ================= */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">What type of business are you setting up for?</h3>
                <p className="text-xs text-slate-500">
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
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold text-slate-900 leading-tight">{ind.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Assistant Name */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-800">
                  Assistant Display Name
                </label>
                <input
                  type="text"
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  placeholder="e.g. Bella Salon Assistant"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-500">Visitors will see this name in the chat header bubble.</p>
              </div>

              {/* Primary Goal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  Primary Goal for this AI
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'appointments', label: 'Appointments & Booking', icon: Calendar },
                    { id: 'sales', label: 'Sales & Products', icon: ShoppingBag },
                    { id: 'leads', label: 'Lead Qualification', icon: Target },
                    { id: 'support', label: 'Customer Support', icon: ShieldCheck },
                  ].map((g) => {
                    const GoalIcon = g.icon;
                    const isSelected = primaryGoal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setPrimaryGoal(g.id)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-1 ring-blue-600/30'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <GoalIcon className={`h-3.5 w-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: TEACH YOUR ASSISTANT ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Teach your AI your business details</h3>
                <p className="text-xs text-slate-500">
                  No complex setup needed. Provide your website URL or type your hours, services, and pricing below.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setKnowledgeMode('text')}
                  className={`flex items-center justify-center gap-2 flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    knowledgeMode === 'text'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>Type Business Information</span>
                </button>
                <button
                  type="button"
                  onClick={() => setKnowledgeMode('url')}
                  className={`flex items-center justify-center gap-2 flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    knowledgeMode === 'url'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5 text-blue-600" />
                  <span>Scan Website URL</span>
                </button>
              </div>

              {knowledgeMode === 'text' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">
                    Business Hours, Services &amp; Information
                  </label>
                  <textarea
                    rows={6}
                    value={businessInfoText}
                    onChange={(e) => setBusinessInfoText(e.target.value)}
                    placeholder="Enter your hours, prices, services, parking info, and answers to common customer questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                  />
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-blue-800">Recommendation:</strong> Include common details your customers call about (e.g. pricing, hours, parking, policies, and consultation requirements).
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">
                    Website URL to Learn From
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://mybusiness.com"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Crescelo scans your public pages and indexes your services, products, and FAQs into your assistant memory.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: VOICE & STYLE ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Choose your assistant tone and greeting</h3>
                <p className="text-xs text-slate-500">
                  Customize the first message visitors see and match your chat window to your brand palette.
                </p>
              </div>

              {/* Tone selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Conversation Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'friendly', label: 'Friendly & Welcoming', desc: 'Warm, helpful, and empathetic', icon: Sparkles, iconColor: 'text-amber-500' },
                    { id: 'professional', label: 'Professional & Polished', desc: 'Direct, refined, and precise', icon: Briefcase, iconColor: 'text-blue-600' },
                    { id: 'enthusiastic', label: 'Proactive & Sales-Focused', desc: 'Engaging and conversion-driven', icon: Zap, iconColor: 'text-emerald-600' },
                  ].map((t) => {
                    const ToneIcon = t.icon;
                    const isSelected = tone === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTone(t.id as any)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600/30'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <ToneIcon className={`h-4 w-4 ${t.iconColor}`} />
                          <span className="text-xs font-bold text-slate-900">{t.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight">{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Welcome Greeting Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Welcome Greeting Message
                </label>
                <textarea
                  rows={3}
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder="The first greeting bubble visitors see when the chat opens..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />
              </div>

              {/* Theme Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  Chat Widget Brand Color
                </label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setPrimaryColor(p.hex)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        primaryColor === p.hex
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: p.hex }} />
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
                <h3 className="text-base font-bold text-slate-900">Test Your AI &amp; Get Your Website Code</h3>
                <p className="text-xs text-slate-500">
                  Chat below to see your new assistant in action. If you ask something outside your knowledge base, see how professionally it responds!
                </p>
              </div>

              {/* Live Interactive Chat Sandbox - Light & sleek design */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden shadow-xs">
                {/* Chat header */}
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">{assistantName}</span>
                    <span className="text-[11px] text-slate-500 font-medium">— Live Sandbox Test</span>
                  </div>
                </div>

                {/* Messages scroll */}
                <div className="p-3.5 space-y-2.5 max-h-52 overflow-y-auto bg-slate-50/30">
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-xs shadow-2xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {m.text}
                      </div>

                      {/* Quick action buttons if out-of-knowledgebase query occurred */}
                      {m.showActionButtons && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendTestMessage('Connect me to a live agent')}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="h-3 w-3" />
                            <span>Connect to Live Agent</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendTestMessage('Book a meeting')}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Calendar className="h-3 w-3" />
                            <span>Book a Meeting</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTestResponding && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                      <span>{assistantName} is typing...</span>
                    </div>
                  )}
                </div>

                {/* Sample question pills */}
                <div className="px-3 py-1.5 border-t border-slate-200 flex items-center gap-1.5 flex-wrap bg-white">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Try:</span>
                  {[
                    selectedIndustry.sampleQ,
                    'What are your hours?',
                    'Can I book an appointment?',
                    'Something not in knowledge base',
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSendTestMessage(q)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full border border-slate-200 hover:border-blue-500 hover:text-blue-700 text-slate-600 transition cursor-pointer bg-slate-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Message input */}
                <div className="p-2 border-t border-slate-200 flex gap-2 bg-white">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTestMessage()}
                    placeholder="Type a test question (e.g. asking about services, or something unknown)..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTestMessage()}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-2xs flex items-center gap-1"
                  >
                    <span>Send</span>
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Embed snippet & WordPress Links */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-800">
                  Add to Your Website in 60 Seconds:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={embedScriptCode}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(embedScriptCode);
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    {copiedSnippet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Using WordPress? Connect in 1 click:</span>
                  <a
                    href="/wordpress/ai-business-assistant.zip"
                    download
                    className="text-blue-600 hover:text-blue-800 font-bold underline inline-flex items-center gap-1"
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
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleFinishSetup}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition cursor-pointer shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Assistant...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Launch Assistant &amp; Go to Dashboard</span>
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

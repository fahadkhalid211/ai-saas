'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  Scissors,
  Dumbbell,
  Home,
  ShoppingBag,
  Briefcase,
  Scale,
  Activity,
  Plus,
  Trash2,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Bot,
  RefreshCw,
  Cpu,
  Layers,
  Palette,
  TrendingUp,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  LandingPageConfig,
  LandingPageServiceItem,
  MODERN_DESIGN_ARCHETYPES,
  DesignArchetype,
  DEFAULT_BARBER_LANDING_CONFIG,
  getLandingConfigForSlugOrTemplate,
  getArchetypesForIndustry,
} from '@/lib/landing/types';
import { ArchetypeDesignPreview } from './ArchetypeDesignPreview';
import { DesignPreviewModal } from './DesignPreviewModal';

interface AiLandingWizardProps {
  onBackToList: () => void;
  onOpenEditor: (config: LandingPageConfig) => void;
  onSaveLandingPage: (
    newConfig: LandingPageConfig,
    assistantOption: 'auto_create' | 'none' | string
  ) => Promise<LandingPageConfig>;
  assistants?: any[];
  allLandingPages?: LandingPageConfig[];
  activeAssistant?: any;
}

const INDUSTRIES_LIST = [
  {
    id: 'barbershop',
    name: 'Barbershop & Grooming Salon',
    description: 'Precision fades, beard grooming, hot towel shaves with calendar appointments.',
    icon: Scissors,
    color: '#f59e0b',
    presetSlug: 'classic-barbershop',
    heroImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Master Haircut & Skin Fade', price: 40, durationMinutes: 45, description: 'Precision scissor and clipper blend with neck shave.' },
      { id: 's2', name: 'Beard Sculpt & Razor Lineup', price: 25, durationMinutes: 30, description: 'Hot lather edge up and beard conditioning.' },
      { id: 's3', name: 'Executive Package (Haircut + Beard)', price: 60, durationMinutes: 75, description: 'Full haircut, hot towel treatment, and beard sculpt.' },
    ],
  },
  {
    id: 'gym',
    name: 'Gym & Elite Fitness Studio',
    description: 'HIIT conditioning, personal training packages, and membership onboarding.',
    icon: Dumbbell,
    color: '#e11d48',
    presetSlug: 'fitness-gym',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: '1-on-1 Personal Training Session', price: 75, durationMinutes: 60, description: 'Custom strength and conditioning coaching.' },
      { id: 's2', name: 'Unlimited Monthly Pass', price: 120, durationMinutes: 30, description: 'All-access facility, cold plunge, and sauna pass.' },
      { id: 's3', name: 'Body Composition & Fitness Audit', price: 0, durationMinutes: 30, description: 'Complimentary biometric assessment for new athletes.' },
    ],
  },
  {
    id: 'real_estate',
    name: 'Real Estate & Luxury Properties',
    description: 'Private estate tours, luxury walkthroughs, buyer advisory, and valuations.',
    icon: Home,
    color: '#10b981',
    presetSlug: 'real-estate',
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Private Estate Walkthrough Tour', price: 0, durationMinutes: 60, description: 'Guided viewing of prime residential listings.' },
      { id: 's2', name: 'Home Valuation & Market Audit', price: 0, durationMinutes: 45, description: 'Comprehensive property comparative analysis.' },
      { id: 's3', name: 'Buyer Strategy Advisory', price: 0, durationMinutes: 30, description: 'Pre-qualification and portfolio search guidance.' },
    ],
  },
  {
    id: 'saas',
    name: 'B2B SaaS & Software Platform',
    description: 'Enterprise software demos, vector pipeline tuning, and API architecture calls.',
    icon: Briefcase,
    color: '#2563eb',
    presetSlug: 'b2b-saas',
    heroImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Live Interactive Product Demo', price: 0, durationMinutes: 30, description: 'Guided walkthrough of our software suite.' },
      { id: 's2', name: 'Enterprise Workflow Audit', price: 299, durationMinutes: 60, description: 'Deep architectural review and migration plan.' },
      { id: 's3', name: 'Rapid Proof-of-Concept Setup', price: 999, durationMinutes: 120, description: 'Turnkey sandbox deployment with custom data.' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal Practice & Law Firm',
    description: 'Confidential case intake, corporate litigation consultations, and retainer scheduling.',
    icon: Scale,
    color: '#0f172a',
    presetSlug: 'legal-law-firm',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Confidential Case Evaluation', price: 0, durationMinutes: 30, description: 'Preliminary review of claims and legal merits.' },
      { id: 's2', name: 'Contract & Governance Review', price: 350, durationMinutes: 60, description: 'Clause analysis and corporate compliance check.' },
      { id: 's3', name: 'General Retainer Advisory', price: 1500, durationMinutes: 90, description: 'Dedicated outside counsel consultation.' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Medical & Dental Clinic',
    description: 'New patient intake, routine dental cleanings, checkups, and cosmetic triage.',
    icon: Activity,
    color: '#0284c7',
    presetSlug: 'dental-clinic',
    heroImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Comprehensive Exam & Cleaning', price: 180, durationMinutes: 60, description: 'Complete digital imaging and ultrasonic prophylaxis.' },
      { id: 's2', name: 'Cosmetic Consultation & Whitening', price: 250, durationMinutes: 45, description: 'In-office shade brightening and smile scan.' },
      { id: 's3', name: 'Urgent Toothache & Care Triage', price: 95, durationMinutes: 30, description: 'Same-day evaluation for discomfort or trauma.' },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Retail Brand',
    description: 'Direct-to-consumer store, curated catalog, private shopping appointments.',
    icon: ShoppingBag,
    color: '#9333ea',
    presetSlug: 'ecommerce-store',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Virtual Styling Consultation', price: 0, durationMinutes: 30, description: 'Personalized recommendations from our head stylist.' },
      { id: 's2', name: 'Custom Sizing & Measurement', price: 50, durationMinutes: 45, description: 'Tailored fit analysis for bespoke collections.' },
    ],
  },
  {
    id: 'ai_tech',
    name: 'Silicon Valley AI Platform',
    description: 'Autonomous neural agents, enterprise LLM orchestration, and vector pipeline audits.',
    icon: Sparkles,
    color: '#6366f1',
    presetSlug: 'nexus-ai',
    heroImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Live Interactive Agent Demo', price: 0, durationMinutes: 30, description: 'Hands-on architectural walkthrough and prompt testing.' },
      { id: 's2', name: 'Custom Vector Retrieval Tuning', price: 500, durationMinutes: 60, description: 'Evaluation of embedding precision and latency benchmarks.' },
      { id: 's3', name: 'Turnkey Enterprise Sandbox', price: 3500, durationMinutes: 120, description: 'Full dedicated pipeline deployment with HIPAA/SOC-2 guardrails.' },
    ],
  },
  {
    id: 'creative_agency',
    name: 'Creative & Motion Design Agency',
    description: 'Brand identity, 3D motion design, immersive WebGL direction, and sprint intake.',
    icon: Palette,
    color: '#d946ef',
    presetSlug: 'hyperion-agency',
    heroImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Creative Discovery Consultation', price: 0, durationMinutes: 30, description: 'Scope discussion and brand alignment session.' },
      { id: 's2', name: '2-Week Brand Identity Sprint', price: 3500, durationMinutes: 60, description: 'Comprehensive visual language, typography, and color systems.' },
      { id: 's3', name: '3D Motion Reel Production', price: 7500, durationMinutes: 90, description: 'Cinema-grade 30-second product animation.' },
    ],
  },
  {
    id: 'fintech',
    name: 'Private Wealth & Sovereign Capital',
    description: 'Discretionary portfolio management, algorithmic yield strategies, family office advisory.',
    icon: TrendingUp,
    color: '#14b8a6',
    presetSlug: 'aether-finance',
    heroImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Sovereign Treasury Allocation Review', price: 0, durationMinutes: 45, description: 'Institutional liquidity and yield routing audit.' },
      { id: 's2', name: 'MPC Custody Architecture Setup', price: 750, durationMinutes: 60, description: 'HSM air-gapped key shards for multi-signature governance.' },
      { id: 's3', name: 'Algorithmic Arbitrage Onboarding', price: 2000, durationMinutes: 90, description: 'Direct institutional gateway to automated liquidity pools.' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom / Bespoke Canvas',
    description: 'Modular blueprint for any bespoke agency, consulting firm, or service company.',
    icon: Layers,
    color: '#6366f1',
    presetSlug: 'custom',
    heroImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    defaultServices: [
      { id: 's1', name: 'Initial Discovery Session', price: 0, durationMinutes: 30, description: 'Discuss project goals and deliverables.' },
      { id: 's2', name: 'Core Implementation Package', price: 499, durationMinutes: 120, description: 'Full project execution and onboarding.' },
    ],
  },
];

export function AiLandingWizard({
  onBackToList,
  onOpenEditor,
  onSaveLandingPage,
  assistants = [],
  allLandingPages = [],
  activeAssistant,
}: AiLandingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const existingPagesCount = allLandingPages?.length || 0;
  const isFirstPage = existingPagesCount === 0;

  const defaultAssistant =
    activeAssistant ||
    (assistants.length > 0 ? assistants[0] : null);
  const defaultAssistantId = defaultAssistant?.id || (assistants[0]?.id || 'demo-assistant');

  // Form State
  const [selectedIndustry, setSelectedIndustry] = useState<string>('barbershop');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('barber_classic');
  const [previewModalArch, setPreviewModalArch] = useState<DesignArchetype | null>(null);

  const [businessName, setBusinessName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [purposeStory, setPurposeStory] = useState<string>('');
  const [founderName, setFounderName] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [hours, setHours] = useState<string>('Mon-Sat: 9:00 AM - 7:00 PM');
  const [services, setServices] = useState<LandingPageServiceItem[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('45');
  const [assistantOption, setAssistantOption] = useState<'auto_create' | 'none' | string>(defaultAssistantId);

  // Sync assistantOption if default assistant becomes available
  useEffect(() => {
    if (assistantOption === 'auto_create' && isFirstPage) {
      setAssistantOption(defaultAssistantId);
    }
  }, [defaultAssistantId, isFirstPage]);

  // AI Generator Progress State
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentAiStepMsg, setCurrentAiStepMsg] = useState('');
  const [createdConfig, setCreatedConfig] = useState<LandingPageConfig | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Initialize defaults whenever industry changes
  useEffect(() => {
    const ind = INDUSTRIES_LIST.find((i) => i.id === selectedIndustry) || INDUSTRIES_LIST[0];
    if (ind) {
      if (!businessName) {
        setBusinessName(ind.name.split('&')[0].trim());
      }
      setServices(ind.defaultServices);
      const industryArchs = getArchetypesForIndustry(selectedIndustry);
      if (industryArchs.length > 0) {
        setSelectedArchetype(industryArchs[0].id);
      }
    }
  }, [selectedIndustry]);

  // Auto-generate URL slug when businessName changes if not manually customized
  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    const cleanSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(cleanSlug);
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const priceNum = parseFloat(newServicePrice) || 0;
    const newSvc: LandingPageServiceItem = {
      id: 'svc_' + Math.random().toString(36).substring(2, 7),
      name: newServiceName.trim(),
      price: priceNum,
      durationMinutes: 45,
      description: `Service provided by ${businessName || 'our team'}.`,
    };
    setServices([...services, newSvc]);
    setNewServiceName('');
    setNewServicePrice('45');
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  // Run AI Website Architect Generation Routine (Step 4)
  const handleStartGeneration = async () => {
    setStep(4);
    setGenerationProgress(5);
    setGenerationError(null);

    const indObj = INDUSTRIES_LIST.find((i) => i.id === selectedIndustry) || INDUSTRIES_LIST[0];
    const industryArchs = getArchetypesForIndustry(selectedIndustry);
    const archObj = industryArchs.find((a) => a.id === selectedArchetype) || industryArchs[0] || MODERN_DESIGN_ARCHETYPES[0];
    const basePreset = getLandingConfigForSlugOrTemplate(indObj.presetSlug) || DEFAULT_BARBER_LANDING_CONFIG;

    const finalSlug = slug.trim() || 'site-' + Math.random().toString(36).substring(2, 7);
    const finalBusinessName = businessName.trim() || 'My Business Website';

    const constructedConfig: LandingPageConfig = {
      ...basePreset,
      id: 'lp_' + finalSlug,
      businessName: finalBusinessName,
      slug: finalSlug,
      industry: selectedIndustry,
      themeColor: archObj.themeColor || basePreset.themeColor || '#2563eb',
      heroHeadline: purposeStory.trim()
        ? `Premier ${finalBusinessName} - Designed for Excellence`
        : basePreset.heroHeadline,
      heroSubheadline: purposeStory.trim()
        ? purposeStory
        : basePreset.heroSubheadline,
      heroImageUrl: archObj.previewImage || indObj.heroImage || basePreset.heroImageUrl,
      aboutTitle: `About ${finalBusinessName}`,
      aboutText: purposeStory.trim() || basePreset.aboutText,
      phone: phone.trim() || basePreset.phone,
      email: email.trim() || basePreset.email,
      address: address.trim() || basePreset.address,
      services: services.length > 0 ? services : basePreset.services,
      founderName: founderName.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      designArchetype: selectedArchetype,
      workingHours: [
        { days: 'Monday - Saturday', hours: hours || '9:00 AM - 7:00 PM' },
      ],
      starterQuestions: [
        `What services does ${finalBusinessName} provide?`,
        `How can I book an appointment with ${finalBusinessName}?`,
        `What are your hours and pricing packages?`,
      ],
    };

    // AI Progress Simulation & Copywriting Messages
    const aiSteps = [
      { progress: 20, msg: `Analyzing business narrative and purpose for "${finalBusinessName}"...` },
      { progress: 45, msg: `Architecting ${archObj.name} layout and conversion hierarchy...` },
      { progress: 68, msg: `Synthesizing ${services.length} bespoke service pricing items & booking slots...` },
      { progress: 85, msg: assistantOption === 'auto_create'
          ? `Deploying dedicated AI Concierge and initializing new knowledge base...`
          : (assistantOption === 'none'
              ? `Configuring conversion architecture without live chatbot...`
              : `Connecting to existing AI Concierge knowledge base...`) },
      { progress: 95, msg: `Generating SEO meta headers, JSON-LD schema, and live preview...` },
    ];

    try {
      for (const st of aiSteps) {
        setCurrentAiStepMsg(st.msg);
        setGenerationProgress(st.progress);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      // Backend Creation
      const saved = await onSaveLandingPage(constructedConfig, assistantOption);
      setCreatedConfig(saved);
      setGenerationProgress(100);
      setCurrentAiStepMsg('AI Landing Page Successfully Architected & Deployed!');
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStep(5);
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to generate landing page with AI');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Wizard Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToList}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Back to Landing Pages List"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Website Architect</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Studio Generation
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI architects your high-conversion business site, writes custom copy, and connects an appointment concierge.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        {step <= 3 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className={step === 1 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>1. Industry</span>
            <span>&rarr;</span>
            <span className={step === 2 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>2. Design</span>
            <span>&rarr;</span>
            <span className={step === 3 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>3. Brand Content</span>
          </div>
        )}
      </div>

      {/* STEP 1: CHOOSE INDUSTRY TYPE */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Step 1: Choose Your Business Industry</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI will calibrate copywriting tone, service booking flows, and appointment triages for your specific vertical.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {INDUSTRIES_LIST.map((ind) => {
              const isSelected = selectedIndustry === ind.id;
              const Icon = ind.icon;
              return (
                <div
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-600/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className="p-2.5 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: ind.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-blue-600 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{ind.name}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {ind.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{ind.defaultServices.length} default services</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Auto-configured</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <span>Next: Choose Modern Design Archetype</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE 3 INDUSTRY-SPECIFIC DESIGN ARCHETYPES WITH SNAPSHOTS */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Step 2: Choose Design Archetype &amp; Aesthetic (3 Available)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select one of the 3 custom design archetypes crafted for {INDUSTRIES_LIST.find((i) => i.id === selectedIndustry)?.name || 'your industry'}. Each offers a distinct layout, typography scale, and aesthetic mood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {getArchetypesForIndustry(selectedIndustry).map((arch) => {
              const isSelected = selectedArchetype === arch.id;
              return (
                <div
                  key={arch.id}
                  onClick={() => setSelectedArchetype(arch.id)}
                  className={`rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 shadow-lg ring-2 ring-blue-600/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Webpage Layout Design Preview Frame */}
                  <div className="p-3 pb-0">
                    <ArchetypeDesignPreview
                      archetype={arch}
                      isSelected={isSelected}
                      onPreviewClick={(targetArch) => setPreviewModalArch(targetArch)}
                    />
                  </div>

                  {/* Body Specs */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {arch.name}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-blue-600 dark:text-blue-400">
                            <Check className="w-3 h-3" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {arch.tagline}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Architectural Features:
                      </div>
                      <div className="space-y-1">
                        {arch.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10.5px]">
                      <div>
                        <span className="text-slate-400 block text-[9.5px]">Color Aesthetic</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{arch.aesthetic}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModalArch(arch);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Design</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              &larr; Back to Industry
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <span>Next: Brand Details &amp; Purpose</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: BRAND DETAILS, PURPOSE & CONTENT INTAKE FORM */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Step 3: Tell AI About Your Business &amp; Purpose</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide your brand name, core purpose, contact info, and services. AI will synthesize compelling copy, headline hooks, and initialize your AI Concierge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Brand Identity & Story */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Brand Identity &amp; Story</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  placeholder="e.g. Apex Athletics Club or Crown Barbers"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website URL Slug (/site/[slug]) *
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-mono">/site/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="my-business"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Founder / Owner Name
                </label>
                <input
                  type="text"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  placeholder="e.g. Marcus Vance, Head Barber &amp; Founder"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Purpose &amp; Story Narrative *
                </label>
                <textarea
                  rows={3}
                  value={purposeStory}
                  onChange={(e) => setPurposeStory(e.target.value)}
                  placeholder="What makes your business special? e.g. We provide precision men's grooming and hot towel shaves with an upscale lounge atmosphere in Brooklyn since 2018..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                  AI uses this narrative to architect headlines, about section copy, and starter questions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Logo Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../logo.png"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right Column: Contact, Services & Concierge */}
            <div className="space-y-4">
              {/* Contact Information */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Contact &amp; Location</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@mybrand.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="452 Atlantic Ave, Brooklyn, NY 11217"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Mon-Sat: 9:00 AM - 7:00 PM"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Knowledge Base & AI Concierge Option */}
              {isFirstPage ? (
                /* First Landing Page: Connects directly to Default Knowledge Base */
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">AI Concierge &amp; Knowledge Base</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                      <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>Default Knowledge Base</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    This landing page will automatically use your default AI knowledge base (<strong>{defaultAssistant?.name || 'Primary Assistant'}</strong>).
                    All documents, FAQs, and files you train in your workspace will immediately power your site&apos;s AI chatbot.
                  </p>

                  <div className="space-y-2 pt-1 border-t border-blue-100 dark:border-blue-900/40">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assistantOption"
                        checked={assistantOption !== 'none'}
                        onChange={() => setAssistantOption(defaultAssistantId)}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Connect Default Knowledge Base ({defaultAssistant?.name || 'Primary Assistant'})
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Visitor inquiries and appointment bookings are handled using your existing trained knowledge.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assistantOption"
                        checked={assistantOption === 'none'}
                        onChange={() => setAssistantOption('none')}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          No Chatbot (Website Only)
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          The live site will operate without a floating chatbot widget.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                /* Subsequent Landing Pages: Prompt user to reuse existing or create new dedicated knowledge base */
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">AI Concierge &amp; Knowledge Base</span>
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                      Page #{existingPagesCount + 1}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Would you like this new page to use your previous knowledge base or create a new dedicated one?
                  </p>

                  <div className="space-y-2.5">
                    {/* Option 1: Use Previous / Existing Knowledge Base (Default) */}
                    <label className={`flex items-start gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                      assistantOption !== 'auto_create' && assistantOption !== 'none'
                        ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="assistantOption"
                        checked={assistantOption !== 'auto_create' && assistantOption !== 'none'}
                        onChange={() => setAssistantOption(defaultAssistantId)}
                        className="mt-1 text-blue-600"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Use Previous / Existing Knowledge Base (Recommended)
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Reuses Documents
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Shares documents, FAQs, and business training data from an existing assistant so you do not need to re-upload files.
                        </p>

                        {assistantOption !== 'auto_create' && assistantOption !== 'none' && assistants.length > 0 && (
                          <div className="pt-2">
                            <label className="block text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Select Assistant / Knowledge Base:
                            </label>
                            <select
                              value={assistantOption}
                              onChange={(e) => setAssistantOption(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                            >
                              {assistants.map((ast) => (
                                <option key={ast.id} value={ast.id}>
                                  {ast.name} ({ast.id})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Option 2: Create a New Knowledge Base & Dedicated Bot */}
                    <label className={`flex items-start gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                      assistantOption === 'auto_create'
                        ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="assistantOption"
                        checked={assistantOption === 'auto_create'}
                        onChange={() => setAssistantOption('auto_create')}
                        className="mt-1 text-blue-600"
                      />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Create a New Knowledge Base for This Page
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            Creates New Bot
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Spins up a brand-new, dedicated AI bot with an isolated knowledge base. Recommended if this website is for a completely different brand, company, or vertical.
                        </p>
                      </div>
                    </label>

                    {/* Option 3: No Chatbot */}
                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer ${
                      assistantOption === 'none'
                        ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="assistantOption"
                        checked={assistantOption === 'none'}
                        onChange={() => setAssistantOption('none')}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          No Chatbot (Website Only)
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          The live site will operate without a floating chatbot widget.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Menu & Pricing Intake */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Primary Services &amp; Pricing Menu
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Visitors can book these services directly through your interactive calendar or AI Concierge.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">{services.length} items</span>
            </div>

            {/* List of services */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{svc.name}</div>
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      ${svc.price} · {svc.durationMinutes} min
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(svc.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 transition cursor-pointer"
                    title="Remove service"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Service */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Service Name (e.g. VIP Consultation)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
              <div className="w-24 flex items-center gap-1">
                <span className="text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="Price"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddService}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              &larr; Back to Design Archetype
            </button>
            <button
              type="button"
              onClick={handleStartGeneration}
              disabled={!businessName.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Architect &amp; Deploy AI Website Now</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AI GENERATING PROGRESS EXPERIENCE */}
      {step === 4 && (
        <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="h-20 w-20 rounded-3xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center animate-pulse">
              <Cpu className="h-10 w-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              AI is Designing Your Website
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono transition-all duration-300">
              {currentAiStepMsg || 'Synthesizing layout and customer booking triggers...'}
            </p>
          </div>

          {/* Progress Bar with Gradient Glow */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Architecting</span>
              <span>{generationProgress}%</span>
            </div>
          </div>

          {generationError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
              {generationError}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="block mt-2 font-bold underline cursor-pointer"
              >
                Return to form and retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: GENERATION COMPLETE SCREEN */}
      {step === 5 && createdConfig && (
        <div className="p-8 max-w-2xl mx-auto rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xl text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30 animate-in zoom-in-75 duration-300">
            <Check className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              Live &amp; Deployed
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {createdConfig.businessName} is Live!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your AI-designed website is published with responsive layouts, an appointment calendar, and isolated knowledge base support.
            </p>
          </div>

          {/* Site Overview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Public URL:</span>
              <a
                href={`/site/${createdConfig.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>/site/{createdConfig.slug}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Connected AI Concierge:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {createdConfig.assistantId ? (
                  assistantOption === 'auto_create'
                    ? `Dedicated Bot (${createdConfig.assistantId})`
                    : `Existing Knowledge Base (${assistants.find((a) => a.id === createdConfig.assistantId)?.name || createdConfig.assistantId})`
                ) : 'None / Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Services Seeded:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {createdConfig.services?.length || 0} services
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={`/site/${createdConfig.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <Eye className="h-4 w-4 text-blue-600" />
              <span>View Live Website</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenEditor(createdConfig)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Sliders className="h-4 w-4" />
              <span>Open Visual Customizer</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToList}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold cursor-pointer underline pt-2 block mx-auto"
          >
            &larr; Back to All Landing Pages
          </button>
        </div>
      )}

      {/* Design Archetype Full Sample Preview Modal */}
      <DesignPreviewModal
        isOpen={Boolean(previewModalArch)}
        onClose={() => setPreviewModalArch(null)}
        archetype={previewModalArch}
        industryName={INDUSTRIES_LIST.find((i) => i.id === selectedIndustry)?.name}
        onSelectArchetype={(archId) => setSelectedArchetype(archId)}
      />
    </div>
  );
}

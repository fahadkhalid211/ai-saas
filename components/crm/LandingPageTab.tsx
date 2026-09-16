import React from 'react';
import {
  Globe,
  QrCode,
  ExternalLink,
  LayoutTemplate,
  Check,
  RefreshCw,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Info,
  Briefcase,
  Sparkles,
  MapPin,
  Link2,
  Search,
  Activity,
  Share2,
  Scissors,
  Trash2,
  MessageSquare,
  Dumbbell,
  Home,
  ShoppingBag,
  Scale,
  Eye,
  TrendingUp,
  Monitor,
  X,
  Bot,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import {
  LandingPageConfig,
  TEMPLATE_LANDING_CONFIGS,
  getLandingConfigForSlugOrTemplate,
} from '@/lib/landing/types';
import { LandingPagesList } from './landing/LandingPagesList';
import { AiLandingWizard } from './landing/AiLandingWizard';
import { DeleteLandingPageModal } from './landing/DeleteLandingPageModal';

const Youtube = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const LANDING_TEMPLATES_LIST = [
  {
    slug: 'classic-barbershop',
    industryId: 'barbershop',
    name: 'Classic Barbershop',
    category: 'Grooming & Salon',
    icon: Scissors,
    colorClass: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400',
    themeHex: '#f59e0b',
    heroImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    headline: 'Look Sharp. Feel Confident.',
    badge: '5.0 Stars (280+ Reviews)',
    servicesSample: ['Precision Skin Fade ($35)', 'Hot Towel Shave ($30)', 'Beard Sculpt ($25)'],
    description: 'Haircuts, beard trims, hot towel shaves with calendar bookings and automated SMS reminders.',
  },
  {
    slug: 'fitness-gym',
    industryId: 'gym',
    name: 'Fitness & Athletics',
    category: 'Gym & Fitness Club',
    icon: Dumbbell,
    colorClass: 'text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400',
    themeHex: '#e11d48',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    headline: 'Forge Elite Strength & Conditioning',
    badge: 'Top Rated Gym 2026',
    servicesSample: ['1-on-1 Personal Training ($75)', 'HIIT Conditioning ($30)', 'Cold Plunge Pass ($25)'],
    description: '1-on-1 personal training, HIIT conditioning, cold plunge passes, and membership triage.',
  },
  {
    slug: 'real-estate',
    industryId: 'real_estate',
    name: 'Prestige Living',
    category: 'Real Estate & Properties',
    icon: Home,
    colorClass: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400',
    themeHex: '#10b981',
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    headline: 'Extraordinary Homes For Remarkable Lives',
    badge: '$250M+ In Portfolio Sales',
    servicesSample: ['Private Estate Tour', 'Listing Valuation ($0)', 'Buyer Advisory ($0)'],
    description: 'Private estate tours, luxury walkthroughs, buyer pre-qualification, and valuation requests.',
  },
  {
    slug: 'ecommerce-store',
    industryId: 'ecommerce',
    name: 'LuxeLiving Retail',
    category: 'E-Commerce & Retail',
    icon: ShoppingBag,
    colorClass: 'text-purple-600 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-400',
    themeHex: '#9333ea',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    headline: 'Curated Scandinavian Furniture & Decor',
    badge: 'Complimentary White-Glove Delivery',
    servicesSample: ['Virtual Styling ($0)', 'Custom Swatch Box ($15)', 'Living Room Audit ($150)'],
    description: 'Virtual styling, swatch box requests, bespoke furniture consultations, and order triage.',
  },
  {
    slug: 'saas-landing',
    industryId: 'saas',
    name: 'CloudScale Engine',
    category: 'B2B SaaS & Tech',
    icon: Briefcase,
    colorClass: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400',
    themeHex: '#2563eb',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    headline: 'Serverless Infrastructure Orchestration',
    badge: 'SOC2 Type II Certified · 99.99% SLA',
    servicesSample: ['Enterprise Demo ($0)', 'Architecture Review ($500)', 'Migration Sprint ($2,000)'],
    description: 'Product walkthroughs, enterprise migration audits, SLA inquiries, and SOC2 compliance triage.',
  },
  {
    slug: 'legal-firm',
    industryId: 'legal',
    name: 'Vanguard Legal Partners',
    category: 'Legal & Law Firm',
    icon: Scale,
    colorClass: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
    themeHex: '#334155',
    heroImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    headline: 'Uncompromising Advocacy When Stakes Are Highest',
    badge: '40+ Years Combined Trial Experience',
    servicesSample: ['Case Evaluation ($0)', 'Contract Audit ($350)', 'Trial Retainer ($2,500)'],
    description: 'Confidential case intake, litigation consultations, NDA reviews, and retainer scheduling.',
  },
  {
    slug: 'dental-clinic',
    industryId: 'healthcare',
    name: 'Beacon Family Dental',
    category: 'Healthcare & Dental Clinic',
    icon: Activity,
    colorClass: 'text-sky-600 bg-sky-100 dark:bg-sky-950/60 dark:text-sky-400',
    themeHex: '#0284c7',
    heroImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    headline: 'Gentle, State-of-the-Art Dental Care',
    badge: 'Most Trusted Practice in Manhattan',
    servicesSample: ['Exam & Cleaning ($180)', 'Whitening ($350)', 'Invisalign Consult ($0)'],
    description: 'New patient intake, routine dental cleanings, toothache triage, and cosmetic consultations.',
  },
  {
    slug: 'nexus-ai',
    industryId: 'ai_tech',
    name: 'Nexus AI Intelligence',
    category: 'Silicon Valley AI Platform',
    icon: Sparkles,
    colorClass: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400',
    themeHex: '#6366f1',
    heroImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    headline: 'Next-Gen Autonomous Agent Orchestration',
    badge: 'High-Speed Neural Inference',
    servicesSample: ['Live Agent Demo ($0)', 'Custom Vector Tuning ($500)', 'Enterprise Setup ($3,500)'],
    description: 'Autonomous neural agents, enterprise LLM orchestration, vector pipeline audits, and API demos.',
  },
  {
    slug: 'hyperion-agency',
    industryId: 'creative_agency',
    name: 'Hyperion Creative Studio',
    category: 'Design & Motion Agency',
    icon: Briefcase,
    colorClass: 'text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-950/60 dark:text-fuchsia-400',
    themeHex: '#d946ef',
    heroImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    headline: 'Avant-Garde Digital & Motion Direction',
    badge: 'Awwwards Agency Nominee',
    servicesSample: ['Creative Consult ($0)', 'Brand Sprint ($3,500)', '3D Motion Reel ($7,500)'],
    description: 'Brand identity, 3D motion design, immersive WebGL art direction, and client portfolio intake.',
  },
  {
    slug: 'aether-finance',
    industryId: 'fintech',
    name: 'Aether Capital & Wealth',
    category: 'Private Wealth Management',
    icon: TrendingUp,
    colorClass: 'text-teal-600 bg-teal-100 dark:bg-teal-950/60 dark:text-teal-400',
    themeHex: '#14b8a6',
    heroImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    headline: 'Sovereign Capital In The Algorithmic Era',
    badge: 'Institutional Bullion & Sovereign Wealth',
    servicesSample: ['Treasury Review ($0)', 'MPC Custody Setup ($750)', 'Yield Arbitrage ($2,000)'],
    description: 'Discretionary portfolio management, algorithmic yield strategies, family office advisory.',
  },
  {
    slug: 'custom',
    industryId: 'custom',
    name: 'Custom Blank Canvas',
    category: 'Modular Skeleton Architecture',
    icon: LayoutTemplate,
    colorClass: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400',
    themeHex: '#6366f1',
    heroImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    headline: 'Your Custom Headline & Brand Positioning',
    badge: 'Custom Skeleton · Fully Modular Blueprint',
    servicesSample: ['Core Service Tier ($150)', 'Advanced Strategy ($250)', 'Custom Implementation ($499)'],
    description: 'Clean wireframe skeleton for any custom industry, agency, consulting firm, or bespoke business.',
  },
];

export interface LandingPageTabProps {
  landingConfig: LandingPageConfig;
  setLandingConfig: React.Dispatch<React.SetStateAction<LandingPageConfig>>;
  isSavingLanding: boolean;
  saveLandingSuccess: boolean;
  saveLandingError: string | null;
  copiedLandingUrl: boolean;
  setCopiedLandingUrl: (copied: boolean) => void;
  setShowCounterQrModal: (show: boolean) => void;
  presetNotice: string | null;
  setPresetNotice: (notice: string | null) => void;
  allLandingPages: any[];
  landingPageLimits: any;
  isPurchasingAddon: boolean;
  addonSuccessMsg: string | null;
  addonErrorMsg: string | null;
  setShowNewPageModal: (show: boolean) => void;
  handlePurchaseExtraLandingPage: () => Promise<void>;
  handleSaveLandingConfig: (e: React.FormEvent) => Promise<void>;
  activeAssistant: any;
  assistants?: any[];
  setActiveAssistant?: (ast: any) => void;
  setActiveTab?: (tab: any) => void;
  handleDeleteLandingPage?: (pageIdOrSlug?: string | LandingPageConfig) => Promise<void> | void;
  appointments: any[];
  theme: string;
  viewMode?: 'list' | 'create_wizard' | 'editor';
  setViewMode?: (mode: 'list' | 'create_wizard' | 'editor') => void;
  handleSelectPageForEdit?: (page: any) => void;
  handleStartCreateWizard?: () => void;
  handleBackToList?: () => void;
  handleQuickUpdateKnowledgeBase?: (pageIdOrSlug: string, assistantId: string) => Promise<void>;
  handleAIGenerateLandingPage?: (
    newConfig: LandingPageConfig,
    assistantOption?: 'auto_create' | 'none' | string
  ) => Promise<LandingPageConfig>;
  deletingPageId?: string | null;
  isDeletingLandingPage?: boolean;
  deleteProgress?: number;
  deleteStatusMessage?: string;
  pagePendingDelete?: LandingPageConfig | null;
  setPagePendingDelete?: (page: LandingPageConfig | null) => void;
  handleConfirmDeleteLandingPage?: () => Promise<void> | void;
}

export const LandingPageTab: React.FC<LandingPageTabProps> = ({
  landingConfig,
  setLandingConfig,
  isSavingLanding,
  saveLandingSuccess,
  saveLandingError,
  copiedLandingUrl,
  setCopiedLandingUrl,
  setShowCounterQrModal,
  presetNotice,
  setPresetNotice,
  allLandingPages,
  landingPageLimits,
  isPurchasingAddon,
  addonSuccessMsg,
  addonErrorMsg,
  setShowNewPageModal,
  handlePurchaseExtraLandingPage,
  handleSaveLandingConfig,
  handleDeleteLandingPage,
  activeAssistant,
  assistants = [],
  setActiveAssistant,
  setActiveTab: setParentActiveTab,
  appointments,
  theme,
  viewMode: propViewMode,
  setViewMode: propSetViewMode,
  handleSelectPageForEdit: propHandleSelectPageForEdit,
  handleStartCreateWizard: propHandleStartCreateWizard,
  handleBackToList: propHandleBackToList,
  handleQuickUpdateKnowledgeBase,
  handleAIGenerateLandingPage,
  deletingPageId,
  isDeletingLandingPage,
  deleteProgress,
  deleteStatusMessage,
  pagePendingDelete,
  setPagePendingDelete,
  handleConfirmDeleteLandingPage,
}) => {
  const [localViewMode, setLocalViewMode] = React.useState<'list' | 'create_wizard' | 'editor'>('list');
  const viewMode = propViewMode ?? localViewMode;
  const setViewMode = propSetViewMode ?? setLocalViewMode;

  const handleStartCreateWizard = () => {
    if (propHandleStartCreateWizard) {
      propHandleStartCreateWizard();
    } else {
      setViewMode('create_wizard');
    }
  };

  const handleBackToList = () => {
    if (propHandleBackToList) {
      propHandleBackToList();
    } else {
      setViewMode('list');
    }
  };

  const handleSelectPageForEdit = (page: LandingPageConfig) => {
    if (propHandleSelectPageForEdit) {
      propHandleSelectPageForEdit(page);
    } else {
      setLandingConfig(page);
      setViewMode('editor');
    }
  };

  const [activeTab, setActiveTab] = React.useState<'identity' | 'hero' | 'services' | 'contact'>('identity');
  const [showTemplatesModal, setShowTemplatesModal] = React.useState(false);
  const [templateSearch, setTemplateSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [inspectingSnapshot, setInspectingSnapshot] = React.useState<any | null>(null);

  const filteredTemplates = React.useMemo(() => {
    return LANDING_TEMPLATES_LIST.filter((tpl) => {
      const matchesSearch =
        !templateSearch.trim() ||
        tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tpl.category.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tpl.description.toLowerCase().includes(templateSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' ||
        tpl.industryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templateSearch, selectedCategory]);

  if (viewMode === 'list') {
    return (
      <LandingPagesList
        allLandingPages={allLandingPages}
        landingPageLimits={landingPageLimits}
        isPurchasingAddon={isPurchasingAddon}
        handlePurchaseExtraLandingPage={handlePurchaseExtraLandingPage}
        handleStartCreateWizard={handleStartCreateWizard}
        handleSelectPageForEdit={handleSelectPageForEdit}
        handleDeleteLandingPage={handleDeleteLandingPage}
        handleQuickUpdateKnowledgeBase={
          handleQuickUpdateKnowledgeBase ||
          (async (pageIdOrSlug: string, assistantId: string) => {
            const page = allLandingPages.find((p) => p.id === pageIdOrSlug || p.slug === pageIdOrSlug);
            if (!page) return;
            const updated = { ...page, assistantId };
            await fetch('/api/landing-page', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ assistantId, config: updated }),
            });
            setLandingConfig((prev) => (prev.id === page.id || prev.slug === page.slug ? { ...prev, assistantId } : prev));
          })
        }
        assistants={assistants}
        setActiveAssistant={setActiveAssistant}
        setActiveTab={setParentActiveTab}
        deletingPageId={deletingPageId}
        isDeletingLandingPage={isDeletingLandingPage}
        deleteProgress={deleteProgress}
        deleteStatusMessage={deleteStatusMessage}
        pagePendingDelete={pagePendingDelete}
        setPagePendingDelete={setPagePendingDelete}
        handleConfirmDeleteLandingPage={handleConfirmDeleteLandingPage}
      />
    );
  }

  if (viewMode === 'create_wizard') {
    return (
      <AiLandingWizard
        onBackToList={handleBackToList}
        onOpenEditor={(newConfig) => {
          setLandingConfig(newConfig);
          setViewMode('editor');
        }}
        onSaveLandingPage={
          handleAIGenerateLandingPage ||
          (async (newConfig, assistantOption) => {
            const isAutoCreate = assistantOption === 'auto_create';
            const targetAssistantId = isAutoCreate ? undefined : (assistantOption === 'none' ? '' : assistantOption);
            const res = await fetch('/api/landing-page', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                assistantId: targetAssistantId,
                createDedicatedAssistant: isAutoCreate,
                config: newConfig,
                isNewPage: true,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate landing page');
            return data.config || newConfig;
          })
        }
        assistants={assistants}
      />
    );
  }

  const liveSiteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/site/${landingConfig.slug || activeAssistant?.id || 'demo-assistant'}`
    : `/site/${landingConfig.slug || 'demo-assistant'}`;

  return (
    <div className="max-w-5xl space-y-6 mx-auto pb-16">
      {/* Back to All Landing Pages & Active Editor Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <button
          type="button"
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Back to All Landing Pages</span>
        </button>

        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Editing:</span>
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
            {landingConfig.businessName || 'Business Website'}
          </span>
          <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            /site/{landingConfig.slug}
          </span>
        </div>
      </div>

      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Landing Page Studio</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your hosted business website, customize service catalogs, connect custom domains, and fine-tune AI booking concierges.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shadow-2xs cursor-pointer"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span>Browse Templates (11)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCounterQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
          >
            <QrCode className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>In-Store QR Code</span>
          </button>
          <a
            href={`/site/${landingConfig.slug || activeAssistant?.id || 'demo-assistant'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Live Site</span>
          </a>
        </div>
      </div>

      {/* Page Selector, Live URL & Quota Toolbar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Active Page Info & Switcher */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {landingConfig.businessName || 'Your Business Website'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  /site/{landingConfig.slug}
                </span>
                {landingConfig.customDomain && (
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {landingConfig.customDomain}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                {liveSiteUrl}
              </div>
            </div>
          </div>

          {/* Quick Actions & Quota */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(liveSiteUrl);
                setCopiedLandingUrl(true);
                setTimeout(() => setCopiedLandingUrl(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {copiedLandingUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copiedLandingUrl ? 'Copied Link' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={handlePurchaseExtraLandingPage}
              disabled={isPurchasingAddon}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              title="Add 1 extra landing page slot for $100"
            >
              {isPurchasingAddon ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>+ Extra Slot ($100)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (landingPageLimits.currentCount >= landingPageLimits.totalAllowed) {
                  alert(`You have reached your plan limit of ${landingPageLimits.totalAllowed} landing page(s). Click "+ Extra Slot ($100)" to add another landing page.`);
                  return;
                }
                handleStartCreateWizard();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Page</span>
            </button>

            {handleDeleteLandingPage && (
              <button
                type="button"
                disabled={Boolean(deletingPageId)}
                onClick={() => handleDeleteLandingPage(landingConfig)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                title="Delete this landing page"
              >
                {deletingPageId && (deletingPageId === landingConfig.id || deletingPageId === landingConfig.slug) ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting ({deleteProgress || 0}%)...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Page</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Multi-Page Switcher Buttons (if multiple pages exist) */}
        {allLandingPages && allLandingPages.length > 1 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">Switch Page:</span>
            {allLandingPages.map((pg) => {
              const isCurrent = landingConfig.slug === pg.slug || landingConfig.id === pg.id;
              return (
                <button
                  key={pg.slug || pg.id}
                  type="button"
                  onClick={() => {
                    setLandingConfig({ ...pg });
                    setPresetNotice('Switched active editor to: ' + pg.businessName);
                    setTimeout(() => setPresetNotice(null), 3000);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Globe className="h-3 w-3 opacity-70" />
                  <span>{pg.businessName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quota Indicator */}
        <div className="pt-1 flex items-center justify-between text-[10.5px] text-slate-500 font-mono">
          <span>
            Workspace Quota: {landingPageLimits.currentCount} of {landingPageLimits.totalAllowed} page(s) allocated ({landingPageLimits.planTier} tier)
          </span>
          {landingPageLimits.extraSlots > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              +{landingPageLimits.extraSlots} paid add-on slot(s)
            </span>
          )}
        </div>
      </div>

      {/* Alert / Notification Banners */}
      {presetNotice && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2 font-medium animate-in fade-in">
          <Info className="h-4 w-4 shrink-0 text-blue-600" />
          <span>{presetNotice}</span>
        </div>
      )}

      {saveLandingSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Landing page configuration successfully saved and published!</span>
        </div>
      )}

      {saveLandingError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 font-medium animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{saveLandingError}</span>
        </div>
      )}

      {addonSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{addonSuccessMsg}</span>
        </div>
      )}

      {addonErrorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 font-medium animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{addonErrorMsg}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl px-2 pt-2 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'identity'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Identity &amp; Branding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'hero'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Hero &amp; Social</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Scissors className="h-4 w-4" />
          <span>Services &amp; Pricing</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
            {(landingConfig.services || []).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'contact'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Contact, SEO &amp; Analytics</span>
        </button>
      </div>

      {/* Settings Form Content */}
      <form onSubmit={handleSaveLandingConfig} className="space-y-6">
        {/* Tab 1: Identity & Branding */}
        {activeTab === 'identity' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Connected AI Bot & Dedicated Knowledge Base Card */}
            <div className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/50 via-white to-blue-50/20 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/10 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Assigned AI Concierge &amp; Knowledge Base
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      The chatbot on this landing page only answers questions from this bot's knowledge base.
                    </p>
                  </div>
                </div>

                {setParentActiveTab && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = landingConfig.assistantId || activeAssistant?.id;
                      const matched = assistants.find((a) => a.id === targetId);
                      if (matched && setActiveAssistant) {
                        setActiveAssistant(matched);
                      }
                      setParentActiveTab('knowledge');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <span>Manage Bot Knowledge Base</span>
                  </button>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-blue-100 dark:border-blue-900/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Connected AI Bot &amp; Knowledge Base
                    </label>
                    <select
                      value={landingConfig.assistantId ?? ''}
                      onChange={(e) => setLandingConfig({ ...landingConfig, assistantId: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                    >
                      <option value="">None / Disconnected (No Chatbot &amp; Knowledge Base)</option>
                      {assistants && assistants.length > 0 && (
                        <optgroup label="Available AI Assistants">
                          {assistants.map((ast) => (
                            <option key={ast.id} value={ast.id}>
                              {ast.name} ({ast.id})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    <div className="mt-2 flex items-center justify-between">
                      {landingConfig.assistantId ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Knowledge base connected &amp; isolated</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          <span>Disconnected (Chatbot disabled on site)</span>
                        </div>
                      )}

                      {landingConfig.assistantId && (
                        <button
                          type="button"
                          onClick={() => setLandingConfig({ ...landingConfig, assistantId: '' })}
                          className="text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 cursor-pointer transition"
                          title="Remove bot and knowledge base from this landing page"
                        >
                          <X className="h-3 w-3" />
                          <span>Disconnect</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/40 text-[11.5px] text-slate-600 dark:text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-300">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>Strict Knowledge Base Separation</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Connect a dedicated bot to provide website visitors with an AI concierge trained exclusively on this landing page's documents and catalog. Disconnecting disables the chatbot on this website.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span>Business Identity &amp; Positioning</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={landingConfig.businessName || ''}
                    onChange={(e) => setLandingConfig({ ...landingConfig, businessName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL Slug (/site/[slug])
                  </label>
                  <input
                    type="text"
                    required
                    value={landingConfig.slug || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Logo URL
                  </label>
                  <input
                    type="url"
                    value={landingConfig.logoUrl || ''}
                    onChange={(e) => setLandingConfig({ ...landingConfig, logoUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-... or your logo URL"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Founder / Lead Practitioner Name
                  </label>
                  <input
                    type="text"
                    value={landingConfig.founderName || ''}
                    onChange={(e) => setLandingConfig({ ...landingConfig, founderName: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={landingConfig.tagline || ''}
                  onChange={(e) => setLandingConfig({ ...landingConfig, tagline: e.target.value })}
                  placeholder="e.g. Master Fades, Traditional Hot Towel Shaves & Modern Grooming"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trust Badge Text (Top Banner)
                </label>
                <input
                  type="text"
                  value={landingConfig.badgeText || ''}
                  onChange={(e) => setLandingConfig({ ...landingConfig, badgeText: e.target.value })}
                  placeholder="e.g. Top Rated in New York · 5.0 Stars (280+ Reviews)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry Type
                  </label>
                  <select
                    value={landingConfig.industry || 'barbershop'}
                    onChange={(e) => setLandingConfig({ ...landingConfig, industry: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="barbershop">Barbershop &amp; Salon</option>
                    <option value="gym">Gym &amp; Fitness Club</option>
                    <option value="real_estate">Real Estate &amp; Properties</option>
                    <option value="ecommerce">E-Commerce &amp; Retail</option>
                    <option value="saas">B2B SaaS &amp; Enterprise Software</option>
                    <option value="legal">Law Firm &amp; Legal Services</option>
                    <option value="healthcare">Dental Clinic &amp; Healthcare</option>
                    <option value="ai_tech">Silicon Valley AI Platform</option>
                    <option value="creative_agency">Design &amp; Motion Agency</option>
                    <option value="fintech">Private Wealth Management</option>
                    <option value="custom">Custom Blank Canvas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Accent Theme Color
                  </label>
                  <select
                    value={landingConfig.themeColor || 'amber'}
                    onChange={(e) => setLandingConfig({ ...landingConfig, themeColor: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="amber">Warm Amber (Barbershop / Grooming)</option>
                    <option value="rose">High-Energy Rose (Fitness / Athletics)</option>
                    <option value="emerald">Prestige Emerald (Real Estate / Luxury)</option>
                    <option value="purple">Vibrant Purple (E-Commerce / Fashion)</option>
                    <option value="blue">Enterprise Blue (B2B SaaS / Tech)</option>
                    <option value="slate">Refined Slate (Legal / Consulting)</option>
                    <option value="sky">Clinical Cyan (Dental / Healthcare)</option>
                    <option value="indigo">Deep Indigo (AI Platform / High-Tech)</option>
                    <option value="fuchsia">Vivid Fuchsia (Creative Studio / Art)</option>
                    <option value="teal">Sovereign Teal (Private Wealth / Fintech)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Domain Linking */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <span>Branded Custom Domain</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  SSL Auto-Provisioned
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your branded domain (e.g. <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">booking.yourbrand.com</span> or <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">mybarbershop.com</span>). Your landing page will be served directly under your domain with zero third-party branding.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Domain Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="booking.yourbrand.com"
                      value={landingConfig.customDomain || ''}
                      onChange={(e) =>
                        setLandingConfig({
                          ...landingConfig,
                          customDomain: e.target.value.toLowerCase().trim(),
                        })
                      }
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    {landingConfig.customDomain && (
                      <a
                        href={'https://' + landingConfig.customDomain}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Test Domain</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* DNS Instructions Card */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-2 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 text-blue-500" />
                    <span>Required DNS Records at Registrar (GoDaddy, Namecheap, Cloudflare)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9.5px]">RECORD TYPE</span>
                      <span className="font-bold text-slate-900 dark:text-white">CNAME</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9.5px]">HOST / SUBDOMAIN</span>
                      <span className="font-bold text-slate-900 dark:text-white">booking (or @)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[9.5px]">TARGET / VALUE</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">domains.kortexai.com</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('domains.kortexai.com')}
                        className="text-blue-500 hover:text-blue-600 p-1"
                        title="Copy Target"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    For root apex domains (e.g. <span className="font-mono">yourbrand.com</span>), point an A record to <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">76.76.21.21</span>. DNS updates typically propagate within 5 to 15 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Hero & Social */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Hero Section Copy &amp; Imagery</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hero Main Headline
                </label>
                <input
                  type="text"
                  value={landingConfig.heroHeadline || ''}
                  onChange={(e) => setLandingConfig({ ...landingConfig, heroHeadline: e.target.value })}
                  placeholder="e.g. Look Sharp. Feel Confident. The Premier Grooming Experience."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hero Subheadline
                </label>
                <textarea
                  rows={2}
                  value={landingConfig.heroSubheadline || ''}
                  onChange={(e) => setLandingConfig({ ...landingConfig, heroSubheadline: e.target.value })}
                  placeholder="Describe your service proposition, atmosphere, or key differentiators."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Call To Action Button Text
                  </label>
                  <input
                    type="text"
                    value={landingConfig.heroCtaText || ''}
                    onChange={(e) => setLandingConfig({ ...landingConfig, heroCtaText: e.target.value })}
                    placeholder="e.g. Book Your Haircut Now"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hero Image URL
                  </label>
                  <input
                    type="url"
                    value={landingConfig.heroImageUrl || ''}
                    onChange={(e) => setLandingConfig({ ...landingConfig, heroImageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {landingConfig.heroImageUrl && (
                <div className="pt-2">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">Hero Image Preview:</span>
                  <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative w-full sm:w-80">
                    <img
                      src={landingConfig.heroImageUrl}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Accounts */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-pink-500" />
                  <span>Social Media Accounts &amp; Public Profiles</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                  Header &amp; Footer Icons
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourhandle"
                    value={landingConfig.socialLinks?.instagram || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        socialLinks: { ...landingConfig.socialLinks, instagram: e.target.value.trim() },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={landingConfig.socialLinks?.facebook || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        socialLinks: { ...landingConfig.socialLinks, facebook: e.target.value.trim() },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    X / Twitter URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourhandle"
                    value={landingConfig.socialLinks?.twitter || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        socialLinks: { ...landingConfig.socialLinks, twitter: e.target.value.trim() },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/yourbrand"
                    value={landingConfig.socialLinks?.linkedin || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        socialLinks: { ...landingConfig.socialLinks, linkedin: e.target.value.trim() },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@yourchannel"
                    value={landingConfig.socialLinks?.youtube || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        socialLinks: { ...landingConfig.socialLinks, youtube: e.target.value.trim() },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@yourhandle"
                    value={landingConfig.socialLinks?.tiktok || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        socialLinks: { ...landingConfig.socialLinks, tiktok: e.target.value.trim() },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Services & Pricing */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-amber-500" />
                    <span>Services &amp; Pricing Menu</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    These items populate your website catalog and provide live pricing for the AI assistant and interactive booking modal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newService = {
                      id: 'srv_' + Math.random().toString(36).substring(2, 9),
                      name: 'New Custom Service',
                      description: 'Service consultation and appointment details.',
                      durationMinutes: 30,
                      price: 45,
                    };
                    setLandingConfig({
                      ...landingConfig,
                      services: [...(landingConfig.services || []), newService],
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="space-y-3">
                {(landingConfig.services || []).map((service, sIdx) => (
                  <div
                    key={service.id || sIdx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Service Name</label>
                        <input
                          type="text"
                          value={service.name}
                          placeholder="e.g. Master Haircut & Styling"
                          onChange={(e) => {
                            const next = [...(landingConfig.services || [])];
                            next[sIdx].name = e.target.value;
                            setLandingConfig({ ...landingConfig, services: next });
                          }}
                          className="font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white w-full"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Price ($)</label>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">$</span>
                            <input
                              type="number"
                              value={service.price}
                              onChange={(e) => {
                                const next = [...(landingConfig.services || [])];
                                next[sIdx].price = parseFloat(e.target.value) || 0;
                                setLandingConfig({ ...landingConfig, services: next });
                              }}
                              className="w-20 font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white text-right"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Duration</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={service.durationMinutes}
                              onChange={(e) => {
                                const next = [...(landingConfig.services || [])];
                                next[sIdx].durationMinutes = parseInt(e.target.value) || 30;
                                setLandingConfig({ ...landingConfig, services: next });
                              }}
                              className="w-16 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white text-right"
                            />
                            <span className="text-[11px] text-slate-400">min</span>
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              const next = (landingConfig.services || []).filter((_, i) => i !== sIdx);
                              setLandingConfig({ ...landingConfig, services: next });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="Delete service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Service Description</label>
                      <input
                        type="text"
                        value={service.description}
                        placeholder="Brief description for prospective clients"
                        onChange={(e) => {
                          const next = [...(landingConfig.services || [])];
                          next[sIdx].description = e.target.value;
                          setLandingConfig({ ...landingConfig, services: next });
                        }}
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300"
                      />
                    </div>
                  </div>
                ))}

                {(!landingConfig.services || landingConfig.services.length === 0) && (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                    <Scissors className="h-8 w-8 text-slate-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No Services Added Yet</div>
                    <p className="text-[11px] text-slate-500">Add service items to showcase your menu and enable instant online scheduling.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Contact, SEO & Analytics */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Contact Information */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-500" />
                <span>Contact &amp; Location Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={landingConfig.phone || ''}
                    onChange={(e) => setLandingConfig({ ...landingConfig, phone: e.target.value })}
                    placeholder="+1 (718) 555-0198"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={landingConfig.email || ''}
                    onChange={(e) => setLandingConfig({ ...landingConfig, email: e.target.value })}
                    placeholder="contact@yourbusiness.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={landingConfig.googleMapsUrl || ''}
                    onChange={(e) => setLandingConfig({ ...landingConfig, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Physical Address
                </label>
                <input
                  type="text"
                  value={landingConfig.address || ''}
                  onChange={(e) => setLandingConfig({ ...landingConfig, address: e.target.value })}
                  placeholder="452 Atlantic Avenue, Brooklyn, NY 11217"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* SEO Optimization Settings */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="h-4 w-4 text-indigo-500" />
                  <span>SEO &amp; Search Engine Optimization</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Google Search Ready
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Meta Title Tag</label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(landingConfig.seo?.metaTitle || landingConfig.businessName || '').length} / 60
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder={landingConfig.businessName ? `${landingConfig.businessName} | Official Booking & Services` : 'Your Business Name'}
                      value={landingConfig.seo?.metaTitle || ''}
                      onChange={(e) =>
                        setLandingConfig({
                          ...landingConfig,
                          seo: { ...landingConfig.seo, metaTitle: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Keywords</label>
                      <span className="text-[10px] text-slate-400">Comma separated</span>
                    </div>
                    <input
                      type="text"
                      placeholder="haircut, beard trim, new york grooming"
                      value={landingConfig.seo?.metaKeywords || ''}
                      onChange={(e) =>
                        setLandingConfig({
                          ...landingConfig,
                          seo: { ...landingConfig.seo, metaKeywords: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Meta Description</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(landingConfig.seo?.metaDescription || landingConfig.heroSubheadline || '').length} / 160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Book appointments online 24/7 with instant confirmation."
                    value={landingConfig.seo?.metaDescription || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        seo: { ...landingConfig.seo, metaDescription: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Social Share Image URL (OpenGraph)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/og-preview.jpg"
                      value={landingConfig.seo?.ogImageUrl || ''}
                      onChange={(e) =>
                        setLandingConfig({
                          ...landingConfig,
                          seo: { ...landingConfig.seo, ogImageUrl: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Canonical URL Override (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourbrand.com/official"
                      value={landingConfig.seo?.canonicalUrl || ''}
                      onChange={(e) =>
                        setLandingConfig({
                          ...landingConfig,
                          seo: { ...landingConfig.seo, canonicalUrl: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Google Search Snippet Live Preview */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                    Google Search SERP Preview
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      https://{landingConfig.customDomain || 'kortexai.com/site/' + (landingConfig.slug || 'business')}
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {landingConfig.seo?.metaTitle || landingConfig.businessName || 'Your Business Name'} | Official Booking &amp; Services
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {landingConfig.seo?.metaDescription || landingConfig.heroSubheadline || 'Book services, view transparent pricing, and schedule appointments online 24/7 with our AI concierge.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics & Tracking Pixels */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-500" />
                  <span>Meta Pixels &amp; Google Analytics</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                  Ad Attribution &amp; Conversions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Analytics 4 Measurement ID
                  </label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={landingConfig.analytics?.googleAnalyticsId || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        analytics: { ...landingConfig.analytics, googleAnalyticsId: e.target.value.trim() },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Found in Google Analytics &gt; Admin &gt; Data Streams</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta / Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    placeholder="123456789012345"
                    value={landingConfig.analytics?.metaPixelId || ''}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        analytics: { ...landingConfig.analytics, metaPixelId: e.target.value.trim() },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Found in Meta Events Manager &gt; Data Sources</span>
                </div>
              </div>
            </div>

            {/* Chatbot Starter Questions */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span>Chatbot Starter Questions (Visitor Quick Chips)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Chips displayed inside the chatbot widget. Clicking instantly sends the question and answers using your knowledge base.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentQuestions = landingConfig.starterQuestions || [];
                    setLandingConfig({
                      ...landingConfig,
                      starterQuestions: [...currentQuestions, 'New quick question?'],
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-2">
                {(landingConfig.starterQuestions || ['What are your services and prices?', 'How do I book an appointment?', 'What are your business hours?']).map((question, qIdx) => (
                  <div key={qIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => {
                        const next = [...(landingConfig.starterQuestions || [])];
                        next[qIdx] = e.target.value;
                        setLandingConfig({ ...landingConfig, starterQuestions: next });
                      }}
                      className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (landingConfig.starterQuestions || []).filter((_, i) => i !== qIdx);
                        setLandingConfig({ ...landingConfig, starterQuestions: next });
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sticky Save Action Dock */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <Globe className="h-4 w-4 text-blue-600" />
            <span>Editing: <strong className="text-slate-900 dark:text-white">{landingConfig.businessName}</strong> (/site/{landingConfig.slug})</span>
          </div>

          <button
            type="submit"
            disabled={isSavingLanding}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSavingLanding ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save &amp; Publish Landing Page</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Pre-Built Template Showcase Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-blue-600" />
                  <span>Pre-Built Industry Templates ({LANDING_TEMPLATES_LIST.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose a pre-built industry template to instantly populate tailored services, copywriting, and layout themes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Filter Toolbar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates by industry or keywords..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'barbershop', label: 'Grooming' },
                  { id: 'gym', label: 'Fitness' },
                  { id: 'real_estate', label: 'Properties' },
                  { id: 'ecommerce', label: 'Retail' },
                  { id: 'saas', label: 'SaaS' },
                  { id: 'legal', label: 'Legal' },
                  { id: 'healthcare', label: 'Clinic' },
                  { id: 'ai_tech', label: 'AI Tech' },
                  { id: 'creative_agency', label: 'Creative' },
                  { id: 'fintech', label: 'Wealth' },
                  { id: 'custom', label: 'Custom' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((tpl) => {
                const IconComponent = tpl.icon;
                const isActive = landingConfig.slug === tpl.slug || landingConfig.industry === tpl.industryId;
                return (
                  <div
                    key={tpl.slug}
                    className={`group flex flex-col justify-between rounded-2xl border overflow-hidden transition-all duration-200 shadow-2xs hover:shadow-md ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    {/* Visual Snapshot Thumbnail */}
                    <div
                      onClick={() => setInspectingSnapshot(tpl)}
                      className="relative h-32 w-full overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src={tpl.heroImage}
                        alt={tpl.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />

                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-xs backdrop-blur-xs max-w-[170px] truncate">
                        {tpl.badge}
                      </span>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white font-bold text-xs leading-tight drop-shadow-xs truncate">
                        {tpl.headline}
                      </div>

                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                        <Eye className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-semibold">Inspect Snapshot</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${tpl.colorClass}`}>
                              <IconComponent className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {tpl.name}
                            </span>
                          </div>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white shrink-0">
                              <Check className="h-2.5 w-2.5" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {tpl.servicesSample?.slice(0, 2).map((svc: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9.5px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[140px]"
                            >
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => {
                            const preset = getLandingConfigForSlugOrTemplate(tpl.slug);
                            if (preset) {
                              setLandingConfig((prev) => ({
                                ...preset,
                                id: prev.id || preset.id,
                                assistantId: prev.assistantId !== undefined ? prev.assistantId : preset.assistantId,
                              }));
                              setPresetNotice(`Loaded "${preset.businessName}" template! Click "Save & Publish" below to persist changes.`);
                              setShowTemplatesModal(false);
                              setTimeout(() => setPresetNotice(null), 6000);
                            }
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition text-center cursor-pointer shadow-2xs"
                        >
                          Apply Preset
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectingSnapshot(tpl)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title={`Inspect ${tpl.name} design snapshot`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={`/site/${tpl.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                          title={`Open live demo site for ${tpl.name}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Full Snapshot Inspector Modal */}
      {inspectingSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Top Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${inspectingSnapshot.colorClass}`}>
                  {React.createElement(inspectingSnapshot.icon, { className: 'h-4 w-4' })}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{inspectingSnapshot.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {inspectingSnapshot.category}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    site.kortex.ai/{inspectingSnapshot.slug}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSnapshot(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Snapshot Preview Window */}
            <div className="overflow-y-auto p-5 space-y-4">
              {/* Hero Section Preview */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-sm">
                <div className="relative h-48 sm:h-56 w-full">
                  <img
                    src={inspectingSnapshot.heroImage}
                    alt={inspectingSnapshot.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end text-white space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md self-start border border-white/30">
                      {inspectingSnapshot.badge}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black leading-tight max-w-lg">
                      {inspectingSnapshot.headline}
                    </h2>
                    <p className="text-xs text-slate-200 line-clamp-2 max-w-md">
                      {inspectingSnapshot.description}
                    </p>
                    <div className="pt-1">
                      <span
                        style={{ backgroundColor: inspectingSnapshot.themeHex }}
                        className="inline-block px-4 py-1.5 rounded-xl text-white font-bold text-xs shadow-md"
                      >
                        Book Appointment &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catalog Highlights */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Included Services &amp; Pricing Menu
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {inspectingSnapshot.servicesSample?.map((svc: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
              <a
                href={`/site/${inspectingSnapshot.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Full Interactive Site</span>
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingSnapshot(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const preset = getLandingConfigForSlugOrTemplate(inspectingSnapshot.slug);
                    if (preset) {
                      setLandingConfig((prev) => ({
                        ...preset,
                        id: prev.id || preset.id,
                        assistantId: prev.assistantId !== undefined ? prev.assistantId : preset.assistantId,
                      }));
                      setPresetNotice(`Loaded "${preset.businessName}" template! Click "Save & Publish" below.`);
                      setTimeout(() => setPresetNotice(null), 6000);
                    }
                    setInspectingSnapshot(null);
                    setShowTemplatesModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  Load This Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Delete Confirmation & Progress Modal for Editor */}
      <DeleteLandingPageModal
        isOpen={Boolean(pagePendingDelete)}
        page={pagePendingDelete || null}
        isDeleting={Boolean(isDeletingLandingPage)}
        progress={deleteProgress || 0}
        statusMessage={deleteStatusMessage || ''}
        onClose={() => setPagePendingDelete?.(null)}
        onConfirm={() => handleConfirmDeleteLandingPage?.()}
      />
    </div>
  );
};

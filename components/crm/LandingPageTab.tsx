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
} from 'lucide-react';
import {
  LandingPageConfig,
  TEMPLATE_LANDING_CONFIGS,
  getLandingConfigForSlugOrTemplate,
} from '@/lib/landing/types';

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
    description: 'Virtual styling consultations, order tracking, product sizing, and VIP client concierge.',
  },
  {
    slug: 'b2b-saas',
    industryId: 'saas',
    name: 'CloudScale SaaS',
    category: 'B2B Enterprise Software',
    icon: Briefcase,
    colorClass: 'text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400',
    themeHex: '#2563eb',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    headline: 'Unified Observability & Vector Pipelines',
    badge: 'SOC2 Type II Certified · 99.99% SLA',
    servicesSample: ['Platform Demo ($0)', 'Architecture Review ($0)', 'Migration Audit ($1,200)'],
    description: 'Enterprise product demos, architectural consultations, security reviews, and SLA discovery.',
  },
  {
    slug: 'legal-law-firm',
    industryId: 'legal',
    name: 'Sterling & Vance Legal',
    category: 'Law Firm & Counsel',
    icon: Scale,
    colorClass: 'text-slate-700 bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
    themeHex: '#475569',
    heroImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    headline: 'Relentless Advocacy. Trusted Counsel.',
    badge: 'Ranked Tier 1 Best Law Firms 2026',
    servicesSample: ['Case Evaluation ($0)', 'Contract Review ($450)', 'Dispute Counsel ($600)'],
    description: 'Confidential case evaluations, attorney intake, corporate contract reviews, and dispute advice.',
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
  appointments: any[];
  theme: string;
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
  activeAssistant,
  appointments,
  theme,
}) => {
  const [inspectingSnapshot, setInspectingSnapshot] = React.useState<any | null>(null);

  return (
              <div className="max-w-5xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span>Hosted Business Landing Page</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      A complete public website for your business with integrated AI chatbot booking, live services menu, and automated reminders.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
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

                {/* Industry Template Quick Selector & Showcase */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Pre-Built Industry Templates ({LANDING_TEMPLATES_LIST.length})
                        </h2>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Select an industry to populate your assistant's live site with tailored services, copy, starter questions, and branding, or preview the hosted live page.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {LANDING_TEMPLATES_LIST.map((tpl) => {
                      const IconComponent = tpl.icon;
                      const isActive = landingConfig.slug === tpl.slug || landingConfig.industry === tpl.industryId;
                      return (
                        <div
                          key={tpl.slug}
                          className={`group flex flex-col justify-between rounded-2xl border overflow-hidden transition-all duration-200 shadow-2xs hover:shadow-md ${
                            isActive
                              ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500'
                          }`}
                        >
                          {/* Miniature Desktop Browser Frame & Visual Snapshot */}
                          <div className="relative border-b border-slate-100 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-800/60">
                            {/* Browser Top Bar */}
                            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-200/70 dark:border-slate-700/70">
                              <div className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              </div>
                              <div className="text-[9px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 truncate max-w-[125px]">
                                kortex.ai/site/{tpl.slug}
                              </div>
                              <button
                                type="button"
                                onClick={() => setInspectingSnapshot(tpl)}
                                className="p-0.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                                title={`Inspect full snapshot of ${tpl.name}`}
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Snapshot Hero Thumbnail with Hover Zoom */}
                            <div
                              onClick={() => setInspectingSnapshot(tpl)}
                              className="relative h-28 w-full overflow-hidden cursor-pointer"
                            >
                              <img
                                src={tpl.heroImage}
                                alt={tpl.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />

                              {/* Snapshot Badge */}
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-2xs backdrop-blur-xs max-w-[150px] truncate">
                                {tpl.badge}
                              </span>

                              {/* Snapshot Headline */}
                              <div className="absolute bottom-2 left-2 right-2 text-white font-bold text-[11px] leading-tight drop-shadow-xs truncate">
                                {tpl.headline}
                              </div>

                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                                <Eye className="h-3.5 w-3.5 text-blue-400" />
                                <span className="text-[11px] font-semibold">Inspect Snapshot</span>
                              </div>
                            </div>
                          </div>

                          {/* Template Details */}
                          <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
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

                              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {tpl.description}
                              </p>

                              {/* Top 2 Services Sample Pills */}
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {tpl.servicesSample?.slice(0, 2).map((svc: string, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9.5px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[135px]"
                                  >
                                    {svc}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => {
                                  const preset = TEMPLATE_LANDING_CONFIGS[tpl.slug];
                                  if (preset) {
                                    setLandingConfig({ ...preset });
                                    setPresetNotice(`Loaded "${preset.businessName}" preset! Click "Save & Publish" below to persist changes.`);
                                    setTimeout(() => setPresetNotice(null), 6000);
                                  }
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-semibold transition text-center cursor-pointer shadow-2xs"
                              >
                                Load Preset
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
                                title={`Open live site for ${tpl.name}`}
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


                {/* Multi-Landing Page Quota & Tier Management Banner */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Workspace Landing Pages ({landingPageLimits.currentCount} / {landingPageLimits.totalAllowed} Allocated)
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase">
                          {landingPageLimits.planTier} Plan
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Starter includes 1 page, Growth includes 3 pages, and Scale includes 7 pages. Need more? Add unlimited extra pages for $100 one-time each.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePurchaseExtraLandingPage}
                        disabled={isPurchasingAddon}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-semibold transition shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Add 1 additional landing page slot to your workspace for $100 one-time fee"
                      >
                        {isPurchasingAddon ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Buy Extra Slot ($100)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (landingPageLimits.currentCount >= landingPageLimits.totalAllowed) {
                            alert(`You have reached your plan limit of ${landingPageLimits.totalAllowed} landing page(s). Click "Buy Extra Slot ($100)" to add another landing page.`);
                            return;
                          }
                          setShowNewPageModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Landing Page</span>
                      </button>
                    </div>
                  </div>

                  {addonSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{addonSuccessMsg}</span>
                    </div>
                  )}

                  {addonErrorMsg && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{addonErrorMsg}</span>
                    </div>
                  )}

                  {/* Quota Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Pages used: {landingPageLimits.currentCount} of {landingPageLimits.totalAllowed} slots</span>
                      <span className="font-mono font-medium">
                        {landingPageLimits.extraSlots > 0 && `(${landingPageLimits.extraSlots} extra slot${landingPageLimits.extraSlots > 1 ? 's' : ''} purchased)`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((landingPageLimits.currentCount / Math.max(1, landingPageLimits.totalAllowed)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Landing Pages Switcher Pills */}
                  {allLandingPages.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        Select Page to Edit / Configure:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allLandingPages.map((pg) => {
                          const isSelected = landingConfig.slug === pg.slug || landingConfig.id === pg.id;
                          return (
                            <button
                              key={pg.slug || pg.id}
                              type="button"
                              onClick={() => {
                                setLandingConfig({ ...pg });
                                setPresetNotice('Switched active editor to: ' + pg.businessName);
                                setTimeout(() => setPresetNotice(null), 3000);
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <Globe className="w-3.5 h-3.5 opacity-70" />
                              <span>{pg.businessName}</span>
                              <span className="text-[10px] font-mono opacity-70">/site/{pg.slug}</span>
                              {pg.customDomain && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                                  {pg.customDomain}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* All Published Landing Pages Directory Cards */}
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span>Workspace Landing Pages Directory ({allLandingPages.length})</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Live &amp; Accessible
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {allLandingPages.map((pg) => {
                            const isCurrent = landingConfig.slug === pg.slug || landingConfig.id === pg.id;
                            return (
                              <div
                                key={pg.slug || pg.id}
                                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                                  isCurrent
                                    ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/30'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {pg.businessName}
                                    </span>
                                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      {pg.industry || 'general'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    /site/{pg.slug}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLandingConfig({ ...pg });
                                      setPresetNotice('Switched active editor to: ' + pg.businessName);
                                      setTimeout(() => setPresetNotice(null), 3000);
                                    }}
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                                      isCurrent
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    {isCurrent ? 'Editing' : 'Edit'}
                                  </button>
                                  <a
                                    href={`/site/${pg.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition"
                                    title="Open live landing page in new tab"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Site URL Banner */}
                <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Your Public Business Website is Live</div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-300 font-mono mt-0.5">
                        {typeof window !== 'undefined' ? `${window.location.origin}/site/${landingConfig.slug || activeAssistant?.id || 'demo-assistant'}` : `/site/${landingConfig.slug || 'demo-assistant'}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/site/${landingConfig.slug || activeAssistant?.id || 'demo-assistant'}`;
                        navigator.clipboard.writeText(url);
                        setCopiedLandingUrl(true);
                        setTimeout(() => setCopiedLandingUrl(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
                    >
                      {copiedLandingUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                      <span>{copiedLandingUrl ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {presetNotice && (
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2 font-medium">
                    <Info className="h-4 w-4 shrink-0 text-blue-600" />
                    <span>{presetNotice}</span>
                  </div>
                )}

                {saveLandingSuccess && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Landing page configuration successfully saved and published!</span>
                  </div>
                )}

                {saveLandingError && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{saveLandingError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveLandingConfig} className="space-y-6">
                  {/* General Business Info */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <span>Business Identity &amp; URL</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                        <input
                          type="text"
                          required
                          value={landingConfig.businessName || ''}
                          onChange={(e) => setLandingConfig({ ...landingConfig, businessName: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Website URL Slug (/site/[slug])</label>
                        <input
                          type="text"
                          required
                          value={landingConfig.slug || ''}
                          onChange={(e) => setLandingConfig({ ...landingConfig, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tagline / Subtitle</label>
                      <input
                        type="text"
                        value={landingConfig.tagline || ''}
                        onChange={(e) => setLandingConfig({ ...landingConfig, tagline: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trust Badge Text (Top Banner)</label>
                      <input
                        type="text"
                        value={landingConfig.badgeText || ''}
                        onChange={(e) => setLandingConfig({ ...landingConfig, badgeText: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Industry Type</label>
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
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Accent Theme Color</label>
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
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Hero Section Content */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Hero Section Copy &amp; Imagery</span>
                    </h2>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hero Main Headline</label>
                      <input
                        type="text"
                        value={landingConfig.heroHeadline || ''}
                        onChange={(e) => setLandingConfig({ ...landingConfig, heroHeadline: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hero Subheadline</label>
                      <textarea
                        rows={2}
                        value={landingConfig.heroSubheadline || ''}
                        onChange={(e) => setLandingConfig({ ...landingConfig, heroSubheadline: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={landingConfig.heroCtaText || ''}
                          onChange={(e) => setLandingConfig({ ...landingConfig, heroCtaText: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hero Image URL</label>
                        <input
                          type="url"
                          value={landingConfig.heroImageUrl || ''}
                          onChange={(e) => setLandingConfig({ ...landingConfig, heroImageUrl: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location Info */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-500" />
                      <span>Contact &amp; Location Information</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={landingConfig.phone || ''}
                          onChange={(e) => setLandingConfig({ ...landingConfig, phone: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                        <input
                          type="email"
                          value={landingConfig.email || ''}
                          onChange={(e) => setLandingConfig({ ...landingConfig, email: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Maps Link</label>
                        <input
                          type="url"
                          value={landingConfig.googleMapsUrl || ''}
                          onChange={(e) => setLandingConfig({ ...landingConfig, googleMapsUrl: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Physical Address</label>
                      <input
                        type="text"
                        value={landingConfig.address || ''}
                        onChange={(e) => setLandingConfig({ ...landingConfig, address: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Custom Domain Linking */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-500" />
                        <span>Custom Domain Linking</span>
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        SSL Auto-Provisioned
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Connect your branded domain (e.g. <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">booking.yourbrand.com</span> or <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">mybarbershop.com</span>). Your landing page will be served directly under your custom domain with zero Kortex branding.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custom Domain Name</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="booking.yourbrand.com"
                            value={landingConfig.customDomain || ''}
                            onChange={(e) => setLandingConfig({ ...landingConfig, customDomain: e.target.value.toLowerCase().trim() })}
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
                          <span>Required DNS Configuration at your Registrar (GoDaddy, Namecheap, Cloudflare)</span>
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
                              onClick={() => {
                                navigator.clipboard.writeText('domains.kortexai.com');
                              }}
                              className="text-blue-500 hover:text-blue-600 p-1"
                              title="Copy Target"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                          For root apex domains (e.g. <span className="font-mono">yourbrand.com</span>), point an A record to <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">76.76.21.21</span>. Changes typically propagate within 5 to 15 minutes.
                        </p>
                      </div>
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

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Optimize how your business landing page ranks on Google, Bing, and shows up when shared on WhatsApp, Facebook, iMessage, and Slack.
                    </p>

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
                            placeholder={landingConfig.businessName ? (landingConfig.businessName + ' | Official Booking & Services') : 'Crown & Blade Barbershop | New York'}
                            value={landingConfig.seo?.metaTitle || ''}
                            onChange={(e) => setLandingConfig({
                              ...landingConfig,
                              seo: { ...landingConfig.seo, metaTitle: e.target.value },
                            })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Keywords (Comma Separated)</label>
                            <span className="text-[10px] text-slate-400">Search ranking</span>
                          </div>
                          <input
                            type="text"
                            placeholder="barbershop, haircut, beard trim, new york grooming"
                            value={landingConfig.seo?.metaKeywords || ''}
                            onChange={(e) => setLandingConfig({
                              ...landingConfig,
                              seo: { ...landingConfig.seo, metaKeywords: e.target.value },
                            })}
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
                          placeholder={landingConfig.heroSubheadline || 'Book master haircut, hot-towel shaves, and grooming appointments online 24/7 with instant confirmation.'}
                          value={landingConfig.seo?.metaDescription || ''}
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            seo: { ...landingConfig.seo, metaDescription: e.target.value },
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">OpenGraph Social Share Image URL</label>
                          <input
                            type="url"
                            placeholder="https://example.com/og-preview.jpg"
                            value={landingConfig.seo?.ogImageUrl || ''}
                            onChange={(e) => setLandingConfig({
                              ...landingConfig,
                              seo: { ...landingConfig.seo, ogImageUrl: e.target.value },
                            })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Canonical URL Override (Optional)</label>
                          <input
                            type="url"
                            placeholder="https://yourbrand.com/official"
                            value={landingConfig.seo?.canonicalUrl || ''}
                            onChange={(e) => setLandingConfig({
                              ...landingConfig,
                              seo: { ...landingConfig.seo, canonicalUrl: e.target.value },
                            })}
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
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                            <span>https://{landingConfig.customDomain || 'kortexai.com/site/' + (landingConfig.slug || 'demo')}</span>
                          </div>
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                            {landingConfig.seo?.metaTitle || landingConfig.businessName || 'Your Business Name'} | Official Booking &amp; Services
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {landingConfig.seo?.metaDescription || landingConfig.heroSubheadline || 'Book services, view transparent pricing, and schedule appointments online 24/7 with our AI concierge.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meta Pixels & Google Analytics */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="h-4 w-4 text-cyan-500" />
                        <span>Meta Pixels &amp; Google Analytics</span>
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                        Ad Attribution &amp; Conversion Tracking
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Inject tracking scripts automatically into your landing page head. Track conversions from Meta (Facebook &amp; Instagram Ads) and Google Ads without touching any code.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Google Analytics 4 Measurement ID
                        </label>
                        <input
                          type="text"
                          placeholder="G-XXXXXXXXXX"
                          value={landingConfig.analytics?.googleAnalyticsId || ''}
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            analytics: { ...landingConfig.analytics, googleAnalyticsId: e.target.value.trim() },
                          })}
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
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            analytics: { ...landingConfig.analytics, metaPixelId: e.target.value.trim() },
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Found in Meta Events Manager &gt; Data Sources</span>
                      </div>
                    </div>

                    {/* Standard Events Tracked Indicator */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Automatically Dispatched Standard Events:
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">PageView</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">ViewContent (Services)</span>
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">InitiateCheckout (Booking Modal)</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Schedule / Lead (Appointment Booked)</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Accounts & Icons */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-pink-500" />
                        <span>Social Media Accounts &amp; Public Icons</span>
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                        Header &amp; Footer Display
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Add links to your official social media pages. Clean vector icons will automatically appear in your landing page navigation bar and footer so visitors can follow and engage with your brand.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Instagram */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-pink-600 font-bold">Instagram</span>
                          </label>
                          {landingConfig.socialLinks?.instagram && (
                            <a
                              href={landingConfig.socialLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] text-pink-600 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> Test
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://instagram.com/yourhandle"
                          value={landingConfig.socialLinks?.instagram || ''}
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            socialLinks: { ...landingConfig.socialLinks, instagram: e.target.value.trim() },
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Facebook */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">Facebook</span>
                          </label>
                          {landingConfig.socialLinks?.facebook && (
                            <a
                              href={landingConfig.socialLinks.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> Test
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://facebook.com/yourpage"
                          value={landingConfig.socialLinks?.facebook || ''}
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            socialLinks: { ...landingConfig.socialLinks, facebook: e.target.value.trim() },
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* X / Twitter */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-slate-900 dark:text-white font-bold">X / Twitter</span>
                          </label>
                          {landingConfig.socialLinks?.twitter && (
                            <a
                              href={landingConfig.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] text-blue-400 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> Test
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://x.com/yourhandle"
                          value={landingConfig.socialLinks?.twitter || ''}
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            socialLinks: { ...landingConfig.socialLinks, twitter: e.target.value.trim() },
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* LinkedIn */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-sky-600 font-bold">LinkedIn</span>
                          </label>
                          {landingConfig.socialLinks?.linkedin && (
                            <a
                              href={landingConfig.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] text-sky-600 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> Test
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/company/yourbrand"
                          value={landingConfig.socialLinks?.linkedin || ''}
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            socialLinks: { ...landingConfig.socialLinks, linkedin: e.target.value.trim() },
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* YouTube */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-red-600 font-bold">YouTube</span>
                          </label>
                          {landingConfig.socialLinks?.youtube && (
                            <a
                              href={landingConfig.socialLinks.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] text-red-600 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> Test
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://youtube.com/@yourchannel"
                          value={landingConfig.socialLinks?.youtube || ''}
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            socialLinks: { ...landingConfig.socialLinks, youtube: e.target.value.trim() },
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* TikTok */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="text-slate-900 dark:text-white font-bold">TikTok</span>
                          </label>
                          {landingConfig.socialLinks?.tiktok && (
                            <a
                              href={landingConfig.socialLinks.tiktok}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="h-2.5 w-2.5" /> Test
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://tiktok.com/@yourhandle"
                          value={landingConfig.socialLinks?.tiktok || ''}
                          onChange={(e) => setLandingConfig({
                            ...landingConfig,
                            socialLinks: { ...landingConfig.socialLinks, tiktok: e.target.value.trim() },
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Live Social Icon Preview Pill */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                          Live Navigation &amp; Footer Preview
                        </span>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                          {Object.values(landingConfig.socialLinks || {}).filter(Boolean).length > 0
                            ? `${Object.values(landingConfig.socialLinks || {}).filter(Boolean).length} social profile(s) connected`
                            : 'No social channels configured yet. Fill any inputs above to display icons.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                        <span className="text-[10px] text-slate-400 font-mono pr-1">Preview:</span>
                        {landingConfig.socialLinks?.instagram && (
                          <span className="p-1 rounded bg-pink-50 dark:bg-pink-950/40 text-pink-600" title="Instagram">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                          </span>
                        )}
                        {landingConfig.socialLinks?.facebook && (
                          <span className="p-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600" title="Facebook">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          </span>
                        )}
                        {landingConfig.socialLinks?.twitter && (
                          <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" title="X / Twitter">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </span>
                        )}
                        {landingConfig.socialLinks?.linkedin && (
                          <span className="p-1 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-600" title="LinkedIn">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          </span>
                        )}
                        {landingConfig.socialLinks?.youtube && (
                          <span className="p-1 rounded bg-red-50 dark:bg-red-950/40 text-red-600" title="YouTube">
                            <Youtube className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {landingConfig.socialLinks?.tiktok && (
                          <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" title="TikTok">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.42-.04 2.71-.97 3.14-2.31.25-.72.31-1.49.31-2.25V.02h-.03z"/></svg>
                          </span>
                        )}
                        {(!landingConfig.socialLinks || Object.values(landingConfig.socialLinks).every((v) => !v)) && (
                          <span className="text-[11px] text-slate-400 italic">None active</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services & Pricing Editor */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-amber-500" />
                        <span>Services &amp; Pricing Menu</span>
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          const newService = {
                            id: 'srv_' + Math.random().toString(36).substring(2, 9),
                            name: 'New Custom Service',
                            description: 'Service description and consultation details.',
                            durationMinutes: 30,
                            price: 40,
                          };
                          setLandingConfig({
                            ...landingConfig,
                            services: [...(landingConfig.services || []), newService],
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Service</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(landingConfig.services || []).map((service, sIdx) => (
                        <div key={service.id || sIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              value={service.name}
                              placeholder="Service Name"
                              onChange={(e) => {
                                const next = [...(landingConfig.services || [])];
                                next[sIdx].name = e.target.value;
                                setLandingConfig({ ...landingConfig, services: next });
                              }}
                              className="font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white flex-1"
                            />
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
                                className="w-16 font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white text-right"
                              />
                            </div>
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
                            <button
                              type="button"
                              onClick={() => {
                                const next = (landingConfig.services || []).filter((_, i) => i !== sIdx);
                                setLandingConfig({ ...landingConfig, services: next });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Delete service"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={service.description}
                            placeholder="Brief description for clients"
                            onChange={(e) => {
                              const next = [...(landingConfig.services || [])];
                              next[sIdx].description = e.target.value;
                              setLandingConfig({ ...landingConfig, services: next });
                            }}
                            className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Starter Questions / Quick Prompts for Chat Widget */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span>Chatbot Starter Questions (Auto-Sent on Click)</span>
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          const currentQuestions = landingConfig.starterQuestions || [];
                          setLandingConfig({
                            ...landingConfig,
                            starterQuestions: [...currentQuestions, 'New quick question?'],
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      These prompt chips appear inside the chatbot widget on your hosted website. When clicked, the question is instantly sent into the chat and answered using your business knowledge base.
                    </p>
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
                            placeholder="e.g. What are your prices?"
                            className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = (landingConfig.starterQuestions || []).filter((_, i) => i !== qIdx);
                              setLandingConfig({ ...landingConfig, starterQuestions: next });
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 transition"
                            title="Remove question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingLanding}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
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
                              const preset = TEMPLATE_LANDING_CONFIGS[inspectingSnapshot.slug];
                              if (preset) {
                                setLandingConfig({ ...preset });
                                setPresetNotice(`Loaded "${preset.businessName}" preset! Click "Save & Publish" below.`);
                                setTimeout(() => setPresetNotice(null), 6000);
                              }
                              setInspectingSnapshot(null);
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
              </div>
  );
};

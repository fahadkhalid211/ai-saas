'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState } from 'react';
import {
  Globe,
  Plus,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  CreditCard,
  RefreshCw,
  Sparkles,
  Bot,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Scissors,
  Dumbbell,
  Home,
  ShoppingBag,
  Briefcase,
  Scale,
  Activity,
  X,
  Eye,
  LayoutTemplate,
} from 'lucide-react';
import { LandingPageConfig } from '@/lib/landing/types';

import { DeleteLandingPageModal } from './DeleteLandingPageModal';

interface LandingPagesListProps {
  allLandingPages: LandingPageConfig[];
  landingPageLimits: {
    planTier: string;
    baseLimit: number;
    extraSlots: number;
    totalAllowed: number;
    currentCount: number;
  };
  isPurchasingAddon: boolean;
  handlePurchaseExtraLandingPage: () => Promise<void>;
  handleStartCreateWizard: () => void;
  handleSelectPageForEdit: (page: LandingPageConfig) => void;
  handleDeleteLandingPage?: (pageIdOrSlug?: string | LandingPageConfig) => Promise<void> | void;
  handleQuickUpdateKnowledgeBase: (pageIdOrSlug: string, assistantId: string) => Promise<void>;
  assistants?: any[];
  setActiveAssistant?: (ast: any) => void;
  setActiveTab?: (tab: any) => void;
  deletingPageId?: string | null;
  isDeletingLandingPage?: boolean;
  deleteProgress?: number;
  deleteStatusMessage?: string;
  pagePendingDelete?: LandingPageConfig | null;
  setPagePendingDelete?: (page: LandingPageConfig | null) => void;
  handleConfirmDeleteLandingPage?: () => Promise<void> | void;
}

function IndustryBadge({ industry }: { industry?: string }) {
  const ind = (industry || '').toLowerCase();
  let label = 'Business Service';
  let Icon = Sparkles;
  let color = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';

  if (ind.includes('barber') || ind.includes('salon')) {
    label = 'Grooming & Salon';
    Icon = Scissors;
    color = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
  } else if (ind.includes('gym') || ind.includes('fitness')) {
    label = 'Gym & Fitness';
    Icon = Dumbbell;
    color = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
  } else if (ind.includes('estate') || ind.includes('property')) {
    label = 'Real Estate';
    Icon = Home;
    color = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
  } else if (ind.includes('ecom') || ind.includes('retail')) {
    label = 'Retail Store';
    Icon = ShoppingBag;
    color = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900';
  } else if (ind.includes('saas') || ind.includes('tech')) {
    label = 'B2B Software';
    Icon = Briefcase;
    color = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
  } else if (ind.includes('legal') || ind.includes('law')) {
    label = 'Legal Firm';
    Icon = Scale;
    color = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
  } else if (ind.includes('health') || ind.includes('clinic') || ind.includes('dental')) {
    label = 'Healthcare Clinic';
    Icon = Activity;
    color = 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${color}`}>
      <Icon className="h-3 w-3" />
      <span><T>{label}</T></span>
    </span>
  );
}

export function LandingPagesList({
  allLandingPages,
  landingPageLimits,
  isPurchasingAddon,
  handlePurchaseExtraLandingPage,
  handleStartCreateWizard,
  handleSelectPageForEdit,
  handleDeleteLandingPage,
  handleQuickUpdateKnowledgeBase,
  assistants = [],
  setActiveAssistant,
  setActiveTab,
  deletingPageId,
  isDeletingLandingPage,
  deleteProgress = 0,
  deleteStatusMessage = '',
  pagePendingDelete,
  setPagePendingDelete,
  handleConfirmDeleteLandingPage,
}: LandingPagesListProps) {
  const __t = useT();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLiveLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/site/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isAtQuota = landingPageLimits.currentCount >= landingPageLimits.totalAllowed;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header & Quota Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span><T>Landing Pages</T></span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <T>Multi-Site Studio</T>
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <T>Manage your hosted websites, live links, service menus, and connect isolated AI knowledge bases.</T>
              </p>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleStartCreateWizard}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
          >
            <LayoutTemplate className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span><T>Browse Templates</T></span>
          </button>
          <button
            type="button"
            onClick={handleStartCreateWizard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span><T>+ Create Landing Page with AI</T></span>
          </button>
        </div>
      </div>

      {/* Quota & Capacity Banner */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white"><T>Workspace Website Quota</T></span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {landingPageLimits.currentCount} <T>of</T> {landingPageLimits.totalAllowed} <T>page</T>{landingPageLimits.totalAllowed !== 1 ? 's' : ''} <T>used</T>
            </span>
            <span className="text-[10.5px] uppercase font-semibold text-blue-600 dark:text-blue-400">
              ({landingPageLimits.planTier} <T>Tier)</T>
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isAtQuota ? 'bg-amber-500' : 'bg-blue-600'}`}
              style={{
                width: `${Math.min(100, Math.round((landingPageLimits.currentCount / Math.max(1, landingPageLimits.totalAllowed)) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Add-on Slot Purchase */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePurchaseExtraLandingPage}
            disabled={isPurchasingAddon}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            title={__t("Add 1 extra landing page slot for $100")}
          >
            {isPurchasingAddon ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                <span><T>Processing...</T></span>
              </>
            ) : (
              <>
                <CreditCard className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span><T>+ Extra Slot ($100)</T></span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Landing Pages Collection */}
      {allLandingPages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <Globe className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white"><T>No Landing Pages Designed Yet</T></h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <T>Launch an AI-designed high-conversion business website with appointment booking and concierge in under 60 seconds.</T>
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartCreateWizard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span><T>Create Your First Landing Page with AI</T></span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allLandingPages.map((page) => {
            const pageId = page.id || page.slug;
            const liveUrl = `/site/${page.slug}`;
            const isCopied = copiedId === page.slug;
            const connectedBot = assistants.find((a) => a.id === page.assistantId);

            return (
              <div
                key={pageId}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 transition shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Hero Image Header */}
                  <div className="h-36 w-full relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={page.heroImageUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'}
                      alt={page.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status & Industry Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <IndustryBadge industry={page.industry} />
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span><T>Live</T></span>
                      </span>
                    </div>

                    {/* Site Title Overlay */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="text-sm font-bold text-white truncate drop-shadow-sm">
                        {page.businessName || <T>{'Business Website'}</T>}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-200 font-mono truncate mt-0.5">
                        <span><T>/site/</T>{page.slug}</span>
                        {page.customDomain && (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                            {page.customDomain}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-4">
                    {/* Tagline / Headline */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {page.heroHeadline || <T>{page.tagline}</T> || <T>{'High-converting business website with instant scheduling and AI customer care.'}</T>}
                    </p>

                    {/* Live Link & Copy Box */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        <T>/site/</T>{page.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyLiveLink(page.slug)}
                        className="flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
                      >
                        {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{isCopied ? <T>{'Copied'}</T> : <T>{'Copy'}</T>}</span>
                      </button>
                    </div>

                    {/* Dedicated AI Concierge & Knowledge Base Dropdown on the Card */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Bot className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span><T>Connected Knowledgebase</T></span>
                        </label>
                        {page.assistantId ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span><T>Isolated</T></span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium"><T>No bot</T></span>
                        )}
                      </div>

                      <select
                        value={page.assistantId || ''}
                        onChange={(e) => handleQuickUpdateKnowledgeBase(pageId, e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                      >
                        <option value="">{__t("None / Disconnected (No Chatbot)")}</option>
                        {assistants.length > 0 && (
                          <optgroup label="Available AI Assistants">
                            {assistants.map((ast) => (
                              <option key={ast.id} value={ast.id}>
                                {ast.name} ({ast.id})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>

                      {connectedBot && setActiveAssistant && setActiveTab && (
                        <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-0.5">
                          <span><T>Bot:</T> <T>{connectedBot.name}</T></span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAssistant(connectedBot);
                              setActiveTab('knowledge');
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                          >
                            <T>Manage Documents</T>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title={__t("Open Live Website in New Tab")}
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span><T>View</T></span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSelectPageForEdit(page)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                      title={__t("Edit Every Text, Image, Services and SEO for this page")}
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span><T>Edit Page</T></span>
                    </button>
                  </div>

                  {handleDeleteLandingPage && (
                    <button
                      type="button"
                      disabled={Boolean(deletingPageId)}
                      onClick={() => handleDeleteLandingPage(page)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer disabled:opacity-50"
                      title={__t("Delete this landing page")}
                    >
                      {deletingPageId && (deletingPageId === page.id || deletingPageId === page.slug) ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Deleting Progress Overlay on Card */}
                {deletingPageId && (deletingPageId === page.id || deletingPageId === page.slug) && (
                  <div className="absolute inset-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center animate-in fade-in duration-150">
                    <RefreshCw className="h-7 w-7 text-rose-600 dark:text-rose-400 animate-spin mb-2" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      <T>Deleting Landing Page...</T>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 max-w-[220px] truncate">
                      {deleteStatusMessage || <T>{'Unbinding routes...'}</T>}
                    </p>
                    <div className="w-48 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3 border border-slate-200 dark:border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, deleteProgress)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">
                      {deleteProgress}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Delete Confirmation & Progress Modal */}
      <DeleteLandingPageModal
        isOpen={Boolean(pagePendingDelete)}
        page={pagePendingDelete || null}
        isDeleting={Boolean(isDeletingLandingPage)}
        progress={deleteProgress}
        statusMessage={deleteStatusMessage}
        onClose={() => setPagePendingDelete?.(null)}
        onConfirm={() => handleConfirmDeleteLandingPage?.()}
      />
    </div>
  );
}

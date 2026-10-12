'use client';

import { T, useT } from '@/lib/i18n/context';
import React from 'react';
import { Globe, X, Plus } from 'lucide-react';

export interface NewLandingPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  newPageName: string;
  setNewPageName: (name: string) => void;
  newPageSlug: string;
  setNewPageSlug: (slug: string) => void;
  newPageIndustry: string;
  setNewPageIndustry: (industry: string) => void;
  assistants?: any[];
  newPageAssistantId?: string;
  setNewPageAssistantId?: (id: string) => void;
  existingPagesCount?: number;
}

export const NewLandingPageModal: React.FC<NewLandingPageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newPageName,
  setNewPageName,
  newPageSlug,
  setNewPageSlug,
  newPageIndustry,
  setNewPageIndustry,
  assistants = [],
  newPageAssistantId,
  setNewPageAssistantId,
  existingPagesCount = 0,
}) => {
  const __t = useT();
  if (!isOpen) return null;

  const defaultAstId = assistants[0]?.id || 'demo-assistant';
  const selectedAstId = newPageAssistantId || defaultAstId;
  const isFirstPage = existingPagesCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white"><T>Create New Landing Page</T></h3>
              <p className="text-xs text-slate-500"><T>Add a dedicated hosted website for your business or campaign.</T></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"><T>Business Name</T></label>
            <input
              type="text"
              required
              placeholder={__t("e.g. Apex Health & Aesthetics")}
              value={newPageName}
              onChange={(e) => {
                setNewPageName(e.target.value);
                if (!newPageSlug) {
                  setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"><T>URL Slug (/site/[slug])</T></label>
            <input
              type="text"
              required
              placeholder={__t("e.g. apex-health")}
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"><T>Base Industry Template</T></label>
            <select
              value={newPageIndustry}
              onChange={(e) => setNewPageIndustry(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="barbershop">{__t("Barbershop & Grooming Salon")}</option>
              <option value="gym">{__t("Fitness & Athletics Gym")}</option>
              <option value="real_estate">{__t("Prestige Living Real Estate")}</option>
              <option value="ecommerce">{__t("LuxeLiving Retail E-Commerce")}</option>
              <option value="saas">{__t("CloudScale B2B SaaS")}</option>
              <option value="legal">{__t("Sterling & Vance Legal Counsel")}</option>
              <option value="healthcare">{__t("Beacon Family Dental Clinic")}</option>
              <option value="nexus-ai">{__t("Nexus AI Technology Platform")}</option>
              <option value="hyperion-agency">{__t("Hyperion Creative Agency")}</option>
              <option value="aether-finance">{__t("Aether Finance & Wealth Management")}</option>
              <option value="custom">{__t("Custom Blank Canvas (Modular Skeleton)")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <T>AI Chatbot &amp; Knowledge Base</T>
            </label>
            <select
              value={selectedAstId}
              onChange={(e) => setNewPageAssistantId?.(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {assistants && assistants.map((ast) => (
                <option key={ast.id} value={ast.id}>
                  {isFirstPage ? 'Connect default knowledge base: ' : 'Use existing knowledge base: '}{ast.name} ({ast.id})
                </option>
              ))}
              {!isFirstPage && (
                <option value="auto_create">
                  {__t("Create new knowledge base (dedicated bot for this page)")}
                </option>
              )}
              <option value="none">
                {__t("No chatbot (website only)")}
              </option>
            </select>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
              {isFirstPage
                ? <T>{'Your first landing page connects to your default knowledge base so your trained documents and FAQs are immediately used.'}</T>
                : selectedAstId === 'auto_create'
                ? <T>{'A new dedicated assistant will be created with an isolated knowledge base exclusively for this page.'}</T>
                : <T>{'Reuses documents and training data from your selected assistant without creating extra bots.'}</T>}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <T>Cancel</T>
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span><T>Create Landing Page</T></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

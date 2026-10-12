'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState, useMemo } from 'react';
import {
  LayoutTemplate,
  Search,
  Check,
  RefreshCw,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Scissors,
  Dumbbell,
  Home,
  ShoppingBag,
  Briefcase,
  Scale,
  Activity,
  Palette,
  TrendingUp,
  Layers,
  Bot,
  Globe,
  BookOpen,
} from 'lucide-react';
import { BOT_TEMPLATES, BotTemplate } from '@/lib/templates';
import { LandingPageConfig } from '@/lib/landing/types';

export interface TemplatesTabProps {
  templateSuccessMsg?: string | null;
  applyingTemplateId?: string | null;
  handleApplyTemplate?: (templateId: string) => void | Promise<void>;
  assistants?: any[];
  activeAssistant?: any;
  allLandingPages?: any[];
  onSaveLandingPage?: (
    config: LandingPageConfig,
    assistantOption?: 'auto_create' | 'none' | string
  ) => Promise<LandingPageConfig>;
  onOpenEditor?: (config: LandingPageConfig) => void;
  onBackToList?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  templateSuccessMsg,
  applyingTemplateId,
  handleApplyTemplate,
  activeAssistant,
  setActiveTab,
}) => {
  const __t = useT();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const industries = useMemo(() => {
    const set = new Set<string>();
    BOT_TEMPLATES.forEach((t) => set.add(t.industry));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredTemplates = useMemo(() => {
    return BOT_TEMPLATES.filter((tmpl) => {
      const matchesIndustry =
        selectedIndustry === 'all' || tmpl.industry === selectedIndustry;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tmpl.name.toLowerCase().includes(q) ||
        tmpl.industry.toLowerCase().includes(q) ||
        tmpl.description.toLowerCase().includes(q) ||
        tmpl.tagline.toLowerCase().includes(q);
      return matchesIndustry && matchesSearch;
    });
  }, [searchQuery, selectedIndustry]);

  const renderTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scissors':
        return <Scissors className="h-5 w-5 text-amber-500" />;
      case 'Dumbbell':
        return <Dumbbell className="h-5 w-5 text-rose-500" />;
      case 'Home':
        return <Home className="h-5 w-5 text-emerald-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="h-5 w-5 text-indigo-500" />;
      case 'Briefcase':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case 'Scale':
        return <Scale className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
      case 'Activity':
        return <Activity className="h-5 w-5 text-sky-500" />;
      case 'Sparkles':
        return <Sparkles className="h-5 w-5 text-indigo-500" />;
      case 'Palette':
        return <Palette className="h-5 w-5 text-fuchsia-500" />;
      case 'TrendingUp':
        return <TrendingUp className="h-5 w-5 text-teal-500" />;
      case 'Layers':
        return <Layers className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bot className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-6xl space-y-6 mx-auto">
      {/* Header Banner with Clean Landing Page Referral */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-slate-900/10 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span><T>AI Bot Personas &amp; Presets</T></span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <T>Industry Bot Templates Library</T>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <T>Configure</T> {activeAssistant?.name ? `"${activeAssistant.name}"` : <T>{'your AI bot'}</T>} <T>with pre-built system prompts, conversation starters, lead capture schemas, and sample knowledge bases.</T>
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {templateSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">{templateSuccessMsg}</span>
        </div>
      )}

      {/* Controls: Search Bar & Industry Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={__t("Search bot templates by industry or keywords...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium self-end sm:self-center">
            <T>Showing</T> {filteredTemplates.length} <T>of</T> {BOT_TEMPLATES.length} <T>templates</T>
          </span>
        </div>

        {/* Industry Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {industries.map((ind) => (
            <button
              key={ind}
              type="button"
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1 rounded-full font-semibold transition shrink-0 cursor-pointer ${
                selectedIndustry === ind
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ind === 'all' ? <T>{'All Industries'}</T> : ind}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tmpl) => {
          const isApplying = applyingTemplateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {renderTemplateIcon(tmpl.icon)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        <T>{tmpl.name}</T>
                      </h3>
                      <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                        {tmpl.industry}
                      </span>
                    </div>
                  </div>
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0 mt-1"
                    style={{ backgroundColor: tmpl.primaryColor }}
                    title={`Theme: ${tmpl.primaryColor}`}
                  />
                </div>

                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
                  <T>{tmpl.tagline}</T>
                </p>

                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <T>{tmpl.description}</T>
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <T>Included Starter Questions:</T>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tmpl.starterQuestions.slice(0, 3).map((q, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 pt-1">
                  {tmpl.bookingEnabled && (
                    <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <Calendar className="h-3 w-3" /> <T>Booking Ready</T>
                    </span>
                  )}
                  {tmpl.collectLeadEmail && (
                    <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                      <Users className="h-3 w-3" /> <T>Lead Capture</T>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {tmpl.sampleKnowledge.length} <T>Sample Docs</T>
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  disabled={isApplying}
                  onClick={() => handleApplyTemplate && handleApplyTemplate(tmpl.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white py-2 text-xs font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span><T>Applying Template...</T></span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span><T>Use This Bot Template</T></span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


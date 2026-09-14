'use client';

import React from 'react';
import {
  LayoutTemplate,
  CheckCircle2,
  Calendar,
  Users,
  RefreshCw,
  Check,
  Dumbbell,
  Home,
  ShoppingBag,
  Briefcase,
  Scale,
  Activity,
  Bot,
} from 'lucide-react';
import { BOT_TEMPLATES } from '@/lib/templates';

export interface TemplatesTabProps {
  templateSuccessMsg: string | null;
  applyingTemplateId: string | null;
  handleApplyTemplate: (templateId: string) => void | Promise<void>;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  templateSuccessMsg,
  applyingTemplateId,
  handleApplyTemplate,
}) => {
  const renderTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell':
        return <Dumbbell className="h-5 w-5 text-rose-500" />;
      case 'Home':
        return <Home className="h-5 w-5 text-emerald-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="h-5 w-5 text-purple-500" />;
      case 'Briefcase':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case 'Scale':
        return <Scale className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
      case 'Activity':
        return <Activity className="h-5 w-5 text-sky-500" />;
      default:
        return <Bot className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-6xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                      <LayoutTemplate className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span>Ready-to-Use Industry Bot Templates</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Instantly configure your assistant with expert system prompts, starter questions, lead fields, and seeded knowledge articles.
                    </p>
                  </div>
                </div>

                {templateSuccessMsg && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-semibold">{templateSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {BOT_TEMPLATES.map((tmpl) => {
                    const isApplying = applyingTemplateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{renderTemplateIcon(tmpl.icon)}</div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tmpl.name}</h3>
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
                            {tmpl.tagline}
                          </p>

                          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {tmpl.description}
                          </p>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              Included Starter Questions:
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
                                <Calendar className="h-3 w-3" /> Booking Ready
                              </span>
                            )}
                            {tmpl.collectLeadEmail && (
                              <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                                <Users className="h-3 w-3" /> Lead Capture
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              {tmpl.sampleKnowledge.length} Sample Docs
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            disabled={isApplying}
                            onClick={() => handleApplyTemplate(tmpl.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white py-2 text-xs font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            {isApplying ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Applying Template...</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Use This Template</span>
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

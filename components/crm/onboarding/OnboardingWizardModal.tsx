'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  MessageSquare,
  Globe,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantName?: string;
  onGoToTab: (tab: string) => void;
  onOpenEmbed: () => void;
}

const STEPS = [
  {
    id: 'knowledge',
    icon: BookOpen,
    label: 'Add Your Content',
    description:
      'Upload documents, paste website links, or add FAQs so your assistant knows how to answer customer questions.',
    action: 'Go to Knowledge Base',
    tab: 'knowledge',
    tip: 'Start with your most common questions — a one-page FAQ is enough to get started.',
  },
  {
    id: 'test',
    icon: MessageSquare,
    label: 'Test It Out',
    description:
      'Chat with your assistant right now to make sure it gives accurate answers before customers see it.',
    action: 'Open Test Chat',
    tab: 'playground',
    tip: 'Ask it something a real customer might ask. If the answer is off, add more content to your Knowledge Base.',
  },
  {
    id: 'deploy',
    icon: Globe,
    label: 'Add to Your Website',
    description:
      'Copy one line of code and paste it into your website. The chat button will appear within seconds.',
    action: 'Get Embed Code',
    tab: 'embed',
    tip: 'Works on any website — HTML, WordPress, Shopify, Webflow, and more.',
  },
];

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  assistantName,
  onGoToTab,
  onOpenEmbed,
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  const handleAction = () => {
    if (current.tab === 'embed') {
      onClose();
      onOpenEmbed();
    } else {
      onGoToTab(current.tab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                Getting Started — Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {assistantName ? `Set up ${assistantName}` : 'Set up your assistant'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step indicator dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === step
                    ? 'w-6 bg-blue-600'
                    : i < step
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Current step card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{current.label}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {current.description}
            </p>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">{current.tip}</p>
            </div>
          </div>

          {/* Completed steps */}
          {step > 0 && (
            <div className="space-y-1.5">
              {STEPS.slice(0, step).map((s) => {
                const DoneIcon = s.icon;
                return (
                  <div key={s.id} className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{s.label} — done</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleAction}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              {current.action}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {!isLast ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Skip
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

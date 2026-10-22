'use client';

import { T, useT } from '@/lib/i18n/context';
import React from 'react';
import { Layers, X, ArrowRight } from 'lucide-react';

export interface LandingPageQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  totalAllowed: number;
  planTier?: string;
  onUpgradePlan?: () => void;
}

export const LandingPageQuotaModal: React.FC<LandingPageQuotaModalProps> = ({
  isOpen,
  onClose,
  currentCount,
  totalAllowed,
  planTier = 'Starter',
  onUpgradePlan,
}) => {
  const __t = useT();
  if (!isOpen || currentCount < totalAllowed) return null;

  const percentage = Math.min(100, Math.round((currentCount / Math.max(1, totalAllowed)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  <T>Landing Page Capacity Reached</T>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {planTier} <T>Tier</T>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <T>Your workspace website allocation is fully utilized.</T>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label={__t("Close modal")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Usage Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300"><T>Allocated Website Slots</T></span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {currentCount} <T>of</T> {totalAllowed} <T>used (</T>{percentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            <T>To publish an additional landing page with a dedicated AI assistant and custom booking calendar, upgrade your plan below.</T>
          </p>
        </div>

        {/* Upgrade & Addon Action Options */}
        <div className="space-y-3">
          {/* Option 2: Subscription Plan Upgrade */}
          {onUpgradePlan && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  <T>Upgrade Workspace Plan</T>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  <T>Get higher landing page limits, increased AI message quotas, and team seats.</T>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpgradePlan();
                }}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                <span><T>View Plans</T></span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <T>Cancel</T>
          </button>
        </div>
      </div>
    </div>
  );
};

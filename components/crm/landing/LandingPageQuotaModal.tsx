'use client';

import React from 'react';
import { Layers, X, CreditCard, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

export interface LandingPageQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  totalAllowed: number;
  planTier?: string;
  onPurchaseExtraSlot: () => Promise<void> | void;
  isPurchasingSlot: boolean;
  onUpgradePlan?: () => void;
}

export const LandingPageQuotaModal: React.FC<LandingPageQuotaModalProps> = ({
  isOpen,
  onClose,
  currentCount,
  totalAllowed,
  planTier = 'Starter',
  onPurchaseExtraSlot,
  isPurchasingSlot,
  onUpgradePlan,
}) => {
  if (!isOpen) return null;

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
                  Landing Page Capacity Reached
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {planTier} Tier
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your workspace website allocation is fully utilized.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Usage Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Allocated Website Slots</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {currentCount} of {totalAllowed} used ({percentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            To publish an additional landing page with a dedicated AI assistant and custom booking calendar, expand your workspace capacity below.
          </p>
        </div>

        {/* Upgrade & Addon Action Options */}
        <div className="space-y-3">
          {/* Option 1: Instant Add-on Slot */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-800 transition space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 dark:text-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Instant Extra Slot Add-on</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Add 1 permanent landing page slot immediately to your active workspace without changing your plan tier.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">$100</span>
                <span className="text-[10px] text-slate-400 block">one-time add-on</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await onPurchaseExtraSlot();
              }}
              disabled={isPurchasingSlot}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPurchasingSlot ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Activating Slot...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>+ Unlock 1 Extra Slot ($100)</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: Subscription Plan Upgrade */}
          {onUpgradePlan && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Upgrade Workspace Plan
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Get higher landing page limits, increased AI message quotas, and team seats.
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
                <span>View Plans</span>
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

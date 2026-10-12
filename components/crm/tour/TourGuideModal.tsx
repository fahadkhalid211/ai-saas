'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
} from 'lucide-react';
import { TOUR_STEPS } from './tourData';

export interface TourGuideModalProps {
  isOpen: boolean;
  stepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onGoToStep: (index: number) => void;
}

export const TourGuideModal: React.FC<TourGuideModalProps> = ({
  isOpen,
  stepIndex,
  onNext,
  onPrev,
  onClose,
  onGoToStep,
}) => {
  const __t = useT();
  const step = TOUR_STEPS[stepIndex];
  const total = TOUR_STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') onNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !step) return null;

  const progressPct = ((stepIndex + 1) / total) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="p-5 space-y-4">

          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                <T>Product Tour</T>
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {stepIndex + 1} / {total}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={__t("Exit tour")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step content */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white"><T>{step.title}</T></h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{step.body}</p>
          </div>

          {/* Highlight hint */}
          {step.highlight && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <MapPin className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">{step.highlight}</p>
            </div>
          )}

          {/* Step dot navigation */}
          <div className="flex items-center gap-1 flex-wrap pt-1">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => onGoToStep(i)}
                className={`rounded-full transition-all cursor-pointer ${
                  i === stepIndex
                    ? 'h-2 w-4 bg-blue-600'
                    : i < stepIndex
                    ? 'h-2 w-2 bg-emerald-400'
                    : 'h-2 w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                title={TOUR_STEPS[i].title}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={onPrev}
              disabled={isFirst}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <T>Back</T>
            </button>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
              <T>Use arrow keys to navigate</T>
            </p>

            {isLast ? (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <T>Finish Tour</T>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <T>Next</T>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

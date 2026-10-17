'use client';

import { useT, T } from '@/lib/i18n/context';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  Compass,
} from 'lucide-react';
import { TOUR_STEPS } from './tourData';

export interface TourGuideModalProps {
  isOpen: boolean;
  stepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: (dontShowAgain?: boolean) => void;
  onGoToStep: (index: number) => void;
  dontShowAgain?: boolean;
  onToggleDontShowAgain?: (val: boolean) => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const TourGuideModal: React.FC<TourGuideModalProps> = ({
  isOpen,
  stepIndex,
  onNext,
  onPrev,
  onClose,
  onGoToStep,
  dontShowAgain = false,
  onToggleDontShowAgain,
}) => {
  const __t = useT();
  const step = TOUR_STEPS[stepIndex];
  const total = TOUR_STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [hasScrolled, setHasScrolled] = useState(false);
  const [localDontShowAgain, setLocalDontShowAgain] = useState(dontShowAgain);

  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalDontShowAgain(dontShowAgain);
  }, [dontShowAgain]);

  const handleToggleDontShowAgain = (val: boolean) => {
    setLocalDontShowAgain(val);
    if (onToggleDontShowAgain) onToggleDontShowAgain(val);
  };

  // Measure and position tooltip next to target element
  const updatePosition = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      // Fallback: If element is not found, place tooltip centered nicely near bottom
      setTargetRect(null);
      setTooltipStyle({
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: '380px',
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    });

    // Scroll element into view if not visible yet
    if (!hasScrolled) {
      const scrollBlock = rect.height > 250 ? 'start' : 'nearest';
      el.scrollIntoView({ behavior: 'smooth', block: scrollBlock, inline: 'nearest' });
      setHasScrolled(true);
    }

    const preferredPos = step.position || 'bottom';
    const tooltipWidth = 370;
    // Measure dynamic rendered height if available to prevent any cutoff
    const measuredHeight = tooltipRef.current?.offsetHeight || 290;
    const margin = 14;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let computedTop = 0;
    let computedLeft = 0;
    let dir: 'top' | 'bottom' | 'left' | 'right' = 'top';

    // For tall elements (such as step 5 widget controls container), align tooltip with top
    const targetCenterY = rect.height > 250 ? rect.top + 20 : rect.top + rect.height / 2;

    if (preferredPos === 'bottom') {
      computedTop = rect.bottom + margin;
      computedLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      dir = 'top'; // Arrow points UP at element

      // If overflows bottom, flip to top
      if (computedTop + measuredHeight > vh - 20) {
        computedTop = Math.max(16, rect.top - measuredHeight - margin);
        dir = 'bottom';
      }
    } else if (preferredPos === 'top') {
      computedTop = rect.top - measuredHeight - margin;
      computedLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      dir = 'bottom'; // Arrow points DOWN at element

      // If overflows top, flip to bottom
      if (computedTop < 16) {
        computedTop = rect.bottom + margin;
        dir = 'top';
      }
    } else if (preferredPos === 'right') {
      computedLeft = rect.right + margin;
      computedTop = targetCenterY - 40;
      dir = 'left'; // Arrow points LEFT at element

      // If overflows right, flip to left or bottom
      if (computedLeft + tooltipWidth > vw - 20) {
        if (rect.left - tooltipWidth - margin > 20) {
          computedLeft = rect.left - tooltipWidth - margin;
          dir = 'right';
        } else {
          // Both overflow: center horizontally
          computedLeft = Math.max(16, Math.min(vw - tooltipWidth - 16, rect.left));
          computedTop = Math.max(16, rect.top + 20);
          dir = 'top';
        }
      }
    } else if (preferredPos === 'left') {
      computedLeft = rect.left - tooltipWidth - margin;
      computedTop = targetCenterY - 40;
      dir = 'right'; // Arrow points RIGHT at element

      if (computedLeft < 16) {
        computedLeft = rect.right + margin;
        dir = 'left';
      }
    }

    // STRICT VIEWPORT CONSTRAINTS: Card can NEVER overflow top, bottom, or sides
    computedLeft = Math.max(16, Math.min(vw - tooltipWidth - 16, computedLeft));
    computedTop = Math.max(16, Math.min(vh - measuredHeight - 20, computedTop));

    setTooltipStyle({
      position: 'fixed',
      top: `${computedTop}px`,
      left: `${computedLeft}px`,
      width: `${tooltipWidth}px`,
      zIndex: 9999,
    });

    // Compute arrow position relative to tooltip
    if (dir === 'top') {
      const arrowLeft = Math.max(24, Math.min(tooltipWidth - 24, rect.left + rect.width / 2 - computedLeft));
      setArrowStyle({
        top: '-7px',
        left: `${arrowLeft}px`,
        transform: 'translateX(-50%) rotate(45deg)',
      });
    } else if (dir === 'bottom') {
      const arrowLeft = Math.max(24, Math.min(tooltipWidth - 24, rect.left + rect.width / 2 - computedLeft));
      setArrowStyle({
        bottom: '-7px',
        left: `${arrowLeft}px`,
        transform: 'translateX(-50%) rotate(45deg)',
      });
    } else if (dir === 'left') {
      const arrowTop = Math.max(24, Math.min(measuredHeight - 24, targetCenterY - computedTop));
      setArrowStyle({
        left: '-7px',
        top: `${arrowTop}px`,
        transform: 'translateY(-50%) rotate(45deg)',
      });
    } else if (dir === 'right') {
      const arrowTop = Math.max(24, Math.min(measuredHeight - 24, targetCenterY - computedTop));
      setArrowStyle({
        right: '-7px',
        top: `${arrowTop}px`,
        transform: 'translateY(-50%) rotate(45deg)',
      });
    }
  }, [isOpen, step, hasScrolled]);

  useEffect(() => {
    setHasScrolled(false);
    // Give tab animation/mounting a small moment to settle
    const timer = setTimeout(updatePosition, 100);
    const interval = setInterval(updatePosition, 300); // keep in sync with resizes/scrolls
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [stepIndex, updatePosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') onNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') onPrev();
      if (e.key === 'Escape') onClose(localDontShowAgain);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onNext, onPrev, onClose, localDontShowAgain]);

  if (!isOpen || !step) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Dark overlay backdrop with transparent cutout spotlight and mouse wheel pass-through */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 9998 }}
        onClick={() => onClose(localDontShowAgain)}
        onWheel={(e) => {
          if (typeof window !== 'undefined') {
            window.scrollBy({ top: e.deltaY, behavior: 'auto' });
          }
        }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White background: fully visible dark overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout over target element: transparent view */}
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(8, 37, 26, 0.74)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Target Element Highlight Glowing Ring */}
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            borderRadius: '12px',
            border: '2.5px solid #abff44',
            boxShadow: '0 0 0 4px rgba(171, 255, 68, 0.25), 0 0 24px rgba(171, 255, 68, 0.45)',
            zIndex: 9998,
          }}
        >
          {/* Animated pulsing beacon corner */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#abff44]"></span>
          </span>
        </div>
      )}

      {/* Interactive Tooltip Card Floating Next to Element */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="pointer-events-auto rounded-2xl bg-white dark:bg-[#08251a] border-2 border-[#abff44] dark:border-[#abff44] shadow-[0_20px_50px_rgba(8,37,26,0.45)] p-5 text-slate-900 dark:text-white transition-all duration-200 max-h-[calc(100vh-32px)] flex flex-col overflow-y-auto"
      >
        {/* Directional Pointer Arrow pointing at element */}
        <div
          style={arrowStyle}
          className="absolute w-3.5 h-3.5 bg-white dark:bg-[#08251a] border-l-2 border-t-2 border-[#abff44] dark:border-[#abff44]"
        />

        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#abff44] text-[#08251a] shadow-xs">
              <Compass className="h-3.5 w-3.5 text-[#08251a]" />
              <span><T>Step</T> {stepIndex + 1} <T>of</T> {total}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onClose(localDontShowAgain)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={__t("Skip tour")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Title & Plain-English Explanation */}
        <div className="space-y-1.5 mb-3 shrink-0">
          <h3 className="text-base font-extrabold text-[#08251a] dark:text-white leading-tight">
            <T>{step.title}</T>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {step.body}
          </p>
        </div>

        {/* Friendly Action Hint */}
        {step.tip && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11.5px] text-amber-900 dark:text-amber-200 leading-snug shrink-0">
            {step.tip}
          </div>
        )}

        {/* Step Progress Dots & Action Buttons */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onGoToStep(idx)}
                aria-label={`Go to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === stepIndex
                    ? 'w-6 bg-[#abff44] shadow-xs'
                    : idx < stepIndex
                    ? 'w-2 bg-[#abff44]/60'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              ></button>
            ))}
          </div>

          {/* Navigation Buttons: Styled Lime Green */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span><T>Back</T></span>
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#abff44] hover:bg-[#bbfd66] text-[#08251a] text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
            >
              <span>{isLast ? <T>{'Finish Tour ✓'}</T> : <T>{'Next Step →'}</T>}</span>
            </button>
          </div>
        </div>

        {/* Don't show again checkbox */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <input
              type="checkbox"
              checked={localDontShowAgain}
              onChange={(e) => handleToggleDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-[#abff44] cursor-pointer"
            />
            <span className="font-medium">{__t("Don't show it again")}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

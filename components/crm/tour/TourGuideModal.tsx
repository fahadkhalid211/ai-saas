'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { TOUR_STEPS, type TourStep } from './tourData';

export interface TourGuideModalProps {
  isOpen: boolean;
  stepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onGoToStep: (index: number) => void;
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
}) => {
  const __t = useT();
  const step = TOUR_STEPS[stepIndex];
  const total = TOUR_STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowDirection, setArrowDirection] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [hasScrolled, setHasScrolled] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);

  // Measure and position tooltip next to target element
  const updatePosition = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      // Fallback: If element is not found, place tooltip centered nicely at bottom
      setTargetRect(null);
      setTooltipStyle({
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
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

    // Scroll element into view if not visible
    if (!hasScrolled) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      setHasScrolled(true);
    }

    const preferredPos = step.position || 'bottom';
    const tooltipWidth = 360;
    const tooltipHeight = 220; // approximate
    const margin = 14;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let computedTop = 0;
    let computedLeft = 0;
    let dir: 'top' | 'bottom' | 'left' | 'right' = 'top';

    if (preferredPos === 'bottom') {
      computedTop = rect.bottom + margin;
      computedLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      dir = 'top'; // Arrow points UP at element

      // If overflows bottom, flip to top
      if (computedTop + tooltipHeight > vh - 20) {
        computedTop = Math.max(10, rect.top - tooltipHeight - margin);
        dir = 'bottom';
      }
    } else if (preferredPos === 'top') {
      computedTop = rect.top - tooltipHeight - margin;
      computedLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      dir = 'bottom'; // Arrow points DOWN at element

      // If overflows top, flip to bottom
      if (computedTop < 10) {
        computedTop = rect.bottom + margin;
        dir = 'top';
      }
    } else if (preferredPos === 'right') {
      computedLeft = rect.right + margin;
      computedTop = rect.top + rect.height / 2 - 80;
      dir = 'left'; // Arrow points LEFT at element

      // If overflows right, flip to bottom or left
      if (computedLeft + tooltipWidth > vw - 20) {
        computedLeft = Math.max(10, rect.left - tooltipWidth - margin);
        dir = 'right';
      }
    } else if (preferredPos === 'left') {
      computedLeft = rect.left - tooltipWidth - margin;
      computedTop = rect.top + rect.height / 2 - 80;
      dir = 'right'; // Arrow points RIGHT at element

      if (computedLeft < 10) {
        computedLeft = rect.right + margin;
        dir = 'left';
      }
    }

    // Keep within viewport horizontally
    computedLeft = Math.max(16, Math.min(vw - tooltipWidth - 16, computedLeft));
    computedTop = Math.max(16, Math.min(vh - tooltipHeight - 16, computedTop));

    setTooltipStyle({
      position: 'fixed',
      top: `${computedTop}px`,
      left: `${computedLeft}px`,
      width: `${tooltipWidth}px`,
      zIndex: 9999,
    });

    setArrowDirection(dir);

    // Compute arrow position relative to tooltip
    if (dir === 'top') {
      const arrowLeft = Math.max(20, Math.min(tooltipWidth - 20, rect.left + rect.width / 2 - computedLeft));
      setArrowStyle({
        top: '-8px',
        left: `${arrowLeft}px`,
        transform: 'translateX(-50%) rotate(45deg)',
      });
    } else if (dir === 'bottom') {
      const arrowLeft = Math.max(20, Math.min(tooltipWidth - 20, rect.left + rect.width / 2 - computedLeft));
      setArrowStyle({
        bottom: '-8px',
        left: `${arrowLeft}px`,
        transform: 'translateX(-50%) rotate(45deg)',
      });
    } else if (dir === 'left') {
      const arrowTop = Math.max(20, Math.min(tooltipHeight - 20, rect.top + rect.height / 2 - computedTop));
      setArrowStyle({
        left: '-8px',
        top: `${arrowTop}px`,
        transform: 'translateY(-50%) rotate(45deg)',
      });
    } else if (dir === 'right') {
      const arrowTop = Math.max(20, Math.min(tooltipHeight - 20, rect.top + rect.height / 2 - computedTop));
      setArrowStyle({
        right: '-8px',
        top: `${arrowTop}px`,
        transform: 'translateY(-50%) rotate(45deg)',
      });
    }
  }, [isOpen, step, hasScrolled]);

  useEffect(() => {
    setHasScrolled(false);
    // Give tab animation/mounting a small moment to settle
    const timer = setTimeout(updatePosition, 100);
    const interval = setInterval(updatePosition, 400); // keep in sync with resizes/scrolls
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
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !step) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Dark overlay backdrop with transparent cutout spotlight */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 9998 }}
        onClick={onClose}
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
          fill="rgba(8, 37, 26, 0.72)"
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
            boxShadow: '0 0 0 4px rgba(171, 255, 68, 0.25), 0 0 24px rgba(171, 255, 68, 0.4)',
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
        className="pointer-events-auto rounded-2xl bg-white dark:bg-[#08251a] border-2 border-[#08251a] dark:border-[#1a4734] shadow-[0_20px_50px_rgba(8,37,26,0.35)] p-5 text-slate-900 dark:text-white transition-all duration-200"
      >
        {/* Directional Pointer Arrow pointing at element */}
        <div
          style={arrowStyle}
          className="absolute w-4 h-4 bg-white dark:bg-[#08251a] border-l-2 border-t-2 border-[#08251a] dark:border-[#1a4734]"
        />

        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#08251a] text-[#abff44] dark:bg-[#1a4734] dark:text-[#abff44]">
              <Compass className="h-3 w-3" />
              <span>Step {stepIndex + 1} of {total}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={__t("Skip tour")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Title & Plain-English Explanation */}
        <div className="space-y-1.5 mb-3.5">
          <h3 className="text-base font-extrabold text-[#08251a] dark:text-white leading-tight">
            {step.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {step.body}
          </p>
        </div>

        {/* Friendly Action Hint */}
        {step.tip && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11.5px] text-amber-900 dark:text-amber-200 leading-snug">
            {step.tip}
          </div>
        )}

        {/* Step Progress Dots & Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                    ? 'w-6 bg-[#08251a] dark:bg-[#abff44]'
                    : idx < stepIndex
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              ></button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#08251a] dark:bg-[#abff44] text-[#abff44] dark:text-[#08251a] text-xs font-bold shadow-sm hover:opacity-90 transition cursor-pointer"
            >
              <span>{isLast ? 'Finish Tour ✓' : 'Next Step →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

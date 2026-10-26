'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/types';
import { ChevronDown, Check } from 'lucide-react';
import { Flag } from './Flag';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'footer' | 'compact' | 'sidebar' | 'header';
  direction?: 'up' | 'down';
  className?: string;
}

export function LanguageSwitcher({ variant = 'navbar', direction, className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const current = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;

  const isFooter = variant === 'footer';
  const isCompact = variant === 'compact';
  const isSidebar = variant === 'sidebar';
  const isHeader = variant === 'header';

  return (
    <div ref={ref} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${dict.switcher.language}: ${current.nativeLabel}`}
        className={`inline-flex items-center gap-1.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          isFooter
            ? 'px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60'
            : isHeader
            ? 'px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-2xs cursor-pointer'
            : isSidebar
            ? 'w-full justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50'
            : isCompact
            ? 'p-1.5 rounded-md text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            : 'px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
        }`}
      >
        <Flag locale={locale} size={20} />
        {/* A flag and the language's own name. Where there is no room (the compact sign-in button, phones in the dashboard header) the name stays for screen readers. */}
        <span className={isCompact ? 'sr-only' : isHeader ? 'sr-only sm:not-sr-only font-medium tracking-tight' : 'font-medium tracking-tight'}>
          {current.nativeLabel}
        </span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={`transition-transform duration-200 opacity-70 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute z-50 w-48 rounded-xl shadow-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-150 ${
            direction === 'up'
              ? 'bottom-full mb-2 right-0'
              : isFooter
              ? 'bottom-full mb-2 left-0'
              : 'right-0 top-full mt-1.5'
          }`}
        >
          <div className="space-y-0.5">
            {(Object.keys(SUPPORTED_LOCALES) as SupportedLocale[]).map((loc) => {
              const info = SUPPORTED_LOCALES[loc];
              const isSelected = locale === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setLocale(loc, true);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Flag locale={loc} size={22} />
                    <span className="font-semibold text-sm">{info.nativeLabel}</span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/types';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'footer' | 'compact' | 'sidebar';
  className?: string;
}

export function LanguageSwitcher({ variant = 'navbar', className = '' }: LanguageSwitcherProps) {
  const { locale, countryInfo, setLocale, dict } = useI18n();
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
            : isSidebar
            ? 'w-full justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50'
            : isCompact
            ? 'p-1.5 rounded-md text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            : 'px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
        }`}
      >
        <span className="text-sm leading-none" aria-hidden="true">
          {current.flag}
        </span>
        <span className="font-medium tracking-tight">
          {isCompact ? current.code.toUpperCase() : current.nativeLabel}
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
          className={`absolute z-50 mt-1.5 w-52 rounded-xl shadow-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-150 ${
            isFooter
              ? 'bottom-full mb-2 left-0'
              : 'right-0 top-full'
          }`}
        >
          {countryInfo && (
            <div className="px-2.5 py-2 mb-1 border-b border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="truncate">{dict.switcher.detectedCountry}:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 ml-1 flex-shrink-0">
                {countryInfo.flag} {countryInfo.name}
              </span>
            </div>
          )}

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
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none" aria-hidden="true">
                      {info.flag}
                    </span>
                    <div>
                      <div className="font-medium text-xs">{info.nativeLabel}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{info.label}</div>
                    </div>
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

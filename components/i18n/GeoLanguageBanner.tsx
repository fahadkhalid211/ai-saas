'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { X, Globe, Check } from 'lucide-react';

export function GeoLanguageBanner() {
  const { bannerVisible, locale, countryInfo, localeInfo, dict, setLocale, dismissBanner } = useI18n();

  if (!bannerVisible || !countryInfo || locale === 'en') {
    return null;
  }

  const countryName = countryInfo.nativeName || countryInfo.name;
  const flag = countryInfo.flag;
  const langName = localeInfo.nativeLabel;

  const visitingText = dict.geoBanner.visitingFrom
    .replace('{country}', countryName)
    .replace('{flag}', flag);

  const switchedText = dict.geoBanner.switchedTo.replace('{language}', langName);
  const keepText = dict.geoBanner.keep.replace('{language}', langName);

  return (
    <aside
      aria-label="Country and language notification"
      className="relative z-50 w-full bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg flex-shrink-0" aria-hidden="true">
            {flag}
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
            <span className="font-semibold text-white">{visitingText}</span>
            <span className="text-slate-300">{switchedText}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            type="button"
            onClick={dismissBanner}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
          >
            <Check size={14} aria-hidden="true" />
            <span>{keepText}</span>
          </button>

          <button
            type="button"
            onClick={() => setLocale('en', true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Globe size={14} aria-hidden="true" />
            <span>{dict.geoBanner.switchToEnglish}</span>
          </button>

          <button
            type="button"
            onClick={dismissBanner}
            aria-label={dict.geoBanner.dismiss}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}

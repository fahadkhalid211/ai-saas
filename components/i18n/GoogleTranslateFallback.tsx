'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Globe, Languages, RotateCcw, X } from 'lucide-react';
import type { SupportedLocale } from '@/lib/i18n/types';

interface GoogleTranslateFallbackProps {
  targetLocale: SupportedLocale;
}

const LANGUAGE_NAMES: Record<string, string> = {
  it: 'Italian',
  sv: 'Swedish',
  fi: 'Finnish',
  es: 'Spanish',
  en: 'English',
};

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    __gtScriptLoaded?: boolean;
  }
}

export function GoogleTranslateFallback({ targetLocale }: GoogleTranslateFallbackProps) {
  const [isOriginal, setIsOriginal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isTranslating, setIsTranslating] = useState(true);

  const langName = LANGUAGE_NAMES[targetLocale] || targetLocale;

  const setCookie = useCallback((val: string) => {
    document.cookie = `googtrans=${val}; path=/; SameSite=Lax`;
    if (typeof window !== 'undefined' && window.location.hostname.includes('.')) {
      document.cookie = `googtrans=${val}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
    }
  }, []);

  const triggerSelectLanguage = useCallback((langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  }, []);

  useEffect(() => {
    if (targetLocale === 'en') return;

    // Set cookie for auto-translation into targetLocale
    setCookie(`/en/${targetLocale}`);

    // Define the initialization callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'it,sv,fi,es,en',
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setIsTranslating(false);
      }
    };

    // Load Google Translate script if not already present
    if (!window.__gtScriptLoaded && !document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
      window.__gtScriptLoaded = true;
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, [targetLocale, setCookie]);

  const handleToggleOriginal = () => {
    if (isOriginal) {
      // Re-apply target language
      setCookie(`/en/${targetLocale}`);
      triggerSelectLanguage(targetLocale);
      setIsOriginal(false);
    } else {
      // Switch back to English original
      setCookie('/en/en');
      triggerSelectLanguage('en');
      setIsOriginal(true);
    }
  };

  if (dismissed || targetLocale === 'en') return null;

  return (
    <>
      {/* Hidden Google Translate container */}
      <div id="google_translate_element" style={{ display: 'none' }} aria-hidden="true" />

      {/* Global CSS overrides to suppress intrusive Google Translate iframe top banner */}
      <style dangerouslySetInnerHTML={{ __html: `
        .goog-te-banner-frame, iframe.goog-te-banner-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        .goog-tooltip {
          display: none !important;
        }
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        #goog-gt-tt, .goog-te-balloon-frame {
          display: none !important;
        }
      ` }} />

      {/* Clean Crescelo Translation Badge */}
      <aside
        aria-label="Automatic translation notice"
        className="mk-card my-4 p-3 sm:p-4 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 text-slate-700 dark:text-slate-300 shadow-sm"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Globe className="h-4 w-4" aria-hidden="true" />
          </div>
          <div style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
            <span className="font-semibold text-slate-900 dark:text-white">
              {isOriginal ? 'Showing original in English' : `Translated to ${langName} via Google Translate`}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              {isOriginal
                ? `Click below to restore ${langName} translation.`
                : 'Native translation in progress. Instant machine translation active.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleToggleOriginal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-all cursor-pointer"
          >
            {isOriginal ? (
              <>
                <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Translate to {langName}</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>View Original (English)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss translation banner"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Globe, Languages, RotateCcw, X, Loader2 } from 'lucide-react';
import type { SupportedLocale } from '@/lib/i18n/types';

interface GoogleTranslateFallbackProps {
  targetLocale: SupportedLocale;
}

const TRANSLATION_COPY: Record<string, {
  langName: string;
  translatingTitle: string;
  translatingSub: string;
  originalTitle: string;
  originalSub: string;
  btnOriginal: string;
  btnTranslate: string;
}> = {
  it: {
    langName: 'italiano',
    translatingTitle: 'Tradotto in italiano con Google Traduttore',
    translatingSub: 'Traduzione ufficiale in corso. Traduzione automatica attiva.',
    originalTitle: 'Visualizzazione originale in inglese',
    originalSub: 'Fai clic qui sotto per ripristinare la traduzione in italiano.',
    btnOriginal: 'Visualizza originale (inglese)',
    btnTranslate: 'Traduci in italiano',
  },
  es: {
    langName: 'español',
    translatingTitle: 'Traducido al español con Google Translate',
    translatingSub: 'Traducción oficial en curso. Traducción automática activa.',
    originalTitle: 'Mostrando el original en inglés',
    originalSub: 'Haz clic abajo para restaurar la traducción al español.',
    btnOriginal: 'Ver original (inglés)',
    btnTranslate: 'Traducir al español',
  },
  sv: {
    langName: 'svenska',
    translatingTitle: 'Översatt till svenska via Google Översätt',
    translatingSub: 'Officiell översättning pågår. Direkt maskinöversättning aktiv.',
    originalTitle: 'Visar originalet på engelska',
    originalSub: 'Klicka nedan för att återställa översättningen till svenska.',
    btnOriginal: 'Visa original (engelska)',
    btnTranslate: 'Översätt till svenska',
  },
  fi: {
    langName: 'suomi',
    translatingTitle: 'Käännetty suomeksi Google Kääntäjällä',
    translatingSub: 'Virallinen käännös tekeillä. Automaattinen pika-käännös käytössä.',
    originalTitle: 'Näytetään alkuperäinen englanniksi',
    originalSub: 'Palauta suomenkielinen käännös napsauttamalla alta.',
    btnOriginal: 'Näytä alkuperäinen (englanti)',
    btnTranslate: 'Käännä suomeksi',
  },
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const copy = TRANSLATION_COPY[targetLocale] || {
    langName: targetLocale,
    translatingTitle: `Translated to ${targetLocale} via Google Translate`,
    translatingSub: 'Native translation in progress. Instant machine translation active.',
    originalTitle: 'Showing original in English',
    originalSub: `Click below to restore ${targetLocale} translation.`,
    btnOriginal: 'View Original (English)',
    btnTranslate: `Translate to ${targetLocale}`,
  };

  const setTransCookie = useCallback((val: string) => {
    document.cookie = `googtrans=${val}; path=/; SameSite=Lax`;
    if (typeof window !== 'undefined' && window.location.hostname) {
      document.cookie = `googtrans=${val}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
      const parts = window.location.hostname.split('.');
      if (parts.length > 2) {
        document.cookie = `googtrans=${val}; path=/; domain=.${parts.slice(-2).join('.')}; SameSite=Lax`;
      }
    }
  }, []);

  const triggerSelectLanguage = useCallback((langCode: string): boolean => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      if (select.value !== langCode) {
        select.value = langCode;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (targetLocale === 'en') return;

    // Set page lang attribute to en so Google Translate detects source language accurately
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', 'en');
    }

    // Set cookie for auto-translation into targetLocale
    setTransCookie(`/en/${targetLocale}`);

    // Define the initialization callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'it,sv,fi,es,en',
              autoDisplay: false,
            },
            'google_translate_element'
          );
        } catch {
          // ignore
        }
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

    // Actively poll to apply target language as soon as the combo select is mounted
    let stopped = false;
    const interval = setInterval(() => {
      if (stopped) return;
      if (triggerSelectLanguage(targetLocale)) {
        setIsTranslating(false);
        clearInterval(interval);
      }
    }, 120);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsTranslating(false);
    }, 8000);

    return () => {
      stopped = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [targetLocale, setTransCookie, triggerSelectLanguage]);

  const handleToggleOriginal = () => {
    if (isOriginal) {
      // Re-apply target language
      setTransCookie(`/en/${targetLocale}`);
      triggerSelectLanguage(targetLocale);
      setIsOriginal(false);
    } else {
      // Switch back to English original
      setTransCookie('/en/en');
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
        .goog-te-banner-frame, iframe.goog-te-banner-frame, iframe.skiptranslate {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        .goog-tooltip, #goog-gt-tt, .goog-te-balloon-frame {
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
      ` }} />

      {/* Clean Crescelo Translation Badge - protected from translation */}
      <aside
        aria-label="Automatic translation notice"
        translate="no"
        className="notranslate mk-card my-4 p-3 sm:p-4 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 text-slate-700 dark:text-slate-300 shadow-sm"
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
            {isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Globe className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <div style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
            <span className="font-semibold text-slate-900 dark:text-white">
              {isOriginal ? copy.originalTitle : copy.translatingTitle}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              {isOriginal ? copy.originalSub : copy.translatingSub}
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
                <span>{copy.btnTranslate}</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.btnOriginal}</span>
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

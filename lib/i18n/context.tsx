'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { SupportedLocale, LocaleInfo, CountryInfo } from './types';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  COUNTRY_COOKIE,
  GEO_BANNER_DISMISSED_KEY,
  isValidLocale,
  getLocaleInfo,
  getCountryInfo,
  resolveGeoLocale,
} from './config';
import { getDictionary, type TranslationDictionary } from './dictionaries';

interface I18nContextValue {
  locale: SupportedLocale;
  country: string;
  countryInfo: CountryInfo | null;
  localeInfo: LocaleInfo;
  dict: TranslationDictionary;
  setLocale: (newLocale: SupportedLocale, isManualChoice?: boolean) => void;
  formatCurrency: (usdAmount: number) => string;
  isAutoDetected: boolean;
  bannerVisible: boolean;
  dismissBanner: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function I18nProvider({
  children,
  initialLocale,
  initialCountry,
}: {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
  initialCountry?: string;
}) {
  // The first render must be identical on the server and in the browser, or React reports a hydration error (#418) and
  // re-renders the page. The server cannot see the visitor's saved language, so the first render never reads it either:
  // it uses what the page passed in (or the default), and the saved language is applied right after, in the effect below.
  const [locale, setLocaleState] = useState<SupportedLocale>(() =>
    initialLocale && isValidLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE
  );

  const [country, setCountryState] = useState<string>(() => initialCountry || 'US');

  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);
  const [bannerVisible, setBannerVisible] = useState<boolean>(false);

  // Initialize and detect geo-location on mount if not explicitly set
  useEffect(() => {
    try {
      const savedLocale = readCookie(LOCALE_COOKIE) || localStorage.getItem(LOCALE_COOKIE);
      const isBannerDismissed = localStorage.getItem(GEO_BANNER_DISMISSED_KEY) === 'true';

      if (savedLocale && isValidLocale(savedLocale)) {
        setLocaleState(savedLocale);
        const savedCountry = readCookie(COUNTRY_COOKIE);
        if (savedCountry) setCountryState(savedCountry);
        document.documentElement.lang = savedLocale;
        return;
      }

      // If user hasn't explicitly set a preference, detect from headers / browser
      const countryCode =
        readCookie(COUNTRY_COOKIE) ||
        document.documentElement.getAttribute('data-country') ||
        '';

      const resolved = resolveGeoLocale(
        countryCode,
        typeof navigator !== 'undefined' ? navigator.language : undefined
      );

      if (resolved.isAutoDetected) {
        setLocaleState(resolved.locale);
        setCountryState(resolved.country);
        setIsAutoDetected(true);
        document.documentElement.lang = resolved.locale;
        writeCookie(LOCALE_COOKIE, resolved.locale);
        writeCookie(COUNTRY_COOKIE, resolved.country);

        if (!isBannerDismissed) {
          setBannerVisible(true);
        }
      }
    } catch {
      // Safe fallback on strict privacy browsers
    }
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale, isManualChoice = true) => {
    setLocaleState(newLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
      writeCookie(LOCALE_COOKIE, newLocale);
      try {
        localStorage.setItem(LOCALE_COOKIE, newLocale);
      } catch {}
    }
    if (isManualChoice) {
      setBannerVisible(false);
      try {
        localStorage.setItem(GEO_BANNER_DISMISSED_KEY, 'true');
      } catch {}
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    try {
      localStorage.setItem(GEO_BANNER_DISMISSED_KEY, 'true');
    } catch {}
  }, []);

  const countryInfo = useMemo(() => getCountryInfo(country), [country]);
  const localeInfo = useMemo(() => getLocaleInfo(locale), [locale]);
  const dict = useMemo(() => getDictionary(locale), [locale]);

  const formatCurrency = useCallback(
    (usdAmount: number): string => {
      if (locale === 'sv' || country === 'SE') {
        // Approximate 1 USD ~ 10.5 SEK
        const sek = Math.round(usdAmount * 10.5);
        return `${sek} kr`;
      }
      if (locale === 'fi' || locale === 'it' || locale === 'es' || countryInfo?.currency === 'EUR') {
        // Approximate 1 USD ~ 0.92 EUR
        const eur = Math.round(usdAmount * 0.92);
        return `€${eur}`;
      }
      return `$${usdAmount}`;
    },
    [locale, country, countryInfo]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      country,
      countryInfo,
      localeInfo,
      dict,
      setLocale,
      formatCurrency,
      isAutoDetected,
      bannerVisible,
      dismissBanner,
    }),
    [
      locale,
      country,
      countryInfo,
      localeInfo,
      dict,
      setLocale,
      formatCurrency,
      isAutoDetected,
      bannerVisible,
      dismissBanner,
    ]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Provide safe non-crashing fallback if used outside provider
    const fallbackLocale: SupportedLocale = DEFAULT_LOCALE;
    return {
      locale: fallbackLocale,
      country: 'US',
      countryInfo: null,
      localeInfo: getLocaleInfo(fallbackLocale),
      dict: getDictionary(fallbackLocale),
      setLocale: () => {},
      formatCurrency: (usd) => `$${usd}`,
      isAutoDetected: false,
      bannerVisible: false,
      dismissBanner: () => {},
    };
  }
  return context;
}

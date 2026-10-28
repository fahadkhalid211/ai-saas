'use client';

import React, { Fragment, createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SupportedLocale, LocaleInfo, CountryInfo } from './types';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_SOURCE_COOKIE,
  COUNTRY_COOKIE,
  GEO_BANNER_DISMISSED_KEY,
  getLocaleInfo,
  getCountryInfo,
} from './config';
import { getDictionary, type TranslationDictionary } from './dictionaries';
import { isLocalizablePath, localizeHref, splitLocale } from './paths';
import { translate } from './translate';

/**
 * The language is decided by the server and arrives as a prop: the address for public pages (/sv/pricing), the saved choice for
 * the signed-in screens. Nothing here guesses it in the browser, so the first render in the browser is identical to the HTML the
 * server sent. Switching language is a navigation (public pages) or a reload (signed-in screens), never a client-side swap.
 */

interface I18nContextValue {
  locale: SupportedLocale;
  country: string;
  countryInfo: CountryInfo | null;
  localeInfo: LocaleInfo;
  /** Typed phrases for the sections that predate the catalog (home page sections, sign-in). New text goes in the catalog. */
  dict: TranslationDictionary;
  /** Switches language: public pages move to the same page in that language, signed-in screens reload. */
  setLocale: (newLocale: SupportedLocale, isManualChoice?: boolean) => void;
  /** Prices are charged in US dollars, so they are always shown in US dollars. */
  formatCurrency: (usdAmount: number) => string;
  /** The server picked this language from the visitor's country (they did not choose it). */
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
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/** The address of the current page in another language, or the page the current one declares as its counterpart there. */
function targetHref(newLocale: SupportedLocale): string | null {
  const { pathname, search, hash } = window.location;
  const { path } = splitLocale(pathname);
  if (!isLocalizablePath(path)) return null;
  // A page whose translation may not exist lists where each language lives.
  const declared = document.querySelector('[data-locale-alternates]')?.getAttribute('data-locale-alternates');
  if (declared) {
    try {
      const map = JSON.parse(declared) as Partial<Record<SupportedLocale, string>>;
      if (map[newLocale]) return map[newLocale]! + search + hash;
    } catch {
      /* fall through to the plain mapping */
    }
  }
  return localizeHref(path, newLocale) + search + hash;
}

export function I18nProvider({
  children,
  locale: localeProp,
  country: countryProp,
}: {
  children: React.ReactNode;
  locale?: SupportedLocale;
  country?: string;
}) {
  const locale: SupportedLocale = localeProp || DEFAULT_LOCALE;
  const [country, setCountry] = useState<string>(countryProp || 'US');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  // What only the browser knows (cookies the proxy set, whether the banner was dismissed) is read after the first render.
  useEffect(() => {
    try {
      const savedCountry = readCookie(COUNTRY_COOKIE);
      if (savedCountry) setCountry(savedCountry);
      const auto = readCookie(LOCALE_SOURCE_COOKIE) === 'auto';
      setIsAutoDetected(auto);
      const dismissed = localStorage.getItem(GEO_BANNER_DISMISSED_KEY) === 'true';
      setBannerVisible(auto && locale !== 'en' && !dismissed);
    } catch {
      /* strict privacy modes: no banner, nothing else lost */
    }
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: SupportedLocale, isManualChoice = true) => {
      if (typeof window === 'undefined') return;
      writeCookie(LOCALE_COOKIE, newLocale);
      if (isManualChoice) {
        writeCookie(LOCALE_SOURCE_COOKIE, 'user');
        try {
          localStorage.setItem(GEO_BANNER_DISMISSED_KEY, 'true');
        } catch {}
      }
      const href = targetHref(newLocale);
      if (href) window.location.assign(href);
      else window.location.reload();
    },
    []
  );

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    try {
      localStorage.setItem(GEO_BANNER_DISMISSED_KEY, 'true');
    } catch {}
    writeCookie(LOCALE_SOURCE_COOKIE, 'user');
  }, []);

  const countryInfo = useMemo(() => getCountryInfo(country), [country]);
  const localeInfo = useMemo(() => getLocaleInfo(locale), [locale]);
  const dict = useMemo(() => getDictionary(locale), [locale]);
  const formatCurrency = useCallback((usd: number) => `$${usd}`, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, country, countryInfo, localeInfo, dict, setLocale, formatCurrency, isAutoDetected, bannerVisible, dismissBanner }),
    [locale, country, countryInfo, localeInfo, dict, setLocale, formatCurrency, isAutoDetected, bannerVisible, dismissBanner]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Used outside the provider (an isolated test, an error boundary): English, never a crash.
    return {
      locale: DEFAULT_LOCALE,
      country: 'US',
      countryInfo: null,
      localeInfo: getLocaleInfo(DEFAULT_LOCALE),
      dict: getDictionary(DEFAULT_LOCALE),
      setLocale: () => {},
      formatCurrency: (usd) => `$${usd}`,
      isAutoDetected: false,
      bannerVisible: false,
      dismissBanner: () => {},
    };
  }
  return context;
}

/** A translate function for attributes, labels and messages built in code: t("Save changes"), t("{n} leads", { n: 3 }). */
export function useT(): (text: string, values?: Record<string, string | number | null | undefined>) => string {
  const { locale } = useI18n();
  return useCallback((text, values) => translate(text, locale, values), [locale]);
}

function translateNode(node: React.ReactNode, locale: SupportedLocale): React.ReactNode {
  if (typeof node === 'string') return translate(node, locale);
  if (Array.isArray(node)) {
    const mapped = node.map((child) => (typeof child === 'string' ? translate(child, locale) : child));
    // spread, so React does not ask for keys on the children the author wrote next to each other
    return createElement(Fragment, null, ...mapped);
  }
  return node;
}

/**
 * <T>Start free trial</T>: shows the text in the page's language. Anything that is not text (elements, numbers, nothing) is
 * passed through untouched, and text with no translation stays English, so wrapping something never changes what it looks like.
 */
export function T({ children }: { children?: React.ReactNode }) {
  const { locale } = useI18n();
  if (locale === 'en') return <>{children}</>;
  return <>{translateNode(children, locale)}</>;
}

/**
 * A whole sentence with parts in bold: <TRich text="Today: **$0**. After {days} days: **${price}** a month." values={{ days, price }} />.
 * The sentence is translated as one piece, so the word order of the language is respected; the text between ** ** is bold.
 */
export function TRich({ text, values }: { text: string; values?: Record<string, string | number | null | undefined> }) {
  const { locale } = useI18n();
  const parts = translate(text, locale, values).split('**');
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

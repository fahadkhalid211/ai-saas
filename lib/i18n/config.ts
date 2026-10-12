import {
  COUNTRY_MAPPING,
  SUPPORTED_LOCALES,
  type CountryInfo,
  type LocaleInfo,
  type SupportedLocale,
} from './types';

export const LOCALE_COOKIE = 'crescelo_locale';
export const COUNTRY_COOKIE = 'crescelo_country';
/** "auto" when the proxy chose the language from the visitor's country, "user" once they picked one themselves. */
export const LOCALE_SOURCE_COOKIE = 'crescelo_locale_src';
export const GEO_BANNER_DISMISSED_KEY = 'crescelo_geo_banner_dismissed';

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export function isValidLocale(val: unknown): val is SupportedLocale {
  return typeof val === 'string' && val in SUPPORTED_LOCALES;
}

export function getLocaleInfo(locale: SupportedLocale): LocaleInfo {
  return SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES[DEFAULT_LOCALE];
}

export function getCountryInfo(countryCode?: string | null): CountryInfo | null {
  if (!countryCode) return null;
  const upper = countryCode.toUpperCase();
  return COUNTRY_MAPPING[upper] || null;
}

/**
 * Resolves the appropriate locale given an IP country code and browser Accept-Language header.
 */
export function resolveGeoLocale(
  countryCode?: string | null,
  acceptLanguage?: string | null
): {
  locale: SupportedLocale;
  country: string;
  countryName: string;
  nativeCountryName: string;
  isAutoDetected: boolean;
} {
  const code = countryCode ? countryCode.toUpperCase().trim() : '';

  // 1. Direct country code lookup
  if (code && code in COUNTRY_MAPPING) {
    const matched = COUNTRY_MAPPING[code];
    return {
      locale: matched.locale,
      country: matched.code,
      countryName: matched.name,
      nativeCountryName: matched.nativeName,
      isAutoDetected: matched.locale !== 'en',
    };
  }

  // 2. No usable country (local development, a privacy network): the browser's own first-choice language
  const fromBrowser = pickBrowserLocale(acceptLanguage);
  if (fromBrowser && fromBrowser !== 'en') {
    const info = SUPPORTED_LOCALES[fromBrowser];
    const c = COUNTRY_MAPPING[info.defaultCountry];
    return {
      locale: fromBrowser,
      country: info.defaultCountry,
      countryName: c?.name || info.defaultCountry,
      nativeCountryName: c?.nativeName || info.defaultCountry,
      isAutoDetected: true,
    };
  }

  // 3. Fallback to English
  return {
    locale: 'en',
    country: code || 'US',
    countryName: code ? code : 'Global',
    nativeCountryName: code ? code : 'Global',
    isAutoDetected: false,
  };
}

/**
 * The best-liked language of an Accept-Language header that we have a translation for, or null. Only the top choice counts:
 * "en-US,en;q=0.9,sv;q=0.8" is an English reader who happens to also know Swedish, not a Swedish reader.
 */
export function pickBrowserLocale(acceptLanguage?: string | null): SupportedLocale | null {
  if (!acceptLanguage) return null;
  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const q = Number(params.find((p) => p.trim().startsWith('q='))?.split('=')[1] ?? 1);
      return { primary: tag.trim().toLowerCase().split('-')[0], q: Number.isFinite(q) ? q : 0, index };
    })
    .filter((x) => x.primary && x.primary !== '*' && x.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  const top = ranked[0]?.primary;
  return top && isValidLocale(top) ? top : null;
}

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
  return val === 'en';
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
 * Resolves the appropriate locale: defaults always to English.
 */
export function resolveGeoLocale(
  countryCode?: string | null,
  _acceptLanguage?: string | null
): {
  locale: SupportedLocale;
  country: string;
  countryName: string;
  nativeCountryName: string;
  isAutoDetected: boolean;
} {
  const code = countryCode ? countryCode.toUpperCase().trim() : '';
  const matched = code && code in COUNTRY_MAPPING ? COUNTRY_MAPPING[code] : null;

  return {
    locale: 'en',
    country: matched?.code || code || 'US',
    countryName: matched?.name || (code ? code : 'Global'),
    nativeCountryName: matched?.nativeName || (code ? code : 'Global'),
    isAutoDetected: false,
  };
}

export function pickBrowserLocale(_acceptLanguage?: string | null): SupportedLocale | null {
  return 'en';
}

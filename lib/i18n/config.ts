import {
  COUNTRY_MAPPING,
  SUPPORTED_LOCALES,
  type CountryInfo,
  type LocaleInfo,
  type SupportedLocale,
} from './types';

export const LOCALE_COOKIE = 'crescelo_locale';
export const COUNTRY_COOKIE = 'crescelo_country';
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

  // 2. Secondary check via browser accept-language if country was unknown
  if (acceptLanguage) {
    const lang = acceptLanguage.toLowerCase();
    if (lang.includes('sv')) {
      return { locale: 'sv', country: 'SE', countryName: 'Sweden', nativeCountryName: 'Sverige', isAutoDetected: true };
    }
    if (lang.includes('fi')) {
      return { locale: 'fi', country: 'FI', countryName: 'Finland', nativeCountryName: 'Suomi', isAutoDetected: true };
    }
    if (lang.includes('it')) {
      return { locale: 'it', country: 'IT', countryName: 'Italy', nativeCountryName: 'Italia', isAutoDetected: true };
    }
    if (lang.includes('es')) {
      return { locale: 'es', country: 'ES', countryName: 'Spain', nativeCountryName: 'España', isAutoDetected: true };
    }
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

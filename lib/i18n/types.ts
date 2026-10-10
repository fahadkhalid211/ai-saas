export type SupportedLocale = 'en' | 'sv' | 'fi' | 'it' | 'es';

export interface LocaleInfo {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  flag: string;
  currencyCode: 'USD' | 'EUR' | 'SEK';
  currencySymbol: string;
  defaultCountry: string;
}

export interface CountryInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  locale: SupportedLocale;
  currency: 'USD' | 'EUR' | 'SEK';
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleInfo> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇺🇸',
    currencyCode: 'USD',
    currencySymbol: '$',
    defaultCountry: 'US',
  },
  sv: {
    code: 'sv',
    label: 'Swedish',
    nativeLabel: 'Svenska',
    flag: '🇸🇪',
    currencyCode: 'SEK',
    currencySymbol: 'kr',
    defaultCountry: 'SE',
  },
  fi: {
    code: 'fi',
    label: 'Finnish',
    nativeLabel: 'Suomi',
    flag: '🇫🇮',
    currencyCode: 'EUR',
    currencySymbol: '€',
    defaultCountry: 'FI',
  },
  it: {
    code: 'it',
    label: 'Italian',
    nativeLabel: 'Italiano',
    flag: '🇮🇹',
    currencyCode: 'EUR',
    currencySymbol: '€',
    defaultCountry: 'IT',
  },
  es: {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Español',
    flag: '🇪🇸',
    currencyCode: 'EUR',
    currencySymbol: '€',
    defaultCountry: 'ES',
  },
};

/**
 * Mapping of Country ISO code to primary language and local display details.
 * Any country not explicitly listed defaults to English ('en').
 */
export const COUNTRY_MAPPING: Record<string, CountryInfo> = {
  // Sweden
  SE: { code: 'SE', name: 'Sweden', nativeName: 'Sverige', flag: '🇸🇪', locale: 'sv', currency: 'SEK' },

  // Finland
  FI: { code: 'FI', name: 'Finland', nativeName: 'Suomi', flag: '🇫🇮', locale: 'fi', currency: 'EUR' },

  // Italy & San Marino / Vatican
  IT: { code: 'IT', name: 'Italy', nativeName: 'Italia', flag: '🇮🇹', locale: 'it', currency: 'EUR' },
  SM: { code: 'SM', name: 'San Marino', nativeName: 'San Marino', flag: '🇸🇲', locale: 'it', currency: 'EUR' },
  VA: { code: 'VA', name: 'Vatican City', nativeName: 'Città del Vaticano', flag: '🇻🇦', locale: 'it', currency: 'EUR' },

  // Spain & Spanish-speaking Latin America
  ES: { code: 'ES', name: 'Spain', nativeName: 'España', flag: '🇪🇸', locale: 'es', currency: 'EUR' },
  MX: { code: 'MX', name: 'Mexico', nativeName: 'México', flag: '🇲🇽', locale: 'es', currency: 'USD' },
  AR: { code: 'AR', name: 'Argentina', nativeName: 'Argentina', flag: '🇦🇷', locale: 'es', currency: 'USD' },
  CO: { code: 'CO', name: 'Colombia', nativeName: 'Colombia', flag: '🇨🇴', locale: 'es', currency: 'USD' },
  CL: { code: 'CL', name: 'Chile', nativeName: 'Chile', flag: '🇨🇱', locale: 'es', currency: 'USD' },
  PE: { code: 'PE', name: 'Peru', nativeName: 'Perú', flag: '🇵🇪', locale: 'es', currency: 'USD' },
  VE: { code: 'VE', name: 'Venezuela', nativeName: 'Venezuela', flag: '🇻🇪', locale: 'es', currency: 'USD' },
  EC: { code: 'EC', name: 'Ecuador', nativeName: 'Ecuador', flag: '🇪🇨', locale: 'es', currency: 'USD' },
  GT: { code: 'GT', name: 'Guatemala', nativeName: 'Guatemala', flag: '🇬🇹', locale: 'es', currency: 'USD' },
  CU: { code: 'CU', name: 'Cuba', nativeName: 'Cuba', flag: '🇨🇺', locale: 'es', currency: 'USD' },
  BO: { code: 'BO', name: 'Bolivia', nativeName: 'Bolivia', flag: '🇧🇴', locale: 'es', currency: 'USD' },
  DO: { code: 'DO', name: 'Dominican Republic', nativeName: 'República Dominicana', flag: '🇩🇴', locale: 'es', currency: 'USD' },
  HN: { code: 'HN', name: 'Honduras', nativeName: 'Honduras', flag: '🇭🇳', locale: 'es', currency: 'USD' },
  PY: { code: 'PY', name: 'Paraguay', nativeName: 'Paraguay', flag: '🇵🇾', locale: 'es', currency: 'USD' },
  SV: { code: 'SV', name: 'El Salvador', nativeName: 'El Salvador', flag: '🇸🇻', locale: 'es', currency: 'USD' },
  NI: { code: 'NI', name: 'Nicaragua', nativeName: 'Nicaragua', flag: '🇳🇮', locale: 'es', currency: 'USD' },
  CR: { code: 'CR', name: 'Costa Rica', nativeName: 'Costa Rica', flag: '🇨🇷', locale: 'es', currency: 'USD' },
  PA: { code: 'PA', name: 'Panama', nativeName: 'Panamá', flag: '🇵🇦', locale: 'es', currency: 'USD' },
  UY: { code: 'UY', name: 'Uruguay', nativeName: 'Uruguay', flag: '🇺🇾', locale: 'es', currency: 'USD' },
  PR: { code: 'PR', name: 'Puerto Rico', nativeName: 'Puerto Rico', flag: '🇵🇷', locale: 'es', currency: 'USD' },
};

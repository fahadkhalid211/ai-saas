import type { SupportedLocale } from './types';
import { isLocalizablePath, localizeHref, splitLocale } from './paths';

/**
 * Points structured data at the page's own language: addresses of public pages gain the language prefix and `inLanguage`
 * becomes the page's language. The shared identities of the site (the organization, the website: "/#organization") and
 * image files are left alone, because they are one thing whatever the language.
 */
export function localizeJsonLd<T>(data: T, locale: SupportedLocale, siteUrl: string): T {
  if (locale === 'en') return data;
  const walk = (value: unknown, key?: string): unknown => {
    if (Array.isArray(value)) return value.map((v) => walk(v));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, walk(v, k)]));
    }
    if (typeof value !== 'string') return value;
    if (key === 'inLanguage' && value === 'en') return locale;
    if (!value.startsWith(`${siteUrl}/`)) return value;
    const rest = value.slice(siteUrl.length);
    if (rest.startsWith('/#') || /(opengraph|twitter)-image$/.test(rest) || /\.[a-z0-9]{2,5}$/i.test(rest.split(/[?#]/)[0])) return value;
    const { path } = splitLocale(rest.split(/[?#]/)[0]);
    return isLocalizablePath(path) ? siteUrl + localizeHref(rest, locale) : value;
  };
  return walk(data) as T;
}

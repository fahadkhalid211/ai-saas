import type { SupportedLocale } from './types';
import { isLocalizablePath, isAppPath, splitLocale, LOCALES } from './paths';
import { LOCALE_COOKIE, LOCALE_SOURCE_COOKIE, COUNTRY_COOKIE, isValidLocale, resolveGeoLocale } from './config';

/**
 * Which language a request gets, as one pure function so it can be tested without a server. The proxy applies the answer.
 *
 *  - English pages keep their plain address (/pricing). Every other language has a prefix (/sv/pricing).
 *  - A saved choice always wins. With none, a first-time visitor from Sweden, Finland, Italy or a Spanish-speaking country is
 *    taken to their language once, and told so (a banner lets them go back). Search engine crawlers are never redirected.
 *  - The signed-in screens (dashboard, sign-in) show the saved or detected language at the same address, no prefix.
 *  - A translation that does not exist yet is never sent: the visitor stays on the English page.
 */

export interface RoutingInput {
  pathname: string;
  search: string;
  method: string;
  host: string;
  cookies: { locale?: string; source?: string };
  /** ISO country from the hosting platform's edge, if any. */
  country?: string | null;
  acceptLanguage?: string | null;
  userAgent?: string | null;
  accept?: string | null;
  /** Blog slugs that have been translated, by language. */
  translatedBlog: Partial<Record<SupportedLocale, readonly string[]>>;
}

export type RoutingDecision =
  | { action: 'pass' }
  | { action: 'rewrite'; to: string }
  | {
      action: 'redirect';
      to: string;
      status: 307 | 308;
      /** Cookies to set on the redirect: the language chosen for the visitor, and that it was automatic. */
      cookies?: { name: string; value: string }[];
      /** A decision that depends on who is asking must not be cached or shared. */
      private: boolean;
    };

const BOT = /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|twitterbot|linkedinbot|embedly|preview|lighthouse|pingdom|uptime|headless|curl\/|wget\//i;

/** The signed-in screens that follow the person's language. Everything else outside the public site is English at one address. */
const PREFERENCE_APP_PREFIXES = ['/dashboard', '/login', '/master', '/admin', '/connect'];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** Whether the page exists in this language. Everything does, except blog articles that have not been translated. */
export function pageExistsIn(path: string, locale: SupportedLocale, translatedBlog: RoutingInput['translatedBlog']): boolean {
  if (locale === 'en') return true;
  const m = path.match(/^\/blog\/([^/]+)\/?$/);
  if (!m || m[1] === 'feed.xml') return true;
  return (translatedBlog[locale] || []).includes(decodeURIComponent(m[1]));
}

export function decideRoute(input: RoutingInput): RoutingDecision {
  const { pathname, search, host } = input;
  const split = splitLocale(pathname);
  const savedRaw = input.cookies.locale;
  const saved = savedRaw && isValidLocale(savedRaw) ? savedRaw : undefined;
  const isGet = input.method === 'GET' || input.method === 'HEAD';

  // status.crescelo.com serves the status page, always in English.
  if (/^status\./i.test(host)) {
    return { action: 'rewrite', to: `/en/status${pathname === '/' ? '' : pathname}${search}` };
  }

  // The blog feed is a file served from the English route.
  if (pathname === '/blog/feed.xml') return { action: 'rewrite', to: `/en/blog/feed.xml${search}` };

  // ---- an address that carries a language ----
  if (split.locale) {
    if (split.locale === 'en') return { action: 'redirect', to: `${split.path}${search}`, status: 308, private: false };
    if (!isLocalizablePath(split.path)) return { action: 'redirect', to: `${split.path}${search}`, status: 308, private: false };
    if (!pageExistsIn(split.path, split.locale, input.translatedBlog)) {
      return { action: 'redirect', to: `${split.path}${search}`, status: 307, private: false };
    }
    return { action: 'pass' };
  }

  // ---- no language in the address ----
  if (!isGet) {
    // form posts and the like keep working at the address they were sent to
    return isLocalizablePath(pathname) || isAppPath(pathname) ? { action: 'rewrite', to: `/en${pathname}${search}` } : { action: 'pass' };
  }

  if (isAppPath(pathname)) {
    if (pathname === '/i18n' || pathname.startsWith('/i18n/') || pathname.startsWith('/api') || pathname.startsWith('/_next')) return { action: 'pass' };
    if (startsWithAny(pathname, PREFERENCE_APP_PREFIXES)) {
      const geo = resolveGeoLocale(input.country, input.acceptLanguage);
      const loc: SupportedLocale = saved || (geo.isAutoDetected ? geo.locale : 'en');
      return { action: 'rewrite', to: `/${loc}${pathname}${search}` };
    }
    return { action: 'rewrite', to: `/en${pathname}${search}` };
  }

  if (!isLocalizablePath(pathname)) return { action: 'pass' };

  const english: RoutingDecision = { action: 'rewrite', to: `/en${pathname}${search}` };
  const to = (loc: SupportedLocale) => `${loc === 'en' ? '' : `/${loc}`}${pathname === '/' && loc !== 'en' ? '' : pathname}${search}`;

  // A saved choice always wins.
  if (saved) {
    if (saved === 'en' || !pageExistsIn(pathname, saved, input.translatedBlog)) return english;
    return { action: 'redirect', to: to(saved), status: 307, private: true };
  }

  // First visit: a person from a country we translate for is taken to their language, once. Crawlers and link previews are not.
  const ua = input.userAgent || '';
  if (BOT.test(ua) || !(input.accept || '').includes('text/html')) return english;
  const geo = resolveGeoLocale(input.country, input.acceptLanguage);
  if (!geo.isAutoDetected || geo.locale === 'en' || !pageExistsIn(pathname, geo.locale, input.translatedBlog)) return english;
  return {
    action: 'redirect',
    to: to(geo.locale),
    status: 307,
    private: true,
    cookies: [
      { name: LOCALE_COOKIE, value: geo.locale },
      { name: LOCALE_SOURCE_COOKIE, value: 'auto' },
      { name: COUNTRY_COOKIE, value: geo.country },
    ],
  };
}

export { LOCALES };

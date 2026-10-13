import type { SupportedLocale } from './types';

/**
 * Locale-aware URLs. English lives at the plain address (/pricing); every other language has a prefix (/sv/pricing).
 * One address per language per page is what lets search engines index each language separately (hreflang), and what
 * lets the server send the page already translated instead of English that is swapped after the page loads.
 *
 * No imports from next/* here: this file is read by the proxy (edge), by server components and by client components.
 */

export const LOCALES: readonly SupportedLocale[] = ['en', 'sv', 'fi', 'it', 'es'];
export const DEFAULT_LOCALE_CODE: SupportedLocale = 'en';
export const PREFIXED_LOCALES: readonly SupportedLocale[] = ['sv', 'fi', 'it', 'es'];

export function isLocaleCode(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Parts of the product that are not public pages. They keep one address whatever the language: the signed-in screens follow
 * the language the person chose (a cookie), and pages published for customers, the widget and the APIs are not ours to translate.
 */
const APP_PREFIXES = [
  '/api',
  '/dashboard',
  '/login',
  '/master',
  '/admin',
  '/embed',
  '/site',
  '/landing-page',
  '/status',
  '/connect',
  '/verify-email',
  '/i18n',
  '/_next',
];

/** Files and feeds served from the root: never get a language prefix. */
const ROOT_FILES = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/manifest.webmanifest', '/favicon.ico', '/icon.svg', '/opengraph-image', '/twitter-image', '/blog/feed.xml', '/widget.js'];

function hasFileExtension(path: string): boolean {
  const last = path.split('?')[0].split('#')[0].split('/').pop() || '';
  return /\.[a-z0-9]{2,5}$/i.test(last);
}

/** True for the signed-in screens (dashboard, sign-in, master console): translated by cookie, not by address. */
export function isAppPath(pathname: string): boolean {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** True for the public pages that exist once per language. */
export function isLocalizablePath(pathname: string): boolean {
  if (!pathname.startsWith('/')) return false;
  if (pathname.startsWith('//')) return false;
  if (isAppPath(pathname)) return false;
  if (ROOT_FILES.includes(pathname.split('?')[0])) return false;
  if (hasFileExtension(pathname)) return false;
  return true;
}

export interface SplitPath {
  /** The language in the address, or null when the address has none (English). */
  locale: SupportedLocale | null;
  /** The address without the language prefix, always starting with "/". */
  path: string;
}

export function splitLocale(pathname: string): SplitPath {
  const m = pathname.match(/^\/(sv|fi|it|es|en)(?=\/|$)/);
  if (!m) return { locale: null, path: pathname || '/' };
  const rest = pathname.slice(m[0].length) || '/';
  return { locale: m[1] as SupportedLocale, path: rest.startsWith('/') ? rest : `/${rest}` };
}

/**
 * The address of a page in a language. Anything that is not a public page of this site (other sites, mailto:, the dashboard,
 * files, "#section" links) is returned unchanged.
 */
export function localizeHref(href: string, locale: SupportedLocale): string {
  if (!href || typeof href !== 'string') return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const hashAt = href.search(/[?#]/);
  const pathname = hashAt === -1 ? href : href.slice(0, hashAt);
  const tail = hashAt === -1 ? '' : href.slice(hashAt);
  const { path } = splitLocale(pathname);
  if (!isLocalizablePath(path)) return href;
  if (locale === 'en') return (path === '/' && tail ? '/' : path) + tail;
  return (path === '/' ? `/${locale}` : `/${locale}${path}`) + tail;
}

/** The same page in every language, for hreflang and the language switcher. */
export function alternatesFor(path: string): { locale: SupportedLocale; path: string }[] {
  const { path: bare } = splitLocale(path);
  return LOCALES.map((l) => ({ locale: l, path: localizeHref(bare, l) }));
}

/** hreflang values: ISO language codes search engines understand. */
export const HREFLANG: Record<SupportedLocale, string> = { en: 'en', sv: 'sv', fi: 'fi', it: 'it', es: 'es' };

/** Open Graph locale names. */
export const OG_LOCALE: Record<SupportedLocale, string> = { en: 'en_US', sv: 'sv_SE', fi: 'fi_FI', it: 'it_IT', es: 'es_ES' };

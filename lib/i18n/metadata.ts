import type { Metadata } from 'next';
import { SITE } from '@/components/marketing/content';
import { getLocale } from './server';
import { alternatesFor, HREFLANG, OG_LOCALE, isLocalizablePath, localizeHref, splitLocale } from './paths';
import { translate } from './translate';
import type { SupportedLocale } from './types';

const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);

/**
 * Turns a page's English metadata into the metadata for the language being rendered: translated title and description, the
 * address in that language as the canonical, and the other languages as alternates (what search engines use to show each
 * visitor the right one).
 *
 * `languages` lists where the page exists; by default every language. A blog article passes only the ones it was translated into.
 */
export async function localizeMeta(meta: Metadata, options: { languages?: readonly SupportedLocale[]; path?: string } = {}): Promise<Metadata> {
  const locale = await getLocale();
  const tr = (v?: string) => (v ? translate(v, locale) : v);
  const canonicalRaw = options.path || str(meta.alternates?.canonical) || '/';
  const base = splitLocale(canonicalRaw).path;
  const here = localizeHref(base, locale);
  const isPublicPage = isLocalizablePath(base);
  const abs = (p: string) => `${SITE.url}${p === '/' ? '' : p}`;
  const available = options.languages ?? alternatesFor(base).map((a) => a.locale);

  const languages: Record<string, string> = {};
  for (const l of available) languages[HREFLANG[l]] = abs(localizeHref(base, l));
  languages['x-default'] = abs(localizeHref(base, 'en'));

  const title = typeof meta.title === 'string' ? tr(meta.title) : meta.title;
  const description = tr(str(meta.description));
  const og = meta.openGraph as Record<string, unknown> | null | undefined;
  const tw = meta.twitter as Record<string, unknown> | null | undefined;

  return {
    ...meta,
    title,
    description,
    // Signed-in screens and customer pages have one address in every language: nothing to point search engines between.
    alternates: isPublicPage ? { ...meta.alternates, canonical: abs(here), languages } : meta.alternates,
    openGraph: og
      ? ({ ...og, title: tr(str(og.title)) ?? og.title, description: tr(str(og.description)) ?? og.description, url: isPublicPage ? abs(here) : og.url, locale: OG_LOCALE[locale] } as Metadata['openGraph'])
      : meta.openGraph,
    twitter: tw ? ({ ...tw, title: tr(str(tw.title)) ?? tw.title, description: tr(str(tw.description)) ?? tw.description } as Metadata['twitter']) : meta.twitter,
  };
}

/**
 * For a page that exists only in English (its copy is not translated): the English address is the page, listed as the only language.
 * The same text under another language's prefix (/es/...) is a duplicate of it, so that address points to the English page as its
 * canonical and stays out of search results; it still works for visitors who arrive there.
 */
export async function localizeMetaEnglishOnly(meta: Metadata, options: { path?: string } = {}): Promise<Metadata> {
  const locale = await getLocale();
  const base = await localizeMeta(meta, { ...options, languages: ['en'] });
  if (locale === 'en') return base;
  const englishPath = splitLocale(options.path || str(meta.alternates?.canonical) || '/').path;
  const english = `${SITE.url}${englishPath === '/' ? '' : englishPath}`;
  return { ...base, alternates: { ...base.alternates, canonical: english }, robots: { index: false, follow: true } };
}

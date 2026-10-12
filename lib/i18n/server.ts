import 'server-only';
import { locale as rootLocale } from 'next/root-params';
import { createHash } from 'node:crypto';
import type { SupportedLocale } from './types';
import { isLocaleCode } from './paths';
import { translate, type Catalog } from './translate';
import sv from './catalog/sv.json';
import fi from './catalog/fi.json';
import it from './catalog/it.json';
import es from './catalog/es.json';

/**
 * Server side of the translation system.
 *
 * Every language's catalog is registered on globalThis when this file is first loaded. Server components read it directly,
 * and client components that the server renders to HTML (server-side rendering runs in a separate module graph from server
 * components, but in the same process) find it there too, so the HTML a visitor receives is already in their language and
 * matches what the browser renders when the page comes alive.
 */

export const CATALOGS: Record<Exclude<SupportedLocale, 'en'>, Catalog> = { sv, fi, it, es };

globalThis.__I18N = CATALOGS;

/** The language of the page being rendered, from the address (/sv/pricing → "sv"; no prefix → "en"). */
export async function getLocale(): Promise<SupportedLocale> {
  const value = await rootLocale();
  return isLocaleCode(value) ? value : 'en';
}

/** A translate function for server components and metadata. */
export async function getT(): Promise<(text: string, values?: Record<string, string | number | null | undefined>) => string> {
  const loc = await getLocale();
  return (text, values) => translate(text, loc, values);
}

const versions = new Map<string, string>();

/** A short fingerprint of a language's catalog, so the browser can cache the file for a year and still get edits. */
export function catalogVersion(loc: Exclude<SupportedLocale, 'en'>): string {
  let v = versions.get(loc);
  if (!v) {
    v = createHash('sha1').update(JSON.stringify(CATALOGS[loc])).digest('hex').slice(0, 10);
    versions.set(loc, v);
  }
  return v;
}

/** The script the page loads (in <head>, before anything renders) so the browser has the same catalog the server used. */
export function catalogScript(loc: SupportedLocale): { src: string } | null {
  if (loc === 'en') return null;
  return { src: `/i18n/${loc}.js?v=${catalogVersion(loc)}` };
}

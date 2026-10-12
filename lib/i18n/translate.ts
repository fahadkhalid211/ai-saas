import type { SupportedLocale } from './types';

/**
 * The translation catalog: a flat object from the English text, exactly as the page writes it, to the same text in another
 * language. A text with no entry is shown in English, so a missing translation can never break a page or show a blank.
 *
 *   { "Start free trial": "Aloita ilmainen kokeilu", "{count} leads": "{count} liidiä" }
 *
 * Texts may hold {name} placeholders, filled from the values passed to t().
 */
export type Catalog = Record<string, string>;

declare global {
  // eslint-disable-next-line no-var
  var __I18N: Partial<Record<SupportedLocale, Catalog>> | undefined;
}

/** Whitespace in JSX is arbitrary (line breaks, indentation); the catalog key is the text with it collapsed. */
export function normalizeKey(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** The catalog of a language. On the server every language is registered at start-up; in the browser only the page's own. */
export function catalogFor(locale: SupportedLocale): Catalog | undefined {
  if (locale === 'en') return undefined;
  return globalThis.__I18N?.[locale];
}

function fill(text: string, values?: Record<string, string | number | null | undefined>): string {
  if (!values) return text;
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in values ? String(values[name] ?? '') : m));
}

/**
 * Translates one text. Leading and trailing spaces of the original are kept, because JSX puts words next to elements and
 * the space belongs to the layout, not to the sentence.
 */
export function translate(text: string, locale: SupportedLocale, values?: Record<string, string | number | null | undefined>): string {
  if (locale === 'en' || !text) return fill(text, values);
  const catalog = catalogFor(locale);
  if (!catalog) return fill(text, values);
  const key = normalizeKey(text);
  if (!key) return text;
  const hit = catalog[key];
  if (hit === undefined || hit === '') return fill(text, values);
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  return lead + fill(hit, values) + trail;
}

/** Whether the text has a translation (used by tests and the extraction script). */
export function hasTranslation(text: string, locale: SupportedLocale): boolean {
  if (locale === 'en') return true;
  const hit = catalogFor(locale)?.[normalizeKey(text)];
  return typeof hit === 'string' && hit !== '';
}

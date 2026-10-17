import 'server-only';
import type { SupportedLocale } from '@/lib/i18n/types';
import { getPostResolved } from './resolve';
import { hasBlogTranslation, loadTranslation } from './translations';
import type { BlogBlock, BlogPost } from './posts';

/**
 * A blog article in another language. The English article stays the source of truth: a translation holds only the words
 * (title, description, excerpt, headings, paragraphs, list items, table cells, questions and answers). Everything else
 * (slug, dates, tags, related articles, the shape of the body) is taken from the English article, so a translation can
 * never drift into a different structure or break a link.
 *
 * This file needs the article text (via the resolver). Lists and the sitemap use lib/blog/translations.ts, which does not.
 */
export { translatedSlugs, hasBlogTranslation, blogLanguages, postsForHub, type BlogTranslation } from './translations';

/** Whether the translation has the same shape as the English article (same number and kinds of blocks, same list sizes). */
export function sameShape(source: BlogBlock[], translated: BlogBlock[]): boolean {
  if (source.length !== translated.length) return false;
  return source.every((b, i) => {
    const t = translated[i];
    if (b.type !== t.type) return false;
    if ((b.type === 'ul' || b.type === 'ol') && (t.type === 'ul' || t.type === 'ol')) return b.items.length === t.items.length;
    if (b.type === 'faq' && t.type === 'faq') return b.items.length === t.items.length;
    if (b.type === 'table' && t.type === 'table') return b.headers.length === t.headers.length && b.rows.length === t.rows.length;
    return true;
  });
}

/**
 * The article in the given language, or the English article when no usable translation exists.
 * `translated` says which one came back, so the page can label and link it correctly.
 */
export async function getPostInLocale(slug: string, locale: SupportedLocale): Promise<{ post: BlogPost; translated: boolean } | undefined> {
  const en = await getPostResolved(slug);
  if (!en) return undefined;
  if (locale === 'en' || !hasBlogTranslation(locale, slug)) return { post: en, translated: false };
  const t = await loadTranslation(locale, slug);
  if (!t || !sameShape(en.body, t.body)) return { post: en, translated: false };
  // headings keep the English ids, so links and the table of contents work the same in every language
  const body = t.body.map((b, i) => {
    const src = en.body[i];
    return b.type === 'h2' && src.type === 'h2' ? { ...b, id: src.id } : b;
  });
  return {
    post: { ...en, title: t.title, seoTitle: t.seoTitle || t.title, description: t.description, excerpt: t.excerpt, clusterName: t.clusterName || en.clusterName, body },
    translated: true,
  };
}

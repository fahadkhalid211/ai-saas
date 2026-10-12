import 'server-only';
import type { SupportedLocale } from '@/lib/i18n/types';
import manifest from '@/lib/i18n/blog-manifest.json';
import { getPostResolved } from './resolve';
import type { BlogBlock, BlogPost } from './posts';

/**
 * A blog article in another language. The English article stays the source of truth: a translation holds only the words
 * (title, description, excerpt, headings, paragraphs, list items, table cells, questions and answers). Everything else
 * (slug, dates, tags, related articles, the shape of the body) is taken from the English article, so a translation can
 * never drift into a different structure or break a link.
 *
 * Files live in lib/blog/translations/<language>/<slug>.json and are written by scripts/i18n/translate-blog.mjs.
 */
export interface BlogTranslation {
  title: string;
  seoTitle?: string;
  description: string;
  excerpt: string;
  clusterName?: string;
  body: BlogBlock[];
  /** The English article's modified date when it was translated: a later edit shows the article is out of date. */
  sourceModified?: string;
}

export function translatedSlugs(locale: SupportedLocale): string[] {
  return [...((manifest as Record<string, string[]>)[locale] ?? [])];
}

export function hasBlogTranslation(locale: SupportedLocale, slug: string): boolean {
  return locale === 'en' || translatedSlugs(locale).includes(slug);
}

/** The languages an article exists in, English first. */
export function blogLanguages(slug: string): SupportedLocale[] {
  return ['en', ...((['sv', 'fi', 'it', 'es'] as const).filter((l) => hasBlogTranslation(l, slug)))];
}

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

async function load(locale: SupportedLocale, slug: string): Promise<BlogTranslation | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const mod = await import(`./translations/${locale}/${slug}.json`);
    return (mod.default ?? mod) as BlogTranslation;
  } catch {
    return null;
  }
}

/**
 * The article in the given language, or the English article when no usable translation exists.
 * `translated` says which one came back, so the page can label and link it correctly.
 */
export async function getPostInLocale(slug: string, locale: SupportedLocale): Promise<{ post: BlogPost; translated: boolean } | undefined> {
  const en = await getPostResolved(slug);
  if (!en) return undefined;
  if (locale === 'en' || !hasBlogTranslation(locale, slug)) return { post: en, translated: false };
  const t = await load(locale, slug);
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

/**
 * The posts for the blog hub in a language: the translated ones carry their translated title, excerpt and topic, the rest stay
 * in English. `translated` lists the slugs that exist in the language, so the hub can link to the English page for the others.
 */
export async function postsForHub(posts: BlogPost[], locale: SupportedLocale): Promise<{ posts: BlogPost[]; translated: string[] }> {
  if (locale === 'en') return { posts, translated: posts.map((p) => p.slug) };
  const slugs = new Set(translatedSlugs(locale));
  const out = await Promise.all(
    posts.map(async (p) => {
      if (!slugs.has(p.slug)) return p;
      const t = await load(locale, p.slug);
      return t ? { ...p, title: t.title, description: t.description, excerpt: t.excerpt, clusterName: t.clusterName || p.clusterName } : p;
    })
  );
  return { posts: out, translated: [...slugs] };
}

import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { SupportedLocale } from '@/lib/i18n/types';
import manifest from '@/lib/i18n/blog-manifest.json';
import type { BlogBlock } from './posts';
import type { BlogCard } from './card';

/**
 * The light half of the blog translations: which articles exist in which language, and the translated words for lists.
 * It must not import the article text (lib/blog/posts.ts, about 4.5 MB), so the blog index, the sitemap and other lists stay small.
 * The page-level lookup that needs the text is in lib/blog/translated.ts, which re-exports everything here.
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

/** The languages an article is available in, English first. All published articles are reachable in all supported locales. */
export function blogLanguages(_slug?: string): SupportedLocale[] {
  return ['en', 'sv', 'fi', 'it', 'es'];
}

export async function loadTranslation(locale: SupportedLocale, slug: string): Promise<BlogTranslation | null> {
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z]{2}$/.test(locale)) return null;
  try {
    const filePath = path.join(process.cwd(), 'lib', 'blog', 'translations', locale, `${slug}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as BlogTranslation;
  } catch {
    return null;
  }
}

/**
 * The articles for the blog hub in a language: the translated ones carry their translated title, excerpt and topic, the rest stay
 * in English. `translated` lists the slugs that exist in the language, so the hub can link to the English page for the others.
 */
export async function postsForHub<T extends BlogCard>(posts: T[], locale: SupportedLocale): Promise<{ posts: T[]; translated: string[] }> {
  if (locale === 'en') return { posts, translated: posts.map((p) => p.slug) };
  const slugs = new Set(translatedSlugs(locale));
  const out = await Promise.all(
    posts.map(async (p) => {
      if (!slugs.has(p.slug)) return p;
      const t = await loadTranslation(locale, p.slug);
      return t ? { ...p, title: t.title, description: t.description, excerpt: t.excerpt, clusterName: t.clusterName || p.clusterName } : p;
    })
  );
  return { posts: out, translated: [...slugs] };
}

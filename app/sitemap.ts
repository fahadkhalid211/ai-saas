import type { MetadataRoute } from 'next';
import { SITE } from '@/components/marketing/content';
import { PUBLISHED_INDEX } from '@/lib/blog';
import { releasedSlugs } from '@/lib/blog/schedule';
import { blogLanguages } from '@/lib/blog/translations';
import { HREFLANG, isLocalizablePath, localizeHref } from '@/lib/i18n/paths';
import type { SupportedLocale } from '@/lib/i18n/types';

/**
 * Only the English pages are submitted for now. Google had not read most of the Swedish, Finnish, Italian and Spanish copies, and
 * spreading its attention over five versions of every page slowed down the English ones. Those pages stay live and indexable (they
 * link to each other with hreflang on the page); add 'sv', 'fi', 'it', 'es' back here once the English pages are indexed.
 */
const SITEMAP_LOCALES: readonly SupportedLocale[] = ['en'];

/** Bump this when the marketing pages change in a way worth re-crawling. */
const SITE_UPDATED = '2026-10-23';

/** Every public page that should be in search results. Sign-in and private areas are left out on purpose. */
const PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  // Core marketing
  { path: '',                                          priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/product',                                  priority: 0.9, changeFrequency: 'monthly' },
  { path: '/product/ai-assistant', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/product/appointment-booking', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/product/lead-capture', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/product/knowledge-base', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/product/website-widget', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/product/human-handover', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/product/messaging-channels', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/playground', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/pricing',                                  priority: 0.9, changeFrequency: 'monthly' },
  { path: '/use-case',                                 priority: 0.8, changeFrequency: 'monthly' },
  { path: '/integrations',                             priority: 0.8, changeFrequency: 'monthly' },
  { path: '/roadmap',                                  priority: 0.5, changeFrequency: 'monthly' },

  // Blog hub (individual posts are added dynamically below)
  { path: '/blog',                                     priority: 0.8, changeFrequency: 'weekly'  },

  // Support hub
  { path: '/support',                                  priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/contact',                          priority: 0.6, changeFrequency: 'yearly'  },

  // AI connector guides
  { path: '/support/ai-connectors',                   priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/ai-connectors/openai',             priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/ai-connectors/anthropic',          priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/ai-connectors/gemini',             priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/ai-connectors/groq',               priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/ai-connectors/deepseek',           priority: 0.6, changeFrequency: 'monthly' },
  { path: '/support/ai-connectors/ollama',             priority: 0.6, changeFrequency: 'monthly' },
  { path: '/support/ai-connectors/auto-free',          priority: 0.6, changeFrequency: 'monthly' },

  // Other support guides
  { path: '/support/calendar-booking',                 priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/rag-knowledge',                    priority: 0.6, changeFrequency: 'monthly' },

  // Guides
  { path: '/guides/add-ai-assistant-to-wordpress',    priority: 0.7, changeFrequency: 'monthly' },

  // Free tools
  { path: '/tools/llm-cost-calculator',                priority: 0.8, changeFrequency: 'monthly' },

  // Status & Utility
  { path: '/status',                                   priority: 0.5, changeFrequency: 'weekly'  },
  { path: '/report-bug',                               priority: 0.4, changeFrequency: 'monthly' },

  // Legal (low priority, rarely changes)
  { path: '/terms',            priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy',          priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies',          priority: 0.2, changeFrequency: 'yearly' },
  { path: '/accessibility',    priority: 0.3, changeFrequency: 'yearly' },
  { path: '/acceptable-use',   priority: 0.2, changeFrequency: 'yearly' },
  { path: '/dpa',              priority: 0.2, changeFrequency: 'yearly' },
  { path: '/subprocessors',    priority: 0.2, changeFrequency: 'yearly' },
];

/** One entry per language, each listing its counterparts so search engines show every visitor the right one. */
function entries(path: string, languages: readonly SupportedLocale[], rest: { lastModified: Date; changeFrequency: 'weekly' | 'monthly' | 'yearly'; priority: number }) {
  const base = path || '/';
  const urlFor = (l: SupportedLocale) => {
    const p = localizeHref(base, l);
    return `${SITE.url}${p === '/' ? '/' : p}`;
  };
  if (!isLocalizablePath(base)) return [{ url: urlFor('en'), ...rest }];
  const alternates = { languages: { ...Object.fromEntries(languages.map((l) => [HREFLANG[l], urlFor(l)])), 'x-default': urlFor('en') } };
  return languages.map((l) => ({ url: urlFor(l), ...rest, alternates }));
}

/**
 * Built for each request, never cached. The articles released so far depend on today's date (lib/blog/schedule.ts); with a cached
 * sitemap, "revalidate" did not take effect on the host and the list stayed as it was on deploy day, so the daily releases stopped.
 * It is a few hundred lines of text, so building it each time costs nothing.
 */
export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  // A page's date should change only when the page does; stamping "now" on everything teaches Google to ignore it.
  const lastModified = new Date(SITE_UPDATED);
  const pages = PAGES.flatMap((p) => entries(p.path, SITEMAP_LOCALES, { lastModified, changeFrequency: p.changeFrequency, priority: p.priority }));
  // Articles join the sitemap a few per day (lib/blog/schedule.ts), so Google meets the site gradually instead of 275 pages at once.
  const released = new Set(releasedSlugs());
  const posts = PUBLISHED_INDEX.filter((b) => released.has(b.slug)).flatMap((b) =>
    entries(`/blog/${b.slug}`, blogLanguages(b.slug).filter((l) => SITEMAP_LOCALES.includes(l)), { lastModified: new Date(b.dateModified), changeFrequency: 'monthly' as const, priority: 0.6 })
  );
  return [...pages, ...posts];
}

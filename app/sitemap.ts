import type { MetadataRoute } from 'next';
import { SITE } from '@/components/marketing/content';
import { PUBLISHED_POSTS } from '@/lib/blog/posts';

/** Bump this when the marketing pages change in a way worth re-crawling. */
const SITE_UPDATED = '2026-10-07';

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

export default function sitemap(): MetadataRoute.Sitemap {
  // A page's date should change only when the page does; stamping "now" on everything teaches Google to ignore it.
  const lastModified = new Date(SITE_UPDATED);
  const pages = PAGES.map((p) => ({
    url: p.path ? `${SITE.url}${p.path}` : `${SITE.url}/`,
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
  const posts = PUBLISHED_POSTS.map((b) => ({
    url: `${SITE.url}/blog/${b.slug}`,
    lastModified: new Date(b.dateModified),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  return [...pages, ...posts];
}

import type { MetadataRoute } from 'next';
import { SITE } from '@/components/marketing/content';
import { BLOG_POSTS } from '@/lib/blog/posts';

/** Every public page that should be in search results. Sign-in and private areas are left out on purpose. */
const PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/product', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/use-case', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/integrations', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/roadmap', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/support', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/support/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/support/ai-connectors', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/support/voice-agent', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/support/calendar-booking', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/support/rag-knowledge', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/guides/add-ai-assistant-to-wordpress', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/acceptable-use', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/dpa', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/subprocessors', priority: 0.2, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = PAGES.map((p) => ({ url: `${SITE.url}${p.path}`, lastModified, changeFrequency: p.changeFrequency, priority: p.priority }));
  const posts = BLOG_POSTS.map((b) => ({ url: `${SITE.url}/blog/${b.slug}`, lastModified: new Date(b.dateModified), changeFrequency: 'monthly' as const, priority: 0.6 }));
  return [...pages, ...posts];
}

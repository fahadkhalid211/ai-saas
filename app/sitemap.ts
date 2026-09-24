import type { MetadataRoute } from 'next';
import { SITE } from '@/components/marketing/content';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/login`, changeFrequency: 'yearly', priority: 0.3 },
    ...['terms', 'privacy', 'cookies', 'acceptable-use', 'dpa', 'subprocessors'].map((p) => ({ url: `${SITE.url}/${p}`, changeFrequency: 'yearly' as const, priority: 0.3 })),
  ];
}

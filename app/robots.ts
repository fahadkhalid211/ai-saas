import type { MetadataRoute } from 'next';
import { SITE } from '@/components/marketing/content';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard', '/master'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

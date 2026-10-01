import type { Metadata } from 'next';
import { SITE } from '@/components/marketing/content';

/** Adds matching Open Graph, Twitter and canonical data (with absolute URLs and branded share images) to a page's metadata. */
export function withSocial(meta: Metadata, path: string): Metadata {
  const title = typeof meta.title === 'string' ? meta.title : undefined;
  const description = meta.description ?? undefined;
  const canonicalPath = meta.alternates?.canonical ? String(meta.alternates.canonical) : path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const absoluteUrl = `${SITE.url}${cleanPath === '/' ? '' : cleanPath}`;
  const images = [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Crescelo: AI website assistant for service businesses' }];

  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      siteName: 'Crescelo',
      locale: 'en_US',
      url: absoluteUrl,
      title,
      description,
      images,
      ...meta.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: '/twitter-image', alt: 'Crescelo: AI website assistant for service businesses' }],
      ...meta.twitter,
    },
  };
}

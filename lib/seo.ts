import type { Metadata } from 'next';

/** Adds matching Open Graph and Twitter data (title, description, this page's own URL and the branded share image) to a page's metadata. */
export function withSocial(meta: Metadata, path: string): Metadata {
  const title = typeof meta.title === 'string' ? meta.title : undefined;
  const description = meta.description ?? undefined;
  const images = [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Crescelo: AI website assistant for service businesses' }];
  return {
    ...meta,
    openGraph: { type: 'website', siteName: 'Crescelo', locale: 'en_US', url: path, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: '/twitter-image', alt: 'Crescelo: AI website assistant for service businesses' }] },
  };
}

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Crescelo',
    short_name: 'Crescelo',
    description: 'An AI website assistant for service businesses: answers visitors, books appointments and captures leads.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffeeb',
    theme_color: '#08251a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

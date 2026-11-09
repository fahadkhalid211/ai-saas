import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

const description = 'How salons, clinics, estate agents, gyms, law firms and trades use a Crescelo assistant to answer visitors, book appointments and capture leads.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'AI Assistants for Service Industries | Crescelo',
  description,
  alternates: { canonical: '/use-case' },
}, '/use-case'));
}

// The page's own structured data lives in page.tsx, so the industry pages under /use-case/<slug> do not inherit this page's.
export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = withSocial({
  title: 'AI Assistants for Service Industries | Crescelo',
  description: 'How salons, clinics, real estate agents, fitness studios, legal practices and agencies use a Crescelo assistant to answer visitors, book appointments and capture leads.',
  alternates: { canonical: '/use-case' },
}, '/use-case');

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

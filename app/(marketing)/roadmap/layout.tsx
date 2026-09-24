import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = withSocial({
  title: 'Crescelo Product Roadmap & Release Status',
  description: 'What is available today, what is in beta and what is planned next for Crescelo, kept in step with what actually ships.',
  alternates: { canonical: '/roadmap' },
}, '/roadmap');

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

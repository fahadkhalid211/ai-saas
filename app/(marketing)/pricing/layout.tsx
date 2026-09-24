import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = withSocial({
  title: 'Crescelo Pricing | Plans & Usage Costs',
  description: 'Compare Crescelo plans for website assistants, bookings and lead capture. See included chat sessions, overage rates and separate AI provider usage charges.',
  alternates: { canonical: '/pricing' },
}, '/pricing');

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

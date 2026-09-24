import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = withSocial({
  title: 'Contact Crescelo | Sales & Technical Support',
  description: 'Talk to the Crescelo team about plans, setup or a problem. Send a message and we reply by email.',
  alternates: { canonical: '/support/contact' },
}, '/support/contact');

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

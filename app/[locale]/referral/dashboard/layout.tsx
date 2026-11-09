import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A sign-in / account screen of the partner portal: useful to partners, not something to show in search results.
export const metadata: Metadata = {
  title: 'Partner dashboard | Crescelo',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// A private page: never indexed, and the link's token is never sent on to other sites.
export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta({
  title: 'Your support ticket | Crescelo',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
});
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

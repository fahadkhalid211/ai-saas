import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta({
  title: 'Crescelo Widget',
  robots: { index: false, follow: false },
});
}

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

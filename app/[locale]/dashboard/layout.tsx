import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta({
  title: 'Dashboard | Crescelo',
  robots: { index: false, follow: false, nocache: true },
});
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

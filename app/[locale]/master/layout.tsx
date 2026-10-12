import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';

// Unlinked and kept out of search engines. Access is enforced by the API, not by hiding the page.
export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta({
  title: 'Crescelo',
  robots: { index: false, follow: false, nocache: true },
});
}

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

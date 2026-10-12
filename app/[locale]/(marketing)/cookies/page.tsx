import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { COOKIES } from '@/lib/legal/documents';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Cookie Policy | Crescelo',
  description: `${COOKIES.summary} Includes the full list and how to change your choice.`,
  alternates: { canonical: '/cookies' },
}, '/cookies'));
}

export default function Page() {
  return <LegalPage doc={COOKIES} />;
}

import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { COOKIES } from '@/lib/legal/documents';

export const metadata: Metadata = withSocial({
  title: 'Cookie Policy | Crescelo',
  description: `${COOKIES.summary} Includes the full list and how to change your choice.`,
  alternates: { canonical: '/cookies' },
}, '/cookies');

export default function Page() {
  return <LegalPage doc={COOKIES} />;
}

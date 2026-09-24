import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { COOKIES } from '@/lib/legal/documents';

export const metadata: Metadata = {
  title: 'Cookie Policy | Crescelo',
  description: COOKIES.summary,
  alternates: { canonical: '/cookies' },
};

export default function Page() {
  return <LegalPage doc={COOKIES} />;
}

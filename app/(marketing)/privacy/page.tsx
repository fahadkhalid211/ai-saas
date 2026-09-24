import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { PRIVACY } from '@/lib/legal/documents';

export const metadata: Metadata = {
  title: 'Privacy Policy | Crescelo',
  description: PRIVACY.summary,
  alternates: { canonical: '/privacy' },
};

export default function Page() {
  return <LegalPage doc={PRIVACY} />;
}

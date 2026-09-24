import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { TERMS } from '@/lib/legal/documents';

export const metadata: Metadata = {
  title: 'Terms of Service | Crescelo',
  description: TERMS.summary,
  alternates: { canonical: '/terms' },
};

export default function Page() {
  return <LegalPage doc={TERMS} />;
}

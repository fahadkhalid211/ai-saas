import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { AUP } from '@/lib/legal/documents';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | Crescelo',
  description: AUP.summary,
  alternates: { canonical: '/acceptable-use' },
};

export default function Page() {
  return <LegalPage doc={AUP} />;
}

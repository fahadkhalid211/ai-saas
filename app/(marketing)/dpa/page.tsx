import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { DPA } from '@/lib/legal/documents';

export const metadata: Metadata = {
  title: 'Data Processing Addendum | Crescelo',
  description: DPA.summary,
  alternates: { canonical: '/dpa' },
};

export default function Page() {
  return <LegalPage doc={DPA} />;
}

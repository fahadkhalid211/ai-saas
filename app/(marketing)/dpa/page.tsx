import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { DPA } from '@/lib/legal/documents';

export const metadata: Metadata = withSocial({
  title: 'Data Processing Addendum | Crescelo',
  description: DPA.summary,
  alternates: { canonical: '/dpa' },
}, '/dpa');

export default function Page() {
  return <LegalPage doc={DPA} />;
}

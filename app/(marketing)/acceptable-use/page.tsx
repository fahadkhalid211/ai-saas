import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { AUP } from '@/lib/legal/documents';

export const metadata: Metadata = withSocial({
  title: 'Acceptable Use Policy | Crescelo',
  description: AUP.summary,
  alternates: { canonical: '/acceptable-use' },
}, '/acceptable-use');

export default function Page() {
  return <LegalPage doc={AUP} />;
}

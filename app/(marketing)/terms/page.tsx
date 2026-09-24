import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { TERMS } from '@/lib/legal/documents';

export const metadata: Metadata = withSocial({
  title: 'Terms of Service | Crescelo',
  description: TERMS.summary,
  alternates: { canonical: '/terms' },
}, '/terms');

export default function Page() {
  return <LegalPage doc={TERMS} />;
}

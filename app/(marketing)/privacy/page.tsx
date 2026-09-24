import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { PRIVACY } from '@/lib/legal/documents';

export const metadata: Metadata = withSocial({
  title: 'Privacy Policy | Crescelo',
  description: PRIVACY.summary,
  alternates: { canonical: '/privacy' },
}, '/privacy');

export default function Page() {
  return <LegalPage doc={PRIVACY} />;
}

import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { PRIVACY } from '@/lib/legal/documents';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Privacy Policy | Crescelo',
  description: PRIVACY.summary,
  alternates: { canonical: '/privacy' },
}, '/privacy'));
}

export default function Page() {
  return <LegalPage doc={PRIVACY} />;
}

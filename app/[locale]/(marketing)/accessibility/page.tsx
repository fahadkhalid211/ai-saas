import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { ACCESSIBILITY } from '@/lib/legal/documents';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Accessibility Statement | Crescelo',
  description: `${ACCESSIBILITY.summary}`.slice(0, 160),
  alternates: { canonical: '/accessibility' },
}, '/accessibility'));
}

export default function Page() {
  return <LegalPage doc={ACCESSIBILITY} />;
}

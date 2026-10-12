import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { AUP } from '@/lib/legal/documents';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Acceptable Use Policy | Crescelo',
  description: AUP.summary,
  alternates: { canonical: '/acceptable-use' },
}, '/acceptable-use'));
}

export default function Page() {
  return <LegalPage doc={AUP} />;
}

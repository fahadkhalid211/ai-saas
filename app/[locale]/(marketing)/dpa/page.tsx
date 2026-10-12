import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { DPA } from '@/lib/legal/documents';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Data Processing Addendum | Crescelo',
  description: DPA.summary,
  alternates: { canonical: '/dpa' },
}, '/dpa'));
}

export default function Page() {
  return <LegalPage doc={DPA} />;
}

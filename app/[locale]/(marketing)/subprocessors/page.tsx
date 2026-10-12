import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import { LegalPage } from '@/components/marketing/LegalPage';
import { LEGAL, SUBPROCESSORS } from '@/lib/legal/config';
import type { LegalDocument } from '@/lib/legal/documents';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Sub-processors | Crescelo',
  description: 'The providers that process personal data on behalf of Crescelo and its customers, what they do, what data they see and where they operate.',
  alternates: { canonical: '/subprocessors' },
}, '/subprocessors'));
}

const doc: LegalDocument = {
  slug: 'subprocessors',
  title: 'Sub-processors',
  eyebrow: 'Legal',
  summary: 'The providers that may process personal data on behalf of Crescelo and its customers, and what each is used for.',
  sections: [
    {
      id: 'about',
      heading: 'About this list',
      body: [
        'Crescelo uses the providers below to run the service. Each is bound by data-protection terms no less protective than our Data Processing Addendum (/dpa). Customers who connect their own AI provider, calendar or other tool control that connection themselves.',
        `We will update this page at least 14 days before a new sub-processor starts processing customer personal data. To be told about changes, send a request through ${LEGAL.contactUrl} with the subject "Sub-processor updates".`,
      ],
    },
    {
      id: 'list',
      heading: 'Current sub-processors',
      body: [{ list: SUBPROCESSORS.map((s) => `${s.name}: ${s.purpose}. Data: ${s.data}. Location: ${s.location}.`) }],
    },
  ],
};

export default function Page() {
  return <LegalPage doc={doc} />;
}

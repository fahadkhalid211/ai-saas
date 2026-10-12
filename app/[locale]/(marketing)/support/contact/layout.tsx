import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, softwareSchema, webPageSchema } from '@/lib/schema';

const description = 'Contact the Crescelo team about plans, setup or a problem. Every message opens a support ticket you can follow, and we reply by email.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Contact Crescelo | Sales & Technical Support',
  description,
  alternates: { canonical: '/support/contact' },
}, '/support/contact'));
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[webPageSchema('Contact Crescelo', description, '/support/contact', 'ContactPage'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'Contact', path: '/support/contact' }])]} />
      {children}
    </>
  );
}

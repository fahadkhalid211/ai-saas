import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, softwareSchema, webPageSchema } from '@/lib/schema';

const description = 'What is available today, what is in beta and what is planned next for Crescelo, kept in step with what actually ships.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Crescelo Product Roadmap & Release Status',
  description,
  alternates: { canonical: '/roadmap' },
}, '/roadmap'));
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[webPageSchema('Crescelo Product Roadmap & Release Status', description, '/roadmap', 'WebPage'), breadcrumbSchema([{ name: 'Roadmap', path: '/roadmap' }])]} />
      {children}
    </>
  );
}

import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, softwareSchema, webPageSchema } from '@/lib/schema';

const description = 'Compare Crescelo plans for website assistants, bookings and lead capture. See included chat sessions, overage rates and separate AI provider usage charges.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Crescelo Pricing | Plans & Usage Costs',
  description,
  alternates: { canonical: '/pricing' },
}, '/pricing'));
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[webPageSchema('Crescelo Pricing', description, '/pricing', 'WebPage'), breadcrumbSchema([{ name: 'Pricing', path: '/pricing' }]), softwareSchema()]} />
      {children}
    </>
  );
}

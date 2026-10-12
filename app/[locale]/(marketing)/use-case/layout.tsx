import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, softwareSchema, webPageSchema } from '@/lib/schema';

const description = 'How salons, clinics, real estate agents, fitness studios, legal practices and agencies use a Crescelo assistant to answer visitors, book appointments and capture leads.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'AI Assistants for Service Industries | Crescelo',
  description,
  alternates: { canonical: '/use-case' },
}, '/use-case'));
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[webPageSchema('AI Assistants for Service Industries', description, '/use-case', 'WebPage'), breadcrumbSchema([{ name: 'Use cases', path: '/use-case' }])]} />
      {children}
    </>
  );
}

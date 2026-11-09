import { localizeMetaEnglishOnly } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { SITE } from '@/components/marketing/content';

const title = 'Custom AI Development: Chatbots & Agents | Crescelo';
const description = 'Crescelo builds custom AI for your business: support chatbots, knowledge-base assistants, agent workflows and API integrations. Get a free written quote.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMetaEnglishOnly(withSocial({ title, description, alternates: { canonical: '/custom-ai' } }, '/custom-ai'), { path: '/custom-ai' });
}

/** The services arm of the same company, described as a Service so search engines tell it apart from the Crescelo software product. */
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE.url}/custom-ai#service`,
  name: 'Custom AI development',
  serviceType: 'Custom AI chatbot, agent and integration development',
  description,
  url: `${SITE.url}/custom-ai`,
  provider: { '@id': `${SITE.url}/#organization` },
  areaServed: 'Worldwide',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[webPageSchema('Custom AI Development', description, '/custom-ai'), breadcrumbSchema([{ name: 'Custom AI', path: '/custom-ai' }]), serviceSchema]} />
      {children}
    </>
  );
}

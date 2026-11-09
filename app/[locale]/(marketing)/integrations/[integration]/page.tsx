import { localizeMetaEnglishOnly } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IntegrationPage } from '@/components/marketing/IntegrationPage';
import { INTEGRATION_PAGES, integrationPageBySlug } from '@/lib/integration-pages';
import { withSocial } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return INTEGRATION_PAGES.map((i) => ({ integration: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ integration: string }> }): Promise<Metadata> {
  const { integration } = await params;
  const i = integrationPageBySlug(integration);
  if (!i) return {};
  const path = `/integrations/${i.slug}`;
  return localizeMetaEnglishOnly(withSocial({ title: `${i.seoTitle} | Crescelo`, description: i.seoDescription, alternates: { canonical: path } }, path), { path });
}

export default async function IntegrationRoute({ params }: { params: Promise<{ integration: string }> }) {
  const { integration } = await params;
  const i = integrationPageBySlug(integration);
  if (!i) notFound();
  return <IntegrationPage integration={i} />;
}

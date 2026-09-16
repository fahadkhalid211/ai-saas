import React from 'react';
import { Metadata } from 'next';
import { Database } from '@/lib/db';
import { getLandingConfigForSlugOrTemplate } from '@/lib/landing/types';
import HostedBusinessSiteClient from './HostedBusinessSiteClient';

interface SitePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { id } = await params;
  const page = await Database.getLandingPageBySlugOrDomain(id);
  const config = page || getLandingConfigForSlugOrTemplate(id);
  const title =
    config?.seo?.metaTitle ||
    (config?.businessName ? `${config.businessName} - Official Booking & Services` : 'Online Booking & Services');
  const description = config?.seo?.metaDescription || config?.heroSubheadline || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: config?.seo?.ogImageUrl || config?.heroImageUrl ? [config.seo?.ogImageUrl || config.heroImageUrl!] : undefined,
    },
  };
}

export default async function HostedBusinessSite({ params }: SitePageProps) {
  const { id } = await params;
  const page = await Database.getLandingPageBySlugOrDomain(id);
  const initialConfig = page || getLandingConfigForSlugOrTemplate(id) || null;

  let initialAssistant: any = null;
  if (initialConfig?.assistantId && initialConfig.assistantId !== 'none') {
    initialAssistant = await Database.getAssistantById(initialConfig.assistantId);
  }

  return (
    <HostedBusinessSiteClient
      identifier={id}
      initialConfig={initialConfig}
      initialAssistant={initialAssistant}
    />
  );
}

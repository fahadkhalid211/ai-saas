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

  const ogImage = config?.seo?.ogImageUrl || config?.heroImageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function HostedBusinessSite({ params }: SitePageProps) {
  const { id } = await params;
  const page = await Database.getLandingPageBySlugOrDomain(id);
  const initialConfig = page || getLandingConfigForSlugOrTemplate(id) || null;

  let initialAssistant: any = null;
  if (initialConfig?.assistantId && initialConfig.assistantId !== 'none') {
    const rawAssistant = await Database.getAssistantById(initialConfig.assistantId);
    if (rawAssistant) {
      initialAssistant = {
        id: rawAssistant.id,
        name: rawAssistant.name,
        welcomeMessage: rawAssistant.welcomeMessage,
        starterQuestions: rawAssistant.starterQuestions || [],
        fallbackMessage: rawAssistant.fallbackMessage || '',
        primaryColor: rawAssistant.primaryColor || '#2563eb',
        launcherPosition: rawAssistant.launcherPosition || 'bottom-right',
        collectLeadEmail: rawAssistant.collectLeadEmail || false,
        supportCustomFields: rawAssistant.supportCustomFields || [],
        whiteLabelEnabled: rawAssistant.whiteLabelEnabled || false,
        customBrandingText: rawAssistant.customBrandingText || '',
        customBrandingUrl: rawAssistant.customBrandingUrl || '',
        bookingEnabled: rawAssistant.bookingEnabled || false,
        bookingProvider: rawAssistant.bookingProvider || 'direct',
        bookingUrl: rawAssistant.bookingUrl || '',
        bookingPromptText: rawAssistant.bookingPromptText || 'Schedule an Appointment',
        bookingSlotDuration: rawAssistant.bookingSlotDuration || 30,
        bookingStartHour: rawAssistant.bookingStartHour || '09:00',
        bookingEndHour: rawAssistant.bookingEndHour || '17:00',
        bookingAvailableDays: rawAssistant.bookingAvailableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      };
    }
  }

  return (
    <HostedBusinessSiteClient
      identifier={id}
      initialConfig={initialConfig}
      initialAssistant={initialAssistant}
    />
  );
}

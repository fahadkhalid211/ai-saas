import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, softwareSchema, webPageSchema } from '@/lib/schema';

const description = 'Connect Crescelo to your Google, Apple or Outlook calendar, Slack, Google Sheets, webhooks and Zapier, plus WhatsApp, Telegram and the AI provider you choose.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Calendar, Messaging & AI Integrations | Crescelo',
  description,
  alternates: { canonical: '/integrations' },
}, '/integrations'));
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[webPageSchema('Calendar, Messaging & AI Integrations', description, '/integrations', 'WebPage'), breadcrumbSchema([{ name: 'Integrations', path: '/integrations' }])]} />
      {children}
    </>
  );
}

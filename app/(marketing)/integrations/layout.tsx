import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, softwareSchema, webPageSchema } from '@/lib/schema';

const description = 'Connect Crescelo to Google Calendar, Slack, Google Sheets, webhooks and Zapier, plus WhatsApp, Telegram, phone and the AI provider you choose.';

export const metadata: Metadata = withSocial({
  title: 'Calendar, Messaging & AI Integrations | Crescelo',
  description,
  alternates: { canonical: '/integrations' },
}, '/integrations');

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[webPageSchema('Calendar, Messaging & AI Integrations', description, '/integrations', 'WebPage'), breadcrumbSchema([{ name: 'Integrations', path: '/integrations' }])]} />
      {children}
    </>
  );
}

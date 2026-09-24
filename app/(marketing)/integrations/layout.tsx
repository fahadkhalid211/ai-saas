import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = withSocial({
  title: 'Calendar, Messaging & AI Integrations | Crescelo',
  description: 'Connect Crescelo to Google Calendar, Slack, Google Sheets, webhooks and Zapier, plus WhatsApp, Telegram, phone and the AI provider you choose.',
  alternates: { canonical: '/integrations' },
}, '/integrations');

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

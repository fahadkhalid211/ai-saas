import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

const description = 'Connect Crescelo to WhatsApp, Telegram, Slack, Google Sheets and webhooks, subscribe to bookings in your calendar app and use your own AI provider.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Calendar, Messaging & AI Integrations | Crescelo',
  description,
  alternates: { canonical: '/integrations' },
}, '/integrations'));
}

// The page's own structured data lives in page.tsx, so the pages under /integrations/<slug> do not inherit this page's.
export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

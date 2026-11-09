import { localizeMeta } from '@/lib/i18n/metadata';
import { Metadata } from 'next';
import { PublicStatusPage } from '@/components/monitoring/PublicStatusPage';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';

const title = 'Crescelo System Status | Live Operational Health & Uptime';
const description = 'Real-time operational status, health probes, uptime metrics, and incident reports for Crescelo SaaS.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial(
  {
    title,
    description,
    alternates: { canonical: '/status' },
    // A live utility page: its numbers change by the minute and nobody searches for it, so it stays out of results.
    // Links on it are still followed.
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  },
  '/status'
));
}

export default function StatusPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema('Crescelo System Status', description, '/status', 'WebPage'),
          breadcrumbSchema([{ name: 'System Status', path: '/status' }]),
        ]}
      />
      <PublicStatusPage />
    </>
  );
}

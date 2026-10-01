import { Metadata } from 'next';
import { PublicStatusPage } from '@/components/monitoring/PublicStatusPage';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { withSocial } from '@/lib/seo';

const title = 'Crescelo System Status | Live Operational Health & Uptime';
const description = 'Real-time operational status, health probes, uptime metrics, and incident reports for Crescelo SaaS.';

export const metadata: Metadata = withSocial(
  {
    title,
    description,
    alternates: { canonical: '/status' },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  },
  '/status'
);

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

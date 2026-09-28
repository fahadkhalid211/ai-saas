import { Metadata } from 'next';
import { PublicStatusPage } from '@/components/monitoring/PublicStatusPage';

export const metadata: Metadata = {
  title: 'Crescelo System Status | Live Operational Health & Uptime',
  description: 'Real-time operational status, health probes, uptime metrics, and incident reports for Crescelo SaaS.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function StatusPage() {
  return <PublicStatusPage />;
}

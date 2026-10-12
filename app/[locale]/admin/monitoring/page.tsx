import { localizeMeta } from '@/lib/i18n/metadata';
import { Metadata } from 'next';
import { DevMonitoringDashboard } from '@/components/monitoring/DevMonitoringDashboard';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta({
  title: 'Internal System Monitoring | Crescelo Developer Console',
  description: 'Internal operational telemetry, error investigation, incident timeline, and health checks.',
  robots: {
    index: false,
    follow: false,
  },
});
}

export default function AdminMonitoringPage() {
  return <DevMonitoringDashboard />;
}

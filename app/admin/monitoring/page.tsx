import { Metadata } from 'next';
import { DevMonitoringDashboard } from '@/components/monitoring/DevMonitoringDashboard';

export const metadata: Metadata = {
  title: 'Internal System Monitoring | Crescelo Developer Console',
  description: 'Internal operational telemetry, error investigation, incident timeline, and health checks.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminMonitoringPage() {
  return <DevMonitoringDashboard />;
}

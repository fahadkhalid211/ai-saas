import { permanentRedirect } from 'next/navigation';

export default function SupportReportBugRedirect() {
  permanentRedirect('/report-bug');
}

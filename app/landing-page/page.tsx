import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

export const metadata: Metadata = {
  title: 'Crescelo - Anti-Chatbase Autonomous Website Agents & Calendar Booking',
  description: 'Deploy autonomous AI website agents that book appointments and close leads with zero token markup. Full alternative to Chatbase with calendar scheduling and 11 industry templates.',
  alternates: { canonical: '/' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Crescelo - Anti-Chatbase Autonomous Website Agents & Calendar Booking',
    description: 'Deploy autonomous AI website agents that book appointments and close leads with zero token markup. Full alternative to Chatbase with calendar scheduling and 11 industry templates.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crescelo - Anti-Chatbase Autonomous Website Agents & Calendar Booking',
    description: 'Deploy autonomous AI website agents that book appointments and close leads with zero token markup.',
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}

import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

const description = 'See what a Crescelo assistant does: answers questions from your own documents, books appointments in the chat, captures leads and hands over to your team.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'AI Chatbot & Appointment Booking Features | Crescelo',
  description,
  alternates: { canonical: '/product' },
}, '/product'));
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

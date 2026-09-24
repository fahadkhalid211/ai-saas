import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = withSocial({
  title: 'AI Chatbot & Appointment Booking Features | Crescelo',
  description: 'See what a Crescelo assistant does: answers questions from your own documents, books appointments in the chat, captures leads, answers phone calls and hands over to your team.',
  alternates: { canonical: '/product' },
}, '/product');

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

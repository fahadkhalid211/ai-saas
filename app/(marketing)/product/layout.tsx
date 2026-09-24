import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, softwareSchema, webPageSchema } from '@/lib/schema';

const description = 'See what a Crescelo assistant does: answers questions from your own documents, books appointments in the chat, captures leads, answers phone calls and hands over to your team.';

export const metadata: Metadata = withSocial({
  title: 'AI Chatbot & Appointment Booking Features | Crescelo',
  description,
  alternates: { canonical: '/product' },
}, '/product');

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[webPageSchema('AI Chatbot & Appointment Booking Features', description, '/product', 'WebPage'), breadcrumbSchema([{ name: 'Product', path: '/product' }])]} />
      {children}
    </>
  );
}

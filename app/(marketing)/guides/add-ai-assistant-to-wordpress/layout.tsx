import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

const title = 'How to Add an AI Assistant to WordPress | Crescelo Guide';
const description =
  'Step by step: add the Crescelo chat assistant to a WordPress site with a plugin or Elementor, check it is installed, and fix the usual problems (cache, stripped scripts, wrong address).';

export const metadata: Metadata = withSocial({
  title,
  description,
  alternates: { canonical: '/guides/add-ai-assistant-to-wordpress' },
}, '/guides/add-ai-assistant-to-wordpress');

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'WordPress guide', path: '/guides/add-ai-assistant-to-wordpress' }])]} />
      {children}
    </>
  );
}

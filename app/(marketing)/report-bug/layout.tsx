import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';

const description = 'Encountered a bug, broken feature, or unexpected glitch in Crescelo? Submit a detailed bug report directly to our engineering team for rapid triage and resolution.';

export const metadata: Metadata = withSocial({
  title: 'Report a Bug | Crescelo SaaS',
  description,
  alternates: { canonical: '/report-bug' },
}, '/report-bug');

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema('Report a Bug', description, '/report-bug', 'ContactPage'),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Support', path: '/support' },
            { name: 'Report a Bug', path: '/report-bug' },
          ]),
        ]}
      />
      {children}
    </>
  );
}

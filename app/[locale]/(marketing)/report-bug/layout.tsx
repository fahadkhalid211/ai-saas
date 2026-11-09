import { localizeMeta } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';

const description = 'Found a bug, a broken feature or an unexpected glitch in Crescelo? Send a detailed bug report to our engineering team so it can be triaged and fixed.';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  title: 'Report a Bug | Crescelo SaaS',
  description,
  alternates: { canonical: '/report-bug' },
}, '/report-bug'));
}

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

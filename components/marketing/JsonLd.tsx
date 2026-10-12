'use client';

import { SITE } from '@/components/marketing/content';
import { useI18n } from '@/lib/i18n/context';
import { localizeJsonLd } from '@/lib/i18n/jsonld';

/** `<` cannot end the script early inside JSON-LD. */
const serialize = (data: unknown) => JSON.stringify(data).replace(/</g, '\u003c');

/** Renders one or more schema.org objects as JSON-LD (data for search engines, never executed), in the page's language. */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const { locale } = useI18n();
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(localizeJsonLd(d, locale, SITE.url)) }} />
      ))}
    </>
  );
}

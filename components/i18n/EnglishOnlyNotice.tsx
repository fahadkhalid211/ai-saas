'use client';

import { T, useI18n } from '@/lib/i18n/context';

/** Shown on documents that exist only in English (the legal documents), to visitors reading the site in another language. */
export function EnglishOnlyNotice() {
  const { locale } = useI18n();
  if (locale === 'en') return null;
  return (
    <p role="note" className="mk-card" style={{ padding: '0.9rem 1.1rem', marginBottom: '1.25rem', fontSize: '0.92rem', lineHeight: 1.55 }}>
      <T>This document is available in English only. The English text is the legally binding version.</T>
    </p>
  );
}

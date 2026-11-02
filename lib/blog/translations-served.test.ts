import { describe, expect, it } from 'vitest';
import { getPostInLocale } from './translated';
import { translatedSlugs } from './translations';
import { LOCALES } from '../i18n/paths';

/**
 * A translation whose structure differs from the English article (and is not marked `localized`) is silently ignored and the
 * English text is shown instead. These tests make that visible: every translation that exists must really be the one served.
 */
describe('translated articles are the ones that get served', () => {
  for (const locale of LOCALES.filter((l) => l !== 'en')) {
    it(`${locale}: every translated article is shown in ${locale}, not replaced by the English text`, async () => {
      const notServed: string[] = [];
      for (const slug of translatedSlugs(locale)) {
        const served = await getPostInLocale(slug, locale);
        if (!served?.translated) notServed.push(slug);
      }
      expect(notServed).toEqual([]);
    }, 60_000);
  }

  it('a localized Spanish edition keeps its own structure, and its heading anchors are unique and clean', async () => {
    const served = await getPostInLocale('conversational-lead-capture', 'es');
    expect(served?.translated).toBe(true);
    const ids = (served!.post.body as Array<{ type: string; id?: string }>).filter((b) => b.type === 'h2').map((b) => b.id as string);
    expect(ids.length).toBeGreaterThan(15);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
    expect(served!.post.seoTitle).toBe('Captación de leads con chatbot: guía práctica | Crescelo');
    expect(JSON.stringify(served!.post.body)).toContain('LOPDGDD');
  });
});

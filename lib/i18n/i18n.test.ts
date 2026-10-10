import { describe, expect, it } from 'vitest';
import { resolveGeoLocale, isValidLocale, getLocaleInfo } from './config';
import { DICTIONARIES, getDictionary } from './dictionaries';
import { SUPPORTED_LOCALES, type SupportedLocale } from './types';

describe('i18n and Geo-Detection Engine', () => {
  it('correctly maps Sweden (SE) to Swedish (sv) with SEK currency', () => {
    const res = resolveGeoLocale('SE', 'en-US,en;q=0.9');
    expect(res.locale).toBe('sv');
    expect(res.country).toBe('SE');
    expect(res.countryName).toBe('Sweden');
    expect(res.isAutoDetected).toBe(true);

    const info = getLocaleInfo('sv');
    expect(info.currencyCode).toBe('SEK');
    expect(info.nativeLabel).toBe('Svenska');
  });

  it('correctly maps Finland (FI) to Finnish (fi)', () => {
    const res = resolveGeoLocale('FI');
    expect(res.locale).toBe('fi');
    expect(res.country).toBe('FI');
    expect(res.countryName).toBe('Finland');
    expect(res.isAutoDetected).toBe(true);

    const info = getLocaleInfo('fi');
    expect(info.currencyCode).toBe('EUR');
    expect(info.nativeLabel).toBe('Suomi');
  });

  it('correctly maps Italy (IT) to Italian (it)', () => {
    const res = resolveGeoLocale('IT');
    expect(res.locale).toBe('it');
    expect(res.country).toBe('IT');
    expect(res.countryName).toBe('Italy');
    expect(res.isAutoDetected).toBe(true);

    const info = getLocaleInfo('it');
    expect(info.currencyCode).toBe('EUR');
    expect(info.nativeLabel).toBe('Italiano');
  });

  it('correctly maps Spain (ES) and Latin America (MX, AR, CO, etc.) to Spanish (es)', () => {
    const spain = resolveGeoLocale('ES');
    expect(spain.locale).toBe('es');
    expect(spain.country).toBe('ES');
    expect(spain.countryName).toBe('Spain');
    expect(spain.isAutoDetected).toBe(true);

    const mexico = resolveGeoLocale('MX');
    expect(mexico.locale).toBe('es');
    expect(mexico.country).toBe('MX');
    expect(mexico.countryName).toBe('Mexico');
    expect(mexico.isAutoDetected).toBe(true);
  });

  it('defaults other countries (US, UK, DE, FR, etc.) to English (en)', () => {
    const us = resolveGeoLocale('US');
    expect(us.locale).toBe('en');
    expect(us.isAutoDetected).toBe(false);

    const uk = resolveGeoLocale('GB');
    expect(uk.locale).toBe('en');
    expect(uk.isAutoDetected).toBe(false);

    const germany = resolveGeoLocale('DE');
    expect(germany.locale).toBe('en');
    expect(germany.isAutoDetected).toBe(false);
  });

  it('falls back to browser Accept-Language when country header is empty', () => {
    const svBrowser = resolveGeoLocale(null, 'sv-SE,sv;q=0.9,en;q=0.8');
    expect(svBrowser.locale).toBe('sv');
    expect(svBrowser.country).toBe('SE');

    const itBrowser = resolveGeoLocale(null, 'it-IT,it;q=0.9');
    expect(itBrowser.locale).toBe('it');
  });

  it('validates supported locales properly', () => {
    expect(isValidLocale('en')).toBe(true);
    expect(isValidLocale('sv')).toBe(true);
    expect(isValidLocale('fi')).toBe(true);
    expect(isValidLocale('it')).toBe(true);
    expect(isValidLocale('es')).toBe(true);
    expect(isValidLocale('fr')).toBe(false);
    expect(isValidLocale('de')).toBe(false);
    expect(isValidLocale('')).toBe(false);
  });

  it('provides complete dictionaries for all 5 languages including Phase 2 marketing and auth sections', () => {
    const locales: SupportedLocale[] = ['en', 'sv', 'fi', 'it', 'es'];
    for (const loc of locales) {
      const dict = getDictionary(loc);
      // Phase 1
      expect(dict.nav.login).toBeDefined();
      expect(dict.nav.signup).toBeDefined();
      expect(dict.geoBanner.visitingFrom).toBeDefined();
      expect(dict.geoBanner.keep).toBeDefined();
      expect(dict.geoBanner.switchToEnglish).toBeDefined();
      expect(dict.footer.allRightsReserved).toBeDefined();

      // Phase 2 Marketing
      expect(dict.hero.eyebrow).toBeDefined();
      expect(dict.hero.title[0]).toBeDefined();
      expect(dict.hero.title[1]).toBeDefined();
      expect(dict.hero.primaryCta).toBeDefined();
      expect(dict.hero.turns.length).toBeGreaterThanOrEqual(3);

      expect(dict.story.title).toBeDefined();
      expect(dict.story.before.length).toBeGreaterThanOrEqual(4);
      expect(dict.story.after.length).toBeGreaterThanOrEqual(3);

      expect(dict.demo.question).toBeDefined();
      expect(dict.demo.groundedText).toBeDefined();

      expect(dict.useCases.items.length).toBeGreaterThanOrEqual(4);
      expect(dict.pricing.monthly).toBeDefined();
      expect(dict.pricing.annual).toBeDefined();
      expect(dict.faq.items.length).toBeGreaterThanOrEqual(8);
      expect(dict.finalCta.primary).toBeDefined();

      // Phase 2 Auth
      expect(dict.auth.registerTitle).toBeDefined();
      expect(dict.auth.loginTitle).toBeDefined();
      expect(dict.auth.continueWithGoogle).toBeDefined();
      expect(dict.auth.businessNameLabel).toBeDefined();
    }
  });
});

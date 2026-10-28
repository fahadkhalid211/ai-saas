import { describe, expect, it } from 'vitest';
import { decideRoute, type RoutingInput } from './routing';
import { isLocalizablePath, localizeHref, splitLocale, alternatesFor } from './paths';
import { translate } from './translate';
import { localizeJsonLd } from './jsonld';
import { LOCALES } from './paths';
import fs from 'node:fs';

const HUMAN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120';
const base = (over: Partial<RoutingInput>): RoutingInput => ({
  pathname: '/pricing', search: '', method: 'GET', host: 'www.crescelo.com', cookies: {}, country: null, acceptLanguage: null,
  userAgent: HUMAN, accept: 'text/html', translatedBlog: { sv: ['a-post'] }, ...over,
});

describe('paths', () => {
  it('prefixes every language but English', () => {
    expect(localizeHref('/pricing', 'sv')).toBe('/sv/pricing');
    expect(localizeHref('/', 'fi')).toBe('/fi');
    expect(localizeHref('/sv/pricing', 'en')).toBe('/pricing');
    expect(localizeHref('/pricing?x=1#a', 'es')).toBe('/es/pricing?x=1#a');
  });
  it('leaves the app, files and other sites alone', () => {
    expect(localizeHref('/dashboard', 'sv')).toBe('/dashboard');
    expect(localizeHref('/login?mode=register', 'sv')).toBe('/login?mode=register');
    expect(localizeHref('https://example.com/x', 'sv')).toBe('https://example.com/x');
    expect(localizeHref('#top', 'sv')).toBe('#top');
    expect(isLocalizablePath('/blog/feed.xml')).toBe(false);
    expect(isLocalizablePath('/api/x')).toBe(false);
  });
  it('splits a language off an address', () => {
    expect(splitLocale('/sv/blog/x')).toEqual({ locale: 'sv', path: '/blog/x' });
    expect(splitLocale('/svensk')).toEqual({ locale: null, path: '/svensk' });
    expect(alternatesFor('/pricing').map((a) => a.path)).toEqual(['/pricing', '/sv/pricing', '/fi/pricing', '/it/pricing', '/es/pricing']);
  });
});

describe('routing decisions', () => {
  it('sends a first-time visitor from Sweden to Swedish, once, and says it was automatic', () => {
    const d = decideRoute(base({ country: 'SE' }));
    expect(d).toMatchObject({ action: 'redirect', to: '/sv/pricing', private: true });
    expect((d as any).cookies.map((c: any) => c.name)).toContain('crescelo_locale_src');
  });
  it('never redirects crawlers or non-page requests', () => {
    expect(decideRoute(base({ country: 'SE', userAgent: 'Googlebot/2.1' })).action).toBe('rewrite');
    expect(decideRoute(base({ country: 'SE', accept: 'application/json' })).action).toBe('rewrite');
  });
  it('lets a saved choice win, including English', () => {
    expect(decideRoute(base({ country: 'SE', cookies: { locale: 'en' } }))).toEqual({ action: 'rewrite', to: '/en/pricing' });
    expect(decideRoute(base({ country: 'US', cookies: { locale: 'fi' } }))).toMatchObject({ action: 'redirect', to: '/fi/pricing' });
  });
  it('uses the browser language when there is no country', () => {
    expect(decideRoute(base({ acceptLanguage: 'es-ES,es;q=0.9,en;q=0.5' }))).toMatchObject({ to: '/es/pricing' });
    expect(decideRoute(base({ acceptLanguage: 'en-US,en;q=0.9,sv;q=0.4' })).action).toBe('rewrite');
  });
  it('keeps one address per language', () => {
    expect(decideRoute(base({ pathname: '/en/pricing' }))).toMatchObject({ action: 'redirect', to: '/pricing', status: 308 });
    expect(decideRoute(base({ pathname: '/sv/pricing' }))).toEqual({ action: 'pass' });
    expect(decideRoute(base({ pathname: '/sv/dashboard' }))).toMatchObject({ to: '/dashboard' });
  });
  it('retains localized route on blog articles and passes them through', () => {
    expect(decideRoute(base({ pathname: '/blog/other', country: 'SE' }))).toMatchObject({ to: '/sv/blog/other' });
    expect(decideRoute(base({ pathname: '/blog/a-post', country: 'SE' }))).toMatchObject({ to: '/sv/blog/a-post' });
    expect(decideRoute(base({ pathname: '/sv/blog/other' }))).toEqual({ action: 'pass' });
  });
  it('serves the signed-in screens in the saved or detected language at the same address', () => {
    expect(decideRoute(base({ pathname: '/dashboard', cookies: { locale: 'it' } }))).toEqual({ action: 'rewrite', to: '/it/dashboard' });
    expect(decideRoute(base({ pathname: '/embed/abc', cookies: { locale: 'it' } }))).toEqual({ action: 'rewrite', to: '/en/embed/abc' });
  });
});

describe('translate', () => {
  it('falls back to English and keeps the spaces around a text', () => {
    globalThis.__I18N = { sv: { 'Save changes': 'Spara ändringar', '{n} leads': '{n} leads' } };
    expect(translate(' Save changes ', 'sv')).toBe(' Spara ändringar ');
    expect(translate('Unknown text', 'sv')).toBe('Unknown text');
    expect(translate('{n} leads', 'sv', { n: 3 })).toBe('3 leads');
    expect(translate('Save changes', 'en')).toBe('Save changes');
    delete globalThis.__I18N;
  });
});

describe('structured data', () => {
  it('moves page addresses and the language, not the shared identities or images', () => {
    const out: any = localizeJsonLd({ inLanguage: 'en', url: 'https://x.com/pricing', '@id': 'https://x.com/#organization', image: 'https://x.com/opengraph-image' }, 'sv', 'https://x.com');
    expect(out.inLanguage).toBe('sv');
    expect(out.url).toBe('https://x.com/sv/pricing');
    expect(out['@id']).toBe('https://x.com/#organization');
    expect(out.image).toBe('https://x.com/opengraph-image');
  });
});

describe('catalogs', () => {
  it('keep every {placeholder} and **bold** marker of the English text', () => {
    const sig = (t: string) => (t.match(/\{\w+\}/g) || []).sort().join(',') + '|' + (t.match(/\*\*/g) || []).length;
    for (const l of LOCALES.filter((x) => x !== 'en')) {
      const cat = JSON.parse(fs.readFileSync(`lib/i18n/catalog/${l}.json`, 'utf8')) as Record<string, string>;
      expect(Object.keys(cat).length).toBeGreaterThan(4000);
      for (const [en, tr] of Object.entries(cat)) expect(sig(tr), `${l}: ${en}`).toBe(sig(en));
    }
  });
});

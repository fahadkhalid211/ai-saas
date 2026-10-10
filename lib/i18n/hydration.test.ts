import { afterEach, describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { I18nProvider, useI18n } from './context';
import { LOCALE_COOKIE, COUNTRY_COOKIE, DEFAULT_LOCALE } from './config';

function Probe() {
  const { locale, country, formatCurrency } = useI18n();
  return React.createElement('p', null, `${locale}|${country}|${formatCurrency(49)}`);
}

const firstRender = () => renderToString(React.createElement(I18nProvider, null, React.createElement(Probe)));

afterEach(() => {
  delete (globalThis as any).document;
});

describe('the first render of the language provider', () => {
  it('is the same in the browser as on the server, whatever language the visitor saved', () => {
    const onServer = firstRender(); // no document on the server

    // a returning visitor's browser: the saved language and country are Swedish
    (globalThis as any).document = { cookie: `${LOCALE_COOKIE}=sv; ${COUNTRY_COOKIE}=SE` };
    const inBrowser = firstRender();

    // React compares these two when the page loads; any difference is hydration error #418
    expect(inBrowser).toBe(onServer);
    expect(onServer).toContain(`${DEFAULT_LOCALE}|US|$49`);
  });

  it('still honours a language passed in by the page', () => {
    const html = renderToString(React.createElement(I18nProvider, { initialLocale: 'sv', initialCountry: 'SE' } as any, React.createElement(Probe)));
    expect(html).toContain('sv|SE|');
  });
});

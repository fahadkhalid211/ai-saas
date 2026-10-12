import type { SupportedLocale } from '@/lib/i18n/types';

/**
 * Tells the language switcher where this page lives in each language. Used by pages whose translation may not exist (a blog
 * article), so choosing a language the article is not available in leads to the blog instead of a dead address.
 * Renders nothing visible; the switcher reads the attribute when a language is chosen.
 */
export function LocaleAlternates({ map }: { map: Partial<Record<SupportedLocale, string>> }) {
  return <span hidden data-locale-alternates={JSON.stringify(map)} />;
}

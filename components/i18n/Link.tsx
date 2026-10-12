'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { localizeHref } from '@/lib/i18n/paths';
import type { SupportedLocale } from '@/lib/i18n/types';

type Props = ComponentProps<typeof NextLink> & {
  /** Link to the page in this language instead of the page's own (a blog article that exists only in English). */
  locale?: SupportedLocale;
};

/**
 * next/link that keeps the visitor in their language: href="/pricing" on a Swedish page goes to /sv/pricing. Links to other
 * sites, the dashboard, files and "#section" anchors are left as they are.
 */
export default function Link({ href, locale: forced, ...rest }: Props) {
  const { locale: current } = useI18n();
  const locale = forced ?? current;
  let target = href;
  if (typeof href === 'string') target = localizeHref(href, locale);
  else if (href && typeof href === 'object' && typeof href.pathname === 'string') target = { ...href, pathname: localizeHref(href.pathname, locale) };
  return <NextLink href={target} {...rest} />;
}

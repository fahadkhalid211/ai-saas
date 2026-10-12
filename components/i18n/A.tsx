'use client';

import type { AnchorHTMLAttributes } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { localizeHref } from '@/lib/i18n/paths';

/** A plain <a> whose internal address follows the page's language (see Link). */
export function A({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { locale } = useI18n();
  return <a href={typeof href === 'string' ? localizeHref(href, locale) : href} {...rest} />;
}

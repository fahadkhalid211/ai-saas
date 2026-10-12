'use client';

import { T, useT } from '@/lib/i18n/context';
import { LOGO_STRIP } from './content';
import { useI18n } from '@/lib/i18n/context';

export function LogoStrip() {
  const __t = useT();
  const { dict } = useI18n();
  const caption = dict?.logoStrip?.caption || LOGO_STRIP.caption;
  const items = dict?.logoStrip?.items || LOGO_STRIP.items;

  return (
    <section className="mk-strip" aria-label={__t("Industries Crescelo is built for")}>
      <p className="mk-strip-caption"><T>{caption}</T></p>
      <div className="mk-wrap">
        <ul className="mk-badge-grid">
          {items.map((label) => (
            <li key={label} className="mk-logo-slot">
              <span className="mk-logo-mark" aria-hidden="true" />
              <T>{label}</T>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

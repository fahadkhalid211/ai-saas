'use client';

import { LOGO_STRIP } from './content';
import { useI18n } from '@/lib/i18n/context';

export function LogoStrip() {
  const { dict } = useI18n();
  const caption = dict?.logoStrip?.caption || LOGO_STRIP.caption;
  const items = dict?.logoStrip?.items || LOGO_STRIP.items;

  return (
    <section className="mk-strip" aria-label="Industries Crescelo is built for">
      <p className="mk-strip-caption">{caption}</p>
      <div className="mk-wrap">
        <ul className="mk-badge-grid">
          {items.map((label) => (
            <li key={label} className="mk-logo-slot">
              <span className="mk-logo-mark" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

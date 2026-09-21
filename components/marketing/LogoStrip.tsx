import { LOGO_STRIP } from './content';

/** Placeholder logo slots: labelled business categories, not company names. */
export function LogoStrip() {
  return (
    <section className="mk-strip" aria-label="Types of business Crescelo is built for">
      <p className="mk-strip-caption">{LOGO_STRIP.caption}</p>
      <div className="mk-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="mk-marquee-track" aria-hidden={copy === 1 ? 'true' : undefined}>
            {LOGO_STRIP.items.map((label) => (
              <li key={label} className="mk-logo-slot">
                <span className="mk-logo-mark" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

import { LOGO_STRIP } from './content';

export function LogoStrip() {
  return (
    <section className="mk-strip" aria-label="Industries Crescelo is built for">
      <p className="mk-strip-caption">{LOGO_STRIP.caption}</p>
      <div className="mk-wrap">
        <ul className="mk-badge-grid">
          {LOGO_STRIP.items.map((label) => (
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

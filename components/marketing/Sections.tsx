'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { METRICS, SECURITY, USE_CASES } from './content';
import { Check, Counter, Reveal, SectionHead } from './ui';
import { useI18n } from '@/lib/i18n/context';

/* ------------------------------ Use cases ------------------------------ */

export function UseCases() {
  const { dict } = useI18n();
  const uc = dict?.useCases || USE_CASES;
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = uc.items || USE_CASES.items;
  const onKey = (e: KeyboardEvent) => {
    let n = active;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (active + 1) % items.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (active - 1 + items.length) % items.length;
    else return;
    e.preventDefault();
    setActive(n);
    refs.current[n]?.focus();
  };
  const cur = items[active] || items[0] || USE_CASES.items[0];
  return (
    <section id="use-cases" className="mk-section" aria-labelledby="mk-uc-title">
      <div className="mk-wrap">
        <SectionHead id="mk-uc-title" eyebrow={uc.eyebrow} title={uc.title} />
        <Reveal className="mk-uc">
          <div role="tablist" aria-label="Business type" aria-orientation="vertical" className="mk-uc-tabs" onKeyDown={onKey}>
            {items.map((it, i) => (
              <button
                key={it.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`mk-uc-tab-${it.id}`}
                aria-selected={active === i}
                aria-controls="mk-uc-panel"
                tabIndex={active === i ? 0 : -1}
                className={`mk-uc-tab ${active === i ? 'is-on' : ''}`}
                onClick={() => setActive(i)}
              >
                {it.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id="mk-uc-panel" aria-labelledby={`mk-uc-tab-${cur.id}`} className="mk-uc-panel">
            <h3 className="mk-h3">{cur.title}</h3>
            <p className="mk-body">{cur.body}</p>
            <ul className="mk-ticks">
              {cur.points.map((p) => (
                <li key={p}>
                  <Check />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Metrics ------------------------------ */

export function Metrics() {
  const { dict } = useI18n();
  const met = dict?.metrics || METRICS;
  const items = met.items || METRICS.items;

  return (
    <section id="metrics" className="mk-section" aria-labelledby="mk-m-title">
      <div className="mk-wrap">
        <SectionHead id="mk-m-title" eyebrow={met.eyebrow} title={met.title} />
        <dl className="mk-metrics">
          {items.map((m, i) => (
            <Reveal key={m.label} delay={i * 70} className="mk-metric">
              <dd className="mk-metric-value">
                <Counter end={m.value} suffix={m.suffix} />
              </dd>
              <dt>{m.label}</dt>
            </Reveal>
          ))}
        </dl>
        <p className="mk-footnote">{met.footnote || METRICS.footnote}</p>
      </div>
    </section>
  );
}

/* ------------------------------ Security ------------------------------ */

export function Security() {
  const { dict } = useI18n();
  const sec = dict?.security || SECURITY;
  const items = sec.items || SECURITY.items;

  return (
    <section id="security" className="mk-section" aria-labelledby="mk-sec-title">
      <div className="mk-wrap">
        <SectionHead id="mk-sec-title" eyebrow={sec.eyebrow} title={sec.title} intro={sec.intro} />
        <ul className="mk-sec-grid">
          {items.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 50} className="mk-sec-item">
              <span className="mk-sec-icon" aria-hidden="true">
                <Check />
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

'use client';

import { T, useT } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import { useEffect, useRef, type CSSProperties } from 'react';
import { INTEGRATIONS } from './content';
import { COMPARE, DIAGONAL, PATHS, STORIES } from './content-extra';
import { Check, Eyebrow, Reveal } from './ui';
import { FeatureVisual } from './mocks';
import { OrbitStage } from './OrbitStage';
import { ORBIT_ICONS } from './BrandIcons';
import { usePrefersReducedMotion } from './hooks';

/* ------------------------------ Diagonal scroll benefits ------------------------------ */

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/**
 * Pinned stage. Scroll progress drives a smoothed index `s`; each card sits on a diagonal path
 * by its offset t = i - s: far cards wait bottom-left and deep, the current card is centred,
 * passed cards drift up-right and fade. Transforms are written straight to the DOM (no React state).
 */
export function DiagonalBenefits() {
  const reduced = usePrefersReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLElement | null)[]>([]);
  const n = DIAGONAL.cards.length;

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || reduced) return;
    let target = 0;
    let current = 0;
    let raf = 0;
    let running = false;

    const measure = () => {
      const r = outer.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = clamp(-r.top / Math.max(1, total), 0, 1) * (n - 1);
    };

    const paint = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dx = Math.min(w * 0.34, 520);
      const dy = Math.min(h * 0.26, 240);
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const t = i - current;
        let x: number, y: number, z: number, rx: number, o: number, sc: number;
        if (t >= 0) {
          x = -t * dx;
          y = t * dy;
          z = -t * 170;
          rx = -Math.min(t, 2) * 22;
          o = clamp(1 - Math.max(0, t - 1.2) * 0.6, 0, 1);
          sc = 1;
        } else {
          const k = -t;
          x = k * dx * 0.9;
          y = -k * dy * 1.1;
          z = k * 90;
          rx = k * 14;
          o = clamp(1 - k * 1.25, 0, 1);
          sc = 1 + k * 0.06;
        }
        el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o > 0.02 ? 'visible' : 'hidden';
        el.style.zIndex = String(100 - Math.round(Math.abs(t) * 10));
        el.style.pointerEvents = Math.abs(t) < 0.5 ? 'auto' : 'none';
        el.setAttribute('aria-hidden', Math.abs(t) < 0.6 ? 'false' : 'true');
      });
      dotRefs.current.forEach((d, i) => d?.classList.toggle('is-on', Math.round(current) === i));
    };

    const tick = () => {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.001) current = target;
      paint();
      if (current !== target) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      measure();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      cancelAnimationFrame(raf);
    };
  }, [n, reduced]);

  const card = (c: (typeof DIAGONAL.cards)[number], i: number) => (
    <article
      key={c.title}
      ref={(el) => {
        cardRefs.current[i] = el;
      }}
      className="mk-diag-card"
      data-tone={c.tone}
    >
      <div className="mk-diag-stat">
        <b><T>{c.stat}</T></b>
        <span><T>{c.statLabel}</T></span>
      </div>
      <h3><T>{c.title}</T></h3>
      <p><T>{c.body}</T></p>
    </article>
  );

  return (
    <section id="benefits" className="mk-diag-section" aria-labelledby="mk-diag-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow><T>{DIAGONAL.eyebrow}</T></Eyebrow>
          <h2 id="mk-diag-title" className="mk-h2 mk-h2-center">
            <T>{DIAGONAL.titleLine}</T>
            <br />
            <em><T>{DIAGONAL.titleEm}</T></em>
          </h2>
        </Reveal>
      </div>

      {reduced ? (
        <div className="mk-wrap">
          <ul className="mk-diag-static">
            {DIAGONAL.cards.map((c) => (
              <li key={c.title} className="mk-diag-card is-static" data-tone={c.tone}>
                <div className="mk-diag-stat">
                  <b><T>{c.stat}</T></b>
                  <span><T>{c.statLabel}</T></span>
                </div>
                <h3><T>{c.title}</T></h3>
                <p><T>{c.body}</T></p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div ref={outerRef} className="mk-diag-outer" style={{ height: `${(n + 1) * 70}vh` }}>
          <div className="mk-diag-stage">
            <div className="mk-diag-world">{DIAGONAL.cards.map(card)}</div>
            <ol className="mk-diag-dots" aria-hidden="true">
              {DIAGONAL.cards.map((c, i) => (
                <li
                  key={c.title}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                />
              ))}
            </ol>
          </div>
        </div>
      )}
      <p className="mk-footnote mk-center-note"><T>{DIAGONAL.note}</T></p>
    </section>
  );
}

/* ------------------------------ Paths: how it works rows ------------------------------ */

const PATH_VISUAL = { connect: 'sources', configure: 'config', automate: 'channels', grow: 'inbox' } as const;

export function Paths() {
  return (
    <section id="how-it-works" className="mk-section mk-paths" aria-labelledby="mk-paths-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow><T>{PATHS.eyebrow}</T></Eyebrow>
          <h2 id="mk-paths-title" className="mk-h2 mk-h2-center">
            <span className="mk-block"><T>{PATHS.titleLines[0]}</T></span>
            <span className="mk-block mk-em"><T>{PATHS.echo}</T></span>
          </h2>
        </Reveal>

        <ol className="mk-path-list">
          {PATHS.rows.map((r, i) => (
            <li key={r.id} className="mk-path-li" style={{ ['--i' as string]: i } as CSSProperties}>
              <article className={`mk-path ${i % 2 ? 'is-flip' : ''}`} data-tone={r.tone}>
                <div className="mk-path-copy">
                  <span className="mk-path-step" aria-hidden="true">
                    <T>{r.step}</T>
                  </span>
                  <h3 className="mk-path-title"><T>{r.title}</T></h3>
                  <p><T>{r.body}</T></p>
                  <A href={r.href} className="mk-btn mk-btn-primary mk-btn-sm">
                    <T>{r.cta}</T>
                    <span aria-hidden="true" className="mk-arrow">
                      →
                    </span>
                  </A>
                </div>
                <div className="mk-path-visual">
                  <FeatureVisual kind={PATH_VISUAL[r.id]} />
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------ Stories carousel ------------------------------ */

export function Stories() {
  const __t = useT();
  const items = [...STORIES.items, ...STORIES.items];
  return (
    <section id="customers" className="mk-section mk-stories" aria-labelledby="mk-stories-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow><T>{STORIES.eyebrow}</T></Eyebrow>
          <h2 id="mk-stories-title" className="mk-h2 mk-h2-center">
            <T>{STORIES.title}</T>
          </h2>
          <p className="mk-lead"><T>{STORIES.notice}</T></p>
        </Reveal>
      </div>
      <div className="mk-story-viewport" role="region" aria-label={__t("Customer stories")} tabIndex={0}>
        <ul className="mk-story-track">
          {items.map((s, i) => (
            <li key={i} className="mk-story-li" aria-hidden={i >= STORIES.items.length ? 'true' : undefined}>
              <article className="mk-story-card" data-tone={s.tone}>
                <p className="mk-story-stat"><T>{s.stat}</T></p>
                <p className="mk-story-label"><T>{s.label}</T></p>
                <div className="mk-story-person">
                  <span className="mk-avatar" aria-hidden="true" />
                  <span>
                    <b><T>{s.name}</T></b>
                    <small><T>{s.role}</T></small>
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ Comparison ------------------------------ */

const isYes = (v: string) => /^yes/i.test(v);

export function Compare() {
  const __t = useT();
  return (
    <section id="compare" className="mk-section mk-compare-section" aria-labelledby="mk-cmp-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow><T>{COMPARE.eyebrow}</T></Eyebrow>
          <h2 id="mk-cmp-title" className="mk-h2 mk-h2-center">
            <T>{COMPARE.title}</T>
          </h2>
          <p className="mk-lead"><T>{COMPARE.intro}</T></p>
        </Reveal>
        <Reveal>
          <div className="mk-cmp-wrap" role="region" aria-label={__t("Feature comparison table")} tabIndex={0}>
            <table className="mk-cmp">
              <caption className="mk-sr"><T>Crescelo compared with Chatbase, typical FAQ bots and basic live-chat widgets</T></caption>
              <thead>
                <tr>
                  <th scope="col"><T>Capability</T></th>
                  {COMPARE.columns.map((c, i) => (
                    <th key={c} scope="col" className={i === 0 ? 'is-crescelo' : ''}>
                      <T>{c}</T>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.rows.map((r) => (
                  <tr key={r.feature}>
                    <th scope="row"><T>{r.feature}</T></th>
                    {r.values.map((v, i) => (
                      <td key={i} className={i === 0 ? 'is-crescelo' : ''}>
                        {i === 0 && isYes(v) ? <Check /> : null}
                        <span><T>{v}</T></span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <p className="mk-footnote mk-center-note"><T>{COMPARE.footnote}</T></p>
      </div>
    </section>
  );
}

/* ------------------------------ Integrations: full-width stage ------------------------------ */

const ORBIT = [
  ...INTEGRATIONS.items.map((i) => ({ id: i.id, label: i.label, note: i.note })),
  { id: 'provider', label: 'AI providers', note: 'OpenAI, Claude, Gemini, Groq: your key' },
  { id: 'urls', label: 'Web pages', note: 'Index a site by URL' },
  { id: 'youtube', label: 'YouTube', note: 'Video transcripts as knowledge' },
].map((i) => ({ ...i, icon: ORBIT_ICONS[i.id]?.icon, iconBg: ORBIT_ICONS[i.id]?.bg }));

export function IntegrationsStage() {
  return (
    <OrbitStage
      id="integrations"
      titleId="mk-int-title"
      items={ORBIT}
      head={
        <>
          <Eyebrow><T>{INTEGRATIONS.eyebrow}</T></Eyebrow>
          <h2 id="mk-int-title" className="mk-h2 mk-h2-center">
            <T>{INTEGRATIONS.title}</T>
          </h2>
          <p className="mk-lead"><T>{INTEGRATIONS.intro}</T></p>
        </>
      }
    />
  );
}

'use client';

import { T } from '@/lib/i18n/context';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { usePrefersReducedMotion } from './hooks';

export interface OrbitItem {
  id: string;
  label: string;
  note?: string;
  /** Inner items sit on a smaller ellipse. Everything else sits on the outer one. */
  ring?: 'inner' | 'outer';
  /** A glyph for the round badge (instead of the label's first letter) and the colour behind it. */
  icon?: ReactNode;
  iconBg?: string;
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Pinned stage: items fly out from the centre as the section enters, hold with a gentle float,
 * then draw back in as it exits. One CSS variable (--e, 0 to 1) drives every item.
 * Positions come from cos/sin on ellipses, so the layout is always a true ellipse.
 */
export function OrbitStage({
  id,
  titleId,
  head,
  items,
  core = 'Crescelo',
  panel = false,
}: {
  id: string;
  titleId: string;
  head: ReactNode;
  items: OrbitItem[];
  core?: string;
  panel?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    if (!outer || !stage) return;
    if (reduced) {
      stage.style.setProperty('--e', '1');
      return;
    }
    let target = 0;
    let cur = 0;
    let raf = 0;
    let running = false;
    const measure = () => {
      const r = outer.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = clamp(-r.top / Math.max(1, total), 0, 1);
      // Enter while the block arrives (its top is still below the fold), hold, exit over the second half of the pin.
      const enter = clamp((window.innerHeight - r.top) / (window.innerHeight * 0.9), 0, 1);
      const exit = 1 - smooth(clamp((p - 0.5) / 0.5, 0, 1));
      target = smooth(enter) * exit;
    };
    const tick = () => {
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.002) cur = target;
      stage.style.setProperty('--e', cur.toFixed(4));
      if (cur !== target) raf = requestAnimationFrame(tick);
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
  }, [reduced]);

  const inner = items.filter((i) => i.ring === 'inner');
  const outerItems = items.filter((i) => i.ring !== 'inner');
  const place = (it: OrbitItem, gi: number) => {
    const isInner = it.ring === 'inner';
    const group = isInner ? inner : outerItems;
    const j = group.indexOf(it);
    const turn = (j + (isInner ? 0.5 : 0)) / group.length;
    const a = (-90 + 360 * turn) * (Math.PI / 180);
    return {
      '--tx': Math.cos(a).toFixed(4),
      '--ty': Math.sin(a).toFixed(4),
      '--k': isInner ? 0.68 : 1,
      '--d': (gi / items.length) * 0.6,
      '--f': `${(gi % 3) * 0.7}s`,
    } as CSSProperties;
  };

  return (
    <section id={id} className={`mk-orbit-section ${panel ? 'is-panel' : ''}`} aria-labelledby={titleId}>
      <div ref={outerRef} className="mk-orbit-outer">
        <div ref={stageRef} className="mk-orbit-stage" style={{ ['--e' as string]: reduced ? 1 : 0 } as CSSProperties}>
          <div className="mk-orbit-head"><T>{head}</T></div>

          <div className="mk-orbit-field">
            <div className="mk-orbit-core" aria-hidden="true">
              <span className="mk-orbit-ring r1" />
              <span className="mk-orbit-ring r2" />
              <span className="mk-orbit-ring r3" />
              <span className="mk-orbit-disc"><T>{core}</T></span>
            </div>
            <ul className="mk-orbit-items">
              {items.map((it, i) => (
                <li key={it.id} className="mk-orbit-item" style={place(it, i)}>
                  <span className={`mk-orbit-pill ${it.ring === 'inner' ? 'is-inner' : ''}`} data-i={i % 5} tabIndex={0}>
                    <span className={`mk-orbit-badge ${it.icon ? 'has-icon' : ''}`} style={it.iconBg ? { background: it.iconBg } : undefined} aria-hidden="true">
                      <T>{it.icon ?? it.label[0]}</T>
                    </span>
                    <span>
                      <b><T>{it.label}</T></b>
                      {it.note ? <small><T>{it.note}</T></small> : null}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

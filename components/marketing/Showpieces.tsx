'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import Link from 'next/link';
import { BEHIND, CAROUSEL, TOOLS } from './content-extra';
import { Eyebrow, Reveal } from './ui';
import { Glyph, ToolArt } from './art';
import { OrbitStage, type OrbitItem } from './OrbitStage';

/* ------------------------------ Tools: three cards ------------------------------ */

export function Tools() {
  return (
    <section id="product" className="mk-section mk-tools" aria-labelledby="mk-tools-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow>{TOOLS.eyebrow}</Eyebrow>
          <h2 id="mk-tools-title" className="mk-h2 mk-h2-center">
            <span className="mk-block">{TOOLS.titleLines[0]}</span>
            <span className="mk-block">{TOOLS.titleLines[1]}</span>
            <span className="mk-block mk-em">{TOOLS.echo}</span>
          </h2>
        </Reveal>

        <ul className="mk-tool-grid">
          {TOOLS.cards.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 110} className="mk-tool-li">
              <article className="mk-tool" data-tone={c.tone}>
                <div className="mk-tool-media" aria-hidden="true">
                  <div className="mk-tool-art">
                    <ToolArt id={c.id} />
                  </div>
                </div>
                <div className="mk-tool-body">
                  <p className="mk-tool-kicker">{c.kicker}</p>
                  <h3 className="mk-tool-title">{c.title}</h3>
                  <p>{c.body}</p>
                  <a href={c.href} className="mk-btn mk-btn-primary mk-btn-sm">
                    {c.cta}
                    <span aria-hidden="true" className="mk-arrow">
                      →
                    </span>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ Behind the scenes ------------------------------ */

const BEHIND_ITEMS: OrbitItem[] = [
  ...BEHIND.features.map((label) => ({ id: label, label, ring: 'inner' as const })),
  ...BEHIND.tech.map((label) => ({ id: label, label, ring: 'outer' as const })),
];

/** Features (inner ellipse, lime) and technologies (outer ellipse) around the assistant, scroll-driven. */
export function BehindTheScenes() {
  return (
    <OrbitStage
      id="agent"
      titleId="mk-agent-title"
      panel
      items={BEHIND_ITEMS}
      head={
        <>
          <Eyebrow>{BEHIND.eyebrow}</Eyebrow>
          <h2 id="mk-agent-title" className="mk-h2 mk-h2-center mk-h2-oneline">
            {BEHIND.titleLines[0]} <span className="mk-em">{BEHIND.titleLines[1]}</span>
          </h2>
          <p className="mk-lead">{BEHIND.body}</p>
          <Link href={BEHIND.ctaHref} className="mk-vbtn">
            <span className="mk-vbtn-stroke" aria-hidden="true" />
            <span className="mk-vbtn-label">{BEHIND.cta}</span>
          </Link>
          <p className="mk-orbit-legend">{BEHIND.caption}</p>
        </>
      }
    />
  );
}

/* ------------------------------ Feature carousel ------------------------------ */

export function FeatureCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setAtStart(el.scrollLeft < 4);
    setAtEnd(el.scrollLeft > max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    update();
    el.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      el.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.mk-car-card');
    const w = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: dir * w * 1.5, behavior: 'smooth' });
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false };
    setDragging(true);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = trackRef.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    el.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    drag.current.down = false;
    setDragging(false);
  };

  return (
    <section id="carousel" className="mk-section mk-carousel" aria-labelledby="mk-car-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow>{CAROUSEL.eyebrow}</Eyebrow>
          <h2 id="mk-car-title" className="mk-h2 mk-h2-center">
            {CAROUSEL.title}
          </h2>
          <p className="mk-lead">{CAROUSEL.intro}</p>
        </Reveal>
      </div>

      <div
        className={`mk-car-track ${dragging ? 'is-drag' : ''}`}
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product features"
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
      >
        {CAROUSEL.items.map((it, i) => (
          <article key={it.id} className="mk-car-card" data-tone={it.tone} aria-label={`${i + 1} of ${CAROUSEL.items.length}: ${it.title}`}>
            <div className="mk-car-art" aria-hidden="true">
              <span className="mk-car-glyph">
                <Glyph kind={it.glyph} />
              </span>
            </div>
            <span className="mk-car-tag">{it.tag}</span>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </article>
        ))}
      </div>

      <div className="mk-wrap mk-car-controls">
        <div className="mk-car-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${0.12 + progress * 0.88})` }} />
        </div>
        <div className="mk-car-arrows">
          <button type="button" className="mk-icon-btn" aria-label="Previous features" disabled={atStart} onClick={() => step(-1)}>
            ←
          </button>
          <button type="button" className="mk-icon-btn" aria-label="Next features" disabled={atEnd} onClick={() => step(1)}>
            →
          </button>
        </div>
      </div>
    </section>
  );
}

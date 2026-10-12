'use client';

import { T, useT } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import Link from '@/components/i18n/Link';
import { BEHIND, CAROUSEL, TOOLS } from './content-extra';
import { Eyebrow, Reveal } from './ui';
import { Glyph, ToolArt } from './art';
import { OrbitStage, type OrbitItem } from './OrbitStage';
import { usePrefersReducedMotion } from './hooks';

/* ------------------------------ Tools: three cards ------------------------------ */

export function Tools() {
  return (
    <section id="product" className="mk-section mk-tools" aria-labelledby="mk-tools-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow><T>{TOOLS.eyebrow}</T></Eyebrow>
          <h2 id="mk-tools-title" className="mk-h2 mk-h2-center">
            <span className="mk-block"><T>{TOOLS.titleLines[0]}</T></span>
            <span className="mk-block"><T>{TOOLS.titleLines[1]}</T></span>
            <span className="mk-block mk-em"><T>{TOOLS.echo}</T></span>
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
                  <p className="mk-tool-kicker"><T>{c.kicker}</T></p>
                  <h3 className="mk-tool-title"><T>{c.title}</T></h3>
                  <p><T>{c.body}</T></p>
                  <A href={c.href} className="mk-btn mk-btn-primary mk-btn-sm">
                    <T>{c.cta}</T>
                    <span aria-hidden="true" className="mk-arrow">
                      →
                    </span>
                  </A>
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
          <Eyebrow><T>{BEHIND.eyebrow}</T></Eyebrow>
          <h2 id="mk-agent-title" className="mk-h2 mk-h2-center mk-h2-oneline">
            <T>{BEHIND.titleLines[0]}</T> <span className="mk-em"><T>{BEHIND.titleLines[1]}</T></span>
          </h2>
          <p className="mk-lead"><T>{BEHIND.body}</T></p>
          <Link href={BEHIND.ctaHref} className="mk-vbtn">
            <span className="mk-vbtn-stroke" aria-hidden="true" />
            <span className="mk-vbtn-label"><T>{BEHIND.cta}</T></span>
          </Link>
          <p className="mk-orbit-legend"><T>{BEHIND.caption}</T></p>
        </>
      }
    />
  );
}

/* ------------------------------ Feature carousel ------------------------------ */

const CAR_SPEED = 42; // px per second while drifting
const CAR_RESUME_MS = 1500; // pause after the visitor scrolls, drags or presses an arrow
const CAR_COPIES = 3; // enough copies that a jump of one set is never visible

export function FeatureCarousel() {
  const __t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const drag = useRef({ down: false, x: 0, left: 0 });
  const hold = useRef({ hover: false, focus: false, touch: false, offscreen: false, until: 0 });
  const [dragging, setDragging] = useState(false);
  const [userPaused, setUserPaused] = useState(false); // a persistent pause the visitor chose (keyboard, touch or mouse)
  const userPausedRef = useRef(false);
  userPausedRef.current = userPaused;
  const items = CAROUSEL.items;

  // Continuous drift plus seamless wrap in both directions. The content is repeated, and whenever the
  // scroll position leaves the middle copy it jumps by exactly one copy's width, which looks identical.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let last = 0;
    let pos = 0;
    let lastSet = -1;
    let period = 0;

    const measure = () => {
      const cards = el.querySelectorAll<HTMLElement>('.mk-car-card');
      if (cards.length < items.length * 2) return;
      period = cards[items.length].offsetLeft - cards[0].offsetLeft;
    };
    const wrap = () => {
      if (period <= 0) return;
      if (el.scrollLeft >= period * 2) el.scrollLeft -= period;
      else if (el.scrollLeft < period) el.scrollLeft += period;
      pos = el.scrollLeft;
    };
    // Movement that is not ours is the visitor (wheel, touch, drag, arrows): follow it and pause a moment.
    const adoptUserScroll = () => {
      if (Math.abs(el.scrollLeft - lastSet) > 1.5) {
        hold.current.until = performance.now() + CAR_RESUME_MS;
        pos = el.scrollLeft;
      }
    };
    const onScroll = () => {
      adoptUserScroll();
      wrap();
      lastSet = el.scrollLeft;
    };
    const tick = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      adoptUserScroll(); // do not overwrite a scroll the visitor made since the last frame
      const h = hold.current;
      const paused = userPausedRef.current || h.hover || h.focus || h.touch || h.offscreen || drag.current.down || t < h.until;
      if (!paused && period > 0) {
        pos += (CAR_SPEED * dt) / 1000;
        el.scrollLeft = pos;
        lastSet = el.scrollLeft;
        wrap();
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    el.scrollLeft = period; // start on the middle copy so there is room to move both ways
    pos = el.scrollLeft;
    lastSet = pos;
    el.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => {
      const before = period;
      measure();
      if (before > 0 && period > 0) el.scrollLeft = (el.scrollLeft / before) * period;
    };
    window.addEventListener('resize', onResize);
    const io = new IntersectionObserver(([e]) => {
      hold.current.offscreen = !e.isIntersecting;
    });
    io.observe(el);
    if (!reduced) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [reduced, items.length]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.mk-car-card');
    const w = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: dir * w * 1.5, behavior: 'smooth' });
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    if (e.pointerType !== 'mouse') {
      hold.current.touch = true; // the browser scrolls natively for touch
      return;
    }
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft };
    setDragging(true);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = trackRef.current;
    if (!d.down || !el) return;
    el.scrollLeft = d.left - (e.clientX - d.x);
  };
  const onUp = () => {
    hold.current.touch = false;
    hold.current.until = performance.now() + CAR_RESUME_MS;
    if (drag.current.down) {
      drag.current.down = false;
      setDragging(false);
    }
  };

  return (
    <section id="carousel" className="mk-section mk-carousel" aria-labelledby="mk-car-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head">
          <Eyebrow><T>{CAROUSEL.eyebrow}</T></Eyebrow>
          <h2 id="mk-car-title" className="mk-h2 mk-h2-center">
            <T>{CAROUSEL.title}</T>
          </h2>
          <p className="mk-lead"><T>{CAROUSEL.intro}</T></p>
          <button
            type="button"
            className="mk-btn mk-btn-sm mk-btn-ghost"
            style={{ marginTop: '1rem' }}
            aria-pressed={userPaused}
            onClick={() => setUserPaused((v) => !v)}
          >
            <T>{userPaused ? 'Resume movement' : 'Pause movement'}</T>
          </button>
        </Reveal>
      </div>

      <div
        className={`mk-car-track ${dragging ? 'is-drag' : ''}`}
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={__t("Product features")}
        tabIndex={0}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') hold.current.hover = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') hold.current.hover = false;
          onUp();
        }}
        onFocus={() => {
          hold.current.focus = true;
        }}
        onBlur={() => {
          hold.current.focus = false;
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1);
          if (e.key === 'ArrowLeft') step(-1);
        }}
      >
        {Array.from({ length: CAR_COPIES }).flatMap((_, copy) =>
          items.map((it, i) => (
            <article
              key={`${copy}-${it.id}`}
              className="mk-car-card"
              data-tone={it.tone}
              aria-hidden={copy === 1 ? undefined : true}
              aria-label={copy === 1 ? `${i + 1} of ${items.length}: ${it.title}` : undefined}
            >
              <div className="mk-car-art" aria-hidden="true">
                <span className="mk-car-glyph">
                  <Glyph kind={it.glyph} />
                </span>
              </div>
              <span className="mk-car-tag"><T>{it.tag}</T></span>
              <h3><T>{it.title}</T></h3>
              <p><T>{it.body}</T></p>
            </article>
          ))
        )}
      </div>

      <div className="mk-wrap mk-car-controls">
        <p className="mk-car-hint"><T>Drifts on its own. Hover to pause, drag or use the arrows to go either way.</T></p>
        <div className="mk-car-arrows">
          <button type="button" className="mk-icon-btn" aria-label={__t("Previous features")} onClick={() => step(-1)}>
            ←
          </button>
          <button type="button" className="mk-icon-btn" aria-label={__t("Next features")} onClick={() => step(1)}>
            →
          </button>
        </div>
      </div>
    </section>
  );
}

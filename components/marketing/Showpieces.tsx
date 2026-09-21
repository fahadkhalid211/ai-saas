'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import Link from 'next/link';
import { AGENT_VIDEO, CAROUSEL, TOOLS } from './content-extra';
import { EchoText, Eyebrow, Reveal } from './ui';
import { Glyph, ToolArt } from './art';
import { usePrefersReducedMotion } from './hooks';

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
            <EchoText>{TOOLS.echo}</EchoText>
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

/* ------------------------------ Agent video ------------------------------ */

export function AgentVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Load the source only when the block is near the viewport, and pause it when off-screen.
  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setLoaded(true);
            if (!reduced) video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: '300px 0px' }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    v.addEventListener('play', on);
    v.addEventListener('pause', off);
    return () => {
      v.removeEventListener('play', on);
      v.removeEventListener('pause', off);
    };
  }, []);

  return (
    <section id="agent" className="mk-agent" aria-labelledby="mk-agent-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head mk-agent-head">
          <Eyebrow>{AGENT_VIDEO.eyebrow}</Eyebrow>
          <h2 id="mk-agent-title" className="mk-h2 mk-h2-center">
            <span className="mk-block">{AGENT_VIDEO.titleLines[0]}</span>
            <EchoText>{AGENT_VIDEO.echo}</EchoText>
          </h2>
          <p className="mk-lead">{AGENT_VIDEO.body}</p>
          <Link href={AGENT_VIDEO.ctaHref} className="mk-vbtn">
            <span className="mk-vbtn-stroke" aria-hidden="true" />
            <span className="mk-vbtn-label">{AGENT_VIDEO.cta}</span>
          </Link>
        </Reveal>

        <Reveal className="mk-video-wrap">
          <div ref={wrapRef} className="mk-video-frame">
            <video
              ref={videoRef}
              className="mk-video"
              muted
              loop
              playsInline
              preload="none"
              aria-label="Animation of the assistant handling visitor questions, bookings and handovers"
            >
              {loaded ? <source src={AGENT_VIDEO.src} type="video/webm" /> : null}
            </video>
            {reduced ? (
              <button
                type="button"
                className="mk-video-toggle"
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  if (v.paused) v.play().catch(() => undefined);
                  else v.pause();
                }}
              >
                {playing ? 'Pause animation' : 'Play animation'}
              </button>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
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

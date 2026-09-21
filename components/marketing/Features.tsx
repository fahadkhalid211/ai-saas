'use client';

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { DEMO } from './content';
import { Reveal, SectionHead } from './ui';

/** Before/after comparison slider, keyboard operable (arrow keys, Home, End). */
export function Demo() {
  const [pos, setPos] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromX = useCallback((clientX: number) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromX(e.clientX);
  };
  const onUp = () => {
    dragging.current = false;
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - step));
    else if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + step));
    else if (e.key === 'Home') setPos(0);
    else if (e.key === 'End') setPos(100);
    else return;
    e.preventDefault();
  };

  return (
    <section id="demo" className="mk-section mk-section-tint" aria-labelledby="mk-demo-title">
      <div className="mk-wrap">
        <SectionHead id="mk-demo-title" eyebrow={DEMO.eyebrow} title={DEMO.title} intro={DEMO.intro} />
        <Reveal>
          <p className="mk-demo-q">
            <span>Visitor asks</span>
            {DEMO.question}
          </p>
          <div
            ref={boxRef}
            className="mk-compare"
            style={{ ['--mk-split' as string]: `${pos}%` }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <div className="mk-compare-pane mk-compare-grounded">
              <span className="mk-pill mk-pill-good">{DEMO.grounded.label}</span>
              <p>{DEMO.grounded.text}</p>
              <small>{DEMO.grounded.note}</small>
            </div>
            <div className="mk-compare-pane mk-compare-generic" aria-hidden={pos < 8 ? 'true' : undefined}>
              <span className="mk-pill">{DEMO.generic.label}</span>
              <p>{DEMO.generic.text}</p>
              <small>{DEMO.generic.note}</small>
            </div>
            <div
              className="mk-handle"
              role="slider"
              tabIndex={0}
              aria-label="Compare generic chatbot and Kortex answers"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              aria-valuetext={`${Math.round(pos)}% generic chatbot shown`}
              onKeyDown={onKey}
            >
              <span aria-hidden="true">⇆</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

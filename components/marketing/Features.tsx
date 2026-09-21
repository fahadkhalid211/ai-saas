'use client';

import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
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

  const bad = Math.min(1, Math.max(0, (pos - 72) / 20)); // generic reply fully showing
  const good = Math.min(1, Math.max(0, (28 - pos) / 20)); // Kortex reply fully showing
  const status = bad > 0.6 ? `Generic chatbot only. ${DEMO.bad.words.join('. ')}.` : good > 0.6 ? `Kortex only. ${DEMO.good.words.join('. ')}.` : '';

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
            style={{ '--mk-split': `${pos}%`, '--bad': bad.toFixed(3), '--good': good.toFixed(3) } as CSSProperties}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <div className="mk-compare-pane mk-compare-grounded">
              <span className="mk-pill mk-pill-good">{DEMO.grounded.label}</span>
              <p>{DEMO.grounded.text}</p>
              <small>{DEMO.grounded.note}</small>
              <div className="mk-react is-good" aria-hidden="true">
                <span className="mk-react-icon">
                  <svg viewBox="0 0 24 24" width="30" height="30">
                    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mk-react-title">{DEMO.good.title}</p>
                <ul>
                  {DEMO.good.words.map((w, i) => (
                    <li key={w} style={{ '--dl': `${i * -0.9}s`, '--d': `${4 + i * 0.7}s` } as CSSProperties}>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mk-compare-pane mk-compare-generic" aria-hidden={pos < 8 ? 'true' : undefined}>
              <span className="mk-pill">{DEMO.generic.label}</span>
              <p>{DEMO.generic.text}</p>
              <small>{DEMO.generic.note}</small>
              <div className="mk-react is-bad" aria-hidden="true">
                <span className="mk-react-icon">
                  <svg viewBox="0 0 24 24" width="30" height="30">
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="mk-react-title">{DEMO.bad.title}</p>
                <ul>
                  {DEMO.bad.words.map((w, i) => (
                    <li key={w} style={{ '--dl': `${i * -0.9}s`, '--d': `${4.4 + i * 0.6}s` } as CSSProperties}>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
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
          <p className="mk-sr" aria-live="polite">
            {status}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

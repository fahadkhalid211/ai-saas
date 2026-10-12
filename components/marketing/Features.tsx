'use client';

import { T, useT } from '@/lib/i18n/context';
import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { DEMO } from './content';
import { Reveal, SectionHead } from './ui';
import { useI18n } from '@/lib/i18n/context';

/** Before/after comparison slider, keyboard operable (arrow keys, Home, End). */
export function Demo() {
  const __t = useT();
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

  const { dict } = useI18n();
  const demo = dict?.demo || DEMO;

  const bad = Math.min(1, Math.max(0, (pos - 72) / 20)); // generic reply fully showing
  const good = Math.min(1, Math.max(0, (28 - pos) / 20)); // Crescelo reply fully showing
  const badWords = demo?.badWords || DEMO.bad.words;
  const goodWords = demo?.goodWords || DEMO.good.words;
  const groundedLabel = demo?.groundedLabel || DEMO.grounded.label;
  const groundedText = demo?.groundedText || DEMO.grounded.text;
  const groundedNote = demo?.groundedNote || DEMO.grounded.note;
  const genericLabel = demo?.genericLabel || DEMO.generic.label;
  const genericText = demo?.genericText || DEMO.generic.text;
  const genericNote = demo?.genericNote || DEMO.generic.note;
  const goodTitle = demo?.goodTitle || DEMO.good.title;
  const badTitle = demo?.badTitle || DEMO.bad.title;
  const status = bad > 0.6 ? `Generic chatbot only. ${badWords.join('. ')}.` : good > 0.6 ? `Crescelo only. ${goodWords.join('. ')}.` : '';

  return (
    <section id="demo" className="mk-section mk-section-tint" aria-labelledby="mk-demo-title">
      <div className="mk-wrap">
        <SectionHead id="mk-demo-title" eyebrow={demo.eyebrow} title={demo.title} intro={demo.intro} />
        <Reveal>
          <p className="mk-demo-q">
            <span><T>{demo.visitorAsks || 'Visitor asks'}</T></span>
            <T>{demo.question}</T>
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
              <span className="mk-pill mk-pill-good"><T>{groundedLabel}</T></span>
              <p><T>{groundedText}</T></p>
              <small><T>{groundedNote}</T></small>
              <div className="mk-react is-good" aria-hidden="true">
                <span className="mk-react-icon">
                  <svg viewBox="0 0 24 24" width="30" height="30">
                    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mk-react-title"><T>{goodTitle}</T></p>
                <ul>
                  {goodWords.map((w, i) => (
                    <li key={w} style={{ '--dl': `${i * -0.9}s`, '--d': `${4 + i * 0.7}s` } as CSSProperties}>
                      <T>{w}</T>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mk-compare-pane mk-compare-generic" aria-hidden={pos < 8 ? 'true' : undefined}>
              <span className="mk-pill"><T>{genericLabel}</T></span>
              <p><T>{genericText}</T></p>
              <small><T>{genericNote}</T></small>
              <div className="mk-react is-bad" aria-hidden="true">
                <span className="mk-react-icon">
                  <svg viewBox="0 0 24 24" width="30" height="30">
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="mk-react-title"><T>{badTitle}</T></p>
                <ul>
                  {badWords.map((w, i) => (
                    <li key={w} style={{ '--dl': `${i * -0.9}s`, '--d': `${4.4 + i * 0.6}s` } as CSSProperties}>
                      <T>{w}</T>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              className="mk-handle"
              role="slider"
              tabIndex={0}
              aria-label={__t("Compare generic chatbot and Crescelo answers")}
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
            <T>{status}</T>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

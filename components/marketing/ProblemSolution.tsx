'use client';

import { T } from '@/lib/i18n/context';
import { useEffect, useRef } from 'react';
import { STORY } from './content';
import { Eyebrow, Reveal } from './ui';
import { usePrefersReducedMotion } from './hooks';
import { useI18n } from '@/lib/i18n/context';

const TONES = ['lav', 'pink', 'amber', 'coral'] as const;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/**
 * The problem points arrive one by one and stack, centred, as the page scrolls through a pinned stage.
 * A smoothed scroll index drives every card; transforms are written straight to the DOM.
 */
function ProblemStack() {
  const { dict } = useI18n();
  const story = dict?.story || STORY;
  const before = story.before || STORY.before;
  const outerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const n = before.length;

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
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
      const vh = window.innerHeight;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const t = i - current; // > 0: still to come, < 0: already stacked
        let y: number, s: number, o: number, rot: number;
        if (t > 0) {
          const k = Math.min(t, 1);
          y = k * vh * 0.85;
          s = 1;
          o = 1 - Math.max(0, t - 1) * 0.5;
          rot = k * 3;
        } else {
          const d = -t;
          y = -d * 26;
          s = 1 - d * 0.045;
          o = 1 - Math.max(0, d - 2) * 0.5;
          rot = 0;
        }
        el.style.transform = `translate(-50%, -50%) translate3d(0, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;
        el.style.opacity = clamp(o, 0, 1).toFixed(3);
        el.style.zIndex = String(10 + i);
        el.setAttribute('aria-hidden', t > 0.6 ? 'true' : 'false');
      });
    };

    const tick = () => {
      current += (target - current) * 0.13;
      if (Math.abs(target - current) < 0.0008) current = target;
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
  }, [n]);

  return (
    <div ref={outerRef} className="mk-stack-outer" style={{ height: `calc(100vh + ${(n - 1) * 70}vh)` }}>
      <div className="mk-stack-stage">
        {before.map((item, i) => (
          <article
            key={item.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="mk-stack-card"
            data-tone={TONES[i % TONES.length]}
          >
            <span className="mk-stack-num" aria-hidden="true">
              0{i + 1}
            </span>
            <h3><T>{item.title}</T></h3>
            <p><T>{item.body}</T></p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ProblemSolution() {
  const { dict } = useI18n();
  const story = dict?.story || STORY;
  const reduced = usePrefersReducedMotion();

  return (
    <section id="problem" className="mk-section mk-story" aria-labelledby="mk-story-title">
      <div className="mk-wrap">
        <Reveal className="mk-center-head mk-story-head">
          <Eyebrow><T>{story.eyebrow}</T></Eyebrow>
          <h2 id="mk-story-title" className="mk-h2 mk-h2-center">
            <T>{story.title}</T>
          </h2>
        </Reveal>
      </div>

      {reduced ? (
        <div className="mk-wrap">
          <ol className="mk-stack-static">
            {story.before.map((item, i) => (
              <li key={item.title} className="mk-stack-card is-static" data-tone={TONES[i % TONES.length]}>
                <span className="mk-stack-num" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3><T>{item.title}</T></h3>
                <p><T>{item.body}</T></p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <ProblemStack />
      )}

      <div className="mk-wrap">
        <Reveal className="mk-center-head mk-story-turn">
          <Eyebrow><T>{story.afterEyebrow}</T></Eyebrow>
          <h2 className="mk-h2 mk-h2-center"><T>{story.afterTitle}</T></h2>
        </Reveal>

        <ul className="mk-cards">
          {story.after.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 90} className="mk-card">
              <h3><T>{item.title}</T></h3>
              <p><T>{item.body}</T></p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

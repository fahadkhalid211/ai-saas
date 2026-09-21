'use client';

import type { CSSProperties } from 'react';
import { STORY } from './content';
import { Eyebrow, Reveal } from './ui';
import { useScrollProgress } from './hooks';

export function ProblemSolution() {
  const [ref, progress] = useScrollProgress<HTMLElement>();
  const style = { '--mk-progress': progress.toFixed(3) } as CSSProperties;

  return (
    <section id="problem" className="mk-section mk-story" aria-labelledby="mk-story-title" ref={ref} style={style}>
      <div className="mk-wrap">
        <Reveal className="mk-head">
          <Eyebrow>{STORY.eyebrow}</Eyebrow>
          <h2 id="mk-story-title" className="mk-h2 mk-h2-wide">
            {STORY.title}
          </h2>
        </Reveal>

        <div className="mk-story-grid">
          <div className="mk-story-rail" aria-hidden="true">
            <span className="mk-story-fill" />
          </div>
          <ol className="mk-story-list mk-story-before">
            {STORY.before.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 80} className="mk-story-item">
                <span className="mk-story-num">0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="mk-head mk-story-turn">
          <Eyebrow>{STORY.afterEyebrow}</Eyebrow>
          <h2 className="mk-h2 mk-h2-wide">{STORY.afterTitle}</h2>
        </Reveal>

        <ul className="mk-cards">
          {STORY.after.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 90} className="mk-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

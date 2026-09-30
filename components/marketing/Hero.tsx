'use client';

import { useEffect, useRef, useState } from 'react';
import { HERO, SIGNUP_HREF } from './content';
import { ButtonLink } from './ui';
import { usePrefersReducedMotion } from './hooks';
import { CresceloOrb, type OrbState } from '@/components/brand/CresceloOrb';

interface Turn {
  q: string;
  a: string;
  source: string;
  booking?: boolean;
}

/** Sample conversation for the illustration. Labelled as sample content in the UI. */
const TURNS: Turn[] = [
  {
    q: 'How much is a standard cut?',
    a: 'A standard cut is $35 and takes about 30 minutes. Beard trims are $15 extra.',
    source: 'Services & Pricing Document',
  },
  {
    q: 'Are you open on Sundays?',
    a: 'We are closed on Sundays. Saturday hours are 9am to 4pm.',
    source: 'Business Hours Policy',
  },
  {
    q: 'Can I book Saturday at 10?',
    a: 'Saturday at 10:00 is open. I have held it for you. Confirm to finish booking.',
    source: 'Real-time Calendar Sync',
    booking: true,
  },
];

function PromptDemo() {
  const reduced = usePrefersReducedMotion();
  const [turn, setTurn] = useState(0);
  const [typed, setTyped] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paused, setPaused] = useState(false);
  const cur = TURNS[turn];

  // Typing -> answer -> hold -> next turn. Static and manual when motion is reduced or the visitor takes over.
  useEffect(() => {
    if (reduced || paused) return;
    let t: ReturnType<typeof setTimeout>;
    if (typed < cur.q.length) {
      t = setTimeout(() => setTyped((n) => n + 1), 38);
    } else if (!showAnswer) {
      t = setTimeout(() => setShowAnswer(true), 450);
    } else {
      t = setTimeout(() => {
        setTurn((n) => (n + 1) % TURNS.length);
        setTyped(0);
        setShowAnswer(false);
        setConfirmed(false);
      }, 5200);
    }
    return () => clearTimeout(t);
  }, [reduced, paused, typed, showAnswer, cur.q.length]);

  const pick = (i: number) => {
    setPaused(true);
    setTurn(i);
    setTyped(TURNS[i].q.length);
    setShowAnswer(true);
    setConfirmed(false);
  };
  const isStatic = reduced || paused;
  const question = isStatic ? cur.q : cur.q.slice(0, typed);
  const answerVisible = isStatic ? true : showAnswer;

  // The assistant mirrors the demo: it listens while the question is typed, thinks for a beat, then answers.
  const orbState: OrbState = isStatic ? 'idle' : typed < cur.q.length ? 'listening' : !showAnswer ? 'thinking' : 'speaking';

  return (
    <div className="mk-prompt-wrap">
      <div className="mk-orb-perch">
        <CresceloOrb size={88} state={orbState} followPointer />
      </div>
      <div className="mk-prompt">
        <div className="mk-prompt-top">
          <span className="mk-live" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>Live visitor conversation • Apex Barbers</span>
        </div>
        <div className="mk-prompt-body" role="log" aria-live="polite" aria-label="Customer conversation preview">
          <p className="mk-prompt-q">
            {question}
            {!isStatic && typed < cur.q.length ? <span className="mk-caret" aria-hidden="true" /> : null}
          </p>
          {answerVisible ? (
            <div className="mk-prompt-a">
              <p>
                {cur.a}
                <span className="mk-source">Source: {cur.source}</span>
              </p>
              {cur.booking ? (
                <div className="mk-booking-card">
                  <div>
                    <strong>Sat, 10:00 – 10:30</strong>
                    <span>Standard cut · $35</span>
                  </div>
                  <button type="button" className="mk-btn mk-btn-primary mk-btn-sm" onClick={() => setConfirmed(true)} disabled={confirmed}>
                    {confirmed ? 'Confirmed' : 'Confirm'}
                  </button>
                </div>
              ) : null}
              {cur.booking && confirmed ? <p className="mk-logline">Booking confirmed and synced to Google Calendar.</p> : null}
            </div>
          ) : null}
        </div>
        <div className="mk-chips" aria-label="Suggested customer inquiries">
          {TURNS.map((t, i) => (
            <button key={t.q} type="button" className={`mk-chip ${i === turn ? 'is-on' : ''}`} aria-pressed={i === turn} onClick={() => pick(i)}>
              {t.q}
            </button>
          ))}
        </div>
      </div>
      <p className="mk-caption">Interactive demo. Select an inquiry above to test autonomous grounded responses.</p>
    </div>
  );
}

export function Hero() {
  return (
    <section className="mk-hero" aria-labelledby="mk-hero-title">
      <div className="mk-hero-glow" aria-hidden="true" />
      <div className="mk-wrap mk-hero-inner">
        <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
          {HERO.eyebrow}
        </p>
        <h1 id="mk-hero-title" className="mk-h1">
          <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
            {HERO.title[0]}
          </span>
          <span className="mk-echo mk-echo-em" style={{ ['--mk-delay' as string]: '360ms' }}>
            {HERO.title[1]}
          </span>
        </h1>
        <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '520ms' }}>
          {HERO.body.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>
        <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '640ms' }}>
          <ButtonLink href={SIGNUP_HREF}>{HERO.primaryCta}</ButtonLink>
          <ButtonLink href="/playground" variant="ghost">
            {HERO.secondaryCta}
          </ButtonLink>
        </div>
        <ul className="mk-trust mk-rise" style={{ ['--mk-delay' as string]: '760ms' }}>
          {HERO.trust.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <PromptDemo />
      </div>
    </section>
  );
}

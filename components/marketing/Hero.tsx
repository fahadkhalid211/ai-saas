'use client';

import { T, useT } from '@/lib/i18n/context';
import { useEffect, useRef, useState } from 'react';
import { HERO, SIGNUP_HREF } from './content';
import { ButtonLink } from './ui';
import { usePrefersReducedMotion } from './hooks';
import { CresceloOrb, type OrbState } from '@/components/brand/CresceloOrb';
import { useI18n } from '@/lib/i18n/context';

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
    a: 'Saturday at 10:00 is open. Confirm to finish booking.',
    source: 'Opening hours and bookings',
    booking: true,
  },
];

function PromptDemo() {
  const __t = useT();
  const { dict } = useI18n();
  const turns = dict?.hero?.turns || TURNS;
  const heroDict = dict?.hero;
  const reduced = usePrefersReducedMotion();
  const [turn, setTurn] = useState(0);
  const [typed, setTyped] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paused, setPaused] = useState(false);
  const cur = turns[turn] || turns[0] || TURNS[0];

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
        setTurn((n) => (n + 1) % turns.length);
        setTyped(0);
        setShowAnswer(false);
        setConfirmed(false);
      }, 5200);
    }
    return () => clearTimeout(t);
  }, [reduced, paused, typed, showAnswer, cur.q.length, turns.length]);

  const pick = (i: number) => {
    setPaused(true);
    setTurn(i);
    setTyped((turns[i] || TURNS[i]).q.length);
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
          <span><T>{heroDict?.sampleBadge || 'Live visitor conversation • Apex Barbers'}</T></span>
        </div>
        <div className="mk-prompt-body" role="log" aria-live="polite" aria-label={__t("Customer conversation preview")}>
          <p className="mk-prompt-q">
            <T>{question}</T>
            {!isStatic && typed < cur.q.length ? <span className="mk-caret" aria-hidden="true" /> : null}
          </p>
          {answerVisible ? (
            <div className="mk-prompt-a">
              <p>
                <T>{cur.a}</T>
                <span className="mk-source"><T>{cur.source}</T></span>
              </p>
              {cur.booking ? (
                <div className="mk-booking-card">
                  <div>
                    <strong><T>Sat, 10:00 – 10:30</T></strong>
                    <span><T>Standard cut · $35</T></span>
                  </div>
                  <button type="button" className="mk-btn mk-btn-primary mk-btn-sm" onClick={() => setConfirmed(true)} disabled={confirmed}>
                    <T>{confirmed ? (heroDict?.confirmed || 'Confirmed') : (heroDict?.confirmBooking || 'Confirm')}</T>
                  </button>
                </div>
              ) : null}
              {cur.booking && confirmed ? <p className="mk-logline"><T>Booking confirmed. A confirmation email is on its way.</T></p> : null}
            </div>
          ) : null}
        </div>
        <div className="mk-chips" aria-label={__t("Suggested customer inquiries")}>
          {turns.map((t, i) => (
            <button key={t.q} type="button" className={`mk-chip ${i === turn ? 'is-on' : ''}`} aria-pressed={i === turn} onClick={() => pick(i)}>
              <T>{t.q}</T>
            </button>
          ))}
        </div>
      </div>
      <p className="mk-caption"><T>{heroDict?.interactiveCaption || 'Interactive demo. Select an inquiry above to test autonomous grounded responses.'}</T></p>
    </div>
  );
}

export function Hero() {
  const { dict } = useI18n();
  const hero = dict?.hero || HERO;

  return (
    <section className="mk-hero" aria-labelledby="mk-hero-title">
      <div className="mk-hero-glow" aria-hidden="true" />
      <div className="mk-wrap mk-hero-inner">
        <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
          <T>{hero.eyebrow}</T>
        </p>
        <h1 id="mk-hero-title" className="mk-h1">
          <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
            <T>{hero.title[0]}</T>
          </span>
          <span className="mk-echo mk-echo-em" style={{ ['--mk-delay' as string]: '360ms' }}>
            <T>{hero.title[1]}</T>
          </span>
        </h1>
        <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '520ms' }}>
          {hero.body.split('\n').map((line, i, arr) => (
            <span key={i}><T>{line}</T>{i < arr.length - 1 && <br />}</span>
          ))}
        </p>
        <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '640ms' }}>
          <ButtonLink href={SIGNUP_HREF}><T>{hero.primaryCta}</T></ButtonLink>
          <ButtonLink href="/playground" variant="ghost">
            <T>{hero.secondaryCta}</T>
          </ButtonLink>
        </div>
        <ul className="mk-trust mk-rise" style={{ ['--mk-delay' as string]: '760ms' }}>
          {hero.trust.map((t) => (
            <li key={t}><T>{t}</T></li>
          ))}
        </ul>
        <PromptDemo />
      </div>
    </section>
  );
}

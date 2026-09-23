'use client';

import { useEffect, useRef, useState } from 'react';
import { HERO, SIGNUP_HREF } from './content';
import { ButtonLink } from './ui';
import { usePrefersReducedMotion } from './hooks';

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

/** Googly-eyed mascot. Pupils follow the pointer through two CSS variables on the element. */
function Mascot() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.max(1, Math.hypot(dx, dy));
        const k = Math.min(1, d / 200) * 4;
        el.style.setProperty('--px', `${((dx / d) * k).toFixed(2)}px`);
        el.style.setProperty('--py', `${((dy / d) * k).toFixed(2)}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div className="mk-mascot" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 72 72" width="72" height="72">
        {/* Brand Signal Crest */}
        <path d="M30 6a7 7 0 1 1 12 0" fill="none" stroke="#abff44" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="36" cy="10" r="2" fill="#abff44" />
        
        {/* Brand Audio / Ear Nodes */}
        <path d="M9 30c-3 0-5 3-5 7s2 7 5 7" fill="none" stroke="#abff44" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M63 30c3 0 5 3 5 7s-2 7-5 7" fill="none" stroke="#abff44" strokeWidth="2.5" strokeLinecap="round" />

        {/* Chassis Head - Crescelo Deep Obsidian */}
        <rect x="9" y="13" width="54" height="48" rx="18" fill="#08251a" stroke="#1a1a1a" strokeWidth="2.5" />
        <rect x="11" y="15" width="50" height="44" rx="16" fill="none" stroke="rgba(171,255,68,0.25)" strokeWidth="1" />

        {/* Warm Cream Eye Portals */}
        <circle cx="26" cy="33" r="10" fill="#fffeeb" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="46" cy="33" r="10" fill="#fffeeb" stroke="#1a1a1a" strokeWidth="2" />

        {/* Responsive Cursor-Tracking Pupils with Lime Reflection */}
        <circle className="mk-pupil" cx="26" cy="33" r="4.5" fill="#08251a" />
        <circle className="mk-pupil" cx="27.6" cy="31.2" r="1.8" fill="#abff44" />
        <circle className="mk-pupil" cx="46" cy="33" r="4.5" fill="#08251a" />
        <circle className="mk-pupil" cx="47.6" cy="31.2" r="1.8" fill="#abff44" />

        {/* Cheek Accents */}
        <circle cx="17" cy="42" r="2.5" fill="#f0d7ff" opacity="0.7" />
        <circle cx="55" cy="42" r="2.5" fill="#f0d7ff" opacity="0.7" />

        {/* Friendly Lime Smile */}
        <path d="M29 48c4.5 4 9.5 4 14 0" fill="none" stroke="#abff44" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

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

  return (
    <div className="mk-prompt-wrap">
      <Mascot />
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
          {HERO.body}
        </p>
        <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '640ms' }}>
          <ButtonLink href={SIGNUP_HREF}>{HERO.primaryCta}</ButtonLink>
          <ButtonLink href="#how-it-works" variant="ghost">
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

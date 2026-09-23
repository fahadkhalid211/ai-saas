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
        {/* Sensor Node & Antenna */}
        <line x1="36" y1="8" x2="36" y2="12" stroke="var(--mk-deep)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="5" r="3" fill="#38bdf8" stroke="var(--mk-deep)" strokeWidth="1.5" />
        
        {/* Audio / Comm Pods */}
        <rect x="6" y="24" width="5" height="16" rx="2.5" fill="#38bdf8" stroke="var(--mk-deep)" strokeWidth="1.5" />
        <rect x="61" y="24" width="5" height="16" rx="2.5" fill="#38bdf8" stroke="var(--mk-deep)" strokeWidth="1.5" />
        
        {/* Floating Collar */}
        <path d="M26 58h20l-2 5H28z" fill="#94a3b8" stroke="var(--mk-deep)" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Chassis Head */}
        <rect x="10" y="12" width="52" height="46" rx="18" fill="var(--mk-surface, #f8fafc)" stroke="var(--mk-deep)" strokeWidth="2.5" />
        
        {/* Visor Screen */}
        <rect x="15" y="18" width="42" height="26" rx="12" fill="#090d16" stroke="#1e293b" strokeWidth="1.2" />
        
        {/* Eye Aperture Rings */}
        <circle cx="27" cy="31" r="7.5" fill="#0f172a" stroke="#0284c7" strokeWidth="1.2" opacity="0.9" />
        <circle cx="45" cy="31" r="7.5" fill="#0f172a" stroke="#0284c7" strokeWidth="1.2" opacity="0.9" />
        
        {/* Responsive Cursor-Tracking Pupils */}
        <circle className="mk-pupil" cx="27" cy="31" r="3.6" fill="#38bdf8" />
        <circle className="mk-pupil" cx="28.2" cy="29.8" r="1.2" fill="#ffffff" />
        <circle className="mk-pupil" cx="45" cy="31" r="3.6" fill="#38bdf8" />
        <circle className="mk-pupil" cx="46.2" cy="29.8" r="1.2" fill="#ffffff" />
        
        {/* Friendly AI Micro-Smile */}
        <path d="M30 49c3.5 2.8 8.5 2.8 12 0" fill="none" stroke="var(--mk-deep)" strokeWidth="2.2" strokeLinecap="round" />
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

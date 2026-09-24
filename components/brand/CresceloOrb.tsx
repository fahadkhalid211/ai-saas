'use client';

import { useEffect, useId, useRef } from 'react';
import './orb.css';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface CresceloOrbProps {
  /** Rendered size in px. */
  size?: number;
  /** What the assistant is doing. Drives the animation. */
  state?: OrbState;
  /**
   * The highlight on the sphere drifts a few pixels toward the pointer while it is nearby.
   * It is a reflection, not an eye: there is nothing to look at you.
   */
  followPointer?: boolean;
  /** Small sizes use a static drawing without blur filters. Defaults to true under 36px. */
  mark?: boolean;
  /** Accessible name. Omit for a purely decorative orb. */
  label?: string;
  className?: string;
}

/**
 * The Crescelo assistant: a deep glass sphere holding a lime "C" arc with a seed in its opening; the arc waxes as it works.
 * Faceless on purpose. The colours are fixed brand colours so it looks right on cream and on charcoal.
 */
export function CresceloOrb({ size = 64, state = 'idle', followPointer = false, mark, label, className = '' }: CresceloOrbProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = useRef<HTMLSpanElement>(null);
  const isMark = mark ?? size < 36;

  useEffect(() => {
    const el = ref.current;
    if (!el || !followPointer || isMark) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.max(1, Math.hypot(dx, dy));
        // strongest when the pointer is close, fading to nothing far away; never more than 2.5 units
        const k = Math.max(0, 1 - d / 500) * 2.5;
        el.style.setProperty('--cx-lx', `${((dx / d) * k).toFixed(2)}px`);
        el.style.setProperty('--cx-ly', `${((dy / d) * k).toFixed(2)}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [followPointer, isMark]);

  const id = (name: string) => `cx-${uid}-${name}`;

  return (
    <span
      ref={ref}
      className={`cx-orb is-${state} ${isMark ? 'is-mark' : ''} ${className}`}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <radialGradient id={id('body')} cx="34%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#1d6a4b" />
            <stop offset="42%" stopColor="#0c3526" />
            <stop offset="100%" stopColor="#04140d" />
          </radialGradient>
          <radialGradient id={id('halo')} cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="#abff44" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#abff44" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id('cres')} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1ffc9" />
            <stop offset="45%" stopColor="#abff44" />
            <stop offset="100%" stopColor="#74d321" />
          </linearGradient>
          <mask id={id('mask')} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
            <circle cx="50" cy="50" r="25" fill="white" />
            <circle className="cx-cutout" cx="54.5" cy="47.5" r="22.4" fill="black" />
          </mask>
          <clipPath id={id('clip')}>
            <circle cx="50" cy="50" r="34" />
          </clipPath>
          {!isMark && (
            <filter id={id('blur')} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
          )}
        </defs>

        {/* glow behind everything */}
        {!isMark && <circle className="cx-halo" cx="50" cy="50" r="49" fill={`url(#${id('halo')})`} />}
        <circle className="cx-ripple-a" cx="50" cy="50" r="34" fill="none" stroke="#abff44" strokeWidth="1.2" />
        <circle className="cx-ripple-b" cx="50" cy="50" r="34" fill="none" stroke="#abff44" strokeWidth="1.2" />

        <g className="cx-body">
          {/* the sphere */}
          <circle cx="50" cy="50" r="34" fill={`url(#${id('body')})`} />
          <circle cx="50" cy="50" r="33.4" fill="none" stroke="#abff44" strokeOpacity="0.32" strokeWidth="1" />

          <g clipPath={`url(#${id('clip')})`}>
            {/* a very faint slow sheen so the glass feels deep */}
            {!isMark && <ellipse className="cx-sheen" cx="50" cy="34" rx="34" ry="12" fill="#ffffff" fillOpacity="0.05" />}

            {/* the crescent, with a soft bloom behind it */}
            <g className="cx-crescent">
              {!isMark && (
                <rect width="100" height="100" fill={`url(#${id('cres')})`} mask={`url(#${id('mask')})`} filter={`url(#${id('blur')})`} opacity="0.65" />
              )}
              <rect width="100" height="100" fill={`url(#${id('cres')})`} mask={`url(#${id('mask')})`} />
              {/* a seed in the mouth of the C: the "growth" in Crescelo */}
              <circle className="cx-seed" cx="57" cy="51" r="3.4" fill={`url(#${id('cres')})`} />
            </g>

            {/* specular highlight */}
            <ellipse className="cx-spec" cx="37" cy="29" rx="10" ry="5.2" transform="rotate(-32 37 29)" fill="#ffffff" fillOpacity={isMark ? 0.16 : 0.2} />
          </g>

          {/* the small light that circles the sphere while it thinks */}
          <g className="cx-orbit">
            <circle cx="50" cy="12.5" r="2.3" fill="#f1ffc9" />
          </g>
        </g>
      </svg>
    </span>
  );
}

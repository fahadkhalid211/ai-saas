'use client';

import { useId } from 'react';
import { useRootScale } from '@/lib/ui/use-root-scale';
import './mark.css';

interface CresceloMarkProps {
  size?: number;
  /** 'still': logo with a breathing seed. 'draw': loader, the C draws itself. */
  motion?: 'still' | 'draw';
  /** Accessible name. Omit when decorative. */
  label?: string;
  className?: string;
}

/**
 * The Crescelo logo: a bold lime "C" (a letter, not a moon: even strokes, round ends) with a seed growing in its opening,
 * on a deep green tile. Same geometry as app/icon.svg (see scripts/make-icons.mjs).
 */
export function CresceloMark({ size = 32, motion = 'still', label, className = '' }: CresceloMarkProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const px = Math.round(size * useRootScale());
  return (
    <span
      className={`cm-mark ${motion === 'draw' ? 'is-drawing' : ''} ${className}`}
      style={{ width: px, height: px }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 100 100" width={px} height={px}>
        <defs>
          <linearGradient id={`t${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#12432f" />
            <stop offset="100%" stopColor="#04140d" />
          </linearGradient>
          <linearGradient id={`c${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1ffc9" />
            <stop offset="45%" stopColor="#abff44" />
            <stop offset="100%" stopColor="#74d321" />
          </linearGradient>
          <clipPath id={`k${id}`}>
            <rect x="0" y="0" width="100" height="100" rx="26" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="100" height="100" rx="26" fill={`url(#t${id})`} />
        <g clipPath={`url(#k${id})`}>
          <circle className="cm-glow" cx="50" cy="50" r="40" fill="#abff44" opacity="0.12" />
          <path
            className="cm-c"
            pathLength={100}
            d="M69.9 33.3 A26 26 0 1 0 69.9 66.7"
            fill="none"
            stroke={`url(#c${id})`}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <circle className="cm-seed" cx="63" cy="50" r="5.6" fill={`url(#c${id})`} />
          <rect className="cm-sheen" x="14" y="0" width="16" height="100" fill="#fff" opacity="0" transform="skewX(-18)" />
        </g>
        <rect x="1" y="1" width="98" height="98" rx="25" fill="none" stroke="#abff44" strokeOpacity="0.28" strokeWidth="2" />
      </svg>
    </span>
  );
}

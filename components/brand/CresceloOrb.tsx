'use client';

import { CresceloMark } from './CresceloMark';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface CresceloOrbProps {
  /** Rendered size in px. */
  size?: number;
  /** What the assistant is doing: while it works or talks the C draws itself; at rest the seed breathes. */
  state?: OrbState;
  /** Kept for existing callers; the mark has no highlight to move. */
  followPointer?: boolean;
  mark?: boolean;
  /** Accessible name. Omit for a purely decorative avatar. */
  label?: string;
  className?: string;
}

/**
 * The Crescelo assistant avatar: the brand "C" (see CresceloMark). It is the same symbol as the logo, so the
 * assistant and the product read as one thing.
 */
export function CresceloOrb({ size = 64, state = 'idle', label, className = '' }: CresceloOrbProps) {
  return <CresceloMark size={size} motion={state === 'thinking' || state === 'speaking' ? 'draw' : 'still'} label={label} className={className} />;
}

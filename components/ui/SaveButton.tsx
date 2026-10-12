'use client';

import { T } from '@/lib/i18n/context';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { ERROR_EVENT } from '@/lib/ui/notify';
import './ui.css';

interface SaveButtonProps {
  /** True while the request is in flight. */
  saving: boolean;
  /** The error from the last attempt, if any: the button then shows "Failed" instead of "Saved". */
  error?: string | null;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  idleLabel?: string;
  savingLabel?: string;
  savedLabel?: string;
  failedLabel?: string;
  icon?: ReactNode;
  className?: string;
}

const BASE = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer disabled:cursor-not-allowed';
const IDLE = 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60';
const SAVING = 'bg-blue-600 text-white opacity-80';
const SAVED = 'bg-emerald-600 text-white';
const FAILED = 'bg-rose-600 text-white';

/**
 * A save button that always says what happened: Save -> Saving… -> Saved (green tick) or Failed (red cross) for a few
 * seconds, then back to Save. Drive it with `saving` (and `error`); it detects the end of a save by itself.
 */
export function SaveButton({
  saving,
  error,
  onClick,
  type = 'button',
  disabled,
  idleLabel = 'Save Settings',
  savingLabel = 'Saving…',
  savedLabel = 'Saved',
  failedLabel = 'Not saved',
  icon,
  className = '',
}: SaveButtonProps) {
  const [phase, setPhase] = useState<'idle' | 'saved' | 'failed'>('idle');
  const wasSaving = useRef(false);
  const latestError = useRef(error);
  latestError.current = error;
  const errorRaised = useRef(false); // the shared error dialog opened while this save was running

  useEffect(() => {
    const mark = () => { errorRaised.current = true; };
    window.addEventListener(ERROR_EVENT, mark);
    return () => window.removeEventListener(ERROR_EVENT, mark);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (saving) {
      errorRaised.current = false;
      setPhase('idle');
    } else if (wasSaving.current) {
      setPhase(latestError.current || errorRaised.current ? 'failed' : 'saved');
      timer = setTimeout(() => setPhase('idle'), 3500);
    }
    wasSaving.current = saving;
    return () => timer && clearTimeout(timer);
  }, [saving]);

  const state = saving ? 'saving' : phase;
  const tone = state === 'saving' ? SAVING : state === 'saved' ? SAVED : state === 'failed' ? FAILED : IDLE;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || saving}
      aria-live="polite"
      className={`${BASE} ${tone} ${state === 'saved' ? 'sb-pop' : ''} ${state === 'failed' ? 'sb-shake' : ''} ${className}`}
    >
      {state === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {state === 'saved' && (
        <svg className="sb-check h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12.5 L9.5 18 L20 6.5" />
        </svg>
      )}
      {state === 'failed' && (
        <svg className="sb-cross h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6 L18 18" />
          <path d="M18 6 L6 18" />
        </svg>
      )}
      {state === 'idle' && icon}
      <span>{state === 'saving' ? <T>{savingLabel}</T> : state === 'saved' ? <T>{savedLabel}</T> : state === 'failed' ? failedLabel : <T>{idleLabel}</T>}</span>
    </button>
  );
}

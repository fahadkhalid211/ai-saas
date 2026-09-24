'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CresceloMark } from '@/components/brand/CresceloMark';
import { ERROR_EVENT, type ErrorNotice } from '@/lib/ui/notify';
import './ui.css';

/**
 * The one place errors are shown: a centred, branded dialog with an animated red cross, so the visitor sees the problem
 * wherever they are on a long page. Mount <ErrorModalHost /> once; raise errors with showErrorModal() from lib/ui/notify.
 */
export function ErrorModalHost() {
  const [notice, setNotice] = useState<ErrorNotice | null>(null);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onError = (e: Event) => setNotice((e as CustomEvent<ErrorNotice>).detail);
    window.addEventListener(ERROR_EVENT, onError);
    return () => window.removeEventListener(ERROR_EVENT, onError);
  }, []);

  const close = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (!notice) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [notice, close]);

  if (!mounted || !notice) return null;

  return createPortal(
    <div
      className="em-overlay fixed inset-0 z-[100000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="em-title"
        aria-describedby="em-message"
        className="em-card relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[#1f1e1d] p-7 pt-6 text-center text-[#e8e5dc] shadow-[0_28px_90px_rgba(0,0,0,0.6)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(244,63,94,0.16),transparent)]" aria-hidden="true" />

        <div className="relative mb-5 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a19f96]">
          <CresceloMark size={20} />
          <span>Crescelo</span>
        </div>

        <div className="relative mx-auto mb-5 em-badge" aria-hidden="true">
          <span className="em-pulse" />
          <div className="em-badge-inner absolute inset-0">
            <svg viewBox="0 0 84 84" width="84" height="84">
              <circle cx="42" cy="42" r="36" fill="rgba(244,63,94,0.12)" />
              <circle className="em-ring" cx="42" cy="42" r="36" fill="none" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" transform="rotate(-90 42 42)" />
              <path className="em-x1" d="M30 30 L54 54" fill="none" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" />
              <path className="em-x2" d="M54 30 L30 54" fill="none" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <h2 id="em-title" className="relative text-[22px] leading-tight text-[#faf9f5]" style={{ fontFamily: 'var(--kx-serif, Georgia, serif)' }}>
          {notice.title || 'Something went wrong'}
        </h2>
        <p id="em-message" className="relative mt-2 break-words text-[13.5px] leading-relaxed text-[#d8d5cb]">
          {notice.message}
        </p>
        {notice.hint && <p className="relative mt-2 text-[12px] leading-relaxed text-[#a19f96]">{notice.hint}</p>}

        <button
          ref={closeRef}
          type="button"
          onClick={close}
          className="relative mt-6 w-full rounded-xl bg-[#abff44] px-4 py-2.5 text-[13px] font-semibold text-[#08251a] transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#abff44]"
        >
          Got it
        </button>
      </div>
    </div>,
    document.body
  );
}

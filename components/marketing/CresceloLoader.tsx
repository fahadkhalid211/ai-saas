'use client';

import React from 'react';
import { CresceloMark } from '@/components/brand/CresceloMark';

interface CresceloLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  fullscreen?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 128,
};

/** The loading state everywhere in the app: the Crescelo C drawing itself. */
export function CresceloLoader({ size = 'md', label, fullscreen = false, className = '' }: CresceloLoaderProps) {
  const px = SIZE_MAP[size];

  const content = (
    <div className={`inline-flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-label={label || 'Loading...'}>
      <CresceloMark size={px} motion="draw" />
      {label && (
        <span
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: size === 'sm' ? '12px' : '14px', fontWeight: 600, letterSpacing: '0.02em' }}
          className="text-[#08251a] dark:text-slate-300"
        >
          {label}
        </span>
      )}
    </div>
  );

  if (!fullscreen) return content;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="bg-[#fffeeb] dark:bg-[#1f1e1d]"
    >
      {content}
    </div>
  );
}

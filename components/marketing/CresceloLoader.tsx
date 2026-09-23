'use client';

import React from 'react';

interface CresceloLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  fullscreen?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

/**
 * Animated Crescelo "C" writing loader.
 * Traces the letter "C" along a geometric arc with the Crescelo lime & emerald brand palette.
 */
export function CresceloLoader({
  size = 'md',
  label,
  fullscreen = false,
  className = '',
}: CresceloLoaderProps) {
  const pixelSize = SIZE_MAP[size];

  const content = (
    <div
      className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={label || 'Loading...'}
    >
      <div
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 80 80"
          width={pixelSize}
          height={pixelSize}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Crescelo Brand Gradient: Lime to Deep Emerald */}
            <linearGradient id="crescelo-c-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#abff44" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0f6e58" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="crescelo-c-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Faint background track for the C curve */}
          <path
            d="M 58 22 A 26 26 0 1 0 58 58"
            fill="none"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
            className="text-slate-200 dark:text-slate-800 opacity-30"
          />

          {/* Animated drawing "C" arc - writes up dynamically */}
          <path
            d="M 58 22 A 26 26 0 1 0 58 58"
            fill="none"
            stroke="url(#crescelo-c-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#crescelo-c-glow)"
            style={{
              strokeDasharray: '122',
              animation: 'crescelo-write-c 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              transformOrigin: '40px 40px',
            }}
          />

          {/* Orbiting tip spark */}
          <circle
            cx="40"
            cy="40"
            r="3.5"
            fill="#abff44"
            style={{
              animation: 'crescelo-pulse-center 1.6s ease-in-out infinite',
            }}
          />
        </svg>
      </div>

      {label && (
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: size === 'sm' ? '12px' : '14px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: 'var(--mk-ink, #08251a)',
          }}
          className="dark:text-slate-300 animate-pulse"
        >
          {label}
        </span>
      )}

      <style jsx global>{`
        @keyframes crescelo-write-c {
          0% {
            stroke-dashoffset: 122;
            transform: rotate(-15deg);
          }
          50% {
            stroke-dashoffset: 0;
            transform: rotate(0deg);
          }
          85% {
            stroke-dashoffset: -122;
            transform: rotate(345deg);
          }
          100% {
            stroke-dashoffset: -122;
            transform: rotate(345deg);
          }
        }
        @keyframes crescelo-pulse-center {
          0%, 100% {
            transform: scale(0.6);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
            filter: drop-shadow(0 0 6px #abff44);
          }
        }
      `}</style>
    </div>
  );

  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 254, 235, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
        className="dark:bg-slate-950/85"
      >
        {content}
      </div>
    );
  }

  return content;
}

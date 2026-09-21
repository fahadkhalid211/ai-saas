'use client';

import React, { useRef, useCallback } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightRadius?: number;
  theme?: 'light' | 'dark';
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor,
  spotlightRadius = 400,
  theme = 'dark',
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultColor =
    theme === 'light'
      ? 'rgba(14, 165, 233, 0.12)'
      : 'rgba(56, 189, 248, 0.18)';

  const activeColor = spotlightColor || defaultColor;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    el.style.setProperty('--spotlight-x', `${x}px`);
    el.style.setProperty('--spotlight-y', `${y}px`);
    el.style.setProperty('--spotlight-opacity', '1');
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--spotlight-opacity', '0');
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group ${className}`}
      style={
        {
          '--spotlight-x': '-1000px',
          '--spotlight-y': '-1000px',
          '--spotlight-opacity': '0',
        } as React.CSSProperties
      }
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ease-out"
        style={{
          opacity: 'var(--spotlight-opacity, 0)',
          background: `radial-gradient(${spotlightRadius}px circle at var(--spotlight-x, -1000px) var(--spotlight-y, -1000px), ${activeColor}, transparent 80%)`,
        }}
        aria-hidden="true"
      />

      {/* Card Content */}
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </div>
  );
}

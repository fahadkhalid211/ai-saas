'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ParallaxBackgroundProps {
  theme?: 'light' | 'dark';
}

export function ParallaxBackground({ theme = 'dark' }: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      el.style.setProperty('--spotlight-x', `${currentX}px`);
      el.style.setProperty('--spotlight-y', `${currentY}px`);

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const isLight = theme === 'light';

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-500"
      style={
        {
          '--spotlight-x': '50vw',
          '--spotlight-y': '30vh',
        } as React.CSSProperties
      }
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isLight ? 0.65 : 0.4,
          background: isLight
            ? `radial-gradient(700px circle at var(--spotlight-x) var(--spotlight-y), rgba(14, 165, 233, 0.08), rgba(99, 102, 241, 0.04), transparent 70%)`
            : `radial-gradient(800px circle at var(--spotlight-x) var(--spotlight-y), rgba(56, 189, 248, 0.15), rgba(79, 70, 229, 0.07), transparent 70%)`,
        }}
      />

      {/* Floating Deep Infrastructure Mesh Orbs with Scroll Parallax */}
      <div
        className={`absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl transition-transform duration-200 ease-out ${
          isLight ? 'bg-sky-400/15' : 'bg-cyan-600/10'
        }`}
        style={{
          transform: `translate3d(0, ${scrollY * 0.16}px, 0)`,
        }}
      />
      <div
        className={`absolute top-1/3 -right-24 h-[520px] w-[520px] rounded-full blur-[140px] transition-transform duration-200 ease-out ${
          isLight ? 'bg-indigo-400/10' : 'bg-indigo-600/10'
        }`}
        style={{
          transform: `translate3d(0, ${scrollY * -0.1}px, 0)`,
          animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
      <div
        className={`absolute top-2/3 -left-20 h-[500px] w-[500px] rounded-full blur-[150px] transition-transform duration-200 ease-out ${
          isLight ? 'bg-blue-400/12' : 'bg-blue-600/10'
        }`}
        style={{
          transform: `translate3d(0, ${scrollY * 0.08}px, 0)`,
        }}
      />
      <div
        className={`absolute -bottom-28 right-1/4 h-[440px] w-[440px] rounded-full blur-[130px] transition-transform duration-200 ease-out ${
          isLight ? 'bg-emerald-400/10' : 'bg-emerald-600/08'
        }`}
        style={{
          transform: `translate3d(0, ${scrollY * -0.06}px, 0)`,
        }}
      />

      {/* Technical Infrastructure Grid Lines */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isLight ? 0.04 : 0.05,
          backgroundImage: isLight
            ? `linear-gradient(to right, rgba(15, 23, 42, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.35) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(56, 189, 248, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: `translate3d(0, ${scrollY * 0.03}px, 0)`,
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 85%)',
        }}
      />

      {/* Fine Scanlines Layer */}
      <div
        className="absolute inset-0 opacity-[0.018] dark:opacity-[0.028] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.4) 3px)',
        }}
      />
    </div>
  );
}

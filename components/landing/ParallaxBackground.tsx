'use client';

import React, { useEffect, useRef } from 'react';

interface ParallaxBackgroundProps {
  theme?: 'light' | 'dark';
}

export function ParallaxBackground({ theme = 'dark' }: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.style.setProperty('--spotlight-x', '50vw');
      el.style.setProperty('--spotlight-y', '30vh');
      el.style.setProperty('--scroll-y', '0px');
      return;
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let animationFrameId: number | null = null;
    let lastScrollY = -1;
    let isRunning = true;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        if (animationFrameId === null && isRunning) {
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };

    const animate = () => {
      if (!isRunning) return;

      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      el.style.setProperty('--spotlight-x', `${currentX}px`);
      el.style.setProperty('--spotlight-y', `${currentY}px`);

      const currentScroll = window.scrollY;
      if (currentScroll !== lastScrollY) {
        lastScrollY = currentScroll;
        el.style.setProperty('--scroll-y', `${currentScroll}px`);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
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
          '--scroll-y': '0px',
        } as React.CSSProperties
      }
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isLight ? 0.65 : 0.4,
          background: isLight
            ? 'radial-gradient(700px circle at var(--spotlight-x) var(--spotlight-y), rgba(14, 165, 233, 0.08), rgba(99, 102, 241, 0.04), transparent 70%)'
            : 'radial-gradient(800px circle at var(--spotlight-x) var(--spotlight-y), rgba(56, 189, 248, 0.15), rgba(79, 70, 229, 0.07), transparent 70%)',
        }}
      />

      {/* Floating Deep Infrastructure Mesh Orbs with Scroll Parallax via CSS Variables */}
      <div
        className={`absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl will-change-transform ${
          isLight ? 'bg-sky-400/15' : 'bg-cyan-600/10'
        }`}
        style={{
          transform: 'translate3d(0, calc(var(--scroll-y) * 0.16), 0)',
        }}
      />
      <div
        className={`absolute top-1/3 -right-24 h-[520px] w-[520px] rounded-full blur-[140px] will-change-transform ${
          isLight ? 'bg-indigo-400/10' : 'bg-indigo-600/10'
        }`}
        style={{
          transform: 'translate3d(0, calc(var(--scroll-y) * -0.1), 0)',
          animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
      <div
        className={`absolute top-2/3 -left-20 h-[500px] w-[500px] rounded-full blur-[150px] will-change-transform ${
          isLight ? 'bg-blue-400/12' : 'bg-blue-600/10'
        }`}
        style={{
          transform: 'translate3d(0, calc(var(--scroll-y) * 0.08), 0)',
        }}
      />
      <div
        className={`absolute -bottom-28 right-1/4 h-[440px] w-[440px] rounded-full blur-[130px] will-change-transform ${
          isLight ? 'bg-emerald-400/10' : 'bg-emerald-600/08'
        }`}
        style={{
          transform: 'translate3d(0, calc(var(--scroll-y) * -0.06), 0)',
        }}
      />

      {/* Technical Infrastructure Grid Lines */}
      <div
        className="absolute inset-0 transition-opacity duration-500 will-change-transform"
        style={{
          opacity: isLight ? 0.04 : 0.05,
          backgroundImage: isLight
            ? 'linear-gradient(to right, rgba(15, 23, 42, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.35) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(56, 189, 248, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'translate3d(0, calc(var(--scroll-y) * 0.03), 0)',
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

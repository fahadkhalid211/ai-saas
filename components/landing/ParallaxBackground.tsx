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
          opacity: isLight ? 0.7 : 0.45,
          background: isLight
            ? `radial-gradient(650px circle at var(--spotlight-x) var(--spotlight-y), rgba(37, 99, 235, 0.10), rgba(99, 102, 241, 0.04), transparent 70%)`
            : `radial-gradient(750px circle at var(--spotlight-x) var(--spotlight-y), rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.08), transparent 70%)`,
        }}
      />

      {/* Floating Deep Space Mesh Orbs with Scroll Parallax */}
      <div
        className={`absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl transition-transform duration-200 ease-out ${
          isLight ? 'bg-blue-400/15' : 'bg-blue-600/12'
        }`}
        style={{
          transform: `translate3d(0, ${scrollY * 0.18}px, 0)`,
        }}
      />
      <div
        className={`absolute top-1/3 -right-24 h-[500px] w-[500px] rounded-full blur-[130px] transition-transform duration-200 ease-out ${
          isLight ? 'bg-indigo-400/12' : 'bg-indigo-600/12'
        }`}
        style={{
          transform: `translate3d(0, ${scrollY * -0.12}px, 0)`,
          animation: 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
      <div
        className={`absolute top-2/3 -left-20 h-[520px] w-[520px] rounded-full blur-[150px] transition-transform duration-200 ease-out ${
          isLight ? 'bg-sky-400/15' : 'bg-sky-500/10'
        }`}
        style={{
          transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
        }}
      />
      <div
        className={`absolute -bottom-28 right-1/4 h-[440px] w-[440px] rounded-full blur-[120px] transition-transform duration-200 ease-out ${
          isLight ? 'bg-emerald-400/10' : 'bg-emerald-600/08'
        }`}
        style={{
          transform: `translate3d(0, ${scrollY * -0.06}px, 0)`,
        }}
      />

      {/* Dynamic Cybernetic Perspective Grid Lines */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isLight ? 0.045 : 0.06,
          backgroundImage: isLight
            ? `linear-gradient(to right, rgba(15, 23, 42, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(255, 255, 255, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          transform: `translate3d(0, ${scrollY * 0.04}px, 0)`,
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, black 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, black 40%, transparent 85%)',
        }}
      />
    </div>
  );
}

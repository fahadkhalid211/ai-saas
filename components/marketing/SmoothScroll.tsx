'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

declare global {
  interface Window {
    __mkLenis?: Lenis;
  }
}

/** Inertial page scrolling (same approach as the reference sites). Disabled for reduced motion. */
export function SmoothScroll() {
  const pathname = usePathname();

  // Reset scroll to top and recalculate dimensions on every route change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__mkLenis?.scrollTo(0, { immediate: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // Recalculate dimensions after next tick and after animations mount
      setTimeout(() => {
        window.__mkLenis?.resize();
      }, 150);
    }
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.2,
      autoResize: true,
      allowNestedScroll: true,
      prevent: (node) => {
        return (
          node.hasAttribute('data-lenis-prevent') ||
          !!node.closest?.('[data-lenis-prevent]')
        );
      },
    });
    window.__mkLenis = lenis;

    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Actively synchronize Lenis scroll dimensions whenever DOM changes or expands
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        lenis.resize();
      });
      ro.observe(document.documentElement);
      if (document.body) ro.observe(document.body);
    }

    // Ensure dimensions are correct when web fonts finish downloading
    document.fonts?.ready?.then(() => {
      lenis.resize();
    });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a || a.getAttribute('href') === '#') return;
      const el = document.querySelector(a.getAttribute('href') as string);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -84, duration: 1.2 });
      history.replaceState(null, '', a.getAttribute('href'));
    };
    document.addEventListener('click', onClick);

    return () => {
      ro?.disconnect();
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__mkLenis;
    };
  }, []);
  return null;
}

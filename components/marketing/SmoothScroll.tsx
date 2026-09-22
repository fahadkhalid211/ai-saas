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

  // Reset scroll to top on every route change immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__mkLenis?.scrollTo(0, { immediate: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: false });
    window.__mkLenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a || a.getAttribute('href') === '#') return;
      const el = document.querySelector(a.getAttribute('href') as string);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -84, duration: 1.3 });
      history.replaceState(null, '', a.getAttribute('href'));
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__mkLenis;
    };
  }, []);
  return null;
}

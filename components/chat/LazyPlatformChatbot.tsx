'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// The chat assistant is about 40 KB of code plus the animated orb, and it sat in every marketing page's first load although nobody
// can use it before the page has painted. It is fetched once the browser is idle, or at the first touch, key press or scroll.
const Chatbot = dynamic(() => import('./FloatingPlatformChatbot').then((m) => m.FloatingPlatformChatbot), { ssr: false, loading: () => null });

export function LazyPlatformChatbot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    // requestIdleCallback is missing in Safari: fall back to a short timer
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const idleId = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 3500 }) : undefined;
    const timerId = w.requestIdleCallback ? undefined : window.setTimeout(go, 2500);
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  return ready ? <Chatbot /> : null;
}

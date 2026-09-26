'use client';

import { useEffect } from 'react';

/** Tells the server this article was read, once per visitor per day. Renders nothing. */
export function BlogViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `crescelo_read_${slug}`;
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem(key) === today) return;
      localStorage.setItem(key, today);
    } catch {
      // storage blocked: count the view anyway
    }
    const timer = window.setTimeout(() => {
      fetch('/api/blog/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }), keepalive: true }).catch(() => undefined);
    }, 4000); // a real read, not a bounce
    return () => window.clearTimeout(timer);
  }, [slug]);
  return null;
}

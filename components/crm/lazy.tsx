'use client';

import dynamic from 'next/dynamic';
import { useState, type ComponentType } from 'react';

/**
 * The dashboard has about 25 tabs and a dozen dialogs. Loading them all up front made the dashboard's first load 1.8 MB of
 * JavaScript, most of it for screens a person never opens in that visit (and for screens only the owner of the service can use).
 * These helpers load a screen the first time it is needed.
 */

function TabLoading() {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center py-24 text-sm text-slate-500">
      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" aria-hidden="true" />
      Loading…
    </div>
  );
}

/** A tab: its code is fetched when it is first shown (the dashboard only renders the active tab). */
export function lazyTab<P extends object>(loader: () => Promise<ComponentType<P>>): ComponentType<P> {
  return dynamic(loader, { loading: () => <TabLoading /> }) as ComponentType<P>;
}

/**
 * A dialog: nothing is fetched until it is asked to open (`isActive(props)`), and once loaded it stays mounted so closing
 * animations and re-opening work as before.
 */
export function lazyOverlay<P extends object>(loader: () => Promise<ComponentType<P>>, isActive: (props: P) => boolean): ComponentType<P> {
  const Loaded = dynamic(loader, { loading: () => null }) as ComponentType<P>;
  function LazyOverlay(props: P) {
    const [seen, setSeen] = useState(false);
    const active = isActive(props);
    if (active && !seen) setSeen(true);
    return seen || active ? <Loaded {...props} /> : null;
  }
  return LazyOverlay;
}

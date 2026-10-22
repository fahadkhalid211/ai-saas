'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

/**
 * The live state of an assistant's AI key, shared by everything on the dashboard that shows it (the header badge, the AI Settings
 * tab, the banner). One poller runs per assistant however many components ask, it checks again whenever the tab becomes visible or
 * the window is focused, and the answer comes from the server (lib/ai/key-health.ts), which asks the provider about the key itself.
 */

export type KeyState = 'valid' | 'invalid' | 'unreachable' | 'missing' | 'unknown';

export interface KeyHealth {
  state: KeyState;
  message: string;
  checkedAt: string | null;
  provider: string;
}

interface Entry {
  health: KeyHealth | null;
  checking: boolean;
  listeners: Set<() => void>;
  timer: ReturnType<typeof setInterval> | null;
  users: number;
  inFlight: Promise<void> | null;
}

/** How often the dashboard asks while it is open. The server only calls the provider when its last answer is about a minute old. */
export const POLL_MS = 20_000;

const entries = new Map<string, Entry>();

/** The assistant-supplied states already applied (each record object once, however often it renders). */
const appliedInitials = new WeakSet<object>();

function entryFor(id: string): Entry {
  let e = entries.get(id);
  if (!e) {
    e = { health: null, checking: false, listeners: new Set(), timer: null, users: 0, inFlight: null };
    entries.set(id, e);
  }
  return e;
}

function notify(e: Entry) {
  // a new snapshot object each time, so subscribers re-render
  e.listeners.forEach((l) => l());
}

/** Hands the hook a state the page already has (it came with the assistant), so nothing flashes "checking" first. */
export function seedKeyHealth(id: string, health: KeyHealth | undefined | null, silent = false) {
  if (!id || !health) return;
  const e = entryFor(id);
  const incoming = health.checkedAt ? Date.parse(health.checkedAt) : 0;
  const have = e.health?.checkedAt ? Date.parse(e.health.checkedAt) : 0;
  // "missing" and "unknown" come from a key that was just removed or replaced: whatever was known about the old key no longer applies
  const replacesOld = health.state === 'missing' || health.state === 'unknown';
  if (!e.health || incoming >= have || replacesOld) {
    e.health = health;
    if (!silent) notify(e);
    if (health.state === 'unknown' && e.users > 0) queueMicrotask(() => void refreshKeyHealth(id));
  }
}

export async function refreshKeyHealth(id: string, opts: { force?: boolean } = {}): Promise<void> {
  if (!id) return;
  const e = entryFor(id);
  if (e.inFlight) return e.inFlight;
  e.checking = true;
  notify(e);
  e.inFlight = (async () => {
    try {
      const res = await fetch(`/api/assistants/${encodeURIComponent(id)}/key-status${opts.force ? '?force=1' : ''}`, { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as KeyHealth;
        e.health = { state: data.state, message: data.message, checkedAt: data.checkedAt, provider: data.provider };
      }
      // an error answer (signed out, server busy) leaves the last known state: it says nothing about the key
    } catch {
      // offline: same
    } finally {
      e.checking = false;
      e.inFlight = null;
      notify(e);
    }
  })();
  return e.inFlight;
}

function start(id: string) {
  const e = entryFor(id);
  e.users += 1;
  if (e.users === 1) {
    void refreshKeyHealth(id);
    e.timer = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') void refreshKeyHealth(id);
    }, POLL_MS);
  }
}

function stop(id: string) {
  const e = entries.get(id);
  if (!e) return;
  e.users = Math.max(0, e.users - 1);
  if (e.users === 0 && e.timer) {
    clearInterval(e.timer);
    e.timer = null;
  }
}

/** The key state of one assistant, kept current. `initial` is what came with the assistant, shown until the first answer. */
export function useAiKeyHealth(assistantId: string | undefined, initial?: KeyHealth | null) {
  const id = assistantId || '';
  // What came with the assistant is applied once per assistant record (not on every render: the record goes stale as the poller learns more)
  if (id && initial && !appliedInitials.has(initial)) {
    appliedInitials.add(initial);
    seedKeyHealth(id, initial, true);
  }

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!id) return () => {};
      const e = entryFor(id);
      e.listeners.add(listener);
      return () => {
        e.listeners.delete(listener);
      };
    },
    [id],
  );
  const health = useSyncExternalStore(
    subscribe,
    () => (id ? entryFor(id).health : null),
    () => null,
  );
  const checking = useSyncExternalStore(
    subscribe,
    () => (id ? entryFor(id).checking : false),
    () => false,
  );

  useEffect(() => {
    if (!id) return;
    start(id);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refreshKeyHealth(id);
    };
    const onFocus = () => void refreshKeyHealth(id);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
      stop(id);
    };
  }, [id]);

  const refresh = useCallback((force = false) => refreshKeyHealth(id, { force }), [id]);
  return { health, checking, refresh };
}

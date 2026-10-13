'use client';

import { useEffect, useRef } from 'react';
import { nextPollDelayMs } from './poll-schedule';

/**
 * Runs `poll` on the pace described in poll-schedule.ts: slower when the visitor is idle, not at all in a hidden tab, and
 * straight away when the tab is shown again or the visitor does something after a quiet spell.
 *
 * `poll` and `handoffActive` are read through refs, so changing them does not restart the schedule.
 */
export function useAdaptivePoll(poll: () => Promise<unknown> | unknown, opts: { enabled: boolean; handoffActive: boolean }): void {
  const pollRef = useRef(poll);
  const handoffRef = useRef(opts.handoffActive);
  pollRef.current = poll;
  handoffRef.current = opts.handoffActive;

  useEffect(() => {
    if (!opts.enabled || typeof document === 'undefined') return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastActivity = Date.now();
    let running = false;

    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    const schedule = () => {
      clear();
      if (stopped) return;
      const delay = nextPollDelayMs({
        hidden: document.visibilityState === 'hidden',
        handoffActive: handoffRef.current,
        msSinceActivity: Date.now() - lastActivity,
      });
      if (delay === null) return; // hidden: resumes on visibilitychange
      timer = setTimeout(tick, delay);
    };
    const tick = async () => {
      if (running) return;
      running = true;
      try {
        await pollRef.current();
      } catch {
        // a failed check is simply tried again on the next turn
      } finally {
        running = false;
        schedule();
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        lastActivity = Date.now();
        clear();
        void tick();
      } else {
        clear();
      }
    };
    // After a quiet spell the next sign of life brings the pace back up at once, instead of waiting out a 60 second sleep.
    const onActivity = () => {
      const quiet = Date.now() - lastActivity > 15_000;
      lastActivity = Date.now();
      if (quiet && !running) {
        clear();
        void tick();
      }
    };

    void tick();
    document.addEventListener('visibilitychange', onVisible);
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      stopped = true;
      clear();
      document.removeEventListener('visibilitychange', onVisible);
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [opts.enabled]);
}

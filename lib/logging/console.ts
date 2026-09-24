import util from 'node:util';
import { logEvent } from './logger';

let installed = false;
let capturing = false;
let windowStart = 0;
let inWindow = 0;
let dropped = 0;

const MAX_PER_MINUTE = 60;

/** At most MAX_PER_MINUTE captured lines a minute, so a runaway loop cannot flood the log. */
function allow(): boolean {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    if (dropped > 0) {
      logEvent({ level: 'warn', category: 'system', event: 'console.capture_throttled', meta: { dropped } });
    }
    windowStart = now;
    inWindow = 0;
    dropped = 0;
  }
  if (inWindow >= MAX_PER_MINUTE) {
    dropped++;
    return false;
  }
  inWindow++;
  return true;
}

/**
 * Also sends everything the server code writes with console.error / console.warn to the system log.
 * The original console output is untouched (it still goes to the host's own logs).
 * Recursion-safe: the logger's own fallback output never comes back in here.
 */
export function installConsoleCapture(): void {
  if (installed || process.env.LOG_CAPTURE_CONSOLE === 'false') return;
  installed = true;

  for (const method of ['error', 'warn'] as const) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      if (capturing) return;
      capturing = true;
      try {
        const err = args.find((a): a is Error => a instanceof Error);
        const message = util.format(...args.map((a) => (a instanceof Error ? a.message : a))).slice(0, 1000);
        if (message.startsWith('[Log]') || message.startsWith('[Log:')) return;
        if (!allow()) return;
        logEvent({
          level: method === 'error' ? 'error' : 'warn',
          category: 'system',
          event: `console.${method}`,
          message,
          error: err,
          meta: { source: 'console' },
        });
      } catch {
        // capture must never break the caller
      } finally {
        capturing = false;
      }
    };
  }
}

/** For tests. */
export function _resetConsoleCaptureForTesting(): void {
  installed = false;
  capturing = false;
  windowStart = 0;
  inWindow = 0;
  dropped = 0;
}

import { after } from 'next/server';

/**
 * Runs work after the response has been sent, and keeps the serverless function alive until it finishes (a promise left running
 * after the response is frozen with the function). Outside a request (tests, scripts) there is nothing to wait for, so the work
 * simply starts. Errors are logged, never thrown: the response has already been sent.
 */
export function deferAfterResponse(work: () => Promise<unknown> | unknown): void {
  const run = async () => {
    try {
      await work();
    } catch (err) {
      console.warn('[defer] background work failed:', (err as Error)?.message);
    }
  };
  try {
    after(run);
  } catch {
    void run();
  }
}

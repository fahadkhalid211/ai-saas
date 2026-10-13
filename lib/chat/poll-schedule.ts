/**
 * How often a chat window asks the server whether a person has written back.
 *
 * Every open chat (the widget on a customer's site, the embedded page, the assistant on this site, the hosted business page)
 * checks for replies from a human agent. Doing that every 2.5 to 3.5 seconds, for as long as the page is open, even in a
 * background tab and with nobody writing, is what used up most of the platform's requests: one forgotten tab made about
 * 25,000 requests a day. The pace now follows what is happening:
 *
 *  - a hidden tab does not ask at all (it asks once, straight away, when it is shown again);
 *  - while a person has been asked for or is writing, it asks every 2.5 seconds, so replies still arrive at once;
 *  - while the visitor is active (typed, clicked, scrolled in the last minute) it asks every 5 seconds;
 *  - when the visitor has gone quiet it slows to every 20 seconds, and after ten quiet minutes to every minute.
 *
 * public/widget.js carries a copy of this function (it is plain JavaScript loaded on other people's sites, so it cannot import
 * this file); the two must stay the same, and lib/chat/poll-schedule.test.ts reads the copy to check it.
 */

export const POLL_HANDOFF_MS = 2_500;
export const POLL_ACTIVE_MS = 5_000;
export const POLL_QUIET_MS = 20_000;
export const POLL_IDLE_MS = 60_000;
export const ACTIVE_WINDOW_MS = 60_000;
export const QUIET_WINDOW_MS = 10 * 60_000;

export interface PollInputs {
  /** The page is in a background tab or a minimised window. */
  hidden: boolean;
  /** A person was asked for, or is already writing in this conversation. */
  handoffActive: boolean;
  /** Milliseconds since the visitor last typed, clicked, touched or scrolled. */
  msSinceActivity: number;
}

/** Milliseconds to wait before the next check, or null when no check should be scheduled (a hidden page). */
export function nextPollDelayMs({ hidden, handoffActive, msSinceActivity }: PollInputs): number | null {
  if (hidden) return null;
  if (handoffActive) return POLL_HANDOFF_MS;
  if (msSinceActivity < ACTIVE_WINDOW_MS) return POLL_ACTIVE_MS;
  if (msSinceActivity < QUIET_WINDOW_MS) return POLL_QUIET_MS;
  return POLL_IDLE_MS;
}

/** Whether a conversation record from the server means a person is involved. */
export function isHandoffActive(conv: { status?: string; isLiveTakeover?: boolean } | null | undefined): boolean {
  if (!conv) return false;
  return Boolean(conv.isLiveTakeover) || conv.status === 'waiting_for_agent' || conv.status === 'live_agent';
}

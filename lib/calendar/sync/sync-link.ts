import { Database, type AssistantData } from '@/lib/db';
import { logEvent } from '@/lib/logging/logger';
import { fetchCalendarFeed, normaliseCalendarUrl } from './fetch-feed';
import { CalendarParseError, parseIcalBlocks } from './parse-ical';
import { MAX_BLOCKS_PER_LINK } from './link-rules';
import { detectClashes } from './clashes';
import type { CalendarLink } from './types';

/**
 * Reading an owner's linked calendars into stored busy blocks.
 *
 * - syncCalendarLink: one link. Never throws. A failed or unreadable read keeps the blocks already stored; only a readable calendar
 *   replaces them (an emptied calendar is readable and replaces them with none).
 * - refreshAssistantCalendars: called right BEFORE a booking is confirmed (and before the day lock is taken), capped at 3 seconds. Never throws, never blocks a booking.
 * - syncDueCalendars: the scheduled job; reads every link that has gone unread for a while, then checks upcoming bookings for clashes.
 *
 * Sync status is recorded only with Database.updateCalendarLinkStatus, which never re-creates a link the owner removed meanwhile.
 * A calendar address is a secret: it appears in no log line, notification, e-mail or error text produced here.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_BACK_MS = DAY_MS;
const WINDOW_FORWARD_MS = 180 * DAY_MS;

const UNREADABLE = 'The link did not return a readable calendar';
const NOT_SAVED = 'The calendar could not be updated right now.';

export interface SyncResult {
  ok: boolean;
  /** Blocks stored for the link after this attempt (the previous count when the attempt failed or nothing changed). */
  blocks: number;
  /** Short plain-language reason, never containing the link. Absent on success, and when the link was removed during the read. */
  error?: string;
}

const inFlight = new Map<string, Promise<SyncResult>>();
// When this process last tried each link. A link that keeps failing has no new lastSyncedAt, so without this every booking would try it again.
const attemptedAt = new Map<string, number>();
const MAX_TRACKED = 5000;

/** Clears the in-process memory (tests only). */
export function _resetSyncStateForTesting(): void {
  inFlight.clear();
  attemptedAt.clear();
}

const errName = (err: unknown) => (err instanceof Error ? err.name : 'unknown');

function withoutLink(text: string, link: CalendarLink): string {
  let out = text;
  for (const secret of new Set([link.url, normaliseCalendarUrl(link.url)])) {
    if (secret) out = out.split(secret).join('[calendar link]');
  }
  return out.slice(0, 300);
}

/** Reads one link and stores the result. Two calls for the same link at once share one read. Never throws. */
export function syncCalendarLink(link: CalendarLink, assistant: AssistantData, now: Date = new Date()): Promise<SyncResult> {
  const running = inFlight.get(link.id);
  if (running) return running;
  if (attemptedAt.size >= MAX_TRACKED) attemptedAt.clear();
  attemptedAt.set(link.id, Date.now());

  const run: Promise<SyncResult> = syncOnce(link, assistant, now)
    .catch((err): SyncResult => {
      // Only the error's name: its text can quote the database statement or the address.
      logEvent({ level: 'warn', category: 'booking', event: 'calendar.sync_failed', meta: { assistantId: link.assistantId, linkId: link.id, error: errName(err) } });
      return { ok: false, blocks: link.blockCount ?? 0, error: NOT_SAVED };
    })
    .finally(() => {
      if (inFlight.get(link.id) === run) inFlight.delete(link.id);
    });
  inFlight.set(link.id, run);
  return run;
}

async function syncOnce(link: CalendarLink, assistant: AssistantData, now: Date): Promise<SyncResult> {
  const kept = link.blockCount ?? 0;
  const nowIso = now.toISOString();

  // A failure is recorded without touching the stored blocks. False from the update = the owner removed the link meanwhile: say nothing.
  const fail = async (message: string): Promise<SyncResult> => {
    const recorded = await Database.updateCalendarLinkStatus(link.assistantId, link.id, { lastError: message, errorSince: link.errorSince ?? nowIso });
    return recorded ? { ok: false, blocks: kept, error: message } : { ok: false, blocks: kept };
  };

  const res = await fetchCalendarFeed(link.url, { etag: link.etag, lastModified: link.lastModified });

  if (res.status === 'error') return fail(withoutLink(res.error, link));

  if (res.status === 'not_modified') {
    const recorded = await Database.updateCalendarLinkStatus(link.assistantId, link.id, {
      lastSyncedAt: nowIso,
      lastError: null,
      errorSince: null,
      failureNotifiedFor: null,
    });
    return { ok: recorded, blocks: kept };
  }

  let parsed: ReturnType<typeof parseIcalBlocks>;
  try {
    parsed = parseIcalBlocks(res.text, {
      timezone: assistant.timezone || 'UTC',
      from: new Date(now.getTime() - WINDOW_BACK_MS),
      to: new Date(now.getTime() + WINDOW_FORWARD_MS),
    });
  } catch (err) {
    if (!(err instanceof CalendarParseError)) {
      logEvent({ level: 'warn', category: 'booking', event: 'calendar.parse_failed', meta: { assistantId: link.assistantId, linkId: link.id, error: errName(err) } });
    }
    return fail(UNREADABLE);
  }

  // Guarded in the database: a link removed meanwhile gets no blocks.
  await Database.replaceExternalBlocks(link.id, link.assistantId, parsed.blocks);
  const stored = Math.min(parsed.blocks.length, MAX_BLOCKS_PER_LINK);
  const recorded = await Database.updateCalendarLinkStatus(link.assistantId, link.id, {
    lastSyncedAt: nowIso,
    lastError: null,
    errorSince: null,
    failureNotifiedFor: null,
    etag: res.etag ?? null,
    lastModified: res.lastModified ?? null,
    blockCount: stored,
    unsupportedCount: parsed.unsupported,
  });
  return { ok: recorded, blocks: stored };
}

export interface RefreshOptions {
  /** Longest wait for the reads, default 3000 ms. */
  timeoutMs?: number;
  /** Links read more recently than this are used as they are, default 60 s. */
  maxAgeMs?: number;
}

/**
 * Brings the assistant's linked calendars up to date just before a booking is confirmed. Reads the links that are older than `maxAgeMs`,
 * in parallel, and waits at most `timeoutMs`. `stale` is true when a read failed or timed out, or a link still carries an error:
 * the booking then goes ahead against the last good blocks (logged as booking.calendar_stale). This function never throws.
 * Call it BEFORE taking the day lock; the conflict check inside the lock reads the blocks it stored.
 */
export async function refreshAssistantCalendars(assistant: AssistantData, opts: RefreshOptions = {}): Promise<{ stale: boolean }> {
  const timeoutMs = opts.timeoutMs ?? 3000;
  const maxAgeMs = opts.maxAgeMs ?? 60_000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let linkCount = 0;
  let failedCount = 0;
  let outcome: 'done' | 'timeout' | 'error' = 'done';
  let errorKind: string | undefined;
  let stale = false;

  const work = (async () => {
    const links = await Database.getCalendarLinks(assistant.id);
    linkCount = links.length;
    if (links.length === 0) return;
    const nowMs = Date.now();
    const due: CalendarLink[] = [];
    for (const link of links) {
      const last = Math.max(Date.parse(link.lastSyncedAt ?? '') || 0, attemptedAt.get(link.id) ?? 0);
      if (last === 0 || nowMs - last > maxAgeMs) due.push(link);
      else if (link.lastError) stale = true;
    }
    const results = await Promise.all(due.map((link) => syncCalendarLink(link, assistant)));
    failedCount = results.filter((r) => !r.ok && r.error).length;
    if (failedCount > 0) stale = true;
  })();

  try {
    const timedOut = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), timeoutMs);
    });
    outcome = (await Promise.race([work.then(() => 'done' as const), timedOut])) === 'timeout' ? 'timeout' : 'done';
  } catch (err) {
    outcome = 'error';
    errorKind = errName(err);
  } finally {
    if (timer) clearTimeout(timer);
  }
  // A read that outlives the cap keeps running; its outcome (or failure) must never surface as an unhandled rejection.
  work.catch(() => undefined);

  if (outcome !== 'done') stale = true;
  if (stale) {
    logEvent({
      level: 'warn',
      category: 'booking',
      event: 'booking.calendar_stale',
      meta: { assistantId: assistant.id, links: linkCount, failed: failedCount, timedOut: outcome === 'timeout', ...(errorKind ? { error: errorKind } : {}) },
    });
  }
  return { stale };
}

const DEFAULT_MAX_AGE_MS = 10 * 60_000;
// The scheduler may fire a little early; without this a link read at the end of one run would be skipped by the next and wait a whole extra cycle.
const DUE_GRACE_MS = 60_000;
const CONCURRENCY = 3;
const START_BUDGET_MS = 50_000;
const HARD_STOP_MS = 55_000;
const FAILURE_NOTICE_AFTER_MS = DAY_MS;

export interface SyncDueOptions {
  /** No new link is started after this long (default 50 s). */
  budgetMs?: number;
  /** Links read at the same time (default 3). */
  concurrency?: number;
}

const LABEL_NAMES: Record<CalendarLink['label'], string> = { google: 'Google', apple: 'Apple', outlook: 'Outlook', other: 'linked' };

/**
 * The scheduled job: reads every link not read for `maxAgeMs` (or never), three at a time, and starts no new link after 50 seconds
 * (the rest wait for the next run). One link's failure never stops the others. Afterwards upcoming bookings are checked for clashes
 * with the stored blocks of every assistant that has a read link: this covers blocks stored by a booking-time refresh, which this
 * job then skips as fresh. A link that has failed for 24 hours gets one notification for that run of failures.
 */
export async function syncDueCalendars(
  now: Date = new Date(),
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
  opts: SyncDueOptions = {},
): Promise<{ checked: number; failed: number }> {
  const started = Date.now();
  const budgetMs = opts.budgetMs ?? START_BUDGET_MS;
  const concurrency = Math.max(1, opts.concurrency ?? CONCURRENCY);
  const links = await Database.getAllCalendarLinks();
  const dueAfter = Math.max(0, maxAgeMs - DUE_GRACE_MS);
  const due = links.filter((l) => {
    const last = Date.parse(l.lastSyncedAt ?? '');
    return !Number.isFinite(last) || now.getTime() - last >= dueAfter;
  });

  const assistants = new Map<string, Promise<AssistantData | null>>();
  const assistantFor = (id: string) => {
    let p = assistants.get(id);
    if (!p) {
      p = Database.getAssistantById(id);
      assistants.set(id, p);
    }
    return p;
  };

  let next = 0;
  let checked = 0;
  let failed = 0;
  const syncedOk = new Set<string>();

  const worker = async () => {
    while (next < due.length && Date.now() - started < budgetMs) {
      const link = due[next++];
      let counted = false;
      try {
        const assistant = await assistantFor(link.assistantId);
        if (!assistant) continue; // an orphan link (its assistant was deleted): nothing to read it for
        checked++;
        counted = true;
        const res = await syncCalendarLink(link, assistant, now);
        if (res.ok) syncedOk.add(link.assistantId);
        else if (res.error) {
          failed++;
          await noticeLongFailure(link, res.error, now);
        }
      } catch (err) {
        if (!counted) checked++;
        failed++;
        logEvent({ level: 'warn', category: 'cron', event: 'calendar.sync_link_crashed', meta: { assistantId: link.assistantId, linkId: link.id, error: errName(err) } });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, due.length) }, worker));

  // Clash check: assistants whose links were just read first, then the others that have a read link.
  const order = [...syncedOk, ...links.filter((l) => l.lastSyncedAt && !syncedOk.has(l.assistantId)).map((l) => l.assistantId)];
  for (const assistantId of new Set(order)) {
    if (Date.now() - started >= HARD_STOP_MS) break;
    try {
      const assistant = await assistantFor(assistantId);
      if (assistant) await detectClashes(assistant, now);
    } catch (err) {
      logEvent({ level: 'warn', category: 'cron', event: 'calendar.clash_check_failed', meta: { assistantId, error: errName(err) } });
    }
  }
  return { checked, failed };
}

/**
 * After 24 hours of failing in a row, tells the owner once. `errorSince` identifies the run of failures; the matching `failureNotifiedFor`
 * records that the notice went out. If the notification cannot be saved nothing is recorded, so the next run tries again.
 */
async function noticeLongFailure(link: CalendarLink, error: string, now: Date): Promise<void> {
  const since = link.errorSince ?? now.toISOString();
  const sinceMs = Date.parse(since);
  if (!Number.isFinite(sinceMs) || now.getTime() - sinceMs < FAILURE_NOTICE_AFTER_MS) return;
  if (link.failureNotifiedFor && Date.parse(link.failureNotifiedFor) === sinceMs) return;
  try {
    await Database.addNotification({
      assistantId: link.assistantId,
      title: 'Calendar link not syncing',
      message: `Your ${LABEL_NAMES[link.label]} calendar has not synced for over 24 hours (${error}). Bookings are being checked against the last calendar we could read, so recent events may be missing. Please check the link in your calendar settings.`,
      type: 'calendar_sync_failed',
      metadata: { linkId: link.id },
    });
    await Database.updateCalendarLinkStatus(link.assistantId, link.id, { failureNotifiedFor: since });
  } catch (err) {
    logEvent({ level: 'warn', category: 'cron', event: 'calendar.sync_notice_failed', meta: { assistantId: link.assistantId, linkId: link.id, error: errName(err) } });
  }
}

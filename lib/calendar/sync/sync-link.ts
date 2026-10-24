import { createHash } from 'node:crypto';
import { Database, type AssistantData } from '@/lib/db';
import { logEvent } from '@/lib/logging/logger';
import { fetchCalendarFeed } from './fetch-feed';
import { withoutAddresses } from '../link-view';
import { CalendarParseError, parseIcalBlocks, type ParseIcalResult } from './parse-ical';
import { MAX_BLOCKS_PER_LINK } from './link-rules';
import { detectClashes } from './clashes';
import { SYNC_WINDOW_BACK_MS, SYNC_WINDOW_FORWARD_MS } from './window';
import type { CalendarLink } from './types';

/**
 * Reading an owner's linked calendars into stored busy blocks.
 *
 * - syncCalendarLink: one link. Never throws. A failed or unreadable read, or a parse cut short by its deadline, keeps the blocks already
 *   stored; only a calendar read in full replaces them (an emptied calendar is readable and replaces them with none).
 * - refreshAssistantCalendars: called right BEFORE a booking is confirmed (and before the day lock is taken), capped at 3 seconds. Never throws, never blocks a booking.
 * - syncDueCalendars: the scheduled job; reads every link that is due, then checks upcoming bookings for clashes.
 *
 * Sync status is recorded only with Database.updateCalendarLinkStatus, which never re-creates a link the owner removed meanwhile.
 * A calendar address is a secret: it appears in no log line, notification, e-mail or error text produced here.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The blocks cover [read time - 1 day, read time + 400 days] (window.ts; bookings beyond it are refused when a calendar is linked). A server that keeps answering 304 never moves that window, so after this long
 * the next read is sent WITHOUT the stored validators: the answer is a full body, parsed for a fresh window.
 */
const FULL_READ_AFTER_MS = DAY_MS;

const UNREADABLE = 'The link did not return a readable calendar';
const NOT_SAVED = 'The calendar could not be updated right now.';
const NOT_STORED = 'Could not store the calendar';
const TOO_SLOW = 'The calendar took too long to read';

export interface SyncResult {
  ok: boolean;
  /** Blocks stored for the link after this attempt (the previous count when the attempt failed or nothing changed). */
  blocks: number;
  /** Short plain-language reason, never containing the link. Absent on success, and when the link was removed during the read. */
  error?: string;
}

// In-process memory, keyed by link id AND a hash of its address: an owner who edits the address gets a fresh key, so the edited link is
// neither stuck behind the "tried a moment ago" memo nor joined to a read of the old address.
const inFlight = new Map<string, Promise<SyncResult>>();
type Attempt = { at: number; state: 'pending' | 'ok' | 'failed' };
const attempts = new Map<string, Attempt>();
const MAX_TRACKED = 5000;

const memoKey = (link: Pick<CalendarLink, 'id' | 'url'>) => `${link.id}:${createHash('sha256').update(link.url).digest('hex').slice(0, 16)}`;

/** Clears the in-process memory (tests only). */
export function _resetSyncStateForTesting(): void {
  inFlight.clear();
  attempts.clear();
}

const errName = (err: unknown) => (err instanceof Error ? err.name : 'unknown');
const timeOf = (iso?: string) => {
  const t = Date.parse(iso ?? '');
  return Number.isFinite(t) ? t : 0;
};

/** A feed the caller has already read and parsed with parseForSync (the "add a calendar" check), stored without a second read. */
export interface PrefetchedFeed {
  feed: { status: 'ok'; text: string; etag?: string; lastModified?: string };
  parsed: ParseIcalResult;
}

/** Parses feed text exactly as a sync at `now` does: the link window and the assistant's timezone. Throws CalendarParseError. */
export function parseForSync(text: string, assistant: AssistantData, now: Date): Promise<ParseIcalResult> {
  return parseIcalBlocks(text, {
    timezone: assistant.timezone || 'UTC',
    from: new Date(now.getTime() - SYNC_WINDOW_BACK_MS),
    to: new Date(now.getTime() + SYNC_WINDOW_FORWARD_MS),
  });
}

/**
 * Reads one link and stores the result. Two calls for the same link at once share one read. Never throws.
 * `prefetched` (read and parsed by the caller at `now` with parseForSync) is stored as is, without reading the address again.
 */
export function syncCalendarLink(link: CalendarLink, assistant: AssistantData, now: Date = new Date(), prefetched?: PrefetchedFeed): Promise<SyncResult> {
  const key = memoKey(link);
  const running = inFlight.get(key);
  if (running) return running;
  if (attempts.size >= MAX_TRACKED) attempts.clear();
  const attempt: Attempt = { at: Date.now(), state: 'pending' };
  attempts.set(key, attempt);

  const run: Promise<SyncResult> = syncOnce(link, assistant, now, prefetched)
    .catch((err): SyncResult => {
      // Only the error's name: its text can quote the database statement or the address.
      logEvent({ level: 'warn', category: 'booking', event: 'calendar.sync_failed', meta: { assistantId: link.assistantId, linkId: link.id, error: errName(err) } });
      return { ok: false, blocks: link.blockCount ?? 0, error: NOT_SAVED };
    })
    .then(async (res) => {
      attempt.state = res.ok ? 'ok' : 'failed';
      // Called on every failed read, scheduled or at booking time: a tenant whose bookings keep the link "recently tried" may never be due
      // for the scheduled job, and must still hear about a link that has been failing for 24 hours. Idempotent; never throws.
      if (!res.ok && res.error) await noticeLongFailure(link, res.error, now);
      return res;
    })
    .finally(() => {
      if (inFlight.get(key) === run) inFlight.delete(key);
    });
  inFlight.set(key, run);
  return run;
}

async function syncOnce(link: CalendarLink, assistant: AssistantData, now: Date, prefetched?: PrefetchedFeed): Promise<SyncResult> {
  const kept = link.blockCount ?? 0;
  const nowIso = now.toISOString();
  const timezone = assistant.timezone || 'UTC';

  // A failure is recorded without touching the stored blocks. False from the update = the owner removed the link meanwhile: say nothing.
  const fail = async (message: string): Promise<SyncResult> => {
    const recorded = await Database.updateCalendarLinkStatus(link.assistantId, link.id, {
      lastError: message,
      errorSince: link.errorSince ?? nowIso,
      lastAttemptAt: nowIso,
    });
    return recorded ? { ok: false, blocks: kept, error: message } : { ok: false, blocks: kept };
  };

  // Validators make an unchanged calendar answer 304, which keeps the blocks parsed earlier. That is only right while those blocks still
  // cover the window and were read the way they would be read now, so a full read (no validators) is forced when:
  //  - no response has been parsed yet, or the last one is more than a day old (the window has moved on);
  //  - the block count is unknown (an earlier version stored the link, or the status was reset);
  //  - the assistant's timezone changed since the last parse (floating times and all-day events are read in it).
  const fullAt = timeOf(link.fullSyncedAt);
  const needFull =
    fullAt === 0 || now.getTime() - fullAt > FULL_READ_AFTER_MS || link.blockCount === undefined || link.parsedTimezone !== timezone;
  const res = prefetched
    ? prefetched.feed
    : needFull
      ? await fetchCalendarFeed(link.url)
      : await fetchCalendarFeed(link.url, { etag: link.etag, lastModified: link.lastModified });

  if (res.status === 'error') return fail(withoutAddresses(res.error, link));

  if (res.status === 'not_modified') {
    // Nothing was parsed, so fullSyncedAt stays where it was.
    const recorded = await Database.updateCalendarLinkStatus(link.assistantId, link.id, {
      lastSyncedAt: nowIso,
      lastAttemptAt: nowIso,
      lastError: null,
      errorSince: null,
      failureNotifiedFor: null,
    });
    return { ok: recorded, blocks: kept };
  }

  let parsed: ParseIcalResult;
  try {
    parsed = prefetched ? prefetched.parsed : await parseForSync(res.text, assistant, now);
  } catch (err) {
    if (!(err instanceof CalendarParseError)) {
      logEvent({ level: 'warn', category: 'booking', event: 'calendar.parse_failed', meta: { assistantId: link.assistantId, linkId: link.id, error: errName(err) } });
    }
    return fail(UNREADABLE);
  }
  if (!parsed.complete) {
    // The parse stopped at its deadline: its blocks are only part of the calendar. Storing them would free every busy time it did not
    // reach, so this is a failed read like any other (the stored blocks stay, the owner sees the error, the 24 hour notice applies).
    logEvent({ level: 'warn', category: 'booking', event: 'calendar.parse_incomplete', meta: { assistantId: link.assistantId, linkId: link.id } });
    return fail(TOO_SLOW);
  }

  // Guarded in the database: a link removed meanwhile gets no blocks.
  try {
    await Database.replaceExternalBlocks(link.id, link.assistantId, parsed.blocks);
  } catch (err) {
    // The blocks could not be written: the owner must see it (and the 24 hour notice must be able to arm), so record an error if we can.
    logEvent({ level: 'warn', category: 'booking', event: 'calendar.blocks_store_failed', meta: { assistantId: link.assistantId, linkId: link.id, error: errName(err) } });
    try {
      return await fail(NOT_STORED);
    } catch {
      return { ok: false, blocks: kept, error: NOT_STORED };
    }
  }
  const stored = Math.min(parsed.blocks.length, MAX_BLOCKS_PER_LINK);
  const recorded = await Database.updateCalendarLinkStatus(link.assistantId, link.id, {
    lastSyncedAt: nowIso,
    lastAttemptAt: nowIso,
    fullSyncedAt: nowIso,
    parsedTimezone: timezone,
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
  /** Links tried more recently than this are used as they are, default 60 s. */
  maxAgeMs?: number;
}

/**
 * Brings the assistant's linked calendars up to date just before a booking is confirmed. Reads the links that were last tried more than
 * `maxAgeMs` ago, in parallel, and waits at most `timeoutMs`. `stale` is true when a read failed or timed out, or a link still carries an
 * error, or a link skipped as "tried a moment ago" has not finished or has failed: the booking then goes ahead against the last good
 * blocks (logged as booking.calendar_stale). This function never throws.
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
      const attempt = attempts.get(memoKey(link));
      const last = Math.max(timeOf(link.lastSyncedAt), timeOf(link.lastAttemptAt), attempt?.at ?? 0);
      if (last === 0 || nowMs - last > maxAgeMs) {
        due.push(link);
        continue;
      }
      // Not read again now. Its blocks are only trustworthy if the attempt that made it "recent" worked: an error is recorded, an attempt
      // still running (or that timed out) or one that ended without success is not.
      const tryFailed = attempt !== undefined && attempt.state !== 'ok';
      const attemptedAfterSuccess = timeOf(link.lastAttemptAt) > timeOf(link.lastSyncedAt);
      if (link.lastError || tryFailed || attemptedAfterSuccess) stale = true;
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
/**
 * No new link is STARTED after this long. One read can take up to 8 s (the fetch limit) plus the database writes, and the clash check needs
 * time after it, so the start budget leaves about 20 s of the 55 s hard stop below for reads already running.
 */
const START_BUDGET_MS = 35_000;
/** No clash check is started after this long (the hosting limit is 300 s; this keeps a run well inside one scheduler interval). */
const HARD_STOP_MS = 55_000;
const FAILURE_NOTICE_AFTER_MS = DAY_MS;

// How long a link that keeps failing waits before it is tried again, by how long it has been failing (never shorter than the normal interval).
const BACKOFF_TIERS: Array<{ failingFor: number; wait: number }> = [
  { failingFor: 7 * DAY_MS, wait: 6 * 60 * 60_000 },
  { failingFor: DAY_MS, wait: 60 * 60_000 },
];

export interface SyncDueOptions {
  /** No new link is started after this long (default 35 s). */
  budgetMs?: number;
  /** Links read at the same time (default 3). */
  concurrency?: number;
}

export interface SyncDueResult {
  /** Due links that were started. */
  checked: number;
  /** Of those, links whose read failed. */
  failed: number;
  /** Due links NOT started because the start budget ran out; they come first in the next run. */
  skipped: number;
  /** Assistants whose clash check was not run because the 55 s hard stop came first. */
  clashChecksSkipped: number;
}

/** When the link was last tried (successful or not); 0 = never. */
const lastTried = (link: CalendarLink) => Math.max(timeOf(link.lastAttemptAt), timeOf(link.lastSyncedAt));

/** Minimum time between two scheduled reads of a link: the normal interval, longer the longer it has been failing. */
function intervalFor(link: CalendarLink, nowMs: number, maxAgeMs: number): number {
  const since = timeOf(link.errorSince);
  if (since === 0) return maxAgeMs;
  const failingFor = nowMs - since;
  for (const tier of BACKOFF_TIERS) if (failingFor >= tier.failingFor) return Math.max(maxAgeMs, tier.wait);
  return maxAgeMs;
}

const LABEL_NAMES: Record<CalendarLink['label'], string> = { google: 'Google', apple: 'Apple', outlook: 'Outlook', other: 'linked' };

/**
 * The scheduled job. A link is due when it was never tried, or its wait since the last attempt has passed: 10 minutes normally, and for a
 * link that has been failing for 24 hours to 7 days 60 minutes, for longer than that 6 hours (saving an edited address resets this).
 * Due links are read oldest attempt first (never-tried ones first), so one tenant's dead links cannot starve the others. Three at a time;
 * no new link is started after 35 s (the rest are counted as `skipped` and go first next time).
 *
 * Clash check: an assistant's upcoming bookings are checked against its stored blocks right after that assistant's last due link was read
 * successfully. Afterwards, while time remains (hard stop 55 s), the assistants whose check could not run yet, then every other assistant
 * with a read link, are checked: this covers blocks stored by a booking-time refresh, which this job skips as fresh. Checks that did not
 * fit are counted as `clashChecksSkipped`.
 * One link's failure never stops the others. A link that has failed for 24 hours gets one notification for that run of failures.
 */
export async function syncDueCalendars(
  now: Date = new Date(),
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
  opts: SyncDueOptions = {},
): Promise<SyncDueResult> {
  const started = Date.now();
  const budgetMs = opts.budgetMs ?? START_BUDGET_MS;
  const concurrency = Math.max(1, opts.concurrency ?? CONCURRENCY);
  const links = await Database.getAllCalendarLinks();
  const nowMs = now.getTime();
  const due = links
    .filter((l) => {
      const last = lastTried(l);
      return last === 0 || nowMs - last >= Math.max(0, intervalFor(l, nowMs, maxAgeMs) - DUE_GRACE_MS);
    })
    .sort((a, b) => lastTried(a) - lastTried(b) || a.createdAt.localeCompare(b.createdAt));

  const assistants = new Map<string, Promise<AssistantData | null>>();
  const assistantFor = (id: string) => {
    let p = assistants.get(id);
    if (!p) {
      p = Database.getAssistantById(id);
      assistants.set(id, p);
    }
    return p;
  };

  const waiting = new Map<string, number>(); // due links of each assistant not finished yet
  for (const l of due) waiting.set(l.assistantId, (waiting.get(l.assistantId) ?? 0) + 1);
  const syncedOk = new Set<string>();
  const checkedForClashes = new Set<string>();

  const clashCheck = async (assistantId: string): Promise<void> => {
    checkedForClashes.add(assistantId);
    try {
      const assistant = await assistantFor(assistantId);
      if (assistant) await detectClashes(assistant, now);
    } catch (err) {
      logEvent({ level: 'warn', category: 'cron', event: 'calendar.clash_check_failed', meta: { assistantId, error: errName(err) } });
    }
  };

  let next = 0;
  let checked = 0;
  let failed = 0;

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
        else if (res.error) failed++; // the 24 hour notice was handled by syncCalendarLink
      } catch (err) {
        if (!counted) checked++;
        failed++;
        logEvent({ level: 'warn', category: 'cron', event: 'calendar.sync_link_crashed', meta: { assistantId: link.assistantId, linkId: link.id, error: errName(err) } });
      } finally {
        const left = (waiting.get(link.assistantId) ?? 1) - 1;
        waiting.set(link.assistantId, left);
        // That assistant's last due link is done: check its bookings now, not at the end when the budget may be gone.
        if (left === 0 && syncedOk.has(link.assistantId) && Date.now() - started < HARD_STOP_MS) await clashCheck(link.assistantId);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, due.length) }, worker));
  const skipped = due.length - next;

  // Final pass, while time remains: assistants read in this run whose check has not run (their other links were not all started), then the rest.
  const rest = [...syncedOk, ...links.filter((l) => l.lastSyncedAt).map((l) => l.assistantId)].filter((id) => !checkedForClashes.has(id));
  let clashChecksSkipped = 0;
  for (const assistantId of new Set(rest)) {
    if (Date.now() - started >= HARD_STOP_MS) {
      clashChecksSkipped++;
      continue;
    }
    await clashCheck(assistantId);
  }
  return { checked, failed, skipped, clashChecksSkipped };
}

/**
 * After 24 hours of failing in a row, tells the owner once. `errorSince` identifies the run of failures; the matching `failureNotifiedFor`
 * records that the notice went out. If the notification cannot be saved nothing is recorded, so the next run tries again.
 * Called from syncCalendarLink for every failed read (scheduled job and booking-time refresh). Never throws.
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

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Database, isRelationalModeRequired, type AssistantData } from '@/lib/db';
import { getAuthContext, requireWorkspaceAssistant, withRoleAuth } from '@/lib/security/auth';
import { canonicalOrigin } from '@/lib/security/origin';
import { getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';
import { isBookingUnavailable } from '@/lib/appointments/errors';
import { fetchCalendarFeed, normaliseCalendarUrl } from '@/lib/calendar/sync/fetch-feed';
import { parseIcalBlocks } from '@/lib/calendar/sync/parse-ical';
import { syncCalendarLink } from '@/lib/calendar/sync/sync-link';
import { CalendarLinkRuleError, MAX_CALENDAR_LINKS_PER_ASSISTANT } from '@/lib/calendar/sync/link-rules';
import { SYNC_WINDOW_BACK_MS, SYNC_WINDOW_FORWARD_MS } from '@/lib/calendar/sync/window';
import type { CalendarLink } from '@/lib/calendar/sync/types';
import { toLinkView } from '@/lib/calendar/link-view';
import { ensureBusyFeedToken, resetBusyFeedToken } from '@/lib/calendar/export-feed';

/**
 * The calendar settings of one assistant: the links whose events block booking slots, and the private busy-only link the owner
 * pastes into other calendar apps.
 *
 *   GET                              -> { links, busyFeed: { url }, durable }
 *   POST   { label, url }            -> add a link (read once to prove it works, then stored and synced)
 *   POST   ?action=sync&linkId=      -> read one link again now
 *   POST   ?action=reset-feed        -> a new busy-feed address (the old one stops working)
 *   DELETE ?linkId=                  -> remove a link and its blocks
 *
 * A calendar address and the busy-feed token are secrets: no response, log line or audit entry carries an address; the list shows a
 * masked form only, and every refusal uses a fixed message (never text from the network, the parser or the database).
 */

export const dynamic = 'force-dynamic';

const LABELS = new Set(['google', 'apple', 'outlook', 'other']);
const MAX_BODY_BYTES = 4096;
const MAX_URL_LENGTH = 2048;
const SYNC_PAUSE_MS = 30_000;
const ADD_LIMIT = { windowMs: 60_000, max: 10 };

const UNAVAILABLE = 'Calendar settings are temporarily unavailable. Please try again in a moment.';

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const fail = (error: string, status: number, headers?: Record<string, string>) => json({ error }, status, headers);

/** A storage failure or anything unexpected: the settings message, never the error text. */
function unavailable(err: unknown): NextResponse {
  if (!isBookingUnavailable(err)) {
    // only the error's name: its text can quote a statement or an address
    logEvent({ level: 'warn', category: 'booking', event: 'calendar.settings_failed', meta: { error: err instanceof Error ? err.name : 'unknown' } });
  }
  return fail(UNAVAILABLE, 503, { 'Retry-After': '60' });
}

/** A fixed, human reason for a failed read of the link the owner pasted. Nothing from the network response is passed on. */
function reasonForFeedError(error: string): string {
  if (/username or password/i.test(error)) return 'Calendar links must not contain a username or password.';
  if (/is not allowed \(it must be a public https address\)/i.test(error)) {
    return 'Internal addresses are not allowed. Use the public link from your calendar app.';
  }
  if (/must start with https/i.test(error)) return 'The link must start with https:// (or webcal://).';
  if (/did not return a calendar/i.test(error)) return 'That link opens a web page, not a calendar. Use the secret iCal (.ics) address from your calendar settings.';
  if (/took too long/i.test(error)) return 'The calendar server took too long to answer. Please try again.';
  if (/answered with HTTP/i.test(error)) return 'The calendar server did not share the calendar. Check that the link is still shared and has not been reset.';
  if (/too many times|redirect/i.test(error)) return 'The link sends visitors on to too many other addresses. Use the direct iCal (.ics) address.';
  if (/valid calendar link/i.test(error)) return 'That does not look like a valid calendar link.';
  if (/too large|too big|larger than/i.test(error)) return 'That calendar is too large to read.';
  if (/Could not reach/i.test(error)) return 'We could not reach that calendar server. Check the link and try again.';
  return 'We could not read a calendar from that link.';
}

const actorOf = (ctx: Awaited<ReturnType<typeof getAuthContext>>, req: Request) => ({
  id: ctx.memberId,
  name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
  ip: getClientIp(req),
});

/** Every change is audited with the label and link id only. A failed audit write must not turn a finished change into an error. */
async function audit(
  ctx: Awaited<ReturnType<typeof getAuthContext>>,
  req: Request,
  assistant: AssistantData,
  action: 'calendar_link.added' | 'calendar_link.removed' | 'calendar_feed.reset',
  details: Record<string, string>,
): Promise<void> {
  try {
    await Database.addAuditLog({
      workspaceId: assistant.workspaceId || ctx.workspaceId,
      actor: actorOf(ctx, req),
      action,
      targetType: 'assistant',
      targetId: assistant.id,
      details,
    });
  } catch (err) {
    logEvent({ level: 'warn', category: 'booking', event: 'calendar.audit_failed', meta: { action, error: err instanceof Error ? err.name : 'unknown' } });
  }
}

const feedUrl = (req: Request, token: string) => `${canonicalOrigin(req)}/api/calendar/${token}/feed.ics`;

const OWN_LINK = 'That is your own Crescelo calendar link. Add a link from the calendar you use elsewhere.';

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};

/**
 * True for one of this app's own calendar addresses (the busy feed, or the guest-detail feed): linking it would make every booking
 * block itself. Matched on the host of this request, of canonicalOrigin and of the configured public address (www or not, any scheme).
 */
function isOwnCalendarLink(url: string, req: Request): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const configured = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  const ours = new Set([hostOf(req.url), hostOf(canonicalOrigin(req)), configured ? hostOf(/^https?:\/\//i.test(configured) ? configured : `https://${configured}`) : '']);
  ours.delete('');
  if (!ours.has(host)) return false;
  const path = parsed.pathname.replace(/\/{2,}/g, '/').toLowerCase();
  return path.startsWith('/api/calendar/') || path.startsWith('/api/appointments/calendar');
}

// When each link was last read from this screen (add or "Sync now"), per process: a second request within 30 seconds is refused.
const lastAttempt = new Map<string, number>();
const MAX_TRACKED = 5000;
function noteAttempt(assistantId: string, linkId: string): void {
  if (lastAttempt.size >= MAX_TRACKED) lastAttempt.clear();
  lastAttempt.set(`${assistantId}:${linkId}`, Date.now());
}
function secondsUntilAllowed(assistantId: string, linkId: string): number {
  const at = lastAttempt.get(`${assistantId}:${linkId}`);
  if (at === undefined) return 0;
  const remaining = SYNC_PAUSE_MS - (Date.now() - at);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

type Auth = Awaited<ReturnType<typeof getAuthContext>>;

async function handleGet(req: Request, assistant: AssistantData): Promise<Response> {
  const links = await Database.getCalendarLinks(assistant.id);
  const token = await ensureBusyFeedToken(assistant);
  return json({ links: links.map(toLinkView), busyFeed: { url: feedUrl(req, token) }, durable: isRelationalModeRequired() });
}

async function handleAdd(req: Request, ctx: Auth, assistant: AssistantData): Promise<Response> {
  const limited = await enforceDistributedRateLimitByKey(`calendar-add:${assistant.workspaceId || ctx.workspaceId}`, ADD_LIMIT);
  if (limited) return limited;

  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return fail('That request is too large.', 413);
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return fail('That request is too large.', 413);

  let body: { label?: unknown; url?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('Choose a calendar type and paste its link.', 400);
  }
  const label = typeof body?.label === 'string' ? body.label : '';
  if (!LABELS.has(label)) return fail('Choose which kind of calendar this is.', 400);
  if (typeof body.url !== 'string' || !body.url.trim()) return fail('Paste the calendar link.', 400);
  if (body.url.length > MAX_URL_LENGTH) return fail('That link is too long to be a calendar link.', 400);

  const url = normaliseCalendarUrl(body.url);
  if (isOwnCalendarLink(url, req)) return fail(OWN_LINK, 400);
  const existing = await Database.getCalendarLinks(assistant.id);
  if (existing.length >= MAX_CALENDAR_LINKS_PER_ASSISTANT) {
    return fail(`An assistant can link at most ${MAX_CALENDAR_LINKS_PER_ASSISTANT} calendars.`, 400);
  }
  if (existing.some((l) => normaliseCalendarUrl(l.url) === url)) return fail('That calendar is already linked.', 400);

  // Prove the link works before keeping it: one read, one parse.
  const fetched = await fetchCalendarFeed(url);
  if (fetched.status !== 'ok') {
    return fail(fetched.status === 'error' ? reasonForFeedError(fetched.error) : 'We could not read a calendar from that link.', 400);
  }
  try {
    const now = Date.now();
    await parseIcalBlocks(fetched.text, { timezone: assistant.timezone || 'UTC', from: new Date(now - SYNC_WINDOW_BACK_MS), to: new Date(now + SYNC_WINDOW_FORWARD_MS) });
  } catch {
    return fail('That link did not return a calendar we can read.', 400);
  }

  const link: CalendarLink = {
    id: `cal_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
    assistantId: assistant.id,
    label: label as CalendarLink['label'],
    url,
    createdAt: new Date().toISOString(),
  };
  const saved = await Database.saveCalendarLink(link); // new link: no status fields
  noteAttempt(assistant.id, saved.id);
  await syncCalendarLink(saved, assistant); // stores the blocks and the status; never throws, a failure shows on the link

  await audit(ctx, req, assistant, 'calendar_link.added', { label, linkId: saved.id });

  const fresh = (await Database.getCalendarLinks(assistant.id)).find((l) => l.id === saved.id) ?? saved;
  return json({ link: toLinkView(fresh) }, 201);
}

async function handleSync(url: URL, assistant: AssistantData): Promise<Response> {
  const linkId = url.searchParams.get('linkId') || '';
  if (!linkId) return fail('Choose which calendar to read.', 400);
  const link = (await Database.getCalendarLinks(assistant.id)).find((l) => l.id === linkId);
  if (!link) return fail('Calendar link not found', 404);

  const wait = secondsUntilAllowed(assistant.id, link.id);
  if (wait > 0) {
    return fail('This calendar was just read. Please wait a moment before reading it again.', 429, { 'Retry-After': String(wait) });
  }
  noteAttempt(assistant.id, link.id);
  const result = await syncCalendarLink(link, assistant);
  // no error and not ok: the link was removed while it was being read
  if (!result.ok && result.error === undefined) return fail('Calendar link not found', 404);

  const fresh = (await Database.getCalendarLinks(assistant.id)).find((l) => l.id === link.id);
  if (!fresh) return fail('Calendar link not found', 404);
  return json({ link: toLinkView(fresh) });
}

async function handleReset(req: Request, ctx: Auth, assistant: AssistantData): Promise<Response> {
  const token = await resetBusyFeedToken(assistant);
  await audit(ctx, req, assistant, 'calendar_feed.reset', {});
  return json({ busyFeed: { url: feedUrl(req, token) } });
}

async function handleDelete(req: Request, ctx: Auth, assistant: AssistantData): Promise<Response> {
  const linkId = new URL(req.url).searchParams.get('linkId') || '';
  if (!linkId) return fail('Choose which calendar to remove.', 400);
  const label = (await Database.getCalendarLinks(assistant.id)).find((l) => l.id === linkId)?.label;
  const removed = await Database.deleteCalendarLink(assistant.id, linkId);
  if (!removed) return fail('Calendar link not found', 404);
  lastAttempt.delete(`${assistant.id}:${linkId}`);
  await audit(ctx, req, assistant, 'calendar_link.removed', { ...(label ? { label } : {}), linkId });
  return json({ success: true });
}

/** The same workspace check as the assistant routes: another workspace's assistant is a 404, like one that does not exist. */
function guarded(
  run: (req: Request, ctx: Auth, assistant: AssistantData) => Promise<Response>,
) {
  return withRoleAuth(['owner', 'admin'], async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const ctx = await getAuthContext(req);
      const { id } = await params;
      const assistant = await requireWorkspaceAssistant(ctx, id);
      if (!assistant) return fail('Assistant not found', 404);
      return await run(req, ctx, assistant);
    } catch (err) {
      if (err instanceof CalendarLinkRuleError) return fail(err.message, 400);
      return unavailable(err);
    }
  });
}

const GETHandler = guarded((req, _ctx, assistant) => handleGet(req, assistant));

const POSTHandler = guarded(async (req, ctx, assistant) => {
  const action = new URL(req.url).searchParams.get('action');
  if (action === null) return handleAdd(req, ctx, assistant);
  if (action === 'sync') return handleSync(new URL(req.url), assistant);
  if (action === 'reset-feed') return handleReset(req, ctx, assistant);
  return fail('Unknown action.', 400);
});

const DELETEHandler = guarded((req, ctx, assistant) => handleDelete(req, ctx, assistant));

export const GET = logged(GETHandler, { route: '/api/assistants/[id]/calendars' });
export const POST = logged(POSTHandler, { route: '/api/assistants/[id]/calendars' });
export const DELETE = logged(DELETEHandler, { route: '/api/assistants/[id]/calendars' });

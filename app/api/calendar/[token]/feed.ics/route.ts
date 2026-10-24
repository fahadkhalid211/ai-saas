import { Database } from '@/lib/db';
import { generateBusyFeed } from '@/lib/calendar/export-feed';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { logEvent } from '@/lib/logging/logger';

/**
 * Private, busy-only calendar feed: GET /api/calendar/<token>/feed.ics
 *
 * The token in the address is the only credential (the owner pastes the link into another calendar tool), so:
 * - nothing here logs the token or the request URL, and this route is deliberately NOT wrapped in `logged()` (which records the path);
 * - an unknown, malformed or short token gets one identical empty 404, with no hint which part was wrong;
 * - the feed itself carries no personal data (see lib/calendar/export-feed.ts).
 */
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ token: string }> };

const NOINDEX = { 'X-Robots-Tag': 'noindex, nofollow' };

function notFound(): Response {
  return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store', ...NOINDEX } });
}

function unavailable(): Response {
  return new Response(null, { status: 503, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store', ...NOINDEX } });
}

async function serve(req: Request, { params }: Ctx, withBody: boolean): Promise<Response> {
  // Per client address, before anything is looked up: calendar tools poll about hourly, so this only stops guessing and hammering.
  const limited = await enforceDistributedRateLimit(req, 'busy-feed', { windowMs: 60 * 1000, max: 30 });
  if (limited) return limited;

  const { token } = await params;
  if (typeof token !== 'string' || token.length < 20 || token.length > 128) return notFound();

  try {
    const assistant = await Database.getAssistantByBusyFeedToken(token);
    if (!assistant) return notFound();

    const appointments = await Database.getAppointments(assistant.id, undefined, { ownOnly: true });
    const feed = generateBusyFeed(appointments, `${assistant.name || 'Crescelo'} (busy)`, assistant.timezone);

    return new Response(withBody ? feed : null, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'private, max-age=300',
        'Content-Disposition': 'inline; filename="crescelo-busy.ics"',
        ...NOINDEX,
      },
    });
  } catch (err) {
    // name only: an error message can carry connection details, and the token must never be logged
    logEvent({ level: 'error', category: 'booking', event: 'calendar.busy_feed_unavailable', meta: { error: err instanceof Error ? err.name : 'unknown' } });
    return unavailable();
  }
}

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  return serve(req, ctx, true);
}

/** Calendar clients probe with HEAD before subscribing: same status and headers as GET, no body. */
export async function HEAD(req: Request, ctx: Ctx): Promise<Response> {
  return serve(req, ctx, false);
}

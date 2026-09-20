import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { enforceRateLimit } from '@/lib/security/rate-limit';

/**
 * Public, fire-and-forget funnel events from the embeddable widget
 * (widget_loaded / widget_opened). Used only to measure pilots: how many
 * sessions saw the widget, and how many opened it.
 *
 * The widget sends a `text/plain` JSON body so the browser makes a "simple"
 * cross-origin request (no CORS preflight). Bad input gets a 400; everything
 * else, including storage problems, gets a 202 so this can never break a page.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const ALLOWED_EVENT_TYPES = ['widget_loaded', 'widget_opened'] as const;
type WidgetEventType = (typeof ALLOWED_EVENT_TYPES)[number];

const SESSION_ID_REGEX = /^[A-Za-z0-9_-]{6,64}$/;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  const rateLimit = enforceRateLimit(req, 'widget-events', { windowMs: 60 * 1000, max: 60 });
  if (rateLimit.errorResponse) {
    return new NextResponse(null, { status: 429, headers: CORS_HEADERS });
  }

  let body: any;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS });
  }

  const assistantId = typeof body?.assistantId === 'string' ? body.assistantId.trim() : '';
  const type = body?.type;
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : '';

  if (
    !assistantId ||
    assistantId.length > 128 ||
    !ALLOWED_EVENT_TYPES.includes(type) ||
    !SESSION_ID_REGEX.test(sessionId)
  ) {
    return NextResponse.json({ error: 'Invalid event payload' }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    // Unknown assistants get the same 202 as valid ones so this endpoint can't be
    // used to enumerate assistant ids.
    const assistant = await Database.getAssistantById(assistantId);
    if (assistant) {
      await Database.recordWidgetEvent({
        assistantId: assistant.id,
        sessionId,
        eventType: type as WidgetEventType,
      });
    }
  } catch (err: any) {
    console.warn('[WidgetEvents] Failed to record event:', err?.message || err);
  }

  return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
}

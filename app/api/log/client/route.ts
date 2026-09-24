import { NextResponse } from 'next/server';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { logEvent } from '@/lib/logging/logger';
import { logged } from '@/lib/logging/route';
import { redactString } from '@/lib/logging/redact';

export const dynamic = 'force-dynamic';

const KINDS = new Set(['error', 'unhandledrejection', 'boundary']);
const text = (v: unknown, max: number) => (typeof v === 'string' ? redactString(v, max) : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : undefined);

/**
 * Browser-side errors (window error, unhandled promise rejection, React error boundaries).
 * Open to anyone, so it is small, rate-limited per address, and takes the visitor's identity only from the
 * server-verified session, never from what the browser says about itself.
 */
async function POSTHandler(req: Request) {
  const limited =
    (await enforceDistributedRateLimit(req, 'client-log', { windowMs: 60 * 1000, max: 20 })) ||
    (await enforceDistributedRateLimit(req, 'client-log-day', { windowMs: 24 * 60 * 60 * 1000, max: 300 }));
  if (limited) return limited;

  const raw = await req.text();
  if (raw.length > 4096) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const kind = KINDS.has(String(body.kind)) ? String(body.kind) : 'error';
  const message = text(body.message, 300) || 'Unknown client error';
  const stack = text(body.stack, 2000);
  const error = Object.assign(new Error(message), { name: text(body.name, 60) || 'ClientError', stack: stack ? `${message}\n${stack}` : undefined });

  logEvent({
    level: 'error',
    category: 'client',
    event: `client.${kind}`,
    error,
    meta: {
      page: text(body.page, 200),
      source: text(body.source, 200),
      line: num(body.line),
      column: num(body.column),
      digest: text(body.digest, 60),
      reportedByBrowser: true,
    },
  });
  return new NextResponse(null, { status: 204 });
}

// Only failures of this endpoint itself are logged as requests; the reports are recorded above.
export const POST = logged(POSTHandler, { route: '/api/log/client', sample: 0 });

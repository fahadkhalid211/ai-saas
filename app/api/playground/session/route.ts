import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { verifyRecaptchaToken } from '@/lib/security/recaptcha';
import { logged } from '@/lib/logging/route';
import { LIMITS, getSession, parseSessionKey } from '@/lib/playground/store';
import { PlaygroundError, startSession } from '@/lib/playground/service';

export const dynamic = 'force-dynamic';

const summary = (s: { name: string; sources: unknown[]; chatCount: number; expiresAt: string }, key: string) => ({
  key,
  name: s.name,
  sources: s.sources,
  chatsLeft: Math.max(0, LIMITS.maxChats - s.chatCount),
  expiresAt: s.expiresAt,
  limits: { maxSources: LIMITS.maxSources, maxFileMb: LIMITS.maxFileBytes / 1_000_000 },
});

/** Opens a playground: a name and an e-mail, nothing else. */
async function POSTHandler(req: Request) {
  try {
    const limited =
      (await enforceDistributedRateLimit(req, 'playground-start', { windowMs: 60 * 1000, max: 4 })) ||
      (await enforceDistributedRateLimit(req, 'playground-start-day', { windowMs: 24 * 60 * 60 * 1000, max: 12 }));
    if (limited) return limited;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    // a hidden field real visitors never fill (named so browser autofill does not recognise it)
    if (typeof body.hp === 'string' && body.hp.trim()) {
      console.warn('[Playground] hidden field filled; request refused');
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 400 });
    }
    const recaptcha = await verifyRecaptchaToken(body.recaptchaToken, getClientIp(req));
    if (!recaptcha.success) return NextResponse.json({ error: recaptcha.error || 'Security check failed. Please try again.' }, { status: 400 });

    const { key, session } = await startSession({ name: body.name, email: body.email, marketingOptIn: body.marketingOptIn });
    return NextResponse.json(summary(session, key));
  } catch (err) {
    if (err instanceof PlaygroundError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[Playground] start failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/** Reopens a playground from its private link (the e-mail, or this browser's memory). */
async function GETHandler(req: Request) {
  const key = new URL(req.url).searchParams.get('s') || '';
  const id = parseSessionKey(key);
  if (!id) return NextResponse.json({ error: 'That playground link is not valid.' }, { status: 404 });
  const s = await getSession(id);
  if (!s) return NextResponse.json({ error: 'This playground has expired. Open a new one to keep testing.' }, { status: 410 });
  return NextResponse.json(summary(s, key));
}

export const POST = logged(POSTHandler, { route: '/api/playground/session' });
export const GET = logged(GETHandler, { route: '/api/playground/session', sample: 0.2 });

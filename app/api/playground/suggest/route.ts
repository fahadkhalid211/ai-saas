import { NextResponse } from 'next/server';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { logged } from '@/lib/logging/route';
import { parseSessionKey } from '@/lib/playground/store';
import { PlaygroundError, suggestQuestions } from '@/lib/playground/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Starter questions written from the documents the visitor added. */
async function POSTHandler(req: Request) {
  const id = parseSessionKey(req.headers.get('x-playground-key'));
  if (!id) return NextResponse.json({ error: 'Open your playground first.' }, { status: 401 });
  const limited = await enforceDistributedRateLimitByKey(`playground-suggest:${id}`, { windowMs: 60 * 60 * 1000, max: 20 });
  if (limited) return limited;
  try {
    return NextResponse.json({ questions: await suggestQuestions(id) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (err instanceof PlaygroundError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ questions: [] });
  }
}

export const POST = logged(POSTHandler, { route: '/api/playground/suggest' });

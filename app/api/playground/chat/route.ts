import { NextResponse } from 'next/server';
import { enforceDistributedRateLimit, enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { logged } from '@/lib/logging/route';
import { parseSessionKey } from '@/lib/playground/store';
import { PlaygroundError, ask } from '@/lib/playground/service';
import type { ChatMessage } from '@/lib/ai/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** One question to the visitor's playground assistant. It answers only from the documents they uploaded. */
async function POSTHandler(req: Request) {
  const id = parseSessionKey(req.headers.get('x-playground-key'));
  if (!id) return NextResponse.json({ error: 'Open your playground first.' }, { status: 401 });
  const limited =
    (await enforceDistributedRateLimitByKey(`playground-chat:${id}`, { windowMs: 60 * 60 * 1000, max: 40 })) ||
    (await enforceDistributedRateLimit(req, 'playground-chat-ip', { windowMs: 60 * 60 * 1000, max: 80 }));
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const history: ChatMessage[] = Array.isArray(body?.history)
    ? body.history
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-6)
        .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 600) }))
    : [];
  try {
    return NextResponse.json(await ask(id, body?.message, history), { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (err instanceof PlaygroundError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[Playground] chat failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'The assistant is unavailable right now. Please try again.' }, { status: 500 });
  }
}

export const POST = logged(POSTHandler, { route: '/api/playground/chat' });

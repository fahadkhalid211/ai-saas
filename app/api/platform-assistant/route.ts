import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/security/auth';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { logged } from '@/lib/logging/route';
import { answerDashboardMessage } from '@/lib/platform/assistant';
import type { ChatMessage } from '@/lib/ai/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * The dashboard assistant. It knows the signed-in person's account and the product manual. It never changes anything by itself:
 * plan changes come back as actions that the person confirms in the interface, and the billing routes re-check their role.
 */
async function POSTHandler(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx.authenticated) return NextResponse.json({ error: 'Sign in to use the dashboard assistant.' }, { status: 401 });

  const limited = await enforceDistributedRateLimitByKey(`platform-assistant:${ctx.memberId}`, { windowMs: 60 * 1000, max: 20 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const text = typeof body?.message === 'string' ? body.message.trim().slice(0, 1000) : '';
  if (!text) return NextResponse.json({ error: 'Type a question first.' }, { status: 400 });

  const history: ChatMessage[] = Array.isArray(body?.history)
    ? body.history
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-8)
        .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 1200) }))
    : [];

  try {
    const result = await answerDashboardMessage(text, history, ctx);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[PlatformAssistant] failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'The assistant is unavailable right now. Please try again.' }, { status: 500 });
  }
}

export const POST = logged(POSTHandler, { route: '/api/platform-assistant' });

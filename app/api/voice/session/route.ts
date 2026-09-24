import { NextResponse } from 'next/server';
import { isSafeId, readSignedBody, startVoiceSession } from '@/lib/voice/server';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

/** Worker -> app: a call arrived. Resolves the assistant from the dialled number and returns the greeting and call state. */
async function POSTHandler(req: Request) {
  const parsed = await readSignedBody(req);
  if ('error' in parsed) return parsed.error;
  const { callId, from, to } = parsed.body || {};
  if (!isSafeId(callId) || typeof to !== 'string') {
    return NextResponse.json({ error: 'callId and to are required' }, { status: 400 });
  }
  try {
    const result = await startVoiceSession({ callId, from: typeof from === 'string' ? from : undefined, to });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[Voice] session error:', err);
    return NextResponse.json({ ok: false, action: 'reject', reason: 'server_error' }, { status: 500 });
  }
}

export const POST = logged(POSTHandler, { route: '/api/voice/session' });

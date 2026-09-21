import { NextResponse } from 'next/server';
import { endVoiceCall, isSafeId, readSignedBody } from '@/lib/voice/server';

export const dynamic = 'force-dynamic';

/** Worker -> app: the call ended. Finalises the call record; optionally carries a voicemail transcript. */
export async function POST(req: Request) {
  const parsed = await readSignedBody(req);
  if ('error' in parsed) return parsed.error;
  const { state, durationSeconds, voicemailText } = parsed.body || {};
  if (!state || !isSafeId(state.callId) || !isSafeId(state.assistantId) || !isSafeId(state.conversationId)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    await endVoiceCall({
      state,
      durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : undefined,
      voicemailText: typeof voicemailText === 'string' ? voicemailText : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Voice] end error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { enforceRateLimitByKey } from '@/lib/security/rate-limit';
import { isSafeId, productionVoiceDeps, readSignedBody } from '@/lib/voice/server';
import { runVoiceTurn, type VoiceCallState } from '@/lib/voice/turn';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function validState(s: any): s is VoiceCallState {
  return (
    s &&
    isSafeId(s.callId) &&
    isSafeId(s.assistantId) &&
    isSafeId(s.conversationId) &&
    typeof s.from === 'string' &&
    typeof s.to === 'string' &&
    Array.isArray(s.history) &&
    s.history.length <= 20 &&
    typeof s.turns === 'number'
  );
}

/**
 * Worker -> app: the caller said something. Streams newline-delimited JSON events:
 * {"type":"say","text":...} as sentences are ready, then optional {"type":"action",...}, then {"type":"state",...}.
 */
async function POSTHandler(req: Request) {
  const parsed = await readSignedBody(req);
  if ('error' in parsed) return parsed.error;
  const { state, text } = parsed.body || {};
  if (!validState(state) || typeof text !== 'string' || text.length > 2000) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const limit = enforceRateLimitByKey(`voice-turn:${state.callId}`, { windowMs: 60 * 1000, max: 40 });
  if (limit.errorResponse) return limit.errorResponse;

  const assistant = await Database.getAssistantById(state.assistantId);
  if (!assistant || !assistant.phoneEnabled || assistant.phoneNumber !== state.to) {
    return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runVoiceTurn({ assistant, state, text, deps: productionVoiceDeps() })) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        }
      } catch (err) {
        console.error('[Voice] turn error:', err);
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'say', text: "Sorry, I'm having trouble. Please hold on." }) + '\n'));
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'state', state }) + '\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' } });
}

export const POST = logged(POSTHandler, { route: '/api/voice/turn' });

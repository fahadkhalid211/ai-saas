import { dispatchIntegrationsAfterResponse } from '@/lib/integrations/dispatch';
import { NextResponse } from 'next/server';
import { Database, type AssistantData } from '@/lib/db';
import { withEnvProviderFallback } from '@/lib/ai/resolve-provider';
import { streamChatResponse } from '@/lib/ai/providers';
import { applyCostCap, COST_CAP_PAUSED_MESSAGE } from '@/lib/ai/spend/guard';
import { retrieveRelevantContext } from '@/lib/rag/retrieval';
import { createAppointment } from '@/lib/appointments/create';
import { isOpenNow, isSlotAvailable } from '@/lib/appointments/availability';
import { enforceRateLimitByKey } from '@/lib/security/rate-limit';
import { getVoiceSecret, verifyVoiceRequest } from '@/lib/voice/auth';
import { normalizeE164 } from '@/lib/voice/text';
import { buildGreeting, newCallState, type BookResult, type VoiceCallState, type VoiceDeps } from '@/lib/voice/turn';
import { logEvent } from '@/lib/logging/logger';

/** Reads a worker request, verifies its HMAC signature and returns the parsed JSON body. */
export async function readSignedBody(req: Request): Promise<{ body: any } | { error: NextResponse }> {
  const raw = await req.text();
  const check = verifyVoiceRequest({
    secret: getVoiceSecret(),
    timestamp: req.headers.get('x-voice-timestamp'),
    signature: req.headers.get('x-voice-signature'),
    rawBody: raw,
  });
  if (!check.ok) {
    const status = check.reason === 'disabled' ? 503 : 401;
    logEvent({ level: 'warn', category: 'security', event: 'security.invalid_signature', meta: { channel: 'voice', reason: check.reason } });
    return { error: NextResponse.json({ error: check.reason === 'disabled' ? 'Voice channel is not configured' : 'Unauthorized' }, { status }) };
  }
  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) };
  }
}

const ID_RE = /^[\w:.-]{1,120}$/;
export const isSafeId = (v: unknown): v is string => typeof v === 'string' && ID_RE.test(v);

const digitsOf = (e164: string) => e164.replace(/\D/g, '');
const syntheticEmail = (phone: string) => `${digitsOf(phone) || 'caller'}@kortex-visitor.com`;

async function knownCaller(assistantId: string, phone: string): Promise<{ name?: string; email?: string }> {
  if (!phone) return {};
  try {
    const leads = await Database.getLeads(assistantId);
    const match = leads.find((l) => l.phone && normalizeE164(l.phone) === phone);
    const realEmail = match?.email && !match.email.endsWith('@kortex-visitor.com') ? match.email : undefined;
    return { name: match?.name || undefined, email: realEmail };
  } catch {
    return {};
  }
}

export type SessionResult =
  | { ok: false; action: 'reject'; reason: string }
  | { ok: true; mode: 'forward'; number: string }
  | { ok: true; mode: 'voicemail'; greeting: string; state: VoiceCallState; language: string; voice: string }
  | { ok: true; mode: 'ai'; greeting: string; state: VoiceCallState; language: string; voice: string; maxSeconds: number; transferNumber?: string };

export async function startVoiceSession(input: { callId: string; from?: string; to: string }): Promise<SessionResult> {
  const to = normalizeE164(input.to);
  if (!to) return { ok: false, action: 'reject', reason: 'invalid_number' };
  const assistant = await Database.getAssistantByPhoneNumber(to);
  if (!assistant) return { ok: false, action: 'reject', reason: 'unknown_number' };

  const from = normalizeE164(input.from || '') || '';

  // Abuse guards: cap calls per caller and per number.
  if (from && enforceRateLimitByKey(`voice-caller:${from}`, { windowMs: 60 * 60 * 1000, max: 8 }).errorResponse) return { ok: false, action: 'reject', reason: 'caller_rate_limited' };
  if (enforceRateLimitByKey(`voice-number:${to}`, { windowMs: 60 * 60 * 1000, max: 200 }).errorResponse) return { ok: false, action: 'reject', reason: 'number_rate_limited' };

  const config = {
    bookingStartHour: assistant.bookingStartHour,
    bookingEndHour: assistant.bookingEndHour,
    bookingAvailableDays: assistant.bookingAvailableDays,
    timezone: assistant.timezone,
  };
  const afterHours = assistant.phoneAfterHours || 'ai';
  const open = isOpenNow(config);
  if (!open && afterHours === 'forward' && assistant.phoneTransferNumber) return { ok: true, mode: 'forward', number: assistant.phoneTransferNumber };

  const known = await knownCaller(assistant.id, from);
  const conversation = await Database.getOrCreateConversation(assistant.id, `ph_${from || input.callId}`);
  const state = newCallState({ callId: input.callId, assistantId: assistant.id, from, to, conversationId: conversation.id, knownName: known.name });

  await Database.saveCall({ id: input.callId, assistantId: assistant.id, conversationId: conversation.id, from: from || 'unknown', to, startedAt: state.startedAt });

  const business = assistant.landingPageConfig?.businessName || assistant.name;
  const language = assistant.phoneLanguage || 'en';
  const voice = assistant.phoneVoice || '';

  if (!open && afterHours === 'voicemail') {
    return {
      ok: true,
      mode: 'voicemail',
      state,
      language,
      voice,
      greeting: `Thanks for calling ${business}. We're closed right now. This line is answered by an automated assistant. Please leave your name, number and a short message after the tone.`,
    };
  }

  return {
    ok: true,
    mode: 'ai',
    greeting: buildGreeting(assistant),
    state,
    language,
    voice,
    maxSeconds: (assistant.phoneMaxCallMinutes || 10) * 60,
    transferNumber: assistant.phoneTransferNumber || undefined,
  };
}

/** Production dependencies for the voice turn engine. */
export function productionVoiceDeps(): VoiceDeps {
  return {
    getAppointments: async (assistantId) => {
      const all = await Database.getAppointments(assistantId, undefined, { ownOnly: true });
      return all.map((a) => ({ date: a.date, timeSlot: a.timeSlot, durationMinutes: a.durationMinutes, status: a.status }));
    },

    getExternalBlocks: (assistantId) => Database.getExternalBlocks(assistantId),

    bookAppointment: async ({ assistant, booking, state }): Promise<BookResult> => {
      const existing = await Database.getAppointments(assistant.id, undefined, { ownOnly: true });
      const blocks = await Database.getExternalBlocks(assistant.id);
      const config = {
        bookingStartHour: assistant.bookingStartHour,
        bookingEndHour: assistant.bookingEndHour,
        bookingAvailableDays: assistant.bookingAvailableDays,
        bookingSlotDuration: assistant.bookingSlotDuration,
        timezone: assistant.timezone,
      };
      // Independent re-check of the read-back slot before saving (the model and the flow are not trusted).
      const stillOpen = isSlotAvailable({ config, date: booking.date, timeSlot: booking.timeSlot, durationMinutes: booking.durationMinutes, appointments: existing, blocks });
      if (!stillOpen) return { ok: false, conflict: true };

      const known = await knownCaller(assistant.id, booking.phone);
      const email = known.email || syntheticEmail(booking.phone);
      const result = await createAppointment({
        assistant,
        input: {
          name: booking.name,
          email,
          phone: booking.phone,
          date: booking.date,
          timeSlot: booking.timeSlot,
          durationMinutes: booking.durationMinutes,
          serviceId: booking.serviceId,
          serviceName: booking.serviceName,
          price: booking.price,
          notes: 'Booked by phone (AI assistant)',
        },
        attribution: { source: 'phone', conversationId: state.conversationId },
        ip: 'phone',
        actorId: 'phone',
        sendClientEmail: !!known.email,
      });
      if (result.ok) return { ok: true, appointmentId: result.appointment.id, hasEmail: !!known.email };
      return { ok: false, conflict: result.status === 409 };
    },

    saveMessage: async (conversationId, role, content) => {
      await Database.saveMessage(conversationId, role, content);
    },

    saveCallback: async ({ assistant, name, phone, note, conversationId }) => {
      const lead = await Database.saveLead({
        assistantId: assistant.id,
        email: syntheticEmail(phone),
        name,
        phone: phone || undefined,
        notes: note,
        customData: { Type: 'Phone Call-back', attributionSource: 'phone', attributionConversationId: conversationId },
      });
      dispatchIntegrationsAfterResponse(assistant, 'lead.created', lead);
    },

    notify: async ({ assistant, title, message, type }) => {
      await Database.addNotification({ assistantId: assistant.id, title, message, type: type as any });
    },

    markEscalated: async (conversationId) => {
      await Database.updateConversation(conversationId, { escalated: true, status: 'waiting_for_agent' });
    },

    retrieve: async (assistantId, query, history) => {
      const a = await Database.getAssistantById(assistantId);
      const r = await retrieveRelevantContext(assistantId, query, history, a?.contextChunks || 3);
      return { contextText: r.contextText };
    },

    streamLLM: (messages, assistant: AssistantData) => {
      const a = withEnvProviderFallback(assistant);
      return (async function* () {
        // Monthly cost cap on the customer's own key: once reached, the call runs on free Groq or the assistant pauses
        const costCap = await applyCostCap(a, {
          provider: a.provider,
          modelName: a.modelName,
          apiKey: a.apiKeyEncrypted,
          customBaseUrl: a.customBaseUrl,
          temperature: 0.3,
          maxTokens: 180,
        });
        if (costCap.blocked) {
          yield COST_CAP_PAUSED_MESSAGE;
          return;
        }
        try {
          yield* streamChatResponse(messages, costCap.options);
        } finally {
          await costCap.settle();
        }
      })();
    },
  };
}

/** Finalises the call record when the worker reports the call ended. */
export async function endVoiceCall(input: { state: VoiceCallState; durationSeconds?: number; voicemailText?: string }): Promise<void> {
  const { state } = input;
  const assistant = await Database.getAssistantById(state.assistantId);
  if (!assistant) return;

  if (input.voicemailText && input.voicemailText.trim()) {
    const text = input.voicemailText.trim().slice(0, 1500);
    const voicemailLead = await Database.saveLead({
      assistantId: assistant.id,
      email: syntheticEmail(state.from),
      phone: state.from || undefined,
      name: state.knownName,
      notes: `Voicemail: ${text}`,
      customData: { Type: 'Voicemail', attributionSource: 'phone', attributionConversationId: state.conversationId },
    });
    dispatchIntegrationsAfterResponse(assistant, 'lead.created', voicemailLead);
    await Database.saveMessage(state.conversationId, 'user', `(voicemail) ${text}`);
    await Database.addNotification({ assistantId: assistant.id, title: 'New voicemail', message: `From ${state.from || 'unknown'}: ${text.slice(0, 160)}`, type: 'lead_captured' }).catch(() => undefined);
    state.outcome = 'callback';
  }

  const started = new Date(state.startedAt).getTime();
  const duration = Math.max(0, Math.round(input.durationSeconds ?? (Date.now() - started) / 1000));
  await Database.saveCall({
    id: state.callId,
    assistantId: state.assistantId,
    conversationId: state.conversationId,
    from: state.from || 'unknown',
    to: state.to,
    startedAt: state.startedAt,
    endedAt: new Date().toISOString(),
    durationSeconds: duration,
    outcome: state.outcome || (state.turns === 0 ? 'abandoned' : 'answered'),
    appointmentId: state.appointmentId,
  });
  if (state.turns > 0) await Database.saveMessage(state.conversationId, 'system', `Phone call ended after ${duration}s.`).catch(() => undefined);
}

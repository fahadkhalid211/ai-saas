import { Database } from '../db';
import { sanitizeAttribution, type AttributionSource } from '../security/validation';

export interface ResolvedAttribution {
  conversationId?: string;
  source: AttributionSource;
}

// Namespaced so system attribution can never collide with (or be spoofed by)
// a business-defined custom lead field such as "source".
export const ATTRIBUTION_CONVERSATION_KEY = 'attributionConversationId';
export const ATTRIBUTION_SOURCE_KEY = 'attributionSource';

/**
 * A conversation's assistantId is whatever the client sent when the chat began,
 * which may be the assistant id or a landing-page slug. Canonicalize without any
 * side effects (getAssistantBySlug can create assistants from template presets).
 */
async function conversationBelongsToAssistant(
  conversationAssistantId: string | undefined,
  assistantId: string
): Promise<boolean> {
  if (!conversationAssistantId) return false;
  if (conversationAssistantId === assistantId) return true;

  const state = await Database.getState();
  const lower = conversationAssistantId.toLowerCase();
  const owner = (state.assistants || []).find(
    (a) => a.id === conversationAssistantId || (a.landingPageConfig?.slug || '').toLowerCase() === lower
  );
  return owner?.id === assistantId;
}

/**
 * Resolves trustworthy attribution for a lead or booking.
 *
 * - `conversationId` is kept only if that conversation exists AND belongs to the
 *   assistant; anything else is dropped so measurement can't be polluted.
 * - `source` is `chat` only when backed by a verified conversation. An unverifiable
 *   claim of `chat` is downgraded to `direct`.
 * Never throws: attribution problems must not fail a real lead or booking.
 */
export async function resolveAttribution(
  input: Record<string, any> | undefined,
  assistantId: string
): Promise<ResolvedAttribution> {
  const { conversationId, source } = sanitizeAttribution(input);

  let verifiedConversationId: string | undefined;
  if (conversationId) {
    try {
      const conv = await Database.getConversationById(conversationId);
      if (conv && (await conversationBelongsToAssistant(conv.assistantId, assistantId))) {
        verifiedConversationId = conversationId;
      }
    } catch {
      verifiedConversationId = undefined;
    }
  }

  let finalSource: AttributionSource;
  if (verifiedConversationId) {
    finalSource = !source || source === 'direct' ? 'chat' : source;
  } else {
    finalSource = source && source !== 'chat' ? source : 'direct';
  }

  return { conversationId: verifiedConversationId, source: finalSource };
}

/** Attribution fields to merge into a lead's customData (JSONB in both DB modes). */
export function attributionCustomData(attribution: ResolvedAttribution): Record<string, string> {
  return {
    ...(attribution.conversationId ? { [ATTRIBUTION_CONVERSATION_KEY]: attribution.conversationId } : {}),
    [ATTRIBUTION_SOURCE_KEY]: attribution.source,
  };
}

import { AssistantData, Database } from '../db';
import { retrieveRelevantContext } from '../rag/retrieval';
import { buildSystemPrompt, generateChatCompletion } from '../ai/providers';
import { guardReply } from '../ai/figure-guard';
import { applyCostCap, COST_CAP_PAUSED_MESSAGE } from '@/lib/ai/spend/guard';
import { convertMarkdownForMessagingChannel } from './format';

/**
 * Sends a direct message to a user on Instagram via the official Meta Graph API (Messenger API for Instagram).
 */
export async function sendInstagramMessage(
  pageAccessToken: string | undefined | null,
  recipientId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!pageAccessToken || typeof pageAccessToken !== 'string' || !pageAccessToken.trim()) {
      return { success: false, error: 'Instagram access token is required' };
    }

    if (!recipientId || typeof recipientId !== 'string') {
      return { success: false, error: 'Recipient ID is required' };
    }

    // Instagram Direct has a 1000-character limit per text message. Chunk cleanly if longer.
    const chunks: string[] = [];
    if (text.length <= 1000) {
      chunks.push(text);
    } else {
      for (let i = 0; i < text.length; i += 1000) {
        chunks.push(text.slice(i, i + 1000));
      }
    }

    const url = 'https://graph.facebook.com/v21.0/me/messages';
    for (const chunk of chunks) {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pageAccessToken.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: chunk },
        }),
        signal: AbortSignal.timeout(10_000),
      });

      const data = await res.json();
      if (!res.ok && !data.message_id && !data.recipient_id) {
        return { success: false, error: data.error?.message || 'Failed to send Instagram direct message' };
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Instagram network error' };
  }
}

const processedInstagramMsgIds = new Set<string>();
const MAX_PROCESSED_IG_MSGS = 1000;

function isDuplicateInstagramMsg(msgId: unknown): boolean {
  if (!msgId) return false;
  const key = String(msgId);
  if (processedInstagramMsgIds.has(key)) {
    return true;
  }
  if (processedInstagramMsgIds.size >= MAX_PROCESSED_IG_MSGS) {
    const oldest = processedInstagramMsgIds.values().next().value;
    if (oldest !== undefined) {
      processedInstagramMsgIds.delete(oldest);
    }
  }
  processedInstagramMsgIds.add(key);
  return false;
}

export interface InstagramAdReferral {
  source?: string;
  type?: string;
  ad_id?: string;
  ad_title?: string;
  ref?: string;
}

/**
 * Handles incoming webhooks for Instagram Messaging events from Meta.
 * Supports standard DMs, story replies, and Click-to-Instagram Direct Ads referrals.
 */
export async function processInstagramWebhook(
  assistant: AssistantData,
  payload: any
): Promise<void> {
  if (!payload || !Array.isArray(payload.entry)) {
    return;
  }

  for (const entry of payload.entry) {
    // Meta sends Instagram Direct messages under entry[].messaging
    const messagingEvents = Array.isArray(entry?.messaging) ? entry.messaging : [];

    for (const event of messagingEvents) {
      // 1. Skip echo messages sent by the business account itself to avoid bot reply loops
      if (event?.message?.is_echo) {
        continue;
      }

      const senderId = event?.sender?.id;
      const messageId = event?.message?.mid;
      const userText = event?.message?.text?.trim();

      // If there's no message text or no sender ID, ignore this event
      if (!senderId || !userText) {
        continue;
      }

      if (!assistant.instagramAccessToken) {
        continue;
      }

      // 2. Drop duplicate webhook redeliveries from Meta
      if (isDuplicateInstagramMsg(messageId)) {
        continue;
      }

      // Check if conversation was initiated by an Instagram Ad (Click-to-Instagram Direct Ads)
      const referral: InstagramAdReferral | undefined =
        event?.referral || event?.message?.referral;

      let adContext = '';
      if (referral && (referral.source === 'ADS' || referral.ad_id)) {
        adContext = `[Instagram Direct Ad Referral]\nThe user contacted you through Instagram Ad (Ad ID: ${referral.ad_id || 'unknown'}, Title: "${referral.ad_title || 'Instagram Promotion'}"). Please tailor your response to address the ad campaign and promotional offer they saw.`;
      }

      // Unified conversation ID: prefixed with ig_ to maintain cross-channel visibility in dashboard
      const visitorId = `ig_${senderId}`;
      const conv = await Database.getOrCreateConversation(
        assistant.id,
        visitorId
      );

      // Save customer message to DB
      await Database.saveMessage(conv.id, 'user', userText);

      // If a human agent took over this chat from the Crescelo inbox, do not auto-reply
      if (conv.isLiveTakeover) {
        continue;
      }

      // 3. Retrieve relevant knowledge base chunks via RAG
      const retrieved = await retrieveRelevantContext(
        assistant.id,
        userText,
        [],
        assistant.contextChunks || 3
      );

      const contextText = retrieved.contextText;

      const systemPrompt = buildSystemPrompt({
        businessPrompt: [assistant.systemPrompt, adContext].filter(Boolean).join('\n\n'),
        contextText,
        fallbackMessage: assistant.fallbackMessage,
        assistantName: assistant.name,
      });

      // 4. Generate AI response with cost-capping and safety guardrails
      try {
        const costCap = await applyCostCap(assistant, {
          provider: assistant.provider,
          modelName: assistant.modelName,
          apiKey: assistant.apiKeyEncrypted,
          customBaseUrl: assistant.customBaseUrl,
          temperature: assistant.temperature,
          maxTokens: assistant.maxTokens,
        });

        const aiResponse = costCap.blocked
          ? COST_CAP_PAUSED_MESSAGE
          : await generateChatCompletion(
              [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText },
              ],
              costCap.options
            );
        await costCap.settle();

        // FigureGuard: ensure no fabricated prices, unauthorized discounts, or hallucinatory commitments
        const checked = costCap.blocked
          ? aiResponse
          : guardReply(aiResponse, [assistant.systemPrompt, contextText, assistant.name, assistant.fallbackMessage, userText]).text;

        const cleanReply = convertMarkdownForMessagingChannel(checked.trim() || assistant.fallbackMessage);

        // 5. Send reply back to customer's Instagram Direct thread
        await sendInstagramMessage(
          assistant.instagramAccessToken,
          senderId,
          cleanReply
        );

        // 6. Log assistant response in DB
        await Database.saveMessage(conv.id, 'assistant', cleanReply, retrieved.chunks);
      } catch (err: any) {
        console.error('[Instagram] AI response generation failed:', err);
        await sendInstagramMessage(
          assistant.instagramAccessToken,
          senderId,
          assistant.fallbackMessage || 'I am having trouble answering right now. Please leave your contact info and our team will get back to you shortly!'
        );
      }
    }
  }
}

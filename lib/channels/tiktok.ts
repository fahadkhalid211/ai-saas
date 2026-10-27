import { AssistantData, Database } from '../db';
import { retrieveRelevantContext } from '../rag/retrieval';
import { buildSystemPrompt, generateChatCompletion } from '../ai/providers';
import { guardReply } from '../ai/figure-guard';
import { applyCostCap, COST_CAP_PAUSED_MESSAGE } from '@/lib/ai/spend/guard';
import { convertMarkdownForMessagingChannel } from './format';

/**
 * Sends a direct message to a customer on TikTok via the official TikTok Business Messaging API.
 */
export async function sendTikTokMessage(
  accessToken: string | undefined | null,
  recipientId: string,
  text: string,
  businessId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!accessToken || typeof accessToken !== 'string' || !accessToken.trim()) {
      return { success: false, error: 'TikTok access token is required' };
    }

    if (!recipientId || typeof recipientId !== 'string') {
      return { success: false, error: 'Recipient ID is required' };
    }

    // TikTok Direct Messages have a 2,000 character limit per text message. Chunk cleanly if longer.
    const chunks: string[] = [];
    if (text.length <= 2000) {
      chunks.push(text);
    } else {
      for (let i = 0; i < text.length; i += 2000) {
        chunks.push(text.slice(i, i + 2000));
      }
    }

    const token = accessToken.trim();
    const endpoint = 'https://business-api.tiktok.com/open_api/v1.3/im/message/send/';

    for (const chunk of chunks) {
      const payload: Record<string, any> = {
        recipient_id: recipientId,
        message_type: 'text',
        content: { text: chunk },
      };
      if (businessId) {
        payload.advertiser_id = businessId;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Access-Token': token,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });

      const data = await res.json().catch(() => ({}));
      // TikTok API uses code 0 for success or standard http 200 with message_id
      const isSuccess =
        res.ok &&
        (data.code === 0 ||
          data.data?.message_id ||
          data.message_id ||
          data.message === 'OK' ||
          data.message === 'success');

      if (!isSuccess) {
        return {
          success: false,
          error: data.message || data.error?.message || 'Failed to send TikTok direct message',
        };
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'TikTok network error' };
  }
}

const processedTikTokMsgIds = new Set<string>();
const MAX_PROCESSED_TT_MSGS = 1000;

function isDuplicateTikTokMsg(msgId: unknown): boolean {
  if (!msgId) return false;
  const key = String(msgId);
  if (processedTikTokMsgIds.has(key)) {
    return true;
  }
  if (processedTikTokMsgIds.size >= MAX_PROCESSED_TT_MSGS) {
    const oldest = processedTikTokMsgIds.values().next().value;
    if (oldest !== undefined) {
      processedTikTokMsgIds.delete(oldest);
    }
  }
  processedTikTokMsgIds.add(key);
  return false;
}

export interface TikTokAdReferral {
  source?: string;
  ad_id?: string;
  campaign_id?: string;
  creative_id?: string;
  ad_title?: string;
}

/**
 * Normalizes incoming TikTok webhook events across both TikTok Business API
 * and TikTok Open API payload formats into a uniform representation.
 */
interface NormalizedTikTokEvent {
  senderId: string;
  messageId: string;
  userText: string;
  isEcho?: boolean;
  referral?: TikTokAdReferral;
}

function extractTikTokEvents(payload: any): NormalizedTikTokEvent[] {
  const events: NormalizedTikTokEvent[] = [];
  if (!payload || typeof payload !== 'object') return events;

  // Format A: Meta-style entry[].messaging[] or TikTok events[]
  if (Array.isArray(payload.entry)) {
    for (const entry of payload.entry) {
      const messagingList = Array.isArray(entry?.messaging) ? entry.messaging : [];
      for (const item of messagingList) {
        if (!item?.message?.text && !item?.text) continue;
        events.push({
          senderId: item?.sender?.id || item?.sender_id || item?.from,
          messageId: item?.message?.mid || item?.message_id || item?.mid,
          userText: (item?.message?.text || item?.text || '').trim(),
          isEcho: item?.message?.is_echo || item?.is_echo || false,
          referral: item?.referral || item?.message?.referral,
        });
      }
    }
  }

  // Format B: TikTok direct webhook event structure (event: 'im.message.receive' or data: {...})
  if (payload.data && typeof payload.data === 'object') {
    const d = payload.data;
    const senderId = d.sender_id || d.from_user_id || d.sender?.id;
    const messageId = d.message_id || d.msg_id;
    const userText = (d.content?.text || d.text || d.message?.text || '').trim();
    if (senderId && userText) {
      events.push({
        senderId,
        messageId: messageId || `tt_msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userText,
        isEcho: d.is_echo || d.from_type === 'business' || false,
        referral: d.ad_referral || d.referral,
      });
    }
  }

  // Format C: Direct root event (single message payload)
  if (events.length === 0 && (payload.sender_id || payload.from) && (payload.text || payload.content?.text)) {
    events.push({
      senderId: payload.sender_id || payload.from,
      messageId: payload.message_id || `tt_msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userText: (payload.text || payload.content?.text || '').trim(),
      isEcho: payload.is_echo || false,
      referral: payload.ad_referral || payload.referral,
    });
  }

  return events;
}

/**
 * Handles incoming webhooks for TikTok Messaging events from TikTok for Business / Developers.
 * Supports direct DMs, comments-to-message, and Click-to-TikTok Direct Message Ads referrals.
 */
export async function processTikTokWebhook(
  assistant: AssistantData,
  payload: any
): Promise<void> {
  const events = extractTikTokEvents(payload);
  if (events.length === 0) return;

  for (const event of events) {
    // 1. Skip echo messages sent by the business account itself to avoid bot reply loops
    if (event.isEcho) {
      continue;
    }

    const { senderId, messageId, userText } = event;
    if (!senderId || !userText) {
      continue;
    }

    if (!assistant.tiktokAccessToken) {
      continue;
    }

    // 2. Drop duplicate webhook redeliveries
    if (isDuplicateTikTokMsg(messageId)) {
      continue;
    }

    // 3. Extract TikTok Ads referral metadata (Spark Ads, Direct Message Ads)
    const referral = event.referral;
    let adContext = '';
    if (referral && (referral.source === 'TIKTOK_ADS' || referral.ad_id || referral.campaign_id)) {
      adContext = `[TikTok Direct Ad Referral]\nThe customer contacted you via a TikTok Ad (Ad ID: ${referral.ad_id || 'unknown'}, Campaign ID: ${referral.campaign_id || 'unknown'}, Title: "${referral.ad_title || 'TikTok Campaign'}"). Please tailor your response to address the TikTok promotion and offer they interacted with.`;
    }

    // 4. Unified conversation ID: prefixed with tt_ to maintain cross-channel visibility in dashboard
    const visitorId = `tt_${senderId}`;
    const conv = await Database.getOrCreateConversation(assistant.id, visitorId);

    // Save customer message to DB
    await Database.saveMessage(conv.id, 'user', userText);

    // If a human agent took over this chat from the Crescelo inbox, do not auto-reply
    if (conv.isLiveTakeover) {
      continue;
    }

    // 5. Retrieve relevant knowledge base chunks via RAG
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

    // 6. Generate AI response with cost-capping and safety guardrails
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

      // FigureGuard: ensure no fabricated prices or hallucinatory commitments
      const checked = costCap.blocked
        ? aiResponse
        : guardReply(aiResponse, [assistant.systemPrompt, contextText, assistant.name, assistant.fallbackMessage, userText]).text;

      const cleanReply = convertMarkdownForMessagingChannel(checked.trim() || assistant.fallbackMessage);

      // 7. Send reply back to customer's TikTok Direct Messages thread
      await sendTikTokMessage(
        assistant.tiktokAccessToken,
        senderId,
        cleanReply,
        assistant.tiktokBusinessId
      );

      // 8. Log assistant response in DB
      await Database.saveMessage(conv.id, 'assistant', cleanReply, retrieved.chunks);
    } catch (err: any) {
      console.error('[TikTok] AI response generation failed:', err);
      await sendTikTokMessage(
        assistant.tiktokAccessToken,
        senderId,
        assistant.fallbackMessage || 'I am having trouble answering right now. Please leave your contact details and our team will get back to you shortly!',
        assistant.tiktokBusinessId
      );
    }
  }
}

import { AssistantData, Database } from '../db';
import { retrieveRelevantContext } from '../rag/retrieval';
import { buildSystemPrompt, generateChatCompletion } from '../ai/providers';
import { applyCostCap, COST_CAP_PAUSED_MESSAGE } from '@/lib/ai/spend/guard';
import { convertMarkdownForMessagingChannel } from './format';

/**
 * Sends a message to a customer via the official Meta WhatsApp Cloud API.
 */
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId.trim()}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''), // clean phone number digits
        type: 'text',
        text: { preview_url: false, body: text },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const data = await res.json();
    if (res.ok && data.messages) {
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to send WhatsApp message' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'WhatsApp network error' };
  }
}

const processedWhatsAppMsgIds = new Set<string>();
const MAX_PROCESSED_WA_MSGS = 1000;

function isDuplicateWhatsAppMsg(msgId: unknown): boolean {
  if (!msgId) return false;
  const key = String(msgId);
  if (processedWhatsAppMsgIds.has(key)) {
    return true;
  }
  if (processedWhatsAppMsgIds.size >= MAX_PROCESSED_WA_MSGS) {
    const oldest = processedWhatsAppMsgIds.values().next().value;
    if (oldest !== undefined) {
      processedWhatsAppMsgIds.delete(oldest);
    }
  }
  processedWhatsAppMsgIds.add(key);
  return false;
}

/**
 * Handles incoming WhatsApp webhook events from Meta Graph API.
 */
export async function processWhatsAppWebhook(
  assistant: AssistantData,
  body: any
): Promise<void> {
  const change = body?.entry?.[0]?.changes?.[0]?.value;
  if (!change) return;

  const messages = change.messages;
  if (!messages || !Array.isArray(messages) || messages.length === 0) return;

  const incomingMsg = messages[0];
  if (incomingMsg.id && isDuplicateWhatsAppMsg(incomingMsg.id)) {
    return;
  }

  const from = incomingMsg.from; // Customer phone number
  const userText = incomingMsg.text?.body?.trim();

  if (!from || !userText) return;
  if (!assistant.whatsappPhoneNumberId || !assistant.whatsappAccessToken) return;

  // 1. Log incoming message into unified conversation dashboard
  const visitorId = `wa_${from}`;
  const conv = await Database.getOrCreateConversation(assistant.id, visitorId);
  await Database.saveMessage(conv.id, 'user', userText);

  // If a human operator took over, do not auto-reply
  if (conv.isLiveTakeover) {
    return;
  }

  // 2. Query RAG Knowledge Base
  const retrieved = await retrieveRelevantContext(
    assistant.id,
    userText,
    [],
    assistant.contextChunks || 3
  );

  const contextText = retrieved.contextText;

  const systemPrompt = buildSystemPrompt({
    businessPrompt: assistant.systemPrompt,
    contextText,
    fallbackMessage: assistant.fallbackMessage,
    assistantName: assistant.name,
  });

  // 3. Generate AI response
  try {
    // Monthly cost cap on the customer's own key: once reached, the reply runs on free Groq or the assistant pauses
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

    const cleanReply = convertMarkdownForMessagingChannel(aiResponse.trim() || assistant.fallbackMessage);

    // 4. Send response back to customer's WhatsApp
    await sendWhatsAppMessage(
      assistant.whatsappPhoneNumberId,
      assistant.whatsappAccessToken,
      from,
      cleanReply
    );

    // 5. Log response in DB
    await Database.saveMessage(conv.id, 'assistant', cleanReply, retrieved.chunks);
  } catch (err: any) {
    console.error('[WhatsApp] AI response generation failed:', err);
    await sendWhatsAppMessage(
      assistant.whatsappPhoneNumberId,
      assistant.whatsappAccessToken,
      from,
      assistant.fallbackMessage || 'I apologize, but I encountered an error processing your request.'
    );
  }
}

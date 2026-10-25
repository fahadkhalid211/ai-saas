import { AssistantData, Database } from '../db';
import { retrieveRelevantContext } from '../rag/retrieval';
import { buildSystemPrompt, generateChatCompletion } from '../ai/providers';
import { guardReply } from '../ai/figure-guard';
import { applyCostCap, COST_CAP_PAUSED_MESSAGE } from '@/lib/ai/spend/guard';
import { convertMarkdownForMessagingChannel } from './format';

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

/**
 * Validates a bot token and fetches bot details from Telegram.
 */
export async function getTelegramBotInfo(
  token: string
): Promise<{ ok: boolean; bot?: TelegramBotInfo; error?: string }> {
  if (!token || !token.trim()) {
    return { ok: false, error: 'Token is required' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`, {
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    if (data.ok && data.result) {
      return { ok: true, bot: data.result };
    }
    return { ok: false, error: data.description || 'Invalid Telegram Bot Token' };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network connection to Telegram failed' };
  }
}

/**
 * Registers the webhook URL with Telegram's Bot API.
 */
export async function setTelegramWebhook(
  token: string,
  webhookUrl: string,
  secretToken?: string
): Promise<{ ok: boolean; description?: string }> {
  if (!token || !webhookUrl) {
    return { ok: false, description: 'Token and Webhook URL are required' };
  }

  try {
    let url = `https://api.telegram.org/bot${token.trim()}/setWebhook?url=${encodeURIComponent(webhookUrl.trim())}`;
    if (secretToken) {
      url += `&secret_token=${encodeURIComponent(secretToken.trim())}`;
    }
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    return { ok: !!data.ok, description: data.description };
  } catch (err: any) {
    return { ok: false, description: err?.message || 'Failed to register webhook with Telegram' };
  }
}

const processedTelegramUpdateIds = new Set<string>();
const MAX_PROCESSED_UPDATES = 1000;

function isDuplicateTelegramUpdate(updateId: unknown): boolean {
  if (updateId === undefined || updateId === null) return false;
  const key = String(updateId);
  if (processedTelegramUpdateIds.has(key)) {
    return true;
  }
  if (processedTelegramUpdateIds.size >= MAX_PROCESSED_UPDATES) {
    const oldest = processedTelegramUpdateIds.values().next().value;
    if (oldest !== undefined) {
      processedTelegramUpdateIds.delete(oldest);
    }
  }
  processedTelegramUpdateIds.add(key);
  return false;
}

/**
 * Sends a message to a Telegram chat.
 */
export async function sendTelegramMessage(
  token: string,
  chatId: number | string,
  text: string
): Promise<boolean> {
  try {
    // Attempt with Markdown parse_mode
    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) return true;

    // Fallback: If Markdown parsing errors out (e.g. unclosed symbols), send as plain text
    const fallbackRes = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    return fallbackRes.ok;
  } catch (err) {
    console.error('[Telegram] Failed to send message:', err);
    return false;
  }
}

/**
 * Handles incoming Telegram update from webhook, queries RAG, and replies back.
 */
export async function processTelegramUpdate(
  assistant: AssistantData,
  update: any
): Promise<void> {
  if (update?.update_id !== undefined && isDuplicateTelegramUpdate(update.update_id)) {
    return;
  }

  const message = update?.message || update?.edited_message;
  if (!message || !message.text) return;

  const chatId = message.chat?.id;
  const userText = message.text.trim();
  const senderName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ') || 'Telegram User';

  if (!chatId || !assistant.telegramBotToken) return;

  // 1. Log conversation in unified dashboard
  const visitorId = `tg_${chatId}`;
  const conv = await Database.getOrCreateConversation(assistant.id, visitorId);
  await Database.saveMessage(conv.id, 'user', userText);

  // If a human operator took over, do not auto-reply
  if (conv.isLiveTakeover) {
    return;
  }

  // 2. Handle /start command
  if (userText === '/start') {
    const welcome = assistant.welcomeMessage || 'Hello! How can I help you today?';
    await sendTelegramMessage(assistant.telegramBotToken, chatId, welcome);
    await Database.saveMessage(conv.id, 'assistant', welcome);
    return;
  }

  // 3. Query RAG Knowledge Base
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

  // 4. Generate AI response
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

    // no price, limit or quantity goes out unless the business supplied it (lib/ai/figure-guard.ts)
    const checked = costCap.blocked ? aiResponse : guardReply(aiResponse, [assistant.systemPrompt, contextText, assistant.name, assistant.fallbackMessage, userText]).text;
    const cleanReply = convertMarkdownForMessagingChannel(checked.trim() || assistant.fallbackMessage);

    // 5. Send reply to Telegram
    await sendTelegramMessage(assistant.telegramBotToken, chatId, cleanReply);

    // 6. Log response in DB
    await Database.saveMessage(conv.id, 'assistant', cleanReply, retrieved.chunks);
  } catch (err: any) {
    console.error('[Telegram] AI response error:', err);
    await sendTelegramMessage(
      assistant.telegramBotToken,
      chatId,
      assistant.fallbackMessage || 'I apologize, but I encountered an error processing your request.'
    );
  }
}

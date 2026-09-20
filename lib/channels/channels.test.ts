import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database, AssistantData } from '../db';
import { processTelegramUpdate } from './telegram';
import { processWhatsAppWebhook } from './whatsapp';
import * as providers from '../ai/providers';

describe('Messaging Channels - Telegram and WhatsApp Handlers', () => {
  const dummyAssistant: AssistantData = {
    id: 'ast_chan_test_' + Math.random().toString(36).substring(2, 7),
    workspaceId: 'ws_test_channels',
    name: 'Channel Test Bot',
    telegramBotToken: '123456:ABC-DEF-GHI',
    telegramBotEnabled: true,
    whatsappPhoneNumberId: 'phone_12345',
    whatsappAccessToken: 'token_wa_access',
    whatsappEnabled: true,
    systemPrompt: 'You are an assistant.',
    welcomeMessage: 'Welcome!',
    fallbackMessage: 'Fallback message.',
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
    contextChunks: 3,
    primaryColor: '#000000',
    launcherPosition: 'bottom-right',
    starterQuestions: [],
    collectLeadEmail: false,
    allowedDomains: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Telegram Webhook Handler', () => {
    it('should drop duplicate updates with the same update_id', async () => {
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion').mockResolvedValue('Hello response');
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true })));

      const updateId = 9999901;
      const updatePayload = {
        update_id: updateId,
        message: {
          chat: { id: 12345678 },
          from: { first_name: 'Alex' },
          text: 'First arrival',
        },
      };

      await processTelegramUpdate(dummyAssistant, updatePayload);
      const callCountAfterFirst = generateSpy.mock.calls.length;

      // Send identical update again
      await processTelegramUpdate(dummyAssistant, updatePayload);
      expect(generateSpy.mock.calls.length).toBe(callCountAfterFirst);
    });

    it('should save user message but not auto-reply when live takeover is active', async () => {
      const convId = 'conv_tg_takeover_' + Math.random().toString(36).substring(2, 7);
      vi.spyOn(Database, 'getOrCreateConversation').mockResolvedValue({
        id: convId,
        assistantId: dummyAssistant.id,
        visitorId: 'tg_8888',
        channel: 'telegram',
        status: 'active',
        isLiveTakeover: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);

      const saveMessageSpy = vi.spyOn(Database, 'saveMessage').mockResolvedValue({} as any);
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion');

      const updatePayload = {
        update_id: 9999902,
        message: {
          chat: { id: 8888 },
          from: { first_name: 'Human Customer' },
          text: 'Need assistance from operator',
        },
      };

      await processTelegramUpdate(dummyAssistant, updatePayload);

      // User message should be saved for the dashboard operator to see
      expect(saveMessageSpy).toHaveBeenCalledWith(convId, 'user', 'Need assistance from operator');
      // But AI generation should not be invoked
      expect(generateSpy).not.toHaveBeenCalled();
    });
  });

  describe('WhatsApp Webhook Handler', () => {
    it('should drop duplicate incoming messages with the same message id', async () => {
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion').mockResolvedValue('WhatsApp answer');
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true, messages: [{ id: 'wam_out' }] })));

      const msgId = 'wamid.HBgLMTIzNDU2Nzg5MA==';
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      id: msgId,
                      from: '1234567890',
                      text: { body: 'What are your hours?' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await processWhatsAppWebhook(dummyAssistant, webhookPayload);
      const callCountAfterFirst = generateSpy.mock.calls.length;

      // Re-delivery of the same webhook payload
      await processWhatsAppWebhook(dummyAssistant, webhookPayload);
      expect(generateSpy.mock.calls.length).toBe(callCountAfterFirst);
    });

    it('should save user message but not auto-reply when live takeover is active', async () => {
      const convId = 'conv_wa_takeover_' + Math.random().toString(36).substring(2, 7);
      vi.spyOn(Database, 'getOrCreateConversation').mockResolvedValue({
        id: convId,
        assistantId: dummyAssistant.id,
        visitorId: 'wa_1999999999',
        channel: 'whatsapp',
        status: 'active',
        isLiveTakeover: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);

      const saveMessageSpy = vi.spyOn(Database, 'saveMessage').mockResolvedValue({} as any);
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion');

      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      id: 'wamid.TAKOVER_TEST_' + Math.random().toString(36).substring(2, 6),
                      from: '1999999999',
                      text: { body: 'Can someone help me?' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await processWhatsAppWebhook(dummyAssistant, webhookPayload);

      expect(saveMessageSpy).toHaveBeenCalledWith(convId, 'user', 'Can someone help me?');
      expect(generateSpy).not.toHaveBeenCalled();
    });
  });
});

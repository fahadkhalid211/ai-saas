import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database, AssistantData } from '../db';
import { processInstagramWebhook, sendInstagramMessage } from './instagram';
import * as providers from '../ai/providers';
import * as retrieval from '../rag/retrieval';

describe('Instagram Direct Messaging Channel Handler', () => {
  const dummyAssistant: AssistantData = {
    id: 'ast_ig_test_' + Math.random().toString(36).substring(2, 7),
    workspaceId: 'ws_test_channels',
    name: 'Instagram Test Bot',
    instagramAccountId: 'ig_acc_98765',
    instagramAccessToken: 'token_ig_access',
    instagramVerifyToken: 'test_verify_secret',
    instagramEnabled: true,
    systemPrompt: 'You are an Instagram assistant.',
    welcomeMessage: 'Hello on Instagram!',
    fallbackMessage: 'Fallback message.',
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
    contextChunks: 3,
    primaryColor: '#E1306C',
    launcherPosition: 'bottom-right',
    starterQuestions: [],
    collectLeadEmail: false,
    allowedDomains: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(retrieval, 'retrieveRelevantContext').mockResolvedValue({
      contextText: 'We offer free shipping on orders over $50.',
      chunks: [{ content: 'We offer free shipping on orders over $50.' } as any],
      condensedQuery: '',
      citations: [],
    });
  });

  describe('sendInstagramMessage', () => {
    it('should return error object if access token is missing', async () => {
      const res = await sendInstagramMessage(undefined, 'ig_user_1', 'Hello');
      expect(res.success).toBe(false);
      expect(res.error).toContain('access token');
    });

    it('should send message to Meta Graph API endpoint', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ recipient_id: 'ig_user_1', message_id: 'mid.12345' }), { status: 200 })
      );

      const res = await sendInstagramMessage(dummyAssistant.instagramAccessToken, 'ig_user_1', 'Hello customer!');
      expect(res.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://graph.facebook.com/v21.0/me/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer token_ig_access',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            recipient: { id: 'ig_user_1' },
            message: { text: 'Hello customer!' },
          }),
        })
      );
    });

    it('should split long messages exceeding 1000 characters', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
        async () => new Response(JSON.stringify({ recipient_id: 'ig_user_1', message_id: 'mid.12345' }), { status: 200 })
      );

      const longText = 'A'.repeat(1500);
      const res = await sendInstagramMessage(dummyAssistant.instagramAccessToken, 'ig_user_1', longText);
      expect(res.success).toBe(true);
      expect(fetchSpy.mock.calls.length).toBe(2);
    });
  });

  describe('processInstagramWebhook', () => {
    it('should ignore message echoes from the business itself', async () => {
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion');

      const echoPayload = {
        object: 'instagram',
        entry: [
          {
            id: 'ig_acc_98765',
            messaging: [
              {
                sender: { id: 'ig_acc_98765' },
                recipient: { id: 'ig_customer_1' },
                message: {
                  mid: 'mid.echo_1',
                  text: 'Our reply to you',
                  is_echo: true,
                },
              },
            ],
          },
        ],
      };

      await processInstagramWebhook(dummyAssistant, echoPayload);
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('should drop duplicate incoming messages with the same message id (mid)', async () => {
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion').mockResolvedValue('Instagram reply');
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ recipient_id: 'ig_user_2', message_id: 'mid.out_1' }), { status: 200 })
      );

      const mid = 'mid.unique_test_' + Math.random().toString(36).substring(2, 7);
      const payload = {
        object: 'instagram',
        entry: [
          {
            id: 'ig_acc_98765',
            messaging: [
              {
                sender: { id: 'ig_user_2' },
                recipient: { id: 'ig_acc_98765' },
                message: {
                  mid,
                  text: 'Do you offer international shipping?',
                },
              },
            ],
          },
        ],
      };

      await processInstagramWebhook(dummyAssistant, payload);
      const callCountAfterFirst = generateSpy.mock.calls.length;
      expect(callCountAfterFirst).toBe(1);

      // Re-delivery of the exact same webhook payload
      await processInstagramWebhook(dummyAssistant, payload);
      expect(generateSpy.mock.calls.length).toBe(callCountAfterFirst);
    });

    it('should save user message but not auto-reply when live takeover is active', async () => {
      const convId = 'conv_ig_takeover_' + Math.random().toString(36).substring(2, 7);
      vi.spyOn(Database, 'getOrCreateConversation').mockResolvedValue({
        id: convId,
        assistantId: dummyAssistant.id,
        visitorId: 'ig_takeover_user',
        channel: 'instagram',
        status: 'active',
        isLiveTakeover: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);

      const saveMessageSpy = vi.spyOn(Database, 'saveMessage').mockResolvedValue({} as any);
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion');

      const payload = {
        object: 'instagram',
        entry: [
          {
            id: 'ig_acc_98765',
            messaging: [
              {
                sender: { id: 'ig_takeover_user' },
                recipient: { id: 'ig_acc_98765' },
                message: {
                  mid: 'mid.takeover_' + Math.random().toString(36).substring(2, 6),
                  text: 'I want to speak with a human agent',
                },
              },
            ],
          },
        ],
      };

      await processInstagramWebhook(dummyAssistant, payload);

      expect(saveMessageSpy).toHaveBeenCalledWith(convId, 'user', 'I want to speak with a human agent');
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('should capture Click-to-Instagram Direct Ad referral metadata and include in AI context', async () => {
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion').mockResolvedValue('Thanks for checking our 50% Off Ad!');
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ recipient_id: 'ig_ad_prospect', message_id: 'mid.ad_reply' }), { status: 200 })
      );

      const payload = {
        object: 'instagram',
        entry: [
          {
            id: 'ig_acc_98765',
            messaging: [
              {
                sender: { id: 'ig_ad_prospect' },
                recipient: { id: 'ig_acc_98765' },
                referral: {
                  source: 'ADS',
                  ad_id: 'ad_campaign_9999',
                  ad_title: '50% Off Black Friday Special',
                },
                message: {
                  mid: 'mid.ad_inq_' + Math.random().toString(36).substring(2, 6),
                  text: 'Is this discount still available?',
                },
              },
            ],
          },
        ],
      };

      await processInstagramWebhook(dummyAssistant, payload);

      expect(generateSpy).toHaveBeenCalled();
      const messagesArg = generateSpy.mock.calls[0][0] as any[];
      const systemMessage = messagesArg.find((m: any) => m.role === 'system')?.content || '';
      expect(systemMessage).toContain('Instagram Direct Ad Referral');
      expect(systemMessage).toContain('50% Off Black Friday Special');
    });
  });
});

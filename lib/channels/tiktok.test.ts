import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Database, AssistantData } from '../db';
import { processTikTokWebhook, sendTikTokMessage } from './tiktok';
import * as providers from '../ai/providers';
import * as retrieval from '../rag/retrieval';

describe('TikTok Direct Messaging Channel Handler', () => {
  const dummyAssistant: AssistantData = {
    id: 'ast_tt_test_' + Math.random().toString(36).substring(2, 7),
    workspaceId: 'ws_test_channels',
    name: 'TikTok Test Bot',
    tiktokBusinessId: 'tt_biz_12345',
    tiktokAccessToken: 'token_tt_access_secret',
    tiktokVerifyToken: 'test_verify_token',
    tiktokEnabled: true,
    systemPrompt: 'You are a TikTok customer assistant.',
    welcomeMessage: 'Hello from TikTok!',
    fallbackMessage: 'Fallback message.',
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
    contextChunks: 3,
    primaryColor: '#00F2FE',
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
      contextText: 'We ship within 2 business days across the country.',
      chunks: [{ content: 'We ship within 2 business days across the country.' } as any],
      condensedQuery: '',
      citations: [],
    });
  });

  describe('sendTikTokMessage', () => {
    it('should return error if access token is missing', async () => {
      const res = await sendTikTokMessage(undefined, 'tt_user_1', 'Hello');
      expect(res.success).toBe(false);
      expect(res.error).toContain('access token');
    });

    it('should send direct message to TikTok Business API endpoint', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
        async () => new Response(JSON.stringify({ code: 0, message: 'OK', data: { message_id: 'msg_987' } }), { status: 200 })
      );

      const res = await sendTikTokMessage(
        dummyAssistant.tiktokAccessToken,
        'tt_user_1',
        'Hello from TikTok bot!',
        dummyAssistant.tiktokBusinessId
      );

      expect(res.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://business-api.tiktok.com/open_api/v1.3/im/message/send/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Access-Token': 'token_tt_access_secret',
            Authorization: 'Bearer token_tt_access_secret',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            recipient_id: 'tt_user_1',
            message_type: 'text',
            content: { text: 'Hello from TikTok bot!' },
            advertiser_id: 'tt_biz_12345',
          }),
        })
      );
    });

    it('should split long messages exceeding 2000 characters', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
        async () => new Response(JSON.stringify({ code: 0, message: 'OK', data: { message_id: 'msg_split' } }), { status: 200 })
      );

      const longText = 'T'.repeat(3500);
      const res = await sendTikTokMessage(dummyAssistant.tiktokAccessToken, 'tt_user_1', longText);
      expect(res.success).toBe(true);
      expect(fetchSpy.mock.calls.length).toBe(2);
    });
  });

  describe('processTikTokWebhook', () => {
    it('should ignore message echoes from the business account', async () => {
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion');

      const echoPayload = {
        entry: [
          {
            messaging: [
              {
                sender: { id: 'tt_biz_12345' },
                recipient: { id: 'tt_customer_99' },
                message: {
                  mid: 'mid.echo_99',
                  text: 'Our reply to you',
                  is_echo: true,
                },
              },
            ],
          },
        ],
      };

      await processTikTokWebhook(dummyAssistant, echoPayload);
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('should drop duplicate incoming messages with the same message id', async () => {
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion').mockResolvedValue('TikTok answer');
      vi.spyOn(global, 'fetch').mockImplementation(
        async () => new Response(JSON.stringify({ code: 0, message: 'OK' }), { status: 200 })
      );

      const mid = 'mid.tt_uniq_' + Math.random().toString(36).substring(2, 7);
      const payload = {
        data: {
          sender_id: 'tt_shopper_44',
          message_id: mid,
          content: { text: 'How do I place an order?' },
        },
      };

      await processTikTokWebhook(dummyAssistant, payload);
      const callCountAfterFirst = generateSpy.mock.calls.length;
      expect(callCountAfterFirst).toBe(1);

      // Re-delivery of the exact same message
      await processTikTokWebhook(dummyAssistant, payload);
      expect(generateSpy.mock.calls.length).toBe(callCountAfterFirst);
    });

    it('should save user message but not auto-reply when live takeover is active', async () => {
      const convId = 'conv_tt_takeover_' + Math.random().toString(36).substring(2, 7);
      vi.spyOn(Database, 'getOrCreateConversation').mockResolvedValue({
        id: convId,
        assistantId: dummyAssistant.id,
        visitorId: 'tt_user_human_req',
        channel: 'tiktok',
        status: 'active',
        isLiveTakeover: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);

      const saveMessageSpy = vi.spyOn(Database, 'saveMessage').mockResolvedValue({} as any);
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion');

      const payload = {
        data: {
          sender_id: 'tt_user_human_req',
          message_id: 'mid.tt_takeover_' + Math.random().toString(36).substring(2, 6),
          content: { text: 'I need human manager support' },
        },
      };

      await processTikTokWebhook(dummyAssistant, payload);

      expect(saveMessageSpy).toHaveBeenCalledWith(convId, 'user', 'I need human manager support');
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('should extract TikTok Ads referral metadata and include in AI prompt context', async () => {
      const generateSpy = vi.spyOn(providers, 'generateChatCompletion').mockResolvedValue('Here is your 20% TikTok promo code!');
      vi.spyOn(global, 'fetch').mockImplementation(
        async () => new Response(JSON.stringify({ code: 0, message: 'OK' }), { status: 200 })
      );

      const payload = {
        data: {
          sender_id: 'tt_ad_lead_1',
          message_id: 'mid.tt_ad_' + Math.random().toString(36).substring(2, 6),
          content: { text: 'I saw your TikTok video ad for 20% off' },
          ad_referral: {
            source: 'TIKTOK_ADS',
            ad_id: 'tt_campaign_555',
            campaign_id: 'camp_viral_99',
            ad_title: 'Summer Viral Deal 20% Off',
          },
        },
      };

      await processTikTokWebhook(dummyAssistant, payload);

      expect(generateSpy).toHaveBeenCalled();
      const messagesArg = generateSpy.mock.calls[0][0] as any[];
      const systemMessage = messagesArg.find((m: any) => m.role === 'system')?.content || '';
      expect(systemMessage).toContain('TikTok Direct Ad Referral');
      expect(systemMessage).toContain('Summer Viral Deal 20% Off');
    });
  });
});

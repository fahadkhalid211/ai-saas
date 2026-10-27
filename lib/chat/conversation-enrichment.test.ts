import { describe, it, expect } from 'vitest';
import {
  detectLanguage,
  generateConversationTitle,
  generateConversationSummary,
  detectMessageToolsAndSkills,
  calculateConversationMetrics,
  enrichConversation,
} from './conversation-enrichment';
import { ConversationData, MessageData } from '@/lib/db';

describe('Conversation Enrichment & Intelligence', () => {
  describe('detectLanguage', () => {
    it('detects English text by default', () => {
      const res = detectLanguage('Hello, I would like to know more about your plans.');
      expect(res.code).toBe('en');
      expect(res.name).toBe('English');
    });

    it('detects Spanish text', () => {
      const res = detectLanguage('Hola, buenos días, quisiera saber el precio de los servicios por favor.');
      expect(res.code).toBe('es');
      expect(res.name).toBe('Spanish');
    });

    it('detects French text', () => {
      const res = detectLanguage('Bonjour, je voudrais prendre un rendez-vous et connaître vos prix s\'il vous plaît.');
      expect(res.code).toBe('fr');
      expect(res.name).toBe('French');
    });

    it('detects German text', () => {
      const res = detectLanguage('Hallo guten Tag, wie viel kosten die Termine und was sind Ihre Öffnungszeiten?');
      expect(res.code).toBe('de');
      expect(res.name).toBe('German');
    });

    it('detects Arabic and Urdu text', () => {
      const ar = detectLanguage('مرحبا، أود معرفة أسعار الخدمات وحجز موعد');
      expect(ar.code).toBe('ar');
      const ur = detectLanguage('ہیلو، کیا آپ مجھے قیمت اور سروسز کے بارے میں بتا سکتے ہیں؟ شکریہ');
      expect(ur.code).toBe('ur');
    });
  });

  describe('generateConversationTitle', () => {
    it('generates appointment booking title when booking intent is detected', () => {
      const msgs: MessageData[] = [
        {
          id: '1',
          conversationId: 'c1',
          role: 'user',
          content: 'Can I book an appointment for haircut tomorrow?',
          citations: [],
          tokensUsed: 10,
          createdAt: new Date().toISOString(),
        },
      ];
      const title = generateConversationTitle(msgs, 'c1');
      expect(title).toBe('Haircut & Styling Booking');
    });

    it('generates pricing inquiry title', () => {
      const msgs: MessageData[] = [
        {
          id: '1',
          conversationId: 'c2',
          role: 'user',
          content: 'How much does the plan cost?',
          citations: [],
          tokensUsed: 10,
          createdAt: new Date().toISOString(),
        },
      ];
      const title = generateConversationTitle(msgs, 'c2');
      expect(title).toBe('Pricing & Plans Inquiry');
    });

    it('generates hours and location title', () => {
      const msgs: MessageData[] = [
        {
          id: '1',
          conversationId: 'c3',
          role: 'user',
          content: 'Where are you located and what are your opening hours?',
          citations: [],
          tokensUsed: 10,
          createdAt: new Date().toISOString(),
        },
      ];
      const title = generateConversationTitle(msgs, 'c3');
      expect(title).toBe('Operating Hours & Location');
    });

    it('handles fallback gracefully when no user messages exist', () => {
      const title = generateConversationTitle([], 'conv_123456');
      expect(title).toBe('Chat #123456');
    });
  });

  describe('generateConversationSummary', () => {
    it('summarizes a conversation including booking card action', () => {
      const msgs: MessageData[] = [
        {
          id: '1',
          conversationId: 'c1',
          role: 'user',
          content: 'I want to schedule a haircut for Saturday',
          citations: [],
          tokensUsed: 10,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          conversationId: 'c1',
          role: 'assistant',
          content: 'Certainly! We would love to have you. [ACTION:BOOKING_FORM]',
          citations: [],
          tokensUsed: 25,
          createdAt: new Date().toISOString(),
        },
      ];
      const summary = generateConversationSummary(msgs, { resolved: true });
      expect(summary).toContain('Visitor inquired: "I want to schedule a haircut for Saturday".');
      expect(summary).toContain('interactive appointment booking card');
      expect(summary).toContain('Issue successfully resolved.');
    });
  });

  describe('detectMessageToolsAndSkills', () => {
    it('detects live web search skill and tool', () => {
      const msg: MessageData = {
        id: 'm1',
        conversationId: 'c1',
        role: 'assistant',
        content: 'Based on current online findings, the market rate is $45.',
        citations: [{ isLiveWebSearch: true, sourceTitle: 'Industry News', url: 'https://news.example.com' }],
        tokensUsed: 30,
        createdAt: new Date().toISOString(),
      };
      const { tools, skills } = detectMessageToolsAndSkills(msg);
      expect(skills).toContain('Web Search');
      expect(tools.some((t) => t.name === 'web_search')).toBe(true);
      expect(tools.find((t) => t.name === 'web_search')?.output.sourcesFound).toBe(1);
    });

    it('detects appointment booking tool', () => {
      const msg: MessageData = {
        id: 'm2',
        conversationId: 'c1',
        role: 'assistant',
        content: 'Please pick your slot below: [ACTION:BOOKING_FORM]',
        citations: [],
        tokensUsed: 20,
        createdAt: new Date().toISOString(),
      };
      const { tools, skills } = detectMessageToolsAndSkills(msg);
      expect(skills).toContain('Appointment Scheduler');
      expect(tools.some((t) => t.name === 'book_appointment')).toBe(true);
    });

    it('detects live human takeover for agent messages', () => {
      const msg: MessageData = {
        id: 'm3',
        conversationId: 'c1',
        role: 'agent',
        senderName: 'Sarah Connor',
        content: 'Hi there! I am taking over this conversation to assist you.',
        citations: [],
        tokensUsed: 15,
        createdAt: new Date().toISOString(),
      };
      const { tools, skills } = detectMessageToolsAndSkills(msg);
      expect(skills).toContain('Human Operator Takeover');
      expect(tools.some((t) => t.name === 'live_operator_takeover')).toBe(true);
    });
  });

  describe('enrichConversation', () => {
    it('guarantees title, language, summary, rating, usage, and tool traces on conversation', () => {
      const rawConv: ConversationData = {
        id: 'conv_abc123',
        assistantId: 'ast_1',
        status: 'bot',
        resolved: false,
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'm1',
            conversationId: 'conv_abc123',
            role: 'user',
            content: 'How much are the plans for a small team?',
            citations: [],
            tokensUsed: 15,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'm2',
            conversationId: 'conv_abc123',
            role: 'assistant',
            content: 'Our team plan starts at $29/mo with full AI agent capabilities.',
            citations: [{ sourceTitle: 'Pricing Documentation' }],
            tokensUsed: 40,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const enriched = enrichConversation(rawConv, { provider: 'groq', modelName: 'llama-3.3-70b' });

      expect(enriched.title).toBe('Pricing & Plans Inquiry');
      expect(enriched.language).toBe('English');
      expect(enriched.summary).toContain('Visitor inquired: "How much are the plans for a small team?".');
      expect(enriched.rating).toBeGreaterThanOrEqual(4.0);
      expect(enriched.tokensUsed).toBe(55);
      expect(enriched.costUsd).toBeGreaterThanOrEqual(0);

      // Verify messages have tools and skills
      const assistantMsg = enriched.messages?.find((m) => m.role === 'assistant');
      expect(assistantMsg?.skillsUsed?.length).toBeGreaterThan(0);
      expect(assistantMsg?.toolsUsed?.length).toBeGreaterThan(0);
    });
  });
});

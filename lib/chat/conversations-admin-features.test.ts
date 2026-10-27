import { describe, it, expect } from 'vitest';
import {
  enrichConversation,
  detectLanguage,
  generateConversationTitle,
  generateConversationSummary,
  detectMessageToolsAndSkills,
  calculateConversationMetrics,
} from './conversation-enrichment';
import { ConversationData, MessageData } from '@/lib/db';

describe('Admin Conversation Features', () => {
  const sampleAssistant = {
    id: 'asst_haircut',
    name: 'Crown Barber',
    provider: 'groq',
    modelName: 'llama-3.3-70b',
  };

  const sampleConversations: ConversationData[] = [
    {
      id: 'conv_1',
      assistantId: 'asst_haircut',
      visitorId: 'visitor_john',
      status: 'bot',
      resolved: false,
      createdAt: '2026-10-25T10:00:00.000Z',
      messages: [
        {
          id: 'm1',
          conversationId: 'conv_1',
          role: 'user',
          content: 'Hello, what are your opening hours and where are you located?',
          citations: [],
          tokensUsed: 15,
          createdAt: '2026-10-25T10:00:00.000Z',
        },
        {
          id: 'm2',
          conversationId: 'conv_1',
          role: 'assistant',
          content: 'We are open Monday to Saturday from 9 AM to 7 PM on Main Street.',
          citations: [{ sourceTitle: 'Barber Business Profile' }],
          tokensUsed: 35,
          createdAt: '2026-10-25T10:00:05.000Z',
        },
      ],
    },
    {
      id: 'conv_2',
      assistantId: 'asst_haircut',
      visitorId: 'visitor_maria',
      status: 'waiting_for_agent',
      escalated: true,
      resolved: false,
      sentiment: 'urgent',
      createdAt: '2026-10-25T11:00:00.000Z',
      messages: [
        {
          id: 'm3',
          conversationId: 'conv_2',
          role: 'user',
          content: 'I need to speak to a human representative right away about a refund',
          citations: [],
          tokensUsed: 18,
          createdAt: '2026-10-25T11:00:00.000Z',
        },
        {
          id: 'm4',
          conversationId: 'conv_2',
          role: 'assistant',
          content: 'I have alerted our live support team and connected your session. A human representative will join shortly.',
          citations: [],
          tokensUsed: 30,
          createdAt: '2026-10-25T11:00:03.000Z',
        },
      ],
    },
    {
      id: 'conv_3',
      assistantId: 'asst_haircut',
      visitorId: 'visitor_pierre',
      status: 'resolved',
      resolved: true,
      sentiment: 'positive',
      rating: 5.0,
      createdAt: '2026-10-25T12:00:00.000Z',
      messages: [
        {
          id: 'm5',
          conversationId: 'conv_3',
          role: 'user',
          content: 'Bonjour, je voudrais réserver un créneau pour une coupe de cheveux s\'il vous plaît',
          citations: [],
          tokensUsed: 22,
          createdAt: '2026-10-25T12:00:00.000Z',
        },
        {
          id: 'm6',
          conversationId: 'conv_3',
          role: 'assistant',
          content: 'Avec plaisir ! Veuillez choisir votre date et créneau horaire : [ACTION:BOOKING_FORM]',
          citations: [{ sourceTitle: 'Services Catalog' }],
          tokensUsed: 40,
          createdAt: '2026-10-25T12:00:04.000Z',
        },
      ],
    },
    {
      id: 'conv_4',
      assistantId: 'asst_haircut',
      visitorId: 'visitor_web',
      status: 'live_agent',
      isLiveTakeover: true,
      assignedAgentName: 'Alex (Support)',
      createdAt: '2026-10-25T13:00:00.000Z',
      messages: [
        {
          id: 'm7',
          conversationId: 'conv_4',
          role: 'user',
          content: 'What does the current regulation say about organic beard oil?',
          citations: [],
          tokensUsed: 14,
          createdAt: '2026-10-25T13:00:00.000Z',
        },
        {
          id: 'm8',
          conversationId: 'conv_4',
          role: 'assistant',
          content: 'Let me look that up for you online.',
          citations: [{ isLiveWebSearch: true, sourceTitle: 'Cosmetic Standards 2026', url: 'https://fda.gov/standards' }],
          tokensUsed: 28,
          createdAt: '2026-10-25T13:00:03.000Z',
        },
        {
          id: 'm9',
          conversationId: 'conv_4',
          role: 'agent',
          senderName: 'Alex (Support)',
          content: 'Hello, Alex here. I can also confirm that our products are 100% certified organic.',
          citations: [],
          tokensUsed: 22,
          createdAt: '2026-10-25T13:01:00.000Z',
        },
      ],
    },
  ];

  it('Feature 1: Computes conversations, ratings, usage, and AI cost at a glance', () => {
    const enrichedList = sampleConversations.map((c) => enrichConversation(c, sampleAssistant));

    let totalTokens = 0;
    let totalCost = 0;
    let sumRating = 0;
    let waitingCount = 0;
    let liveCount = 0;
    let resolvedCount = 0;
    let botCount = 0;

    for (const c of enrichedList) {
      totalTokens += c.tokensUsed || 0;
      totalCost += c.costUsd || 0;
      sumRating += c.rating || 5.0;

      if (c.status === 'waiting_for_agent') waitingCount++;
      else if (c.status === 'live_agent') liveCount++;
      else if (c.status === 'resolved') resolvedCount++;
      else botCount++;
    }

    expect(enrichedList.length).toBe(4);
    expect(waitingCount).toBe(1);
    expect(liveCount).toBe(1);
    expect(resolvedCount).toBe(1);
    expect(botCount).toBe(1);

    const avgRating = sumRating / enrichedList.length;
    expect(avgRating).toBeGreaterThanOrEqual(4.0);
    expect(totalTokens).toBeGreaterThan(0);
    expect(totalCost).toBeGreaterThanOrEqual(0);
  });

  it('Feature 2: Supports searching and filtering conversations by status', () => {
    const enrichedList = sampleConversations.map((c) => enrichConversation(c, sampleAssistant));

    // Filter by 'waiting_for_agent'
    const waitingOnly = enrichedList.filter((c) => c.status === 'waiting_for_agent');
    expect(waitingOnly.length).toBe(1);
    expect(waitingOnly[0].visitorId).toBe('visitor_maria');

    // Filter by 'live_agent'
    const liveOnly = enrichedList.filter((c) => c.status === 'live_agent');
    expect(liveOnly.length).toBe(1);
    expect(liveOnly[0].isLiveTakeover).toBe(true);

    // Filter by 'resolved'
    const resolvedOnly = enrichedList.filter((c) => c.status === 'resolved');
    expect(resolvedOnly.length).toBe(1);
    expect(resolvedOnly[0].visitorId).toBe('visitor_pierre');

    // Search by keyword in title/summary/content
    const searchQuery = 'refund';
    const searched = enrichedList.filter((c) =>
      c.title?.toLowerCase().includes(searchQuery) ||
      c.summary?.toLowerCase().includes(searchQuery) ||
      (c.messages || []).some((m) => m.content.toLowerCase().includes(searchQuery))
    );
    expect(searched.length).toBe(1);
    expect(searched[0].id).toBe('conv_2');
  });

  it('Feature 3: Every conversation receives a title, language, and AI summary', () => {
    const enrichedList = sampleConversations.map((c) => enrichConversation(c, sampleAssistant));

    for (const c of enrichedList) {
      // Must have title
      expect(c.title).toBeDefined();
      expect(typeof c.title).toBe('string');
      expect(c.title?.length).toBeGreaterThan(0);

      // Must have language
      expect(c.language).toBeDefined();
      expect(typeof c.language).toBe('string');

      // Must have AI summary
      expect(c.summary).toBeDefined();
      expect(typeof c.summary).toBe('string');
      expect(c.summary?.length).toBeGreaterThan(0);
    }

    // Specific language checks
    expect(enrichedList[0].language).toBe('English');
    expect(enrichedList[2].language).toBe('French');

    // Specific title checks
    expect(enrichedList[0].title).toBe('Operating Hours & Location');
    expect(enrichedList[1].title).toBe('Billing & Refund Inquiry');
    expect(enrichedList[2].title).toBe('Haircut & Styling Booking');
  });

  it('Feature 4: Full transcripts show which skills and tools the agent used', () => {
    const enrichedList = sampleConversations.map((c) => enrichConversation(c, sampleAssistant));

    // Conversation 3 should show Appointment Scheduler tool
    const conv3AssistantMsg = enrichedList[2].messages?.find((m) => m.role === 'assistant');
    expect(conv3AssistantMsg).toBeDefined();
    expect(conv3AssistantMsg?.skillsUsed).toContain('Appointment Scheduler');
    expect(conv3AssistantMsg?.toolsUsed?.some((t) => t.name === 'book_appointment')).toBe(true);

    // Conversation 4 should show Web Search and Live Takeover tools
    const conv4AssistantMsg = enrichedList[3].messages?.find((m) => m.role === 'assistant');
    expect(conv4AssistantMsg?.skillsUsed).toContain('Web Search');
    expect(conv4AssistantMsg?.toolsUsed?.some((t) => t.name === 'web_search')).toBe(true);

    const conv4AgentMsg = enrichedList[3].messages?.find((m) => m.role === 'agent');
    expect(conv4AgentMsg?.skillsUsed).toContain('Human Operator Takeover');
    expect(conv4AgentMsg?.toolsUsed?.some((t) => t.name === 'live_operator_takeover')).toBe(true);
  });
});

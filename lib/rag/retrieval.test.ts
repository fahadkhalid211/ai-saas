import { describe, it, expect } from 'vitest';
import { cosineSimilarity, keywordRelevance, reciprocalRankFusion } from './vector-math';

describe('Vector Math and Hybrid Retrieval', () => {
  describe('cosineSimilarity', () => {
    it('should return 1.0 for identical vectors', () => {
      const vec = [0.5, 0.5, 0.5, 0.5];
      const similarity = cosineSimilarity(vec, vec);
      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should return 0.0 for orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      const similarity = cosineSimilarity(vecA, vecB);
      expect(similarity).toBeCloseTo(0.0, 5);
    });

    it('should return 0 for empty or mismatched vectors', () => {
      expect(cosineSimilarity([], [])).toBe(0);
      expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    });
  });

  describe('keywordRelevance', () => {
    it('should return 1.0 when all query terms match content', () => {
      const score = keywordRelevance('pricing plans', 'Our pricing plans are flexible.');
      expect(score).toBe(1.0);
    });

    it('should return fractional score for partial matches', () => {
      const score = keywordRelevance('pricing enterprise plans', 'We offer affordable pricing.');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1.0);
    });

    it('should match compound words and synonyms (e.g. studenthelp vs The Students Help)', () => {
      const content = 'Project Name: The Students Help. Total project budget is $50,000 for web development.';
      const scoreExact = keywordRelevance('what is the budget of The Students Help', content);
      const scoreCompound = keywordRelevance('what is the budget of studenthelp', content);
      expect(scoreExact).toBeGreaterThan(0.5);
      expect(scoreCompound).toBeGreaterThan(0.5);
    });

    it('should match pricing and currency synonyms (e.g. price vs $20 for a haircut)', () => {
      const content = '$20 for a haircut, $50 for a beard and haircut both';
      const scorePrice = keywordRelevance('what is the price', content);
      const scoreHaircut = keywordRelevance('how much for a haircut', content);
      expect(scorePrice).toBeGreaterThan(0);
      expect(scoreHaircut).toBeGreaterThan(0);
    });

    it('should match multi-industry synonyms across healthcare, legal, real estate, and saas', () => {
      // Healthcare & Dental
      const dentalContent = 'We offer teeth cleaning, cavity treatment, and dental crowns.';
      expect(keywordRelevance('dentist appointment', dentalContent)).toBeGreaterThan(0);

      // Legal
      const legalContent = 'Our law firm handles contract disputes, litigation, and attorney counsel.';
      expect(keywordRelevance('lawyer consultation', legalContent)).toBeGreaterThan(0);

      // Real Estate
      const realEstateContent = 'Browse luxury homes, condos, and apartment listings for lease.';
      expect(keywordRelevance('property for rent', realEstateContent)).toBeGreaterThan(0);

      // Fitness & Gym
      const gymContent = 'Daily fitness classes with a certified personal trainer.';
      expect(keywordRelevance('workout coach', gymContent)).toBeGreaterThan(0);

      // SaaS
      const saasContent = 'Enterprise software platform with webhook and api integrations.';
      expect(keywordRelevance('app subscription features', saasContent)).toBeGreaterThan(0);
    });
  });

  describe('reciprocalRankFusion (RRF)', () => {
    it('should merge vector and keyword ranked lists', () => {
      const vectorResults = [
        { id: 'doc-1', score: 0.95 },
        { id: 'doc-2', score: 0.85 },
      ];

      const keywordResults = [
        { id: 'doc-2', score: 0.90 },
        { id: 'doc-3', score: 0.80 },
      ];

      const fused = reciprocalRankFusion(vectorResults, keywordResults, 60);
      expect(fused.length).toBe(3);
      // doc-2 was in both lists, so its combined RRF score should rank it at the top
      expect(fused[0].id).toBe('doc-2');
      expect(fused[0].rrfScore).toBeGreaterThan(fused[1].rrfScore);
    });
  });

  describe('Embedding LRU Cache', () => {
    it('should cache and retrieve embeddings with normalized queries', async () => {
      const { getCachedEmbedding, setCachedEmbedding, clearEmbeddingCache } = await import('./retrieval');
      clearEmbeddingCache();

      const query = '  What Are   Your Prices? ';
      const dummyVec = [0.1, 0.2, 0.3];

      expect(getCachedEmbedding(query)).toBeNull();

      setCachedEmbedding(query, dummyVec);

      // Same query with different whitespace/casing should hit the cache
      const cached = getCachedEmbedding('what are your prices?');
      expect(cached).toEqual(dummyVec);
    });
  });

  describe('Retrieval Result Cache', () => {
    it('should cache and retrieve retrieval results with normalized query and assistantId', async () => {
      const { getCachedRetrieval, setCachedRetrieval, clearRetrievalCache } = await import('./retrieval');
      clearRetrievalCache();

      const assistantId = 'asst-123';
      const query = 'What are your hours?';
      const mockResult = {
        condensedQuery: query,
        chunks: [
          {
            id: 'chk-1',
            knowledgeSourceId: 'src-1',
            content: 'Open 9-5',
            chunkIndex: 0,
            tokenCount: 10,
            metadata: { sourceTitle: 'Hours', sourceType: 'txt' },
            similarity: 0.95,
          },
        ],
        contextText: 'We are open 9am-5pm Monday to Friday.',
        citations: [{ sourceTitle: 'Hours', sourceType: 'txt', chunkIndex: 0, preview: 'Open 9-5' }],
      };

      expect(getCachedRetrieval(assistantId, query)).toBeNull();

      setCachedRetrieval(assistantId, query, mockResult);

      // Same query with whitespace/casing should hit cache
      const cached = getCachedRetrieval(assistantId, '  what are your HOURS?  ');
      expect(cached).not.toBeNull();
      expect(cached?.contextText).toBe(mockResult.contextText);
      expect(cached?.chunks.length).toBe(1);

      // Different assistant or query should miss cache
      expect(getCachedRetrieval('different-asst', query)).toBeNull();
      expect(getCachedRetrieval(assistantId, 'what are your prices?')).toBeNull();
    });
  });

  describe('Conversational Retrieval Gating', () => {
    it('should identify greetings, farewells, acknowledgments, and booking slot-filling as purely conversational', async () => {
      const { isPurelyConversationalTurn } = await import('./retrieval');

      // Greetings
      expect(isPurelyConversationalTurn('hello')).toBe(true);
      expect(isPurelyConversationalTurn('Hi there!')).toBe(true);
      expect(isPurelyConversationalTurn('Good morning')).toBe(true);
      expect(isPurelyConversationalTurn('Hey')).toBe(true);

      // Closings & Thanks
      expect(isPurelyConversationalTurn('Thank you so much!')).toBe(true);
      expect(isPurelyConversationalTurn('thanks')).toBe(true);
      expect(isPurelyConversationalTurn('have a great day')).toBe(true);
      expect(isPurelyConversationalTurn('bye')).toBe(true);

      // Acknowledgments
      expect(isPurelyConversationalTurn('ok got it')).toBe(true);
      expect(isPurelyConversationalTurn('sure')).toBe(true);
      expect(isPurelyConversationalTurn('sounds good')).toBe(true);
      expect(isPurelyConversationalTurn('yes')).toBe(true);
      expect(isPurelyConversationalTurn('no problem')).toBe(true);

      // Slot filling (email, phone, dates)
      expect(isPurelyConversationalTurn('john.doe@example.com')).toBe(true);
      expect(isPurelyConversationalTurn('+1 (555) 234-5678')).toBe(true);
      expect(isPurelyConversationalTurn('tomorrow at 3pm')).toBe(true);
    });

    it('should identify substantive knowledge queries as NOT purely conversational', async () => {
      const { isPurelyConversationalTurn } = await import('./retrieval');

      expect(isPurelyConversationalTurn('What are your pricing plans?')).toBe(false);
      expect(isPurelyConversationalTurn('How much does teeth whitening cost?')).toBe(false);
      expect(isPurelyConversationalTurn('Where is your office located?')).toBe(false);
      expect(isPurelyConversationalTurn('Do you provide corporate legal consulting?')).toBe(false);
      expect(isPurelyConversationalTurn('Explain your refund policy')).toBe(false);
    });
  });

  describe('Automated Universal Synonym Retrieval', () => {
    it('retrieves knowledge base chunks when user asks with look-alike synonym keywords like ai tech for AI platforms', async () => {
      const { retrieveRelevantContext, clearRetrievalCache } = await import('./retrieval');
      const { Database } = await import('../db');
      clearRetrievalCache();

      // Create an assistant and add knowledge source titled "AI platforms"
      const asst = await Database.createAssistant({
        name: 'Tech Advisor',
        systemPrompt: 'You are an AI tech advisor.',
      });

      const source = await Database.createKnowledgeSource({
        assistantId: asst.id,
        title: 'AI platforms',
        type: 'text',
        chunkCount: 1,
        status: 'ready',
      });

      const dummyEmbedding = new Array(384).fill(0.05);
      await Database.saveChunks([
        {
          assistantId: asst.id,
          knowledgeSourceId: source.id,
          chunkIndex: 0,
          content: 'The premier AI platforms include Crescelo, OpenAI platform, and Anthropic Claude for building intelligent enterprise agents.',
          tokenCount: 20,
          metadata: {
            sourceTitle: 'AI platforms',
            sourceType: 'text',
          },
          embedding: dummyEmbedding,
        },
      ]);

      // User asks "what are best ai tech" (synonymous terms: tech ~ platform, best ~ premier)
      const result = await retrieveRelevantContext(asst.id, 'what are best ai tech');

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.contextText).toContain('AI platforms');
      expect(result.contextText).toContain('Crescelo');
    }, 20000);
  });
});


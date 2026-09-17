import { describe, it, expect } from 'vitest';
import { crossScoreRelevance, deduplicateChunks, rerankCandidates } from './rerank';
import { SearchResultChunk } from './types';

describe('Reranker Layer & Near-Duplicate Deduplication', () => {
  describe('crossScoreRelevance', () => {
    it('should award higher score when query terms match chunk heading and title', () => {
      const chunkWithHeading: SearchResultChunk = {
        id: 'chunk-1',
        content: 'Our standard tier includes 24/7 customer support and automatic backups.',
        chunkIndex: 0,
        tokenCount: 20,
        knowledgeSourceId: 'src-1',
        similarity: 0.5,
        metadata: {
          sourceTitle: 'SaaS Pricing Guide',
          sourceType: 'doc',
          section: 'Pricing & Plans',
        },
      };

      const chunkWithoutHeading: SearchResultChunk = {
        id: 'chunk-2',
        content: 'Our standard tier includes 24/7 customer support and automatic backups.',
        chunkIndex: 1,
        tokenCount: 20,
        knowledgeSourceId: 'src-1',
        similarity: 0.5,
        metadata: {
          sourceTitle: 'General Info',
          sourceType: 'doc',
          section: 'Miscellaneous',
        },
      };

      const scoreWith = crossScoreRelevance('what are the pricing plans', chunkWithHeading);
      const scoreWithout = crossScoreRelevance('what are the pricing plans', chunkWithoutHeading);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });

    it('should reward exact phrase matching and sentence proximity', () => {
      const chunkPhrase: SearchResultChunk = {
        id: 'chunk-3',
        content: 'The company refund policy provides a full money back guarantee within 30 days of purchase.',
        chunkIndex: 0,
        tokenCount: 25,
        knowledgeSourceId: 'src-1',
        similarity: 0.5,
        metadata: { sourceTitle: 'Doc', sourceType: 'doc', section: 'Sec' },
      };

      const chunkScattered: SearchResultChunk = {
        id: 'chunk-4',
        content: 'Refunds are rare. In another department, our policy is to inspect items before purchase.',
        chunkIndex: 1,
        tokenCount: 25,
        knowledgeSourceId: 'src-1',
        similarity: 0.5,
        metadata: { sourceTitle: 'Doc', sourceType: 'doc', section: 'Sec' },
      };

      const scorePhrase = crossScoreRelevance('refund policy', chunkPhrase);
      const scoreScattered = crossScoreRelevance('refund policy', chunkScattered);

      expect(scorePhrase).toBeGreaterThan(scoreScattered);
    });
  });

  describe('deduplicateChunks', () => {
    it('should drop near-duplicate chunks with high textual overlap', () => {
      const chunkA: SearchResultChunk = {
        id: 'chunk-a',
        content: 'Our dental clinic provides comprehensive teeth cleaning, whitening, and cavity filling services Monday to Saturday.',
        chunkIndex: 0,
        tokenCount: 20,
        knowledgeSourceId: 'src-1',
        similarity: 0.9,
        metadata: { sourceTitle: 'Services', sourceType: 'doc', section: 'Dental' },
      };

      // Almost identical duplicate from overlapping window
      const chunkB: SearchResultChunk = {
        id: 'chunk-b',
        content: 'Our dental clinic provides comprehensive teeth cleaning, whitening, and cavity filling services Monday to Saturday. Appointments available.',
        chunkIndex: 1,
        tokenCount: 22,
        knowledgeSourceId: 'src-1',
        similarity: 0.88,
        metadata: { sourceTitle: 'Services', sourceType: 'doc', section: 'Dental' },
      };

      // Completely distinct chunk
      const chunkC: SearchResultChunk = {
        id: 'chunk-c',
        content: 'Payment methods accepted include Visa, MasterCard, Apple Pay, and interest-free installment plans.',
        chunkIndex: 2,
        tokenCount: 20,
        knowledgeSourceId: 'src-1',
        similarity: 0.80,
        metadata: { sourceTitle: 'Billing', sourceType: 'doc', section: 'Payments' },
      };

      const deduped = deduplicateChunks([chunkA, chunkB, chunkC]);
      expect(deduped.length).toBe(2);
      expect(deduped[0].id).toBe('chunk-a');
      expect(deduped[1].id).toBe('chunk-c');
    });
  });

  describe('rerankCandidates', () => {
    it('should promote the chunk that precisely answers the query', () => {
      const candidates: SearchResultChunk[] = [
        {
          id: 'vague-top-rank',
          content: 'We offer many great options across our facility for all clients and members.',
          chunkIndex: 0,
          tokenCount: 20,
          knowledgeSourceId: 'src-1',
          similarity: 0.95,
          metadata: { sourceTitle: 'Overview', sourceType: 'doc', section: 'Welcome' },
        },
        {
          id: 'precise-target',
          content: 'Our root canal therapy costs $450 and includes local anesthesia and follow-up consultation.',
          chunkIndex: 1,
          tokenCount: 20,
          knowledgeSourceId: 'src-1',
          similarity: 0.85,
          metadata: { sourceTitle: 'Price Menu', sourceType: 'doc', section: 'Root Canal Therapy' },
        },
      ];

      const reranked = rerankCandidates('what is the cost of root canal therapy', candidates, 2);
      expect(reranked.length).toBe(2);
      // The precise target should be elevated to top position
      expect(reranked[0].id).toBe('precise-target');
    });
  });
});

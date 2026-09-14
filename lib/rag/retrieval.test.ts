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

    it('should return 0 for unrelated content', () => {
      const score = keywordRelevance('refund policy', 'Welcome to our restaurant menu.');
      expect(score).toBe(0);
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
});

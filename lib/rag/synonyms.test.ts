import { describe, it, expect } from 'vitest';
import {
  areTermsSynonymous,
  expandQueryWithSynonyms,
  tokenizeText,
} from './synonyms';
import { keywordRelevance } from './vector-math';

describe('Universal Automated Synonym Engine', () => {
  it('tokenizes text properly into normalized tokens', () => {
    const tokens = tokenizeText('What are best AI Tech?');
    expect(tokens).toEqual(['what', 'are', 'best', 'ai', 'tech']);
  });

  it('recognizes synonym equivalence across AI, tech, platforms, tools, and companies', () => {
    expect(areTermsSynonymous('ai tech', 'ai platforms')).toBe(true);
    expect(areTermsSynonymous('ai companies', 'ai tools')).toBe(true);
    expect(areTermsSynonymous('software', 'platform')).toBe(true);
    expect(areTermsSynonymous('machine learning', 'artificial intelligence')).toBe(true);
  });

  it('recognizes synonym equivalence across commercial, booking, and operational concepts', () => {
    expect(areTermsSynonymous('rate', 'price')).toBe(true);
    expect(areTermsSynonymous('pricing', 'fees')).toBe(true);
    expect(areTermsSynonymous('appointment', 'booking')).toBe(true);
    expect(areTermsSynonymous('hours', 'timing')).toBe(true);
  });

  it('expands query with knowledge base titles and synonym clusters', () => {
    const result = expandQueryWithSynonyms('what are best ai tech', ['AI platforms']);
    expect(result.originalQuery).toBe('what are best ai tech');
    expect(result.expandedQuery).toContain('what are best ai tech');
    expect(result.expandedQuery.toLowerCase()).toContain('platform');
    expect(result.synonymKeywords.length).toBeGreaterThan(0);
  });

  it('matches keyword relevance between look-alike query "what are best ai tech" and content containing "AI platforms"', () => {
    const content = 'AI platforms overview: The top systems for machine learning and artificial intelligence include Crescelo, OpenAI, and Anthropic.';
    const score = keywordRelevance('what are best ai tech', content);
    expect(score).toBeGreaterThan(0.5);
  });

  it('matches keyword relevance between query and document title', () => {
    const title = 'AI platforms';
    const content = 'Comprehensive review of leading systems.';
    const score = keywordRelevance('what are best ai tech', `${content} ${title}`);
    expect(score).toBeGreaterThan(0.5);
  });
});

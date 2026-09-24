import { describe, it, expect, beforeEach } from 'vitest';
import { resolveFollowUp, isFollowUp, prepareQuery, parseRewrite, fuseRankings, _resetQueryPrepCache } from './query-prep';
import type { SearchResultChunk } from './types';

const history = [
  { role: 'user', content: 'Tell me about the Growth plan' },
  { role: 'assistant', content: 'The Growth plan costs $149 per month.' },
];
const chunk = (id: string, similarity = 0.5) => ({ id, content: id, chunkIndex: 0, tokenCount: 1, metadata: {}, similarity }) as SearchResultChunk;

describe('follow-up resolution', () => {
  it('detects messages that need the previous turn', () => {
    expect(isFollowUp('and how many assistants does it include?')).toBe(true);
    expect(isFollowUp('what about shipping')).toBe(true);
    expect(isFollowUp('How much does an extra chat session cost on the Growth plan?')).toBe(false);
  });

  it('adds the previous user question, not the assistant reply', () => {
    expect(resolveFollowUp('and how many assistants does it include?', history)).toBe(
      'Tell me about the Growth plan and how many assistants does it include?'
    );
  });

  it('leaves standalone questions and first messages alone', () => {
    expect(resolveFollowUp('How do I connect WhatsApp to my assistant today?', history)).toContain('WhatsApp');
    expect(resolveFollowUp('How do I connect WhatsApp to my assistant today?', history).startsWith('Tell me')).toBe(false);
    expect(resolveFollowUp('what about it', [])).toBe('what about it');
  });
});

describe('LLM rewrite', () => {
  beforeEach(() => _resetQueryPrepCache());

  it('parses model output, tolerating surrounding text', () => {
    expect(parseRewrite('Sure! {"standalone":"What does Growth include?","alternatives":["Growth plan features","", 5]}')).toEqual({
      standalone: 'What does Growth include?',
      alternatives: ['Growth plan features'],
    });
    expect(parseRewrite('no json')).toBeNull();
    expect(parseRewrite('{"alternatives":[]}')).toBeNull();
  });

  it('uses the rewrite when the model answers', async () => {
    const p = await prepareQuery('and its price?', history, {
      complete: async () => '{"standalone":"What is the price of the Growth plan?","alternatives":["Growth plan cost per month"]}',
    });
    expect(p).toEqual({ query: 'What is the price of the Growth plan?', variants: ['Growth plan cost per month'], rewritten: true });
  });

  it('falls back to the deterministic query when the model fails or is garbage', async () => {
    const failing = await prepareQuery('and its price?', history, { complete: async () => { throw new Error('boom'); } });
    expect(failing.rewritten).toBe(false);
    expect(failing.query).toBe('Tell me about the Growth plan and its price?');
    _resetQueryPrepCache();
    const garbage = await prepareQuery('and its price?', history, { complete: async () => 'not json' });
    expect(garbage.rewritten).toBe(false);
  });
});

describe('fuseRankings', () => {
  it('raises a chunk found by several phrasings', () => {
    const fused = fuseRankings([[chunk('a'), chunk('b')], [chunk('c'), chunk('b')]], 3);
    expect(fused[0].id).toBe('b');
    expect(fused).toHaveLength(3);
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { crossEncoderEnabled, crossEncoderRerank } from './cross-encoder';
import type { SearchResultChunk } from './types';

const c = (id: string) => ({ id, content: id, chunkIndex: 0, tokenCount: 1, metadata: {}, similarity: 0.5 }) as SearchResultChunk;

describe('cross-encoder re-ranker', () => {
  afterEach(() => {
    delete process.env.RAG_RERANKER;
  });

  it('is off unless enabled', () => {
    expect(crossEncoderEnabled()).toBe(false);
    process.env.RAG_RERANKER = 'cross-encoder';
    expect(crossEncoderEnabled()).toBe(true);
  });

  it('returns a single candidate untouched without loading a model', async () => {
    const one = [c('a')];
    expect(await crossEncoderRerank('q', one, 5)).toBe(one);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./embedder', () => ({
  localEmbeddingsReady: async () => true,
  generateEmbeddingsBatch: async (texts: string[]) => texts.map(() => new Array(384).fill(0.05)),
  generateEmbedding: async () => new Array(384).fill(0.05),
}));

import { Database } from '@/lib/db';
import { reembedStaleChunks } from './reembed';

afterEach(() => {
  delete process.env.EMBEDDING_MODEL;
});

describe('rebuilding vectors after a model change', () => {
  it('rebuilds only the chunks made by another model, tags them, and leaves nothing waiting', async () => {
    const assistantId = 'reembed-test-' + Math.random().toString(36).slice(2, 7);
    const vec = new Array(384).fill(0.01);
    await Database.saveChunks([0, 1, 2].map((i) => ({ assistantId, knowledgeSourceId: 's1', content: `passage number ${i} about prices`, chunkIndex: i, tokenCount: 6, metadata: {}, embedding: vec })));
    const mineBefore = await Database.getChunksByAssistant(assistantId);
    expect(mineBefore.every((c) => (c.metadata.embModel ?? 'bge-small-en-v1.5') === 'bge-small-en-v1.5')).toBe(true); // written by the current model

    process.env.EMBEDDING_MODEL = 'Xenova/multilingual-e5-small';
    const before = await Database.countStaleEmbeddingChunks();
    expect(before).toBeGreaterThanOrEqual(3);

    const result = await reembedStaleChunks({ limit: 1000, budgetMs: 20_000 });
    expect(result.profile).toBe('multilingual-e5-small');
    expect(result.reembedded).toBeGreaterThanOrEqual(3);
    expect(result.remaining).toBe(0);
    const mine = await Database.getChunksByAssistant(assistantId);
    expect(mine.every((c) => c.metadata.embModel === 'multilingual-e5-small')).toBe(true);
  }, 60000);

  it('searches by words only while old vectors wait, and never compares vectors of different models', async () => {
    const assistantId = 'mixed-test-' + Math.random().toString(36).slice(2, 7);
    const vec = new Array(384).fill(0.05);
    await Database.saveChunks([{ assistantId, knowledgeSourceId: 's1', content: 'The colour treatment costs 95 dollars', chunkIndex: 0, tokenCount: 7, metadata: {}, embedding: vec }]);
    process.env.EMBEDDING_MODEL = 'Xenova/multilingual-e5-small';
    const hits = await Database.hybridSearch(assistantId, 'colour treatment price', vec, 5);
    expect(hits.length).toBe(1); // found by its words
    expect(hits[0].vectorScore).toBe(0); // its old vector was not used
  });
});

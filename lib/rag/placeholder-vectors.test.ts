import { afterEach, describe, expect, it, vi } from 'vitest';

// the model cannot load, as on a server where its native library is missing
vi.mock('@xenova/transformers', () => ({
  env: {},
  pipeline: async () => {
    throw new Error('libonnxruntime.so.1.14.0: cannot open shared object file: No such file or directory');
  },
}));

import { Database } from '@/lib/db';
import { generateEmbedding, generateEmbeddingsBatch, localEmbeddingsReady } from './embedder';
import { PLACEHOLDER_PROFILE_ID, markEmbeddingModel, vectorTag, _resetEmbeddingModelStateForTesting, embeddingProfile } from './embedding-profile';

afterEach(() => {
  _resetEmbeddingModelStateForTesting();
});

describe('vectors made while the embedding model cannot load', () => {
  it('are stand-ins with no negative component, which is how the database tells them apart', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(await localEmbeddingsReady()).toBe(false);
    const vec = await generateEmbedding('Cuts are 30 dollars and colour is 95 dollars.', 'passage');
    expect(vec).toHaveLength(384);
    expect(vec.every((x) => x >= 0)).toBe(true);
    expect(vectorTag()).toBe(PLACEHOLDER_PROFILE_ID);
  });

  it('are stored under the placeholder tag and wait for a rebuild', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const assistantId = 'placeholder-test-' + Math.random().toString(36).slice(2, 7);
    const texts = ['We open at nine.', 'Parking is free behind the building.'];
    const vectors = await generateEmbeddingsBatch(texts);
    const before = await Database.countStaleEmbeddingChunks();
    await Database.saveChunks(texts.map((content, i) => ({ assistantId, knowledgeSourceId: 's1', content, chunkIndex: i, tokenCount: 5, metadata: {}, embedding: vectors[i] })));

    const stored = await Database.getChunksByAssistant(assistantId);
    expect(stored.map((c) => c.metadata.embModel)).toEqual([PLACEHOLDER_PROFILE_ID, PLACEHOLDER_PROFILE_ID]);
    expect(await Database.countStaleEmbeddingChunks()).toBe(before + 2);
  });

  it('tags vectors with the real model again once it works', () => {
    markEmbeddingModel(false);
    expect(vectorTag()).toBe(PLACEHOLDER_PROFILE_ID);
    markEmbeddingModel(true);
    expect(vectorTag()).toBe(embeddingProfile().id);
    _resetEmbeddingModelStateForTesting();
    expect(vectorTag()).toBe(embeddingProfile().id); // nothing embedded yet (for example vectors supplied by a script)
  });
});

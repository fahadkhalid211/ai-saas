import { afterEach, describe, expect, it, vi } from 'vitest';
import { chunkNeedsEmbedding, chunkProfileId, embeddingProfile, LEGACY_PROFILE_ID } from './embedding-profile';

afterEach(() => {
  delete process.env.EMBEDDING_MODEL;
});

describe('embedding profiles', () => {
  it('defaults to the English model with its own thresholds', () => {
    const p = embeddingProfile();
    expect(p.id).toBe(LEGACY_PROFILE_ID);
    expect(p.confidenceThreshold).toBe(0.58);
    expect(p.queryPrefix).toBe('');
  });

  it('knows the multilingual models and their scales', () => {
    const e5 = embeddingProfile('Xenova/multilingual-e5-small');
    expect(e5.queryPrefix).toBe('query: ');
    expect(e5.passagePrefix).toBe('passage: ');
    expect(e5.vectorCutoffAlone).toBeGreaterThan(0.7);
    expect(embeddingProfile('paraphrase-multilingual-minilm').model).toContain('MiniLM');
  });

  it('gives an unknown model a safe id and the default settings', () => {
    const p = embeddingProfile('Xenova/some-new-model_v2');
    expect(p.id).toBe('some-new-model-v2');
    expect(p.confidenceThreshold).toBe(0.58);
  });

  it('treats untagged chunks as made by the English default and finds the ones to rebuild', () => {
    expect(chunkProfileId({})).toBe(LEGACY_PROFILE_ID);
    expect(chunkNeedsEmbedding({}, LEGACY_PROFILE_ID)).toBe(false);
    expect(chunkNeedsEmbedding({}, 'multilingual-e5-small')).toBe(true);
    expect(chunkNeedsEmbedding({ embModel: 'multilingual-e5-small' }, 'multilingual-e5-small')).toBe(false);
  });

  it('reads EMBEDDING_MODEL', () => {
    process.env.EMBEDDING_MODEL = 'Xenova/multilingual-e5-small';
    expect(embeddingProfile().id).toBe('multilingual-e5-small');
  });
});

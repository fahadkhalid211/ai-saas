import { describe, it, expect, afterEach } from 'vitest';
import { tsQueryFrom, chunkTable, pgVectorStoreEnabled } from './chunk-store';

describe('pgvector chunk store helpers', () => {
  afterEach(() => {
    delete process.env.CHUNKS_TABLE;
    delete process.env.RAG_VECTOR_STORE;
  });

  it('builds an OR full-text query from plain words only', () => {
    expect(tsQueryFrom('How much is the Growth plan?')).toBe('how | much | is | the | growth | plan');
    expect(tsQueryFrom("x'); DROP TABLE kortex_chunks;--")).toBe('drop | table | kortex | chunks');
    expect(tsQueryFrom('!!! ???')).toBe('');
    expect(tsQueryFrom('a a a bb bb').split(' | ')).toEqual(['bb']);
  });

  it('caps the number of terms', () => {
    const q = tsQueryFrom(Array.from({ length: 100 }, (_, i) => `word${i}`).join(' '));
    expect(q.split(' | ')).toHaveLength(24);
  });

  it('validates the table name because it is placed into SQL', () => {
    expect(chunkTable()).toBe('kortex_chunks');
    process.env.CHUNKS_TABLE = 'scratch_chunks_1';
    expect(chunkTable()).toBe('scratch_chunks_1');
    process.env.CHUNKS_TABLE = 'x; drop table users';
    expect(() => chunkTable()).toThrow();
  });

  it('is off unless explicitly enabled', () => {
    expect(pgVectorStoreEnabled()).toBe(false);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

let page = { title: 'Prices', type: 'web', content: 'Cuts are 30 dollars. Colour is 95 dollars.' } as any;
let fail = false;

vi.mock('./url-extractor', () => ({
  extractFromUrl: async () => {
    if (fail) throw new Error('network down');
    return page;
  },
}));
vi.mock('./embedder', () => ({
  localEmbeddingsReady: async () => true,
  generateEmbeddingsBatch: async (texts: string[]) => texts.map(() => new Array(384).fill(0.02)),
  generateEmbedding: async () => new Array(384).fill(0.02),
}));
vi.mock('@/lib/security/ssrf', () => ({ validateSafeExternalUrl: async () => ({ safe: true }) }));

import { Database } from '@/lib/db';
import { recrawlSource, recrawlDueSources } from './recrawl';

async function webSource() {
  const assistantId = 'recrawl-' + Math.random().toString(36).slice(2, 7);
  const source = await Database.createKnowledgeSource({ assistantId, title: 'Prices page', type: 'web', fileUrl: 'https://example.com/prices', status: 'ready' } as any);
  await Database.saveChunks([{ assistantId, knowledgeSourceId: source.id, content: 'Old copy: cuts are 25 dollars.', chunkIndex: 0, tokenCount: 8, metadata: {}, embedding: new Array(384).fill(0.01) }]);
  return { assistantId, source };
}

beforeEach(() => {
  fail = false;
  page = { title: 'Prices', type: 'web', content: 'Cuts are 30 dollars. Colour is 95 dollars.' };
});

describe('re-reading web pages', () => {
  it('replaces the old passages when the page changed, and skips the rewrite when it did not', async () => {
    const { source } = await webSource();
    expect(await recrawlSource(source.id)).toBe('updated');
    const first = await Database.getChunksBySource(source.id);
    expect(first.some((c) => c.content.includes('30 dollars'))).toBe(true);
    expect(first.some((c) => c.content.includes('Old copy'))).toBe(false);

    expect(await recrawlSource(source.id)).toBe('unchanged');
    page = { ...page, content: 'Cuts are 35 dollars now.' };
    expect(await recrawlSource(source.id)).toBe('updated');
    const second = await Database.getChunksBySource(source.id);
    expect(second.some((c) => c.content.includes('35 dollars'))).toBe(true);
  }, 30000);

  it('keeps the old copy when the page cannot be read', async () => {
    const { source } = await webSource();
    fail = true;
    expect(await recrawlSource(source.id)).toBe('failed');
    const kept = await Database.getChunksBySource(source.id);
    expect(kept.some((c) => c.content.includes('Old copy'))).toBe(true);
  }, 30000);

  it('only picks sources that are due and have no manual corrections', async () => {
    const { source } = await webSource();
    expect((await Database.getDueWebSources(60_000, 50)).some((s) => s.id === source.id)).toBe(false); // just created
    const due = await Database.getDueWebSources(-1000, 500);
    expect(due.some((s) => s.id === source.id)).toBe(true);
    await Database.updateKnowledgeSource(source.id, { corrections: [{ id: 'c1', type: 'note', note: 'x', appliedAt: new Date().toISOString() }] });
    expect((await Database.getDueWebSources(-1000, 500)).some((s) => s.id === source.id)).toBe(false);
    const summary = await recrawlDueSources({ max: 1 });
    expect(summary.failed).toBe(0);
  }, 30000);
});

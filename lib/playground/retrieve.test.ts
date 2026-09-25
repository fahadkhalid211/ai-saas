import { describe, expect, it } from 'vitest';
import { retrieve } from './retrieve';
import type { PgChunk } from './store';

const chunk = (i: number, text: string): PgChunk => ({ id: `c${i}`, sourceId: 's1', sourceTitle: 'Cancer', text }) as PgChunk;
const chunks = [
  chunk(1, 'Cancer symptoms include fatigue, a lump under the skin, weight loss and night sweats.'),
  chunk(2, 'Cancer causes: mutations in the DNA of cells, inherited or acquired through smoking and radiation.'),
  chunk(3, 'Treatment options include surgery, chemotherapy and radiation therapy for tumours.'),
  chunk(4, 'Prevention: avoid tobacco, eat a healthy diet and exercise regularly to lower risk.'),
  chunk(5, 'Diagnosis uses imaging, biopsy and blood tests to confirm the disease.'),
  chunk(6, 'Risk factors include age, family history and exposure to chemicals.'),
  chunk(7, 'Support groups and counselling help patients and families cope.'),
];

describe('playground retrieval', () => {
  it('a follow-up with no topic words uses the previous question', () => {
    const hits = retrieve(chunks, 'explain in detail', [{ role: 'user', content: 'What are the symptoms of cancer?' }, { role: 'assistant', content: 'Fatigue, lumps.' }]);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].chunk.id).toBe('c1');
  });
  it('a broad first message gets an overview across the documents', () => {
    const hits = retrieve(chunks, 'tell me all you know', []);
    expect(hits.length).toBe(6);
    expect(new Set(hits.map((h) => h.chunk.id)).size).toBe(6);
  });
  it('an unrelated question still finds nothing', () => {
    expect(retrieve(chunks, 'what is the price of a pizza', [])).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { GOLDEN } from '../../../eval/rag/golden';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

describe('golden set is internally consistent', () => {
  const docs = new Map(GOLDEN.corpus.map((d) => [d.id, norm(d.text)]));

  it('has unique document and case ids', () => {
    expect(new Set(GOLDEN.corpus.map((d) => d.id)).size).toBe(GOLDEN.corpus.length);
    expect(new Set(GOLDEN.cases.map((c) => c.id)).size).toBe(GOLDEN.cases.length);
  });

  it('every piece of evidence points at a real document and a passage that really is in it', () => {
    for (const c of GOLDEN.cases) {
      for (const ev of c.relevant) {
        expect(docs.has(ev.doc), `${c.id}: unknown document "${ev.doc}"`).toBe(true);
        if (ev.contains) expect(docs.get(ev.doc)!.includes(norm(ev.contains)), `${c.id}: passage not found in ${ev.doc}: "${ev.contains}"`).toBe(true);
      }
    }
  });

  it('covers every kind of question, including ones the knowledge base cannot answer', () => {
    const types = new Set(GOLDEN.cases.map((c) => c.type));
    for (const t of ['factual', 'paraphrase', 'synonym', 'typo', 'numeric', 'multi', 'followup', 'overview', 'unanswerable']) expect(types.has(t), t).toBe(true);
    expect(GOLDEN.cases.filter((c) => c.relevant.length === 0).every((c) => c.type === 'unanswerable')).toBe(true);
    expect(GOLDEN.cases.filter((c) => c.type === 'followup').every((c) => (c.history?.length ?? 0) > 0)).toBe(true);
  });
});

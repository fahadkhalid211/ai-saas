import { describe, it, expect } from 'vitest';
import { evaluate, formatReport, type EvalSet, type RetrievedChunk } from './harness';

const set: EvalSet = {
  name: 'tiny',
  corpus: [
    { id: 'pricing', title: 'Pricing', text: 'x' },
    { id: 'hours', title: 'Hours', text: 'y' },
  ],
  cases: [
    { id: 'a', query: 'how much', type: 'factual', relevant: [{ doc: 'pricing', contains: 'costs $49' }] },
    { id: 'b', query: 'when open', type: 'paraphrase', relevant: [{ doc: 'hours' }] },
    { id: 'c', query: 'both', type: 'multi', relevant: [{ doc: 'pricing' }, { doc: 'hours' }] },
    { id: 'u', query: 'weather on mars', type: 'unanswerable', relevant: [] },
  ],
};

const chunk = (docId: string | null, text: string, score: number): RetrievedChunk => ({ docId, text, score });

describe('evaluate()', () => {
  it('scores each case against the evidence it needs, including passage-level matches', async () => {
    const answers: Record<string, RetrievedChunk[]> = {
      a: [chunk('hours', 'we open at 9', 0.9), chunk('pricing', 'The Starter plan costs $49 per month', 0.8)], // right doc, right passage, rank 2
      b: [chunk('hours', 'open 9 to 5', 0.95)], // rank 1
      c: [chunk('pricing', 'plans', 0.9), chunk('pricing', 'more plans', 0.85)], // only one of two needed docs
      u: [chunk('pricing', 'unrelated', 0.2)],
    };
    const report = await evaluate(set, async (c) => ({ chunks: answers[c.id] }), { k: 5 });
    const by = Object.fromEntries(report.cases.map((r) => [r.id, r]));

    expect(by.a.firstRelevantRank).toBe(2);
    expect(by.a.reciprocalRank).toBe(0.5);
    expect(by.b.firstRelevantRank).toBe(1);
    expect(by.c.recall).toBe(0.5);
    expect(by.u.answerable).toBe(false);

    expect(report.answerable.cases).toBe(3);
    expect(report.answerable.hitAtK).toBe(1);
    expect(report.answerable.recallAtK).toBeCloseTo((1 + 1 + 0.5) / 3);
    expect(report.abstain.unanswerableCases).toBe(1);
    expect(report.abstain.best).not.toBeNull();
    expect(Object.keys(report.byType).sort()).toEqual(['factual', 'multi', 'paraphrase']);
  });

  it('a passage that is missing counts as a miss even from the right document', async () => {
    const report = await evaluate(set, async () => ({ chunks: [chunk('pricing', 'nothing about price here', 0.9)] }));
    expect(report.cases.find((c) => c.id === 'a')!.hit).toBe(0);
    expect(report.failures).toContain('a');
  });

  it('records a retrieval error as a failed case and keeps going', async () => {
    const report = await evaluate(set, async (c) => {
      if (c.id === 'b') throw new Error('index unavailable');
      return { chunks: [] };
    });
    expect(report.cases.find((c) => c.id === 'b')!.error).toBe('index unavailable');
    expect(report.cases).toHaveLength(4);
  });

  it('prints a readable report with deltas against a previous run', async () => {
    const good = await evaluate(set, async (c) => ({ chunks: c.relevant.map((r) => chunk(r.doc, r.contains ?? 'text', 0.9)) }));
    const bad = await evaluate(set, async () => ({ chunks: [] }));
    const text = formatReport(good, bad);
    expect(text).toContain('hit@5');
    expect(text).toContain('by question type');
    expect(text).toMatch(/\(\+\d/); // improvement shown as a positive delta
  });
});

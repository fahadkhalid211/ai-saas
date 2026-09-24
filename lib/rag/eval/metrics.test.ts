import { describe, it, expect } from 'vitest';
import { hitAtK, recallAtK, precisionAtK, reciprocalRank, ndcgAtK, percentile, thresholdSweep, separationAuc, type RankedResult } from './metrics';

const r = (relevant: boolean[], covers: number[], evidenceCount: number): RankedResult => ({ relevant, covers, evidenceCount });

describe('retrieval metrics', () => {
  it('hit@k and MRR depend on where the first relevant chunk is', () => {
    const third = r([false, false, true, false], [-1, -1, 0, -1], 1);
    expect(hitAtK(third, 2)).toBe(0);
    expect(hitAtK(third, 3)).toBe(1);
    expect(reciprocalRank(third)).toBeCloseTo(1 / 3);
    expect(reciprocalRank(r([false, false], [-1, -1], 1))).toBe(0);
    expect(reciprocalRank(r([true], [0], 1))).toBe(1);
  });

  it('recall@k counts distinct evidence items, not duplicate chunks', () => {
    const two = r([true, true, true], [0, 0, 1], 2);
    expect(recallAtK(two, 2)).toBe(0.5); // both top chunks cover the same item
    expect(recallAtK(two, 3)).toBe(1);
    expect(recallAtK(r([], [], 0), 5)).toBe(0);
  });

  it('precision@k is the share of relevant chunks among those returned', () => {
    expect(precisionAtK(r([true, false, true, false], [0, -1, 1, -1], 2), 4)).toBe(0.5);
    expect(precisionAtK(r([true], [0], 1), 5)).toBe(1); // only one chunk came back
    expect(precisionAtK(r([], [], 1), 5)).toBe(0);
  });

  it('nDCG rewards putting relevant chunks first', () => {
    const best = r([true, true, false], [0, 1, -1], 2);
    const worse = r([false, true, true], [-1, 0, 1], 2);
    expect(ndcgAtK(best, 3)).toBeCloseTo(1);
    expect(ndcgAtK(worse, 3)).toBeLessThan(ndcgAtK(best, 3));
    expect(ndcgAtK(r([false, false], [-1, -1], 1), 3)).toBe(0);
  });

  it('percentile picks the nearest rank', () => {
    expect(percentile([10, 20, 30, 40, 50], 50)).toBe(30);
    expect(percentile([10, 20, 30, 40, 50], 95)).toBe(50);
    expect(percentile([], 95)).toBe(0);
  });

  it('threshold sweep finds the cut-off that separates answerable from unanswerable questions', () => {
    const { best, points } = thresholdSweep([0.8, 0.7, 0.9, 0.75], [0.2, 0.3, 0.25, 0.4]);
    expect(points.length).toBeGreaterThan(10);
    expect(best!.threshold).toBeGreaterThan(0.4);
    expect(best!.threshold).toBeLessThanOrEqual(0.7);
    expect(best!.youden).toBe(1);
    expect(best!.falseAnswerRate).toBe(0);
    expect(thresholdSweep([0.5], []).best).toBeNull();
  });

  it('AUC says how well a score separates two groups', () => {
    expect(separationAuc([0.9, 0.8], [0.1, 0.2])).toBe(1);
    expect(separationAuc([0.1, 0.2], [0.9, 0.8])).toBe(0);
    expect(separationAuc([0.5, 0.5], [0.5, 0.5])).toBe(0.5);
    expect(separationAuc([], [0.5])).toBe(0);
  });
});

/**
 * Retrieval-quality metrics. All of them take, per query, the ranked list of retrieved chunks marked relevant or not,
 * and the number of distinct pieces of evidence the answer needs.
 *
 *   hit@k        did any relevant chunk appear in the top k          (0/1, averaged)
 *   recall@k     share of the needed evidence found in the top k      (0..1, averaged)
 *   precision@k  share of the top k that is relevant                  (0..1, averaged)
 *   MRR          1 / rank of the first relevant chunk (0 if none)
 *   nDCG@k       ranking quality with binary gains; 1 is a perfect order
 */

export interface RankedResult {
  /** For each retrieved chunk in rank order: does it carry needed evidence? */
  relevant: boolean[];
  /** For each retrieved chunk in rank order: which evidence item (index) does it cover, or -1. */
  covers: number[];
  /** How many distinct evidence items the answer needs. */
  evidenceCount: number;
}

export function hitAtK(r: RankedResult, k: number): number {
  return r.relevant.slice(0, k).some(Boolean) ? 1 : 0;
}

export function recallAtK(r: RankedResult, k: number): number {
  if (r.evidenceCount === 0) return 0;
  const found = new Set(r.covers.slice(0, k).filter((c) => c >= 0));
  return found.size / r.evidenceCount;
}

export function precisionAtK(r: RankedResult, k: number): number {
  const top = r.relevant.slice(0, k);
  if (top.length === 0) return 0;
  return top.filter(Boolean).length / top.length;
}

export function reciprocalRank(r: RankedResult): number {
  const i = r.relevant.findIndex(Boolean);
  return i === -1 ? 0 : 1 / (i + 1);
}

export function ndcgAtK(r: RankedResult, k: number): number {
  const gains: number[] = r.relevant.slice(0, k).map((v) => (v ? 1 : 0));
  const dcg = gains.reduce((sum, g, i) => sum + g / Math.log2(i + 2), 0);
  const ideal = Math.min(k, Math.max(r.evidenceCount, gains.filter(Boolean).length));
  let idcg = 0;
  for (let i = 0; i < ideal; i++) idcg += 1 / Math.log2(i + 2);
  return idcg === 0 ? 0 : dcg / idcg;
}

export function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export interface ThresholdPoint {
  threshold: number;
  /** Answerable questions the assistant would still answer (share). */
  answeredRate: number;
  /** Unanswerable questions it would wrongly answer (share). */
  falseAnswerRate: number;
  f1: number;
  /** True-positive rate minus false-positive rate: how much better than guessing this cut-off is. */
  youden: number;
}

/**
 * How well does the top score separate questions the knowledge base can answer from those it cannot?
 * `answerable` and `unanswerable` are the top-1 scores of each group. Returns the sweep and the best-F1 threshold.
 * Use it to pick the "only answer above this confidence" cut-off.
 */
export function thresholdSweep(answerable: number[], unanswerable: number[], steps = 40): { points: ThresholdPoint[]; best: ThresholdPoint | null } {
  const all = [...answerable, ...unanswerable];
  if (answerable.length === 0 || unanswerable.length === 0 || all.length === 0) return { points: [], best: null };
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const points: ThresholdPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = lo + ((hi - lo) * i) / steps;
    const tp = answerable.filter((s) => s >= t).length;
    const fp = unanswerable.filter((s) => s >= t).length;
    const fn = answerable.length - tp;
    const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
    const recall = tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    points.push({ threshold: Number(t.toFixed(4)), answeredRate: recall, falseAnswerRate: fp / unanswerable.length, f1, youden: recall - fp / unanswerable.length });
  }
  // Youden's J, not F1: with mostly answerable questions F1 is maximised by answering everything, which is useless.
  const best = points.reduce((a, b) => (b.youden > a.youden ? b : a));
  return { points, best };
}

/**
 * Probability that a random answerable question scores higher than a random unanswerable one (ROC AUC).
 * 1 = the score separates them perfectly, 0.5 = the score tells you nothing. Below about 0.75 the score cannot be
 * trusted for an "answer only if confident" gate.
 */
export function separationAuc(answerable: number[], unanswerable: number[]): number {
  if (answerable.length === 0 || unanswerable.length === 0) return 0;
  let wins = 0;
  for (const a of answerable) for (const u of unanswerable) wins += a > u ? 1 : a === u ? 0.5 : 0;
  return wins / (answerable.length * unanswerable.length);
}

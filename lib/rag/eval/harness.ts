import { hitAtK, mean, ndcgAtK, percentile, precisionAtK, recallAtK, reciprocalRank, separationAuc, thresholdSweep, type RankedResult, type ThresholdPoint } from './metrics';

/* ------------------------------------------------ data ------------------------------------------------ */

export interface EvalCorpusDoc {
  id: string;
  title: string;
  text: string;
}

/** A piece of evidence a good answer needs: a document, optionally narrowed to a passage the chunk must contain. */
export interface EvidenceSpec {
  doc: string;
  contains?: string;
}

export interface EvalCase {
  id: string;
  query: string;
  /** factual | paraphrase | synonym | typo | numeric | multi | followup | overview | unanswerable */
  type: string;
  history?: { role: string; content: string }[];
  /** Empty for questions the knowledge base cannot answer: the assistant should abstain. */
  relevant: EvidenceSpec[];
}

export interface EvalSet {
  name: string;
  description?: string;
  corpus: EvalCorpusDoc[];
  cases: EvalCase[];
}

export interface RetrievedChunk {
  text: string;
  /** Corpus document id this chunk came from, if known. */
  docId: string | null;
  score: number;
  /** Cosine similarity and full-text match, when the retriever reports them. */
  vectorScore?: number;
  keywordMatch?: boolean;
}

export type Retriever = (c: EvalCase) => Promise<{ chunks: RetrievedChunk[]; confidence?: number }>;

/* ----------------------------------------------- report ----------------------------------------------- */

export interface CaseResult {
  id: string;
  query: string;
  type: string;
  answerable: boolean;
  /** 1-based rank of the first relevant chunk, or null. */
  firstRelevantRank: number | null;
  hit: number;
  recall: number;
  precision: number;
  reciprocalRank: number;
  ndcg: number;
  topScore: number;
  latencyMs: number;
  retrieved: Array<{ docId: string | null; score: number; preview: string; vectorScore?: number; keywordMatch?: boolean }>;
  error?: string;
}

export interface MetricSummary {
  cases: number;
  hitAtK: number;
  recallAtK: number;
  precisionAtK: number;
  mrr: number;
  ndcgAtK: number;
}

export interface EvalReport {
  name: string;
  ranAt: string;
  k: number;
  answerable: MetricSummary;
  byType: Record<string, MetricSummary>;
  latency: { meanMs: number; p50Ms: number; p95Ms: number };
  /** Separation of answerable vs unanswerable questions by top score (for the "answer only if confident" gate). */
  abstain: {
    answerableCases: number;
    unanswerableCases: number;
    meanTopScoreAnswerable: number;
    meanTopScoreUnanswerable: number;
    /** 1 = top score perfectly separates answerable from unanswerable questions, 0.5 = useless. */
    separationAuc: number;
    best: ThresholdPoint | null;
  };
  failures: string[];
  cases: CaseResult[];
}

/* ---------------------------------------------- evaluation --------------------------------------------- */

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function rank(chunks: RetrievedChunk[], specs: EvidenceSpec[]): RankedResult {
  const covered = new Set<number>();
  const relevant: boolean[] = [];
  const covers: number[] = [];
  for (const chunk of chunks) {
    const text = norm(chunk.text);
    const matches = specs.map((s, i) => (chunk.docId === s.doc && (!s.contains || text.includes(norm(s.contains))) ? i : -1)).filter((i) => i >= 0);
    if (matches.length === 0) {
      relevant.push(false);
      covers.push(-1);
      continue;
    }
    // a chunk that covers several needed items counts toward the first one not found yet
    const fresh = matches.find((i) => !covered.has(i));
    const pick = fresh ?? matches[0];
    covered.add(pick);
    relevant.push(true);
    covers.push(pick);
  }
  return { relevant, covers, evidenceCount: specs.length };
}

function summarize(results: CaseResult[]): MetricSummary {
  return {
    cases: results.length,
    hitAtK: mean(results.map((r) => r.hit)),
    recallAtK: mean(results.map((r) => r.recall)),
    precisionAtK: mean(results.map((r) => r.precision)),
    mrr: mean(results.map((r) => r.reciprocalRank)),
    ndcgAtK: mean(results.map((r) => r.ndcg)),
  };
}

export async function evaluate(set: EvalSet, retrieve: Retriever, options: { k?: number; name?: string } = {}): Promise<EvalReport> {
  const k = options.k ?? 5;
  const results: CaseResult[] = [];

  for (const c of set.cases) {
    const started = performance.now();
    let chunks: RetrievedChunk[] = [];
    let confidence: number | undefined;
    let error: string | undefined;
    try {
      const res = await retrieve(c);
      chunks = res.chunks;
      confidence = res.confidence;
    } catch (err) {
      error = (err as Error)?.message || String(err);
    }
    const latencyMs = performance.now() - started;

    const ranked = rank(chunks, c.relevant);
    const first = ranked.relevant.findIndex(Boolean);
    results.push({
      id: c.id,
      query: c.query,
      type: c.type,
      answerable: c.relevant.length > 0,
      firstRelevantRank: first === -1 ? null : first + 1,
      hit: hitAtK(ranked, k),
      recall: recallAtK(ranked, k),
      precision: precisionAtK(ranked, k),
      reciprocalRank: reciprocalRank(ranked),
      ndcg: ndcgAtK(ranked, k),
      // the confidence the app would act on when the retriever reports one, else the first chunk's score
      topScore: confidence ?? chunks[0]?.score ?? 0,
      latencyMs,
      retrieved: chunks.slice(0, k).map((ch) => ({ docId: ch.docId, score: Number(ch.score.toFixed(4)), preview: ch.text.replace(/\s+/g, ' ').slice(0, 90), vectorScore: ch.vectorScore, keywordMatch: ch.keywordMatch })),
      ...(error ? { error } : {}),
    });
  }

  const answerable = results.filter((r) => r.answerable);
  const unanswerable = results.filter((r) => !r.answerable);
  const byType: Record<string, MetricSummary> = {};
  for (const type of [...new Set(answerable.map((r) => r.type))].sort()) byType[type] = summarize(answerable.filter((r) => r.type === type));

  const sweep = thresholdSweep(answerable.map((r) => r.topScore), unanswerable.map((r) => r.topScore));
  const latencies = results.map((r) => r.latencyMs);

  return {
    name: options.name ?? set.name,
    ranAt: new Date().toISOString(),
    k,
    answerable: summarize(answerable),
    byType,
    latency: { meanMs: mean(latencies), p50Ms: percentile(latencies, 50), p95Ms: percentile(latencies, 95) },
    abstain: {
      answerableCases: answerable.length,
      unanswerableCases: unanswerable.length,
      meanTopScoreAnswerable: mean(answerable.map((r) => r.topScore)),
      meanTopScoreUnanswerable: mean(unanswerable.map((r) => r.topScore)),
      separationAuc: separationAuc(answerable.map((r) => r.topScore), unanswerable.map((r) => r.topScore)),
      best: sweep.best,
    },
    failures: answerable.filter((r) => r.hit === 0 || r.error).map((r) => r.id),
    cases: results,
  };
}

/* ----------------------------------------------- reporting ---------------------------------------------- */

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const delta = (now: number, before?: number, digits = 1, scale = 100) =>
  before === undefined ? '' : ` (${now - before >= 0 ? '+' : ''}${(((now - before) * scale)).toFixed(digits)})`;

export function formatReport(report: EvalReport, previous?: EvalReport): string {
  const a = report.answerable;
  const p = previous?.answerable;
  const lines: string[] = [];
  lines.push(`RAG retrieval evaluation: ${report.name}   k=${report.k}   ${a.cases} answerable + ${report.abstain.unanswerableCases} unanswerable questions`);
  lines.push('');
  lines.push(`  hit@${report.k}        ${pct(a.hitAtK)}${delta(a.hitAtK, p?.hitAtK)}   (a relevant chunk is in the top ${report.k})`);
  lines.push(`  recall@${report.k}     ${pct(a.recallAtK)}${delta(a.recallAtK, p?.recallAtK)}   (share of needed evidence found)`);
  lines.push(`  precision@${report.k}  ${pct(a.precisionAtK)}${delta(a.precisionAtK, p?.precisionAtK)}   (share of returned chunks that help)`);
  lines.push(`  MRR           ${a.mrr.toFixed(3)}${delta(a.mrr, p?.mrr, 3, 1)}   (1 = best chunk is always first)`);
  lines.push(`  nDCG@${report.k}       ${a.ndcgAtK.toFixed(3)}${delta(a.ndcgAtK, p?.ndcgAtK, 3, 1)}`);
  lines.push(`  latency       p50 ${report.latency.p50Ms.toFixed(0)} ms   p95 ${report.latency.p95Ms.toFixed(0)} ms${previous ? `   (was p95 ${previous.latency.p95Ms.toFixed(0)} ms)` : ''}`);
  lines.push('');
  lines.push('  by question type            n    hit    recall   MRR');
  for (const [type, m] of Object.entries(report.byType)) {
    lines.push(`  ${type.padEnd(24)} ${String(m.cases).padStart(3)}  ${pct(m.hitAtK).padStart(6)}  ${pct(m.recallAtK).padStart(6)}  ${m.mrr.toFixed(2)}`);
  }
  const ab = report.abstain;
  if (ab.best) {
    lines.push('');
    const usable = ab.separationAuc >= 0.75;
    lines.push(`  answer-or-abstain: top score averages ${ab.meanTopScoreAnswerable.toFixed(3)} when answerable vs ${ab.meanTopScoreUnanswerable.toFixed(3)} when not`);
    lines.push(`  score separation (AUC) ${ab.separationAuc.toFixed(2)}   ${usable ? 'usable for a confidence gate' : 'NOT usable: the score cannot tell answerable from unanswerable (0.5 = coin flip)'}`);
    lines.push(`  best cut-off ${ab.best.threshold}: answers ${pct(ab.best.answeredRate)} of answerable, wrongly answers ${pct(ab.best.falseAnswerRate)} of unanswerable`);
  }
  if (report.failures.length) {
    lines.push('');
    lines.push(`  missed entirely (${report.failures.length}):`);
    for (const id of report.failures.slice(0, 12)) {
      const c = report.cases.find((x) => x.id === id)!;
      lines.push(`    ${id}  [${c.type}]  ${c.query.slice(0, 70)}${c.error ? `   ERROR ${c.error}` : ''}`);
      const top = c.retrieved[0];
      if (top) lines.push(`        got: ${top.docId ?? '?'}  ${top.preview}`);
    }
  }
  return lines.join('\n');
}

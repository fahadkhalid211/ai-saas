import type { SearchResultChunk } from './types';

/**
 * Cross-encoder re-ranking: a small model reads the question and each candidate passage TOGETHER and scores how well
 * the passage answers it. Runs locally with @xenova/transformers (no API key, no per-question cost).
 * Enabled with RAG_RERANKER=cross-encoder; any failure falls back to the candidates' existing order.
 */

const MODEL = () => process.env.RAG_RERANK_MODEL || 'Xenova/ms-marco-MiniLM-L-6-v2';

export function crossEncoderEnabled(): boolean {
  return (process.env.RAG_RERANKER || '').toLowerCase() === 'cross-encoder';
}

let loading: Promise<{ tokenizer: any; model: any } | null> | null = null;

async function load() {
  if (!loading) {
    loading = (async () => {
      try {
        const { AutoTokenizer, AutoModelForSequenceClassification, env } = await import('@xenova/transformers');
        env.allowLocalModels = false;
        env.useBrowserCache = false;
        const name = MODEL();
        console.log(`[Reranker] Initializing cross-encoder ${name}...`);
        const [tokenizer, model] = await Promise.all([
          AutoTokenizer.from_pretrained(name),
          AutoModelForSequenceClassification.from_pretrained(name, { quantized: true }),
        ]);
        return { tokenizer, model };
      } catch (err) {
        console.error('[Reranker] Failed to load cross-encoder:', (err as Error)?.message);
        return null;
      }
    })();
  }
  return loading;
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/** Relevance of each passage to the query, 0..1, or null if the model is unavailable. */
export async function crossEncoderScores(query: string, passages: string[]): Promise<number[] | null> {
  if (passages.length === 0) return [];
  const m = await load();
  if (!m) return null;
  try {
    const inputs = m.tokenizer(new Array(passages.length).fill(query), {
      text_pair: passages.map((p) => p.slice(0, 2000)),
      padding: true,
      truncation: true,
      max_length: 384,
    });
    const { logits } = await m.model(inputs);
    const data = Array.from(logits.data as Float32Array);
    const per = data.length / passages.length; // 1 logit per pair for MS MARCO cross-encoders
    return passages.map((_, i) => sigmoid(data[i * per + (per - 1)]));
  } catch (err) {
    console.warn('[Reranker] scoring failed:', (err as Error)?.message);
    return null;
  }
}

/**
 * Re-orders candidates by cross-encoder score, blended with their incoming rank so a strong keyword/vector match is not
 * thrown away by a single model opinion. `similarity` becomes the blended score.
 */
export async function crossEncoderRerank(query: string, candidates: SearchResultChunk[], topK: number): Promise<SearchResultChunk[]> {
  if (candidates.length <= 1) return candidates;
  const scores = await crossEncoderScores(query, candidates.map((c) => c.content));
  if (!scores) return candidates.slice(0, topK);
  const weight = Number(process.env.RAG_RERANK_WEIGHT) || 1;
  return candidates
    .map((c, i) => ({ c, s: weight * scores[i] + (1 - weight) * (1 / (1 + i * 0.08)) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, topK)
    .map(({ c, s }) => ({ ...c, similarity: s }));
}

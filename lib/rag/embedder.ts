// Open-source embedding pipeline running locally with @xenova/transformers (384 dimensions for every supported profile)
import { embeddingProfile } from './embedding-profile';

let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      try {
        const { pipeline, env } = await import('@xenova/transformers');
        // Configure local caching
        env.allowLocalModels = false;
        env.useBrowserCache = false;
        
        const modelName = embeddingProfile().model;
        console.log(`[Embedder] Initializing local embedding pipeline with ${modelName}...`);
        
        return await pipeline('feature-extraction', modelName, {
          quantized: true,
        });
      } catch (err) {
        console.error('[Embedder] Failed to initialize @xenova/transformers pipeline:', err);
        return null;
      }
    })();
  }
  return extractorPromise;
}

/** True when the real model loaded. When it did not, embeddings are placeholders and must never be stored as if they were real. */
export async function localEmbeddingsReady(): Promise<boolean> {
  return Boolean(await getExtractor());
}

const embeddingCache = new Map<string, number[]>();

export type EmbeddingKind = 'query' | 'passage';

/**
 * Generate a 384-dimensional embedding vector for a single text.
 * 'query' is a question being searched with; 'passage' is text being stored. Models such as e5 need to be told which.
 * 100% free, local, open-source.
 */
export async function generateEmbedding(text: string, kind: EmbeddingKind = 'query'): Promise<number[]> {
  const clean = text.replace(/\n+/g, ' ').trim();
  if (!clean) {
    return new Array(384).fill(0);
  }

  const profile = embeddingProfile();
  const input = (kind === 'query' ? profile.queryPrefix : profile.passagePrefix) + clean;
  const cacheKey = `${profile.id}|${kind}|${clean}`;

  // Check in-memory cache first (0ms latency)
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  try {
    const extractor = await getExtractor();
    if (extractor) {
      const output = await extractor(input, {
        pooling: 'mean',
        normalize: true,
      });
      const vec = Array.from(output.data) as number[];
      if (embeddingCache.size > 500) {
        const firstKey = embeddingCache.keys().next().value;
        if (firstKey) embeddingCache.delete(firstKey);
      }
      embeddingCache.set(cacheKey, vec);
      return vec;
    }
  } catch (error) {
    console.error('[Embedder] Error generating real embedding:', error);
  }

  // Resilient fallback: deterministic pseudo-vector (384 dims) if local runtime is initializing or fails
  return fallbackEmbedding(clean, 384);
}

/**
 * Generate embeddings for multiple text chunks.
 *
 * Runs with bounded concurrency instead of one-at-a-time: a document that
 * chunks into hundreds of pieces (a large CSV, a long transcript) used to
 * take one inference call per chunk in strict sequence, which is the main
 * reason large knowledge-base uploads were slow enough to trip the upload
 * route's processing timeout. The local transformer pipeline itself is
 * still single-threaded CPU work, but overlapping calls lets the event loop
 * pipeline tokenization/post-processing of one chunk while the model runs
 * on another, and — more importantly — bounds worst-case latency to
 * (n / concurrency) calls instead of n.
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  concurrency: number = 8,
  kind: EmbeddingKind = 'passage'
): Promise<number[][]> {
  const results: number[][] = new Array(texts.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= texts.length) return;
      results[i] = await generateEmbedding(texts[i], kind);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, texts.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

/**
 * Fallback deterministic embedding generator (384 dimensions)
 */
function fallbackEmbedding(text: string, dimensions: number = 384): number[] {
  const vector = new Array(dimensions).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }
  
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => val / magnitude);
}

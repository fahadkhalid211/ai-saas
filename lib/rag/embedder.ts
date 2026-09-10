// Open-source embedding pipeline running locally with @xenova/transformers (384 dimensions)
let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      try {
        const { pipeline, env } = await import('@xenova/transformers');
        // Configure local caching
        env.allowLocalModels = false;
        env.useBrowserCache = false;
        
        const modelName = process.env.EMBEDDING_MODEL || 'Xenova/bge-small-en-v1.5';
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

const embeddingCache = new Map<string, number[]>();

/**
 * Generate a 384-dimensional embedding vector for a single text chunk.
 * 100% free, local, open-source.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const clean = text.replace(/\n+/g, ' ').trim();
  if (!clean) {
    return new Array(384).fill(0);
  }

  // Check in-memory cache first (0ms latency)
  if (embeddingCache.has(clean)) {
    return embeddingCache.get(clean)!;
  }

  try {
    const extractor = await getExtractor();
    if (extractor) {
      const output = await extractor(clean, {
        pooling: 'mean',
        normalize: true,
      });
      const vec = Array.from(output.data) as number[];
      if (embeddingCache.size > 500) {
        const firstKey = embeddingCache.keys().next().value;
        if (firstKey) embeddingCache.delete(firstKey);
      }
      embeddingCache.set(clean, vec);
      return vec;
    }
  } catch (error) {
    console.error('[Embedder] Error generating real embedding:', error);
  }

  // Resilient fallback: deterministic pseudo-vector (384 dims) if local runtime is initializing or fails
  return fallbackEmbedding(clean, 384);
}

/**
 * Generate embeddings for multiple text chunks in batches.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const emb = await generateEmbedding(text);
    results.push(emb);
  }
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

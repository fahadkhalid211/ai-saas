import { RetrievalResult } from './types';

// ---------------------------------------------------------------------------
// Embedding LRU Cache
// ---------------------------------------------------------------------------

const EMBEDDING_CACHE_MAX = 2000;
const embeddingCache = new Map<string, number[]>();

export function getCachedEmbedding(query: string): number[] | null {
  const key = query.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 200);
  return embeddingCache.get(key) ?? null;
}

export function setCachedEmbedding(query: string, vec: number[]): void {
  const key = query.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 200);
  if (embeddingCache.size >= EMBEDDING_CACHE_MAX) {
    const oldestKey = embeddingCache.keys().next().value;
    if (oldestKey !== undefined) {
      embeddingCache.delete(oldestKey);
    }
  }
  embeddingCache.set(key, vec);
}

export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

// ---------------------------------------------------------------------------
// Retrieval Result Cache (Short-TTL / LRU for Sub-1ms Repeat Queries)
// ---------------------------------------------------------------------------

interface CachedRetrieval {
  result: RetrievalResult;
  expiresAt: number;
}

const RETRIEVAL_CACHE_MAX = 500;
const RETRIEVAL_CACHE_TTL_MS = 90 * 1000; // 90 seconds TTL
const retrievalResultCache = new Map<string, CachedRetrieval>();

export function getCachedRetrieval(assistantId: string, query: string): RetrievalResult | null {
  const key = `${assistantId}:${query.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 150)}`;
  const entry = retrievalResultCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    retrievalResultCache.delete(key);
    return null;
  }
  return entry.result;
}

export function setCachedRetrieval(assistantId: string, query: string, result: RetrievalResult): void {
  const key = `${assistantId}:${query.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 150)}`;
  if (retrievalResultCache.size >= RETRIEVAL_CACHE_MAX) {
    const oldestKey = retrievalResultCache.keys().next().value;
    if (oldestKey !== undefined) {
      retrievalResultCache.delete(oldestKey);
    }
  }
  retrievalResultCache.set(key, {
    result,
    expiresAt: Date.now() + RETRIEVAL_CACHE_TTL_MS,
  });
}

/**
 * Invalidates cached retrieval results for a specific assistant, or all assistants if omitted.
 * Must be called whenever knowledge sources or chunks are added, edited, corrected, or deleted.
 */
export function clearRetrievalCache(assistantId?: string): void {
  if (!assistantId) {
    retrievalResultCache.clear();
    return;
  }
  const prefix = `${assistantId}:`;
  for (const key of retrievalResultCache.keys()) {
    if (key.startsWith(prefix)) {
      retrievalResultCache.delete(key);
    }
  }
}

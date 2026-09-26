import { Database } from '@/lib/db';
import { generateEmbeddingsBatch, localEmbeddingsReady } from './embedder';
import { embeddingProfile } from './embedding-profile';
import { clearRetrievalCache } from './cache';

export interface ReembedResult {
  reembedded: number;
  remaining: number;
  profile: string;
  skipped?: string;
}

/**
 * Rebuilds vectors made by an older embedding model with the current one, a batch at a time. Until a passage is rebuilt, search
 * still finds it by its words (never by comparing vectors from different models), so switching models never hides content.
 */
export async function reembedStaleChunks(options: { limit?: number; budgetMs?: number } = {}): Promise<ReembedResult> {
  const limit = options.limit ?? 150;
  const budgetMs = options.budgetMs ?? 45_000;
  const profile = embeddingProfile();
  const started = Date.now();
  let done = 0;

  const waiting = await Database.countStaleEmbeddingChunks();
  if (waiting === 0) return { reembedded: 0, remaining: 0, profile: profile.id };

  if (!(await localEmbeddingsReady())) {
    return { reembedded: 0, remaining: await Database.countStaleEmbeddingChunks(), profile: profile.id, skipped: 'The embedding model is not available on this server.' };
  }

  while (done < limit && Date.now() - started < budgetMs) {
    const batch = await Database.getStaleEmbeddingChunks(Math.min(40, limit - done));
    if (batch.length === 0) break;
    const vectors = await generateEmbeddingsBatch(batch.map((c) => c.content), 4, 'passage');
    await Database.updateChunks(batch.map((c, i) => ({ ...c, embedding: vectors[i], metadata: { ...c.metadata, embModel: profile.id } })));
    done += batch.length;
  }
  if (done > 0) clearRetrievalCache();
  return { reembedded: done, remaining: await Database.countStaleEmbeddingChunks(), profile: profile.id };
}

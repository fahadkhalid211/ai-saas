import crypto from 'crypto';
import { pgVectorStoreEnabled, upsertChunks, deleteChunksBySource, getChunksByAssistant } from '@/lib/db/chunk-store';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { clearRetrievalCache } from '@/lib/rag/cache';
import { guideChunks } from './knowledge';

/**
 * Keeps the website assistant's stored knowledge in step with the hand-written guides. Without a vector database the guides
 * are served straight from memory (see DEFAULT_CRESCELO_KNOWLEDGE_CHUNKS); with one, older text stored for the assistant (for
 * example earlier prices) would otherwise keep being retrieved, so it is replaced. Runs at most once per server instance and
 * only does work when the guides changed.
 */

const ASSISTANT_ID = 'demo-assistant';
let done: Promise<void> | null = null;

export const guidesFingerprint = () => crypto.createHash('sha256').update(JSON.stringify(guideChunks().map((c) => [c.id, c.content]))).digest('hex').slice(0, 16);

export function syncPlatformGuides(): Promise<void> {
  if (!pgVectorStoreEnabled()) return Promise.resolve();
  if (done) return done;
  done = (async () => {
    try {
      const wanted = guideChunks();
      const stored = await getChunksByAssistant(ASSISTANT_ID);
      const byId = new Map(stored.map((c) => [c.id, c]));
      const upToDate = stored.length === wanted.length && wanted.every((w) => byId.get(w.id)?.content === w.content);
      if (upToDate) return;

      // remove everything else stored for this assistant (old hand-written chunks and earlier versions of the guides)
      const sources = new Set(stored.map((c) => c.knowledgeSourceId));
      for (const s of sources) await deleteChunksBySource(s);

      const vectors = await generateEmbeddingsBatch(wanted.map((w) => w.content));
      await upsertChunks(wanted.map((w, i) => ({ ...w, embedding: vectors[i] })));
      clearRetrievalCache(ASSISTANT_ID);
      console.info(`[PlatformGuides] synced ${wanted.length} guide chunks for ${ASSISTANT_ID}`);
    } catch (err) {
      done = null; // try again on a later request
      console.warn('[PlatformGuides] sync failed:', (err as Error)?.message);
    }
  })();
  return done;
}

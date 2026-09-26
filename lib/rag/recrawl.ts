import crypto from 'node:crypto';
import { Database } from '@/lib/db';
import { extractFromUrl } from './url-extractor';
import { chunkDocument } from './chunker';
import { generateEmbeddingsBatch, localEmbeddingsReady } from './embedder';
import { clearRetrievalCache } from './cache';
import { validateSafeExternalUrl } from '@/lib/security/ssrf';

export type RecrawlOutcome = 'unchanged' | 'updated' | 'failed' | 'skipped';

export interface RecrawlSummary {
  checked: number;
  updated: number;
  unchanged: number;
  failed: number;
  skipped?: string;
}

/** How long a web page stays as read before it is looked at again. */
export const recrawlIntervalMs = () => Math.max(1, Number(process.env.RECRAWL_DAYS) || 7) * 24 * 60 * 60 * 1000;

const hashOf = (text: string) => crypto.createHash('sha256').update(text).digest('hex');

/**
 * Reads one web page source again. If its text changed, the old passages are replaced with new ones; if not, nothing is rewritten. A page that
 * cannot be fetched keeps its old passages (a temporary outage must never empty a knowledge base) and is tried again after the next interval.
 */
export async function recrawlSource(sourceId: string): Promise<RecrawlOutcome> {
  const source = await Database.getKnowledgeSourceById(sourceId);
  if (!source || source.type !== 'web' || !source.fileUrl) return 'skipped';
  const touch = () => Database.updateKnowledgeSource(source.id, { status: 'ready' }); // moves the source to the back of the queue

  try {
    const safe = await validateSafeExternalUrl(source.fileUrl);
    if (!safe.safe) throw new Error(safe.error || 'blocked address');
    const assistant = await Database.getAssistantById(source.assistantId);
    const doc = await extractFromUrl(source.fileUrl, { apiKey: assistant?.apiKeyEncrypted, provider: assistant?.provider });
    if (!doc.content || !doc.content.trim()) throw new Error('empty page');

    const contentHash = hashOf(doc.content);
    const existing = await Database.getChunksBySource(source.id);
    if (existing.length > 0 && existing[0].metadata?.contentHash === contentHash) {
      await touch();
      return 'unchanged';
    }

    const raw = chunkDocument(doc);
    if (raw.length === 0) throw new Error('no readable text');
    const vectors = await generateEmbeddingsBatch(raw.map((c) => c.content));

    await Database.deleteChunksBySource(source.id);
    await Database.saveChunks(
      raw.map((chunk, i) => ({
        assistantId: source.assistantId,
        knowledgeSourceId: source.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
        metadata: { ...chunk.metadata, sourceTitle: source.title || doc.title, sourceType: doc.type, url: source.fileUrl, contentHash, crawledAt: new Date().toISOString() },
        embedding: vectors[i],
      }))
    );
    await Database.updateKnowledgeSource(source.id, { status: 'ready', chunkCount: raw.length, fileSizeBytes: Buffer.byteLength(doc.content, 'utf-8') });
    clearRetrievalCache(source.assistantId);
    return 'updated';
  } catch (err) {
    console.warn(`[Recrawl] ${source.fileUrl} not refreshed, keeping the old copy:`, (err as Error)?.message);
    await touch().catch(() => undefined);
    return 'failed';
  }
}

/** Refreshes the sources that are due, oldest first, within a time budget. */
export async function recrawlDueSources(options: { max?: number; budgetMs?: number } = {}): Promise<RecrawlSummary> {
  const max = options.max ?? 10;
  const budgetMs = options.budgetMs ?? 200_000;
  const started = Date.now();
  const summary: RecrawlSummary = { checked: 0, updated: 0, unchanged: 0, failed: 0 };

  const due = await Database.getDueWebSources(recrawlIntervalMs(), max);
  if (due.length === 0) return summary;
  if (!(await localEmbeddingsReady())) return { ...summary, skipped: 'The embedding model is not available on this server.' };

  for (const source of due) {
    if (Date.now() - started > budgetMs) break;
    const outcome = await recrawlSource(source.id);
    summary.checked++;
    if (outcome === 'updated') summary.updated++;
    else if (outcome === 'unchanged') summary.unchanged++;
    else if (outcome === 'failed') summary.failed++;
  }
  return summary;
}

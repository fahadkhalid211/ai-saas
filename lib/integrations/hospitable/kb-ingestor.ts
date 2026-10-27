/**
 * Hospitable KB Ingestor
 *
 * Chunks, embeds, and upserts a property document into the shared knowledge base.
 * Reuses the existing RAG pipeline — no new infrastructure required.
 *
 * Flow:
 *  1. Find and delete stale knowledge sources for this property
 *  2. Create a new knowledge_source row
 *  3. Split document into chunks
 *  4. Batch-embed chunks with the local @xenova/transformers model
 *  5. Persist chunks via Database.saveChunks()
 *  6. Clear retrieval cache for fresh queries
 */

import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { clearRetrievalCache } from '@/lib/rag/cache';
import { Database } from '@/lib/db';

/** Max characters per knowledge chunk (~400 tokens at 4 chars/token) */
const CHUNK_MAX_CHARS = 1600;
/** Overlap between consecutive chunks to preserve context continuity */
const CHUNK_OVERLAP_CHARS = 150;

export const HOSPITABLE_ID_PREFIX = 'hospitable:prop';

export function hospitableSourceKey(propertyDbId: string): string {
  return `[${HOSPITABLE_ID_PREFIX}:${propertyDbId}]`;
}

/**
 * Splits text into chunks by paragraph boundaries and character length.
 */
function chunkPropertyText(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length <= CHUNK_MAX_CHARS) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      if (para.length > CHUNK_MAX_CHARS) {
        for (let i = 0; i < para.length; i += CHUNK_MAX_CHARS - CHUNK_OVERLAP_CHARS) {
          chunks.push(para.slice(i, i + CHUNK_MAX_CHARS));
        }
        current = '';
      } else {
        current = para;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Ingests a property document into the knowledge base for the given assistant.
 *
 * @param assistantId  - The assistant that owns this knowledge
 * @param documentText - Full property document from buildPropertyDocument()
 * @param propertyDbId - UUID from hospitable_properties table
 * @param propertyName - Name of the property
 */
export async function ingestHospitableDocument(
  assistantId: string,
  documentText: string,
  propertyDbId: string,
  propertyName: string
): Promise<void> {
  const key = hospitableSourceKey(propertyDbId);
  const title = `${key} ${propertyName}`;

  // 1. Remove previous knowledge sources & chunks for this property
  const existing = await Database.getKnowledgeSources(assistantId);
  const previous = existing.find((s) => s.title.startsWith(key));
  if (previous) {
    await Database.deleteChunksBySource(previous.id);
    await Database.deleteKnowledgeSource(previous.id);
  }

  // 2. Create fresh knowledge source record
  const source = await Database.createKnowledgeSource({
    assistantId,
    title,
    type: 'custom',
    fileSizeBytes: Buffer.byteLength(documentText, 'utf-8'),
    status: 'processing',
  });

  // 3. Chunk the document
  const rawChunks = chunkPropertyText(documentText);
  if (rawChunks.length === 0) {
    await Database.deleteKnowledgeSource(source.id);
    return;
  }

  // 4. Generate embeddings in batch
  const embeddings = await generateEmbeddingsBatch(rawChunks, 8, 'passage');

  // 5. Save chunks
  await Database.saveChunks(
    rawChunks.map((content, i) => ({
      assistantId,
      knowledgeSourceId: source.id,
      content,
      chunkIndex: i,
      tokenCount: Math.ceil(content.length / 4),
      metadata: {
        sourceTitle: title,
        sourceType: 'hospitable',
        platform: 'hospitable',
        hospitablePropertyId: propertyDbId,
        isOverview: i === 0,
      },
      embedding: embeddings[i],
    }))
  );

  // 6. Update status and chunk count
  await Database.updateKnowledgeSource(source.id, {
    status: 'ready',
    chunkCount: rawChunks.length,
  });

  // 7. Bust RAG retrieval cache so subsequent chat questions see new chunks
  clearRetrievalCache(assistantId);

  console.log(
    `[hospitable-ingest] Ingested property "${propertyName}" → ${rawChunks.length} chunk(s) into assistant ${assistantId}`
  );
}

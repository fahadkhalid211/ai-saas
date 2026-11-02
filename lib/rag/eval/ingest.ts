import type { EvalSet } from './harness';

/**
 * Loads an evaluation corpus into a throw-away assistant using the SAME steps as a real upload
 * (parse, chunk, embed, store), so what is measured is the production path.
 * Only call this when DATABASE_URL points at an isolated database or is empty (the CLI guarantees that).
 */
export async function ingestCorpus(set: EvalSet): Promise<{ assistantId: string; docBySource: Map<string, string> }> {
  const { Database } = await import('../../db');
  const { parseFileOrText } = await import('../parsers');
  const { chunkDocument } = await import('../chunker');
  const { generateEmbeddingsBatch } = await import('../embedder');

  const assistant = await Database.createAssistant({ name: `RAG eval ${Date.now().toString(36)}`, workspaceId: 'rag-eval-workspace' });
  const docBySource = new Map<string, string>();

  for (const doc of set.corpus) {
    const filename = `${doc.title}.txt`;
    const source = await Database.createKnowledgeSource({ assistantId: assistant.id, title: filename, type: 'txt', fileSizeBytes: doc.text.length, status: 'processing' });
    docBySource.set(source.id, doc.id);

    const parsed = await parseFileOrText({ filename, type: 'txt', buffer: Buffer.from(doc.text, 'utf-8') });
    const chunks = chunkDocument(parsed);
    // Experiment: RAG_EVAL_CONTEXT=1 embeds each passage with its document title and section in front ("contextual" embeddings).
    // The stored text is unchanged; only what the vector is made from.
    const withContext = process.env.RAG_EVAL_CONTEXT === '1';
    const embeddings = await generateEmbeddingsBatch(
      chunks.map((c) => (withContext ? `${doc.title}${c.metadata?.section ? ' - ' + c.metadata.section : ''}
${c.content}` : c.content))
    );
    await Database.saveChunks(
      chunks.map((chunk, i) => ({
        assistantId: assistant.id,
        knowledgeSourceId: source.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
        metadata: { ...chunk.metadata, sourceTitle: filename, sourceType: parsed.type || 'txt' },
        embedding: embeddings[i],
      }))
    );
    await Database.updateKnowledgeSource(source.id, { status: 'ready', chunkCount: chunks.length });
  }
  return { assistantId: assistant.id, docBySource };
}

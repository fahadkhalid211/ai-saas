import { Database } from '../db';
import { generateEmbedding } from './embedder';
import { Citation, SearchResultChunk } from './types';

export interface RetrievalResult {
  condensedQuery: string;
  chunks: SearchResultChunk[];
  contextText: string;
  citations: Citation[];
}

/**
 * Condense multi-turn query if history is present.
 * Keeps it fast and lightweight without adding unnecessary latency.
 */
export function condenseQuery(
  latestMessage: string,
  history: { role: string; content: string }[] = []
): string {
  if (history.length === 0) return latestMessage;

  // Find the last 2 user/assistant interactions
  const recentHistory = history.slice(-3);
  const subjectHints: string[] = [];

  for (const msg of recentHistory) {
    // Extract key noun phrases or words with uppercase/digits (e.g. SKU, product names)
    const words = msg.content.split(/\s+/).filter((w) => w.length > 3);
    if (words.length > 0) {
      subjectHints.push(words.slice(0, 5).join(' '));
    }
  }

  // If latest message is very short/ambiguous (e.g. "how much?", "is it in stock?", "what about shipping?")
  const isAmbiguous = latestMessage.split(/\s+/).length <= 4 &&
    /^(how|what|is|can|where|when|why|tell|give|do|does|price|cost|shipping)/i.test(latestMessage.trim());

  if (isAmbiguous && subjectHints.length > 0) {
    return `${subjectHints[subjectHints.length - 1]} ${latestMessage}`;
  }

  return latestMessage;
}

/**
 * Retrieve relevant knowledge chunks using Hybrid Search (Vector + Keyword)
 */
export async function retrieveRelevantContext(
  assistantId: string,
  userMessage: string,
  history: { role: string; content: string }[] = [],
  topK: number = 5
): Promise<RetrievalResult> {
  const condensedQuery = condenseQuery(userMessage, history);
  
  // 1. Generate 384-dimensional query embedding with local open-source embedder
  const queryEmbedding = await generateEmbedding(condensedQuery);

  // 2. Perform Hybrid Search
  const chunks = await Database.hybridSearch(assistantId, condensedQuery, queryEmbedding, topK);

  // 3. Format citations
  const citations: Citation[] = chunks.map((c) => ({
    sourceTitle: c.metadata.sourceTitle || 'Knowledge Source',
    sourceType: c.metadata.sourceType || 'document',
    chunkIndex: c.chunkIndex,
    preview: c.content.slice(0, 160).replace(/\s+/g, ' ') + '...',
    page: c.metadata.page,
    row: c.metadata.row,
  }));

  // 4. Format context block for LLM prompt
  if (chunks.length === 0) {
    return {
      condensedQuery,
      chunks: [],
      contextText: 'No relevant business documentation was found in the knowledge base.',
      citations: [],
    };
  }

  const contextText = chunks
    .map((chunk, i) => {
      const sourceTag = chunk.metadata.sourceTitle ? `[Source: ${chunk.metadata.sourceTitle}]` : '';
      return `--- KNOWLEDGE FRAGMENT [${i + 1}] ${sourceTag} ---\n${chunk.content}`;
    })
    .join('\n\n');

  return {
    condensedQuery,
    chunks,
    contextText,
    citations,
  };
}

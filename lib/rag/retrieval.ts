import { Database } from '../db';
import { generateEmbedding } from './embedder';
import { Citation, SearchResultChunk } from './types';

export interface RetrievalResult {
  condensedQuery: string;
  chunks: SearchResultChunk[];
  contextText: string;
  citations: Citation[];
}

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
 * Detect if user is asking for a comprehensive or global overview of a document or video
 */
export function isGlobalOverviewQuery(query: string): boolean {
  return /\b(complete|full|entire|whole|all|overview|summary|summarize|walkthrough|outline|explain (the|her|his|this)? ?(video|audio|document|presentation)|about the video|about her video)\b/i.test(query);
}

/**
 * Detect if user is asking for counts, quantities, totals, statistics, or dataset summaries
 */
export function isCountOrAggregationQuery(query: string): boolean {
  return /\b(how many|total|count|number of|sum of|how much|registered|signed up|signups|members|users|rows|records|entries|how many people|breakdown|statistics)\b/i.test(query);
}

/**
 * Detect if user is asking an open-ended question about budgets, prices, rates, or services
 */
export function isBroadPricingOrBudgetQuery(query: string): boolean {
  const clean = query.trim().toLowerCase();
  return (
    /\b(budget|budgets|pricing|prices|price|cost|costs|rate|rates|fee|fees|how much|menu|service list|services list|charge|charges)\b/i.test(clean) &&
    (/\b(what|how|show|give|tell|list|any|the|all|menu|our|your)\b/i.test(clean) || clean.split(/\s+/).length <= 4)
  );
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
  const isOverview = isGlobalOverviewQuery(condensedQuery);
  const isCountQuery = isCountOrAggregationQuery(condensedQuery);
  const isBroadPricing = isBroadPricingOrBudgetQuery(condensedQuery);
  const effectiveTopK = isOverview ? Math.max(topK, 8) : isBroadPricing ? Math.max(topK, 12) : isCountQuery ? 4 : topK;
  
  // 1. Generate 384-dimensional query embedding with local open-source embedder (cached)
  let queryEmbedding = getCachedEmbedding(condensedQuery);
  if (!queryEmbedding) {
    queryEmbedding = await generateEmbedding(condensedQuery);
    setCachedEmbedding(condensedQuery, queryEmbedding);
  }

  // 2. Perform Hybrid Search
  let chunks = await Database.hybridSearch(assistantId, condensedQuery, queryEmbedding, effectiveTopK * 2);

  // 2.5. Broad pricing or budget query: ensure all chunks containing pricing/budget info across projects/services are included
  if (isBroadPricing) {
    const assistantChunks = await Database.getChunksByAssistant(assistantId);
    const pricingChunks = assistantChunks.filter((c) =>
      /\b(budget|budgets|price|prices|pricing|cost|costs|rate|rates|fee|fees|\$|usd|eur|haircut|service|project)\b/i.test(
        `${c.content} ${c.metadata?.sourceTitle || ''}`
      )
    );

    if (pricingChunks.length > 0) {
      const combined: SearchResultChunk[] = [...chunks];
      const seen = new Set<string>(chunks.map((c) => c.id || `chunk_${c.chunkIndex}`));

      for (const pc of pricingChunks) {
        const pcId = pc.id || `chunk_${pc.chunkIndex}`;
        if (!seen.has(pcId) && combined.length < effectiveTopK) {
          combined.push({
            id: pc.id,
            content: pc.content,
            chunkIndex: pc.chunkIndex,
            tokenCount: pc.tokenCount,
            metadata: pc.metadata as any,
            knowledgeSourceId: pc.knowledgeSourceId,
            similarity: 0.85,
          });
          seen.add(pcId);
        }
      }
      chunks = combined;
    }
  }

  // 3. If count/aggregation query: prioritize Dataset Master Overview chunk(s)
  if (isCountQuery) {
    const assistantChunks = await Database.getChunksByAssistant(assistantId);
    const overviewChunks = assistantChunks.filter(
      (c) =>
        c.metadata?.isOverview ||
        c.content.includes('DATASET MASTER OVERVIEW') ||
        c.content.includes('Total Registered Members') ||
        c.content.includes('Total Records')
    );

    if (overviewChunks.length > 0) {
      const combined: SearchResultChunk[] = [];
      const seen = new Set<string>();

      for (const ov of overviewChunks) {
        if (!seen.has(ov.id)) {
          combined.push({
            id: ov.id,
            content: ov.content,
            chunkIndex: ov.chunkIndex,
            tokenCount: ov.tokenCount,
            metadata: ov.metadata as any,
            knowledgeSourceId: ov.knowledgeSourceId,
            similarity: 1.0,
          });
          seen.add(ov.id);
        }
      }

      for (const c of chunks) {
        const cId = c.id || `chunk_${c.chunkIndex}`;
        if (!seen.has(cId) && combined.length < 4) {
          combined.push(c);
          seen.add(cId);
        }
      }

      chunks = combined;
    } else {
      chunks = chunks.slice(0, effectiveTopK);
    }
  } else if (isOverview && chunks.length > 0) {
    // Determine the primary target source (the one with highest rank or matching name)
    const primarySourceId = chunks[0].knowledgeSourceId;
    const allSourceChunks = await Database.getChunksBySource(primarySourceId);

    if (allSourceChunks.length > 5) {
      const overviewChunk = allSourceChunks.find((c) => c.metadata?.isOverview);
      const regularChunks = allSourceChunks.filter((c) => !c.metadata?.isOverview);

      // Sample representative timeline milestones across the entire resource
      const ratios = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 0.98];
      const milestoneIndices = ratios.map((p) =>
        Math.min(regularChunks.length - 1, Math.floor(p * regularChunks.length))
      );
      const uniqueIndices = Array.from(new Set(milestoneIndices));

      const combined: SearchResultChunk[] = [];
      const seen = new Set<string>();

      // Put Master Overview chunk first if available
      if (overviewChunk) {
        combined.push({
          id: overviewChunk.id,
          content: overviewChunk.content,
          chunkIndex: overviewChunk.chunkIndex,
          tokenCount: overviewChunk.tokenCount,
          metadata: overviewChunk.metadata as any,
          knowledgeSourceId: overviewChunk.knowledgeSourceId,
          similarity: 1.0,
        });
        seen.add(overviewChunk.id);
      }

      // Add timeline milestone chunks
      for (const idx of uniqueIndices) {
        const c = regularChunks[idx];
        if (c && !seen.has(c.id)) {
          combined.push({
            id: c.id,
            content: c.content,
            chunkIndex: c.chunkIndex,
            tokenCount: c.tokenCount,
            metadata: c.metadata as any,
            knowledgeSourceId: c.knowledgeSourceId,
            similarity: 0.9,
          });
          seen.add(c.id);
        }
      }

      // Add top semantic search matches that belong to this source
      for (const c of chunks) {
        const cId = c.id || `chunk_${c.chunkIndex}`;
        if (!seen.has(cId) && c.knowledgeSourceId === primarySourceId && combined.length < effectiveTopK + 2) {
          combined.push(c);
          seen.add(cId);
        }
      }

      chunks = combined.slice(0, effectiveTopK);
    } else {
      chunks = chunks.slice(0, effectiveTopK);
    }
  } else {
    chunks = chunks.slice(0, topK);
  }

  // 4. Internal Knowledge Base Citations - Strictly disabled for internal knowledge base
  // Customer-facing chat should NEVER expose internal knowledge base files, private documents, or training URLs.
  // External web sources are only cited when a live web search is actively performed.

  // 5. Format context block for LLM prompt
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
      const timeTag = chunk.metadata?.formattedTime ? ` (Timestamp: ${chunk.metadata.formattedTime})` : '';
      return `--- KNOWLEDGE FRAGMENT [${i + 1}] ${sourceTag}${timeTag} ---\n${chunk.content}`;
    })
    .join('\n\n');

  return {
    condensedQuery,
    chunks,
    contextText,
    citations: [],
  };
}

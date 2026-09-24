import { Database } from '../db';
import { generateEmbedding } from './embedder';
import { Citation, SearchResultChunk } from './types';
import { rerankCandidates, deduplicateChunks } from './rerank';
import { expandQueryWithSynonyms, areTermsSynonymous } from './synonyms';

export { type RetrievalResult } from './types';
import {
  getCachedEmbedding,
  setCachedEmbedding,
  clearEmbeddingCache,
  getCachedRetrieval,
  setCachedRetrieval,
  clearRetrievalCache,
  getRedisCachedRetrieval,
  setRedisCachedRetrieval,
} from './cache';
export {
  getCachedEmbedding,
  setCachedEmbedding,
  clearEmbeddingCache,
  getCachedRetrieval,
  setCachedRetrieval,
  clearRetrievalCache,
  getRedisCachedRetrieval,
  setRedisCachedRetrieval,
};
import { RetrievalResult } from './types';
import { crossEncoderEnabled, crossEncoderRerank } from './cross-encoder';
import { prepareQuery, resolveFollowUp, fuseRankings } from './query-prep';

/**
 * Condense multi-turn query if history is present.
 * Keeps it fast and lightweight without adding unnecessary latency.
 */
export function condenseQuery(
  latestMessage: string,
  history: { role: string; content: string }[] = []
): string {
  return resolveFollowUp(latestMessage, history);
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
 * Detect if user turn is purely conversational (greeting, thanks, acknowledgment, or slot-filling),
 * allowing Tier 0 retrieval gating to bypass RAG vector/FTS search and respond with sub-1ms overhead.
 */
export function isPurelyConversationalTurn(
  message: string,
  history: { role: string; content: string }[] = []
): boolean {
  // Strip outer punctuation and whitespace
  const clean = message.trim().toLowerCase().replace(/^[^\w@+]+|[^\w@+]+$/g, '').trim();
  if (clean.length === 0) return true;

  // 1. Common greetings and basic conversational openers
  const greetingPattern = /^(hi|hello|hey|heya|howdy|greetings|hi\s+there|hello\s+there|hey\s+there|good\s+(morning|afternoon|evening|day)|how\s+are\s+you|how\s+are\s+you\s+doing|how's\s+it\s+going|yo)$/i;
  if (greetingPattern.test(clean)) return true;

  // 2. Common thanks, closings, acknowledgments
  const closingPattern = /^(thanks|thank\s+you|thanks\s+a\s+lot|thank\s+you\s+so\s+much|ok\s+thanks|okay\s+thanks|bye|goodbye|see\s+you|see\s+ya|have\s+a\s+(good|great)\s+day)$/i;
  if (closingPattern.test(clean)) return true;

  // 3. Simple acknowledgments or short confirmations
  const ackPattern = /^(yes|no|yep|nope|sure|ok|okay|sounds\s+good|perfect|great|cool|awesome|got\s+it|ok\s+got\s+it|okay\s+got\s+it|understood|no\s+problem|alright)$/i;
  if (ackPattern.test(clean)) return true;

  // 4. Standalone email or phone submissions (lead capture turns)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
  if (emailPattern.test(clean) || phonePattern.test(clean)) return true;

  // 5. Short appointment slot specifications (e.g. "tomorrow at 3pm", "monday 10am")
  const slotPattern = /^(tomorrow|today|yesterday|(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday))(\s+(at\s+)?\d{1,2}(:\d{2})?\s*(am|pm)?)?$/i;
  if (slotPattern.test(clean)) return true;

  return false;
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
  const prepared = await prepareQuery(userMessage, history);
  const condensedQuery = prepared.query;

  // Fast Path: Check L1 RAM retrieval result cache for repeat queries (sub-1ms response)
  const cachedRetrieval = getCachedRetrieval(assistantId, condensedQuery);
  if (cachedRetrieval) {
    return cachedRetrieval;
  }

  // Fast Path L2: Check Upstash Redis cache across serverless instances
  const redisRetrieval = await getRedisCachedRetrieval(assistantId, condensedQuery);
  if (redisRetrieval) {
    setCachedRetrieval(assistantId, condensedQuery, redisRetrieval);
    return redisRetrieval;
  }

  const isOverview = isGlobalOverviewQuery(condensedQuery);
  const isCountQuery = isCountOrAggregationQuery(condensedQuery);
  const isBroadPricing = isBroadPricingOrBudgetQuery(condensedQuery);
  const poolFactor = 2;
  const effectiveTopK = isOverview ? Math.max(topK, 8) : isBroadPricing ? Math.max(topK, 12) : isCountQuery ? 4 : topK;

  // 1. Fetch assistant knowledge sources for title context and synonym correlation
  const knowledgeSources = await Database.getKnowledgeSources(assistantId);
  const sourceTitles = knowledgeSources.map((s) => s.title).filter(Boolean);

  // 2. Expand query with universal synonyms and knowledge base titles
  const { expandedQuery, synonymKeywords } = expandQueryWithSynonyms(condensedQuery, sourceTitles);
  
  // 3. Generate 384-dimensional query embedding on the natural user query (condensedQuery),
  // preserving natural semantic sentence structure rather than embedding artificial synonym keyword soup
  let queryEmbedding = getCachedEmbedding(condensedQuery);
  if (!queryEmbedding) {
    queryEmbedding = await generateEmbedding(condensedQuery);
    setCachedEmbedding(condensedQuery, queryEmbedding);
  }

  // 4. Perform Hybrid Search: dense vector from condensedQuery + sparse keyword search from expandedQuery
  let chunks = await Database.hybridSearch(assistantId, expandedQuery, queryEmbedding, effectiveTopK * poolFactor);

  // 4.05. Alternative phrasings written by the query rewriter: search each, then fuse the rankings
  if (prepared.variants.length > 0) {
    const others = await Promise.all(
      prepared.variants.map(async (v) => {
        const emb = await generateEmbedding(v);
        return Database.hybridSearch(assistantId, expandQueryWithSynonyms(v, sourceTitles).expandedQuery, emb, effectiveTopK * poolFactor);
      })
    ).catch(() => [] as SearchResultChunk[][]);
    chunks = fuseRankings([chunks, ...others], effectiveTopK * poolFactor);
  }

  // 4.1. Fallback to raw condensed query if expanded query returned no results
  if (chunks.length === 0 && expandedQuery !== condensedQuery) {
    chunks = await Database.hybridSearch(assistantId, condensedQuery, queryEmbedding, effectiveTopK * poolFactor);
  }

  // 4.2. Dynamic Concept Fallback: If still 0 chunks, check if any knowledge source matches concept
  if (chunks.length === 0 && knowledgeSources.length > 0) {
    const matchedSource = knowledgeSources.find((s) => {
      const titleLower = s.title.toLowerCase();
      return (
        areTermsSynonymous(condensedQuery, titleLower) ||
        synonymKeywords.some((kw) => titleLower.includes(kw.toLowerCase()))
      );
    });

    if (matchedSource) {
      const sourceChunks = await Database.getChunksBySource(matchedSource.id);
      if (sourceChunks.length > 0) {
        chunks = sourceChunks.slice(0, effectiveTopK).map((c) => ({
          id: c.id,
          content: c.content,
          chunkIndex: c.chunkIndex,
          tokenCount: c.tokenCount,
          metadata: c.metadata as any,
          knowledgeSourceId: c.knowledgeSourceId,
          similarity: 0.95,
        }));
      }
    }
  }

  // 2.5. Broad pricing or budget query: ensure pricing chunks are pulled via scoped query
  if (isBroadPricing) {
    const pricingChunks = await Database.getPricingChunks(assistantId, effectiveTopK);
    if (pricingChunks.length > 0) {
      const combined: SearchResultChunk[] = [...chunks];
      const seen = new Set<string>(chunks.map((c) => c.id || `chunk_${c.chunkIndex}`));

      for (const pc of pricingChunks) {
        const pcId = pc.id || `chunk_${pc.chunkIndex}`;
        if (!seen.has(pcId) && combined.length < effectiveTopK) {
          combined.push(pc);
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
    chunks = chunks.slice(0, topK * poolFactor);
  }

  // 3.8. Semantic Reranking & Near-Duplicate Deduplication
  if (chunks.length > 1 && !isOverview && !isCountQuery) {
    chunks = rerankCandidates(condensedQuery, chunks, crossEncoderEnabled() ? effectiveTopK * poolFactor : effectiveTopK);
    if (crossEncoderEnabled()) chunks = await crossEncoderRerank(condensedQuery, chunks, effectiveTopK);
  } else if (chunks.length > 1) {
    chunks = deduplicateChunks(chunks);
  }

  // 4. Internal Knowledge Base Citations - Strictly disabled for internal knowledge base
  // Customer-facing chat should NEVER expose internal knowledge base files, private documents, or training URLs.
  // External web sources are only cited when a live web search is actively performed.

  // 5. Format context block for LLM prompt
  if (chunks.length === 0) {
    const emptyResult: RetrievalResult = {
      condensedQuery,
      chunks: [],
      contextText: 'No relevant business documentation was found in the knowledge base.',
      citations: [],
    };
    setCachedRetrieval(assistantId, condensedQuery, emptyResult);
    return emptyResult;
  }

  const contextText = chunks
    .map((chunk, i) => {
      const sourceTag = chunk.metadata.sourceTitle ? `[Source: ${chunk.metadata.sourceTitle}]` : '';
      const timeTag = chunk.metadata?.formattedTime ? ` (Timestamp: ${chunk.metadata.formattedTime})` : '';
      return `--- KNOWLEDGE FRAGMENT [${i + 1}] ${sourceTag}${timeTag} ---\n${chunk.content}`;
    })
    .join('\n\n');

  const finalResult: RetrievalResult = {
    condensedQuery,
    chunks,
    contextText,
    citations: [],
  };
  setCachedRetrieval(assistantId, condensedQuery, finalResult);
  setRedisCachedRetrieval(assistantId, condensedQuery, finalResult).catch(() => {});
  return finalResult;
}

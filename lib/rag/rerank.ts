import { SearchResultChunk } from './types';

/**
 * Stop words for lexical density filtering in reranker
 */
const RERANK_STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'could', 'did', 'do',
  'does', 'for', 'from', 'had', 'has', 'have', 'how', 'i', 'in', 'is', 'it', 'its', 'may',
  'me', 'might', 'must', 'my', 'no', 'not', 'of', 'on', 'or', 'our', 'shall', 'should',
  'so', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
  'to', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'who', 'whom', 'will',
  'with', 'would', 'you', 'your', 'please', 'tell', 'give', 'show', 'much', 'many',
]);

/**
 * Computes a fine-grained cross-matching relevance score between a query and a candidate chunk.
 * Considers:
 * 1. Heading and source title match (structural relevance)
 * 2. Exact multi-word phrase match
 * 3. Query term coverage (recall)
 * 4. Sentence-level term proximity (co-occurrence in the same sentence)
 */
export function crossScoreRelevance(query: string, chunk: SearchResultChunk): number {
  if (!query || !chunk || !chunk.content) return 0;

  const cleanQuery = query.toLowerCase().trim();
  const chunkText = chunk.content.toLowerCase();
  const title = (chunk.metadata?.sourceTitle || '').toLowerCase();
  const section = (chunk.metadata?.section || '').toLowerCase();

  // Extract non-stop query terms
  const queryTerms = cleanQuery
    .split(/[^a-z0-9_]+/i)
    .filter((t) => t.length >= 2 && !RERANK_STOP_WORDS.has(t));

  if (queryTerms.length === 0) {
    return chunk.similarity || 0.5;
  }

  // 1. Heading & Metadata Alignment (up to 0.25 bonus)
  let headingBonus = 0;
  for (const term of queryTerms) {
    if (section.includes(term)) headingBonus += 0.15;
    if (title.includes(term)) headingBonus += 0.10;
  }
  headingBonus = Math.min(0.25, headingBonus);

  // 2. Exact Phrase Match (up to 0.35 bonus)
  let exactPhraseBonus = 0;
  if (cleanQuery.length > 5 && chunkText.includes(cleanQuery)) {
    exactPhraseBonus = 0.35;
  } else {
    // Check 2-word and 3-word n-gram matches
    for (let i = 0; i < queryTerms.length - 1; i++) {
      const bigram = `${queryTerms[i]} ${queryTerms[i + 1]}`;
      if (chunkText.includes(bigram)) {
        exactPhraseBonus += 0.12;
      }
    }
    exactPhraseBonus = Math.min(0.35, exactPhraseBonus);
  }

  // 3. Query Term Coverage (up to 0.40)
  let matchedTermsCount = 0;
  for (const term of queryTerms) {
    if (chunkText.includes(term)) {
      matchedTermsCount++;
    }
  }
  const termCoverage = (matchedTermsCount / queryTerms.length) * 0.40;

  // 4. Proximity: Do multiple query terms appear together in the same sentence? (up to 0.20)
  let proximityBonus = 0;
  const sentences = chunkText.split(/(?<=[.?!])\s+/);
  for (const sentence of sentences) {
    let countInSentence = 0;
    for (const term of queryTerms) {
      if (sentence.includes(term)) countInSentence++;
    }
    if (countInSentence >= 2) {
      proximityBonus = Math.max(proximityBonus, (countInSentence / queryTerms.length) * 0.20);
    }
  }

  // Total cross-matching score
  const crossScore = headingBonus + exactPhraseBonus + termCoverage + proximityBonus;
  return Math.min(1.0, crossScore);
}

/**
 * Deduplicates near-duplicate or heavily overlapping candidate chunks
 * to conserve prompt context budget and ensure diverse factual grounding.
 */
export function deduplicateChunks(chunks: SearchResultChunk[], threshold = 0.82): SearchResultChunk[] {
  if (chunks.length <= 1) return chunks;

  const getWords = (text: string): Set<string> => {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
  };

  const wordSets = chunks.map((c) => getWords(c.content));
  const selected: SearchResultChunk[] = [];
  const selectedWordSets: Set<string>[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const cand = chunks[i];
    const candWords = wordSets[i];
    let isDuplicate = false;

    for (let j = 0; j < selected.length; j++) {
      const existing = selected[j];
      const existingWords = selectedWordSets[j];

      // Exact substring or extreme containment
      if (
        (cand.content.length > 80 && existing.content.includes(cand.content.slice(0, 120))) ||
        (existing.content.length > 80 && cand.content.includes(existing.content.slice(0, 120)))
      ) {
        isDuplicate = true;
        break;
      }

      // Jaccard similarity check on word sets
      if (candWords.size > 0 && existingWords.size > 0) {
        let intersection = 0;
        for (const w of candWords) {
          if (existingWords.has(w)) intersection++;
        }
        const union = candWords.size + existingWords.size - intersection;
        const jaccard = union > 0 ? intersection / union : 0;
        if (jaccard >= threshold) {
          isDuplicate = true;
          break;
        }
      }
    }

    if (!isDuplicate) {
      selected.push(cand);
      selectedWordSets.push(candWords);
    }
  }

  return selected;
}

/**
 * Reranks candidate chunks using a hybrid fusion of RRF initial rank and fine-grained cross-scoring.
 * Prioritizes chunks with heading alignment, sentence co-occurrence, and phrase containment.
 */
export function rerankCandidates(
  query: string,
  candidates: SearchResultChunk[],
  topK: number = 5
): SearchResultChunk[] {
  if (candidates.length <= 1) return candidates;

  // 1. Remove near-duplicates first to avoid duplicate entries in top-K
  const deduped = deduplicateChunks(candidates);

  // 2. Score each candidate with cross-encoder relevance
  const scored = deduped.map((chunk, idx) => {
    const crossScore = crossScoreRelevance(query, chunk);
    // Position-based rank decay from initial RRF ranking (1.0 for rank 0, decaying to ~0.5 for rank 15)
    const rrfRankWeight = 1 / (1 + idx * 0.08);
    // Composite rerank score
    const finalScore = 0.55 * crossScore + 0.45 * rrfRankWeight;

    return {
      chunk: {
        ...chunk,
        similarity: finalScore,
      },
      finalScore,
    };
  });

  // 3. Sort descending by composite rerank score
  scored.sort((a, b) => b.finalScore - a.finalScore);

  return scored.slice(0, topK).map((s) => s.chunk);
}

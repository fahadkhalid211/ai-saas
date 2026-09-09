/**
 * Vector Mathematics and Hybrid Scoring Algorithms
 */

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Keyword BM25-style full-text relevance score
 */
export function keywordRelevance(query: string, content: string): number {
  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((term) => term.length > 2);

  if (queryTerms.length === 0) return 0;

  const contentLower = content.toLowerCase();
  let matches = 0;
  for (const term of queryTerms) {
    // Check term presence & count occurrences
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matchCount = (contentLower.match(regex) || []).length;
    if (matchCount > 0) {
      matches += 1 + Math.log(matchCount);
    }
  }

  return matches / queryTerms.length;
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Combines rankings from dense vector retrieval and sparse keyword search.
 */
export function reciprocalRankFusion<T extends { id: string }>(
  vectorRankedList: T[],
  keywordRankedList: T[],
  k: number = 60
): (T & { rrfScore: number })[] {
  const scoreMap = new Map<string, { item: T; score: number }>();

  vectorRankedList.forEach((item, rank) => {
    const rrf = 1 / (k + (rank + 1));
    scoreMap.set(item.id, { item, score: rrf });
  });

  keywordRankedList.forEach((item, rank) => {
    const rrf = 1 / (k + (rank + 1));
    if (scoreMap.has(item.id)) {
      const existing = scoreMap.get(item.id)!;
      existing.score += rrf;
    } else {
      scoreMap.set(item.id, { item, score: rrf });
    }
  });

  return Array.from(scoreMap.values())
    .map(({ item, score }) => ({ ...item, rrfScore: score }))
    .sort((a, b) => b.rrfScore - a.rrfScore);
}

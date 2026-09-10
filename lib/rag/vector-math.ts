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
 * Multilingual Keyword Relevance Score
 * Supports Latin, alphanumeric symbols, Chinese, Japanese, Korean, Arabic, etc.
 */
export function keywordRelevance(query: string, content: string): number {
  if (!query || !content) return 0;
  const cleanQuery = query.toLowerCase();
  const contentLower = content.toLowerCase();

  // Extract CJK / non-Latin characters (Chinese, Japanese, Korean)
  const cjkChars = cleanQuery.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || [];

  // Extract alphanumeric tokens, splitting on punctuation and whitespace (e.g. "le", "feng", "video", "mov")
  const alphaTokens = cleanQuery
    .replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ')
    .split(/[^a-z0-9_]+/i)
    .filter((t) => t.length >= 2);

  const queryTerms = [...new Set([...alphaTokens, ...cjkChars])];
  if (queryTerms.length === 0) return 0;

  let matches = 0;
  for (const term of queryTerms) {
    if (contentLower.includes(term)) {
      matches += 1;
    }
  }

  return matches / queryTerms.length;
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Combines rankings from dense vector retrieval and sparse keyword search.
 * Only awards rank points to items with positive similarity / keyword relevance.
 */
export function reciprocalRankFusion<T extends { id: string; score?: number }>(
  vectorRankedList: T[],
  keywordRankedList: T[],
  k: number = 60
): (T & { rrfScore: number })[] {
  const scoreMap = new Map<string, { item: T; score: number }>();

  // Only consider items with positive vector score
  vectorRankedList
    .filter((item) => (item.score ?? 0) > 0)
    .forEach((item, rank) => {
      const rrf = 1 / (k + (rank + 1)) + (item.score ?? 0) * 0.05;
      scoreMap.set(item.id, { item, score: rrf });
    });

  // ONLY award keyword rank bonus if item actually matched keywords (score > 0)!
  keywordRankedList
    .filter((item) => (item.score ?? 0) > 0)
    .forEach((item, rank) => {
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

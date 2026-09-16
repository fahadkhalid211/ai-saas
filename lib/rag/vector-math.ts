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

const STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'could', 'did', 'do',
  'does', 'for', 'from', 'had', 'has', 'have', 'how', 'i', 'in', 'is', 'it', 'its', 'may',
  'me', 'might', 'must', 'my', 'no', 'not', 'of', 'on', 'or', 'our', 'shall', 'should',
  'so', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
  'to', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'who', 'whom', 'will',
  'with', 'would', 'you', 'your', 'please', 'tell', 'give', 'show', 'much', 'many',
]);

const SYNONYM_GROUPS: string[][] = [
  ['budget', 'budgets', 'cost', 'costs', 'pricing', 'price', 'fee', 'fees', 'rate', 'rates', 'quote', 'financial', 'allocation', 'fund', 'funds', '$', 'usd', 'eur'],
  ['price', 'prices', 'pricing', 'cost', 'costs', 'fee', 'fees', 'rate', 'rates', 'charge', 'charges', 'quote', 'package', 'packages', 'tier', 'tiers', '$', 'usd', 'eur'],
  ['service', 'services', 'offering', 'offerings', 'package', 'packages', 'menu', 'treatment', 'treatments', 'options'],
  ['haircut', 'cut', 'hair', 'trim', 'fade', 'beard', 'shave', 'styling', 'barber'],
  ['appointment', 'booking', 'reserve', 'reservation', 'schedule', 'slot', 'book'],
  ['hour', 'hours', 'timing', 'schedule', 'open', 'opening', 'close', 'closing', 'time', 'days'],
  ['location', 'address', 'directions', 'where', 'place', 'street', 'city'],
];

function stemWord(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

function matchesTerm(
  term: string,
  contentLower: string,
  compactContent: string,
  dePluralContent: string
): boolean {
  if (contentLower.includes(term)) return true;

  const stemmed = stemWord(term);
  if (stemmed !== term && contentLower.includes(stemmed)) return true;

  const compactTerm = term.replace(/[^a-z0-9]/g, '');
  if (compactTerm.length >= 3 && compactContent.includes(compactTerm)) return true;

  const dePluralTerm = compactTerm.replace(/s+/g, '');
  if (dePluralTerm.length >= 3 && dePluralContent.includes(dePluralTerm)) return true;

  if (term.length >= 6) {
    for (let i = 3; i <= term.length - 3; i++) {
      const left = term.slice(0, i);
      const right = term.slice(i);
      const leftStem = stemWord(left);
      const rightStem = stemWord(right);

      const leftMatch = contentLower.includes(left) || contentLower.includes(leftStem);
      const rightMatch = contentLower.includes(right) || contentLower.includes(rightStem);
      if (leftMatch && rightMatch) return true;
    }
  }

  for (const group of SYNONYM_GROUPS) {
    const isTermInGroup = group.some((syn) => syn === term || stemWord(syn) === stemmed);
    if (isTermInGroup) {
      for (const syn of group) {
        if (contentLower.includes(syn)) return true;
      }
    }
  }

  return false;
}

/**
 * Multilingual Keyword Relevance Score
 * Supports Latin, alphanumeric symbols, compound words, business synonyms, and CJK
 */
export function keywordRelevance(query: string, content: string): number {
  if (!query || !content) return 0;
  const cleanQuery = query.toLowerCase();
  const contentLower = content.toLowerCase();
  const compactContent = contentLower.replace(/[^a-z0-9]/g, '');
  const dePluralContent = compactContent.replace(/s+/g, '');

  // Extract CJK / non-Latin characters (Chinese, Japanese, Korean)
  const cjkChars = cleanQuery.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || [];

  // Extract alphanumeric tokens, splitting on punctuation and whitespace
  const alphaTokens = cleanQuery
    .replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ')
    .split(/[^a-z0-9_]+/i)
    .filter((t) => t.length >= 2);

  const rawTokens = [...new Set([...alphaTokens, ...cjkChars])];
  if (rawTokens.length === 0) return 0;

  const filteredTokens = rawTokens.filter((t) => !STOP_WORDS.has(t));
  const queryTerms = filteredTokens.length > 0 ? filteredTokens : rawTokens;

  let matches = 0;
  for (const term of queryTerms) {
    if (matchesTerm(term, contentLower, compactContent, dePluralContent)) {
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

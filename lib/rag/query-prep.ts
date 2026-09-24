import type { SearchResultChunk } from './types';

/**
 * Query preparation: what is asked of the index is not the raw chat message.
 *  1. resolveFollowUp: "and how many assistants does it include?" becomes a question that stands on its own, using the
 *     previous user question (free, instant, always on).
 *  2. prepareQuery with RAG_QUERY_REWRITE=llm: a small model writes a standalone question and alternative phrasings
 *     (typos fixed, synonyms), each searched and fused. Bounded by a short timeout, cached, and any failure falls back to (1).
 */

type Turn = { role: string; content: string };

const ANAPHORA = /\b(it|its|that|this|they|them|their|those|these|there|the same|one)\b/i;
const FOLLOW_UP_OPENER = /^(and|also|but|then|so|what about|how about|what if|why|how so|does that|do they|is that|can it|can they|will it|would it)\b/i;

/** True for messages that only make sense with the previous turn. */
export function isFollowUp(message: string): boolean {
  const m = message.trim();
  const words = m.split(/\s+/).filter(Boolean).length;
  if (words === 0) return false;
  if (words <= 3) return true;
  return words <= 12 && (FOLLOW_UP_OPENER.test(m) || ANAPHORA.test(m));
}

function lastUserQuestion(history: Turn[]): string {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'user' && history[i].content.trim()) return history[i].content.trim().slice(0, 300);
  }
  return '';
}

/** Adds the topic from the previous user question when the message cannot stand alone. */
export function resolveFollowUp(message: string, history: Turn[] = []): string {
  if (history.length === 0 || !isFollowUp(message)) return message;
  const topic = lastUserQuestion(history);
  if (!topic || topic.toLowerCase() === message.trim().toLowerCase()) return message;
  return `${topic} ${message}`;
}

/* ------------------------------------------------------ LLM rewrite ------------------------------------------------------ */

export interface PreparedQuery {
  /** The standalone question (also used for the embedding and caches). */
  query: string;
  /** Extra phrasings to search as well. */
  variants: string[];
  rewritten: boolean;
}

export function llmRewriteEnabled(): boolean {
  return (process.env.RAG_QUERY_REWRITE || '').toLowerCase() === 'llm';
}

const cache = new Map<string, { at: number; value: PreparedQuery }>();
const TTL_MS = 10 * 60_000;

export function _resetQueryPrepCache() {
  cache.clear();
}

export function parseRewrite(text: string): { standalone: string; alternatives: string[] } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const j = JSON.parse(match[0]);
    const standalone = typeof j.standalone === 'string' ? j.standalone.trim().slice(0, 400) : '';
    const alternatives = Array.isArray(j.alternatives)
      ? j.alternatives
          .filter((a: unknown): a is string => typeof a === 'string' && a.trim().length > 0)
          .map((a: string) => a.trim().slice(0, 300))
          .slice(0, 3)
      : [];
    return standalone ? { standalone, alternatives } : null;
  } catch {
    return null;
  }
}

async function callModel(prompt: string, timeoutMs: number): Promise<string> {
  const { generateChatCompletion } = await import('../ai/providers');
  const { withEnvProviderFallback } = await import('../ai/resolve-provider');
  const base: any = withEnvProviderFallback({ provider: 'ollama' } as any);
  if (!base.apiKeyEncrypted || base.provider === 'ollama') throw new Error('no provider key configured');
  const run = generateChatCompletion([{ role: 'user', content: prompt } as any], {
    provider: base.provider,
    modelName: process.env.RAG_REWRITE_MODEL || (base.provider === 'groq' ? 'llama-3.1-8b-instant' : base.modelName),
    apiKey: base.apiKeyEncrypted,
    temperature: 0,
    maxTokens: 500,
  });
  return await Promise.race([run, new Promise<string>((_, rej) => setTimeout(() => rej(new Error('rewrite timeout')), timeoutMs))]);
}

export async function prepareQuery(
  message: string,
  history: Turn[] = [],
  options: { complete?: (prompt: string, timeoutMs: number) => Promise<string> } = {}
): Promise<PreparedQuery> {
  const base: PreparedQuery = { query: resolveFollowUp(message, history), variants: [], rewritten: false };
  if (!llmRewriteEnabled() && !options.complete) return base;
  if (message.trim().split(/\s+/).length > 40) return base; // long messages are already specific

  const recent = history
    .slice(-4)
    .map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.content.replace(/\s+/g, ' ').slice(0, 240)}`)
    .join('\n');
  const key = `${recent}\n${message}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const prompt = [
    "You prepare search queries for a company's knowledge base. Rewrite the last user message.",
    'Return ONLY JSON: {"standalone": "...", "alternatives": ["...", "..."]}',
    '- standalone: the question rewritten so it makes sense with no conversation (resolve "it", "that", "and X?" using the conversation), spelling fixed.',
    '- alternatives: up to 2 different phrasings using other words a document might use (synonyms, the formal term). Never invent facts or numbers.',
    recent ? `\nConversation:\n${recent}` : '',
    `\nLast user message: ${message}`,
  ].join('\n');

  try {
    const text = await (options.complete ?? callModel)(prompt, Number(process.env.RAG_REWRITE_TIMEOUT_MS) || 2500);
    const parsed = parseRewrite(text);
    if (!parsed) return base;
    const value: PreparedQuery = {
      query: parsed.standalone,
      variants: [...new Set(parsed.alternatives.filter((a) => a.toLowerCase() !== parsed.standalone.toLowerCase()))],
      rewritten: true,
    };
    if (cache.size > 500) cache.clear();
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch {
    return base;
  }
}

/** Reciprocal-rank fusion of several ranked lists of chunks (a chunk found by several phrasings rises). */
export function fuseRankings(lists: SearchResultChunk[][], limit: number, k = 60): SearchResultChunk[] {
  const score = new Map<string, number>();
  const keep = new Map<string, SearchResultChunk>();
  for (const list of lists) {
    list.forEach((c, rank) => {
      const id = c.id || `chunk_${c.chunkIndex}`;
      score.set(id, (score.get(id) || 0) + 1 / (k + rank + 1));
      const prev = keep.get(id);
      if (!prev || (c.similarity ?? 0) > (prev.similarity ?? 0)) keep.set(id, c);
    });
  }
  return [...keep.entries()]
    .sort((a, b) => (score.get(b[0]) || 0) - (score.get(a[0]) || 0))
    .slice(0, limit)
    .map(([, c]) => c);
}

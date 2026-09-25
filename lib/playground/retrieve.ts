import type { ChatMessage } from '@/lib/ai/types';
import { searchChunks, type PgChunk } from './store';

type Hit = { chunk: PgChunk; score: number };

/** "Tell me everything", "summarise", "what is this about": questions that are about the whole document, not a keyword in it. */
const BROAD = /\b(all you know|everything|summari[sz]e|summary|overview|what(?:'s| is| are)? (?:this|these|the (?:doc|document|documents|file|page|text)) (?:about|for)|tell me (?:about (?:it|this|these|the)|more|something)|what (?:can|do) you (?:know|tell)|what do you have|give me (?:an? )?(?:idea|intro|introduction))\b/i;
/** Follow-ups lean on the previous turn: "explain in detail", "why?", "and the second one?". */
const FOLLOW_UP = /\b(it|this|that|they|them|those|these|more|detail|details|detailed|elaborate|expand|explain|again|also|why|how so|example|examples|first|second|third|last|previous|above|else)\b/i;
const STOP = new Set('a an the and or of to in on for with is are was were be do does did i you me my your it its this that what which who how why when where can could would should please tell give show about from as at by'.split(' '));

const words = (t: string) => t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
const meaningful = (t: string) => words(t).filter((w) => w.length > 2 && !STOP.has(w));

/** Evenly spread passages across every source, so a broad question gets the whole picture. */
export function spread(chunks: PgChunk[], n = 6): Hit[] {
  if (chunks.length <= n) return chunks.map((chunk) => ({ chunk, score: 1 }));
  const step = chunks.length / n;
  return Array.from({ length: n }, (_, i) => ({ chunk: chunks[Math.floor(i * step)], score: 1 }));
}

/** Finds the passages for a message the way a person reads a chat: with the earlier turns in mind. */
export function retrieve(chunks: PgChunk[], q: string, history: ChatMessage[], k = 5): Hit[] {
  if (BROAD.test(q)) return spread(chunks, 6);
  const previousQuestions = history.filter((m) => m.role === 'user').map((m) => m.content).slice(-2);
  const own = meaningful(q);
  const leansOnHistory = previousQuestions.length > 0 && (own.length < 3 || FOLLOW_UP.test(q));

  if (leansOnHistory) {
    const withContext = searchChunks(chunks, `${previousQuestions.join(' ')} ${q}`, k);
    if (withContext.length) return withContext;
  }
  const direct = searchChunks(chunks, q, k);
  if (direct.length) return direct;
  if (previousQuestions.length) {
    const retry = searchChunks(chunks, `${previousQuestions.join(' ')} ${q}`, k);
    if (retry.length) return retry;
  }
  return [];
}

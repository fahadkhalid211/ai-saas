import type { SearchResultChunk } from './types';

/**
 * Answer-or-abstain. The fused rank score of a chunk says which passage is best, not whether ANY passage is good enough,
 * and it is on a different scale on each retrieval path. So confidence is built from absolute signals: the question-to-passage
 * cosine similarity and whether the passage contains the question's words.
 */

/** 0..1: how likely the knowledge base can answer the question, from the passages that were retrieved. */
export function retrievalConfidence(chunks: SearchResultChunk[]): number {
  if (chunks.length === 0) return 0;
  let best = 0;
  for (const c of chunks.slice(0, 5)) {
    // passages injected by code (dataset overview, pricing) carry no vector score but are deliberately chosen
    const synthetic = c.vectorScore === undefined;
    const v = synthetic ? Math.min(1, c.similarity ?? 0) : c.vectorScore!;
    const withWords = c.keywordMatch ? Math.min(1, v + KEYWORD_BONUS) : v;
    if (withWords > best) best = withWords;
  }
  return best;
}

const KEYWORD_BONUS = Number(process.env.RAG_KEYWORD_BONUS) || 0;

/** Below this the knowledge base most likely does not contain the answer. Tuned with `npm run rag:eval`. */
export function confidenceThreshold(): number {
  const v = Number(process.env.RAG_CONFIDENCE_MIN);
  return Number.isFinite(v) && v > 0 ? v : DEFAULT_THRESHOLD;
}

const DEFAULT_THRESHOLD = 0.58; // eval: answers 100% of answerable questions; the model itself handles the rest

export function isLowConfidence(confidence: number | undefined): boolean {
  return confidence !== undefined && confidence < confidenceThreshold();
}

/* ----------------------------------------------- the "I don't know" way forward ----------------------------------------------- */

const UNKNOWN_REPLY =
  /not sure about that|not sure|don't know|do not know|not certain|no information|not mentioned in (the|my) knowledge base|don't have enough specific details|not covered in (the|my) knowledge base|can't find information|cannot find information|outside (of )?(my|the) knowledge|don't have (that|this|any|reliable)|do not have (that|this|any|reliable)|unable to (find|confirm)|couldn't find|could not find/i;

/** True when a reply says the assistant does not know. */
export function looksLikeUnknown(reply: string): boolean {
  return UNKNOWN_REPLY.test(reply || '');
}

/**
 * Every "I don't know" ends with the two ways forward, never a request for contact details: a booking form (whose card also
 * carries the live-agent button) when booking is on, otherwise a hand-off to a live agent.
 */
export function unknownAnswerOffer(opts: { bookingEnabled?: boolean }): { text: string; tokens: string } {
  return opts.bookingEnabled
    ? {
        text: "I'd rather not guess, so I can either book you a time with our team or connect you with a live agent. Just choose below.",
        tokens: '[ACTION:BOOKING_FORM]',
      }
    : {
        text: "I'd rather not guess, so I'm connecting you with a live agent who can answer this properly. Someone from our team will join this chat shortly.",
        tokens: '[ACTION:HUMAN_ESCALATION]',
      };
}

/** Adds the offer to a reply that does not already contain one. */
export function withUnknownOffer(reply: string, opts: { bookingEnabled?: boolean }): string {
  if (/\[ACTION:(BOOKING_FORM|HUMAN_ESCALATION)\]/.test(reply)) return reply;
  const offer = unknownAnswerOffer(opts);
  return `${reply.trimEnd()}\n\n${offer.text} ${offer.tokens}`;
}

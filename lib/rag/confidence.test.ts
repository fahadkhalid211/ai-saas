import { describe, it, expect, afterEach } from 'vitest';
import { retrievalConfidence, isLowConfidence, looksLikeUnknown, withUnknownOffer, unknownAnswerOffer } from './confidence';
import type { SearchResultChunk } from './types';

const c = (o: Partial<SearchResultChunk>) => ({ id: 'x', content: 'x', chunkIndex: 0, tokenCount: 1, metadata: {}, similarity: 0.03, knowledgeSourceId: 's', ...o }) as SearchResultChunk;

describe('retrieval confidence', () => {
  afterEach(() => {
    delete process.env.RAG_CONFIDENCE_MIN;
  });

  it('is zero with no passages and the best cosine otherwise', () => {
    expect(retrievalConfidence([])).toBe(0);
    expect(retrievalConfidence([c({ vectorScore: 0.4 }), c({ vectorScore: 0.71 })])).toBeCloseTo(0.71);
  });

  it('trusts passages injected by code (no vector score) by their assigned similarity', () => {
    expect(retrievalConfidence([c({ similarity: 1.0 })])).toBe(1);
  });

  it('flags low confidence below the threshold and honours the override', () => {
    expect(isLowConfidence(0.4)).toBe(true);
    expect(isLowConfidence(0.7)).toBe(false);
    expect(isLowConfidence(undefined)).toBe(false); // retrieval was skipped (greeting): nothing to judge
    process.env.RAG_CONFIDENCE_MIN = '0.8';
    expect(isLowConfidence(0.7)).toBe(true);
  });
});

describe('"I don\'t know" way forward', () => {
  it('recognises replies that say the assistant does not know', () => {
    expect(looksLikeUnknown("Sorry, I don't have that information.")).toBe(true);
    expect(looksLikeUnknown('I could not find anything about that.')).toBe(true);
    expect(looksLikeUnknown('The Growth plan costs $149 per month.')).toBe(false);
  });

  it('adds the booking form when booking is on, otherwise a live agent, and never asks for contact details', () => {
    const booking = withUnknownOffer("I don't know that.", { bookingEnabled: true });
    expect(booking).toContain('[ACTION:BOOKING_FORM]');
    expect(withUnknownOffer("I don't know that.", { bookingEnabled: false })).toContain('[ACTION:HUMAN_ESCALATION]');
    for (const t of [unknownAnswerOffer({ bookingEnabled: true }).text, unknownAnswerOffer({}).text]) {
      expect(t).not.toMatch(/email|phone number|leave your/i);
    }
  });

  it('does not add a second offer when the reply already has one', () => {
    const r = "I don't know. [ACTION:BOOKING_FORM]";
    expect(withUnknownOffer(r, { bookingEnabled: true })).toBe(r);
  });
});

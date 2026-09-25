import { describe, expect, it } from 'vitest';
import { endsMidSentence } from './providers';

describe('endsMidSentence', () => {
  it('flags a reply cut off mid-sentence', () => {
    expect(endsMidSentence('At Crescelo, Zero Token Markup means we operate on a Bring Your Own Key (BYOK) model so')).toBe(true);
  });
  it('accepts finished replies', () => {
    expect(endsMidSentence('We open at nine and close at five on weekdays. Book any time.')).toBe(false);
    expect(endsMidSentence('Here is the list of everything you need to know today:\n- one\n- two.')).toBe(false);
    expect(endsMidSentence('Sure!')).toBe(false);
    expect(endsMidSentence('*(Authentication error: check your key and try again with another one)*')).toBe(false);
  });
});

import { stripMarkdown } from '@/lib/playground/tidy';
describe('stripMarkdown', () => {
  it('removes headings and bold marks', () => {
    expect(stripMarkdown('## Symptoms\n**Fever** and *chills*\n* one\n* two')).toBe('Symptoms\nFever and chills\n- one\n- two');
  });
});

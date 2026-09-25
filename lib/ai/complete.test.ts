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

import { cleanExcerpt } from '@/lib/playground/tidy';
describe('cleanExcerpt', () => {
  it('is plain text and ends on a sentence', () => {
    const out = cleanExcerpt('### What do gene mutations do? A gene mutation can instruct a healthy cell to: * **Allow rapid growth.** A gene mutation can tell a cell to grow and divide more rapidly. This creates many new cells that all have that same mutation. * **Fail to stop uncontrolled cell growth.** Normal cells know when to stop growing so t', 300);
    expect(out).not.toMatch(/[#*]/);
    expect(out.endsWith('.')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { isAskAllQuery } from './retrieval';
import { guidesForPrompt } from '@/lib/platform/knowledge';

describe('ask-all questions', () => {
  it('recognises whole-knowledge-base questions', () => {
    for (const q of ['tell me all you know', 'Tell me everything', 'what do you know?', 'what is this about', 'who are you', 'What do you offer?', 'tell me about your business'])
      expect(isAskAllQuery(q), q).toBe(true);
  });
  it('leaves specific questions alone', () => {
    for (const q of ['how do I connect OpenAI', 'what are your opening hours', 'do you do teeth whitening'])
      expect(isAskAllQuery(q), q).toBe(false);
  });
  it('the dashboard assistant gets a digest of every guide for them', () => {
    const text = guidesForPrompt('tell me everything you know');
    expect(text.length).toBeGreaterThan(2000);
    expect(text).toContain('## ');
  });
});

import { describe, expect, it } from 'vitest';
import { chunkText, voicesForLanguage, withPause, MAX_CHUNK } from './read-aloud';

describe('read aloud helpers', () => {
  it('returns nothing for empty text', () => {
    expect(chunkText('   \n ')).toEqual([]);
  });

  it('keeps short text in one piece and groups sentences up to the limit', () => {
    expect(chunkText('Hello there. How are you?')).toEqual(['Hello there. How are you?']);
    const long = Array.from({ length: 30 }, (_, i) => `Sentence number ${i} is here.`).join(' ');
    const chunks = chunkText(long);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c) => expect(c.length).toBeLessThanOrEqual(MAX_CHUNK));
    expect(chunks.join(' ')).toBe(long);
  });

  it('breaks a single very long sentence without losing words', () => {
    const sentence = Array.from({ length: 80 }, (_, i) => `word${i}`).join(' ') + '.';
    const chunks = chunkText(sentence, 100);
    chunks.forEach((c) => expect(c.length).toBeLessThanOrEqual(100));
    expect(chunks.join(' ')).toBe(sentence);
  });

  it('adds a pause to headings but leaves finished sentences alone', () => {
    expect(withPause('Pricing')).toBe('Pricing.');
    expect(withPause('Is it free?')).toBe('Is it free?');
    expect(withPause('  ')).toBe('');
  });

  it('prefers voices for the page language, default and on-device first', () => {
    const voices = [
      { name: 'Zed', lang: 'fr-FR' },
      { name: 'Online', lang: 'en-GB', localService: false },
      { name: 'Local', lang: 'en-US', localService: true },
      { name: 'Default', lang: 'en-US', default: true, localService: false },
    ];
    expect(voicesForLanguage(voices, 'en').map((v) => v.name)).toEqual(['Default', 'Local', 'Online']);
    expect(voicesForLanguage(voices, 'fr-CA').map((v) => v.name)).toEqual(['Zed']);
    expect(voicesForLanguage(voices, 'de').length).toBe(4);
  });
});

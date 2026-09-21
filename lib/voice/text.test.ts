import { describe, it, expect } from 'vitest';
import { cleanForSpeech, looksLikeEmergency, maskPhone, normalizeE164, parseSpokenDigits, takeSentences } from './text';

describe('normalizeE164', () => {
  it('accepts valid international numbers', () => {
    expect(normalizeE164('+1 (415) 555-0123')).toBe('+14155550123');
    expect(normalizeE164('0044 20 7946 0958')).toBe('+442079460958');
  });
  it('uses a default country code for national numbers', () => {
    expect(normalizeE164('020 7946 0958', '44')).toBe('+442079460958');
    expect(normalizeE164('4155550123')).toBeNull();
  });
  it('rejects junk', () => {
    expect(normalizeE164('')).toBeNull();
    expect(normalizeE164('+0123456')).toBeNull();
    expect(normalizeE164('+12')).toBeNull();
    expect(normalizeE164('anonymous')).toBeNull();
  });
  it('masks numbers', () => {
    expect(maskPhone('+14155550123')).toBe('+1 *** *** 0123');
    expect(maskPhone(undefined)).toBe('');
  });
});

describe('parseSpokenDigits', () => {
  it('reads words and digits', () => {
    expect(parseSpokenDigits('five five five one two one two')).toBe('5551212');
    expect(parseSpokenDigits('my number is 415 555 0123')).toBe('4155550123');
    expect(parseSpokenDigits('oh seven seven')).toBe('077');
  });
});

describe('cleanForSpeech', () => {
  it('strips markdown, markers and links', () => {
    expect(cleanForSpeech('**Sure!** See [our menu](https://x.com/menu). [ACTION:BOOKING_FORM]')).toBe('Sure! See our menu.');
    expect(cleanForSpeech('- Haircut $35\n- Beard $15')).toBe('Haircut $35 Beard $15');
  });
  it('never returns provider error banners', () => {
    expect(cleanForSpeech('*(AI Generation Error: 400 bad request)*')).toBeNull();
  });
  it('returns null for empty text', () => {
    expect(cleanForSpeech('  ')).toBeNull();
  });
});

describe('looksLikeEmergency', () => {
  it('detects emergencies but not ordinary talk', () => {
    expect(looksLikeEmergency('this is an emergency, he is not breathing')).toBe(true);
    expect(looksLikeEmergency('I want to book a haircut')).toBe(false);
  });
});

describe('takeSentences', () => {
  it('emits complete sentences and keeps the tail', () => {
    const r = takeSentences('We open at nine. We close at five. And on Sat');
    expect(r.sentences).toEqual(['We open at nine.', 'We close at five.']);
    expect(r.rest).toBe('And on Sat');
  });
  it('holds back short fragments so abbreviations do not split', () => {
    const r = takeSentences('Dr. Smith is in on Monday. Anything else?');
    expect(r.sentences[0]).toBe('Dr. Smith is in on Monday.');
  });
  it('flushes a final sentence with no trailing space', () => {
    expect(takeSentences('Sure thing.').sentences).toEqual(['Sure thing.']);
  });
});

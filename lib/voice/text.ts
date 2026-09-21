/**
 * Phone-number and speech-text helpers for the voice channel.
 */

/** Normalises a phone number to E.164 ("+14155550123"). Returns null when it cannot be a valid number. */
export function normalizeE164(input: string | undefined | null, defaultCountryCode = ''): string | null {
  if (!input) return null;
  let s = String(input).trim().replace(/[\s().-]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!s.startsWith('+')) {
    if (!defaultCountryCode || !/^\d+$/.test(s)) return null;
    s = `+${defaultCountryCode.replace(/\D/g, '')}${s.replace(/^0+/, '')}`;
  }
  return /^\+[1-9]\d{6,14}$/.test(s) ? s : null;
}

/** "+14155550123" -> "+1 *** *** 0123" for logs and the dashboard. */
export function maskPhone(e164: string | undefined | null): string {
  if (!e164) return '';
  const digits = e164.replace(/\D/g, '');
  if (digits.length < 6) return '***';
  return `+${digits.slice(0, digits.length > 10 ? digits.length - 10 : 1)} *** *** ${digits.slice(-4)}`;
}

/** Reads a phone number spoken as words or digits: "five five five one two one two" -> "5551212". */
export function parseSpokenDigits(input: string): string {
  const map: Record<string, string> = {
    zero: '0', oh: '0', o: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  };
  let out = '';
  for (const token of input.toLowerCase().replace(/[^a-z0-9+\s]/g, ' ').split(/\s+/)) {
    if (!token) continue;
    if (/^\+?\d+$/.test(token)) out += token.replace('+', '');
    else if (token in map) out += map[token];
    else if (token === 'double' || token === 'triple') continue;
  }
  return out;
}

const EMERGENCY = /\b(emergency|911|999|112|000|ambulance|fire department|heart attack|can'?t breathe|not breathing|overdose|suicid|bleeding heavily|gun|being attacked)\b/i;

export function looksLikeEmergency(text: string): boolean {
  return EMERGENCY.test(text);
}

/** Removes markup a caller should never hear: markdown, action markers, URLs, error banners. Returns null for provider error text. */
export function cleanForSpeech(text: string): string | null {
  let t = text || '';
  if (/\*\(\s*AI Generation Error/i.test(t) || /AI Generation Error/i.test(t)) return null;
  t = t
    .replace(/\[ACTION:[A-Z_]+\]/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/(\*\*|__|\*|_|`|~~)/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t || null;
}

/**
 * Splits a growing text buffer into complete sentences for streaming TTS.
 * Returns the sentences that are complete and the unfinished remainder.
 */
export function takeSentences(buffer: string, minLength = 12): { sentences: string[]; rest: string } {
  const sentences: string[] = [];
  let rest = buffer;
  const re = /^([\s\S]*?[.!?…]["')\]]?)(\s+|$)/;
  for (;;) {
    const m = rest.match(re);
    if (!m) break;
    const candidate = m[1].trim();
    // Avoid splitting on abbreviations and tiny fragments ("Dr.", "No.")
    if (candidate.length < minLength && m[2] === ' ') {
      const next = rest.slice(m[0].length);
      const m2 = next.match(re);
      if (!m2) break;
      sentences.push((candidate + ' ' + m2[1]).trim());
      rest = next.slice(m2[0].length);
      continue;
    }
    if (m[2] === '' && !/[.!?…]["')\]]?$/.test(rest)) break;
    sentences.push(candidate);
    rest = rest.slice(m[0].length);
  }
  return { sentences, rest };
}

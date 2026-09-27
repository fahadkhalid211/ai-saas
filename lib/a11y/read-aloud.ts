/**
 * Read-aloud helpers, kept free of the DOM so they can be tested.
 * Speech engines stop mid-sentence on long utterances (Chrome cuts off after roughly 15 seconds), so the text is spoken in short chunks.
 */

export const MAX_CHUNK = 220;

/** Splits text into sentence-sized chunks no longer than `max`, never breaking inside a word where it can be avoided. */
export function chunkText(text: string, max = MAX_CHUNK): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…]+[.!?…]+["')\]]*|[^.!?…]+$/g) || [clean];
  const chunks: string[] = [];
  let current = '';
  const push = () => {
    if (current.trim()) chunks.push(current.trim());
    current = '';
  };
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (sentence.length > max) {
      push();
      // a very long sentence: break at commas or semicolons, then at spaces
      let rest = sentence;
      while (rest.length > max) {
        let cut = Math.max(rest.lastIndexOf(', ', max), rest.lastIndexOf('; ', max), rest.lastIndexOf(': ', max));
        if (cut < max * 0.4) cut = rest.lastIndexOf(' ', max);
        if (cut <= 0) cut = max;
        chunks.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1).trim();
      }
      if (rest) current = rest;
      continue;
    }
    if ((current + ' ' + sentence).trim().length > max) push();
    current = (current + ' ' + sentence).trim();
  }
  push();
  return chunks;
}

/** Headings and list items rarely end in punctuation, which makes the voice run them together; a full stop gives a natural pause. */
export function withPause(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return /[.!?…:;]["')\]]*$/.test(t) ? t : t + '.';
}

export interface VoiceLike {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
}

/** The voices that speak a language, best first: the browser's default for it, then on-device voices, then the rest. */
export function voicesForLanguage<T extends VoiceLike>(voices: T[], lang: string): T[] {
  const base = (lang || 'en').toLowerCase().split('-')[0];
  const matching = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').split('-')[0] === base);
  const pool = matching.length ? matching : voices;
  return [...pool].sort((a, b) => Number(!!b.default) - Number(!!a.default) || Number(!!b.localService) - Number(!!a.localService) || a.name.localeCompare(b.name));
}

export const RATES = [0.75, 1, 1.25, 1.5, 1.75] as const;

/**
 * List prices, in US dollars per million tokens, used to estimate what a customer's own API key is spending so the monthly cost
 * cap can act before the provider's bill surprises them. Estimates, not invoices: providers bill cache hits, batch and tiered
 * rates differently. Models are matched by the longest prefix, so dated snapshots ("gpt-4o-2024-08-06") find their family.
 * A model that is not listed is priced at the provider's most expensive rate, so an unknown model reaches the cap early, not late.
 */

export interface ModelPrice {
  /** USD per 1M input tokens. */
  input: number;
  /** USD per 1M output tokens. */
  output: number;
}

type PriceTable = Record<string, ModelPrice>;

const ANTHROPIC: PriceTable = {
  'claude-fable-5': { input: 10, output: 50 },
  'claude-mythos-5': { input: 10, output: 50 },
  'claude-opus-5-5': { input: 4, output: 20 },
  'claude-opus-5': { input: 5, output: 25 },
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-opus-4-7': { input: 5, output: 25 },
  'claude-opus-4-6': { input: 5, output: 25 },
  'claude-opus-4-5': { input: 5, output: 25 },
  'claude-opus-4-1': { input: 15, output: 75 },
  'claude-opus-4': { input: 15, output: 75 },
  'claude-3-opus': { input: 15, output: 75 },
  'claude-sonnet-5': { input: 2, output: 10 },
  'claude-sonnet-4': { input: 3, output: 15 },
  'claude-3-7-sonnet': { input: 3, output: 15 },
  'claude-3-5-sonnet': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 1, output: 5 },
  'claude-3-5-haiku': { input: 0.8, output: 4 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
};

const OPENAI: PriceTable = {
  'gpt-5-nano': { input: 0.05, output: 0.4 },
  'gpt-5-mini': { input: 0.25, output: 2 },
  'gpt-5-pro': { input: 15, output: 120 },
  'gpt-5': { input: 1.25, output: 10 },
  'gpt-4.1-nano': { input: 0.1, output: 0.4 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
  'gpt-4.1': { input: 2, output: 8 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-4': { input: 30, output: 60 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'o4-mini': { input: 1.1, output: 4.4 },
  'o3-mini': { input: 1.1, output: 4.4 },
  'o3-pro': { input: 20, output: 80 },
  o3: { input: 2, output: 8 },
  'o1-mini': { input: 1.1, output: 4.4 },
  'o1-pro': { input: 150, output: 600 },
  o1: { input: 15, output: 60 },
};

const GEMINI: PriceTable = {
  'gemini-3.6-flash': { input: 0.5, output: 3 },
  'gemini-3-flash': { input: 0.5, output: 3 },
  'gemini-3-pro': { input: 2, output: 12 },
  'gemini-2.5-pro': { input: 1.25, output: 10 },
  'gemini-2.5-flash-lite': { input: 0.1, output: 0.4 },
  'gemini-2.5-flash': { input: 0.3, output: 2.5 },
  'gemini-2.0-flash-lite': { input: 0.075, output: 0.3 },
  'gemini-2.0-flash': { input: 0.1, output: 0.4 },
  'gemini-1.5-pro': { input: 1.25, output: 5 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
};

const DEEPSEEK: PriceTable = {
  'deepseek-reasoner': { input: 0.55, output: 2.19 },
  'deepseek-chat': { input: 0.27, output: 1.1 },
};

const GROQ: PriceTable = {
  'openai/gpt-oss-120b': { input: 0.15, output: 0.75 },
  'openai/gpt-oss-20b': { input: 0.075, output: 0.3 },
  'groq/compound-mini': { input: 0.15, output: 0.75 },
  'groq/compound': { input: 0.15, output: 0.75 },
  'llama-3.3-70b': { input: 0.59, output: 0.79 },
  'llama-3.1-8b': { input: 0.05, output: 0.08 },
  'meta-llama/llama-4-maverick': { input: 0.2, output: 0.6 },
  'meta-llama/llama-4-scout': { input: 0.11, output: 0.34 },
  'moonshotai/kimi-k2': { input: 1, output: 3 },
  'qwen/qwen3-32b': { input: 0.29, output: 0.59 },
  'llama-3.2-11b-vision': { input: 0.18, output: 0.18 },
  'llama-3.2-90b-vision': { input: 0.9, output: 0.9 },
};

const TABLES: Record<string, PriceTable> = {
  anthropic: ANTHROPIC,
  openai: OPENAI,
  gemini: GEMINI,
  deepseek: DEEPSEEK,
  groq: GROQ,
};

/** Unknown models on unknown endpoints (the "custom" provider): priced like a premium model so the cap errs early. */
const UNKNOWN_PRICE: ModelPrice = { input: 5, output: 25 };

function mostExpensive(table: PriceTable): ModelPrice {
  return Object.values(table).reduce((max, p) => (p.input + p.output > max.input + max.output ? p : max));
}

/** Upper bound for a provider's unknown models. OpenAI's "pro" tiers are excluded: they are never picked by accident. */
const CEILINGS: Record<string, ModelPrice> = {
  anthropic: mostExpensive(ANTHROPIC),
  openai: { input: 30, output: 60 },
  gemini: mostExpensive(GEMINI),
  deepseek: mostExpensive(DEEPSEEK),
  groq: mostExpensive(GROQ),
};

export function priceFor(provider: string, model: string): ModelPrice {
  const p = (provider || '').toLowerCase();
  const table = TABLES[p];
  if (!table) return UNKNOWN_PRICE;
  const m = (model || '').toLowerCase().replace(/^models\//, '');
  let best: string | null = null;
  for (const key of Object.keys(table)) {
    if (m.startsWith(key) && (!best || key.length > best.length)) best = key;
  }
  return best ? table[best] : CEILINGS[p];
}

export function estimateCostUsd(provider: string, model: string, inputTokens: number, outputTokens: number): number {
  const price = priceFor(provider, model);
  const cost = (Math.max(0, inputTokens) * price.input + Math.max(0, outputTokens) * price.output) / 1_000_000;
  return Number.isFinite(cost) ? cost : 0;
}

/** Speech-to-text models billed per minute of audio, USD per minute. Matched by longest prefix like the token tables. */
const PER_MINUTE: Record<string, { perMinute: number; minimumSeconds: number }> = {
  'whisper-1': { perMinute: 0.006, minimumSeconds: 0 },
  'gpt-4o-transcribe': { perMinute: 0.006, minimumSeconds: 0 },
  'gpt-4o-mini-transcribe': { perMinute: 0.003, minimumSeconds: 0 },
  // Groq bills at least 10 seconds per request
  'whisper-large-v3-turbo': { perMinute: 0.04 / 60, minimumSeconds: 10 },
  'whisper-large-v3': { perMinute: 0.111 / 60, minimumSeconds: 10 },
  'distil-whisper': { perMinute: 0.02 / 60, minimumSeconds: 10 },
};

/** Gemini prices audio input above text input; USD per 1M audio tokens. */
function geminiAudioInputPrice(model: string, textPrice: ModelPrice): number {
  const m = model.toLowerCase();
  if (m.includes('pro')) return textPrice.input;
  if (m.includes('flash-lite')) return 0.3;
  return 1;
}

/** Estimated cost of one reported request: text, image understanding or speech transcription. */
export function estimateUsageCostUsd(usage: {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  media?: 'image' | 'audio';
  audioSeconds?: number;
}): number {
  if (typeof usage.audioSeconds === 'number') {
    const m = (usage.model || '').toLowerCase();
    let best: string | null = null;
    for (const key of Object.keys(PER_MINUTE)) {
      if (m.startsWith(key) && (!best || key.length > best.length)) best = key;
    }
    const rate = best ? PER_MINUTE[best] : { perMinute: 0.006, minimumSeconds: 0 };
    const seconds = Math.max(rate.minimumSeconds, Math.max(0, usage.audioSeconds) || 0);
    const cost = (seconds / 60) * rate.perMinute;
    return Number.isFinite(cost) ? cost : 0;
  }
  if (usage.media === 'audio' && (usage.provider || '').toLowerCase() === 'gemini') {
    const price = priceFor('gemini', usage.model);
    const cost = (Math.max(0, usage.inputTokens) * geminiAudioInputPrice(usage.model, price) + Math.max(0, usage.outputTokens) * price.output) / 1_000_000;
    return Number.isFinite(cost) ? cost : 0;
  }
  return estimateCostUsd(usage.provider, usage.model, usage.inputTokens, usage.outputTokens);
}

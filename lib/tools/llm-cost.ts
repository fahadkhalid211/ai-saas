import { priceFor, type ModelPrice } from '../ai/pricing';

/**
 * The maths behind the public LLM cost calculator (/tools/llm-cost-calculator): what one chatbot conversation costs in API fees.
 * Chat APIs keep no memory, so every customer message is sent together with the instructions, the knowledge-base text and the
 * whole chat so far. Input tokens therefore grow with the square of the chat's length, which is what simple estimates miss.
 * List prices only: cache and batch discounts make a real bill lower, never higher.
 */

/** English averages about three quarters of a word per token. */
export const TOKENS_PER_WORD = 4 / 3;

/** The day the prices in lib/ai/pricing.ts were last compared with the providers' own pricing pages. */
export const PRICES_CHECKED = '2026-10-13';

export interface ChatScenario {
  /** Conversations in a month. */
  conversations: number;
  /** Customer messages in one conversation; each gets one reply. */
  turns: number;
  /** Words in a customer message. */
  userWords: number;
  /** Words in a reply. */
  replyWords: number;
  /** Words of knowledge-base text sent along with each message. */
  knowledgeWords: number;
  /** Words of instructions (the system prompt) sent with each message. */
  promptWords: number;
}

export const DEFAULT_SCENARIO: ChatScenario = { conversations: 1000, turns: 6, userWords: 20, replyWords: 60, knowledgeWords: 1200, promptWords: 300 };

const LIMITS: Record<keyof ChatScenario, [min: number, max: number]> = {
  conversations: [1, 10_000_000],
  turns: [1, 100],
  userWords: [1, 2000],
  replyWords: [1, 2000],
  knowledgeWords: [0, 50_000],
  promptWords: [0, 50_000],
};

/** Short names for the address, so a scenario can be shared as a link. */
const QUERY_KEYS: Record<keyof ChatScenario, string> = { conversations: 'c', turns: 'm', userWords: 'u', replyWords: 'r', knowledgeWords: 'k', promptWords: 's' };

const FIELDS = Object.keys(DEFAULT_SCENARIO) as (keyof ChatScenario)[];

/** Whole numbers inside each field's limits; anything that is not a number becomes the default. */
export function clampScenario(input: Partial<Record<keyof ChatScenario, unknown>>): ChatScenario {
  const out = { ...DEFAULT_SCENARIO };
  for (const f of FIELDS) {
    const raw = input[f];
    const n = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
    if (!Number.isFinite(n)) continue;
    const [min, max] = LIMITS[f];
    out[f] = Math.min(max, Math.max(min, Math.round(n)));
  }
  return out;
}

const tokens = (words: number) => Math.round(words * TOKENS_PER_WORD);

/** Tokens billed for one conversation. */
export function conversationTokens(s: ChatScenario): { input: number; output: number } {
  const n = s.turns;
  const user = tokens(s.userWords);
  const reply = tokens(s.replyWords);
  const fixed = tokens(s.promptWords) + tokens(s.knowledgeWords);
  // message i carries i customer messages and the i-1 replies before it
  const input = n * fixed + (user * n * (n + 1)) / 2 + (reply * n * (n - 1)) / 2;
  return { input, output: n * reply };
}

export function conversationCostUsd(s: ChatScenario, price: ModelPrice): number {
  const t = conversationTokens(s);
  return (t.input * price.input + t.output * price.output) / 1_000_000;
}

export function scenarioToQuery(s: ChatScenario): string {
  const q = new URLSearchParams();
  for (const f of FIELDS) if (s[f] !== DEFAULT_SCENARIO[f]) q.set(QUERY_KEYS[f], String(s[f]));
  return q.toString();
}

export function scenarioFromQuery(search: string): ChatScenario {
  const q = new URLSearchParams(search);
  return clampScenario(Object.fromEntries(FIELDS.map((f) => [f, q.get(QUERY_KEYS[f]) ?? undefined])));
}

export interface CalculatorModel {
  provider: string;
  providerLabel: string;
  model: string;
  label: string;
}

/**
 * The models compared on the page. Each must be listed in lib/ai/pricing.ts, and only models whose price there matched the
 * provider's own pricing page on PRICES_CHECKED belong here: this list is published, the table behind it is an internal estimate.
 */
export const CALCULATOR_MODELS: CalculatorModel[] = [
  { provider: 'openai', providerLabel: 'OpenAI', model: 'gpt-5', label: 'GPT-5' },
  { provider: 'openai', providerLabel: 'OpenAI', model: 'gpt-5-mini', label: 'GPT-5 mini' },
  { provider: 'openai', providerLabel: 'OpenAI', model: 'gpt-5-nano', label: 'GPT-5 nano' },
  { provider: 'openai', providerLabel: 'OpenAI', model: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
  { provider: 'openai', providerLabel: 'OpenAI', model: 'gpt-4o-mini', label: 'GPT-4o mini' },
  { provider: 'anthropic', providerLabel: 'Anthropic', model: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
  { provider: 'anthropic', providerLabel: 'Anthropic', model: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
  { provider: 'anthropic', providerLabel: 'Anthropic', model: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  { provider: 'gemini', providerLabel: 'Google', model: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { provider: 'gemini', providerLabel: 'Google', model: 'gemini-3-flash', label: 'Gemini 3 Flash' },
  { provider: 'gemini', providerLabel: 'Google', model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { provider: 'gemini', providerLabel: 'Google', model: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
  { provider: 'groq', providerLabel: 'Groq', model: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
];

export interface ModelCost extends CalculatorModel {
  price: ModelPrice;
  perConversation: number;
  perMonth: number;
}

/** Every compared model's cost for the scenario, cheapest first. */
export function compareModels(s: ChatScenario): ModelCost[] {
  return CALCULATOR_MODELS.map((m) => {
    const price = priceFor(m.provider, m.model);
    const perConversation = conversationCostUsd(s, price);
    return { ...m, price, perConversation, perMonth: perConversation * s.conversations };
  }).sort((a, b) => a.perConversation - b.perConversation);
}

/** US dollars with enough digits to tell fractions of a cent apart. Always en-US, so the server and the browser print the same. */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '$0';
  if (value >= 0.1) return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 0.01) return '$' + value.toFixed(3);
  return '$' + value.toLocaleString('en-US', { maximumSignificantDigits: 2 });
}

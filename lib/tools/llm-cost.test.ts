import { describe, it, expect } from 'vitest';
import { hasListedPrice } from '../ai/pricing';
import {
  CALCULATOR_MODELS,
  DEFAULT_SCENARIO,
  clampScenario,
  compareModels,
  conversationCostUsd,
  conversationTokens,
  formatUsd,
  scenarioFromQuery,
  scenarioToQuery,
} from './llm-cost';

describe('chatbot conversation cost', () => {
  it('bills one message as prompt + knowledge + question in, one reply out', () => {
    const one = conversationTokens({ ...DEFAULT_SCENARIO, turns: 1 });
    // 300 + 1200 + 20 words in, 60 words out, at 4 tokens per 3 words
    expect(one).toEqual({ input: 400 + 1600 + 27, output: 80 });
  });

  it('re-sends the whole chat so far with every message', () => {
    // 6 x (400 + 1600) fixed, the question sent 1+2+..+6 times, earlier replies sent 0+1+..+5 times
    expect(conversationTokens(DEFAULT_SCENARIO)).toEqual({ input: 12000 + 27 * 21 + 80 * 15, output: 480 });
  });

  it('makes a ten-message chat cost far more than ten one-message chats', () => {
    const bare = { ...DEFAULT_SCENARIO, knowledgeWords: 0, promptWords: 0 };
    const one = conversationTokens({ ...bare, turns: 1 }).input;
    const ten = conversationTokens({ ...bare, turns: 10 }).input;
    expect(ten).toBe(27 * 55 + 80 * 45);
    expect(ten).toBeGreaterThan(one * 10 * 10);
  });

  it('prices tokens per million at the model rate', () => {
    expect(conversationCostUsd(DEFAULT_SCENARIO, { input: 0.15, output: 0.6 })).toBeCloseTo(0.00235305, 8);
  });

  it('keeps every input inside its limits', () => {
    const s = clampScenario({ conversations: -5, turns: 9999, userWords: 2.6, replyWords: 'abc', knowledgeWords: -1, promptWords: Infinity });
    expect(s.conversations).toBe(1);
    expect(s.turns).toBe(100);
    expect(s.userWords).toBe(3);
    expect(s.replyWords).toBe(DEFAULT_SCENARIO.replyWords);
    expect(s.knowledgeWords).toBe(0);
    expect(s.promptWords).toBe(DEFAULT_SCENARIO.promptWords);
  });
});

describe('shareable scenario links', () => {
  it('writes only what differs from the defaults', () => {
    expect(scenarioToQuery(DEFAULT_SCENARIO)).toBe('');
    expect(scenarioToQuery({ ...DEFAULT_SCENARIO, conversations: 5000, turns: 10 })).toBe('c=5000&m=10');
  });

  it('reads a link back into the same scenario', () => {
    const s = { conversations: 250, turns: 12, userWords: 15, replyWords: 90, knowledgeWords: 0, promptWords: 500 };
    expect(scenarioFromQuery('?' + scenarioToQuery(s))).toEqual(s);
  });

  it('ignores junk in the address', () => {
    expect(scenarioFromQuery('?c=lots&m=&utm_source=x')).toEqual(DEFAULT_SCENARIO);
  });
});

describe('model comparison', () => {
  it('lists only models that have their own price', () => {
    for (const m of CALCULATOR_MODELS) expect(hasListedPrice(m.provider, m.model), m.model).toBe(true);
  });

  it('sorts cheapest first and multiplies up to the month', () => {
    const rows = compareModels({ ...DEFAULT_SCENARIO, conversations: 2000 });
    expect(rows).toHaveLength(CALCULATOR_MODELS.length);
    for (let i = 1; i < rows.length; i++) expect(rows[i].perConversation).toBeGreaterThanOrEqual(rows[i - 1].perConversation);
    expect(rows[0].perMonth).toBeCloseTo(rows[0].perConversation * 2000, 10);
  });
});

describe('formatUsd', () => {
  it('shows enough digits for very small amounts', () => {
    expect(formatUsd(1234.5)).toBe('$1,234.50');
    expect(formatUsd(2.353)).toBe('$2.35');
    expect(formatUsd(0.88)).toBe('$0.88');
    expect(formatUsd(0.0235)).toBe('$0.024');
    expect(formatUsd(0.00235305)).toBe('$0.0024');
    expect(formatUsd(0)).toBe('$0');
    expect(formatUsd(NaN)).toBe('$0');
  });
});

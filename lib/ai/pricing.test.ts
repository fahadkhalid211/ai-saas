import { describe, it, expect } from 'vitest';
import { estimateCostUsd, priceFor } from './pricing';

describe('model pricing', () => {
  it('prices known models per million tokens', () => {
    expect(priceFor('anthropic', 'claude-opus-5')).toEqual({ input: 5, output: 25 });
    expect(priceFor('openai', 'gpt-4o-mini')).toEqual({ input: 0.15, output: 0.6 });
    expect(estimateCostUsd('anthropic', 'claude-haiku-4-5', 1_000_000, 1_000_000)).toBeCloseTo(6);
  });

  it('matches dated snapshots by the longest prefix', () => {
    expect(priceFor('openai', 'gpt-4o-2024-08-06')).toEqual(priceFor('openai', 'gpt-4o'));
    expect(priceFor('openai', 'gpt-4o-mini-2024-07-18')).toEqual({ input: 0.15, output: 0.6 });
    expect(priceFor('anthropic', 'claude-3-5-haiku-20241022')).toEqual({ input: 0.8, output: 4 });
    expect(priceFor('anthropic', 'claude-sonnet-4-6')).toEqual({ input: 3, output: 15 });
    expect(priceFor('openai', 'o3-mini')).toEqual({ input: 1.1, output: 4.4 });
  });

  it('prices unknown models high so the cap errs early', () => {
    const unknown = priceFor('anthropic', 'claude-something-new');
    expect(unknown.input).toBeGreaterThanOrEqual(10);
    expect(priceFor('custom', 'my-model').input).toBeGreaterThan(1);
    expect(priceFor('openai', 'gpt-99').output).toBeGreaterThanOrEqual(60);
  });

  it('never returns a negative or NaN cost', () => {
    expect(estimateCostUsd('openai', 'gpt-4o', -5, NaN)).toBe(0);
  });
});

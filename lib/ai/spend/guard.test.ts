import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/db/postgres', () => ({ isPostgresConfigured: () => false, getPostgresPool: () => null }));

import type { AssistantData } from '@/lib/db';
import { applyCostCap, recordUsage, sanitizeCostCap, setCostCapNotifier, spendSummary, usesCustomerKey, FALLBACK_GROQ_MODEL } from './guard';
import { getSpend, resetMemorySpend } from './store';
import type { ProviderOptions } from '@/lib/ai/types';

const assistant = (costCap?: AssistantData['costCap']): AssistantData =>
  ({ id: 'ast_1', workspaceId: 'ws_1', name: 'Front desk', provider: 'anthropic', modelName: 'claude-haiku-4-5', apiKeyEncrypted: 'sk-ant-customer', costCap }) as AssistantData;

const opts = (a: AssistantData): ProviderOptions => ({ provider: a.provider, modelName: a.modelName, apiKey: a.apiKeyEncrypted });

/** $1 of Haiku 4.5 output. */
const usage = (outputTokens = 200_000) => ({ provider: 'anthropic', model: 'claude-haiku-4-5', inputTokens: 0, outputTokens, estimated: false });

describe('monthly cost cap', () => {
  const alerts: string[] = [];

  beforeEach(() => {
    resetMemorySpend();
    alerts.length = 0;
    setCostCapNotifier(async (_a, kind, spend, cap) => {
      alerts.push(`${kind}:${spend.toFixed(2)}/${cap.monthlyUsd}`);
    });
    vi.stubEnv('GROQ_API_KEY', 'gsk_platform');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('meters replies under the cap on the customer key', async () => {
    const a = assistant({ enabled: true, monthlyUsd: 10, onLimit: 'fallback_groq' });
    const d = await applyCostCap(a, opts(a));
    expect(d.blocked).toBe(false);
    expect(d.options.provider).toBe('anthropic');
    d.options.onUsage!(usage());
    await d.settle();
    expect((await getSpend('ast_1')).costUsd).toBeCloseTo(1);
  });

  it('meters spend even when no cap is set, so the dashboard can show it', async () => {
    const a = assistant();
    const d = await applyCostCap(a, opts(a));
    d.options.onUsage!(usage());
    await d.settle();
    expect((await spendSummary(a)).spendUsd).toBeCloseTo(1);
    expect(alerts).toEqual([]);
  });

  it('switches to free Groq once the cap is reached', async () => {
    const a = assistant({ enabled: true, monthlyUsd: 2, onLimit: 'fallback_groq' });
    await recordUsage(a, usage(400_000)); // $2
    const d = await applyCostCap(a, opts(a));
    expect(d.blocked).toBe(false);
    expect(d.fellBack).toBe(true);
    expect(d.options).toMatchObject({ provider: 'groq', apiKey: 'gsk_platform', modelName: FALLBACK_GROQ_MODEL });
    expect(d.options.onUsage).toBeUndefined();
  });

  it('stops when the owner chose stop, or when there is no Groq key to fall back to', async () => {
    const stop = assistant({ enabled: true, monthlyUsd: 1, onLimit: 'stop' });
    await recordUsage(stop, usage());
    expect((await applyCostCap(stop, opts(stop))).blocked).toBe(true);

    vi.stubEnv('GROQ_API_KEY', '');
    const fallback = assistant({ enabled: true, monthlyUsd: 1, onLimit: 'fallback_groq' });
    expect((await applyCostCap(fallback, opts(fallback))).blocked).toBe(true);
  });

  it('sends the 80% warning and the 100% alert once each', async () => {
    const a = assistant({ enabled: true, monthlyUsd: 10, onLimit: 'fallback_groq' });
    for (let i = 0; i < 7; i++) await recordUsage(a, usage()); // $7
    expect(alerts).toEqual([]);
    await recordUsage(a, usage()); // $8
    await recordUsage(a, usage()); // $9
    expect(alerts).toEqual(['warning:8.00/10']);
    await recordUsage(a, usage()); // $10
    await recordUsage(a, usage()); // $11
    expect(alerts).toEqual(['warning:8.00/10', 'reached:10.00/10']);
  });

  it('re-arms the alerts when the owner raises the cap', async () => {
    const a = assistant({ enabled: true, monthlyUsd: 10, onLimit: 'fallback_groq' });
    for (let i = 0; i < 10; i++) await recordUsage(a, usage()); // $10: warning + reached
    expect(alerts).toHaveLength(2);

    const raised = assistant({ enabled: true, monthlyUsd: 20, onLimit: 'fallback_groq' });
    const d = await applyCostCap(raised, opts(raised));
    expect(d.fellBack).toBe(false);
    expect(d.options.provider).toBe('anthropic');
    for (let i = 0; i < 6; i++) await recordUsage(raised, usage()); // $16
    expect(alerts.slice(2)).toEqual(['warning:16.00/20']);
  });

  it('alerts when the owner lowers the cap below this month\'s spend', async () => {
    await recordUsage(assistant(), usage(1_000_000)); // $5, no cap yet
    const lowered = assistant({ enabled: true, monthlyUsd: 3, onLimit: 'stop' });
    const d = await applyCostCap(lowered, opts(lowered));
    await d.settle();
    expect(d.blocked).toBe(true);
    expect(alerts).toEqual(['reached:5.00/3']);
  });

  it('leaves free tiers, local models and platform keys alone', async () => {
    const capped = { enabled: true, monthlyUsd: 1, onLimit: 'stop' as const };
    for (const a of [
      { ...assistant(capped), provider: 'auto_free' },
      { ...assistant(capped), provider: 'ollama' },
      { ...assistant(capped), provider: 'groq', apiKeyEncrypted: 'gsk_platform' },
    ]) {
      await recordUsage(a, usage(10_000_000));
      const d = await applyCostCap(a, opts(a));
      expect(d.blocked).toBe(false);
      expect(d.options.onUsage).toBeUndefined();
    }
    expect(usesCustomerKey({ provider: 'openai', apiKey: 'sk-customer' })).toBe(true);
  });
});

describe('sanitizeCostCap', () => {
  it('accepts a valid cap and rounds to cents', () => {
    expect(sanitizeCostCap({ enabled: true, monthlyUsd: '100.456', onLimit: 'stop' })).toEqual({
      ok: true,
      value: { enabled: true, monthlyUsd: 100.46, onLimit: 'stop' },
    });
  });

  it('rejects out-of-range amounts and unknown actions', () => {
    expect(sanitizeCostCap({ enabled: true, monthlyUsd: 0 }).ok).toBe(false);
    expect(sanitizeCostCap({ enabled: true, monthlyUsd: 500000 }).ok).toBe(false);
    expect(sanitizeCostCap({ enabled: true, monthlyUsd: 50, onLimit: 'explode' }).ok).toBe(false);
    expect(sanitizeCostCap('100').ok).toBe(false);
  });

  it('keeps a switched-off cap without validating the amount', () => {
    expect(sanitizeCostCap({ enabled: false, monthlyUsd: '' })).toEqual({ ok: true, value: { enabled: false, monthlyUsd: 100, onLimit: 'fallback_groq' } });
  });
});

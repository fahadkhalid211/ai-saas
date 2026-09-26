import type { AssistantData, CostCapSettings } from '@/lib/db';
import type { LLMUsage, ProviderOptions } from '@/lib/ai/types';
import { estimateCostUsd } from '@/lib/ai/pricing';
import { addSpend, claimAlert, getSpend, periodOf, periodResetsAt, type CapAlertKind } from './store';

/**
 * Monthly cost cap for customers who bring their own AI key. Every reply on their key is metered (estimated from the token
 * counts the provider reports); at 80% of the cap the owner is warned, and at 100% the assistant either switches to the
 * platform's free Groq model or stops replying, as the owner chose. The owner can change the cap at any time, and the next
 * message uses the new value.
 */

export const WARNING_RATIO = 0.8;
export const FALLBACK_GROQ_MODEL = 'openai/gpt-oss-120b';
export const COST_CAP_PAUSED_MESSAGE =
  'This assistant is temporarily unavailable. Please try again later or contact the business directly.';

/** Providers that bill the key's owner per token. */
const METERED_PROVIDERS = new Set(['openai', 'anthropic', 'gemini', 'deepseek', 'groq', 'custom']);

export type CapState = 'ok' | 'warning' | 'reached';

export interface CostCapDecision {
  options: ProviderOptions;
  /** Stop: do not call the model; show COST_CAP_PAUSED_MESSAGE instead. */
  blocked: boolean;
  /** The cap is reached and this reply runs on the free fallback model. */
  fellBack: boolean;
  /** Resolves once this reply's spend has been saved (await it before the request ends). */
  settle: () => Promise<void>;
}

/** A valid cap, or null when none is set or it is switched off. */
export function activeCap(assistant: Pick<AssistantData, 'costCap'>): CostCapSettings | null {
  const cap = assistant.costCap;
  if (!cap || !cap.enabled) return null;
  const usd = Number(cap.monthlyUsd);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  return { enabled: true, monthlyUsd: usd, onLimit: cap.onLimit === 'stop' ? 'stop' : 'fallback_groq' };
}

/** True when replies are paid by the customer's own key (not a free tier, a local model or a platform key). */
export function usesCustomerKey(options: Pick<ProviderOptions, 'provider' | 'apiKey'>): boolean {
  const provider = (options.provider || '').toLowerCase();
  if (!METERED_PROVIDERS.has(provider) || !options.apiKey) return false;
  const platformKeys = [
    process.env.GROQ_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.OPENAI_API_KEY,
    process.env.ANTHROPIC_API_KEY,
    process.env.DEEPSEEK_API_KEY,
  ].filter(Boolean);
  return !platformKeys.includes(options.apiKey);
}

export function capState(spendUsd: number, capUsd: number): CapState {
  if (spendUsd >= capUsd) return 'reached';
  if (spendUsd >= capUsd * WARNING_RATIO) return 'warning';
  return 'ok';
}

type Notifier = (assistant: AssistantData, kind: CapAlertKind, spendUsd: number, cap: CostCapSettings) => Promise<void>;
let notifier: Notifier = (...args) => import('./notify').then((m) => m.notifyCostCap(...args));

/** Test hook: replace how alerts are delivered. */
export function setCostCapNotifier(fn: Notifier): void {
  notifier = fn;
}

/** Sends the 80% or 100% alert if the spend has crossed that line and it was not already sent for this cap. Never throws. */
async function checkThresholds(assistant: AssistantData, period: string, spendUsd: number): Promise<void> {
  const cap = activeCap(assistant);
  if (!cap) return;
  const state = capState(spendUsd, cap.monthlyUsd);
  if (state === 'ok') return;
  try {
    if (state === 'reached') {
      // the warning is claimed too, so a later small top-up of the cap does not send a stale 80% notice
      await claimAlert(assistant.id, period, 'warning', cap.monthlyUsd);
      if (await claimAlert(assistant.id, period, 'reached', cap.monthlyUsd)) await notifier(assistant, 'reached', spendUsd, cap);
    } else if (await claimAlert(assistant.id, period, 'warning', cap.monthlyUsd)) {
      await notifier(assistant, 'warning', spendUsd, cap);
    }
  } catch (err) {
    console.warn('[CostCap] alert failed:', (err as Error)?.message);
  }
}

/** Saves one request's usage against the assistant's month and sends any alert it triggers. Never throws. */
export async function recordUsage(assistant: AssistantData, usage: LLMUsage): Promise<void> {
  try {
    const period = periodOf();
    const costUsd = estimateCostUsd(usage.provider, usage.model, usage.inputTokens, usage.outputTokens);
    const row = await addSpend({
      assistantId: assistant.id,
      workspaceId: assistant.workspaceId,
      period,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd,
    });
    await checkThresholds(assistant, period, row.costUsd);
  } catch (err) {
    console.warn('[CostCap] recording usage failed:', (err as Error)?.message);
  }
}

/**
 * Decides how this reply may run. Call it right before the model call with the options that would be used, then use the
 * returned options instead and await settle() once the reply is complete.
 */
export async function applyCostCap(assistant: AssistantData, options: ProviderOptions): Promise<CostCapDecision> {
  const pending: Promise<void>[] = [];
  const settle = async () => {
    await Promise.allSettled(pending);
  };
  if (!usesCustomerKey(options)) return { options, blocked: false, fellBack: false, settle };

  const cap = activeCap(assistant);
  if (cap) {
    const period = periodOf();
    let spendUsd = 0;
    try {
      spendUsd = (await getSpend(assistant.id, period)).costUsd;
    } catch {
      // cannot read the spend: let the reply through rather than take the assistant down
    }
    if (spendUsd >= cap.monthlyUsd) {
      pending.push(checkThresholds(assistant, period, spendUsd)); // e.g. the owner lowered the cap below this month's spend
      const groqKey = process.env.GROQ_API_KEY;
      if (cap.onLimit === 'fallback_groq' && groqKey) {
        const { onUsage: _meter, customBaseUrl: _url, ...rest } = options;
        return {
          options: { ...rest, provider: 'groq', apiKey: groqKey, modelName: FALLBACK_GROQ_MODEL },
          blocked: false,
          fellBack: true,
          settle,
        };
      }
      return { options, blocked: true, fellBack: false, settle };
    }
  }

  const previous = options.onUsage;
  return {
    options: {
      ...options,
      onUsage: (usage) => {
        previous?.(usage);
        pending.push(recordUsage(assistant, usage));
      },
    },
    blocked: false,
    fellBack: false,
    settle,
  };
}

/** What the dashboard shows for one assistant this month. */
export async function spendSummary(assistant: AssistantData) {
  const period = periodOf();
  const row = await getSpend(assistant.id, period);
  const cap = activeCap(assistant);
  const capUsd = cap?.monthlyUsd ?? null;
  return {
    period,
    spendUsd: Math.round(row.costUsd * 10000) / 10000,
    inputTokens: row.inputTokens,
    outputTokens: row.outputTokens,
    capUsd,
    percent: capUsd ? Math.min(999, Math.round((row.costUsd / capUsd) * 1000) / 10) : null,
    state: capUsd ? capState(row.costUsd, capUsd) : ('ok' as CapState),
    onLimit: cap?.onLimit ?? assistant.costCap?.onLimit ?? 'fallback_groq',
    resetsAt: periodResetsAt(),
    metered: usesCustomerKey({ provider: assistant.provider, apiKey: assistant.apiKeyEncrypted }),
  };
}

export const MIN_CAP_USD = 1;
export const MAX_CAP_USD = 100000;

/** Checks a cap sent from the dashboard. null clears it. */
export function sanitizeCostCap(raw: unknown): { ok: true; value: CostCapSettings | null } | { ok: false; error: string } {
  if (raw === null) return { ok: true, value: null };
  if (typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'Invalid cost cap settings.' };
  const r = raw as Record<string, unknown>;
  const enabled = r.enabled === true;
  const usd = Math.round(Number(r.monthlyUsd) * 100) / 100;
  if (enabled && (!Number.isFinite(usd) || usd < MIN_CAP_USD || usd > MAX_CAP_USD)) {
    return { ok: false, error: `The monthly cost cap must be between $${MIN_CAP_USD} and $${MAX_CAP_USD.toLocaleString('en-US')}.` };
  }
  if (r.onLimit !== undefined && r.onLimit !== 'fallback_groq' && r.onLimit !== 'stop') {
    return { ok: false, error: 'Choose what happens at the cap: switch to free Groq, or stop replying.' };
  }
  return {
    ok: true,
    value: {
      enabled,
      monthlyUsd: Number.isFinite(usd) && usd > 0 ? Math.min(usd, MAX_CAP_USD) : 100,
      onLimit: r.onLimit === 'stop' ? 'stop' : 'fallback_groq',
    },
  };
}

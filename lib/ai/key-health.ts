import crypto from 'node:crypto';
import { Database, type AssistantData } from '@/lib/db';
import { verifyAiProviderConnection, type VerificationResult } from '@/lib/connectors/verify';
import { hasConnectedAiKey, withEnvProviderFallback } from '@/lib/ai/resolve-provider';

/**
 * Whether the AI key an assistant answers with actually works, as far as the provider says.
 *
 * "Has a key" (hasConnectedAiKey) only means a string is stored. A key can be revoked, run out of credit, be pasted wrong or belong to
 * another provider and still be "connected" in that sense, so the dashboard showed a green "Live" while every reply failed. This keeps
 * the provider's actual verdict next to the assistant, and keeps it current:
 *
 *  - checked when the dashboard asks (and again every minute or so while it is open),
 *  - set at once when a visitor's chat is refused by the provider (app/api/chat/route.ts), and when it succeeds again,
 *  - always tied to the exact key and provider it was about (the fingerprint), so changing either can never inherit an old verdict.
 *
 * A network problem or a provider outage is "unreachable", never "invalid": it says nothing about the key and must not alarm anyone
 * into replacing a good key.
 */

export type KeyState = 'valid' | 'invalid' | 'unreachable' | 'missing' | 'unknown';

export type StoredKeyStatus = NonNullable<AssistantData['aiKeyStatus']>;

export interface KeyHealth {
  state: KeyState;
  message: string;
  /** ISO time of the check this is based on (null when nothing has been checked for the current key). */
  checkedAt: string | null;
  provider: string;
}

/** How long a verdict is trusted before the key is asked about again. A broken key is looked at again sooner, so a fix shows quickly. */
export const FRESH_MS = { valid: 90_000, other: 30_000 } as const;

export function keyFingerprint(provider: string, plainKey: string): string {
  return crypto.createHash('sha256').update(`${(provider || '').toLowerCase()}\n${plainKey || ''}`).digest('hex').slice(0, 16);
}

/** The provider, key and endpoint the assistant really answers with (its own, or the platform's from the environment). */
export function effectiveEngine(assistant: AssistantData): { provider: string; key: string; baseUrl?: string; model?: string } {
  const e = withEnvProviderFallback(assistant);
  return { provider: e.provider, key: e.apiKeyEncrypted || '', baseUrl: e.customBaseUrl || undefined, model: e.modelName || undefined };
}

/** What is known right now about the key, without asking the provider. A verdict about a different key or provider does not count. */
export function currentHealth(assistant: AssistantData): KeyHealth {
  const engine = effectiveEngine(assistant);
  const needsKey = engine.provider !== 'ollama' && engine.provider !== 'auto_free' && engine.provider !== 'custom';
  if (needsKey && !engine.key.trim()) {
    return { state: 'missing', message: 'No API key is connected.', checkedAt: null, provider: engine.provider };
  }
  const stored = assistant.aiKeyStatus;
  if (stored && stored.fingerprint === keyFingerprint(engine.provider, engine.key)) {
    return { state: stored.state, message: stored.message, checkedAt: stored.checkedAt, provider: engine.provider };
  }
  return { state: 'unknown', message: 'Not checked yet.', checkedAt: null, provider: engine.provider };
}

export function isFresh(health: KeyHealth, now: number = Date.now()): boolean {
  if (!health.checkedAt || health.state === 'unknown') return false;
  const age = now - Date.parse(health.checkedAt);
  return age >= 0 && age < (health.state === 'valid' ? FRESH_MS.valid : FRESH_MS.other);
}

function toStored(result: VerificationResult, provider: string, key: string): StoredKeyStatus {
  const state: StoredKeyStatus['state'] = result.success ? 'valid' : result.failure === 'invalid' || result.failure === 'missing' ? 'invalid' : 'unreachable';
  return { state, message: result.message, checkedAt: new Date().toISOString(), fingerprint: keyFingerprint(provider, key), provider };
}

const inFlight = new Map<string, Promise<KeyHealth>>();

/** Asks the provider about the assistant's key now, stores the verdict and returns it. Concurrent calls for one assistant share one request. */
export function checkAssistantKey(assistant: AssistantData): Promise<KeyHealth> {
  const running = inFlight.get(assistant.id);
  if (running) return running;
  const job = (async (): Promise<KeyHealth> => {
    const engine = effectiveEngine(assistant);
    const needsKey = engine.provider !== 'ollama' && engine.provider !== 'auto_free' && engine.provider !== 'custom';
    if (needsKey && !engine.key.trim()) {
      await Database.setAiKeyStatus(assistant.id, null);
      return { state: 'missing', message: 'No API key is connected.', checkedAt: null, provider: engine.provider };
    }
    const result = await verifyAiProviderConnection(engine.provider, engine.key, { customBaseUrl: engine.baseUrl, modelName: engine.model });
    const stored = toStored(result, engine.provider, engine.key);
    await Database.setAiKeyStatus(assistant.id, stored);
    return { state: stored.state, message: stored.message, checkedAt: stored.checkedAt, provider: engine.provider };
  })().finally(() => {
    inFlight.delete(assistant.id);
  });
  inFlight.set(assistant.id, job);
  return job;
}

/** The stored verdict if it is recent enough, otherwise a fresh check. */
export async function healthOf(assistant: AssistantData, opts: { force?: boolean } = {}): Promise<KeyHealth> {
  const known = currentHealth(assistant);
  if (!opts.force && (known.state === 'missing' || isFresh(known))) return known;
  return checkAssistantKey(assistant);
}

/** Wording of a refusal for the visitor-facing logs and the dashboard, from the provider layer's own error text. */
export function isAuthenticationFailure(reply: string): boolean {
  return /^\s*\*\(Authentication Error:/.test(reply || '');
}

/**
 * Called after a visitor's chat. A reply the provider refused because of the key marks it broken straight away (the dashboard shows it
 * within seconds, not at the next scheduled check); a normal reply after a broken verdict marks it working again. Anything else (a
 * network blip, a rate limit) says nothing about the key and changes nothing.
 */
export async function recordChatOutcome(assistant: AssistantData, reply: string, ok: boolean): Promise<void> {
  try {
    const engine = effectiveEngine(assistant);
    const fingerprint = keyFingerprint(engine.provider, engine.key);
    const known = assistant.aiKeyStatus && assistant.aiKeyStatus.fingerprint === fingerprint ? assistant.aiKeyStatus : null;
    if (isAuthenticationFailure(reply)) {
      const message = reply.replace(/^\s*\*\(Authentication Error:\s*/, '').replace(/\)\*\s*$/, '').trim().slice(0, 300) || 'The provider rejected the key.';
      await Database.setAiKeyStatus(assistant.id, { state: 'invalid', message, checkedAt: new Date().toISOString(), fingerprint, provider: engine.provider });
    } else if (ok && (!known || known.state !== 'valid')) {
      await Database.setAiKeyStatus(assistant.id, { state: 'valid', message: 'A customer conversation was answered with this key.', checkedAt: new Date().toISOString(), fingerprint, provider: engine.provider });
    }
  } catch (err) {
    console.warn('[KeyHealth] Could not record the chat outcome:', (err as Error)?.message);
  }
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Keys and providers
// ---------------------------------------------------------------------------------------------------------------------------------

/** Providers that need their own key pasted in (the others run without one or take an optional one). */
export const KEY_PROVIDERS = ['groq', 'gemini', 'openai', 'anthropic', 'deepseek'] as const;

export function needsOwnKey(provider: string): boolean {
  return (KEY_PROVIDERS as readonly string[]).includes((provider || '').toLowerCase());
}

/** The platform's own key for a provider, from the environment, if there is one. */
export function platformKeyFor(provider: string): string {
  const env = process.env;
  switch ((provider || '').toLowerCase()) {
    case 'groq': return env.GROQ_API_KEY || '';
    case 'gemini': return env.GEMINI_API_KEY || '';
    case 'openai': return env.OPENAI_API_KEY || '';
    case 'anthropic': return env.ANTHROPIC_API_KEY || '';
    default: return '';
  }
}

/** Which provider the key saved on an assistant belongs to. Records from before this was tracked: the provider the assistant was on. */
export function storedKeyProvider(a: Pick<AssistantData, 'provider' | 'apiKeyProvider'>): string {
  return (a.apiKeyProvider || a.provider || 'groq').toLowerCase();
}

/** True when a pasted value is the masked placeholder the screens show for a saved key (it is not a key). */
export function isMaskedKey(value: unknown): boolean {
  return typeof value === 'string' && value.includes('****');
}

/** Stores the verdict of a check that was just made on a key (saving settings, the test button) so the screens agree with it at once. */
export async function recordVerification(assistant: AssistantData, result: VerificationResult): Promise<KeyHealth> {
  const engine = effectiveEngine(assistant);
  const stored = toStored(result, engine.provider, engine.key);
  await Database.setAiKeyStatus(assistant.id, stored);
  return { state: stored.state, message: stored.message, checkedAt: stored.checkedAt, provider: engine.provider };
}

/** The fields the screens get with an assistant: whether a key is saved, and what is known about whether it works. */
export function keyFieldsForClient(a: AssistantData) {
  return { hasConnectedKey: hasConnectedAiKey(a), keyHealth: currentHealth(a), aiKeyStatus: undefined };
}


import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../db';
import { checkAssistantKey, currentHealth, healthOf, isFresh, keyFingerprint, recordChatOutcome, FRESH_MS } from './key-health';
import { failureForStatus } from '../connectors/verify';

const tag = Math.random().toString(36).slice(2, 8);

/** A pretend provider: answers the "list models" request according to the key it is given. */
function providerAnswers(rules: Record<string, number | 'network'>) {
  const calls: Array<{ url: string; key: string }> = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const auth = String((init?.headers as Record<string, string> | undefined)?.Authorization || '');
      const key = auth.replace(/^Bearer\s+/, '') || String(url).split('key=')[1] || '';
      calls.push({ url: String(url), key });
      const rule = rules[key];
      if (rule === 'network') throw new Error('fetch failed');
      const status = typeof rule === 'number' ? rule : 401;
      return new Response(JSON.stringify(status === 200 ? { data: [] } : { error: { message: status === 401 ? 'Invalid API Key' : 'trouble' } }), { status });
    }),
  );
  return calls;
}

async function assistantWithKey(provider: string, key: string) {
  const a = await Database.createAssistant({ name: `Key health ${tag}`, workspaceId: `ws_keyhealth_${tag}`, provider, apiKeyEncrypted: key } as any);
  return (await Database.getAssistantById(a.id))!;
}

afterEach(() => vi.unstubAllGlobals());
beforeEach(() => {
  vi.stubEnv('GROQ_API_KEY', '');
  vi.stubEnv('GEMINI_API_KEY', '');
  vi.stubEnv('OPENAI_API_KEY', '');
  vi.stubEnv('ANTHROPIC_API_KEY', '');
});

describe('what a failed check means', () => {
  it('only a refusal of the key counts against the key; outages and rate limits do not', () => {
    expect(failureForStatus(401)).toBe('invalid');
    expect(failureForStatus(403)).toBe('invalid');
    expect(failureForStatus(400)).toBe('invalid'); // Gemini answers a bad key with 400
    expect(failureForStatus(404)).toBe('unreachable');
    expect(failureForStatus(429)).toBe('unreachable');
    expect(failureForStatus(500)).toBe('unreachable');
    expect(failureForStatus(503)).toBe('unreachable');
  });
});

describe('checking the key with the provider', () => {
  it('reports a working key as valid, and remembers it for exactly that key', async () => {
    const calls = providerAnswers({ gsk_good_key_1: 200 });
    const a = await assistantWithKey('groq', 'gsk_good_key_1');
    expect(currentHealth(a).state).toBe('unknown');

    const health = await checkAssistantKey(a);
    expect(health.state).toBe('valid');
    expect(calls[0].key).toBe('gsk_good_key_1'); // the real key, not a masked copy

    const stored = (await Database.getAssistantById(a.id))!;
    expect(currentHealth(stored).state).toBe('valid');
    expect(stored.aiKeyStatus?.fingerprint).toBe(keyFingerprint('groq', 'gsk_good_key_1'));
  });

  it('reports a refused key as invalid, with the provider\'s reason', async () => {
    providerAnswers({});
    const a = await assistantWithKey('groq', 'gsk_revoked_key');
    const health = await checkAssistantKey(a);
    expect(health.state).toBe('invalid');
    expect(health.message).toMatch(/Invalid API Key/);
  });

  it('does not call a good key invalid because the provider could not be reached', async () => {
    providerAnswers({ gsk_blip_key: 'network' });
    const a = await assistantWithKey('groq', 'gsk_blip_key');
    expect((await checkAssistantKey(a)).state).toBe('unreachable');

    providerAnswers({ gsk_blip_key: 429 });
    expect((await checkAssistantKey(a)).state).toBe('unreachable');

    providerAnswers({ gsk_blip_key: 500 });
    expect((await checkAssistantKey(a)).state).toBe('unreachable');
  });

  it('notices when a working key stops working, and when it works again', async () => {
    const a = await assistantWithKey('groq', 'gsk_flaky_key');
    providerAnswers({ gsk_flaky_key: 200 });
    expect((await checkAssistantKey(a)).state).toBe('valid');
    providerAnswers({ gsk_flaky_key: 401 });
    expect((await checkAssistantKey(a)).state).toBe('invalid');
    providerAnswers({ gsk_flaky_key: 200 });
    expect((await checkAssistantKey(a)).state).toBe('valid');
  });

  it('asks the provider once however many screens ask at the same time', async () => {
    const calls = providerAnswers({ gsk_shared_key: 200 });
    const a = await assistantWithKey('groq', 'gsk_shared_key');
    await Promise.all(Array.from({ length: 10 }, () => checkAssistantKey(a)));
    expect(calls).toHaveLength(1);
  });

  it('has nothing to check when no key is saved', async () => {
    const calls = providerAnswers({});
    const a = await assistantWithKey('groq', '');
    expect((await checkAssistantKey(a)).state).toBe('missing');
    expect(calls).toHaveLength(0);
  });

  it('never lets a verdict about one key or provider describe another', async () => {
    providerAnswers({ gsk_first_key: 200 });
    const a = await assistantWithKey('groq', 'gsk_first_key');
    await checkAssistantKey(a);
    const verified = (await Database.getAssistantById(a.id))!;
    expect(currentHealth(verified).state).toBe('valid');

    // the key is replaced: the old verdict must not apply to the new one
    await Database.updateAssistant(a.id, { apiKeyEncrypted: 'gsk_second_key' });
    expect(currentHealth((await Database.getAssistantById(a.id))!).state).toBe('unknown');

    // and the same text under another provider is a different key
    expect(keyFingerprint('groq', 'k')).not.toBe(keyFingerprint('openai', 'k'));
  });
});

describe('how long a verdict is trusted', () => {
  it('re-checks an old verdict, sooner when the key is broken, and uses a fresh one as it is', async () => {
    const now = Date.now();
    const at = (msAgo: number) => new Date(now - msAgo).toISOString();
    const base = { message: '', provider: 'groq' };
    expect(isFresh({ ...base, state: 'valid', checkedAt: at(10_000) }, now)).toBe(true);
    expect(isFresh({ ...base, state: 'valid', checkedAt: at(FRESH_MS.valid + 1000) }, now)).toBe(false);
    expect(isFresh({ ...base, state: 'invalid', checkedAt: at(FRESH_MS.other + 1000) }, now)).toBe(false);
    expect(isFresh({ ...base, state: 'unknown', checkedAt: at(1000) }, now)).toBe(false);

    const calls = providerAnswers({ gsk_ttl_key: 200 });
    const a = await assistantWithKey('groq', 'gsk_ttl_key');
    await healthOf(a);
    const again = await healthOf((await Database.getAssistantById(a.id))!);
    expect(again.state).toBe('valid');
    expect(calls).toHaveLength(1); // the second ask used the stored verdict
    await healthOf((await Database.getAssistantById(a.id))!, { force: true });
    expect(calls).toHaveLength(2);
  });
});

describe('a customer\'s chat tells the dashboard at once', () => {
  it('marks the key rejected the moment the provider refuses it, and working again after a good reply', async () => {
    providerAnswers({ gsk_chat_key: 200 });
    const a = await assistantWithKey('groq', 'gsk_chat_key');
    await checkAssistantKey(a);
    expect(currentHealth((await Database.getAssistantById(a.id))!).state).toBe('valid');

    await recordChatOutcome((await Database.getAssistantById(a.id))!, '\n\n*(Authentication Error: Invalid API key for provider "groq". Please check your key in the assistant settings.)*', false);
    const broken = currentHealth((await Database.getAssistantById(a.id))!);
    expect(broken.state).toBe('invalid');
    expect(broken.message).toMatch(/Invalid API key/);

    await recordChatOutcome((await Database.getAssistantById(a.id))!, 'We are open from nine.', true);
    expect(currentHealth((await Database.getAssistantById(a.id))!).state).toBe('valid');
  });

  it('ignores a failure that says nothing about the key', async () => {
    providerAnswers({ gsk_chat_key_2: 200 });
    const a = await assistantWithKey('groq', 'gsk_chat_key_2');
    await checkAssistantKey(a);
    await recordChatOutcome((await Database.getAssistantById(a.id))!, '\n\n*(Connection Error: Unable to reach provider "groq".)*', false);
    await recordChatOutcome((await Database.getAssistantById(a.id))!, '\n\n*(AI Generation Error: Your connected groq API key has hit its rate limit.)*', false);
    expect(currentHealth((await Database.getAssistantById(a.id))!).state).toBe('valid');
  });
});

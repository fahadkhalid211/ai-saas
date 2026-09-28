import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { withEnvProviderFallback, hasConnectedAiKey } from './resolve-provider';
import type { AssistantData } from '@/lib/db';

describe('resolve-provider & Groq Default Configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OLLAMA_BASE_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('migrates legacy unconfigured ollama assistant to groq with openai/gpt-oss-120b', () => {
    const legacyAssistant: AssistantData = {
      id: 'ast_123',
      workspaceId: 'ws_default',
      name: 'Test Assistant',
      description: '',
      systemPrompt: 'You are helpful',
      welcomeMessage: 'Hello',
      fallbackMessage: 'Sorry',
      temperature: 0.3,
      contextChunks: 3,
      provider: 'ollama',
      modelName: 'llama3.2',
      apiKeyEncrypted: '',
      customBaseUrl: '',
      primaryColor: '#2563eb',
      launcherPosition: 'bottom-right',
      starterQuestions: [],
      collectLeadEmail: false,
      allowedDomains: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const resolved = withEnvProviderFallback(legacyAssistant);
    expect(resolved.provider).toBe('groq');
    expect(resolved.modelName).toBe('openai/gpt-oss-120b');
  });

  it('detects when an assistant has no connected AI key', () => {
    const assistantWithoutKey: Partial<AssistantData> = {
      provider: 'groq',
      apiKeyEncrypted: '',
    };
    expect(hasConnectedAiKey(assistantWithoutKey)).toBe(false);
  });

  it('detects when an assistant has a connected encrypted key', () => {
    const assistantWithKey: Partial<AssistantData> = {
      provider: 'groq',
      apiKeyEncrypted: 'gsk_test123456789',
    };
    expect(hasConnectedAiKey(assistantWithKey)).toBe(true);
  });

  it('detects when an assistant has masked key stored', () => {
    const assistantWithMaskedKey: Partial<AssistantData> = {
      provider: 'groq',
      apiKeyEncrypted: 'gsk_••••••••••••',
    };
    expect(hasConnectedAiKey(assistantWithMaskedKey)).toBe(true);
  });

  it('respects hasConnectedKey flag from API', () => {
    const assistantWithFlag = {
      provider: 'groq',
      hasConnectedKey: true,
    };
    expect(hasConnectedAiKey(assistantWithFlag)).toBe(true);
  });

  it('detects environment key when GROQ_API_KEY is present', () => {
    process.env.GROQ_API_KEY = 'gsk_env_key';
    const assistant: Partial<AssistantData> = {
      provider: 'groq',
      apiKeyEncrypted: '',
    };
    expect(hasConnectedAiKey(assistant)).toBe(true);
  });
});

import type { AssistantData } from '@/lib/db';

/**
 * Checks whether the assistant has a functional AI API key connected
 * (either on the assistant itself, explicit flag, or inherited from the environment).
 */
export function hasConnectedAiKey(
  assistant?: (Partial<AssistantData> & { hasConnectedKey?: boolean }) | null
): boolean {
  if (!assistant) return false;
  if (assistant.hasConnectedKey === true) return true;

  const prov = (assistant.provider || 'groq').toLowerCase().trim();

  // If assistant has its own encrypted key set (or masked key stored)
  if (assistant.apiKeyEncrypted && assistant.apiKeyEncrypted.trim().length > 0) {
    return true;
  }

  // Check if provider has environment-level key
  if (typeof process !== 'undefined' && process.env) {
    if (prov === 'groq' && Boolean(process.env.GROQ_API_KEY)) return true;
    if (prov === 'gemini' && Boolean(process.env.GEMINI_API_KEY)) return true;
    if (prov === 'openai' && Boolean(process.env.OPENAI_API_KEY)) return true;
    if (prov === 'anthropic' && Boolean(process.env.ANTHROPIC_API_KEY)) return true;
    if (prov === 'ollama' && Boolean(assistant.customBaseUrl || process.env.OLLAMA_BASE_URL)) return true;
  }

  return false;
}

/**
 * If an assistant is still on the legacy default "ollama" provider or has no provider set,
 * migrate it to "groq" as the default high-speed cloud provider.
 */
export function withEnvProviderFallback(assistant: AssistantData): AssistantData {
  let provider = (assistant.provider || 'groq').toLowerCase().trim();
  let modelName = assistant.modelName || 'openai/gpt-oss-120b';

  // Automatically migrate legacy default ollama to groq
  if (provider === 'ollama' && !assistant.apiKeyEncrypted && !assistant.customBaseUrl) {
    provider = 'groq';
    modelName = 'openai/gpt-oss-120b';
  }

  if (assistant.apiKeyEncrypted) {
    return {
      ...assistant,
      provider,
      modelName,
    };
  }

  // Use environment key if available
  if (process.env.GROQ_API_KEY) {
    return {
      ...assistant,
      provider: 'groq',
      apiKeyEncrypted: process.env.GROQ_API_KEY,
      modelName: modelName === 'llama3.2' ? 'openai/gpt-oss-120b' : modelName,
    };
  }
  if (process.env.GEMINI_API_KEY) {
    return {
      ...assistant,
      provider: 'gemini',
      apiKeyEncrypted: process.env.GEMINI_API_KEY,
      modelName: modelName === 'llama3.2' ? 'gemini-3.6-flash' : modelName,
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      ...assistant,
      provider: 'openai',
      apiKeyEncrypted: process.env.OPENAI_API_KEY,
      modelName: modelName === 'llama3.2' ? 'gpt-4o-mini' : modelName,
    };
  }

  return {
    ...assistant,
    provider,
    modelName,
  };
}

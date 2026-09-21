import type { AssistantData } from '@/lib/db';

/**
 * If an assistant is still on the default "ollama" provider with no key (Ollama is rarely reachable in
 * production), transparently upgrade it to whichever provider is configured at the environment level,
 * so chat and voice keep working even when engine settings have not been saved yet.
 */
export function withEnvProviderFallback(assistant: AssistantData): AssistantData {
  if ((assistant.provider || 'ollama').toLowerCase() !== 'ollama' || assistant.apiKeyEncrypted) return assistant;

  if (process.env.GROQ_API_KEY) {
    return {
      ...assistant,
      provider: 'groq',
      apiKeyEncrypted: process.env.GROQ_API_KEY,
      modelName: assistant.modelName === 'llama3.2' ? 'openai/gpt-oss-120b' : assistant.modelName,
    };
  }
  if (process.env.GEMINI_API_KEY) {
    return {
      ...assistant,
      provider: 'gemini',
      apiKeyEncrypted: process.env.GEMINI_API_KEY,
      modelName: assistant.modelName === 'llama3.2' ? 'gemini-3.6-flash' : assistant.modelName,
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      ...assistant,
      provider: 'openai',
      apiKeyEncrypted: process.env.OPENAI_API_KEY,
      modelName: assistant.modelName === 'llama3.2' ? 'gpt-4o-mini' : assistant.modelName,
    };
  }
  return assistant;
}

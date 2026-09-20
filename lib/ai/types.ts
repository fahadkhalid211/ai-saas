export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type AIProvider =
  | 'auto_free'
  | 'groq'
  | 'gemini'
  | 'ollama'
  | 'openai'
  | 'anthropic'
  | 'deepseek'
  | 'custom';

export interface ProviderOptions {
  provider: AIProvider | string; // 'auto_free' | 'ollama' | 'groq' | 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'custom'
  modelName: string;
  apiKey?: string;
  customBaseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface StreamEvent {
  type: 'token' | 'citations' | 'done' | 'error';
  token?: string;
  citations?: any[];
  error?: string;
}

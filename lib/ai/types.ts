export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderOptions {
  provider: string; // 'ollama' | 'groq' | 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'custom'
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

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
  /** Called once for every request sent to the provider (continuations and retries included), so spend can be metered. */
  onUsage?: (usage: LLMUsage) => void;
}

export interface LLMUsage {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  /** True when the provider did not report token counts and they were estimated from the text length. */
  estimated: boolean;
  /** Set for image understanding and speech transcription, which some providers price differently from text. */
  media?: 'image' | 'audio';
  /** Seconds of audio, for speech-to-text models billed per minute (Whisper). Token counts are then 0. */
  audioSeconds?: number;
}

export interface StreamEvent {
  type: 'token' | 'citations' | 'done' | 'error';
  token?: string;
  citations?: any[];
  error?: string;
}

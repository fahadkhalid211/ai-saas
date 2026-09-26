import type { LLMUsage } from '@/lib/ai/types';
import type { TranscribeOptions } from './transcriber';

/**
 * Reports what one image-understanding or transcription request used, so the customer's monthly cost cap counts it.
 * Only requests paid by the customer's own key (options.apiKey) are reported: when a step falls back to a platform key,
 * the customer is not charged. Never throws.
 */
export function reportMediaUsage(
  options: TranscribeOptions | undefined,
  keyUsed: string | undefined,
  usage: Omit<LLMUsage, 'estimated'> & { estimated?: boolean }
): void {
  const own = options?.apiKey?.trim();
  if (!options?.onUsage || !own || !keyUsed || keyUsed.trim() !== own) return;
  try {
    options.onUsage({ ...usage, estimated: usage.estimated ?? false });
  } catch {
    // ignore
  }
}

/** Token counts from an OpenAI-compatible response (OpenAI, Groq). */
export function openAiTokens(data: any): { inputTokens: number; outputTokens: number; estimated: boolean } {
  const u = data?.usage;
  if (!u) return { inputTokens: 0, outputTokens: 0, estimated: true };
  return { inputTokens: Number(u.prompt_tokens) || 0, outputTokens: Number(u.completion_tokens) || 0, estimated: false };
}

/** Token counts from a Gemini generateContent response; thinking tokens are billed as output. */
export function geminiTokens(data: any): { inputTokens: number; outputTokens: number; estimated: boolean } {
  const u = data?.usageMetadata;
  if (!u) return { inputTokens: 0, outputTokens: 0, estimated: true };
  return {
    inputTokens: Number(u.promptTokenCount) || 0,
    outputTokens: (Number(u.candidatesTokenCount) || 0) + (Number(u.thoughtsTokenCount) || 0),
    estimated: false,
  };
}

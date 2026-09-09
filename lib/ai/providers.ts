import OpenAI from 'openai';
import { ChatMessage, ProviderOptions } from './types';

/**
 * Configure OpenAI-compatible client for any supported provider
 */
function getClient(options: ProviderOptions): { client: OpenAI; model: string } {
  const provider = (options.provider || 'ollama').toLowerCase();

  switch (provider) {
    case 'groq': {
      const apiKey = options.apiKey || process.env.GROQ_API_KEY || 'dummy-key';
      return {
        client: new OpenAI({
          apiKey,
          baseURL: 'https://api.groq.com/openai/v1',
        }),
        model: options.modelName || 'llama-3.3-70b-versatile',
      };
    }

    case 'openai': {
      const apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
      return {
        client: new OpenAI({ apiKey }),
        model: options.modelName || 'gpt-4o-mini',
      };
    }

    case 'gemini': {
      const apiKey = options.apiKey || process.env.GEMINI_API_KEY || '';
      return {
        client: new OpenAI({
          apiKey,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        }),
        model: options.modelName || 'gemini-1.5-flash',
      };
    }

    case 'deepseek': {
      const apiKey = options.apiKey || process.env.DEEPSEEK_API_KEY || '';
      return {
        client: new OpenAI({
          apiKey,
          baseURL: 'https://api.deepseek.com/v1',
        }),
        model: options.modelName || 'deepseek-chat',
      };
    }

    case 'custom': {
      return {
        client: new OpenAI({
          apiKey: options.apiKey || 'custom-key',
          baseURL: options.customBaseUrl || 'http://localhost:11434/v1',
        }),
        model: options.modelName || 'llama3.2',
      };
    }

    case 'ollama':
    default: {
      const baseURL =
        options.customBaseUrl ||
        process.env.OLLAMA_BASE_URL ||
        'http://localhost:11434/v1';
      return {
        client: new OpenAI({
          apiKey: 'ollama', // Ollama doesn't require a real key
          baseURL,
        }),
        model: options.modelName || 'llama3.2',
      };
    }
  }
}

/**
 * Direct Anthropic Claude Messages Streaming API
 */
async function* streamAnthropic(
  messages: ChatMessage[],
  options: ProviderOptions
): AsyncGenerator<string, void, unknown> {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key is required. Please add it in your assistant settings.');
  }

  const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
  const conversationMsgs = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.modelName || 'claude-3-5-haiku-20241022',
      max_tokens: options.maxTokens || 1024,
      system: systemMsg,
      messages: conversationMsgs,
      stream: true,
      temperature: options.temperature ?? 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body from Anthropic');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield parsed.delta.text;
          }
        } catch {
          // ignore parsing error for comments/keep-alive
        }
      }
    }
  }
}

/**
 * Universal Streaming Chat Generator
 * Yields text tokens one by one as they arrive from the LLM.
 */
export async function* streamChatResponse(
  messages: ChatMessage[],
  options: ProviderOptions
): AsyncGenerator<string, void, unknown> {
  const provider = (options.provider || 'ollama').toLowerCase();

  // Anthropic native
  if (provider === 'anthropic') {
    yield* streamAnthropic(messages, options);
    return;
  }

  // OpenAI-compatible providers (Ollama, Groq, OpenAI, Gemini, DeepSeek, Custom)
  const { client, model } = getClient(options);

  try {
    const stream = await client.chat.completions.create({
      model,
      messages: messages as any,
      temperature: options.temperature ?? 0.3,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    console.error(`[AI Provider Error - ${provider}]:`, error);

    if (provider === 'ollama' && error?.code === 'ECONNREFUSED') {
      yield `\n\n*(Notice: Could not connect to local Ollama at ${options.customBaseUrl || 'http://localhost:11434'}. Please ensure Ollama is running (` +
        '`ollama serve`' +
        `) or configure a cloud provider like Groq, OpenAI, or Gemini in your assistant settings.)*`;
      return;
    }

    if (error?.status === 401 || error?.message?.includes('API key')) {
      yield `\n\n*(Authentication Error: Invalid API key for provider "${provider}". Please check your key in the assistant settings.)*`;
      return;
    }

    yield `\n\n*(AI Generation Error: ${error?.message || 'Failed to complete request. Please verify provider settings.'})*`;
  }
}

/**
 * Build the full contextual system prompt with business guardrails
 */
export function buildSystemPrompt(params: {
  businessPrompt: string;
  contextText: string;
  fallbackMessage: string;
  assistantName: string;
}): string {
  const { businessPrompt, contextText, fallbackMessage, assistantName } = params;

  return `${businessPrompt}

You are "${assistantName}", representing this business.

=== CRITICAL OPERATING GUIDELINES ===
1. You must answer questions using the knowledge base documentation provided below.
2. If the user asks for information that is NOT covered in the knowledge base, do not invent facts, speculate, or make assumptions. Instead, politely provide this fallback: "${fallbackMessage}".
3. Always maintain a professional, helpful, and courteous tone.
4. If the knowledge base includes product details, pricing, or instructions, be accurate and specific.
5. Keep your responses clear, structured, and concise.

=== VERIFIED KNOWLEDGE BASE ===
${contextText}
================================`;
}

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
      let model = options.modelName || 'openai/gpt-oss-120b';
      // Auto-migrate retired/deprecated Groq models to current active Groq flagship
      const deprecatedGroqModels = [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'llama3-70b-8192',
        'llama3-8b-8192',
        'llama-3.1-70b-versatile',
        'mixtral-8x7b-32768',
      ];
      if (deprecatedGroqModels.includes(model)) {
        model = 'openai/gpt-oss-120b';
      }
      return {
        client: new OpenAI({
          apiKey,
          baseURL: 'https://api.groq.com/openai/v1',
        }),
        model,
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
      max_tokens: options.maxTokens || 2048,
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
      max_tokens: options.maxTokens || 2048,
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

    const isConnError =
      error?.name === 'APIConnectionError' ||
      error?.message?.toLowerCase().includes('connection error') ||
      error?.message?.toLowerCase().includes('fetch failed') ||
      error?.code === 'ECONNREFUSED' ||
      error?.cause?.code === 'ECONNREFUSED';

    if (provider === 'ollama' && isConnError) {
      yield `\n\n*(Notice: Could not connect to local Ollama at ${options.customBaseUrl || 'http://localhost:11434'}.\n\n` +
        `• **Option 1 (Local $0 Open-Source):** Make sure Ollama is installed and running: \`ollama run llama3.2\`\n` +
        `• **Option 2 (Free Cloud Inference):** In the **"AI Engine (BYOK)"** tab, switch to **Groq** (free tier Llama 3) or **Google Gemini** (free tier).\n` +
        `• **Option 3 (Paid BYOK):** Switch to **OpenAI**, **Anthropic Claude**, or **DeepSeek** and paste your API key.)*`;
      return;
    }

    if (isConnError) {
      yield `\n\n*(Connection Error: Unable to reach provider "${provider}". Please verify your endpoint URL or network connection in the "AI Engine (BYOK)" tab.)*`;
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
2. Multilingual Fluency: You are fully multilingual. The knowledge base contains information across multiple languages (including English, Chinese, Spanish, Arabic, French, German, etc.). Understand knowledge in all languages, and always respond in the exact same language the user asks their question in (e.g., if the user asks in Chinese, reply in Chinese; if in English, reply in English).
3. If the user asks for information that is NOT covered in the knowledge base, do not invent facts, speculate, or make assumptions. Instead, politely provide this fallback: "${fallbackMessage}".
4. Comprehensive Summaries & Overviews: When the user asks for a complete explanation, walkthrough, or full summary of a video, audio, or document, synthesize the timeline milestones and chapters provided below into a rich, detailed, structured, in-depth breakdown. Never claim or complain that the video is missing or incomplete; present the full picture confidently using all provided timeline chapters.
5. Always maintain a professional, helpful, and courteous tone.
6. If the knowledge base includes product details, pricing, or instructions, be accurate and specific.
7. Provide direct, structured, and comprehensive answers. Complete your thoughts and sentences fully, never cutting off mid-sentence.

=== VERIFIED KNOWLEDGE BASE ===
${contextText}
================================`;
}

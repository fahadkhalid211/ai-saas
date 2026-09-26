import OpenAI from 'openai';
import { guardedFetchFor } from './safe-fetch';
import { ChatMessage, ProviderOptions } from './types';

const charsOf = (messages: ChatMessage[]) => messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);

/**
 * Reports the tokens one request used to options.onUsage. Counts the provider did not send are estimated from the text
 * (about 4 characters per token). Never throws: metering must not break a chat.
 */
function reportUsage(
  options: ProviderOptions,
  model: string,
  counted: { input?: number; output?: number },
  text: { promptChars: number; outputChars: number }
): void {
  if (!options.onUsage) return;
  const estimated = counted.input === undefined || counted.output === undefined;
  try {
    options.onUsage({
      provider: (options.provider || '').toLowerCase(),
      model,
      inputTokens: counted.input ?? Math.ceil(text.promptChars / 4),
      outputTokens: counted.output ?? Math.ceil(text.outputChars / 4),
      estimated,
    });
  } catch {
    // ignore
  }
}

/** Asks OpenAI-compatible providers for token counts in the last stream chunk, only when someone is metering. */
function usageParams(options: ProviderOptions, provider: string): Record<string, unknown> {
  return options.onUsage && provider !== 'ollama' ? { stream_options: { include_usage: true } } : {};
}

/** Some OpenAI-compatible servers reject stream_options: send the request again without it. */
async function createStream(client: OpenAI, params: Record<string, any>): Promise<AsyncIterable<any>> {
  try {
    return (await client.chat.completions.create(params as any)) as any;
  } catch (err: any) {
    if (params.stream_options && err?.status === 400 && /stream_options|include_usage/i.test(String(err?.message))) {
      const { stream_options: _drop, ...rest } = params;
      return (await client.chat.completions.create(rest as any)) as any;
    }
    throw err;
  }
}

/**
 * Configure OpenAI-compatible client for any supported provider
 */
function getClient(options: ProviderOptions): { client: OpenAI; model: string } {
  const provider = (options.provider || 'ollama').toLowerCase();

  switch (provider) {
    case 'auto_free':
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
      let model = options.modelName || 'gemini-3.6-flash';
      // Auto-migrate retired/deprecated Gemini models to current active Gemini flagship
      const deprecatedGeminiModels = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.0-pro',
        'gemini-pro',
      ];
      if (deprecatedGeminiModels.includes(model)) {
        model = 'gemini-3.6-flash';
      }
      return {
        client: new OpenAI({
          apiKey,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        }),
        model,
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
          fetch: guardedFetchFor(options.customBaseUrl),
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
          fetch: guardedFetchFor(options.customBaseUrl),
        }),
        model: options.modelName || 'llama3.2',
      };
    }
  }
}

/** How one model request ended. The wrapper below uses it to finish an answer that was cut short. */
interface StreamMeta {
  /** The model stopped because it hit its output limit ("length" / "max_tokens"). */
  finish?: string | null;
  /** The connection broke after some text had already been sent. */
  interrupted?: boolean;
}

/**
 * Direct Anthropic Claude Messages Streaming API
 */
async function* streamAnthropic(
  messages: ChatMessage[],
  options: ProviderOptions,
  meta: StreamMeta = {}
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

  const model = options.modelName || 'claude-3-5-haiku-20241022';
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
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
  let sentAny = false;
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;
  let outputChars = 0;

  try {
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
            if (parsed.type === 'message_start' && parsed.message?.usage) {
              const u = parsed.message.usage;
              inputTokens = (Number(u.input_tokens) || 0) + (Number(u.cache_creation_input_tokens) || 0) + (Number(u.cache_read_input_tokens) || 0);
            }
            if (parsed.type === 'message_delta' && typeof parsed.usage?.output_tokens === 'number') {
              outputTokens = parsed.usage.output_tokens;
            }
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              sentAny = true;
              outputChars += parsed.delta.text.length;
              yield parsed.delta.text;
            }
            if (parsed.type === 'message_delta' && parsed.delta?.stop_reason) {
              meta.finish = parsed.delta.stop_reason === 'max_tokens' ? 'length' : parsed.delta.stop_reason;
            }
          } catch {
            // ignore parsing error for comments/keep-alive
          }
        }
      }
    }
  } catch (err) {
    if (!sentAny) throw err;
    meta.interrupted = true; // the connection broke mid-answer: the wrapper carries on from here
  } finally {
    reportUsage(options, model, { input: inputTokens, output: outputTokens }, { promptChars: charsOf(messages), outputChars });
  }
}

/**
 * Zero-Cost Cascading Inference Generator
 * Tiers:
 * 1. Groq Free Tier (sub-second Llama 3.3 / gpt-oss-120b, 14,400 requests/day at $0 cost)
 * 2. Google Gemini Free Tier (Gemini 2.5/3.6 Flash, 15 RPM, 1M TPM at $0 cost)
 * 3. Local Ollama (100% offline, local compute, $0 cost)
 */
async function* streamAutoFree(
  messages: ChatMessage[],
  options: ProviderOptions,
  meta: StreamMeta = {}
): AsyncGenerator<string, void, unknown> {
  const groqKey = options.apiKey?.startsWith('gsk_')
    ? options.apiKey
    : (!options.apiKey?.startsWith('AIza') ? options.apiKey : '') || process.env.GROQ_API_KEY || '';
  const geminiKey = options.apiKey?.startsWith('AIza')
    ? options.apiKey
    : (!options.apiKey?.startsWith('gsk_') ? options.apiKey : '') || process.env.GEMINI_API_KEY || '';

  const candidates: Array<{
    name: string;
    canAttempt: () => boolean;
    createClient: () => { client: OpenAI; model: string; safeMaxTokens: number; activeMessages: ChatMessage[] };
  }> = [
    {
      name: 'groq',
      canAttempt: () => Boolean(groqKey),
      createClient: () => {
        let model = options.modelName || 'openai/gpt-oss-120b';
        const deprecatedGroq = [
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant',
          'llama3-70b-8192',
          'llama3-8b-8192',
          'llama-3.1-70b-versatile',
          'mixtral-8x7b-32768',
        ];
        if (deprecatedGroq.includes(model)) model = 'openai/gpt-oss-120b';

        let activeMessages = [...messages];
        let promptChars = activeMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
        let estimatedPromptTokens = Math.ceil(promptChars / 2.5);
        let safeMaxTokens = options.maxTokens || 2048;

        if (estimatedPromptTokens > 3600) {
          activeMessages = activeMessages.map((m) => {
            if (m.role === 'system' && m.content && m.content.length > 8500) {
              return {
                ...m,
                content:
                  m.content.slice(0, 8500) +
                  '\n\n...[Context condensed to stay within provider token budget]...\n================================',
              };
            }
            return m;
          });
          promptChars = activeMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
          estimatedPromptTokens = Math.ceil(promptChars / 2.5);
        }

        const remainingBudget = 5500 - estimatedPromptTokens;
        safeMaxTokens = groqOutputBudget(model, safeMaxTokens, remainingBudget);

        return {
          client: new OpenAI({
            apiKey: groqKey,
            baseURL: 'https://api.groq.com/openai/v1',
          }),
          model,
          safeMaxTokens,
          activeMessages,
        };
      },
    },
    {
      name: 'gemini',
      canAttempt: () => Boolean(geminiKey),
      createClient: () => {
        return {
          client: new OpenAI({
            apiKey: geminiKey,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
          }),
          model: 'gemini-3.6-flash',
          safeMaxTokens: options.maxTokens || 2048,
          activeMessages: [...messages],
        };
      },
    },
    {
      name: 'gemini/gemini-2.5-flash',
      canAttempt: () => Boolean(geminiKey),
      createClient: () => {
        return {
          client: new OpenAI({
            apiKey: geminiKey,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
          }),
          model: 'gemini-2.5-flash',
          safeMaxTokens: options.maxTokens || 2048,
          activeMessages: [...messages],
        };
      },
    },
    {
      name: 'gemini/gemini-2.5-flash-lite',
      canAttempt: () => Boolean(geminiKey),
      createClient: () => {
        return {
          client: new OpenAI({
            apiKey: geminiKey,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
          }),
          model: 'gemini-2.5-flash-lite',
          safeMaxTokens: options.maxTokens || 2048,
          activeMessages: [...messages],
        };
      },
    },
    {
      name: 'ollama',
      canAttempt: () => Boolean(options.customBaseUrl || process.env.OLLAMA_BASE_URL) || process.env.NODE_ENV !== 'production',
      createClient: () => {
        const baseURL =
          options.customBaseUrl ||
          process.env.OLLAMA_BASE_URL ||
          'http://localhost:11434/v1';
        return {
          client: new OpenAI({
            apiKey: 'ollama',
            baseURL,
            fetch: guardedFetchFor(options.customBaseUrl),
          }),
          model: 'llama3.2',
          safeMaxTokens: options.maxTokens || 2048,
          activeMessages: [...messages],
        };
      },
    },
  ];

  let didYieldAnyToken = false;

  for (const candidate of candidates) {
    if (!candidate.canAttempt()) continue;

    try {
      const { client, model, safeMaxTokens, activeMessages } = candidate.createClient();
      const stream = await client.chat.completions.create({
        model,
        messages: activeMessages as any,
        temperature: options.temperature ?? 0.3,
        max_tokens: safeMaxTokens,
        ...groqReasoning(model),
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (chunk.choices[0]?.finish_reason) meta.finish = chunk.choices[0].finish_reason;
        if (content) {
          didYieldAnyToken = true;
          yield content;
        }
      }

      return;
    } catch (err: any) {
      console.warn(
        `[Auto-Free Cascade] Provider ${candidate.name} failed:`,
        err?.message || err
      );

      if (didYieldAnyToken) {
        // never show half an answer with an error stuck on the end: the wrapper continues it on the next provider
        meta.interrupted = true;
        return;
      }
    }
  }

  yield `\n\n*(Notice: Zero-Cost Inference Engine could not connect to an active free provider.\n\n` +
    `• Option 1 (Fastest Cloud - Groq Free Tier): Add a free Groq API key in Assistant Settings > AI Engine (console.groq.com/keys) for instant 500+ tok/s responses at $0 cost.\n` +
    `• Option 2 (High Accuracy - Google Gemini Free Tier): Add a free Gemini API key in Assistant Settings > AI Engine (aistudio.google.com/app/apikey) at $0 cost.\n` +
    `• Option 3 (100% Offline $0 - Local Ollama): Start Ollama on your computer with 'ollama run llama3.2'.)*`;
}

/**
 * Universal Streaming Chat Generator
 * Yields text tokens one by one as they arrive from the LLM.
 */
/**
 * Groq's openai/gpt-oss models think before they answer, and the thinking counts against max_tokens. With a small limit the thinking
 * used everything and the visible answer stopped mid-sentence (or came back empty). Ask for light thinking and leave room for the answer.
 */
function groqReasoning(model: string): Record<string, unknown> {
  return /gpt-oss/i.test(model) ? { reasoning_effort: 'low' } : {};
}

function groqOutputBudget(model: string, requested: number, remainingBudget: number): number {
  const answer = Math.max(requested, 1200);
  const headroom = /gpt-oss/i.test(model) ? 600 : 0;
  return Math.min(answer + headroom, Math.max(900, remainingBudget), 2600);
}

/** True when the text stops in the middle of a sentence: it is long enough to be an answer and ends on a word, comma, dash or open bracket. */
export function endsMidSentence(text: string): boolean {
  const t = text.trimEnd();
  if (t.length < 40 || t.startsWith('*(')) return false;
  const last = t[t.length - 1];
  if (/[.!?…:;)\]}"'`*>|]/.test(last)) return false;
  if (/\p{Extended_Pictographic}$/u.test(t)) return false;
  return /[\p{L}\p{N},\-–—(\[/&+=]/u.test(last);
}

export async function* streamChatResponse(
  messages: ChatMessage[],
  options: ProviderOptions
): AsyncGenerator<string, void, unknown> {
  // An answer must never stop half-way. If the model ran out of output room, or the connection broke after text had been sent,
  // ask it to carry on from exactly where it stopped, up to a few times, and stream the rest as if it were one answer.
  const MAX_CONTINUATIONS = 3;
  let produced = '';
  for (let round = 0; round <= MAX_CONTINUATIONS; round++) {
    const meta: StreamMeta = {};
    const request =
      round === 0 || !produced
        ? messages
        : [
            ...messages,
            { role: 'assistant' as const, content: produced },
            { role: 'user' as const, content: 'Your last reply was cut off. Continue exactly where you stopped. Do not repeat anything and do not add an introduction.' },
          ];
    let text = '';
    // a continuation is held back until it is known to be real text, so an error notice is never glued onto half an answer
    const held: string[] = [];
    for await (const chunk of streamChatOnce(request, options, meta)) {
      text += chunk;
      if (round === 0) {
        produced += chunk;
        yield chunk;
      } else {
        held.push(chunk);
      }
    }
    if (round === 0 && !text.trim() && (meta.finish === 'length' || meta.interrupted)) continue; // the model spent its whole budget thinking: ask again
    if (round > 0) {
      if (!text.trim() || text.trimStart().startsWith('*(')) {
        if (endsMidSentence(produced)) yield '.';
        return;
      }
      for (const chunk of held) {
        produced += chunk;
        yield chunk;
      }
    }
    // notices such as "*(Authentication Error...)*" are not answers, and an empty result has nothing to continue
    // some providers report a clean stop even though the text ends mid-sentence (reasoning tokens ate the budget, dropped connection)
    const truncated = meta.finish === 'length' || meta.finish === 'max_tokens' || meta.interrupted === true || endsMidSentence(produced);
    if (!truncated || !text.trim() || text.trimStart().startsWith('*(')) return;
  }
  // still unfinished after every retry: close the sentence rather than leave it hanging
  if (endsMidSentence(produced)) yield '.';
}

async function* streamChatOnce(
  messages: ChatMessage[],
  options: ProviderOptions,
  meta: StreamMeta
): AsyncGenerator<string, void, unknown> {
  const provider = (options.provider || 'ollama').toLowerCase();

  // Zero-cost auto failover tier (Groq -> Gemini -> Ollama)
  if (provider === 'auto_free') {
    yield* streamAutoFree(messages, options, meta);
    return;
  }

  // Anthropic native
  if (provider === 'anthropic') {
    yield* streamAnthropic(messages, options, meta);
    return;
  }

  // OpenAI-compatible providers (Ollama, Groq, OpenAI, Gemini, DeepSeek, Custom)
  const { client, model } = getClient(options);

  // Conservative token estimation (2.5 chars/token for dense CSV / numbers / code)
  let activeMessages = [...messages];
  let promptChars = activeMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
  let estimatedPromptTokens = Math.ceil(promptChars / 2.5);

  let safeMaxTokens = options.maxTokens || 2048;

  if (provider === 'groq') {
    // Strict Groq TPM budget guard (limit 8,000 TPM on free models like openai/gpt-oss-120b)
    // Groq adds: estimated_prompt_tokens + max_tokens.
    // If prompt is large (> 3,600 tokens), condense system prompt to ~8,500 chars (~3,400 tokens)
    if (estimatedPromptTokens > 3600) {
      activeMessages = activeMessages.map((m) => {
        if (m.role === 'system' && m.content) {
          const maxChars = 8500;
          if (m.content.length > maxChars) {
            return {
              ...m,
              content:
                m.content.slice(0, maxChars) +
                '\n\n...[Context condensed to stay within provider token budget]...\n================================',
            };
          }
        }
        return m;
      });
      promptChars = activeMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
      estimatedPromptTokens = Math.ceil(promptChars / 2.5);
    }

    // Ensure estimatedPromptTokens + safeMaxTokens <= 5,500 (generous 2,500-token safety buffer under 8,000 TPM)
    const remainingBudget = 5500 - estimatedPromptTokens;
    safeMaxTokens = groqOutputBudget(model, safeMaxTokens, remainingBudget);
  }

  let sentAny = false;
  let started = false;
  let outputChars = 0;
  const counted: { input?: number; output?: number } = {};
  const readUsage = (chunk: any) => {
    if (chunk?.usage) {
      counted.input = Number(chunk.usage.prompt_tokens) || 0;
      counted.output = Number(chunk.usage.completion_tokens) || 0;
    }
  };
  try {
    const stream = await createStream(client, {
      model,
      messages: activeMessages as any,
      temperature: options.temperature ?? 0.3,
      max_tokens: safeMaxTokens,
      ...(provider === 'groq' ? groqReasoning(model) : {}),
      ...usageParams(options, provider),
      stream: true,
    });
    started = true;

    for await (const chunk of stream) {
      readUsage(chunk);
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (chunk.choices?.[0]?.finish_reason) meta.finish = chunk.choices[0].finish_reason;
      if (content) {
        sentAny = true;
        outputChars += content.length;
        yield content;
      }
    }
  } catch (error: any) {

    console.error(`[AI Provider Error - ${provider}]:`, error);

    if (sentAny) {
      meta.interrupted = true; // half an answer is on screen: continue it instead of printing an error after it
      return;
    }

    const isRateLimit =
      error?.status === 413 ||
      error?.status === 429 ||
      error?.message?.toLowerCase().includes('rate limit') ||
      error?.message?.toLowerCase().includes('tokens per minute') ||
      error?.message?.toLowerCase().includes('tpm') ||
      error?.message?.toLowerCase().includes('too large');

    // Automatic fallback on Groq TPM/Rate limits to high-capacity compound-mini or openai/gpt-oss-20b
    if (provider === 'groq' && isRateLimit) {
      const fallbackModel = model === 'groq/compound-mini' ? 'openai/gpt-oss-20b' : 'groq/compound-mini';
      console.warn(
        `[Groq TPM Fallback] Rate limit reached on ${model}. Seamlessly failing over to ${fallbackModel}...`
      );
      try {
        // Condense messages down for fallback to guarantee success
        const condensedFallbackMessages = activeMessages.map((m) => {
          if (m.role === 'system' && m.content && m.content.length > 5000) {
            return {
              ...m,
              content: m.content.slice(0, 5000) + '\n\n...[Condensed for fallback model]...',
            };
          }
          return m;
        });

        const fallbackStream = await createStream(client, {
          model: fallbackModel,
          messages: condensedFallbackMessages as any,
          temperature: options.temperature ?? 0.3,
          max_tokens: 1600,
          ...groqReasoning(fallbackModel),
          ...usageParams(options, provider),
          stream: true,
        });

        const fallbackCounted: { input?: number; output?: number } = {};
        let fallbackChars = 0;
        try {
          for await (const chunk of fallbackStream) {
            if (chunk?.usage) {
              fallbackCounted.input = Number(chunk.usage.prompt_tokens) || 0;
              fallbackCounted.output = Number(chunk.usage.completion_tokens) || 0;
            }
            const content = chunk.choices?.[0]?.delta?.content || '';
            if (chunk.choices?.[0]?.finish_reason) meta.finish = chunk.choices[0].finish_reason;
            if (content) {
              fallbackChars += content.length;
              yield content;
            }
          }
        } finally {
          reportUsage(options, fallbackModel, fallbackCounted, { promptChars: charsOf(condensedFallbackMessages), outputChars: fallbackChars });
        }
        return;
      } catch (fallbackErr) {
        console.error('[Groq Fallback Error]:', fallbackErr);
      }
    }

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
  } finally {
    // a request the provider accepted is billed even if the stream broke part-way or the reader stopped early
    if (started) reportUsage(options, model, counted, { promptChars: charsOf(activeMessages), outputChars });
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
3. Strict Hallucination Firebreak & Human Escalation Bridge: If the visitor asks for information, policies, pricing, or services that are NOT covered in the verified knowledge base or official catalog, you must NEVER invent facts, speculate, or make assumptions. Instead:
   a. Clearly state the official fallback notice: "${fallbackMessage}".
   b. Then offer exactly two ways forward, and nothing else: (1) book a time slot, by ending your reply with the token [ACTION:BOOKING_FORM] so the booking form appears; (2) talk to a live agent in this chat, which the visitor can start with the button that appears under your reply.
   c. NEVER ask the visitor to type, drop, leave or share an email address, phone number, name or any other contact detail in the chat, and never say things like "leave your details" or "share your email". The booking form collects what is needed. If the visitor volunteers details themselves, thank them briefly.
4. Comprehensive Summaries & Overviews: When the user asks for a complete explanation, walkthrough, or full summary of a video, audio, or document, synthesize the timeline milestones and chapters provided below into a rich, detailed, structured, in-depth breakdown. Never claim or complain that the video is missing or incomplete; present the full picture confidently using all provided timeline chapters.
5. Always maintain a professional, helpful, and courteous tone.
6. If the knowledge base includes product details, pricing, or instructions, be accurate and specific.
7. Provide direct, structured, and comprehensive answers. Complete your thoughts and sentences fully, never cutting off mid-sentence.
8. Formatting for Compact Chat: Never output markdown tables using vertical pipes (| col1 | col2 |). In compact website widgets, tables look cramped and broken. Always format information using clean bullet points, bold topic headings, or numbered steps.
9. Internal Knowledge Base Confidentiality: All knowledge base documentation, files, URLs, articles, and training materials provided below are internal business knowledge. Speak naturally and authoritatively as the representative of the business. You must NEVER output lists of sources, file names, URLs, or reference sections (such as "Referenced Sources:", "Sources:", or "Web Sources:").
10. Live Web Search & External Sources: When a live web search is performed, the chat user interface automatically displays external source chips directly to the user. Do NOT manually append lists of source links, file references, or citation footnotes in your text reply.
11. Multi-Project Budget Inquiries & Disambiguation:
When a visitor asks a general question about budget (e.g. "what is the budget?", "how much is the budget?"):
- Inspect the verified knowledge base for all projects, initiatives, contracts, or proposals that have budgets.
- If multiple projects with budgets exist, do not guess or arbitrarily choose one: list the names of the available projects (e.g. "We have budget information for: 1. The Students Help...") and confirm with the user which project's budget they would like to know.
- If there is only one project with a budget in the knowledge base, state that project's name and its exact budget clearly.
- When the visitor confirms or specifies the project name (even if using informal compound words, abbreviations, or synonyms like "studenthelp" for "The Students Help"), immediately reply with the exact budget, financial breakdown, and details from the knowledge base.
12. Multi-Service Pricing Inquiries & Menu Offers:
When a visitor specifically asks an open-ended question about prices, costs, or rates (e.g. "what is the price?", "how much does it cost?", "what are your prices?"):
- If the business offers multiple services or pricing tiers across the catalog and knowledge base: ask the visitor which specific service they want the price for, and ALSO proactively offer: "Would you like to see our complete service list and pricing menu?"
- If the visitor asks to see the complete service list or menu, provide a structured, itemized bulleted list of all services with their exact prices and descriptions from both the official catalog and the verified knowledge base.
- If the visitor specifies a specific service (e.g. subscription plan, consultation, project package), provide the exact price immediately.
- Do NOT proactively offer pricing menus, service catalogs, or booking pitches when the visitor is asking about greetings, general information, or questions unrelated to prices.
13. Knowledge Base Authority for Unlisted Services & Budgets:
If any service, project, price, budget, or item is not listed in the official catalog table, but was added to the verified knowledge base through any document, text note, audio, or video, you MUST retrieve and provide that information authoritatively. Never claim that you lack information if it is present anywhere in the verified knowledge base fragments below.
14. Robust Understanding of Synonyms & Informal Terms:
Understand that users may use informal terms, abbreviations, compound words, or colloquial language (e.g. "studenthelp" for "The Students Help", "rates" or "charges" for prices, "estimate" for budget). Match these intelligently to the corresponding entities in the knowledge base and catalog.
15. Semantic Synonym & Look-Alike Equivalence:
Visitors frequently ask questions using synonymous terms, interchangeable phrases, or look-alike concepts (such as "ai tech", "ai tools", "ai companies", and "ai platforms"; or "rates", "fees", and "pricing"; or "booking", "appointment", and "consultation"; or "features", "capabilities", and "functions"). You must treat these concepts as equivalent. If the verified knowledge base contains information under one variation (for example, documentation titled or containing "AI platforms"), authoritatively answer questions about its equivalents (for example: "what are best ai tech") using that knowledge. Never state you do not know if the answer can be answered using synonymous or equivalent information in the knowledge base.
16. Contact, Callbacks and People: Whenever a visitor wants to be contacted, asks for a callback, quote, demo or consultation, or has a question you cannot answer, do not collect contact details in the conversation. Reply in one or two friendly sentences and end with [ACTION:BOOKING_FORM]. If the visitor asks for a person, tell them you are connecting them to a live agent now and end with [ACTION:HUMAN_ESCALATION].

=== VERIFIED KNOWLEDGE BASE ===
${contextText}
================================`;
}

/**
 * Non-streaming chat completion helper that collects streamed tokens
 */
export async function generateChatCompletion(
  messages: ChatMessage[],
  options: ProviderOptions
): Promise<string> {
  let result = '';
  for await (const chunk of streamChatResponse(messages, options)) {
    result += chunk;
  }
  return result;
}

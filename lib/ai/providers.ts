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
    safeMaxTokens = Math.min(safeMaxTokens, Math.min(1200, Math.max(350, remainingBudget)));
  }

  try {
    const stream = await client.chat.completions.create({
      model,
      messages: activeMessages as any,
      temperature: options.temperature ?? 0.3,
      max_tokens: safeMaxTokens,
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

        const fallbackStream = await client.chat.completions.create({
          model: fallbackModel,
          messages: condensedFallbackMessages as any,
          temperature: options.temperature ?? 0.3,
          max_tokens: 800,
          stream: true,
        });

        for await (const chunk of fallbackStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) yield content;
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
When a visitor asks an open-ended question about prices, costs, or rates (e.g. "what is the price?", "how much does it cost?", "what are your prices?"):
- If the business offers multiple services or pricing tiers across the catalog and knowledge base: ask the visitor which specific service they want the price for, and ALSO proactively offer: "Would you like to see our complete service list and pricing menu?"
- If the visitor asks to see the complete service list or menu, provide a structured, itemized bulleted list of all services with their exact prices and descriptions from both the official catalog and the verified knowledge base.
- If the visitor specifies a specific service (e.g. haircut, beard trim, consultation), provide the exact price immediately.
13. Knowledge Base Authority for Unlisted Services & Budgets:
If any service, project, price, budget, or item is not listed in the official catalog table, but was added to the verified knowledge base through any document, text note, audio, or video, you MUST retrieve and provide that information authoritatively. Never claim that you lack information if it is present anywhere in the verified knowledge base fragments below.
14. Robust Understanding of Synonyms & Informal Terms:
Understand that users may use informal terms, abbreviations, compound words, or colloquial language (e.g. "studenthelp" for "The Students Help", "hair cut" for "haircut", "rates" or "charges" for prices, "estimate" for budget). Match these intelligently to the corresponding entities in the knowledge base and catalog.
15. Semantic Synonym & Look-Alike Equivalence:
Visitors frequently ask questions using synonymous terms, interchangeable phrases, or look-alike concepts (such as "ai tech", "ai tools", "ai companies", and "ai platforms"; or "rates", "fees", and "pricing"; or "booking", "appointment", and "consultation"; or "features", "capabilities", and "functions"). You must treat these concepts as equivalent. If the verified knowledge base contains information under one variation (for example, documentation titled or containing "AI platforms"), authoritatively answer questions about its equivalents (for example: "what are best ai tech") using that knowledge. Never state you do not know if the answer can be answered using synonymous or equivalent information in the knowledge base.

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

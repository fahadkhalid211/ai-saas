import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OpenAI from 'openai';
import { generateChatCompletion } from './providers';
import type { LLMUsage } from './types';

vi.mock('openai');

function sse(events: object[]): Response {
  const body = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
  return new Response(new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode(body));
      c.close();
    },
  }), { status: 200 });
}

describe('token usage reporting', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('reads Anthropic input and output tokens from the stream', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sse([
      { type: 'message_start', message: { usage: { input_tokens: 1200, cache_read_input_tokens: 300, output_tokens: 1 } } },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello there.' } },
      { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 42 } },
    ])));
    const seen: LLMUsage[] = [];
    const text = await generateChatCompletion([{ role: 'user', content: 'Hi' }], {
      provider: 'anthropic', modelName: 'claude-haiku-4-5', apiKey: 'sk-ant', onUsage: (u) => seen.push(u),
    });
    expect(text).toBe('Hello there.');
    expect(seen).toEqual([{ provider: 'anthropic', model: 'claude-haiku-4-5', inputTokens: 1500, outputTokens: 42, estimated: false }]);
  });

  it('asks OpenAI-compatible providers for usage and reads the final chunk', async () => {
    async function* chunks() {
      yield { choices: [{ delta: { content: 'All done.' }, finish_reason: 'stop' }] };
      yield { choices: [], usage: { prompt_tokens: 900, completion_tokens: 12 } };
    }
    const create = vi.fn().mockResolvedValue(chunks());
    (OpenAI as any).mockImplementation(function (this: any) {
      this.chat = { completions: { create } };
    });
    const seen: LLMUsage[] = [];
    await generateChatCompletion([{ role: 'user', content: 'Hi' }], {
      provider: 'openai', modelName: 'gpt-4o-mini', apiKey: 'sk-x', onUsage: (u) => seen.push(u),
    });
    expect(create.mock.calls[0][0].stream_options).toEqual({ include_usage: true });
    expect(seen).toEqual([{ provider: 'openai', model: 'gpt-4o-mini', inputTokens: 900, outputTokens: 12, estimated: false }]);
  });

  it('estimates from the text when the provider sends no usage', async () => {
    async function* chunks() {
      yield { choices: [{ delta: { content: '12345678' }, finish_reason: 'stop' }] };
    }
    (OpenAI as any).mockImplementation(function (this: any) {
      this.chat = { completions: { create: vi.fn().mockResolvedValue(chunks()) } };
    });
    const seen: LLMUsage[] = [];
    await generateChatCompletion([{ role: 'user', content: 'abcdefghijkl' }], {
      provider: 'deepseek', modelName: 'deepseek-chat', apiKey: 'k', onUsage: (u) => seen.push(u),
    });
    expect(seen[0]).toMatchObject({ inputTokens: 3, outputTokens: 2, estimated: true });
  });

  it('does not ask for usage when nobody is metering', async () => {
    async function* chunks() {
      yield { choices: [{ delta: { content: 'Ok.' }, finish_reason: 'stop' }] };
    }
    const create = vi.fn().mockResolvedValue(chunks());
    (OpenAI as any).mockImplementation(function (this: any) {
      this.chat = { completions: { create } };
    });
    await generateChatCompletion([{ role: 'user', content: 'Hi' }], { provider: 'openai', modelName: 'gpt-4o-mini', apiKey: 'sk-x' });
    expect(create.mock.calls[0][0].stream_options).toBeUndefined();
  });
});

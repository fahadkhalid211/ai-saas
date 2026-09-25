import { describe, it, expect, vi, beforeEach } from 'vitest';

const calls: any[] = [];
let script: Array<() => AsyncGenerator<any>> = [];

vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: async (args: any) => {
          calls.push(args);
          const next = script.shift();
          if (!next) throw new Error('no more scripted replies');
          return next();
        },
      },
    };
  },
}));

const chunk = (content: string, finish: string | null = null) => ({ choices: [{ delta: { content }, finish_reason: finish }] });

async function collect(gen: AsyncGenerator<string>) {
  let out = '';
  for await (const c of gen) out += c;
  return out;
}

describe('answers are never left half-finished', () => {
  beforeEach(() => {
    calls.length = 0;
    script = [];
  });

  it('carries on when the model runs out of output room', async () => {
    const { streamChatResponse } = await import('./providers');
    script = [
      async function* () {
        yield chunk('At Crescelo, Zero Token Markup means we operate on a Bring Your Own Key (BYOK) model so');
        yield chunk('', 'length');
      },
      async function* () {
        yield chunk(' you pay your AI provider directly and we add nothing on top.');
        yield chunk('', 'stop');
      },
    ];
    const out = await collect(streamChatResponse([{ role: 'user', content: 'What is zero token markup?' }], { provider: 'openai', modelName: 'gpt-4o-mini', apiKey: 'sk-test' }));
    expect(out).toBe('At Crescelo, Zero Token Markup means we operate on a Bring Your Own Key (BYOK) model so you pay your AI provider directly and we add nothing on top.');
    expect(calls).toHaveLength(2);
    const second = calls[1].messages;
    expect(second[second.length - 2]).toMatchObject({ role: 'assistant' });
    expect(second[second.length - 2].content).toContain('BYOK) model so');
    expect(second[second.length - 1].content).toMatch(/continue exactly where you stopped/i);
  });

  it('carries on when the connection breaks after some text was sent, without printing an error', async () => {
    const { streamChatResponse } = await import('./providers');
    script = [
      async function* () {
        yield chunk('The Growth plan includes 500 chats and');
        throw new Error('socket hang up');
      },
      async function* () {
        yield chunk(' five assistants.');
        yield chunk('', 'stop');
      },
    ];
    const out = await collect(streamChatResponse([{ role: 'user', content: 'Growth plan?' }], { provider: 'openai', modelName: 'gpt-4o-mini', apiKey: 'sk-test' }));
    expect(out).toBe('The Growth plan includes 500 chats and five assistants.');
    expect(out).not.toMatch(/Error|interrupted/i);
  });

  it('does not loop forever if the model keeps hitting its limit', async () => {
    const { streamChatResponse } = await import('./providers');
    script = Array.from({ length: 10 }, () =>
      async function* () {
        yield chunk('more ');
        yield chunk('', 'length');
      }
    );
    const out = await collect(streamChatResponse([{ role: 'user', content: 'Tell me everything' }], { provider: 'openai', modelName: 'gpt-4o-mini', apiKey: 'sk-test' }));
    expect(calls.length).toBe(4); // the first request and at most three continuations
    expect(out.length).toBeGreaterThan(0);
  });

  it('a normal, finished answer is one request', async () => {
    const { streamChatResponse } = await import('./providers');
    script = [
      async function* () {
        yield chunk('Hello!');
        yield chunk('', 'stop');
      },
    ];
    const out = await collect(streamChatResponse([{ role: 'user', content: 'hi' }], { provider: 'openai', modelName: 'gpt-4o-mini', apiKey: 'sk-test' }));
    expect(out).toBe('Hello!');
    expect(calls).toHaveLength(1);
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import OpenAI from 'openai';
import type { LLMUsage } from '@/lib/ai/types';
import { extractWithVisionAI } from './vision';
import { transcribeMedia } from './transcriber';
import { reportMediaUsage } from './media-usage';

vi.mock('openai', async (orig) => {
  const actual: any = await orig();
  return { ...actual, default: vi.fn(), toFile: vi.fn(async () => ({})) };
});

const json = (body: object) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

describe('image and audio usage reporting', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('reports only requests paid by the customer key', () => {
    const seen: LLMUsage[] = [];
    const options = { apiKey: 'sk-customer', onUsage: (u: LLMUsage) => seen.push(u) };
    reportMediaUsage(options, 'sk-platform', { provider: 'openai', model: 'gpt-4o-mini', inputTokens: 1, outputTokens: 1 });
    reportMediaUsage(options, 'sk-customer', { provider: 'openai', model: 'gpt-4o-mini', inputTokens: 1, outputTokens: 1 });
    expect(seen).toHaveLength(1);
  });

  it('meters an image read with the customer OpenAI key', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({
      choices: [{ message: { content: '### Transcribed Text: Summer sale 20% off' } }],
      usage: { prompt_tokens: 8500, completion_tokens: 60 },
    })));
    const seen: LLMUsage[] = [];
    const r = await extractWithVisionAI(Buffer.from('img'), 'flyer.png', { apiKey: 'sk-customer', provider: 'openai', onUsage: (u) => seen.push(u) });
    expect(r?.source).toBe('openai');
    expect(seen).toEqual([{ provider: 'openai', model: 'gpt-4o-mini', media: 'image', inputTokens: 8500, outputTokens: 60, estimated: false }]);
  });

  it('meters a Gemini image with thinking tokens counted as output', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({
      candidates: [{ content: { parts: [{ text: 'A price list for haircuts and colour.' }] } }],
      usageMetadata: { promptTokenCount: 300, candidatesTokenCount: 40, thoughtsTokenCount: 100 },
    })));
    const seen: LLMUsage[] = [];
    await extractWithVisionAI(Buffer.from('img'), 'menu.jpg', { apiKey: 'AIza-customer', provider: 'gemini', onUsage: (u) => seen.push(u) });
    expect(seen[0]).toMatchObject({ provider: 'gemini', media: 'image', inputTokens: 300, outputTokens: 140 });
  });

  it('meters Whisper audio by duration, including the translation pass', async () => {
    const create = vi.fn().mockResolvedValue({ text: 'Hola, abrimos a las nueve.', language: 'spanish', duration: 90, segments: [] });
    const translate = vi.fn().mockResolvedValue({ text: 'Hello, we open at nine.', segments: [] });
    (OpenAI as any).mockImplementation(function (this: any) {
      this.audio = { transcriptions: { create }, translations: { create: translate } };
    });
    const seen: LLMUsage[] = [];
    await transcribeMedia(Buffer.from('ID3....audio'), 'note.mp3', { apiKey: 'gsk_customer', provider: 'groq', onUsage: (u) => seen.push(u) });
    expect(seen).toHaveLength(2);
    expect(seen[0]).toMatchObject({ provider: 'groq', model: 'whisper-large-v3', media: 'audio', audioSeconds: 90, estimated: false });
  });

  it('does not meter audio that fell back to the platform key', async () => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_platform');
    const create = vi.fn().mockResolvedValue({ text: 'We open at nine.', language: 'english', duration: 30, segments: [] });
    (OpenAI as any).mockImplementation(function (this: any) {
      this.audio = { transcriptions: { create } };
    });
    const seen: LLMUsage[] = [];
    // an Anthropic key cannot transcribe, so the platform Groq key is used
    await transcribeMedia(Buffer.from('ID3....audio'), 'note.mp3', { apiKey: 'sk-ant-customer', provider: 'anthropic', onUsage: (u) => seen.push(u) });
    expect(create).toHaveBeenCalled();
    expect(seen).toEqual([]);
  });
});

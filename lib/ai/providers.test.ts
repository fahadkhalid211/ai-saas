import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamChatResponse, generateChatCompletion } from './providers';
import OpenAI from 'openai';

vi.mock('openai');

describe('Zero-Cost Free Tier Inference Engine (auto_free)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  it('should yield helpful guidance notice when all free providers are unreachable', async () => {
    const mockCreate = vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:11434'));
    (OpenAI as any).mockImplementation(function (this: any) {
      this.chat = {
        completions: {
          create: mockCreate,
        },
      };
    });

    const tokens: string[] = [];
    for await (const token of streamChatResponse(
      [{ role: 'user', content: 'Hi' }],
      { provider: 'auto_free', modelName: 'openai/gpt-oss-120b' }
    )) {
      tokens.push(token);
    }

    const fullResponse = tokens.join('');
    expect(fullResponse).toContain('Zero-Cost Inference Engine could not connect');
    expect(fullResponse).toContain('Groq Free Tier');
    expect(fullResponse).toContain('Google Gemini Free Tier');
    expect(fullResponse).toContain('Local Ollama');
  });

  it('should stream successfully when a free provider succeeds', async () => {
    async function* mockStreamGenerator() {
      yield { choices: [{ delta: { content: 'Zero-cost ' } }] };
      yield { choices: [{ delta: { content: 'inference ' } }] };
      yield { choices: [{ delta: { content: 'working!' } }] };
    }

    const mockCreate = vi.fn().mockResolvedValue(mockStreamGenerator());
    (OpenAI as any).mockImplementation(function (this: any) {
      this.chat = {
        completions: {
          create: mockCreate,
        },
      };
    });

    const result = await generateChatCompletion(
      [{ role: 'user', content: 'What is AI?' }],
      {
        provider: 'auto_free',
        modelName: 'openai/gpt-oss-120b',
        apiKey: 'gsk_mock_groq_key_123',
      }
    );

    expect(result).toBe('Zero-cost inference working!');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should cascade from Groq to Gemini on 429 rate limit', async () => {
    async function* mockGeminiStream() {
      yield { choices: [{ delta: { content: 'Gemini fallback success' } }] };
    }

    let callCount = 0;
    const mockCreate = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // Groq fails with 429 Rate Limit
        const rateLimitErr: any = new Error('Rate limit exceeded: 8000 TPM limit');
        rateLimitErr.status = 429;
        return Promise.reject(rateLimitErr);
      }
      // Gemini succeeds
      return Promise.resolve(mockGeminiStream());
    });

    (OpenAI as any).mockImplementation(function (this: any) {
      this.chat = {
        completions: {
          create: mockCreate,
        },
      };
    });

    process.env.GROQ_API_KEY = 'gsk_env_groq_key';
    process.env.GEMINI_API_KEY = 'AIza_env_gemini_key';

    const result = await generateChatCompletion(
      [{ role: 'user', content: 'Test cascade' }],
      {
        provider: 'auto_free',
        modelName: 'openai/gpt-oss-120b',
      }
    );

    expect(result).toBe('Gemini fallback success');
    expect(callCount).toBe(2);
  });
});

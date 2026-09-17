import { TranscribeOptions } from './transcriber';

export interface VisionResult {
  text: string;
  source: 'groq' | 'openai' | 'gemini' | 'ollama';
}

/**
 * Extracts comprehensive text and semantic visual understanding from an image
 * using Multimodal Vision AI models (Groq Qwen Vision, OpenAI GPT-4o-mini, Gemini, etc.).
 */
export async function extractWithVisionAI(
  buffer: Buffer,
  filename: string,
  options?: TranscribeOptions
): Promise<VisionResult | null> {
  const mimeType = filename.toLowerCase().endsWith('.png')
    ? 'image/png'
    : filename.toLowerCase().endsWith('.webp')
    ? 'image/webp'
    : 'image/jpeg';

  const base64Data = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const prompt =
    'Analyze this image in detail for an AI business knowledge base:\n' +
    '1. Transcribe ALL visible text accurately (product titles, headlines, subtitles, badges, buttons, labels, and small text).\n' +
    '2. Describe what this product, graphic, icon, or diagram represents, noting key visual elements (e.g. logos, badges, messaging channels, charts).\n' +
    'Format clearly under "### Transcribed Text:" and "### Visual Description:". Output only the factual information.';

  // 1. Try Groq with llama-3.2-11b-vision-preview (Fast multimodal inference)
  const groqKey = options?.apiKey || process.env.GROQ_API_KEY;
  const isGroq = (options?.provider || 'groq').toLowerCase() === 'groq' || groqKey?.startsWith('gsk_');

  if (groqKey && isGroq) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.2-11b-vision-preview',
          max_tokens: 600,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content && content.length > 10) {
          return { text: content, source: 'groq' };
        }
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn('Groq vision API error:', errJson?.error?.message || res.statusText);
      }
    } catch (groqErr) {
      console.warn('Failed Groq vision call:', groqErr);
    }
  }

  // 2. Try OpenAI with gpt-4o-mini
  const openaiKey = options?.apiKey || process.env.OPENAI_API_KEY;
  const isOpenAI = (options?.provider || '').toLowerCase() === 'openai' || openaiKey?.startsWith('sk-');

  if (openaiKey && isOpenAI) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 600,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content && content.length > 10) {
          return { text: content, source: 'openai' };
        }
      }
    } catch (openaiErr) {
      console.warn('Failed OpenAI vision call:', openaiErr);
    }
  }

  // 3. Try Gemini with gemini-2.0-flash (fallback to gemini-1.5-flash)
  const geminiKey = options?.apiKey || process.env.GEMINI_API_KEY;
  const isGemini = (options?.provider || '').toLowerCase() === 'gemini' || geminiKey?.startsWith('AIza');

  if (geminiKey && isGemini) {
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const geminiModel of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (content && content.length > 10) {
            return { text: content, source: 'gemini' };
          }
        } else {
          const errJson = await res.json().catch(() => null);
          console.warn(`Gemini vision API error (${geminiModel}):`, errJson?.error?.message || res.statusText);
        }
      } catch (geminiErr) {
        console.warn(`Failed Gemini vision call (${geminiModel}):`, geminiErr);
      }
    }
  }

  return null;
}

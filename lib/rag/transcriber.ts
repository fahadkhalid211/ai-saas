import OpenAI, { toFile } from 'openai';
import { ExtractedDocument } from './types';
import { diagnoseKnowledgeFailure } from './diagnostics';

// Supported audio and video extensions
export const AUDIO_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'm4a',
  'ogg',
  'flac',
  'aac',
  'wma',
  'opus',
]);

export const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'webm',
  'mov',
  'mkv',
  'avi',
  'm4v',
  '3gp',
]);

const MIME_MAP: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  m4v: 'video/x-m4v',
  '3gp': 'video/3gpp',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/m4a',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
  opus: 'audio/opus',
  wma: 'audio/x-ms-wma',
};

export function isVideoFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return VIDEO_EXTENSIONS.has(ext);
}

export function isAudioFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return AUDIO_EXTENSIONS.has(ext);
}

export function isMediaFile(filename: string): boolean {
  return isVideoFile(filename) || isAudioFile(filename);
}

export function getMediaMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_MAP[ext] || (isVideoFile(filename) ? 'video/mp4' : 'audio/mpeg');
}

export function formatTimestamp(seconds: number): string {
  const totalSec = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const hh = String(hrs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export interface TranscribeOptions {
  apiKey?: string;
  provider?: string;
}

export interface TranscriptionSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscribeResult {
  text: string;
  translatedText?: string;
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
  translatedSegments?: TranscriptionSegment[];
}

export function detectAudioBufferFormat(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.byteLength >= 12) {
    if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WAVE') {
      return { ext: 'wav', mime: 'audio/wav' };
    }
    if (buffer.subarray(0, 4).toString('ascii') === 'OggS') {
      return { ext: 'ogg', mime: 'audio/ogg' };
    }
    if (buffer.subarray(0, 4).toString('ascii') === 'fLaC') {
      return { ext: 'flac', mime: 'audio/flac' };
    }
    if (buffer.subarray(0, 3).toString('ascii') === 'ID3') {
      return { ext: 'mp3', mime: 'audio/mpeg' };
    }
    if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
      return { ext: 'mp3', mime: 'audio/mpeg' };
    }
  }
  return null;
}

async function transcribeWithGemini(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  apiKey: string
): Promise<TranscribeResult> {
  const base64Data = buffer.toString('base64');
  const isVid = isVideoFile(filename);
  const mediaLabel = isVid ? 'video' : 'audio';

  const prompt = `You are an expert audio and video transcriber for an AI business knowledge base.
Please transcribe the spoken audio of this ${mediaLabel} recording thoroughly and accurately.
1. Transcribe all spoken words and narration in full.
2. If there are topics, sections, or timestamps, include them in chronological order (e.g. [00:00 - 00:30]).
3. Capture every detail: service names, prices, contact info, business policies, and answers to common questions.
4. Output the complete spoken narrative clearly.`;

  // Candidate Google Gemini models in priority order
  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            return {
              text,
              language: 'en',
              segments: [],
            };
          }
        }

        const errText = await res.text().catch(() => '');
        lastError = new Error(`Gemini transcription (${model}) failed (${res.status}): ${errText.slice(0, 300)}`);

        // If high demand (503) or rate limited (429), back off before retrying or switching models
        if (res.status === 503 || res.status === 429) {
          console.warn(`[Transcriber] Gemini model ${model} returned ${res.status}, waiting before retry/fallback...`);
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        } else {
          break; // Non-retryable on this model (e.g. 404), advance to next candidate model
        }
      } catch (err: any) {
        lastError = err;
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  throw lastError || new Error('Gemini transcription failed across candidate models.');
}

/**
 * Transcribes audio and video files using Groq Whisper, Google Gemini, or OpenAI Whisper.
 * Supports direct MP4, WEBM, MOV, MP3, WAV, M4A, etc. up to 25MB.
 */
export async function transcribeMedia(
  buffer: Buffer,
  filename: string,
  options: TranscribeOptions = {}
): Promise<TranscribeResult> {
  const byteLength = buffer.byteLength;
  const maxBytes = 25 * 1024 * 1024; // 25MB Whisper direct limit

  if (byteLength > maxBytes) {
    const diag = diagnoseKnowledgeFailure({
      filename,
      type: isVideoFile(filename) ? 'video' : 'audio',
      fileSizeBytes: byteLength,
      errorMessage: 'File size exceeds 25MB limit',
    });
    const sizeErr: any = new Error(diag.reason);
    sizeErr.whatToDoNext = diag.whatToDoNext;
    sizeErr.category = diag.category;
    throw sizeErr;
  }

  // Determine provider and API key
  let provider = (options.provider || '').toLowerCase();
  let apiKey = options.apiKey?.trim() || '';

  // Auto-detect key type if not explicitly set
  if (!apiKey) {
    if (process.env.GROQ_API_KEY) {
      apiKey = process.env.GROQ_API_KEY;
      provider = 'groq';
    } else if (process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
      provider = 'gemini';
    } else if (process.env.OPENAI_API_KEY) {
      apiKey = process.env.OPENAI_API_KEY;
      provider = 'openai';
    }
  }

  if (apiKey.startsWith('gsk_')) {
    provider = 'groq';
  } else if (apiKey.startsWith('AIza') || apiKey.includes('AIzaSy')) {
    provider = 'gemini';
  } else if (apiKey.startsWith('sk-') && !provider) {
    provider = 'openai';
  }

  // Determine upload filename and MIME type
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const isVid = isVideoFile(filename);

  let uploadFilename = filename;
  let uploadMime = getMediaMimeType(filename);

  // Magic bytes check: if buffer is already a converted WAV or audio file, override extension
  const detectedAudio = detectAudioBufferFormat(buffer);
  if (detectedAudio) {
    uploadMime = detectedAudio.mime;
    const baseName = filename.replace(/\.[^/.]+$/, '');
    uploadFilename = `${baseName}.${detectedAudio.ext}`;
  } else {
    // Groq's API gateway strictly whitelists: flac, mp3, mp4, mpeg, mpga, m4a, ogg, opus, wav, webm.
    const GROQ_WHITELIST = new Set(['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'opus', 'wav', 'webm']);
    if (!GROQ_WHITELIST.has(ext)) {
      const baseName = filename.replace(/\.[^/.]+$/, '');
      if (isVid) {
        uploadFilename = `${baseName}.mp4`;
        uploadMime = 'video/mp4';
      } else {
        uploadFilename = `${baseName}.m4a`;
        uploadMime = 'audio/m4a';
      }
    }
  }

  // Route by provider
  if (provider === 'gemini') {
    const geminiKey = apiKey || process.env.GEMINI_API_KEY || '';
    if (!geminiKey) {
      const fallbackGroq = process.env.GROQ_API_KEY || '';
      if (!fallbackGroq) {
        throw new Error(
          'Google Gemini API key required for transcription. Please provide a Gemini API key in AI Engine settings or set GEMINI_API_KEY.'
        );
      }
      provider = 'groq';
      apiKey = fallbackGroq;
    } else {
      try {
        return await transcribeWithGemini(buffer, uploadFilename, uploadMime, geminiKey);
      } catch (geminiErr: any) {
        const fallbackGroq = process.env.GROQ_API_KEY || '';
        if (fallbackGroq) {
          console.warn('[Transcriber] Gemini failed, falling back to Groq Whisper:', geminiErr?.message || geminiErr);
          provider = 'groq';
          apiKey = fallbackGroq;
        } else {
          throw geminiErr;
        }
      }
    }
  }

  let client: OpenAI;
  let model: string;

  if (provider === 'groq') {
    const groqKey = apiKey || process.env.GROQ_API_KEY || '';
    if (!groqKey) {
      // Fallback to Gemini if available
      const geminiFallback = process.env.GEMINI_API_KEY || '';
      if (geminiFallback) {
        return await transcribeWithGemini(buffer, uploadFilename, uploadMime, geminiFallback);
      }
      throw new Error(
        'Groq API key required for fast audio/video transcription. Please provide a free Groq API key in the AI Engine settings.'
      );
    }
    client = new OpenAI({
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    model = 'whisper-large-v3';
  } else if (provider === 'openai') {
    const openaiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!openaiKey) {
      throw new Error(
        'OpenAI API key required for audio/video transcription. Please provide an OpenAI API key or use Groq.'
      );
    }
    client = new OpenAI({ apiKey: openaiKey });
    model = 'whisper-1';
  } else {
    // Check fallback keys across all available providers
    const fallbackGroq = process.env.GROQ_API_KEY || (apiKey.startsWith('gsk_') ? apiKey : '');
    const fallbackGemini = process.env.GEMINI_API_KEY || (apiKey.startsWith('AIza') ? apiKey : '');
    const fallbackOpenAI = process.env.OPENAI_API_KEY || (apiKey.startsWith('sk-') ? apiKey : '');

    if (fallbackGroq) {
      client = new OpenAI({
        apiKey: fallbackGroq,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      model = 'whisper-large-v3';
    } else if (fallbackGemini) {
      return await transcribeWithGemini(buffer, uploadFilename, uploadMime, fallbackGemini);
    } else if (fallbackOpenAI) {
      client = new OpenAI({ apiKey: fallbackOpenAI });
      model = 'whisper-1';
    } else {
      throw new Error(
        'Speech and video transcription requires an AI API key. Please configure a free Groq API key (starts with "gsk_") or Google Gemini API key in the AI Engine settings.'
      );
    }
  }

  // Prepare file upload
  const fileObj = await toFile(buffer, uploadFilename, { type: uploadMime });

  console.log(`[Transcriber] Starting transcription of "${filename}" (uploaded as "${uploadFilename}", ${(byteLength / 1024).toFixed(1)} KB) using ${model}...`);

  try {
    const resp: any = await client.audio.transcriptions.create({
      file: fileObj,
      model,
      response_format: 'verbose_json',
      prompt:
        'Company and business explanation, products, services, features, pricing, contact details, and policies.',
      temperature: 0.0,
    });

    const text = (resp?.text || '').trim();
    if (!text) {
      throw new Error('Transcription completed but no speech or text was detected in the file.');
    }

    const segments: TranscriptionSegment[] = Array.isArray(resp?.segments)
      ? resp.segments.map((s: any) => ({
          id: s.id,
          start: s.start || 0,
          end: s.end || 0,
          text: (s.text || '').trim(),
        }))
      : [];

    const rawLang = (resp?.language || '').toLowerCase();
    const isEnglish = rawLang === 'english' || rawLang === 'en';

    let translatedText: string | undefined = undefined;
    let translatedSegments: TranscriptionSegment[] | undefined = undefined;

    // Multilingual support: If non-English (e.g. Chinese, Spanish, Arabic, etc.), translate to English
    // so cross-lingual semantic search and English questions match seamlessly!
    if (!isEnglish && provider === 'groq') {
      try {
        console.log(`[Transcriber] Detected non-English speech ("${resp?.language}"). Translating to English with Groq Whisper...`);
        const transFileObj = await toFile(buffer, uploadFilename, { type: uploadMime });
        const transResp: any = await client.audio.translations.create({
          file: transFileObj,
          model,
          response_format: 'verbose_json',
        });
        translatedText = (transResp?.text || '').trim();
        if (Array.isArray(transResp?.segments)) {
          translatedSegments = transResp.segments.map((s: any) => ({
            id: s.id,
            start: s.start || 0,
            end: s.end || 0,
            text: (s.text || '').trim(),
          }));
        }
        console.log(`[Transcriber] Translated speech: "${(translatedText || '').slice(0, 100)}..."`);
      } catch (transErr: any) {
        console.warn(`[Transcriber] Translation attempt warning: ${transErr?.message || transErr}`);
      }
    }

    return {
      text,
      translatedText,
      language: resp?.language,
      duration: resp?.duration,
      segments,
      translatedSegments,
    };
  } catch (err: any) {
    console.error(`[Transcriber] Transcription failed for ${filename}:`, err);
    const rawMsg = err?.response?.data?.error?.message || err?.message || 'Unknown transcription error';
    const diag = diagnoseKnowledgeFailure({
      filename,
      type: isVid ? 'video' : 'audio',
      errorMessage: rawMsg,
      fileSizeBytes: byteLength,
    });

    const enrichedErr: any = new Error(diag.reason);
    enrichedErr.whatToDoNext = diag.whatToDoNext;
    enrichedErr.category = diag.category;
    enrichedErr.rawMessage = rawMsg;
    throw enrichedErr;
  }
}

/**
 * Parses a video or audio file into an ExtractedDocument with timestamped sections
 * and business narrative ready for hybrid chunking and embedding.
 */
export async function parseMediaFile(
  buffer: Buffer,
  filename: string,
  options: TranscribeOptions = {}
): Promise<ExtractedDocument> {
  const isVid = isVideoFile(filename);
  const mediaCategory = isVid ? 'Video' : 'Audio';

  const result = await transcribeMedia(buffer, filename, options);
  const isBilingual = Boolean(result.translatedText && result.translatedText.trim());

  const sections: ExtractedDocument['sections'] = [];
  const lines: string[] = [];

  lines.push(`=== [${mediaCategory} Transcription & Knowledge: ${filename}] ===`);
  if (result.language) {
    lines.push(`Spoken Language: ${result.language}${isBilingual ? ' (Bilingual Indexed: English & ' + result.language + ')' : ''}`);
  }
  if (result.duration) {
    lines.push(`Duration: ${formatTimestamp(result.duration)} (${result.duration.toFixed(1)} seconds)`);
  }

  if (isBilingual) {
    lines.push('');
    lines.push('--- English Translation & Explanation ---');
    lines.push(result.translatedText!);
    lines.push('');
    lines.push(`--- Original Spoken Speech (${result.language || 'Original'}) ---`);
    lines.push(result.text);
  } else {
    lines.push('');
    lines.push('--- Full Spoken Narrative ---');
    lines.push(result.text);
  }

  if (result.segments && result.segments.length > 0) {
    lines.push('');
    lines.push('--- Timestamped Breakdown ---');

    // Group segments into logical chunks (~20-40 seconds each) so RAG sections are coherent
    let currentChunkText: string[] = [];
    let currentStart = result.segments[0].start;
    let currentEnd = result.segments[0].end;

    for (let i = 0; i < result.segments.length; i++) {
      const seg = result.segments[i];
      const transSeg = result.translatedSegments?.[i];
      const timeTag = `[${formatTimestamp(seg.start)} - ${formatTimestamp(seg.end)}]`;
      const transSnippet = isBilingual && transSeg?.text ? ` | English: "${transSeg.text}"` : '';

      lines.push(`${timeTag} ${seg.text}${transSnippet}`);
      currentChunkText.push(`${seg.text}${transSnippet ? ' (English translation: ' + transSeg?.text + ')' : ''}`);
      currentEnd = seg.end;

      // Group into ~30 second section windows or end of segment
      if (currentEnd - currentStart >= 30) {
        const heading = `${mediaCategory} [${formatTimestamp(currentStart)} - ${formatTimestamp(currentEnd)}]`;
        sections.push({
          heading,
          text: `${heading}\n${currentChunkText.join(' ')}`,
          metadata: {
            startTime: currentStart,
            endTime: currentEnd,
            formattedTime: `${formatTimestamp(currentStart)} - ${formatTimestamp(currentEnd)}`,
            language: result.language,
            isBilingual,
          },
        });
        currentChunkText = [];
        currentStart = currentEnd;
      }
    }

    if (currentChunkText.length > 0) {
      const heading = `${mediaCategory} [${formatTimestamp(currentStart)} - ${formatTimestamp(currentEnd)}]`;
      sections.push({
        heading,
        text: `${heading}\n${currentChunkText.join(' ')}`,
        metadata: {
          startTime: currentStart,
          endTime: currentEnd,
          formattedTime: `${formatTimestamp(currentStart)} - ${formatTimestamp(currentEnd)}`,
          language: result.language,
          isBilingual,
        },
      });
    }
  }

  return {
    title: filename,
    type: isVid ? 'video' : 'audio',
    content: lines.join('\n'),
    sections: sections.length > 0 ? sections : undefined,
    metadata: {
      mediaType: mediaCategory.toLowerCase(),
      duration: result.duration,
      language: result.language,
      isBilingual,
      totalSegments: result.segments?.length || 0,
    },
  };
}

import OpenAI, { toFile } from 'openai';
import { ExtractedDocument } from './types';

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
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
}

/**
 * Transcribes audio and video files using Groq Whisper (free & fast) or OpenAI Whisper.
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
    const sizeMb = (byteLength / (1024 * 1024)).toFixed(1);
    throw new Error(
      `File "${filename}" is ${sizeMb}MB, exceeding the 25MB limit. Please compress the file or export an audio-only version (e.g. MP3 or M4A) for faster transcription.`
    );
  }

  // Determine provider and API key
  let provider = (options.provider || '').toLowerCase();
  let apiKey = options.apiKey?.trim() || '';

  // Auto-detect key type if not explicitly set
  if (!apiKey) {
    if (process.env.GROQ_API_KEY) {
      apiKey = process.env.GROQ_API_KEY;
      provider = 'groq';
    } else if (process.env.OPENAI_API_KEY) {
      apiKey = process.env.OPENAI_API_KEY;
      provider = 'openai';
    }
  }

  if (apiKey.startsWith('gsk_')) {
    provider = 'groq';
  } else if (apiKey.startsWith('sk-') && !provider) {
    provider = 'openai';
  }

  // Default to Groq if key is available or fallback
  if (!provider) {
    provider = 'groq';
  }

  let client: OpenAI;
  let model: string;

  if (provider === 'groq') {
    const groqKey = apiKey || process.env.GROQ_API_KEY || '';
    if (!groqKey) {
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
    // If user has Groq API key in env or entered on assistant, use it
    const fallbackKey =
      process.env.GROQ_API_KEY ||
      (apiKey.startsWith('gsk_') ? apiKey : '');
    if (fallbackKey) {
      client = new OpenAI({
        apiKey: fallbackKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      model = 'whisper-large-v3';
    } else {
      throw new Error(
        `Transcription not supported directly for provider "${provider}". Please configure a free Groq API key in the AI Engine settings or set GROQ_API_KEY.`
      );
    }
  }

  const mimeType = getMediaMimeType(filename);
  // Prepare file upload
  const fileObj = await toFile(buffer, filename, { type: mimeType });

  console.log(`[Transcriber] Starting transcription of "${filename}" (${(byteLength / 1024).toFixed(1)} KB) using ${model}...`);

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

    return {
      text,
      language: resp?.language,
      duration: resp?.duration,
      segments,
    };
  } catch (err: any) {
    console.error(`[Transcriber] Transcription failed for ${filename}:`, err);
    throw new Error(
      `Media transcription failed: ${err?.response?.data?.error?.message || err?.message || 'Unknown transcription error'}`
    );
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

  const sections: ExtractedDocument['sections'] = [];
  const lines: string[] = [];

  lines.push(`=== [${mediaCategory} Transcription: ${filename}] ===`);
  if (result.language) {
    lines.push(`Language: ${result.language}`);
  }
  if (result.duration) {
    lines.push(`Duration: ${formatTimestamp(result.duration)} (${result.duration.toFixed(1)} seconds)`);
  }
  lines.push('');
  lines.push('--- Full Spoken Narrative ---');
  lines.push(result.text);

  if (result.segments && result.segments.length > 0) {
    lines.push('');
    lines.push('--- Timestamped Breakdown ---');

    // Group segments into logical chunks (~20-40 seconds each) so RAG sections are coherent
    let currentChunkText: string[] = [];
    let currentStart = result.segments[0].start;
    let currentEnd = result.segments[0].end;

    for (const seg of result.segments) {
      const timeTag = `[${formatTimestamp(seg.start)} - ${formatTimestamp(seg.end)}]`;
      lines.push(`${timeTag} ${seg.text}`);

      currentChunkText.push(seg.text);
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
      totalSegments: result.segments?.length || 0,
    },
  };
}

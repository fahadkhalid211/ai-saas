import { YoutubeTranscript } from 'youtube-transcript';
import { ExtractedDocument } from './types';
import { parseMediaFile, TranscribeOptions, formatTimestamp } from './transcriber';
import { diagnoseKnowledgeFailure } from './diagnostics';

export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i.test(url.trim());
}

export function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?.*?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

export function isDirectMediaUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return /\.(mp4|webm|mov|mkv|avi|mp3|wav|m4a|ogg|flac|aac)$/i.test(clean);
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts video title and author from YouTube OEMBED endpoint
 */
async function fetchYouTubeMetadata(videoUrl: string): Promise<{ title: string; authorName?: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || 'YouTube Video',
        authorName: data.author_name,
      };
    }
  } catch (e) {
    console.warn('[URLExtractor] YouTube OEMBED fetch failed, using fallback title:', e);
  }
  return { title: 'YouTube Video' };
}

/**
 * Extracts transcript and structured knowledge from YouTube videos
 */
export async function extractFromYouTube(
  url: string,
  options: TranscribeOptions = {}
): Promise<ExtractedDocument> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link.');
  }

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const meta = await fetchYouTubeMetadata(cleanUrl);

  let rawTranscript: Array<{ text: string; duration: number; offset: number; lang?: string }> = [];

  try {
    rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (err: any) {
    console.warn(`[URLExtractor] Primary transcript fetch failed for ${videoId}:`, err?.message);
    // Try fetching with auto-generated / language hints
    try {
      rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    } catch {
      // Captions not available on video
      throw new Error(
        `Could not retrieve captions from this YouTube video ("${meta.title}"). The creator has disabled subtitles/closed-captions. Please download the audio/video file and upload it directly so Whisper AI can transcribe it.`
      );
    }
  }

  if (!rawTranscript || rawTranscript.length === 0) {
    throw new Error(
      `No spoken transcript found for this YouTube video. The video may contain only music or no audible speech.`
    );
  }

  const detectedLang = rawTranscript[0]?.lang || 'en';
  const fullSpokenText = rawTranscript.map((t) => t.text).join(' ').replace(/\s+/g, ' ').trim();

  // Detect non-English speech (e.g. Chinese characters, Spanish, etc.)
  const hasChinese = /[\u4e00-\u9fa5]/.test(fullSpokenText);
  const isNonEnglish = detectedLang !== 'en' || hasChinese;

  const lines: string[] = [];
  lines.push(`=== [YouTube Video Knowledge: ${meta.title}] ===`);
  lines.push(`Video URL: ${cleanUrl}`);
  if (meta.authorName) lines.push(`Channel: ${meta.authorName}`);
  lines.push(`Spoken Language: ${hasChinese ? 'Chinese (zh)' : detectedLang.toUpperCase()}`);
  lines.push('');
  lines.push('--- Full Spoken Transcript ---');
  lines.push(fullSpokenText);
  lines.push('');
  lines.push('--- Timestamped Chapters & Statements ---');

  const sections: ExtractedDocument['sections'] = [];
  let currentChunk: string[] = [];
  let currentStart = rawTranscript[0].offset / 1000;
  let currentEnd = currentStart;

  for (const item of rawTranscript) {
    const startSec = item.offset / 1000;
    const durSec = item.duration / 1000;
    const endSec = startSec + durSec;
    const timeTag = `[${formatTimestamp(startSec)} - ${formatTimestamp(endSec)}]`;

    lines.push(`${timeTag} ${item.text}`);
    currentChunk.push(item.text);
    currentEnd = endSec;

    // Group into ~30-45s sections
    if (currentEnd - currentStart >= 35) {
      const heading = `YouTube [${formatTimestamp(currentStart)} - ${formatTimestamp(currentEnd)}]`;
      sections.push({
        heading,
        text: `${heading} ${meta.title}\n${currentChunk.join(' ')}`,
        metadata: {
          startTime: currentStart,
          endTime: currentEnd,
          formattedTime: `${formatTimestamp(currentStart)} - ${formatTimestamp(currentEnd)}`,
          videoUrl: `${cleanUrl}&t=${Math.floor(currentStart)}s`,
          videoId,
        },
      });
      currentChunk = [];
      currentStart = currentEnd;
    }
  }

  if (currentChunk.length > 0) {
    const heading = `YouTube [${formatTimestamp(currentStart)} - ${formatTimestamp(currentEnd)}]`;
    sections.push({
      heading,
      text: `${heading} ${meta.title}\n${currentChunk.join(' ')}`,
      metadata: {
        startTime: currentStart,
        endTime: currentEnd,
        formattedTime: `${formatTimestamp(currentStart)} - ${formatTimestamp(currentEnd)}`,
        videoUrl: `${cleanUrl}&t=${Math.floor(currentStart)}s`,
        videoId,
      },
    });
  }

  return {
    title: `${meta.title} (YouTube)`,
    type: 'youtube',
    content: lines.join('\n'),
    sections: sections.length > 0 ? sections : undefined,
    metadata: {
      videoId,
      videoUrl: cleanUrl,
      channel: meta.authorName,
      isNonEnglish,
      totalLines: rawTranscript.length,
    },
  };
}

/**
 * Extracts and transcribes remote audio or video file streams from direct URLs
 */
export async function extractFromDirectMediaUrl(
  url: string,
  options: TranscribeOptions = {}
): Promise<ExtractedDocument> {
  const cleanUrl = url.split('?')[0];
  const filename = cleanUrl.split('/').pop() || 'remote_media.mp4';

  console.log(`[URLExtractor] Fetching direct media stream from ${url}...`);
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) {
    throw new Error(`Failed to download remote media from URL: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length > 25 * 1024 * 1024) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Remote media file (${sizeMb} MB) exceeds the 25MB transcription API limit. Please export an audio-only copy (MP3/M4A) or compress the file.`
    );
  }

  return await parseMediaFile(buffer, filename, options);
}

/**
 * Scrapes standard webpage HTML, cleans layout scripts/styles, and extracts readable text
 */
export async function extractFromWebpage(url: string): Promise<ExtractedDocument> {
  console.log(`[URLExtractor] Scraping webpage content from ${url}...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AI-Crawler',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch webpage: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // Extract page title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const rawTitle = ogTitleMatch?.[1] || titleMatch?.[1] || new URL(url).hostname;
  const cleanTitle = rawTitle.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const metaDesc = metaDescMatch?.[1]?.trim();

  // Clean HTML: Remove scripts, styles, iframes, SVGs, nav, footer, header
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');

  // Convert headings and paragraphs into readable markdown structure
  cleanHtml = cleanHtml
    .replace(/<(h[1-6])[^>]*>(.*?)<\/\1>/gi, '\n\n## $2\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1')
    .replace(/<(p|div|tr)[^>]*>(.*?)<\/\1>/gi, '\n$2\n');

  // Strip all remaining HTML tags
  let text = cleanHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  if (!text || text.length < 50) {
    throw new Error(
      `Webpage "${cleanTitle}" contains insufficient readable text or is protected by client-side JavaScript rendering.`
    );
  }

  // Truncate at ~30,000 characters to prevent overflow while capturing full documentation/pricing
  if (text.length > 30000) {
    text = text.slice(0, 30000) + '\n\n[... content truncated for optimal context processing ...]';
  }

  const lines: string[] = [];
  lines.push(`=== [Webpage Knowledge: ${cleanTitle}] ===`);
  lines.push(`URL: ${url}`);
  if (metaDesc) lines.push(`Summary: ${metaDesc}`);
  lines.push('');
  lines.push(text);

  return {
    title: cleanTitle,
    type: 'web',
    content: lines.join('\n'),
    metadata: {
      url,
      domain: new URL(url).hostname,
      characterCount: text.length,
    },
  };
}

/**
 * Universal entry point: Automatically routes any web or media URL to the appropriate extractor
 */
export async function extractFromUrl(
  url: string,
  options: TranscribeOptions = {}
): Promise<ExtractedDocument> {
  const cleanUrl = url.trim();

  if (!isValidHttpUrl(cleanUrl)) {
    throw new Error('Please enter a valid HTTP or HTTPS web URL (e.g. https://www.youtube.com/watch?v=...)');
  }

  if (isYouTubeUrl(cleanUrl)) {
    return await extractFromYouTube(cleanUrl, options);
  }

  if (isDirectMediaUrl(cleanUrl)) {
    return await extractFromDirectMediaUrl(cleanUrl, options);
  }

  return await extractFromWebpage(cleanUrl);
}

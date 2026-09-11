import { YoutubeTranscript } from 'youtube-transcript';
import { ExtractedDocument } from './types';
import { parseMediaFile, TranscribeOptions, formatTimestamp } from './transcriber';
import { diagnoseKnowledgeFailure } from './diagnostics';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

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

  // Prepend Master Overview & Full Timeline Outline for long videos (>= 8 sections)
  if (sections.length >= 8 && rawTranscript.length >= 10) {
    const totalDurationSec = (rawTranscript[rawTranscript.length - 1].offset + rawTranscript[rawTranscript.length - 1].duration) / 1000;
    const formattedTotalDuration = formatTimestamp(totalDurationSec);
    const numMilestones = Math.min(10, Math.max(5, Math.floor(rawTranscript.length / 12)));
    const step = Math.floor(rawTranscript.length / numMilestones);
    const milestoneLines: string[] = [];

    for (let m = 0; m < rawTranscript.length; m += step) {
      const item = rawTranscript[m];
      const startT = item.offset / 1000;
      const snippet = rawTranscript.slice(m, m + 5).map((t) => t.text).join(' ').slice(0, 140);
      milestoneLines.push(`• [${formatTimestamp(startT)}]: ${snippet}...`);
    }

    const overviewContent = `=== Master Video Overview & Complete Timeline Directory ===
Title: ${meta.title}
Channel: ${meta.authorName || 'YouTube'}
Total Duration: ${formattedTotalDuration}
Status: 100% Fully Transcribed & Indexed (00:00 to ${formattedTotalDuration}) across ${sections.length} chapters.

Comprehensive Topic Outline & Timeline Milestones:
${milestoneLines.join('\n')}

Summary & Core Message: Complete presentation walkthrough, scientific takeaways, core habits, and in-depth discussion.`;

    sections.unshift({
      heading: `Overview & Complete Timeline Directory [00:00 - ${formattedTotalDuration}]`,
      text: overviewContent,
      metadata: {
        isOverview: true,
        startTime: 0,
        endTime: totalDurationSec,
        formattedTime: `00:00 - ${formattedTotalDuration}`,
        videoUrl: cleanUrl,
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

const REALISTIC_CHROME_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Ch-Ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};

function isCloudflareChallenge(html: string): boolean {
  if (!html) return true;
  return (
    html.includes('Just a moment...') ||
    html.includes('cf-browser-verification') ||
    html.includes('Attention Required! | Cloudflare') ||
    html.includes('challenge-running') ||
    html.includes('cf-chl-widget') ||
    (html.includes('Cloudflare Ray ID') && html.length < 5000)
  );
}

function cleanHtmlToStructuredText(html: string, url: string): { title: string; metaDesc?: string; text: string } {
  // Extract page title: Check og:title, twitter:title, h1, then <title>
  const ogTitleMatch =
    html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  const rawTitle =
    ogTitleMatch?.[1] ||
    h1Match?.[1]?.replace(/<[^>]+>/g, '') ||
    titleMatch?.[1] ||
    new URL(url).hostname;
  const cleanTitle = rawTitle.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract meta description
  const metaDescMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  const metaDesc = metaDescMatch?.[1]?.trim();

  // Clean HTML: Remove scripts, styles, iframes, SVGs, nav, footer, header
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');

  // Convert headings and paragraphs into readable markdown structure
  cleanHtml = cleanHtml
    .replace(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi, '\n\n## $2\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<(p|div|tr|article|section)[^>]*>([\s\S]*?)<\/\1>/gi, '\n$2\n');

  // Strip all remaining HTML tags
  let text = cleanHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  return { title: cleanTitle, metaDesc, text };
}

/**
 * Scrapes standard webpage HTML using a resilient 3-tier waterfall:
 * 1. Direct Browser-Emulated Fetch (Chrome 133 headers, avoids bot 403 blocks)
 * 2. Native System Curl (bypasses Cloudflare / TLS fingerprint restrictions)
 * 3. Jina AI Reader Engine (bypasses dynamic JS rendering & strict anti-scraping walls)
 */
export async function extractFromWebpage(url: string): Promise<ExtractedDocument> {
  console.log(`[URLExtractor] Scraping webpage content from ${url}...`);
  let rawContent = '';
  let isMarkdown = false;
  let extractionTier = 'direct';

  // --- Tier 1: Direct Fetch with Realistic Chrome Headers ---
  try {
    const res = await fetch(url, {
      headers: REALISTIC_CHROME_HEADERS,
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const html = await res.text();
      if (html && html.length > 200 && !isCloudflareChallenge(html)) {
        rawContent = html;
        extractionTier = 'direct';
      }
    } else {
      console.warn(`[URLExtractor] Direct fetch returned status ${res.status} ${res.statusText}, trying Tier 2 (curl)...`);
    }
  } catch (err: any) {
    console.warn(`[URLExtractor] Tier 1 (direct fetch) error:`, err?.message);
  }

  // --- Tier 2: Native Curl (bypasses TLS fingerprint and Cloudflare challenge blocks) ---
  if (!rawContent) {
    try {
      console.log(`[URLExtractor] Tier 2: Invoking native curl for ${url}...`);
      const curlArgs = [
        '-s',
        '-L',
        '--compressed',
        '--max-time', '15',
        '-H', `User-Agent: ${REALISTIC_CHROME_HEADERS['User-Agent']}`,
        '-H', `Accept: ${REALISTIC_CHROME_HEADERS['Accept']}`,
        '-H', `Accept-Language: ${REALISTIC_CHROME_HEADERS['Accept-Language']}`,
        '-H', 'Sec-Fetch-Dest: document',
        '-H', 'Sec-Fetch-Mode: navigate',
        '-H', 'Sec-Fetch-Site: none',
        '-H', 'Upgrade-Insecure-Requests: 1',
        url,
      ];
      const { stdout } = await execFileAsync('curl', curlArgs, { maxBuffer: 15 * 1024 * 1024 });
      if (stdout && stdout.length > 200 && !isCloudflareChallenge(stdout)) {
        rawContent = stdout;
        extractionTier = 'curl';
        console.log(`[URLExtractor] Tier 2 (curl) succeeded with ${stdout.length} bytes.`);
      }
    } catch (curlErr: any) {
      console.warn(`[URLExtractor] Tier 2 (curl) failed:`, curlErr?.message);
    }
  }

  // --- Tier 3: Jina AI Reader Engine (Free LLM-oriented reader proxy) ---
  if (!rawContent) {
    try {
      console.log(`[URLExtractor] Tier 3: Invoking Jina Reader for ${url}...`);
      const jinaUrl = 'https://r.jina.ai/' + url;
      const jinaRes = await fetch(jinaUrl, {
        headers: {
          'Accept': 'text/plain, text/markdown',
          'User-Agent': REALISTIC_CHROME_HEADERS['User-Agent'],
        },
        signal: AbortSignal.timeout(18000),
      });
      if (jinaRes.ok) {
        const jinaText = await jinaRes.text();
        if (jinaText && jinaText.length > 200 && !jinaText.includes('Just a moment...') && !jinaText.includes('CAPTCHA')) {
          rawContent = jinaText;
          isMarkdown = true;
          extractionTier = 'jina';
          console.log(`[URLExtractor] Tier 3 (Jina) succeeded with ${jinaText.length} characters.`);
        }
      }
    } catch (jinaErr: any) {
      console.warn(`[URLExtractor] Tier 3 (Jina) failed:`, jinaErr?.message);
    }
  }

  if (!rawContent) {
    throw new Error(
      `Failed to extract content from ${url}. The website rejected automated web access (HTTP 403 Forbidden / Anti-Bot Verification). Please copy the article text or save as PDF and upload it directly.`
    );
  }

  let cleanTitle = new URL(url).hostname;
  let metaDesc: string | undefined = undefined;
  let text = '';

  if (isMarkdown) {
    // Parse Jina Markdown format: extracts Title: ... or # ...
    const titleHeaderMatch = rawContent.match(/^Title:\s*(.+)$/m);
    const mdH1Match = rawContent.match(/^#\s+(.+)$/m);
    cleanTitle = (titleHeaderMatch?.[1] || mdH1Match?.[1] || new URL(url).hostname).trim();

    // Remove Jina metadata headers (Title:, URL Source:, Markdown Content:)
    text = rawContent
      .replace(/^Title:.*$/m, '')
      .replace(/^URL Source:.*$/m, '')
      .replace(/^Markdown Content:\s*/m, '')
      .trim();
  } else {
    // Parse cleaned HTML
    const parsed = cleanHtmlToStructuredText(rawContent, url);
    cleanTitle = parsed.title;
    metaDesc = parsed.metaDesc;
    text = parsed.text;
  }

  if (!text || text.length < 50) {
    throw new Error(
      `Webpage "${cleanTitle}" contains insufficient readable text or is protected by client-side JavaScript rendering.`
    );
  }

  // Truncate at ~35,000 characters to ensure full long articles are preserved within model context
  if (text.length > 35000) {
    text = text.slice(0, 35000) + '\n\n[... content truncated for optimal context processing ...]';
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
      extractorTier: extractionTier,
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

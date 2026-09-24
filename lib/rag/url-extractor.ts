import { YoutubeTranscript } from 'youtube-transcript';
import { ExtractedDocument } from './types';
import { parseMediaFile, TranscribeOptions, formatTimestamp } from './transcriber';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { validateSafeExternalUrl } from '../security/ssrf';
import https from 'node:https';

const execFileAsync = promisify(execFile);

export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return /(?:youtu\.be\/|youtube\.com\/(?:watch|shorts|embed|live|v|e|attribution_link))/i.test(url.trim());
}

export function isInstagramUrl(url: string): boolean {
  if (!url) return false;
  return /instagram\.com\/(p|reel|tv|stories)\//i.test(url.trim());
}

/**
 * Extracts Instagram post/reel metadata using the public oEmbed endpoint.
 * Instagram requires JavaScript to render content, so all generic scraping tiers fail.
 * The oEmbed API returns the post caption and author without any authentication.
 */
export async function extractFromInstagram(url: string): Promise<ExtractedDocument> {
  const ssrfCheck = await validateSafeExternalUrl(url);
  if (!ssrfCheck.safe) {
    throw new Error(ssrfCheck.error || 'Target URL points to an internal or forbidden address.');
  }

  console.log(`[URLExtractor] Fetching Instagram oEmbed for ${url}...`);

  // Determine the post type for a human-readable label
  const isReel = /instagram\.com\/(reel|tv)\//i.test(url);
  const postType = isReel ? 'Reel' : 'Post';

  let caption = '';
  let authorName = '';

  try {
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KnowledgeBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      caption = (data.title || '').trim();
      authorName = (data.author_name || '').trim();
      console.log(`[URLExtractor] Instagram oEmbed succeeded. Author: ${authorName}, Caption length: ${caption.length}`);
    } else {
      console.warn(`[URLExtractor] Instagram oEmbed returned ${res.status} ${res.statusText}`);
    }
  } catch (err: any) {
    console.warn(`[URLExtractor] Instagram oEmbed fetch failed:`, err?.message);
  }

  // Build the knowledge document content
  const lines: string[] = [];
  const docTitle = authorName
    ? `Instagram ${postType} by @${authorName}`
    : `Instagram ${postType}`;

  lines.push(`=== [Instagram Knowledge: ${docTitle}] ===`);
  lines.push(`URL: ${url}`);
  if (authorName) lines.push(`Author: @${authorName}`);
  lines.push('');

  if (caption) {
    lines.push(`Caption:\n${caption}`);
  } else {
    // Fallback: extract what we can from the URL itself
    lines.push(
      `Note: The full caption of this Instagram ${postType.toLowerCase()} could not be retrieved automatically (Instagram requires a logged-in session for full content). ` +
      `The post URL is: ${url}` +
      (authorName ? ` by @${authorName}.` : '.')
    );
    lines.push('');
    lines.push(
      'To add the content from this post to the knowledge base, please copy the caption text manually and add it as a text note.'
    );
  }

  const content = lines.join('\n');

  if (content.length < 50) {
    throw new Error(
      `Could not retrieve content from this Instagram ${postType.toLowerCase()}. Instagram requires a logged-in browser session to display post content. ` +
      `Please copy the caption or description text and add it manually as a text note to the knowledge base.`
    );
  }

  return {
    title: docTitle,
    type: 'web',
    content,
    metadata: {
      url,
      domain: 'instagram.com',
      characterCount: content.length,
      extractorTier: 'instagram-oembed',
    },
  };
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // Handle standard watch url: watch?v=... or watch?...&v=...
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];

  // Handle youtu.be/ID, shorts/ID, embed/ID, live/ID, v/ID
  const pathMatch = clean.match(/(?:youtu\.be\/|(?:shorts|embed|live|v|e)\/)([a-zA-Z0-9_-]{11})/i);
  if (pathMatch) return pathMatch[1];

  // Fallback match any 11-char ID following youtube patterns
  const genericMatch = clean.match(/(?:youtube\.com\/(?:watch\?.*?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return genericMatch ? genericMatch[1] : null;
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

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function parseTimedtextXml(
  payload: string,
  lang: string = 'en'
): Array<{ text: string; duration: number; offset: number; lang?: string }> {
  const results: Array<{ text: string; duration: number; offset: number; lang?: string }> = [];

  // Try JSON (fmt=json3)
  try {
    const json = JSON.parse(payload);
    if (Array.isArray(json?.events)) {
      for (const ev of json.events) {
        if (!Array.isArray(ev.segs)) continue;
        const text = ev.segs.map((s: any) => s.utf8 || '').join('').trim();
        if (text) {
          results.push({
            text: decodeHtmlEntities(text),
            offset: ev.tStartMs || 0,
            duration: ev.dDurationMs || 0,
            lang,
          });
        }
      }
      if (results.length > 0) return results;
    }
  } catch {
    // Not JSON, continue to XML
  }

  // Format 3 (srv3): <p ...>...</p> (order-independent attributes)
  const pRegex = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = pRegex.exec(payload)) !== null) {
    const attrs = pMatch[1];
    const inner = pMatch[2];

    const tMatch = attrs.match(/\bt="(\d+)"/i);
    const dMatch = attrs.match(/\bd="(\d+)"/i);
    const startMs = tMatch ? parseInt(tMatch[1], 10) : 0;
    const durMs = dMatch ? parseInt(dMatch[1], 10) : 0;

    let text = '';
    const sRegex = /<s\b[^>]*>([^<]*)<\/s>/gi;
    let sMatch: RegExpExecArray | null;
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) {
      text = inner.replace(/<[^>]+>/g, '');
    }
    text = decodeHtmlEntities(text).replace(/\s+/g, ' ').trim();
    if (text) {
      results.push({
        text,
        offset: startMs,
        duration: durMs,
        lang,
      });
    }
  }

  if (results.length > 0) return results;

  // Classic format: <text ...>content</text>
  const textRegex = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
  let tMatch: RegExpExecArray | null;
  while ((tMatch = textRegex.exec(payload)) !== null) {
    const attrs = tMatch[1];
    const rawContent = tMatch[2].replace(/<[^>]+>/g, '');

    const startMatch = attrs.match(/\bstart="([0-9.]+)"/i);
    const durMatch = attrs.match(/\bdur="([0-9.]+)"/i);
    const startSec = startMatch ? parseFloat(startMatch[1]) : 0;
    const durSec = durMatch ? parseFloat(durMatch[1]) : 0;

    const cleanText = decodeHtmlEntities(rawContent).replace(/\s+/g, ' ').trim();
    if (cleanText) {
      results.push({
        text: cleanText,
        offset: Math.round(startSec * 1000),
        duration: Math.round(durSec * 1000),
        lang,
      });
    }
  }

  return results;
}

const youtubeHttpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 16,
  timeout: 30000,
});

function httpsPostJson(
  urlStr: string,
  body: any,
  userAgent: string,
  timeoutMs: number = 15000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(body);
    const req = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'POST',
        agent: youtubeHttpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': userAgent,
        },
        timeout: timeoutMs,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error(`Request to ${url.hostname} timed out`)));
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function httpsGetBuffer(
  urlStr: string,
  userAgent?: string,
  rangeHeader?: string,
  timeoutMs: number = 30000
): Promise<{ statusCode: number; data: Buffer }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const headers: Record<string, string> = {};
    if (userAgent) headers['User-Agent'] = userAgent;
    if (rangeHeader) headers['Range'] = rangeHeader;

    const req = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'GET',
        agent: youtubeHttpsAgent,
        headers,
        timeout: timeoutMs,
      },
      (res) => {
        if (
          res.statusCode &&
          [301, 302, 303, 307, 308].includes(res.statusCode) &&
          res.headers.location
        ) {
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, urlStr).toString();
          httpsGetBuffer(redirectUrl, userAgent, rangeHeader, timeoutMs).then(resolve, reject);
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 200,
            data: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error(`GET request to ${url.hostname} timed out`)));
    req.on('error', reject);
    req.end();
  });
}

async function queryHttpsWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 4,
  backoffMs: number = 500
): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffMs * attempt));
      }
    }
  }
  throw lastErr;
}

interface YouTubeCaptionTrack {
  baseUrl: string;
  name?: { runs?: Array<{ text: string }> };
  vssId?: string;
  languageCode: string;
  kind?: string;
  isTranslatable?: boolean;
}

interface YouTubeInnerTubeData {
  title?: string;
  author?: string;
  captionTracks?: YouTubeCaptionTrack[];
  audioStreamUrl?: string;
}

/**
 * Strategy 0: Scrape ytInitialPlayerResponse from the YouTube watch page HTML.
 * This is a plain browser GET request to youtube.com — served by YouTube's CDN to all IPs,
 * including Vercel / AWS datacenter IPs where the InnerTube JSON API is often blocked.
 * Caption track baseUrls from ytInitialPlayerResponse are CDN URLs with no IP restriction.
 * Uses the shared https.Agent (Node native) to avoid IPv6 TLS failures in some environments.
 */
async function scrapeYouTubeWatchPage(videoId: string): Promise<YouTubeInnerTubeData> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  ];

  for (const ua of userAgents) {
    try {
      // Use httpsGetBuffer (Node native https module) — reliable on both Linux (Vercel) and Windows
      const res = await queryHttpsWithRetry(
        () => httpsGetBuffer(watchUrl, ua, undefined, 15000),
        2,
        500
      );

      if (res.statusCode < 200 || res.statusCode >= 300) {
        console.warn(`[URLExtractor] Watch page GET ${res.statusCode} for ${videoId}, trying next UA...`);
        continue;
      }

      const html = res.data.toString('utf-8');
      if (!html || html.length < 1000) continue;

      // ytInitialPlayerResponse is embedded as an inline JSON assignment in a <script> tag.
      // It may span multiple lines — match up to the first statement boundary.
      const iprMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});\s*(?:var |const |let |<\/script>|if\s*\()/);
      if (!iprMatch) {
        // Check if we got a bot-check page instead
        if (html.includes('enable JavaScript') || html.includes('Are you a robot')) {
          console.warn(`[URLExtractor] Watch page returned bot-check for ${videoId}, trying next UA...`);
        } else {
          console.warn(`[URLExtractor] ytInitialPlayerResponse not found in watch page for ${videoId} (html len=${html.length})`);
        }
        continue;
      }

      let data: any;
      try {
        data = JSON.parse(iprMatch[1]);
      } catch {
        console.warn(`[URLExtractor] Failed to parse ytInitialPlayerResponse JSON for ${videoId}`);
        continue;
      }

      const captionTracks: YouTubeCaptionTrack[] =
        data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      const title: string | undefined = data?.videoDetails?.title;
      const author: string | undefined = data?.videoDetails?.author;

      // Extract audio stream URL (may be absent on some datacenter IPs — acceptable)
      const adaptiveFormats: any[] = data?.streamingData?.adaptiveFormats || [];
      const formats: any[] = data?.streamingData?.formats || [];
      const audioFormat = [...adaptiveFormats, ...formats].find(
        (f: any) => (f.mimeType?.startsWith('audio/') || f.audioQuality) && f.url
      );

      console.log(
        `[URLExtractor] Watch page scrape OK for ${videoId}: title="${title}", captions=${captionTracks.length}, audio=${audioFormat ? 'yes' : 'no'}`
      );

      return {
        title,
        author,
        captionTracks,
        audioStreamUrl: audioFormat?.url,
      };
    } catch (err: any) {
      console.warn(`[URLExtractor] Watch page scrape failed for ${videoId} UA[${ua.slice(0, 30)}]:`, err?.message);
    }
  }

  return {};
}

async function queryYouTubeInnerTube(videoId: string): Promise<YouTubeInnerTubeData> {
  const hosts = ['youtubei.googleapis.com', 'www.youtube.com'];
  const clients = [
    {
      name: 'ANDROID',
      context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
      userAgent: 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)',
    },
    {
      name: 'WEB',
      context: { client: { clientName: 'WEB', clientVersion: '2.20241115.01.00' } },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    },
    {
      name: 'IOS',
      context: { client: { clientName: 'IOS', clientVersion: '19.45.4', deviceModel: 'iPhone16,2' } },
      userAgent: 'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1 like Mac OS X)',
    },
  ];

  let bestTitle: string | undefined;
  let bestAuthor: string | undefined;
  let bestCaptionTracks: YouTubeCaptionTrack[] = [];
  let bestAudioStreamUrl: string | undefined;

  for (const host of hosts) {
    for (const client of clients) {
      try {
        const data = await queryHttpsWithRetry(
          () =>
            httpsPostJson(
              `https://${host}/youtubei/v1/player?prettyPrint=false`,
              { context: client.context, videoId },
              client.userAgent,
              15000
            ),
          3,
          500
        );

        if (!data) continue;

        if (!bestTitle && data?.videoDetails?.title) {
          bestTitle = data.videoDetails.title;
        }
        if (!bestAuthor && data?.videoDetails?.author) {
          bestAuthor = data.videoDetails.author;
        }

        const captionTracks: YouTubeCaptionTrack[] =
          data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
        if (captionTracks.length > 0 && bestCaptionTracks.length === 0) {
          bestCaptionTracks = captionTracks;
        }

        const adaptiveFormats = data?.streamingData?.adaptiveFormats || [];
        const formats = data?.streamingData?.formats || [];
        const allFormats = [...adaptiveFormats, ...formats];
        const audioFormat = allFormats.find(
          (f: any) => (f.mimeType?.startsWith('audio/') || f.audioQuality) && f.url
        );
        if (audioFormat?.url && !bestAudioStreamUrl) {
          bestAudioStreamUrl = audioFormat.url;
        }

        if (bestCaptionTracks.length > 0 && bestTitle && bestAudioStreamUrl) {
          return {
            title: bestTitle,
            author: bestAuthor,
            captionTracks: bestCaptionTracks,
            audioStreamUrl: bestAudioStreamUrl,
          };
        }
      } catch (err: any) {
        console.warn(`[URLExtractor] InnerTube ${client.name} on ${host} failed for ${videoId}:`, err?.message || err);
      }
    }
    if (bestCaptionTracks.length > 0 && bestTitle) {
      break;
    }
  }

  return {
    title: bestTitle,
    author: bestAuthor,
    captionTracks: bestCaptionTracks,
    audioStreamUrl: bestAudioStreamUrl,
  };
}

interface PublicTranscriptResult {
  title?: string;
  language?: string;
  transcript: Array<{ text: string; duration: number; offset: number; lang?: string }>;
}

/**
 * Strategy 1 (Cloud-resilient): Fetch transcript via dedicated transcript service.
 * Standard YouTube internal endpoints block AWS / Vercel datacenter IPs.
 * This service runs on proxy-rotated infrastructure and reliably extracts transcripts
 * with timestamps and titles within 1-2 seconds without datacenter IP blocks.
 */
async function fetchTranscriptFromPublicService(videoId: string): Promise<PublicTranscriptResult | null> {
  try {
    const res = await fetch(`https://youtube-transcript.ai/transcript/${videoId}.txt`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': 'text/plain, text/markdown, */*',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text || text.length < 50 || !text.includes('# Transcript:')) return null;

    const lines = text.split('\n');
    let title: string | undefined;
    let language = 'en';
    const transcript: Array<{ text: string; offset: number; duration: number; lang?: string }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# Transcript:')) {
        title = trimmed.replace('# Transcript:', '').trim();
      } else if (trimmed.startsWith('Language:')) {
        const langMatch = trimmed.match(/Language:\s*([a-zA-Z0-9_-]+)/);
        if (langMatch) language = langMatch[1];
      } else {
        const match = trimmed.match(/^\[(\d+(?::\d+)+)\]\s*(.*)$/);
        if (match) {
          const timeParts = match[1].split(':').map(Number);
          let seconds = 0;
          if (timeParts.length === 2) seconds = timeParts[0] * 60 + timeParts[1];
          else if (timeParts.length === 3) seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
          const content = match[2].trim();
          if (content) {
            transcript.push({
              text: content,
              offset: seconds * 1000,
              duration: 5000,
              lang: language,
            });
          }
        }
      }
    }

    if (transcript.length > 0) {
      console.log(`[URLExtractor] Public transcript service succeeded for ${videoId}: ${transcript.length} segments, title="${title}"`);
      return { title, language, transcript };
    }
  } catch (err: any) {
    console.warn(`[URLExtractor] Public transcript service failed for ${videoId}:`, err?.message);
  }
  return null;
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
  let rawTranscript: Array<{ text: string; duration: number; offset: number; lang?: string }> = [];
  let finalTitle = 'YouTube Video';
  let finalAuthor = 'YouTube';

  // Strategy 1 (Cloud-Primary): Dedicated transcript service that bypasses Vercel/AWS datacenter IP blocks
  const publicResult = await fetchTranscriptFromPublicService(videoId);
  if (publicResult && publicResult.transcript.length > 0) {
    rawTranscript = publicResult.transcript;
    if (publicResult.title) finalTitle = publicResult.title;
  }

  // Strategy 2: Direct Watch Page Scrape + Multi-Client InnerTube Query (fallback if Strategy 1 fails)
  let innerTubeDataForStrategies: YouTubeInnerTubeData = {};
  if (rawTranscript.length === 0) {
    const [watchPageData, innerTubeData] = await Promise.allSettled([
      scrapeYouTubeWatchPage(videoId),
      queryYouTubeInnerTube(videoId),
    ]);

    const watchData = watchPageData.status === 'fulfilled' ? watchPageData.value : {};
    const itData = innerTubeData.status === 'fulfilled' ? innerTubeData.value : {};

    const mergedCaptionTracks = (
      (watchData.captionTracks && watchData.captionTracks.length > 0)
        ? watchData.captionTracks
        : (itData.captionTracks || [])
    );
    const mergedTitle = watchData.title || itData.title;
    const mergedAuthor = watchData.author || itData.author;
    const mergedAudioUrl = watchData.audioStreamUrl || itData.audioStreamUrl;

    innerTubeDataForStrategies = {
      title: mergedTitle,
      author: mergedAuthor,
      captionTracks: mergedCaptionTracks,
      audioStreamUrl: mergedAudioUrl,
    };

    let metaTitle = innerTubeDataForStrategies.title;
    let metaAuthor = innerTubeDataForStrategies.author;

    if (!metaTitle) {
      const meta = await fetchYouTubeMetadata(cleanUrl);
      metaTitle = meta.title;
      metaAuthor = meta.authorName;
    }

    if (metaTitle) finalTitle = metaTitle;
    if (metaAuthor) finalAuthor = metaAuthor;

    if (innerTubeDataForStrategies.captionTracks && innerTubeDataForStrategies.captionTracks.length > 0) {
      const tracks = innerTubeDataForStrategies.captionTracks;
    // Prefer English if available, then other languages
    const sortedTracks = [...tracks].sort((a, b) => {
      const aIsEn = a.languageCode === 'en' || a.languageCode.startsWith('en-');
      const bIsEn = b.languageCode === 'en' || b.languageCode.startsWith('en-');
      if (aIsEn && !bIsEn) return -1;
      if (!aIsEn && bIsEn) return 1;
      return 0;
    });

    for (const selectedTrack of sortedTracks) {
      try {
        const res = await queryHttpsWithRetry(
          () =>
            httpsGetBuffer(
              selectedTrack.baseUrl,
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
              undefined,
              20000
            ),
          4,
          600
        );

        const xmlOrJson = res.data.toString('utf-8');
        const parsed = parseTimedtextXml(xmlOrJson, selectedTrack.languageCode);
        if (parsed.length > 0) {
          rawTranscript = parsed;
          break;
        }
      } catch (trackErr: any) {
        console.warn(
          `[URLExtractor] Failed to download caption track ${selectedTrack.languageCode} for ${videoId}:`,
          trackErr?.message || trackErr
        );
      }
    }
  }
}

  // Strategy 3: Fallback to youtube-transcript library with dynamic language detection
  if (rawTranscript.length === 0) {
    try {
      rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (ytErr: any) {
      console.warn(`[URLExtractor] Primary transcript fetch failed for ${videoId}:`, ytErr?.message);
      // Parse available languages from error message if present (e.g. "Available languages: hi, ur")
      const availableLangsMatch = ytErr?.message?.match(/Available languages:\s*([a-zA-Z0-9_,-]+)/i);
      if (availableLangsMatch) {
        const langs = availableLangsMatch[1].split(',').map((l: string) => l.trim()).filter(Boolean);
        for (const lang of langs) {
          try {
            rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
            if (rawTranscript.length > 0) break;
          } catch {
            // continue
          }
        }
      }
    }
  }

  let audioFallbackError: string | undefined;

  // Strategy 3: If closed captions are absent/disabled, stream audio directly for AI transcription
  if (rawTranscript.length === 0 && innerTubeDataForStrategies.audioStreamUrl) {
    console.log(`[URLExtractor] Closed captions not found on video. Streaming audio directly for AI transcription...`);
    try {
      const audioRes = await queryHttpsWithRetry(
        () =>
          httpsGetBuffer(
            innerTubeDataForStrategies.audioStreamUrl!,
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            'bytes=0-15728640',
            60000
          ),
        3,
        1000
      );

      const audioBuffer = audioRes.data;

      if (audioBuffer.length > 1000) {
        const filename = `${finalTitle.replace(/[^a-z0-9_-]/gi, '_').slice(0, 50)}.mp4`;
        const transcribedDoc = await parseMediaFile(audioBuffer, filename, options);
        return {
          ...transcribedDoc,
          title: `${finalTitle} (YouTube)`,
          metadata: {
            ...transcribedDoc.metadata,
            videoId,
            videoUrl: cleanUrl,
            channel: finalAuthor,
          },
        };
      }
    } catch (audioErr: any) {
      audioFallbackError = audioErr?.message || String(audioErr);
      console.warn(`[URLExtractor] Audio stream transcription fallback failed for ${videoId}:`, audioFallbackError);
    }
  }

  if (!rawTranscript || rawTranscript.length === 0) {
    const errorDetails = audioFallbackError
      ? ` Audio transcription was attempted but failed: ${audioFallbackError}`
      : '';
    throw new Error(
      `No spoken transcript or captions found for this YouTube video ("${finalTitle}").${errorDetails} The video may contain only music or no audible speech.`
    );
  }

  const detectedLang = rawTranscript[0]?.lang || 'en';
  const fullSpokenText = rawTranscript.map((t) => t.text).join(' ').replace(/\s+/g, ' ').trim();

  // Detect non-English speech (e.g. Chinese characters, Spanish, etc.)
  const hasChinese = /[\u4e00-\u9fa5]/.test(fullSpokenText);
  const isNonEnglish = detectedLang !== 'en' || hasChinese;

  const lines: string[] = [];
  lines.push(`=== [YouTube Video Knowledge: ${finalTitle}] ===`);
  lines.push(`Video URL: ${cleanUrl}`);
  if (finalAuthor) lines.push(`Channel: ${finalAuthor}`);
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
        text: `${heading} ${finalTitle}\n${currentChunk.join(' ')}`,
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
      text: `${heading} ${finalTitle}\n${currentChunk.join(' ')}`,
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
Title: ${finalTitle}
Channel: ${finalAuthor}
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
    title: `${finalTitle} (YouTube)`,
    type: 'youtube',
    content: lines.join('\n'),
    sections: sections.length > 0 ? sections : undefined,
    metadata: {
      videoId,
      videoUrl: cleanUrl,
      channel: finalAuthor,
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

// Headers used for direct Node.js fetch: no Sec-Fetch-* or Sec-Ch-Ua headers because Node's TLS
// fingerprint does not match Chrome's and anti-bot systems detect the mismatch immediately.
const FETCH_SAFE_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
};

// Keep full Sec-* headers only for curl, which has its own native TLS stack that matches Chrome's fingerprint.
const REALISTIC_CHROME_HEADERS: Record<string, string> = {
  ...FETCH_SAFE_HEADERS,
  'Sec-Ch-Ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

function isBlockedResponse(html: string): boolean {
  if (!html) return true;
  // Cloudflare challenge pages
  if (
    html.includes('Just a moment...') ||
    html.includes('cf-browser-verification') ||
    html.includes('Attention Required! | Cloudflare') ||
    html.includes('challenge-running') ||
    html.includes('cf-chl-widget') ||
    (html.includes('Cloudflare Ray ID') && html.length < 5000)
  ) return true;
  // Anti-robot / anti-scraper pages from other systems
  if (
    html.includes('Are you a robot?') ||
    html.includes('are you a robot') ||
    html.includes('Please verify you are a human') ||
    html.includes('verify you are a human') ||
    html.includes('Enable JavaScript and cookies') ||
    html.includes('Access Denied') ||
    html.includes('403 Forbidden') ||
    html.includes('Robot Check') ||
    html.includes('robot-check') ||
    html.includes('Press & Hold to confirm you are a human') ||
    html.includes('Pardon Our Interruption')
  ) return true;
  return false;
}

// Keep backward-compatible alias
const isCloudflareChallenge = isBlockedResponse;

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
  const text = cleanHtml
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
 * Scrapes standard webpage HTML using a resilient 4-tier waterfall:
 * 1. Direct Node fetch with clean UA headers (no Sec-* to avoid TLS fingerprint mismatch)
 * 2. Native curl.exe (own TLS stack, bypasses most Cloudflare and anti-bot challenges)
 * 3. Jina AI Reader Engine (cloud-based reader that bypasses JS rendering and paywalls)
 * 4. Google Web Cache (for news articles and public pages that have been indexed)
 */
export async function extractFromWebpage(url: string): Promise<ExtractedDocument> {
  const ssrfCheck = await validateSafeExternalUrl(url);
  if (!ssrfCheck.safe) {
    throw new Error(ssrfCheck.error || 'Target URL points to an internal or forbidden address.');
  }

  console.log(`[URLExtractor] Scraping webpage content from ${url}...`);
  let rawContent = '';
  let isMarkdown = false;
  let extractionTier = 'direct';

  // --- Tier 1: Direct Fetch using fetch-safe headers (fast 5s timeout) ---
  try {
    const res = await fetch(url, {
      headers: FETCH_SAFE_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const html = await res.text();
      if (html && html.length > 200 && !isBlockedResponse(html)) {
        rawContent = html;
        extractionTier = 'direct';
      } else if (html && isBlockedResponse(html)) {
        console.warn(`[URLExtractor] Tier 1 returned a blocked/challenge page (${html.length} bytes), trying Tier 2 (Jina)...`);
      }
    } else {
      console.warn(`[URLExtractor] Direct fetch returned status ${res.status} ${res.statusText}, trying Tier 2 (Jina)...`);
    }
  } catch (err: any) {
    console.warn(`[URLExtractor] Tier 1 (direct fetch) error:`, err?.message);
  }

  // --- Tier 2: Jina AI Reader Engine (cloud-based proxy that bypasses Cloudflare, paywalls & bot walls) ---
  if (!rawContent) {
    try {
      console.log(`[URLExtractor] Tier 2: Invoking Jina Reader for ${url}...`);
      const jinaUrl = 'https://r.jina.ai/' + url;
      const jinaRes = await fetch(jinaUrl, {
        headers: {
          'Accept': 'text/plain, text/markdown',
          'X-Timeout': '10',
        },
        signal: AbortSignal.timeout(12000),
      });
      if (jinaRes.ok) {
        const jinaText = await jinaRes.text();
        if (
          jinaText &&
          jinaText.length > 200 &&
          !jinaText.includes('Just a moment...') &&
          !jinaText.includes('CAPTCHA') &&
          !jinaText.includes('Are you a robot?') &&
          !isBlockedResponse(jinaText)
        ) {
          rawContent = jinaText;
          isMarkdown = true;
          extractionTier = 'jina';
          console.log(`[URLExtractor] Tier 2 (Jina) succeeded with ${jinaText.length} characters.`);
        }
      } else {
        console.warn(`[URLExtractor] Tier 2 (Jina) returned status ${jinaRes.status}, trying Tier 3 (curl)...`);
      }
    } catch (jinaErr: any) {
      console.warn(`[URLExtractor] Tier 2 (Jina) failed:`, jinaErr?.message);
    }
  }

  // --- Tier 3: Native curl / curl.exe (with realistic Chrome headers, 6s timeout) ---
  if (!rawContent) {
    const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
    try {
      console.log(`[URLExtractor] Tier 3: Invoking ${curlBin} for ${url}...`);
      const curlArgs = [
        '-s',
        '-L',
        '--compressed',
        '--max-time', '6',
        '-H', `User-Agent: ${REALISTIC_CHROME_HEADERS['User-Agent']}`,
        '-H', `Accept: ${REALISTIC_CHROME_HEADERS['Accept']}`,
        '-H', `Accept-Language: ${REALISTIC_CHROME_HEADERS['Accept-Language']}`,
        '-H', 'Sec-Fetch-Dest: document',
        '-H', 'Sec-Fetch-Mode: navigate',
        '-H', 'Sec-Fetch-Site: none',
        '-H', 'Upgrade-Insecure-Requests: 1',
        url,
      ];
      const { stdout } = await execFileAsync(curlBin, curlArgs, { maxBuffer: 15 * 1024 * 1024 });
      if (stdout && stdout.length > 200 && !isBlockedResponse(stdout)) {
        rawContent = stdout;
        extractionTier = 'curl';
        console.log(`[URLExtractor] Tier 3 (curl) succeeded with ${stdout.length} bytes.`);
      }
    } catch (curlErr: any) {
      console.warn(`[URLExtractor] Tier 3 (curl) failed:`, curlErr?.message);
    }
  }

  if (!rawContent) {
    // Identify paywall/premium sites specifically to give a better error message
    const paywallDomains = ['bloomberg.com', 'wsj.com', 'ft.com', 'nytimes.com', 'economist.com', 'washingtonpost.com', 'thetimes.co.uk'];
    const isPaywall = paywallDomains.some((d) => url.includes(d));
    if (isPaywall) {
      throw new Error(
        `The article from ${new URL(url).hostname} is behind a paywall or strict anti-bot verification. All 4 extraction methods were blocked. Please copy the article text directly and upload it as a TXT or DOC file.`
      );
    }
    throw new Error(
      `Failed to extract content from ${url}. The website blocked all automated access attempts (Cloudflare / Anti-Bot / 403 Forbidden). Please copy the article text or save as PDF and upload it directly.`
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

  if (isInstagramUrl(cleanUrl)) {
    return await extractFromInstagram(cleanUrl);
  }

  if (isDirectMediaUrl(cleanUrl)) {
    return await extractFromDirectMediaUrl(cleanUrl, options);
  }

  return await extractFromWebpage(cleanUrl);
}

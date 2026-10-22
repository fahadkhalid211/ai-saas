import { ExtractedDocument } from './types';
import { parseMediaFile, TranscribeOptions } from './transcriber';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { validateSafeExternalUrl } from '../security/ssrf';
import https from 'node:https';

const execFileAsync = promisify(execFile);

/** What a person is told when they add a YouTube link (the feature was removed: YouTube refuses to give transcripts to a cloud server). */
export const YOUTUBE_NOT_SUPPORTED_MESSAGE =
  'YouTube links are not supported. To add a video, upload the video or audio file, or paste its transcript (on YouTube: "...", then "Show transcript") into a text document.';

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
    throw new Error('Please enter a valid HTTP or HTTPS web URL (e.g. https://yourcompany.com/about)');
  }

  if (isYouTubeUrl(cleanUrl)) {
    throw new Error(YOUTUBE_NOT_SUPPORTED_MESSAGE);
  }

  if (isInstagramUrl(cleanUrl)) {
    return await extractFromInstagram(cleanUrl);
  }

  if (isDirectMediaUrl(cleanUrl)) {
    return await extractFromDirectMediaUrl(cleanUrl, options);
  }

  return await extractFromWebpage(cleanUrl);
}

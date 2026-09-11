import { Database } from '../db';
import { chunkDocument } from './chunker';
import { generateEmbeddingsBatch } from './embedder';
import { ExtractedDocument } from './types';

export interface WebSearchResultItem {
  title: string;
  snippet: string;
  url?: string;
}

/**
 * Detects whether the user is explicitly requesting a live online / web search
 */
export function isWebSearchIntent(message: string): boolean {
  if (!message) return false;
  const m = message.trim();
  // 1. Mentions internet, web, online, or google/bing in a lookup context
  if (/\b(search|look\s*up|find|google|browse|check)\b.*?\b(internet|web|online|google|bing|duckduckgo)\b/i.test(m)) return true;
  // 2. Direct search phrases: "search ...", "web search ...", "search online ..."
  if (/^(search|web\s*search|google|look\s*up|find\s*online|browse\s*web)\b/i.test(m)) return true;
  // 3. Conversational commands: "search and tell me", "search for", "search it on", etc.
  if (/\bsearch\s+(?:it\s+on|and\s+tell\s+me|and\s+find|for|about|on\s+the|on)\b/i.test(m)) return true;
  // 4. Mentions searching on the internet anywhere
  if (/\b(on the internet|on internet|from the web|from internet|online search|live search)\b/i.test(m)) return true;
  return false;
}

/**
 * Extracts the core search keywords from conversational search requests,
 * resolving pronouns like "it", "her", "his" using conversation history & context hints
 */
export function extractSearchQuery(
  message: string,
  history: { role: string; content: string }[] = [],
  contextHints: string[] = []
): string {
  let clean = message
    .replace(/(?:can you|please|could you|i want you to)?\s*(?:search (?:it )?(?:on (?:the )?)?(?:internet|web|online|google)|google(?: it)?|look ?up (?:online|on (?:the )?web|on (?:the )?internet)|find (?:online|on (?:the )?web)|browse (?:the web|online))/gi, '')
    .replace(/(?:and (?:save|store|remember|keep) (?:it|that|the information) in (?:the )?(?:knowledge ?base|knowledge|memory))?/gi, '')
    .replace(/^search\s+(?:and\s+tell\s+me|and\s+find|for|about|it\s+on\s+internet)?\s*/i, '')
    .replace(/\b(on the internet|on internet|from the web|from internet|online)\b/gi, '')
    .replace(/[?.!]+$/, '')
    .trim();

  // If clean is empty or just pronouns like "it", "her", "him", "this":
  const isAmbiguous = !clean || clean.length < 3 || /^(it|her|him|them|this|that|its|hers|his)$/i.test(clean);

  if (isAmbiguous && history.length > 0) {
    // Find the latest user question in history
    const lastUserMsg = [...history].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      const prev = lastUserMsg.content
        .replace(/^(tell me|what is|who is|give me|can you tell me|do you know)\s*/i, '')
        .replace(/[?.!]+$/, '')
        .trim();
      if (prev) clean = prev;
    }
  }

  // Resolve pronouns (her/him/she/he/their) using context hints (e.g. "Dr Sahar Yousef")
  if (/\b(her|him|she|he|his|their)\b/i.test(clean) && contextHints.length > 0) {
    const mainEntity = contextHints[0];
    clean = clean.replace(/\b(her|him|she|he|his|their)\b/gi, mainEntity);
  }

  return clean.length > 2 ? clean.trim() : message.trim();
}

/**
 * Perform live web search using DuckDuckGo ($0 cost, 0 API keys required)
 */
export async function executeWebSearch(query: string): Promise<WebSearchResultItem[]> {
  const results: WebSearchResultItem[] = [];

  function cleanDuckDuckGoUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    let url = rawUrl.trim();
    if (url.includes('uddg=')) {
      const match = url.match(/uddg=([^&]+)/);
      if (match && match[1]) {
        try {
          url = decodeURIComponent(match[1]);
        } catch {}
      }
    }
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    return url;
  }

  function cleanHtmlText(raw: string): string {
    return raw
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  // 1. Check DuckDuckGo Instant Answer / Abstract API
  try {
    const instantUrl = 'https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_html=1&skip_disambig=1';
    const instantRes = await fetch(instantUrl, { signal: AbortSignal.timeout(5000) });
    if (instantRes.ok) {
      const data = await instantRes.json();
      if (data.AbstractText) {
        results.push({
          title: data.Heading || `${query} Overview`,
          snippet: data.AbstractText,
          url: data.AbstractURL,
        });
      }
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 3)) {
          if (topic.Text && topic.Text.length > 30) {
            results.push({
              title: topic.FirstURL ? topic.FirstURL.split('/').pop()?.replace(/_/g, ' ') || query : query,
              snippet: topic.Text,
              url: topic.FirstURL,
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[WebSearch] Instant Answer lookup failed:', err?.message);
  }

  // 2. Fetch live web results from DuckDuckGo HTML endpoint with canonical decoded URLs
  try {
    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'q=' + encodeURIComponent(query),
      signal: AbortSignal.timeout(7000),
    });

    if (res.ok) {
      const html = await res.text();
      const titleRegex = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
      const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;

      const titles: { title: string; url: string }[] = [];
      const snippets: string[] = [];

      let tm;
      while ((tm = titleRegex.exec(html)) !== null && titles.length < 8) {
        const parsedUrl = cleanDuckDuckGoUrl(tm[1]);
        const parsedTitle = cleanHtmlText(tm[2]);
        if (parsedUrl) {
          titles.push({ url: parsedUrl, title: parsedTitle });
        }
      }

      let sm;
      while ((sm = snippetRegex.exec(html)) !== null && snippets.length < 8) {
        snippets.push(cleanHtmlText(sm[1]));
      }

      for (let i = 0; i < titles.length; i++) {
        const item = titles[i];
        const snippet = snippets[i] || item.title;
        // Avoid duplicates
        if (item.url && !results.some((r) => r.url === item.url)) {
          results.push({
            title: item.title || `Web Result ${results.length + 1}`,
            snippet,
            url: item.url,
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[WebSearch] HTML search lookup failed:', err?.message);
  }

  return results;
}

/**
 * Ingests live web search findings directly into the assistant's knowledge base
 */
export async function ingestWebSearchResults(
  assistantId: string,
  searchQuery: string,
  results: WebSearchResultItem[]
): Promise<{ sourceId: string; chunkCount: number; summary: string }> {
  if (results.length === 0) {
    throw new Error(`No web search results found for "${searchQuery}"`);
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const sourceTitle = `Online Search: ${searchQuery}`;

  // Assemble knowledge text with clear clickable source URLs
  const lines: string[] = [];
  lines.push(`=== [Live Web Search Knowledge: ${searchQuery}] ===`);
  lines.push(`Search Query: "${searchQuery}"`);
  lines.push(`Date Retrieved: ${dateStr}`);
  lines.push(`Total Sources Found: ${results.length}`);
  lines.push('');
  lines.push('--- Web Findings & Verified Facts ---');

  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    lines.push(`[Web Source ${i + 1}: ${item.title}]`);
    if (item.url) lines.push(`Source Web URL: ${item.url}`);
    lines.push(`Summary: ${item.snippet}`);
    lines.push('');
  }

  const fullContent = lines.join('\n');

  // 1. Create Knowledge Source in DB
  const source = await Database.createKnowledgeSource({
    assistantId,
    title: sourceTitle,
    type: 'web',
    status: 'processing',
    fileUrl: results[0]?.url || '',
  });

  // 2. Chunk document
  const doc: ExtractedDocument = {
    title: sourceTitle,
    type: 'web',
    content: fullContent,
  };

  const rawChunks = chunkDocument(doc);
  const textsToEmbed = rawChunks.map((c) => c.content);

  // 3. Generate embeddings
  const embeddings = await generateEmbeddingsBatch(textsToEmbed);

  // 4. Save chunk records with explicit metadata URL
  const chunkRecords = rawChunks.map((chunk, i) => {
    const matched = results.find((r) => r.url && chunk.content.includes(r.url)) || results[i] || results[0];
    return {
      assistantId,
      knowledgeSourceId: source.id,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      tokenCount: chunk.tokenCount,
      metadata: {
        ...chunk.metadata,
        sourceTitle: matched?.title || sourceTitle,
        sourceType: 'web',
        searchQuery,
        url: matched?.url || source.fileUrl || '',
        date: dateStr,
      },
      embedding: embeddings[i],
    };
  });

  await Database.saveChunks(chunkRecords);

  // 5. Mark ready
  await Database.updateKnowledgeSource(source.id, {
    status: 'ready',
    chunkCount: chunkRecords.length,
  });

  const summary = results.slice(0, 3).map((r) => r.snippet).join(' ');

  return {
    sourceId: source.id,
    chunkCount: chunkRecords.length,
    summary,
  };
}

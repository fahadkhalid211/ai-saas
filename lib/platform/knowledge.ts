import type { ChunkRecord } from '@/lib/db';
import { GUIDES, type Guide } from './guides';
import { isAskAllQuery } from '@/lib/rag/ask-all';

/** Finding and presenting the hand-written guides. No network, no model: it works even when every AI provider is down. */

const STOP = new Set(['the', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'is', 'are', 'do', 'does', 'how', 'i', 'my', 'me', 'can', 'you', 'it', 'with', 'what', 'where', 'when', 'why', 'this', 'that', 'be', 'get', 'have', 'your', 'we', 'our', 'need', 'want', 'please', 'crescelo', 'about', 'if', 'from', 'at', 'as', 'by']);

const words = (t: string) => (t.toLowerCase().match(/[a-z0-9][a-z0-9.\-_+']*/g) || []).map((w) => w.replace(/^[.\-_']+|[.\-_']+$/g, '')).filter((w) => w && !STOP.has(w));

const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '');

interface Scored {
  guide: Guide;
  score: number;
}

/** Best-matching guides for a question, highest first. Keyword phrases count most, then title words, then body words. */
export function searchGuides(query: string, limit = 3): Scored[] {
  const q = (query || '').toLowerCase();
  const qWords = words(q);
  const qStems = new Set(qWords.map(stem));
  // Every word of the question, stop words included, for one-word keywords: those match whole words only ('ics' is not in 'topics').
  const qTokens = new Set((q.match(/[a-z0-9][a-z0-9.\-_+']*/g) || []).map((w) => w.replace(/^[.\-_']+|[.\-_']+$/g, '')));

  const scored: Scored[] = GUIDES.map((guide) => {
    let score = 0;
    for (const kw of guide.keywords) {
      const k = kw.toLowerCase();
      if (k.includes(' ') ? q.includes(k) : qTokens.has(k)) score += k.includes(' ') ? 7 : 5; // a phrase (substring) or a strong single word (whole word)
    }
    const titleStems = new Set(words(guide.title).map(stem));
    for (const s of qStems) if (titleStems.has(s)) score += 3;
    const kwStems = new Set(guide.keywords.flatMap((k) => words(k).map(stem)));
    for (const s of qStems) if (kwStems.has(s)) score += 2;
    const bodyStems = new Set(words(guide.body).map(stem));
    for (const s of qStems) if (bodyStems.has(s)) score += 0.5;
    return { guide, score };
  })
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

const linksOf = (g: Guide) => (g.links?.length ? `\n\n${g.links.map((l) => `[${l.label}](${l.href})`).join(' · ')}` : '');

/** A plain answer built only from the guides: used as the offline answer and as a safety net. */
export function answerFromGuides(query: string): string {
  const hits = searchGuides(query, 2);
  if (!hits.length) return overview();
  const [top, second] = hits;
  let out = `### ${top.guide.title}\n\n${top.guide.body}${linksOf(top.guide)}`;
  if (second && second.score >= top.score * 0.5) {
    out += `\n\n---\n\n**Related: ${second.guide.title}**\n\n${second.guide.body.split('\n\n')[0]}${linksOf(second.guide)}`;
  }
  return out;
}

export function overview(): string {
  const topics = ['Getting started', 'AI providers', 'Knowledge', 'Website', 'Booking', 'Leads', 'Channels', 'Team', 'Billing', 'Support', 'Security'] as const;
  const lines = topics.map((t) => `- **${t}**: ${GUIDES.filter((g) => g.category === t).map((g) => g.title).join('; ')}`);
  return `### I can walk you through any of this\n\n${lines.join('\n')}\n\nAsk in your own words, for example "how do I connect OpenAI?", "add the widget to WordPress" or "what does the Growth plan include?". For anything else, [open a support ticket](/support/contact).`;
}

/** The guides as text for a model's prompt: only the few that match the question, to keep the prompt short. */
export function guidesForPrompt(query: string, limit = 4): string {
  // "tell me everything" / "what can you do": a short digest of every guide (title and first paragraph) instead of four keyword matches
  if (isAskAllQuery(query)) {
    return GUIDES.map((g) => `## ${g.title}\n${g.body.split('\n\n')[0]}`).join('\n\n').slice(0, 9000);
  }
  const hits = searchGuides(query, limit);
  const chosen = hits.length ? hits.map((h) => h.guide) : GUIDES.filter((g) => ['what-is-crescelo', 'quick-start', 'dashboard-map'].includes(g.id));
  return chosen.map((g) => `## ${g.title}\n${g.body}${g.links?.length ? `\nLinks: ${g.links.map((l) => `${l.label} (${l.href})`).join(', ')}` : ''}`).join('\n\n');
}

/** The guides as knowledge chunks for the public "demo-assistant" (the assistant on the website itself). */
export function guideChunks(): ChunkRecord[] {
  return GUIDES.map((g, i) => ({
    id: `chunk_guide_${g.id}`,
    assistantId: 'demo-assistant',
    knowledgeSourceId: 'src_crescelo_guides',
    content: `${g.title}. ${g.body.replace(/\*\*/g, '').replace(/`/g, '')}${g.links?.length ? ` More: ${g.links.map((l) => `${l.label} at ${l.href}`).join('; ')}.` : ''}`,
    chunkIndex: i,
    tokenCount: Math.ceil(g.body.length / 4),
    metadata: { title: g.title, category: g.category.toLowerCase() },
    embedding: [],
    createdAt: '2026-09-25T00:00:00.000Z',
  })) as ChunkRecord[];
}

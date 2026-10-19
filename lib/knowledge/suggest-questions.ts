/**
 * Starter questions for "Try it out", written from what the assistant actually has in its knowledge base.
 *
 * They used to come from the assistant's saved `starterQuestions`, which are filled from an industry template when it is created
 * (a barbershop set, for example), so an assistant trained on a dental clinic's documents was offered haircut questions.
 *
 * Two ways, best first:
 *  1. the assistant's own AI engine writes them from a spread of passages (only when an engine is connected; the passages' language is kept);
 *  2. otherwise, or if that fails, they are built from the documents without any model: each topic is only offered when the text
 *     really talks about it (prices, opening hours, booking, delivery, ...), then the titles of the documents fill the rest.
 * With no documents there is nothing to ask about, so the list is empty.
 */

export interface SuggestChunk {
  knowledgeSourceId: string;
  content: string;
}

export interface SuggestSource {
  id: string;
  title: string;
  status?: string;
}

export type SuggestMethod = 'ai' | 'knowledge';

export const MAX_QUESTIONS = 4;

/** A topic the documents may cover, the words that show they do, and the question a customer would ask about it. */
const TOPICS: Array<{ id: string; test: RegExp; question: string }> = [
  { id: 'price', test: /\b(prices?|pricing|costs?|fees?|rates?|per (hour|session|month|night)|from [$€£]\s?\d)|[$€£]\s?\d/i, question: 'How much does it cost?' },
  { id: 'hours', test: /\b(opening hours|business hours|hours of operation|we are open|open (daily|every|monday|mon\b|from \d)|closed on)\b/i, question: 'What are your opening hours?' },
  { id: 'booking', test: /\b(book(ing|ed)?|appointments?|reserv(e|ation)s?|schedul(e|ing)|consultations?)\b/i, question: 'How do I book an appointment?' },
  { id: 'cancel', test: /\b(cancel(l)?ations?|re-?schedul(e|ing)|no-?show)\b/i, question: 'What is your cancellation policy?' },
  { id: 'location', test: /\b(address|located (at|in|on)|find us|directions|parking|our (office|studio|clinic|shop|store))\b/i, question: 'Where are you located?' },
  { id: 'returns', test: /\b(refunds?|returns?|exchanges?|money-?back|warranty|guarantee)\b/i, question: 'What is your return and refund policy?' },
  { id: 'shipping', test: /\b(shipping|deliver(y|ies)?|dispatch|postage)\b/i, question: 'How long does delivery take?' },
  { id: 'insurance', test: /\b(insurance|insured|coverage|covered by)\b/i, question: 'Do you accept insurance?' },
  { id: 'payment', test: /\b(payment methods?|pay (by|with|online)|invoice|deposit|instalments?|installments?)\b/i, question: 'What payment methods do you accept?' },
  { id: 'contact', test: /\b(contact us|call us|phone|e-?mail us|reach us|whatsapp)\b/i, question: 'How can I contact you?' },
  { id: 'services', test: /\b(our services|we offer|services include|packages?|treatments?|menu|programmes?|programs?)\b/i, question: 'What services do you offer?' },
];

/** "Services & Pricing 2026.pdf" -> "Services & Pricing 2026"; empty when the title says nothing (a bare domain, a file id). */
export function topicOfTitle(title: string): string {
  const t = (title || '')
    .replace(/\.[a-z0-9]{2,4}$/i, '')
    .replace(/^https?:\/\/(www\.)?/i, '')
    .split(/\s[-|:–—]\s/)[0]
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length < 4 || /^[a-z0-9-]{20,}$/i.test(t) || /^\d+$/.test(t)) return '';
  if (/^(untitled|document|description|business (info|information)|text)$/i.test(t)) return '';
  return t.slice(0, 50);
}

/** Questions built from the documents, no model involved. Only topics the text really covers; the strongest first. */
export function questionsFromKnowledge(sources: SuggestSource[], chunks: SuggestChunk[], limit = MAX_QUESTIONS): string[] {
  const usable = sources.filter((s) => s.status !== 'failed');
  if (!chunks.length) return [];
  const score = new Map<string, number>();
  for (const c of chunks) {
    for (const topic of TOPICS) if (topic.test.test(c.content)) score.set(topic.id, (score.get(topic.id) || 0) + 1);
  }
  const out: string[] = [];
  for (const topic of [...TOPICS].sort((a, b) => (score.get(b.id) || 0) - (score.get(a.id) || 0))) {
    if (!score.get(topic.id)) break;
    // "How do I book?" and "What is your cancellation policy?" are one theme: keep the list varied
    if (out.length < limit) out.push(topic.question);
  }
  // the documents' own names fill what the topics did not
  for (const s of usable) {
    if (out.length >= limit) break;
    const topic = topicOfTitle(s.title);
    if (topic) out.push(`What does ${topic} cover?`);
  }
  if (!out.length) out.push('What can you tell me about your business?');
  return [...new Set(out)].slice(0, limit);
}

/** A spread of passages from every source (not only the first), small enough for one cheap model call. */
export function samplePassages(sources: SuggestSource[], chunks: SuggestChunk[], maxChars = 3500): string {
  const bySource = new Map<string, SuggestChunk[]>();
  for (const c of chunks) bySource.set(c.knowledgeSourceId, [...(bySource.get(c.knowledgeSourceId) || []), c]);
  const titles = new Map(sources.map((s) => [s.id, s.title]));
  const per = Math.max(1, Math.floor(8 / Math.max(1, bySource.size)));
  const picked: string[] = [];
  for (const [id, list] of bySource) {
    // from the start, the middle and the end of a long source, not just its first lines
    const step = Math.max(1, Math.floor(list.length / per));
    for (let i = 0; i < list.length && picked.length < 12; i += step) {
      if (i / step >= per) break;
      picked.push(`(${titles.get(id) || 'document'}) ${list[i].content.replace(/\s+/g, ' ').slice(0, 450)}`);
    }
  }
  return picked.join('\n\n').slice(0, maxChars);
}

const clean = (q: string) => q.replace(/\s+/g, ' ').replace(/^["'\-–•\d.)\s]+/, '').trim();

/** Reads the model's reply (a JSON array of strings) and keeps only proper short questions. */
export function parseModelQuestions(reply: string, limit = MAX_QUESTIONS): string[] {
  const match = reply.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const list = JSON.parse(match[0]);
    if (!Array.isArray(list)) return [];
    return [...new Set(list.filter((q: unknown): q is string => typeof q === 'string').map(clean))]
      .filter((q) => q.length >= 8 && q.length <= 120 && /[?？]$/.test(q))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export const SUGGEST_SYSTEM_PROMPT =
  'You write starter questions for a customer-support chatbot. Given passages from the business\'s own documents, write exactly 4 short questions ' +
  'that a real customer of THIS business might ask and that the passages can answer. Cover different topics, one line each, no numbering. ' +
  'Write them in the same language as the passages. Never invent a topic that is not in the passages. Reply with only a JSON array of 4 strings.';

/**
 * The questions for an assistant. `complete` calls the assistant's own model (omit it, or let it throw, to use the no-model version).
 */
export async function suggestForAssistant(
  sources: SuggestSource[],
  chunks: SuggestChunk[],
  complete?: (system: string, passages: string) => Promise<string>
): Promise<{ questions: string[]; method: SuggestMethod }> {
  if (!chunks.length) return { questions: [], method: 'knowledge' };
  if (complete) {
    try {
      const passages = samplePassages(sources, chunks);
      const questions = parseModelQuestions(await complete(SUGGEST_SYSTEM_PROMPT, passages));
      if (questions.length >= 2) return { questions, method: 'ai' };
    } catch {
      /* no engine, busy or out of credit: build them from the documents instead */
    }
  }
  return { questions: questionsFromKnowledge(sources, chunks), method: 'knowledge' };
}

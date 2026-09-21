import { PLAYGROUND, type PipelineStage } from './content-extra';

/**
 * A small, real retrieval and booking engine for the on-page demo.
 * It runs entirely in the browser over the sample knowledge in content-extra.ts.
 * It mirrors the product's steps (understand, retrieve, rank, answer, act) but is a demo,
 * not the production pipeline.
 */

const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'you', 'i', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'it', 'my', 'me', 'can',
  'what', 'how', 'does', 'your', 'we', 'at', 'be', 'there', 'have', 'with', 'this', 'that', 'if', 'so', 'am', 'will', 'would', 'want',
]);

const stem = (w: string) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);

export function tokenize(text: string): string[] {
  const raw = text.toLowerCase().match(/[a-z0-9$-]+/g) ?? [];
  return raw.map((w) => w.replace(/^-+|-+$/g, '')).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);
}

function relatedOf(tokens: string[]): string[] {
  const out = new Set<string>();
  for (const group of PLAYGROUND.synonyms) {
    const g = group.map(stem);
    if (tokens.some((t) => g.includes(t))) {
      for (const w of g) if (!tokens.includes(w) && !w.includes(' ')) out.add(w);
    }
  }
  return [...out];
}

export interface Match {
  id: string;
  source: string;
  score: number;
  text: string;
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

export type Intent = 'greeting' | 'thanks' | 'book' | 'human' | 'question';

export interface TraceNote {
  stage: PipelineStage['id'];
  note: string;
}

export interface Reply {
  intent: Intent;
  text: string;
  source?: string;
  card?: 'booking';
  lead?: { email?: string; phone?: string };
  handover?: boolean;
  trace: TraceNote[];
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/;

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/\b(book|booking|appointment|schedule|reserve|reservation|slot|availability|available)\b/.test(t)) return 'book';
  if (/\b(human|person|someone|staff|agent|manager|real person)\b/.test(t)) return 'human';
  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t.trim())) return 'greeting';
  if (/\b(thanks|thank you|cheers)\b/.test(t)) return 'thanks';
  return 'question';
}

export function respond(message: string): Reply {
  const intent = detectIntent(message);
  const tokens = tokenize(message);
  const related = relatedOf(tokens);
  const email = message.match(EMAIL)?.[0];
  const phone = message.match(PHONE)?.[0];
  const lead = email || phone ? { email, phone } : undefined;

  const trace: TraceNote[] = [
    { stage: 'input', note: `Received ${message.trim().length} characters. Intent looks like "${intent}".` },
    {
      stage: 'embed',
      note: tokens.length
        ? `Keywords: ${tokens.slice(0, 6).join(', ')}${related.length ? `. Related words added: ${related.slice(0, 5).join(', ')}` : ''}.`
        : 'No searchable keywords in this message.',
    },
  ];

  const base = { intent, trace, lead } as const;
  const leadNote = lead ? ` Contact details spotted (${[email && 'email', phone && 'phone'].filter(Boolean).join(' and ')}) and saved as a lead.` : '';

  if (intent === 'greeting' || intent === 'thanks') {
    trace.push(
      { stage: 'retrieve', note: 'Nothing to look up for this message.' },
      { stage: 'rerank', note: 'Skipped.' },
      { stage: 'answer', note: 'Short reply, no source needed.' },
      { stage: 'action', note: 'No action.' + leadNote }
    );
    return {
      ...base,
      text: intent === 'greeting' ? `Hi! I'm the ${PLAYGROUND.business} assistant. Ask about prices, hours or booking.` : 'You are welcome! Anything else I can help with?',
    };
  }

  if (intent === 'human') {
    trace.push(
      { stage: 'retrieve', note: 'Skipped: the visitor asked for a person.' },
      { stage: 'rerank', note: 'Skipped.' },
      { stage: 'answer', note: 'Handover message prepared.' },
      { stage: 'action', note: 'Team notified with the conversation so far.' + leadNote }
    );
    return { ...base, handover: true, text: 'Of course. I have asked a team member to join this chat and they can see everything we have said.' };
  }

  // Retrieval over the sample knowledge: exact hits count fully, related words count less.
  const scored: Match[] = PLAYGROUND.knowledge
    .map((k) => {
      const words = new Set(tokenize(k.text + ' ' + k.source));
      let raw = 0;
      for (const t of tokens) if (words.has(t)) raw += 1;
      for (const r of related) if (words.has(r)) raw += 0.6;
      const score = tokens.length ? Math.min(1, raw / (tokens.length + 0.5)) : 0;
      return { id: k.id, source: k.source, score, text: k.text };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.filter((m) => m.score > 0).slice(0, 3);
  trace.push({
    stage: 'retrieve',
    note: top.length
      ? `Searched ${scored.length} passages. Best: ${top.map((m) => `${m.source} ${m.score.toFixed(2)}`).join(', ')}.`
      : `Searched ${scored.length} passages. No passage matched.`,
  });

  const seen = new Set<string>();
  const ranked = top.filter((m) => {
    if (seen.has(m.source)) return false;
    seen.add(m.source);
    return true;
  });
  trace.push({
    stage: 'rerank',
    note: ranked.length
      ? `Kept ${ranked.length}${top.length !== ranked.length ? `, removed ${top.length - ranked.length} duplicate source` : ''}. Leading passage: ${ranked[0].source}.`
      : 'Nothing to rank.',
  });

  if (intent === 'book') {
    trace.push(
      { stage: 'answer', note: 'The visitor wants to book, so the reply offers a booking card.' },
      { stage: 'action', note: `Opening hours read from the knowledge base. Offering open slots and re-checking the chosen one before confirming.${leadNote}` }
    );
    return { ...base, card: 'booking', text: `Happy to help you book. Pick a service, a day and a time. Our hours: ${PLAYGROUND.hours}.` };
  }

  const best = ranked[0];
  if (!best || best.score < 0.28) {
    trace.push(
      { stage: 'answer', note: 'Confidence too low. The assistant says it does not know instead of guessing.' },
      { stage: 'action', note: 'Question logged as unanswered so the team can add it to the knowledge.' + leadNote }
    );
    return {
      ...base,
      text: "I don't have that in my knowledge, so I won't guess. I've logged the question for the team. Would you like me to bring in a person?",
    };
  }

  const wanted = new Set([...tokens, ...related]);
  const sents = sentences(best.text);
  const scoredSents = sents.map((s, i) => ({ s, i, n: tokenize(s).filter((w) => wanted.has(w)).length }));
  const chosen = scoredSents
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 2)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
  const text = (chosen.length ? chosen : sents.slice(0, 2)).join(' ');

  trace.push(
    { stage: 'answer', note: `Reply written only from "${best.source}". Source attached.` },
    { stage: 'action', note: 'No booking needed for this question.' + leadNote }
  );
  return { ...base, text, source: best.source };
}

/* ------------------------------ Booking ------------------------------ */

export interface Service {
  id: string;
  name: string;
  minutes: number;
  price: number;
}

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Deterministic pseudo-random so the same slot looks taken every time within a demo. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function openDays(count = 7): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; out.length < count && i < 21; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    if (x.getDay() !== 0) out.push(x); // closed on Sundays
  }
  return out;
}

export function slotsFor(date: Date, service: Service, booked: Set<string>, now = new Date()): { time: string; taken: boolean }[] {
  const closeHour = date.getDay() === 6 ? 16 : 17;
  const key = dayKey(date);
  const out: { time: string; taken: boolean }[] = [];
  for (let mins = 9 * 60; mins + service.minutes <= closeHour * 60; mins += 30) {
    const time = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    const start = new Date(date);
    start.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    if (start.getTime() < now.getTime() + 30 * 60 * 1000) continue;
    const taken = hash(`${key}${time}`) % 100 < 32 || booked.has(`${key} ${time}`);
    out.push({ time, taken });
  }
  return out;
}

export function makeIcs(opts: { name: string; start: Date; minutes: number; service: string }): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(opts.start.getTime() + opts.minutes * 60000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kortex//Demo//EN',
    'BEGIN:VEVENT',
    `UID:${hash(opts.start.toISOString() + opts.name)}@kortex-demo`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts.service} at ${PLAYGROUND.business} (demo)`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.length <= 254;

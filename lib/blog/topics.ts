import { PUBLISHED_INDEX } from './index';
import type { BlogCard } from './card';
import { OFF_TOPIC_CLUSTER_IDS } from './taxonomy';

/**
 * The Knowledge Hub's topics as pages of their own (/blog/topic/<slug>): a real address, a heading and a short introduction for each
 * subject, so a search for "AI appointment booking guides" can land on the subject and not only on the hub with its browser-side filter.
 */

export interface BlogTopic {
  id: number;
  name: string;
  slug: string;
  count: number;
  /** Not about a website assistant for service businesses: the page is kept out of search results and the sitemap. */
  offTopic: boolean;
  intro: string;
}

const INTROS: Record<number, string> = {
  1: 'How AI website assistants work, what they cost, where they fail and how to launch one that answers from your own content.',
  2: 'Online booking inside a chat: live slots, double-booking prevention, confirmations, reminders and rescheduling.',
  3: 'Capturing and routing leads from your website: what to ask, when to ask it and how to deliver leads to your team quickly.',
  4: 'Turning more website visitors into enquiries and bookings: friction, speed to reply, price questions and proactive chat.',
  5: 'AI receptionists for service businesses: what they handle, when a person should step in and how to set the tone.',
  6: 'Chat and booking for local service businesses: opening hours, service areas, local search and reviews.',
  7: 'Booking, no-shows, walk-ins and price questions for barbershops, salons and spas.',
  8: 'Patient enquiries, scheduling, intake and privacy for dental practices.',
  9: 'Estimates, emergencies and job intake for roofers, plumbers, electricians and other home-service companies.',
  10: 'Intake, consultation booking and confidentiality for law firms, accountants and advisers.',
  11: 'Qualifying buyers and tenants, scheduling viewings and answering listing questions for real estate.',
  12: 'Client intake, discovery calls and scheduling for consultants and coaches.',
  13: 'The technology behind a website chatbot: models, streaming, security and bring-your-own-key.',
  14: 'Knowledge bases and retrieval-augmented generation (RAG): how an assistant finds the right passage and how to keep it accurate.',
  15: 'Side-by-side comparisons of chat, booking and assistant tools for service businesses.',
  16: 'Step-by-step guides to setting up, training and launching an assistant on your website.',
  17: 'Making chat a good experience: tone, handover, accessibility, languages and trust.',
  18: 'Getting more from online booking: slot rules, reminders, cancellations and waitlists.',
  19: 'Measuring what your assistant does: conversations, unanswered questions, conversion and cost.',
  20: 'Automating follow-ups, routing and workflows around the assistant.',
  21: 'General small-business operations articles (email authentication, backups, SOPs). Not specific to Crescelo.',
  22: 'Articles for job seekers and recruiters about AI in hiring. Not about Crescelo, which is a website assistant for service businesses.',
};

const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function build(): BlogTopic[] {
  const map = new Map<number, { name: string; count: number }>();
  for (const p of PUBLISHED_INDEX) {
    if (p.clusterId === undefined || !p.clusterName) continue;
    const cur = map.get(p.clusterId) || { name: p.clusterName, count: 0 };
    cur.count += 1;
    map.set(p.clusterId, cur);
  }
  return [...map.entries()]
    .map(([id, v]) => ({ id, name: v.name, slug: slugify(v.name), count: v.count, offTopic: OFF_TOPIC_CLUSTER_IDS.has(id), intro: INTROS[id] || `Guides on ${v.name.toLowerCase()}.` }))
    .sort((a, b) => a.id - b.id);
}

export const BLOG_TOPICS: BlogTopic[] = build();
export const INDEXED_TOPICS: BlogTopic[] = BLOG_TOPICS.filter((t) => !t.offTopic);
export const topicBySlug = (slug: string): BlogTopic | undefined => BLOG_TOPICS.find((t) => t.slug === slug);
export const topicForCard = (c: Pick<BlogCard, 'clusterId'>): BlogTopic | undefined => BLOG_TOPICS.find((t) => t.id === c.clusterId);
export const cardsInTopic = (t: BlogTopic): BlogCard[] =>
  PUBLISHED_INDEX.filter((p) => p.clusterId === t.id).sort((a, b) => b.dateModified.localeCompare(a.dateModified) || a.title.localeCompare(b.title));

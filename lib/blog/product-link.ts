/**
 * Which product feature page an article is closest to, so every article ends by pointing at the page that sells what it discusses
 * (an article about no-shows links to appointment booking, one about RAG links to the knowledge base). Keyword rules on the slug,
 * title and tags; falls back to the main assistant page.
 */
const RULES: [RegExp, string][] = [
  [/whatsapp|telegram|omnichannel|inbox|messaging/, 'messaging-channels'],
  [/handover|hand-over|escalat|takeover|take-over|frustrat|de-escalat/, 'human-handover'],
  [/book|appointment|calendar|no-show|schedul|reminder|reschedul|slot|double/, 'appointment-booking'],
  [/lead|intake|enquir|inquir|qualif|capture|crm|conversion|contact-us|form/, 'lead-capture'],
  [/knowledge|rag\b|retriev|embedding|vector|train|document|ground|hallucin|ingest|scrap/, 'knowledge-base'],
  [/widget|embed|wordpress|install|deploy|mobile|install|script/, 'website-widget'],
];

export function productFeatureFor(slug: string, title: string, tags: string[] = []): string {
  const text = `${slug} ${title} ${tags.join(' ')}`.toLowerCase();
  for (const [re, feature] of RULES) if (re.test(text)) return feature;
  return 'ai-assistant';
}

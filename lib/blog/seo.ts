import type { BlogBlock, BlogPost } from './posts';

/**
 * Search-result presentation for blog posts, derived from the post data so it keeps working when the posts are regenerated:
 * a title and description that fit Google's display limits, an excerpt that reads as a sentence, and one or two reputable
 * outside sources per article (search engines and readers trust articles that cite their sources).
 */

const BRAND = 'Crescelo';
const TITLE_MAX = 60;
const DESC_MAX = 158;
const TRAILING_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'with', 'in', 'on', 'your', 'that', 'by', 'from', 'at', 'is', 'are']);

function trimTrailingFiller(text: string): string {
  const words = text.split(/\s+/);
  while (words.length > 3 && TRAILING_WORDS.has(words[words.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) words.pop();
  return words.join(' ').replace(/[\s,;:\-–—]+$/, '');
}

/** The <title> text: the article title shortened at a natural break so it is not cut off in results. */
export function seoTitle(post: Pick<BlogPost, 'title'>): string {
  const title = post.title.trim();
  const withBrand = (t: string) => (t.length + BRAND.length + 3 <= TITLE_MAX + 4 ? `${t} | ${BRAND}` : t);
  if (title.length <= TITLE_MAX) return withBrand(title);

  const colon = title.indexOf(':');
  if (colon >= 25 && colon <= TITLE_MAX) return withBrand(title.slice(0, colon).trim());

  // cut before a trailing prepositional phrase ("... for Small Businesses", "... with Grounded Data")
  const breaks = [' with ', ' for ', ' to ', ' in ', ' on ', ' and ', ' without ', ' using ', ' that ', ' from '];
  let best = '';
  for (const b of breaks) {
    let i = title.indexOf(b, 20);
    while (i !== -1) {
      const head = title.slice(0, i).trim();
      if (head.length <= TITLE_MAX && head.length > best.length) best = head;
      i = title.indexOf(b, i + 1);
    }
  }
  if (best.length >= 28) return withBrand(best);

  return withBrand(trimTrailingFiller(title.slice(0, TITLE_MAX + 1).replace(/\s+\S*$/, '')));
}

/** Meta description that ends on a whole sentence or word, never mid-thought and never with "...". */
export function seoDescription(text: string): string {
  const clean = text.replace(/\s+/g, ' ').replace(/\.\.\.$/, '').trim();
  if (clean.length <= DESC_MAX) return clean;
  const cut = clean.slice(0, DESC_MAX + 1);
  const sentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentence >= 90) return cut.slice(0, sentence + 1);
  const word = trimTrailingFiller(cut.replace(/\s+\S*$/, '').replace(/[.,;:]+$/, ''));
  return word.endsWith('.') ? word : `${word}.`;
}

interface Source {
  label: string;
  url: string;
  note: string;
}

const SRC = {
  ico: { label: 'ICO: lawful basis for processing personal data', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/', note: 'The UK regulator’s plain-English guide.' },
  eu: { label: 'European Commission: data protection', url: 'https://commission.europa.eu/law/law-topic/data-protection_en', note: 'How EU data protection rules work.' },
  aiact: { label: 'EU AI Act, Article 50: transparency obligations', url: 'https://artificialintelligenceact.eu/article/50/', note: 'When people must be told they are talking to an AI.' },
  rag: { label: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)', url: 'https://arxiv.org/abs/2005.11401', note: 'The original research paper behind retrieval-augmented generation.' },
  wcag: { label: 'W3C: Web Content Accessibility Guidelines (WCAG)', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', note: 'The accessibility standard for websites.' },
  vitals: { label: 'web.dev: Core Web Vitals', url: 'https://web.dev/articles/vitals', note: 'How Google measures page speed and stability.' },
  helpful: { label: 'Google Search Central: creating helpful, people-first content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content', note: 'What Google looks for in useful pages.' },
  seo: { label: 'Google Search Central: SEO starter guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide', note: 'The basics of being found in search.' },
  local: { label: 'Google Business Profile Help: improve your local ranking', url: 'https://support.google.com/business/answer/7091', note: 'Ranking factors for local businesses.' },
  calendar: { label: 'Google Calendar API overview', url: 'https://developers.google.com/calendar/api/guides/overview', note: 'How calendar events are read and written by software.' },
  owaspllm: { label: 'OWASP Top 10 for Large Language Model Applications', url: 'https://genai.owasp.org/llm-top-10/', note: 'The main security risks of AI assistants, including prompt injection.' },
  owasp: { label: 'OWASP Top 10 web application security risks', url: 'https://owasp.org/www-project-top-ten/', note: 'The most common web security problems.' },
  openai: { label: 'OpenAI API documentation', url: 'https://platform.openai.com/docs/overview', note: 'Models, pricing and limits for the OpenAI API.' },
  anthropic: { label: 'Anthropic Claude API documentation', url: 'https://docs.anthropic.com/en/docs/welcome', note: 'Models and usage of the Claude API.' },
  gemini: { label: 'Google Gemini API documentation', url: 'https://ai.google.dev/gemini-api/docs', note: 'Models and usage of the Gemini API.' },
  sse: { label: 'MDN: Server-sent events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events', note: 'How servers stream updates to a browser.' },
  ws: { label: 'MDN: WebSockets API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', note: 'Two-way real-time connections in the browser.' },
  schema: { label: 'Google Search Central: structured data introduction', url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data', note: 'How structured data improves search results.' },
  ftc: { label: 'FTC: business guidance on AI and advertising claims', url: 'https://www.ftc.gov/business-guidance/advice-guidance', note: 'US guidance on honest AI claims.' },
} satisfies Record<string, Source>;

/** Picks up to two sources that fit the article's subject, always ending with a general one so every post cites at least one. */
export function sourcesFor(post: Pick<BlogPost, 'title' | 'primaryKeyword' | 'secondaryKeywords' | 'clusterName' | 'slug' | 'tags'>): Source[] {
  const hay = `${post.title} ${post.primaryKeyword || ''} ${(post.secondaryKeywords || []).join(' ')} ${post.clusterName || ''} ${post.slug} ${(post.tags || []).join(' ')}`.toLowerCase();
  const has = (re: RegExp) => re.test(hay);
  const picked: Source[] = [];
  const add = (s: Source) => {
    if (!picked.includes(s) && picked.length < 2) picked.push(s);
  };

  if (has(/gdpr|privacy|consent|data protection|personal data|cookie|ccpa|compliance|retention/)) {
    add(SRC.ico);
    add(SRC.eu);
  }
  if (has(/disclos|transparen|ai act|regulat/)) add(SRC.aiact);
  if (has(/prompt injection|jailbreak|security|encrypt|secure|threat|attack|abuse/)) add(SRC.owaspllm);
  if (has(/\brag\b|retrieval|embedding|vector|hallucinat|grounded|knowledge base|chunk|rerank|semantic/)) add(SRC.rag);
  if (has(/accessib|wcag|screen reader/)) add(SRC.wcag);
  if (has(/sse|streaming/)) add(SRC.sse);
  if (has(/websocket/)) add(SRC.ws);
  if (has(/openai|gpt/)) add(SRC.openai);
  if (has(/anthropic|claude/)) add(SRC.anthropic);
  if (has(/gemini|google ai/)) add(SRC.gemini);
  if (has(/byok|bring your own key|api key|llm/)) add(SRC.openai);
  if (has(/calendar|outlook|google calendar|scheduling|double.?book|booking|appointment/)) add(SRC.calendar);
  if (has(/schema|structured data|seo|search|ranking|organic|visibility/)) add(SRC.schema);
  if (has(/local|near me|map|google business/)) add(SRC.local);
  if (has(/mobile|speed|performance|core web|latency|load/)) add(SRC.vitals);
  if (has(/claims|advertis|marketing|trust/)) add(SRC.ftc);
  if (has(/web app|widget|embed|cross-site|xss|csrf/)) add(SRC.owasp);
  add(SRC.helpful);
  return picked;
}

/** Appends a "Further reading" section (with real outside sources) unless the post already cites one. */
export function withFurtherReading(body: BlogBlock[], post: Parameters<typeof sourcesFor>[0]): BlogBlock[] {
  const text = JSON.stringify(body);
  if (/\]\(https?:\/\//.test(text) || body.some((b) => b.type === 'h2' && b.id === 'further-reading')) return body;
  const sources = sourcesFor(post);
  if (!sources.length) return body;
  return [
    ...body,
    { type: 'h2', text: 'Further reading', id: 'further-reading' },
    { type: 'ul', items: sources.map((s) => `[${s.label}](${s.url}): ${s.note}`) },
  ];
}

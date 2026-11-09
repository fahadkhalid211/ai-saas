import type { MetadataRoute } from 'next';
import { SITE } from '@/components/marketing/content';

/**
 * What crawlers may read.
 *
 * Disallowed: the API, the signed-in product, the master console, embeds and the partner portal's private screens. Those have no search value.
 * Deliberately NOT disallowed: /login and /support/ticket. They carry a `noindex` tag, and a crawler can only obey a `noindex` it is
 * allowed to read; blocking them in this file would let their many `?mode=register&plan=...` links be listed without a description.
 *
 * AI crawlers are named so the decision is on record rather than implied. The public marketing site, pricing, roadmap and articles are
 * what we want AI assistants and AI search to read and quote accurately, so they are allowed (both the ones that fetch pages to answer a
 * question and the ones that collect training data). To opt out of training use, move GPTBot, ClaudeBot, Google-Extended, CCBot and
 * Applebot-Extended into a rule with `disallow: '/'`; search and answer crawlers can stay allowed.
 */
const PRIVATE = ['/api/', '/dashboard', '/master', '/embed/', '/admin', '/ref/', '/referral/dashboard', '/verify-email', '/reset-password', '/connect/', '/media/internal/'];

const AI_ANSWER_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'DuckAssistBot', 'MistralAI-User'];
const AI_TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Applebot-Extended', 'Meta-ExternalAgent'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_ANSWER_BOTS, allow: '/', disallow: PRIVATE },
      { userAgent: AI_TRAINING_BOTS, allow: '/', disallow: PRIVATE },
      // A scraper that is known to ignore crawl rules and sends no visitors.
      { userAgent: 'Bytespider', disallow: '/' },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

import { PUBLISHED_INDEX } from './index';
import { CANONICAL_ELSEWHERE, isIndexable } from './indexing';
import { NOT_CRAWLED_SLUGS } from './not-indexed';

/**
 * When each article is submitted to search engines (put in the sitemap).
 *
 * All 275 articles appeared on one day, and Google read very few of them. So the sitemap starts with the core pages only and gains
 * a few articles every day. The articles Google has not crawled yet come first (in the order of the article index, product topics
 * first), then the ones it already has. Nothing is hidden or removed: every article stays live, and an article Google already has
 * stays in its index whether or not it is in the sitemap. Only the sitemap is paced.
 *
 * To go faster or slower change ARTICLES_PER_DAY; to start later change FIRST_RELEASE.
 */
export const FIRST_RELEASE = '2026-10-24';
export const ARTICLES_PER_DAY = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The articles that were in the sitemap on 26 Oct 2026 (the first three days). They stay first, in this order, whatever the lists
 * change later, so an article Google was told about is never dropped from the sitemap or moved to a later day.
 */
const ALREADY_SUBMITTED = [
  'sync-ai-booking-google-outlook-calendar',
  'cost-estimators-vs-conversational-lead-capture',
  'chat-behavior-lead-scoring',
  'why-contact-us-forms-fail',
  'live-human-handover-flow-design',
  'train-ai-receptionist-service-catalog',
  'brand-voice-alignment-ai-receptionist',
  'local-service-business-tech-stack',
  'stylist-preferences-chair-allocation-chat',
  'eliminate-salon-no-shows-automated-reminders',
  'upselling-salon-treatments-chat',
  'pediatric-dental-inquiries-chat',
  'electrician-service-call-scheduling-chat',
  'podcast-guest-pitch-intake-automation',
  'visitor-capability-tokens-hmac-sha256',
];

export const NEW_DAILY_SCHEDULE_SLUGS = [
  '24-7-website-chat-small-business-lead-guide',
  '5-ways-automated-website-responses-save-small-businesses-time',
  'what-is-an-after-hours-website-assistant',
  'ai-chatbot-vs-live-chat-comparison-2027',
  'how-chatbot-for-appointment-booking-fills-calendar',
  'how-to-decide-between-live-chat-and-ai-assistant',
  'how-to-reduce-appointment-no-shows-service-business',
  'how-automated-booking-confirmation-reduces-no-shows',
  'top-appointment-reminder-software-tools-compared',
  'how-to-capture-more-leads-from-small-business-website',
  '8-ways-to-convert-website-visitors-to-leads-2026',
  'how-lead-capture-chatbot-grows-service-business',
  'how-ai-chatbot-for-barbershops-fills-chair',
  'best-barbershop-booking-software-2027-comparison',
  'best-automated-booking-tools-hair-salons-2027',
  'how-ai-assistant-for-contractors-captures-jobs-on-site',
  'how-chatbot-for-roofing-companies-captures-estimate-leads',
  'best-home-service-lead-capture-tools-2027',
  'why-roofing-companies-use-chatbots-to-win-jobs',
  'how-service-businesses-stop-losing-after-hours-leads',
  'real-cost-of-missed-calls-small-businesses-2027',
  'why-your-website-is-losing-leads-and-how-to-fix-it',
  'how-ai-chatbot-for-law-firms-qualifies-leads',
  'what-should-a-law-firm-website-assistant-do',
  'how-to-automate-client-intake-for-lawyers',
];

/** Slugs in release order: indexable articles only (the held-back ones in lib/blog/indexing.ts are never submitted). */
const submittable = PUBLISHED_INDEX.filter((p) => isIndexable(p.slug) && !CANONICAL_ELSEWHERE[p.slug]).map((p) => p.slug);
const rest = submittable.filter((s) => !ALREADY_SUBMITTED.includes(s) && !NEW_DAILY_SCHEDULE_SLUGS.includes(s));
const ORDER: string[] = [
  ...ALREADY_SUBMITTED.filter((s) => submittable.includes(s)),
  ...NEW_DAILY_SCHEDULE_SLUGS.filter((s) => submittable.includes(s)),
  ...rest.filter((s) => NOT_CRAWLED_SLUGS.has(s)),
  ...rest.filter((s) => !NOT_CRAWLED_SLUGS.has(s)),
];

/** The day (UTC midnight) an article joins the sitemap, or null if it is never submitted. */
export function releaseDate(slug: string): Date | null {
  const i = ORDER.indexOf(slug);
  if (i < 0) return null;
  return new Date(new Date(FIRST_RELEASE).getTime() + Math.floor(i / ARTICLES_PER_DAY) * DAY_MS);
}

/** The articles that may be in the sitemap at this moment. */
export function releasedSlugs(now: Date = new Date()): string[] {
  const start = new Date(FIRST_RELEASE).getTime();
  if (now.getTime() < start) return [];
  const days = Math.floor((now.getTime() - start) / DAY_MS) + 1;
  return ORDER.slice(0, days * ARTICLES_PER_DAY);
}

/** The day the last article joins the sitemap. */
export function lastReleaseDate(): Date | null {
  return ORDER.length ? releaseDate(ORDER[ORDER.length - 1]) : null;
}

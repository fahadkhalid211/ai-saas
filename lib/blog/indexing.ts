import { NOT_CRAWLED_SLUGS } from './not-indexed';

/**
 * Which articles are kept out of search results for now.
 *
 * Google had read very few of the 275 articles that appeared in one day on a new domain, and the ones it skipped were mostly these.
 * Only articles Google has NOT crawled yet (lib/blog/not-indexed.ts) can be held back: an article Google already has is never touched,
 * even if it matches a pattern below. Held-back articles stay live and linked; they only carry `noindex` and are left out of the
 * sitemap, so the crawl goes to the articles about the product first. To bring one back, delete its entry here (or loosen the pattern).
 */

/** "How to grow a med spa in Miami with AI": the same article repeated for each city, which Google treats as near-duplicate. */
const CITY_PAGE = /^how-to-grow-an?-.+-in-.+-with-ai$/;

/** Advice for people applying for jobs. It does not match what the site is about (a website assistant for service businesses). */
const JOB_SEEKER_SLUGS = new Set([
  'is-it-legal-to-use-ai-chatbots-for-hiring',
  'ai-screening-vs-human-recruiters-cost-comparison',
  'how-ai-chatbots-screen-job-applications',
  'words-to-avoid-in-ai-job-application-chatbots',
  'what-to-expect-in-ai-chatbot-job-interview',
  'can-ai-chatbots-reject-you-before-human-reviews-resume',
  'are-ai-job-application-bots-making-hiring-harder',
  'should-you-use-ai-bot-to-apply-to-jobs-mass-applications',
  'how-to-optimize-resume-for-ai-chatbot-screening-2026',
  'how-accurate-are-ai-chatbots-at-evaluating-job-fit',
  'what-happens-after-ai-chatbot-approves-your-application',
  'what-personal-information-do-job-chatbots-collect-privacy',
  'can-ai-chatbots-replace-human-recruiters-completely',
  'can-ai-chatbots-tell-if-youre-lying-on-your-application',
  'top-complaints-about-ai-job-application-bots-how-to-fix',
  'do-ai-chatbots-consider-soft-skills-in-job-applications',
  'what-should-you-say-to-an-ai-chatbot-during-job-interviews',
  'which-companies-use-ai-chatbots-to-screen-applicants',
  'how-long-does-ai-chatbot-take-to-screen-application-timeline',
  'how-to-recover-from-ai-chatbot-job-rejection',
  'how-do-ai-chatbots-handle-employment-gaps-on-resume',
  'how-to-stand-out-to-ai-chatbot-during-job-applications',
  'are-ai-chatbots-better-or-worse-than-human-recruiters',
  'how-ai-chatbots-are-changing-the-job-application-process',
  'what-job-seekers-must-know-about-ai-screening-systems',
  'does-using-ai-to-apply-for-jobs-actually-work',
  'how-to-tell-if-a-company-uses-ai-chatbots-for-hiring',
  'should-you-be-honest-with-ai-chatbots-during-job-applications',
]);

/** True when the article may appear in search results and the sitemap. */
export function isIndexable(slug: string): boolean {
  if (!NOT_CRAWLED_SLUGS.has(slug)) return true;
  return !CITY_PAGE.test(slug) && !JOB_SEEKER_SLUGS.has(slug);
}

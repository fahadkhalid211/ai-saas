import { JOB_SEEKER_SLUGS } from './indexing';

/**
 * One clean list of topics for the Knowledge Hub. The articles were written in batches that each named their own cluster, which left
 * two names for lead capture ("Lead Generation" and "AI Lead Capture", with different counts), law-firm articles under "Knowledge
 * Base & RAG", and fourteen articles in no topic at all (listed as "More guides"). This puts every article in exactly one topic.
 */

export interface Topic {
  id: number;
  name: string;
}

/** Topics for articles that are not about a website assistant for service businesses. They are kept apart so the hub can list them last. */
export const OFF_TOPIC_CLUSTER_IDS: ReadonlySet<number> = new Set([21, 22]);

const HIRING: Topic = { id: 22, name: 'Hiring & Recruiting' };
const OPERATIONS: Topic = { id: 21, name: 'Small Business Operations' };

/** Generic business-IT and operations articles (email authentication, backups, SOPs). Not about the product. */
const OPERATIONS_SLUGS = new Set([
  'how-to-choose-saas-software-small-business',
  'how-to-set-up-spf-dkim-dmarc-business-email',
  'how-to-back-up-business-data-3-2-1-rule',
  'how-to-create-customer-onboarding-process',
  'how-to-write-standard-operating-procedures-sops',
]);

/** Cluster names that duplicate or contradict another one, and the topic they belong to. */
const RENAMED: Record<string, Topic> = {
  'AI Lead Capture': { id: 3, name: 'Lead Generation' },
  'AI Knowledge Base & RAG': { id: 10, name: 'Professional Services' },
};

/** The topic of an article, whatever its source file called it. */
export function topicFor(slug: string, clusterId?: number, clusterName?: string): Topic | undefined {
  if (JOB_SEEKER_SLUGS.has(slug)) return HIRING;
  if (OPERATIONS_SLUGS.has(slug)) return OPERATIONS;
  if (clusterName && RENAMED[clusterName]) return RENAMED[clusterName];
  if (clusterId !== undefined && clusterName) return { id: clusterId, name: clusterName };
  // the one article about bringing your own AI key that was left without a topic
  if (slug === 'bring-your-own-ai-key-byok-explained') return { id: 13, name: 'Chatbot Technology' };
  return undefined;
}

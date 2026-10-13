import { Database } from '@/lib/db';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { serviceBlocked } from '@/lib/billing/trial';

/**
 * The same limits the dashboard upload applies, for content that arrives from the WordPress plugin: a workspace whose
 * trial is over gets no new knowledge, and the plan's knowledge storage cannot be exceeded. Returns an error message to
 * send back, or null when the content may be stored.
 */
export async function wordpressKnowledgeBlock(
  assistant: { workspaceId?: string | null },
  incomingBytes: number,
): Promise<{ status: 402 | 403; error: string } | null> {
  const workspaceId = assistant.workspaceId || 'default-workspace';
  const billing = await Database.getWorkspaceBilling(workspaceId);
  if (serviceBlocked(billing)) {
    return { status: 402, error: 'This workspace needs an active plan before more content can be added.' };
  }
  const plan = BILLING_PLANS.find((p) => p.id === billing.planId) || BILLING_PLANS[0];
  const limitBytes = plan.knowledgeStorageLimitMb * 1024 * 1024;
  const used = await Database.getWorkspaceKnowledgeStorage(workspaceId);
  if (used.totalBytes + Math.max(0, incomingBytes) > limitBytes) {
    return {
      status: 403,
      error: `Knowledge storage limit reached: the ${plan.name} plan includes ${plan.knowledgeStorageLimitMb} MB. Upgrade the plan or remove content to sync more.`,
    };
  }
  return null;
}

import { Database } from '@/lib/db';
import { cancelSubscription, isApiConfigured, sandboxAllowed } from '@/lib/billing/lemonsqueezy';

export type DeleteAccountResult = { ok: true; assistants: number; people: number } | { ok: false; status: number; error: string };

/**
 * Permanently deletes a workspace and all its data. A live paid subscription is cancelled first, so nobody keeps being charged
 * for an account that no longer exists: if it cannot be cancelled, nothing is deleted and the person is told what to do.
 */
export async function deleteWorkspaceAndBilling(workspaceId: string): Promise<DeleteAccountResult> {
  const state = await Database.getState();
  const ws = (state.workspaces || []).find((w: any) => w.id === workspaceId);
  if (!ws) return { ok: false, status: 404, error: 'That account no longer exists.' };
  if (workspaceId === 'default-workspace') return { ok: false, status: 400, error: 'This built-in workspace cannot be deleted.' };

  const subscriptionId: string | undefined = ws.billingSubscriptionId;
  const isSimulated = !subscriptionId || subscriptionId.startsWith('sandbox_');
  if (!isSimulated) {
    const stopError =
      'We could not cancel the subscription with our payment provider, so nothing was deleted. Cancel it under Plans & Billing > Manage subscription, then delete the account.';
    if (!isApiConfigured()) {
      if (!sandboxAllowed()) return { ok: false, status: 502, error: stopError };
    } else {
      try {
        await cancelSubscription(subscriptionId as string);
      } catch (err) {
        console.error('[AccountDeletion] could not cancel the subscription:', (err as Error)?.message);
        return { ok: false, status: 502, error: stopError };
      }
    }
  }

  const removed = await Database.deleteWorkspaceCascade(workspaceId);
  if (!removed) return { ok: false, status: 404, error: 'That account no longer exists.' };
  return { ok: true, ...removed };
}

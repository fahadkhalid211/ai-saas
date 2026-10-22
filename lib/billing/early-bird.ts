import { isBillingConfigured, sandboxAllowed } from './lemonsqueezy';
import { trialInfo, type TrialFields } from './trial';

/**
 * Launch offer: while card payments are not connected (or when EARLY_BIRD_TRIALS=true), a new workspace can start its 14-day
 * trial without a card. It is offered once per workspace, only before any trial has started. Paying is then arranged by hand
 * through a support ticket until the gateway is live.
 */

/** True when checkout can actually take a payment (a live gateway, or the simulated one in development). */
export function paymentsAvailable(): boolean {
  return isBillingConfigured() || sandboxAllowed();
}

export function earlyBirdEnabled(): boolean {
  return process.env.EARLY_BIRD_TRIALS === 'true' || !isBillingConfigured();
}

export function earlyBirdAvailableFor(ws: (TrialFields & { earlyBird?: boolean }) | null | undefined): boolean {
  if (!earlyBirdEnabled() || !ws) return false;
  if (ws.trialStartedAt || ws.billingSubscriptionId || ws.earlyBird) return false;
  return trialInfo(ws).status === 'needs_card';
}

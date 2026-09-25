import { BILLING_PLANS, type PlanTier } from '@/lib/billing/plans';
import { trialInfo, TRIAL_DAYS, type TrialInfo } from '@/lib/billing/trial';

/**
 * What the dashboard assistant knows about the person it is talking to, and what it can do for them. Everything here is
 * deterministic: prices come from the plan table, the answer to "what plan am I on" comes from the account, and a plan change
 * is only ever PROPOSED as an action the person confirms with a click (the server re-checks their role when it runs).
 */

export type Interval = 'monthly' | 'annual';

export interface AccountSnapshot {
  memberName: string;
  memberEmail: string;
  role: string;
  workspaceName: string;
  planId: PlanTier['id'];
  planName: string;
  interval: Interval;
  trial: TrialInfo;
  subscriptionStatus?: string;
  cancelAtPeriodEnd: boolean;
  hasSubscription: boolean;
  chatsUsed: number;
  chatLimit: number;
  overageRate: number;
  periodEnd?: string;
  assistantCount: number;
  teamCount: number;
  canManageBilling: boolean;
}

export type AssistantAction =
  | { type: 'change_plan'; planId: PlanTier['id']; interval: Interval; label: string; note?: string }
  | { type: 'open_portal'; label: string }
  | { type: 'navigate'; tab: string; label: string };

export interface IntentResult {
  reply: string;
  actions: AssistantAction[];
}

const BILLING_ROLES = new Set(['owner', 'admin', 'billing_manager']);
export const canManageBilling = (role: string, isMaster = false) => isMaster || BILLING_ROLES.has(role);

const usd = (n: number) => `$${n}`;
const planOf = (id: string) => BILLING_PLANS.find((p) => p.id === id) || BILLING_PLANS[0];
const priceOf = (p: PlanTier, i: Interval) => (i === 'annual' ? p.annualMonthlyPrice : p.monthlyPrice);
const priceText = (p: PlanTier, i: Interval) => (i === 'annual' ? `${usd(p.annualMonthlyPrice)}/month billed annually (${usd(p.annualMonthlyPrice * 12)}/year)` : `${usd(p.monthlyPrice)}/month`);
const dateText = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');

/** Tab ids of the dashboard and the words people use for them. */
const TABS: { tab: string; label: string; words: RegExp }[] = [
  { tab: 'billing', label: 'Plans & Billing', words: /\b(billing|plans?|invoices?|subscription|payment)\b/i },
  { tab: 'knowledge', label: 'Knowledge Base', words: /\b(knowledge( base)?|documents|sources|uploads?)\b/i },
  { tab: 'playground', label: 'Testing Studio', words: /\b(testing studio|playground|test (my )?(bot|assistant))\b/i },
  { tab: 'leads', label: 'Leads', words: /\bleads?\b/i },
  { tab: 'appointments', label: 'Appointments', words: /\b(appointments?|bookings?)\b/i },
  { tab: 'history', label: 'Chat History', words: /\b(chat history|conversations?|transcripts?)\b/i },
  { tab: 'analytics', label: 'Analytics & KPIs', words: /\b(analytics|kpis?|statistics|stats)\b/i },
  { tab: 'widget', label: 'Widget & Styling', words: /\b(widget|styling|colou?rs?|appearance)\b/i },
  { tab: 'channels', label: 'Channels & Integrations', words: /\b(channels?|integrations?|slack|sheets|webhooks?|whatsapp|telegram)\b/i },
  { tab: 'behavior', label: 'Behavior & Rules', words: /\b(behaviou?r|rules)\b/i },
  { tab: 'engine', label: 'AI Settings', words: /\b(ai settings|engine|api key|provider|model)\b/i },
  { tab: 'team', label: 'Team', words: /\b(team|members?|invite)\b/i },
  { tab: 'security', label: 'Security & 2FA', words: /\b(security|2fa|two.?factor)\b/i },
  { tab: 'support', label: 'Support', words: /\b(support|tickets?)\b/i },
  { tab: 'profile', label: 'My Profile', words: /\b(profile|my password)\b/i },
  { tab: 'docs', label: 'Guides & Docs', words: /\b(docs|guides)\b/i },
];

/** A plain-language summary of the account: the answer to "what is my plan". */
export function describeAccount(a: AccountSnapshot): string {
  const plan = planOf(a.planId);
  const lines: string[] = [];
  lines.push(`**${a.workspaceName}** is on the **${plan.name}** plan, billed **${a.interval}** (${priceText(plan, a.interval)}).`);

  switch (a.trial.status) {
    case 'trialing':
      lines.push(`You are in your ${TRIAL_DAYS}-day free trial with **${a.trial.daysLeft} day${a.trial.daysLeft === 1 ? '' : 's'} left**${a.trial.endsAt ? ` (it ends on ${dateText(a.trial.endsAt)})` : ''}. ${a.trial.cancelling ? 'It is set to cancel, so your card will **not** be charged.' : `Your card is charged ${usd(priceOf(plan, a.interval) * (a.interval === 'annual' ? 12 : 1))} automatically when it ends unless you cancel first.`}`);
      break;
    case 'subscribed':
      lines.push(a.trial.cancelling ? `The subscription is **set to cancel** at the end of the current period${a.periodEnd ? ` (${dateText(a.periodEnd)})` : ''}; you keep access until then.` : `Your subscription is active${a.periodEnd ? `; the next renewal is on ${dateText(a.periodEnd)}` : ''}.`);
      break;
    case 'past_due':
      lines.push('The last payment **failed**. Please update your card in the billing portal so service is not interrupted.');
      break;
    case 'expired':
      lines.push('The subscription has **ended**, so your assistants are paused until you subscribe again.');
      break;
    case 'needs_card':
      lines.push(`You have not started your trial yet. Add a card in **Plans & Billing** to start ${TRIAL_DAYS} free days.`);
      break;
    default:
      break;
  }

  const left = Math.max(0, a.chatLimit - a.chatsUsed);
  lines.push(`This period you have used **${a.chatsUsed} of ${a.chatLimit.toLocaleString()}** chat sessions (${left.toLocaleString()} left${a.chatsUsed > a.chatLimit ? `, ${(a.chatsUsed - a.chatLimit).toLocaleString()} over the limit at $${a.overageRate.toFixed(2)} each` : ''}). You have ${a.assistantCount} assistant${a.assistantCount === 1 ? '' : 's'} of ${plan.botLimit === 'Unlimited' ? 'unlimited' : plan.botLimit} allowed.`);
  return lines.join('\n\n');
}

function detectTarget(text: string): PlanTier['id'] | null {
  if (/\bstarter\b|\bbasic\b|\bsmallest\b|\bcheapest\b/i.test(text)) return 'starter';
  if (/\bgrowth\b|\bmiddle\b|\bmid\b/i.test(text)) return 'growth';
  if (/\bscale\b|\bagency\b|\bbiggest\b|\bhighest\b|\btop\b/i.test(text)) return 'scale';
  return null;
}

function detectInterval(text: string, fallback: Interval): Interval {
  if (/\b(annual|annually|yearly|per year|year)\b/i.test(text)) return 'annual';
  if (/\b(monthly|per month|month to month)\b/i.test(text)) return 'monthly';
  return fallback;
}

const ORDER: PlanTier['id'][] = ['starter', 'growth', 'scale'];

function proposePlan(a: AccountSnapshot, target: PlanTier['id'], interval: Interval): IntentResult {
  const from = planOf(a.planId);
  const to = planOf(target);
  if (target === a.planId && interval === a.interval) {
    return { reply: `You are already on **${to.name}**, billed ${interval}. Nothing to change.`, actions: [] };
  }
  const up = ORDER.indexOf(target) > ORDER.indexOf(a.planId);
  const down = ORDER.indexOf(target) < ORDER.indexOf(a.planId);
  const kind = up ? 'upgrade' : down ? 'downgrade' : 'change';

  const lines = [`Here is the ${kind}: **${from.name}** (${priceText(from, a.interval)}) → **${to.name}** (${priceText(to, interval)}).`];
  lines.push(`${to.name} includes ${to.chatSessionsLimit.toLocaleString()} chat sessions a month, ${to.botLimit === 'Unlimited' ? 'unlimited assistants' : `${to.botLimit} assistant${to.botLimit === 1 ? '' : 's'}`} and ${to.knowledgeStorageLimitMb >= 1000 ? `${to.knowledgeStorageLimitMb / 1000} GB` : `${to.knowledgeStorageLimitMb} MB`} of knowledge storage.`);
  if (a.trial.status === 'trialing') lines.push('You are still in your free trial, so **nothing extra is charged now**; the new price applies when the trial ends.');
  else if (a.hasSubscription) lines.push('Your existing subscription is moved to the new plan and the difference is **prorated** on your next invoice.');
  if (down && to.botLimit !== 'Unlimited' && a.assistantCount > to.botLimit) {
    lines.push(`**Heads up:** you have ${a.assistantCount} assistants and ${to.name} allows ${to.botLimit}. Delete or stop using the extras.`);
  }
  if (down && a.chatsUsed > to.chatSessionsLimit) {
    lines.push(`**Heads up:** you have already used ${a.chatsUsed} chats this period; ${to.name} includes ${to.chatSessionsLimit}, so extra chats cost $${to.overageRate.toFixed(2)} each.`);
  }
  lines.push('Tap **Confirm** below and I will do it. Nothing changes until you do.');
  return {
    reply: lines.join('\n\n'),
    actions: [{ type: 'change_plan', planId: target, interval, label: `Confirm: switch to ${to.name} (${interval})`, note: kind }],
  };
}

/**
 * Answers the questions about the account itself, and turns "upgrade / downgrade / cancel / open X" into actions.
 * Returns null when the message is not about the account (the caller then answers from the guides).
 */
export function accountIntent(text: string, a: AccountSnapshot | null): IntentResult | null {
  const t = (text || '').trim();
  if (!t) return null;

  // ---- go to a tab
  const nav = t.match(/\b(open|go to|take me to|show me|navigate to|bring me to)\b(.*)/i);
  if (nav) {
    const hit = TABS.find((x) => x.words.test(nav[2]));
    if (hit && !/\b(upgrade|downgrade|change|switch)\b/i.test(t)) {
      return { reply: `Opening **${hit.label}**.`, actions: [{ type: 'navigate', tab: hit.tab, label: `Open ${hit.label}` }] };
    }
  }

  if (!a) return null;

  const mentionsPlanWord = /\b(plan|plans|subscription|tier|package)\b/i.test(t);
  const wantsChange = /\b(upgrade|downgrade|switch|change|move|go|put me|set me|step up|step down|drop|reduce|increase|bump)\b/i.test(t);
  const target = detectTarget(t);

  // ---- cancel
  if (/\b(cancel|stop|end|terminate)\b.*\b(subscription|plan|trial|billing|membership|account|charging|charges?)\b/i.test(t) || /\bunsubscribe\b/i.test(t)) {
    if (!a.canManageBilling) return { reply: 'Only an owner, admin or billing manager can cancel. Please ask one of them, or open a support ticket.', actions: [] };
    const trialing = a.trial.status === 'trialing';
    return {
      reply: `${trialing ? 'To stop the trial from turning into a paid plan, cancel before it ends. ' : ''}Cancelling is done in the secure Stripe billing portal: you keep access until the period ends and nothing more is charged. I cannot cancel for you, but this button opens the portal.`,
      actions: [{ type: 'open_portal', label: 'Open billing portal' }],
    };
  }

  // ---- card / invoices
  if (/\b(update|change|replace|new)\b.*\b(card|payment method)\b|\b(invoices?|receipts?)\b/i.test(t)) {
    return { reply: 'Cards and invoices are handled in the secure Stripe billing portal. Cards are never entered in Crescelo itself.', actions: [{ type: 'open_portal', label: 'Open billing portal' }, { type: 'navigate', tab: 'billing', label: 'Open Plans & Billing' }] };
  }

  // ---- change plan (upgrade / downgrade / switch to X / annual)
  const directionUp = /\b(upgrade|step up|bump|increase|bigger|more chats|higher)\b/i.test(t);
  const directionDown = /\b(downgrade|step down|drop|reduce|cheaper|smaller|lower|less)\b/i.test(t);
  const intervalOnly = /\b(annual|annually|yearly|monthly)\b/i.test(t) && /\b(billing|billed|switch|change|move)\b/i.test(t);
  if ((wantsChange && (mentionsPlanWord || target || directionUp || directionDown)) || (target && /\b(want|need|like|put me|get|to)\b/i.test(t) && (mentionsPlanWord || wantsChange)) || intervalOnly) {
    if (!a.canManageBilling) return { reply: 'Only an owner, admin or billing manager can change the plan. Please ask one of them, or open a support ticket.', actions: [] };
    if (a.trial.status === 'needs_card' || a.trial.status === 'expired') {
      return { reply: 'You need an active subscription first. Open **Plans & Billing** and choose a plan; the card step is handled by Stripe.', actions: [{ type: 'navigate', tab: 'billing', label: 'Open Plans & Billing' }] };
    }
    const interval = detectInterval(t, a.interval);
    let chosen = target;
    if (!chosen) {
      const idx = ORDER.indexOf(a.planId);
      if (directionUp && idx < ORDER.length - 1) chosen = ORDER[idx + 1];
      else if (directionDown && idx > 0) chosen = ORDER[idx - 1];
      else if (directionUp || directionDown) {
        return { reply: directionUp ? `You are already on the top plan (**${planOf(a.planId).name}**).` : `You are already on the smallest plan (**${planOf(a.planId).name}**).`, actions: [] };
      } else if (intervalOnly) chosen = a.planId;
    }
    if (chosen) return proposePlan(a, chosen, interval);
    // ask which plan
    const options = BILLING_PLANS.filter((p) => p.id !== a.planId || interval !== a.interval);
    return {
      reply: `Which plan would you like? You are on **${planOf(a.planId).name}** (${a.interval}).\n\n${options.map((p) => `- **${p.name}**: ${priceText(p, interval)}, ${p.chatSessionsLimit.toLocaleString()} chats/month`).join('\n')}`,
      actions: options.map((p) => ({ type: 'change_plan' as const, planId: p.id, interval, label: `${p.name} (${interval})`, note: 'choose' })),
    };
  }

  // ---- questions about the current plan / usage / trial / next charge
  if (
    /\b(my|current|which|what)\b.*\b(plan|subscription|tier)\b/i.test(t) ||
    /\b(plan am i|am i on|what am i (paying|on))\b/i.test(t) ||
    /\b(trial)\b.*\b(end|left|remaining|expire|when|days)\b|\bwhen.*\b(charged|billed|renew|next (payment|charge|invoice))\b/i.test(t) ||
    /\b(how many|how much)\b.*\b(chats?|conversations?|sessions?|left|used|usage)\b|\b(usage|quota|remaining)\b/i.test(t) ||
    /\b(account|workspace)\b.*\b(status|info|details)\b/i.test(t) ||
    /\bwho am i\b|\bmy account\b/i.test(t)
  ) {
    return { reply: describeAccount(a), actions: [{ type: 'navigate', tab: 'billing', label: 'Open Plans & Billing' }] };
  }

  return null;
}

/** A compact block of facts about the person for the model's prompt (never their password or keys). */
export function accountFacts(a: AccountSnapshot): string {
  const plan = planOf(a.planId);
  return [
    `Signed-in user: ${a.memberName} (${a.memberEmail}), role ${a.role}.`,
    `Workspace: ${a.workspaceName}. Plan: ${plan.name}, billed ${a.interval}. Trial status: ${a.trial.status}${a.trial.status === 'trialing' ? ` (${a.trial.daysLeft} days left)` : ''}${a.cancelAtPeriodEnd ? ', set to cancel at period end' : ''}.`,
    `Usage this period: ${a.chatsUsed} of ${a.chatLimit} chats. Assistants: ${a.assistantCount}. Team members: ${a.teamCount}.`,
    `Can manage billing: ${a.canManageBilling ? 'yes' : 'no'}.`,
  ].join('\n');
}

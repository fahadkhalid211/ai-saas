import { describe, it, expect } from 'vitest';
import { accountIntent, describeAccount, type AccountSnapshot } from './account';

const base: AccountSnapshot = {
  memberName: 'Alex',
  memberEmail: 'alex@example.com',
  role: 'owner',
  workspaceName: 'Apex Barbers',
  planId: 'growth',
  planName: 'Growth',
  interval: 'monthly',
  trial: { status: 'trialing', daysLeft: 9, endsAt: '2026-10-04T00:00:00.000Z', cancelling: false },
  subscriptionStatus: 'trialing',
  cancelAtPeriodEnd: false,
  hasSubscription: true,
  chatsUsed: 120,
  chatLimit: 500,
  overageRate: 0.4,
  periodEnd: '2026-10-04T00:00:00.000Z',
  assistantCount: 2,
  teamCount: 3,
  canManageBilling: true,
};
const paid: AccountSnapshot = { ...base, trial: { status: 'subscribed', daysLeft: 0, endsAt: null, cancelling: false }, subscriptionStatus: 'active' };

const change = (text: string, a = base) => {
  const r = accountIntent(text, a);
  const act = r?.actions.find((x) => x.type === 'change_plan');
  return act && act.type === 'change_plan' ? { planId: act.planId, interval: act.interval, reply: r!.reply, count: r!.actions.length } : null;
};

describe('the account questions', () => {
  it('answers what plan the person is on, from their own account', () => {
    for (const q of ['what is my current plan?', 'which plan am I on', 'what plan am i on', 'my subscription', 'what am I paying']) {
      const r = accountIntent(q, base)!;
      expect(r, q).not.toBeNull();
      expect(r.reply, q).toContain('Growth');
      expect(r.reply, q).toContain('Apex Barbers');
    }
  });

  it('reports trial days left and the first charge', () => {
    const r = accountIntent('when does my trial end and when will I be charged?', base)!;
    expect(r.reply).toContain('9 days left');
    expect(r.reply).toMatch(/charged \$149 automatically/);
  });

  it('reports chat usage', () => {
    const r = accountIntent('how many chats have I used?', base)!;
    expect(r.reply).toContain('120 of 500');
  });

  it('says a plan is annual and how it is billed', () => {
    const r = describeAccount({ ...paid, interval: 'annual' });
    expect(r).toContain('$119/month billed annually');
    expect(r).toContain('$1428/year');
  });
});

describe('plan changes are proposed, never done', () => {
  it('upgrade with no target moves to the next plan up', () => {
    expect(change('upgrade my plan')).toMatchObject({ planId: 'scale', interval: 'monthly' });
    expect(change('I want to upgrade')).toMatchObject({ planId: 'scale' });
  });

  it('downgrade with no target moves to the next plan down', () => {
    expect(change('downgrade my plan')).toMatchObject({ planId: 'starter' });
    expect(change('can I switch to a cheaper plan?')).toMatchObject({ planId: 'starter' });
  });

  it('understands a named target and a billing period', () => {
    expect(change('switch me to the Starter plan')).toMatchObject({ planId: 'starter' });
    expect(change('upgrade to agency')).toMatchObject({ planId: 'scale' });
    expect(change('change my plan to scale billed yearly')).toMatchObject({ planId: 'scale', interval: 'annual' });
    expect(change('put me on growth annually', paid)).toMatchObject({ planId: 'growth', interval: 'annual' });
    expect(change('switch to annual billing')).toMatchObject({ planId: 'growth', interval: 'annual' });
  });

  it('always asks for confirmation and states the price', () => {
    const r = accountIntent('downgrade to starter', base)!;
    expect(r.reply).toContain('Confirm');
    expect(r.reply).toContain('$49/month');
    expect(r.reply).toMatch(/nothing changes until you do/i);
    expect(r.actions).toHaveLength(1);
    expect(r.actions[0]).toMatchObject({ type: 'change_plan', planId: 'starter' });
  });

  it('explains proration outside the trial and no charge during it', () => {
    expect(accountIntent('upgrade to scale', base)!.reply).toMatch(/nothing extra is charged now/i);
    expect(accountIntent('upgrade to scale', paid)!.reply).toMatch(/prorated/i);
  });

  it('warns when a downgrade does not fit', () => {
    const r = accountIntent('downgrade to starter', { ...base, assistantCount: 3, chatsUsed: 300 })!;
    expect(r.reply).toMatch(/you have 3 assistants/i);
    expect(r.reply).toMatch(/already used 300 chats/i);
  });

  it('does not propose the plan the person is already on', () => {
    const r = accountIntent('switch to growth monthly', paid)!;
    expect(r.actions).toHaveLength(0);
    expect(r.reply).toMatch(/already on/i);
  });

  it('asks which plan when it is unclear, offering one button per option', () => {
    const r = accountIntent('I want to change my plan', base)!;
    expect(r.actions.filter((a) => a.type === 'change_plan').length).toBeGreaterThanOrEqual(2);
    expect(r.reply).toContain('Which plan');
  });

  it('refuses people who cannot manage billing', () => {
    for (const q of ['upgrade my plan', 'cancel my subscription']) {
      const r = accountIntent(q, { ...base, role: 'viewer', canManageBilling: false })!;
      expect(r.actions, q).toHaveLength(0);
      expect(r.reply, q).toMatch(/owner, admin or billing manager/i);
    }
  });

  it('needs a subscription before a plan can be changed', () => {
    const r = accountIntent('upgrade my plan', { ...base, trial: { status: 'needs_card', daysLeft: 0, endsAt: null, cancelling: false } })!;
    expect(r.actions.some((a) => a.type === 'change_plan')).toBe(false);
    expect(r.reply).toMatch(/active subscription/i);
  });

  it('never proposes a plan change for a question that is not a request', () => {
    for (const q of ['how do I connect openai', 'what does the growth plan include?', 'how do I add a knowledge base', 'what is the cheapest plan?']) {
      const r = accountIntent(q, base);
      expect(r?.actions.some((a) => a.type === 'change_plan') ?? false, q).toBe(false);
    }
  });
});

describe('cancelling and cards go to the billing portal', () => {
  it('cancel opens the portal instead of cancelling', () => {
    const r = accountIntent('I want to cancel my subscription', base)!;
    expect(r.actions).toEqual([{ type: 'open_portal', label: 'Open billing portal' }]);
    expect(r.reply).toMatch(/cannot cancel for you/i);
  });

  it('a card update or invoice request opens the portal', () => {
    expect(accountIntent('update my card', base)!.actions[0]).toMatchObject({ type: 'open_portal' });
    expect(accountIntent('where can I download my invoice', base)!.actions[0]).toMatchObject({ type: 'open_portal' });
  });
});

describe('navigation', () => {
  it('opens dashboard tabs', () => {
    expect(accountIntent('take me to the knowledge base', null)!.actions[0]).toMatchObject({ type: 'navigate', tab: 'knowledge' });
    expect(accountIntent('open billing', null)!.actions[0]).toMatchObject({ type: 'navigate', tab: 'billing' });
    expect(accountIntent('go to support', null)!.actions[0]).toMatchObject({ type: 'navigate', tab: 'support' });
  });

  it('has no account answers for a session without an account', () => {
    expect(accountIntent('what is my plan?', null)).toBeNull();
  });
});

describe('early-bird trial (no card)', () => {
  const eb: AccountSnapshot = { ...base, earlyBird: true, hasSubscription: false, subscriptionStatus: undefined };
  it('says nothing will be charged', () => {
    const r = describeAccount(eb);
    expect(r).toMatch(/early-bird/i);
    expect(r).toMatch(/nothing will be charged/i);
    expect(r).not.toMatch(/card is charged/i);
  });
  it('has nothing to cancel', () => {
    const r = accountIntent('cancel my subscription', eb)!;
    expect(r.actions).toHaveLength(0);
    expect(r.reply).toMatch(/nothing to cancel/i);
  });
});

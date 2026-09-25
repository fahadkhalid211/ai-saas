'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CreditCard, LogOut, Sparkles } from 'lucide-react';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { readSelectedPlan } from '@/lib/analytics/track';
import { showErrorModal } from '@/lib/ui/notify';
import { SaveButton } from '@/components/ui/SaveButton';
import { TRIAL_DAYS, type TrialInfo } from '@/lib/billing/trial';

interface BillingSummary {
  workspaceId: string;
  trial: TrialInfo;
  subscription: { nextChargeAmount: number; nextChargeDate: string | null; cancelAtPeriodEnd: boolean; hasStripeCustomer: boolean };
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the end of the trial');

/**
 * The free trial needs a card. This shows, over the dashboard:
 *  - a full-screen plan choice until the card is added (new workspace) or after a subscription ended;
 *  - a bar while trialing that says exactly when and how much will be charged, with a way to cancel;
 *  - a warning if a payment failed.
 * Nothing is shown to older workspaces or to the platform owner.
 */
export function SubscriptionGate({ isMasterAdmin, onLogout, onOpenBilling }: { isMasterAdmin: boolean; onLogout: () => void; onOpenBilling: () => void }) {
  const [data, setData] = useState<BillingSummary | null>(null);
  const [planId, setPlanId] = useState<string>('growth');
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/billing', { cache: 'no-store' });
      if (!r.ok) return null;
      const d = (await r.json()) as BillingSummary;
      setData(d);
      return d;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (isMasterAdmin) return;
    const chosen = readSelectedPlan();
    if (chosen && BILLING_PLANS.some((p) => p.id === chosen.plan)) {
      setPlanId(chosen.plan);
      setInterval(chosen.billing);
    }
    load();
  }, [isMasterAdmin, load]);

  // Back from Stripe: the webhook may take a few seconds, so wait for it before showing the dashboard
  useEffect(() => {
    if (isMasterAdmin) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing_success') !== 'true') return;
    setConfirming(true);
    let tries = 0;
    const timer = window.setInterval(async () => {
      tries += 1;
      const d = await load();
      if ((d && d.trial.status !== 'needs_card' && d.trial.status !== 'expired') || tries >= 20) {
        window.clearInterval(timer);
        setConfirming(false);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [isMasterAdmin, load]);

  const startCheckout = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingInterval: interval, workspaceId: data?.workspaceId }),
      });
      const out = await res.json();
      if (res.ok && out.url) {
        window.location.href = out.url;
        return;
      }
      if (res.ok) {
        await load(); // simulated checkout (development)
      } else {
        showErrorModal({ title: "Couldn't start checkout", message: out.error || 'Checkout could not be started.', hint: 'Nothing was charged. Please try again.' });
      }
    } catch (err) {
      showErrorModal({ title: "Couldn't start checkout", message: (err as Error)?.message || 'Network error.', hint: 'Nothing was charged. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const openPortal = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: data?.workspaceId }) });
      const out = await res.json();
      if (res.ok && out.url) window.location.href = out.url;
      else showErrorModal({ title: "Couldn't open the billing portal", message: out.error || 'The billing portal is not available yet.' });
    } catch (err) {
      showErrorModal({ title: "Couldn't open the billing portal", message: (err as Error)?.message || 'Network error.' });
    }
  };

  if (isMasterAdmin || !data) return null;
  const { trial, subscription } = data;
  const plan = BILLING_PLANS.find((p) => p.id === planId) || BILLING_PLANS[0];
  const price = interval === 'annual' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;

  /* ------------------------------------------- the bar during the trial ------------------------------------------- */
  if (trial.status === 'trialing' || trial.status === 'past_due' || (trial.status === 'subscribed' && subscription.cancelAtPeriodEnd)) {
    const warn = trial.status === 'past_due';
    const cancelling = subscription.cancelAtPeriodEnd;
    return (
      <div role="status" className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs font-medium ${warn ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-50 dark:bg-slate-800'}`}>
        <span className="flex items-center gap-2">
          {warn ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {warn
            ? 'Your last payment failed. Update your card to keep your assistants running.'
            : cancelling
              ? `Your subscription is cancelled and ends on ${fmtDate(subscription.nextChargeDate)}. You will not be charged again.`
              : trial.status === 'trialing'
                ? `Free trial: ${trial.daysLeft} ${trial.daysLeft === 1 ? 'day' : 'days'} left. Your card will be charged $${subscription.nextChargeAmount} on ${fmtDate(subscription.nextChargeDate)} unless you cancel first.`
                : ''}
        </span>
        <span className="flex gap-2">
          <button type="button" onClick={onOpenBilling} className="rounded-lg bg-white/15 px-3 py-1 text-[11px] font-bold hover:bg-white/25 cursor-pointer">Plans</button>
          <button type="button" onClick={openPortal} className="rounded-lg bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900 hover:bg-white cursor-pointer">
            {warn ? 'Update card' : cancelling ? 'Resume' : 'Cancel or manage'}
          </button>
        </span>
      </div>
    );
  }

  if (trial.status !== 'needs_card' && trial.status !== 'expired') return null;

  /* --------------------------------------------- the full-screen choice --------------------------------------------- */
  const expired = trial.status === 'expired';
  return (
    <div className="fixed inset-0 z-[9000] overflow-y-auto bg-[#1f1e1d]/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="sg-title">
      <div className="mx-auto my-8 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#262624] p-6 text-[#e8e5dc] shadow-2xl sm:p-8">
        {confirming ? (
          <div className="py-16 text-center" role="status">
            <p className="text-lg font-semibold text-[#faf9f5]">Confirming your card…</p>
            <p className="mt-2 text-sm text-[#a19f96]">This takes a few seconds. Please do not close this page.</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#abff44]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#abff44]">
                <CreditCard className="h-3.5 w-3.5" /> {expired ? 'Subscription ended' : `${TRIAL_DAYS}-day free trial`}
              </span>
              <h1 id="sg-title" className="mt-3 text-3xl text-[#faf9f5]" style={{ fontFamily: 'var(--kx-serif, Georgia, serif)' }}>
                {expired ? 'Choose a plan to switch your assistants back on' : 'Start your free trial'}
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#c9c6bc]">
                {expired
                  ? 'Your assistants are paused. Your data is kept for 30 days. Pick a plan and they answer visitors again straight away.'
                  : `You pay nothing today. Your ${TRIAL_DAYS}-day trial includes every Growth feature. If you do not cancel before it ends, your card is charged automatically. Cancel any time and you are never charged for the trial.`}
              </p>
            </div>

            <div className="mt-5 flex justify-center" role="group" aria-label="Billing period">
              {(['annual', 'monthly'] as const).map((i) => (
                <button key={i} type="button" onClick={() => setInterval(i)} aria-pressed={interval === i} className={`px-4 py-1.5 text-xs font-semibold first:rounded-l-full last:rounded-r-full border border-white/15 cursor-pointer ${interval === i ? 'bg-[#abff44] text-[#08251a]' : 'bg-white/[0.04] text-[#e8e5dc]'}`}>
                  {i === 'annual' ? 'Annual (save)' : 'Monthly'}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {BILLING_PLANS.map((p) => {
                const monthly = interval === 'annual' ? p.annualMonthlyPrice : p.monthlyPrice;
                const on = p.id === planId;
                return (
                  <button key={p.id} type="button" onClick={() => setPlanId(p.id)} aria-pressed={on} className={`rounded-2xl border p-4 text-left transition cursor-pointer ${on ? 'border-[#abff44] bg-[#abff44]/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}>
                    <p className="text-sm font-bold text-[#faf9f5]">{p.name}</p>
                    <p className="mt-1 text-2xl font-semibold text-[#faf9f5]">${monthly}<span className="text-xs font-normal text-[#a19f96]"> / month</span></p>
                    <p className="mt-1 text-[11px] text-[#a19f96]">{interval === 'annual' ? `Billed $${p.annualMonthlyPrice * 12} per year` : 'Billed monthly'}</p>
                    <p className="mt-2 text-[11px] leading-snug text-[#c9c6bc]">{p.chatSessionsLimit.toLocaleString('en-US')} chat sessions, {p.botLimit === 'Unlimited' ? 'unlimited' : p.botLimit} {p.botLimit === 1 ? 'assistant' : 'assistants'}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-[#e8e5dc]">
              {expired ? (
                <p>Today: <strong>${price}</strong> for {plan.name}, then every {interval === 'annual' ? 'year' : 'month'} until you cancel.</p>
              ) : (
                <p>
                  Today: <strong>$0</strong>. After {TRIAL_DAYS} days ({fmtDate(new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString())}): <strong>${price}</strong> for {plan.name}, charged automatically every {interval === 'annual' ? 'year' : 'month'} until you cancel. Cancel before that date and you pay nothing.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col items-center gap-3">
              <SaveButton onClick={startCheckout} saving={busy} idleLabel={expired ? `Subscribe to ${plan.name}` : 'Start free trial'} savingLabel="Opening secure checkout…" savedLabel="Opening…" className="px-6 py-3 text-sm" />
              <p className="text-[11px] text-[#a19f96]">Secure payment by Stripe. By continuing you agree to the <a className="underline" href="/terms" target="_blank" rel="noopener noreferrer">Terms</a> and <a className="underline" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-1.5 text-[11px] text-[#a19f96] underline cursor-pointer"><LogOut className="h-3 w-3" /> Sign out</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

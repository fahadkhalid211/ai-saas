'use client';

import { T, TRich, useT } from '@/lib/i18n/context';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CreditCard, LogOut, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { BILLING_PLANS, annualSavingsPercent, planAnnualSavingsDollars } from '@/lib/billing/plans';
import { readSelectedPlan } from '@/lib/analytics/track';
import { showErrorModal, SUBSCRIPTION_REQUIRED_EVENT } from '@/lib/ui/notify';
import { SaveButton } from '@/components/ui/SaveButton';
import { TRIAL_DAYS, type TrialInfo } from '@/lib/billing/trial';

interface BillingSummary {
  workspaceId: string;
  trial: TrialInfo;
  subscription: { nextChargeAmount: number; nextChargeDate: string | null; cancelAtPeriodEnd: boolean; hasStripeCustomer: boolean };
  /** Can checkout take a payment right now? */
  payments?: { available: boolean };
  /** The launch offer: a trial with no card. */
  earlyBird?: { available: boolean; active: boolean };
  /** Free access from an access code (lib/billing/access-codes.ts). */
  complimentary?: { active: boolean; code: string; endsAt: string | null; canRedeem: boolean };
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the end of the trial');

/**
 * The free trial needs a card. This shows, over the dashboard:
 *  - a full-screen plan choice until the card is added (new workspace) or after a subscription ended;
 *  - a bar while trialing that says exactly when and how much will be charged, with a way to cancel;
 *  - a warning if a payment failed.
 * Nothing is shown to older workspaces or to the platform owner.
 */
export function SubscriptionGate({ isMasterAdmin, onLogout, onOpenBilling, onOpenSupport }: { isMasterAdmin: boolean; onLogout: () => void; onOpenBilling: () => void; onOpenSupport?: () => void }) {
  const __t = useT();
  const [data, setData] = useState<BillingSummary | null>(null);
  const [planId, setPlanId] = useState<string>('growth');
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // manual payment: shown when card payments are not connected, or when checkout could not start
  const [checkoutFailed, setCheckoutFailed] = useState(false);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [noteError, setNoteError] = useState('');
  // access code
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeBusy, setCodeBusy] = useState(false);
  const [codeError, setCodeError] = useState('');

  const loadOnce = useCallback(async () => {
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

  // A failed request must not leave a new account without its plan screen (it once made the dashboard look usable when
  // nothing could be saved), so the plan status is asked for again a few times.
  const load = useCallback(async () => {
    for (let attempt = 1; attempt <= 4; attempt++) {
      const d = await loadOnce();
      if (d) return d;
      if (attempt < 4) await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
    return null;
  }, [loadOnce]);

  // A save was refused because there is no active plan: show the current plan status (and so the plan choice) right away
  useEffect(() => {
    if (isMasterAdmin) return;
    const onRequired = () => void loadOnce();
    window.addEventListener(SUBSCRIPTION_REQUIRED_EVENT, onRequired);
    return () => window.removeEventListener(SUBSCRIPTION_REQUIRED_EVENT, onRequired);
  }, [isMasterAdmin, loadOnce]);

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
      const d = await loadOnce();
      if ((d && d.trial.status !== 'needs_card' && d.trial.status !== 'expired') || tries >= 20) {
        window.clearInterval(timer);
        setConfirming(false);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [isMasterAdmin, loadOnce]);

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
        setCheckoutFailed(true);
        showErrorModal({ title: "Card checkout isn't ready yet", message: out.error || 'Checkout could not be started.', hint: 'Nothing was charged. You can start your free trial without a card, or ask us to arrange payment: the options are right below.' });
      }
    } catch (err) {
      setCheckoutFailed(true);
      showErrorModal({ title: "Card checkout isn't ready yet", message: (err as Error)?.message || 'Network error.', hint: 'Nothing was charged. The options below still work.' });
    } finally {
      setBusy(false);
    }
  };

  const startEarlyBird = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/billing/early-bird', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, billingInterval: interval }) });
      const out = await res.json().catch(() => ({}));
      if (res.ok) await load();
      else showErrorModal({ title: "Couldn't start your free trial", message: out.error || 'Please try again, or use the contact form below.' });
    } catch (err) {
      showErrorModal({ title: "Couldn't start your free trial", message: (err as Error)?.message || 'Network error.' });
    } finally {
      setBusy(false);
    }
  };

  const redeemCode = async () => {
    setCodeError('');
    if (!code.trim()) {
      setCodeError('Enter your access code.');
      return;
    }
    setCodeBusy(true);
    try {
      const res = await fetch('/api/billing/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const out = await res.json().catch(() => ({}));
      if (res.ok) await load();
      else setCodeError(out.error || 'That code did not work. Please try again.');
    } catch (err) {
      setCodeError((err as Error)?.message || 'Network error.');
    } finally {
      setCodeBusy(false);
    }
  };

  const sendNote = async () => {
    setNoteError('');
    const planName = BILLING_PLANS.find((p) => p.id === planId)?.name || planId;
    const text = note.trim() || `I would like to pay for the ${planName} plan (${interval}) by hand. Please tell me how.`;
    setSending(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'Billing & Payments', priority: 'normal', subject: `Manual payment: ${planName} (${interval})`, message: `${text}\n\n(Plan chosen: ${planName}, ${interval} billing.)` }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Could not send your message.');
      setTicketRef(out.ticket?.ref || 'sent');
    } catch (err) {
      setNoteError((err as Error)?.message || 'Could not send your message.');
    } finally {
      setSending(false);
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
  if (trial.status === 'trialing' && data.complimentary?.active) {
    return (
      <div role="status" className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-50 dark:bg-slate-800">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {__t("Free access with your code: {daysLeft} {n2} left, no card needed. It ends on {n3}. To keep your assistants running after that, choose a plan.", { daysLeft: trial.daysLeft, n2: trial.daysLeft === 1 ? __t("day") : __t("days"), n3: fmtDate(trial.endsAt) })}
        </span>
        <button type="button" onClick={onOpenBilling} className="rounded-lg bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900 hover:bg-white cursor-pointer"><T>Plans</T></button>
      </div>
    );
  }

  if (trial.status === 'trialing' && data.earlyBird?.active) {
    return (
      <div role="status" className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-50 dark:bg-slate-800">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {__t("Early-bird trial: {daysLeft} {n2} left, no card needed. To keep your assistants running after {n3}, message us and we will set up payment.", { daysLeft: trial.daysLeft, n2: trial.daysLeft === 1 ? __t("day") : __t("days"), n3: fmtDate(trial.endsAt) })}
        </span>
        <button type="button" onClick={onOpenSupport || onOpenBilling} className="rounded-lg bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900 hover:bg-white cursor-pointer"><T>Contact us to pay</T></button>
      </div>
    );
  }

  if (trial.status === 'trialing' || trial.status === 'past_due' || (trial.status === 'subscribed' && subscription.cancelAtPeriodEnd)) {
    const warn = trial.status === 'past_due';
    const cancelling = subscription.cancelAtPeriodEnd;
    return (
      <div role="status" className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs font-medium ${warn ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-50 dark:bg-slate-800'}`}>
        <span className="flex items-center gap-2">
          {warn ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {warn
            ? <T>{'Your last payment failed. Update your card to keep your assistants running.'}</T>
            : cancelling
              ? __t("Your subscription is cancelled and ends on {n1}. You will not be charged again.", { n1: fmtDate(subscription.nextChargeDate) })
              : trial.status === 'trialing'
                ? __t("Free trial: {daysLeft} {n2} left. Your card will be charged ${nextChargeAmount} on {n4} unless you cancel first.", { daysLeft: trial.daysLeft, n2: trial.daysLeft === 1 ? __t("day") : __t("days"), nextChargeAmount: subscription.nextChargeAmount, n4: fmtDate(subscription.nextChargeDate) })
                : ''}
        </span>
        <span className="flex gap-2">
          <button type="button" onClick={onOpenBilling} className="rounded-lg bg-white/15 px-3 py-1 text-[11px] font-bold hover:bg-white/25 cursor-pointer"><T>Plans</T></button>
          <button type="button" onClick={openPortal} className="rounded-lg bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900 hover:bg-white cursor-pointer">
            {warn ? <T>{'Update card'}</T> : cancelling ? <T>{'Resume'}</T> : <T>{'Cancel or manage'}</T>}
          </button>
        </span>
      </div>
    );
  }

  if (trial.status !== 'needs_card' && trial.status !== 'expired') return null;

  /* --------------------------------------------- the full-screen choice --------------------------------------------- */
  const expired = trial.status === 'expired';
  const cardsWork = data.payments?.available !== false;
  const showManual = !cardsWork || checkoutFailed || expired;
  const earlyBird = Boolean(data.earlyBird?.available);
  return (
    <div className="fixed inset-0 z-[9000] overflow-y-auto bg-[#fffeeb]/95 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="sg-title">
      <div className="mx-auto my-8 w-full max-w-3xl rounded-3xl border border-[#08251a]/10 bg-white ring-1 ring-[#08251a]/10 shadow-[0_30px_80px_-30px_rgba(8,37,26,0.45)] p-6 text-[#08251a] shadow-2xl sm:p-8">
        {confirming ? (
          <div className="py-16 text-center" role="status">
            <p className="text-lg font-semibold text-[#08251a]"><T>Confirming your card…</T></p>
            <p className="mt-2 text-sm text-[#4b5d54]"><T>This takes a few seconds. Please do not close this page.</T></p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#08251a]/20 bg-[#abff44]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0d5b2a]">
                <CreditCard className="h-3.5 w-3.5" /> {expired ? <T>{'Subscription ended'}</T> : __t("{TRIAL_DAYS}-day free trial", { TRIAL_DAYS: TRIAL_DAYS })}
              </span>
              <h1 id="sg-title" className="mt-3 text-3xl text-[#08251a]" style={{ fontFamily: 'var(--kx-serif, Georgia, serif)' }}>
                {expired ? <T>{'Choose a plan to switch your assistants back on'}</T> : earlyBird && !cardsWork ? <T>{'Early birds, this one is on us 🐣'}</T> : <T>{'Start your free trial'}</T>}
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#33473d]">
                {expired
                  ? <T>{'Your assistants are paused. Your data is kept for 30 days. Pick a plan, or message us below and we will arrange payment by hand.'}</T>
                  : earlyBird && !cardsWork
                    ? __t("We are just launching, and our card payments are still getting their wings. So instead of making you hop through hoops, early birds get {TRIAL_DAYS} free days with every Growth feature. No card, no catch. Build your assistant, put it on your site and see what it can do.", { TRIAL_DAYS: TRIAL_DAYS })
                    : __t("You pay nothing today. Your {TRIAL_DAYS}-day trial includes every Growth feature. If you do not cancel before it ends, your card is charged automatically. Cancel any time and you are never charged for the trial.", { TRIAL_DAYS: TRIAL_DAYS })}
              </p>
            </div>

            <div className="mt-5 flex justify-center" role="group" aria-label={__t("Billing period")}>
              {(['annual', 'monthly'] as const).map((i) => (
                <button key={i} type="button" onClick={() => setInterval(i)} aria-pressed={interval === i} className={`px-4 py-1.5 text-xs font-semibold first:rounded-l-full last:rounded-r-full border border-[#08251a]/15 cursor-pointer ${interval === i ? 'bg-[#abff44] text-[#08251a]' : 'bg-[#f5f3dd] text-[#08251a]'}`}>
                  {i === 'annual' ? __t("Annual · save {n1}%", { n1: annualSavingsPercent() }) : <T>{'Monthly'}</T>}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {BILLING_PLANS.map((p) => {
                const monthly = interval === 'annual' ? p.annualMonthlyPrice : p.monthlyPrice;
                const on = p.id === planId;
                return (
                  <button key={p.id} type="button" onClick={() => setPlanId(p.id)} aria-pressed={on} className={`rounded-2xl border p-4 text-left transition cursor-pointer ${on ? 'border-[#abff44] bg-[#abff44]/25' : 'border-[#08251a]/10 bg-[#faf9ea] hover:border-[#08251a]/40'}`}>
                    <p className="text-sm font-bold text-[#08251a]">{p.name}</p>
                    <p className="mt-1 text-2xl font-semibold text-[#08251a]">${monthly}<span className="text-xs font-normal text-[#4b5d54]"> <T>/ month</T></span></p>
                    <p className="mt-1 text-[11px] text-[#4b5d54]">{interval === 'annual' ? __t("Billed ${n1} per year", { n1: p.annualMonthlyPrice * 12 }) : <T>{'Billed monthly'}</T>}</p>
                    {interval === 'annual' && <p className="mt-1 text-[11px] font-semibold text-[#0d5b2a]">{__t("You save ${amount} a year", { amount: planAnnualSavingsDollars(p) })}</p>}
                    <p className="mt-2 text-[11px] leading-snug text-[#33473d]">{p.botLimit === 1
                      ? __t("{sessions} chat sessions, 1 assistant", { sessions: p.chatSessionsLimit.toLocaleString('en-US') })
                      : p.botLimit === 'Unlimited'
                        ? __t("{sessions} chat sessions, unlimited assistants", { sessions: p.chatSessionsLimit.toLocaleString('en-US') })
                        : __t("{sessions} chat sessions, {bots} assistants", { sessions: p.chatSessionsLimit.toLocaleString('en-US'), bots: p.botLimit })}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-[#08251a]/10 bg-[#f5f3dd] p-4 text-sm leading-relaxed text-[#08251a]">
              {earlyBird && !cardsWork ? (
                <p><TRich text="Today: **$0**, and no card asked for. Your {days} early-bird days run until **{date}**. Loving it? Message us below and we will set up payment together." values={{ days: TRIAL_DAYS, date: fmtDate(new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString()) }} /></p>
              ) : expired ? (
                <p><TRich text={interval === 'annual' ? "Today: **${price}** for {plan}, then every year until you cancel." : "Today: **${price}** for {plan}, then every month until you cancel."} values={{ price, plan: plan.name }} /></p>
              ) : (
                <p>
                  <TRich text={interval === 'annual' ? "Today: **$0**. After {days} days ({date}): **${price}** for {plan}, charged automatically every year until you cancel. Cancel before that date and you pay nothing." : "Today: **$0**. After {days} days ({date}): **${price}** for {plan}, charged automatically every month until you cancel. Cancel before that date and you pay nothing."} values={{ days: TRIAL_DAYS, date: fmtDate(new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString()), price, plan: plan.name }} />
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col items-center gap-3">
              {earlyBird && (!cardsWork || checkoutFailed) ? (
                <SaveButton onClick={startEarlyBird} saving={busy} idleLabel="Start free trial" savingLabel="Getting things ready…" savedLabel="Welcome aboard!" className="px-6 py-3 text-sm" />
              ) : null}
              {cardsWork && !(earlyBird && checkoutFailed) ? (
                <SaveButton onClick={startCheckout} saving={busy} idleLabel={expired ? `Subscribe to ${plan.name}` : earlyBird ? 'Start free trial with a card' : 'Start free trial'} savingLabel="Opening secure checkout…" savedLabel="Opening…" className="px-6 py-3 text-sm" />
              ) : null}
              <p className="text-[11px] text-[#4b5d54]">{cardsWork ? <T>{'Secure payment by Stripe. '}</T> : ''}<T>By continuing you agree to the</T> <a className="underline" href="/terms" target="_blank" rel="noopener noreferrer"><T>Terms</T></a> <T>and</T> <a className="underline" href="/privacy" target="_blank" rel="noopener noreferrer"><T>Privacy Policy</T></a>.</p>
              {data.complimentary?.canRedeem ? (
                <div className="w-full max-w-sm text-center">
                  {!codeOpen ? (
                    <button type="button" onClick={() => setCodeOpen(true)} className="text-xs font-semibold text-[#0d5b2a] underline cursor-pointer"><T>Have an access code?</T></button>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); redeemCode(); }} className="rounded-2xl border border-[#08251a]/15 bg-[#f5f3dd] p-3 text-left">
                      <label htmlFor="sg-code" className="block text-xs font-semibold text-[#08251a]"><T>Access code</T></label>
                      <div className="mt-1.5 flex gap-2">
                        <input
                          id="sg-code"
                          autoFocus
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          autoComplete="off"
                          autoCapitalize="characters"
                          spellCheck={false}
                          maxLength={40}
                          placeholder={__t("For example FRIEND-7K3Q9X")}
                          aria-describedby={codeError ? 'sg-code-error' : undefined}
                          aria-invalid={codeError ? true : undefined}
                          className="min-w-0 flex-1 rounded-lg border border-[#08251a]/25 bg-white px-3 py-2 text-sm uppercase tracking-wide text-[#08251a] outline-none focus:border-[#0d5b2a]"
                        />
                        <button type="submit" disabled={codeBusy} className="rounded-lg bg-[#08251a] px-4 py-2 text-xs font-bold text-white disabled:opacity-60 cursor-pointer">{codeBusy ? <T>{'Checking…'}</T> : <T>{'Apply'}</T>}</button>
                      </div>
                      {codeError ? <p id="sg-code-error" role="alert" className="mt-2 text-xs font-medium text-rose-700">{codeError}</p> : <p className="mt-2 text-[11px] text-[#4b5d54]"><T>A code gives you free access to a plan without a card.</T></p>}
                    </form>
                  )}
                </div>
              ) : null}
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-1.5 text-[11px] text-[#4b5d54] underline cursor-pointer"><LogOut className="h-3 w-3" /> <T>Sign out</T></button>
            </div>

            {showManual && (
              <div className="mt-6 rounded-2xl border border-[#08251a]/25 bg-[#abff44]/20 p-5">
                {ticketRef ? (
                  <div className="text-center" role="status">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-[#0d5b2a]" />
                    <p className="mt-2 text-base font-semibold text-[#08251a]"><T>Got it, thank you!</T></p>
                    <p className="mt-1 text-sm text-[#33473d]">{ticketRef !== 'sent' ? __t("Ticket {ticketRef} is open. ", { ticketRef: ticketRef }) : ''}<T>We will email you shortly to arrange payment. You can follow the conversation in the Support tab.</T></p>
                    {onOpenSupport && <button type="button" onClick={onOpenSupport} className="mt-3 rounded-full border border-[#08251a]/20 px-4 py-1.5 text-xs font-semibold text-[#08251a] hover:bg-[#08251a]/5 cursor-pointer"><T>Open Support</T></button>}
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg text-[#08251a]" style={{ fontFamily: 'var(--kx-serif, Georgia, serif)' }}><T>Prefer to pay now? Let us sort it out by hand.</T></h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#33473d]"><T>Our automatic card payments are still on their way. Until they land, we will happily arrange payment with you directly. Tell us which plan you want and anything we should know, and we will reply by email with the next step.</T></p>
                    <label htmlFor="sg-note" className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4b5d54]"><T>Your message</T></label>
                    <textarea
                      id="sg-note"
                      rows={3}
                      maxLength={1500}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={`I would like to pay for the ${plan.name} plan (${interval}).`}
                      className="mt-1 w-full rounded-xl border border-[#08251a]/15 bg-[#f5f3dd] px-3 py-2 text-sm text-[#08251a] placeholder:text-[#7a877f] focus:border-[#08251a]/60 focus:outline-none"
                    />
                    {noteError && <p role="alert" className="mt-1 text-xs text-rose-300">{noteError}</p>}
                    <button type="button" onClick={sendNote} disabled={sending} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#abff44] px-5 py-2 text-sm font-semibold text-[#08251a] hover:brightness-105 disabled:opacity-60 cursor-pointer">
                      <Send className="h-4 w-4" /> {sending ? <T>{'Sending…'}</T> : <T>{'Send to the team'}</T>}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  X,
  MessageSquare,
  Zap,
  TrendingUp,
  Check,
  Download,
} from 'lucide-react';
import { BILLING_PLANS, PlanTier } from '@/lib/billing/plans';

export interface BillingTabProps {
  billingData: any;
  fetchBilling: () => void;
  isLoadingBilling: boolean;
  planChangeMsg: { type: 'success' | 'error'; text: string } | null;
  setPlanChangeMsg: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  billingInterval: 'monthly' | 'annual';
  setBillingInterval: (interval: 'monthly' | 'annual') => void;
  changingPlanId: string | null;
  handleSwitchPlan: (planId: string) => void;
  setShowPaymentModal: (show: boolean) => void;
  handleDownloadInvoice: (inv: any) => void;
}

export const BillingTab: React.FC<BillingTabProps> = ({
  billingData,
  fetchBilling,
  isLoadingBilling,
  planChangeMsg,
  setPlanChangeMsg,
  billingInterval,
  setBillingInterval,
  changingPlanId,
  handleSwitchPlan,
  setShowPaymentModal,
  handleDownloadInvoice,
}) => {
  return (
    <div className="max-w-6xl space-y-7 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Plans, Usage &amp; Billing</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chat-session based billing. Never pay per message—pay only for engaged customer conversations ($0.50/chat overage).
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBilling}
          disabled={isLoadingBilling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingBilling ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span>Refresh Billing</span>
        </button>
      </div>

      {/* Plan change alert feedback */}
      {planChangeMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            planChangeMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{planChangeMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setPlanChangeMsg(null)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top 4 KPI & Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscription */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Plan</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white capitalize">
            {billingData?.planName || 'Starter'}
          </div>
          <div className="text-[11px] text-slate-400">
            Renews {new Date(billingData?.currentPeriodEnd || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Card 2: Chat Sessions Meter */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Chat Sessions Quota</span>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {billingData?.chatsUsed ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {billingData?.monthlyChatLimit ?? 100} chats
            </span>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${billingData?.percentUsed ?? 0}%` }}
                className={`h-full transition-all duration-500 ${
                  (billingData?.percentUsed ?? 0) > 90
                    ? 'bg-rose-500'
                    : (billingData?.percentUsed ?? 0) > 75
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{billingData?.percentUsed ?? 0}% used</span>
              <span>{billingData?.remainingChats ?? 100} chats left</span>
            </div>
          </div>
        </div>

        {/* Card 3: Overages & Unit Rate */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Overage Protection</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            ${(billingData?.overageRatePerChat ?? 0.50).toFixed(2)}
            <span className="text-xs text-slate-400 font-normal"> / chat</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {billingData?.overagesCount > 0
              ? `${billingData.overagesCount} extra chats (${billingData.overageCost})`
              : '0 overage chats this cycle'}
          </div>
        </div>

        {/* Card 4: Value Delivered / ROI */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Value Delivered</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            ~${billingData?.estimatedDollarSavings ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Saved {billingData?.estimatedHoursSaved ?? 0}h of human live chat
          </div>
        </div>
      </div>

      {/* Monthly vs Annual Billing Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Choose the Right Plan for Your Scale</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Predictable chat pricing. Upgrade or downgrade anytime with zero lock-in contracts.
          </p>
        </div>
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setBillingInterval('monthly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              billingInterval === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval('annual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              billingInterval === 'annual'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Annual</span>
            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* The 3 Pricing Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {BILLING_PLANS.map((plan) => {
          const isCurrent = (billingData?.planId || 'starter') === plan.id;
          const isChanging = changingPlanId === plan.id;
          const price = billingInterval === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border bg-white dark:bg-slate-900 p-6 flex flex-col justify-between transition relative shadow-xs ${
                plan.popular
                  ? 'border-blue-600 dark:border-blue-500 shadow-blue-500/10 shadow-lg ring-1 ring-blue-600 dark:ring-blue-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-xs">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {plan.highlight}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed min-h-[36px]">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {billingInterval === 'annual'
                      ? `Billed $${price * 12}/year (${plan.chatSessionsLimit.toLocaleString()} chats included)`
                      : `${plan.chatSessionsLimit.toLocaleString()} chat sessions included / month`}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Included Features:
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Plan Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isCurrent || Boolean(changingPlanId)}
                  onClick={() => handleSwitchPlan(plan.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                  }`}
                >
                  {isChanging ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Activating Plan...</span>
                    </>
                  ) : isCurrent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Current Active Plan</span>
                    </>
                  ) : (
                    <span>Switch to {plan.name} &rarr;</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Method & Invoice Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3">
        {/* Left Column: Payment Details */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Payment Method</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Update Card
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-12 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs font-mono">
                {billingData?.paymentMethod?.brand || 'VISA'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  •••• •••• •••• {billingData?.paymentMethod?.last4 || '4242'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Expires {billingData?.paymentMethod?.expMonth || 12}/{billingData?.paymentMethod?.expYear || 2028}
                </div>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold">
              Default
            </span>
          </div>

          <div className="text-xs space-y-1 pt-1">
            <div className="text-slate-500 dark:text-slate-400">Billing Email:</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
              {billingData?.billingEmail || 'billing@kortexai.com'}
            </div>
          </div>
        </div>

        {/* Right Column: Invoices & Receipts */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Billing History &amp; Receipts</h2>
            <span className="text-[11px] text-slate-400">Past cycles</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10.5px] uppercase font-semibold text-slate-400">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Description</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(billingData?.invoices || [
                  { id: 'inv_10928', date: '2026-09-01', planName: 'Starter (100 Chats / mo)', amount: 49, status: 'paid' },
                  { id: 'inv_10814', date: '2026-08-01', planName: 'Starter (100 Chats / mo)', amount: 49, status: 'paid' },
                ]).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{inv.date}</td>
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{inv.planName}</td>
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">${inv.amount}.00</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Paid
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(inv)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  HardDrive,
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
  handleOpenCustomerPortal?: () => void;
}

const GooglePayIcon = ({ className = 'h-3.5 w-auto' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 54 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.4 10.8V15.5H5.8V1.9H10C11.3 1.9 12.3 2.3 13.1 3.1C13.9 3.9 14.3 4.9 14.3 6.1C14.3 7.3 13.9 8.3 13.1 9.1C12.3 9.9 11.3 10.3 10 10.3H7.4V10.8ZM7.4 3.4V8.8H10.1C10.9 8.8 11.5 8.5 12 8C12.5 7.5 12.7 6.9 12.7 6.1C12.7 5.3 12.5 4.7 12 4.2C11.5 3.7 10.9 3.4 10.1 3.4H7.4Z" fill="currentColor"/>
    <path d="M18.8 6.8C20 6.8 21 7.1 21.7 7.7C22.4 8.3 22.8 9.2 22.8 10.3V15.5H21.3V14.3H21.2C20.6 15.3 19.7 15.8 18.5 15.8C17.5 15.8 16.6 15.5 16 14.9C15.4 14.3 15.1 13.5 15.1 12.6C15.1 11.6 15.4 10.9 16.1 10.3C16.8 9.7 17.7 9.4 18.8 9.4C19.7 9.4 20.6 9.6 21.3 10V9.7C21.3 9.1 21.1 8.6 20.6 8.2C20.1 7.8 19.5 7.6 18.9 7.6C17.9 7.6 17.2 8 16.7 8.8L15.3 7.9C16.1 6.8 17.3 6.3 18.8 6.3V6.8ZM16.7 12.6C16.7 13.1 16.9 13.5 17.3 13.8C17.7 14.1 18.2 14.3 18.7 14.3C19.4 14.3 20 14 20.5 13.5C21 13 21.3 12.4 21.3 11.7C20.7 11.2 20 11 19.1 11C18.4 11 17.8 11.2 17.4 11.5C16.9 11.8 16.7 12.1 16.7 12.6Z" fill="currentColor"/>
    <path d="M30.4 7.1L25.3 18.6H23.7L25.6 14.5L22.2 7.1H23.9L26.4 12.6H26.5L28.9 7.1H30.4Z" fill="currentColor"/>
    <path d="M47.8 10.3C47.8 9.7 47.7 9.2 47.6 8.7H41.3V11.2H45V13.1C44.8 14.1 44.2 14.9 43.3 15.5V17.5H45.9C47.4 16.1 48.3 14.1 48.3 11.7L47.8 10.3Z" fill="#4285F4"/>
    <path d="M41.3 17.9C43.1 17.9 44.7 17.3 45.9 16.2L43.3 14.2C42.6 14.7 41.7 15 40.7 15C38.9 15 37.4 13.8 36.8 12.2H34.1V14.3C35.4 16.9 38.1 18.6 41.3 18.6V17.9Z" fill="#34A853"/>
    <path d="M36.7 12.2C36.4 11.4 36.4 10.5 36.7 9.7V7.6H34.1C32.9 9.9 32.9 12.7 34.1 15L36.7 12.2Z" fill="#FBBC04"/>
    <path d="M41.3 7C42.3 7 43.2 7.4 43.9 8L45.8 6.1C44.6 5 43 4.3 41.3 4.3C38.1 4.3 35.4 6.1 34.1 8.7L36.7 10.8C37.3 9.2 38.8 8 40.6 8L41.3 7Z" fill="#EA4335"/>
  </svg>
);

const ApplePayIcon = ({ className = 'h-3.5 w-auto' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 45 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.1 7.2C8.6 7.8 7.7 8.3 6.9 8.2C6.8 7.3 7.2 6.4 7.7 5.8C8.2 5.2 9.2 4.7 9.9 4.7C10 5.6 9.6 6.5 9.1 7.2ZM9.9 8.4C8.8 8.3 7.8 9 7.2 9C6.6 9 5.8 8.4 4.9 8.4C3.8 8.4 2.8 9 2.2 10.1C1 12.2 1.9 15.3 3.1 17C3.7 17.8 4.3 18.8 5.2 18.7C6.1 18.6 6.4 18.1 7.5 18.1C8.6 18.1 8.9 18.7 9.8 18.7C10.7 18.7 11.3 17.8 11.9 17C12.6 16 12.9 15 12.9 14.9C12.8 14.9 10.8 14.1 10.8 11.8C10.8 9.9 12.4 8.9 12.5 8.8C11.5 7.4 10 7.3 9.9 8.4ZM18.2 5.1H15V18.6H16.8V14H18.2C20.6 14 22.3 12.3 22.3 9.6C22.3 6.9 20.6 5.1 18.2 5.1ZM18.1 12.4H16.8V6.7H18.1C19.7 6.7 20.6 7.7 20.6 9.6C20.6 11.4 19.7 12.4 18.1 12.4ZM27 9.7C25.4 9.7 24.3 10.8 24.2 12.4H28.4C28.3 10.8 27.2 9.7 27 9.7ZM24.2 14.1C24.4 15.7 25.5 16.7 27.1 16.7C28.2 16.7 29.1 16.1 29.5 15.2H31.1C30.4 17.1 28.9 18.2 27 18.2C24.4 18.2 22.5 16.3 22.5 13.8C22.5 11.3 24.4 9.4 27 9.4C29.6 9.4 31.4 11.2 31.4 13.7V14.1H24.2ZM35.8 9.6L37.8 15.6H37.9L39.9 9.6H41.7L38.7 17.4L37.6 20.3H35.8L36.8 17.8L34 9.6H35.8Z"/>
  </svg>
);

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
  handleOpenCustomerPortal,
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

      {/* Top 5 KPI & Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

        {/* Card 3: Knowledge Base Storage Meter */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Knowledge Storage</span>
            <HardDrive className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {billingData?.knowledgeStorage?.usedMb ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {billingData?.knowledgeStorage?.limitMb ?? 50} MB
            </span>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${billingData?.knowledgeStorage?.percentUsed ?? 0}%` }}
                className={`h-full transition-all duration-500 ${
                  (billingData?.knowledgeStorage?.percentUsed ?? 0) >= 100
                    ? 'bg-rose-500'
                    : (billingData?.knowledgeStorage?.percentUsed ?? 0) > 80
                    ? 'bg-amber-500'
                    : 'bg-purple-600'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{billingData?.knowledgeStorage?.percentUsed ?? 0}% used</span>
              <span>
                {Math.max(
                  0,
                  (billingData?.knowledgeStorage?.limitMb ?? 50) - (billingData?.knowledgeStorage?.usedMb ?? 0)
                ).toFixed(1)}{' '}
                MB free
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Overages & Unit Rate */}
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

        {/* Card 5: Value Delivered / ROI */}
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
                  <div className="flex items-center gap-1.5 text-[11.5px] text-blue-600 dark:text-blue-400 font-semibold mt-1.5">
                    <HardDrive className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {plan.knowledgeStorageLimitMb >= 1000
                        ? `${plan.knowledgeStorageLimitMb / 1000} GB`
                        : `${plan.knowledgeStorageLimitMb} MB`}{' '}
                      Knowledge Storage Included
                    </span>
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
                <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-slate-400">
                  <span>Cards</span>
                  <span>•</span>
                  <span className="inline-flex items-center text-slate-700 dark:text-slate-200 font-semibold" title="Google Pay supported">
                    <GooglePayIcon className="h-2.5 w-auto" />
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center text-slate-700 dark:text-slate-200 font-semibold" title="Apple Pay supported">
                    <ApplePayIcon className="h-2.5 w-auto" />
                  </span>
                </div>
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
            <div className="flex items-center gap-2">
              {handleOpenCustomerPortal && billingData?.stripeCustomerId && (
                <button
                  type="button"
                  onClick={handleOpenCustomerPortal}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Stripe Portal
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Update Card
              </button>
            </div>
          </div>

          {/* 1-Click Wallets Badge */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-[10.5px]">1-Click Checkout:</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center">
                <GooglePayIcon className="h-2.5 w-auto text-slate-700 dark:text-slate-200" />
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center">
                <ApplePayIcon className="h-2.5 w-auto text-slate-700 dark:text-slate-200" />
              </span>
            </div>
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
              {billingData?.billingEmail || 'billing@crescelo.com'}
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

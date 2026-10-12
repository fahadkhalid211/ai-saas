'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface SpendSummary {
  spendUsd: number;
  capUsd: number | null;
  percent: number | null;
  state: 'ok' | 'warning' | 'reached';
  resetsAt: string;
  metered: boolean;
}

interface CostCapCardProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  /** The assistant as last saved: spend is loaded for it, and reloaded after each save. */
  activeAssistant?: any;
}

const money = (n: number) => (n > 0 && n < 0.01 ? '<$0.01' : `$${n.toFixed(2)}`);

/**
 * Monthly spending limit on the customer's own AI key: an amount, what happens when it is reached, and this month's
 * estimated spend. Saved with the rest of the AI Engine settings.
 */
export function CostCapCard({ formData, setFormData, activeAssistant }: CostCapCardProps) {
  const __t = useT();
  const cap = formData.costCap || { enabled: false, monthlyUsd: 100, onLimit: 'fallback_groq' };
  const setCap = (patch: Partial<typeof cap>) => setFormData({ ...formData, costCap: { ...cap, ...patch } });

  const [spend, setSpend] = useState<SpendSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assistants/${id}/spend`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.spend) setSpend(data.spend);
    } catch {
      // the card still works without the spend figure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAssistant?.id) load(activeAssistant.id);
  }, [activeAssistant]);

  // the bar compares this month's spend with the amount being edited, so the owner sees the effect before saving
  const editedCap = Number(cap.monthlyUsd) > 0 ? Number(cap.monthlyUsd) : null;
  const spent = spend?.spendUsd ?? 0;
  const pct = cap.enabled && editedCap ? Math.min(100, (spent / editedCap) * 100) : 0;
  const state = !cap.enabled || !editedCap ? 'ok' : spent >= editedCap ? 'reached' : spent >= editedCap * 0.8 ? 'warning' : 'ok';
  const barColor = state === 'reached' ? 'bg-rose-500' : state === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
  const resets = spend?.resetsAt
    ? new Date(spend.resetsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
    : 'the 1st of next month';

  return (
    <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <T>Monthly cost cap</T>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            <T>Set a monthly limit on what this assistant can spend on your key. We warn you at 80%, and at 100% the
            assistant switches to the free Groq model or stops replying, whichever you choose.</T>
          </p>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{cap.enabled ? <T>{'On'}</T> : <T>{'Off'}</T>}</span>
          <input
            type="checkbox"
            role="switch"
            aria-label={__t("Enable monthly cost cap")}
            checked={Boolean(cap.enabled)}
            onChange={(e) => setCap({ enabled: e.target.checked })}
            className="h-4 w-4 accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>

      {cap.enabled && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cost-cap-amount" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <T>Cap per month (USD)</T>
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
              <input
                id="cost-cap-amount"
                type="number"
                inputMode="decimal"
                min={1}
                max={100000}
                step={1}
                value={cap.monthlyUsd ?? ''}
                onChange={(e) => setCap({ monthlyUsd: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-6 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              <T>Warning e-mail and notification at</T> {editedCap ? money(editedCap * 0.8) : '80%'}.
            </p>
          </div>

          <fieldset>
            <legend className="text-[11px] font-semibold text-slate-700 dark:text-slate-300"><T>When the cap is reached</T></legend>
            <div className="mt-1 space-y-1.5">
              {[
                { value: 'fallback_groq', label: 'Switch to the free Groq model', hint: 'Visitors keep getting answers at no cost to you.' },
                { value: 'stop', label: 'Stop replying', hint: 'Visitors see a "temporarily unavailable" message.' },
              ].map((o) => (
                <label key={o.value} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cost-cap-on-limit"
                    value={o.value}
                    checked={(cap.onLimit || 'fallback_groq') === o.value}
                    onChange={() => setCap({ onLimit: o.value })}
                    className="mt-0.5 accent-emerald-600"
                  />
                  <span>
                    <span className="block text-xs text-slate-800 dark:text-slate-100"><T>{o.label}</T></span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400"><T>{o.hint}</T></span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            <T>Estimated spend this month:</T> {money(spent)}
            {cap.enabled && editedCap ? __t(" of {n1}", { n1: money(editedCap) }) : ''}
          </span>
          <button
            type="button"
            onClick={() => activeAssistant?.id && load(activeAssistant.id)}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            aria-label={__t("Refresh spend")}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {cap.enabled && editedCap ? (
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
          </div>
        ) : null}
        {state === 'reached' && (
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1.5">
            <T>Cap reached:</T> {cap.onLimit === 'stop' ? <T>{'the assistant is not replying'}</T> : <T>{'replies use the free Groq model'}</T>}<T>. Raise
            the cap and save to switch back to your key.</T>
          </p>
        )}
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
          <T>Estimated from the tokens your provider reports; your provider&apos;s invoice may differ slightly. Resets on</T> {resets} <T>(UTC).</T>
        </p>
      </div>
    </div>
  );
}

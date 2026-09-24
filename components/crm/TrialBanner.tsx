'use client';

import { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface Trial {
  status: 'subscribed' | 'trialing' | 'expired' | 'legacy';
  daysLeft: number;
}

/** Tells the owner where the 14-day trial stands and links to plans. Shows nothing for paid and older workspaces. */
export function TrialBanner({ onChoosePlan }: { onChoosePlan: () => void }) {
  const [trial, setTrial] = useState<Trial | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/billing', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d?.trial && setTrial(d.trial))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (!trial || trial.status === 'subscribed' || trial.status === 'legacy') return null;

  const expired = trial.status === 'expired';
  const urgent = !expired && trial.daysLeft <= 3;
  return (
    <div
      role="status"
      className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs font-medium ${
        expired ? 'bg-rose-600 text-white' : urgent ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-slate-50 dark:bg-slate-800'
      }`}
    >
      <span className="flex items-center gap-2">
        {expired ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {expired
          ? 'Your free trial has ended. Your assistants are paused until you choose a plan. Your data is kept for 30 days.'
          : `Free trial: ${trial.daysLeft} ${trial.daysLeft === 1 ? 'day' : 'days'} left. No card needed until you choose a plan.`}
      </span>
      <button type="button" onClick={onChoosePlan} className="rounded-lg bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900 hover:bg-white cursor-pointer">
        {expired ? 'Choose a plan' : 'See plans'}
      </button>
    </div>
  );
}

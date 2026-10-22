'use client';

import { T } from '@/lib/i18n/context';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAiKeyHealth } from '@/lib/ai/use-key-health';

/**
 * Shown across the whole dashboard while the provider is refusing the assistant's saved AI key: customers get no answers, and the
 * owner should hear about it wherever they are, not only if they happen to open AI Settings. It appears within about a minute of the
 * key breaking (sooner if a customer's chat hits it) and disappears by itself once a working key is saved.
 */
export function AiKeyAlert({ assistant, onFix }: { assistant: any; onFix: () => void }) {
  const { health } = useAiKeyHealth(assistant?.id, assistant?.keyHealth);
  if (!assistant || health?.state !== 'invalid') return null;
  return (
    <div
      role="alert"
      data-key-banner="invalid"
      className="bg-gradient-to-r from-rose-500/15 via-red-500/10 to-rose-500/15 border-b border-rose-500/30 text-rose-950 dark:text-rose-200 px-4 py-2.5 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-xs"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
        <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono shrink-0">
          <T>AI Key Rejected</T>
        </span>
        <span className="text-slate-800 dark:text-rose-100 truncate sm:whitespace-normal">
          <strong><T>Your AI provider is refusing your key,</T></strong> <T>so your assistant cannot answer customers right now.</T>
          {health.message ? <span className="opacity-80"> ({health.message})</span> : null}
        </span>
      </div>
      <button
        type="button"
        onClick={onFix}
        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1 rounded-lg transition cursor-pointer shadow-xs shrink-0"
      >
        <T>Fix my key</T>
      </button>
    </div>
  );
}

'use client';

import { T, useT } from '@/lib/i18n/context';
import React from 'react';
import { Bot, Layers, ArrowRight, X } from 'lucide-react';

export interface NewAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  newAssistantName: string;
  setNewAssistantName: (name: string) => void;
  isAtQuota?: boolean;
  currentCount?: number;
  botLimit?: number | 'Unlimited';
  planName?: string;
  onUpgradePlan?: () => void;
  errorMessage?: string | null;
}

export const NewAssistantModal: React.FC<NewAssistantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newAssistantName,
  setNewAssistantName,
  isAtQuota = false,
  currentCount = 1,
  botLimit = 1,
  planName = 'Starter',
  onUpgradePlan,
  errorMessage,
}) => {
  const __t = useT();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                <T>Create New Business Assistant</T>
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {planName} <T>Plan &middot;</T> {currentCount} <T>of</T> {botLimit} <T>Bots Used</T>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition cursor-pointer"
            aria-label={__t("Close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isAtQuota ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span><T>Assistant Bot Limit Reached</T></span>
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300 leading-relaxed">
                <T>Your workspace is on the</T> <strong>{planName}</strong> <T>plan, which includes up to</T> <strong>{botLimit}</strong> <T>AI assistant bot. You are currently using</T> {currentCount} <T>of</T> {botLimit} <T>bot slots.</T>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <T>To create additional isolated bots with dedicated knowledge bases and service catalogs, upgrade to the</T> <strong><T>Growth</T></strong> <T>plan (up to 5 bots) or</T> <strong><T>Scale</T></strong> <T>plan (unlimited bots).</T>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <T>Close</T>
              </button>
              {onUpgradePlan && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUpgradePlan();
                  }}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span><T>Upgrade to Growth</T></span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <T>Create an isolated assistant with its own knowledge base, prompt instructions, and website widget.</T>
            </p>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  <T>Assistant Name</T>
                </label>
                <input
                  type="text"
                  required
                  placeholder={__t("e.g. Sales Specialist, Store Support AI")}
                  value={newAssistantName}
                  onChange={(e) => setNewAssistantName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <T>Cancel</T>
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
                >
                  <T>Create Assistant</T>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

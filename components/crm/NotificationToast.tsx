'use client';

import React from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationToastProps {
  incomingToast: { title: string; message: string } | null;
  setIncomingToast: (toast: { title: string; message: string } | null) => void;
  setIsNotifOpen: (open: boolean) => void;
}

export function NotificationToast({
  incomingToast,
  setIncomingToast,
  setIsNotifOpen,
}: NotificationToastProps) {
  if (!incomingToast) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-blue-500/40 dark:border-blue-500/30 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3">
      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
        <Bell className="w-5 h-5 animate-bounce" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{incomingToast.title}</span>
          <button
            type="button"
            onClick={() => setIncomingToast(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{incomingToast.message}</p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIncomingToast(null);
              setIsNotifOpen(true);
            }}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            View Notifications
          </button>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span className="text-[10px] text-slate-400 font-mono">Just now</span>
        </div>
      </div>
    </div>
  );
}

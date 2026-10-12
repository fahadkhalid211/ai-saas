'use client';

import { T } from '@/lib/i18n/context';
import React from 'react';
import {
  Trash2,
  RefreshCw,
  AlertTriangle,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { LandingPageConfig } from '@/lib/landing/types';

interface DeleteLandingPageModalProps {
  page: LandingPageConfig | null;
  isOpen: boolean;
  isDeleting: boolean;
  progress: number;
  statusMessage: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteLandingPageModal: React.FC<DeleteLandingPageModalProps> = ({
  page,
  isOpen,
  isDeleting,
  progress,
  statusMessage,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !page) return null;

  const liveUrl = `/site/${page.slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            {isDeleting ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : (
              <Trash2 className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isDeleting ? <T>{'Deleting Landing Page...'}</T> : <T>{'Delete Landing Page?'}</T>}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isDeleting
                ? <T>{'Deconstructing cloud assets and unbinding routes...'}</T>
                : <T>{'This action cannot be undone. All public traffic and booking routes will be removed.'}</T>}
            </p>
          </div>
        </div>

        {/* Page Identity Summary Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {page.businessName || <T>{'Untitled Page'}</T>}
              </span>
            </div>
            <span className="font-mono text-[10.5px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
              <T>/site/</T>{page.slug}
            </span>
          </div>

          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {page.heroHeadline || <T>{page.tagline}</T> || <T>{'Hosted business landing page.'}</T>}
          </p>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span><T>Live route:</T> <strong className="text-slate-700 dark:text-slate-300">{liveUrl}</strong></span>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span><T>Preview</T></span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Progress Bar Display when deleting */}
        {isDeleting ? (
          <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                <span>{statusMessage || <T>{'Processing deletion...'}</T>}</span>
              </span>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                {progress}%
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-3.5 rounded-full bg-white dark:bg-slate-900 overflow-hidden p-0.5 border border-rose-200 dark:border-rose-900/60 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-300 relative overflow-hidden"
                style={{ width: `${Math.max(5, progress)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            <div className="text-[10.5px] text-rose-700 dark:text-rose-300 font-mono text-center">
              <T>Please wait while database and cloud assets are permanently deallocated.</T>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <T>Deleting this page will instantly deactivate public access to</T> <strong><T>/site/</T>{page.slug}</strong><T>, disconnect any attached AI concierge, and remove appointment slots.</T>
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <T>Cancel</T>
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span><T>Deleting (</T>{progress}%)...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span><T>Yes, Delete Landing Page</T></span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

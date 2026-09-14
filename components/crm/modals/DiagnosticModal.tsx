'use client';

import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { diagnoseKnowledgeFailure } from '@/lib/rag/diagnostics';
import { KnowledgeSource } from '@/components/crm/KnowledgeTab';

export interface DiagnosticModalProps {
  failedSource: KnowledgeSource | null;
  onClose: () => void;
  onDeleteSource: (id: string) => void | Promise<void>;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  failedSource,
  onClose,
  onDeleteSource,
}) => {
  if (!failedSource) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const diag = diagnoseKnowledgeFailure({
    filename: failedSource.title,
    type: failedSource.type,
    errorMessage: failedSource.errorMessage,
    fileSizeBytes: failedSource.fileSizeBytes,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                File Indexing Diagnostic
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm" title={failedSource.title}>
                {failedSource.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Cards */}
        <div className="space-y-3.5 text-xs">
          {/* Card 1: Why it failed */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              Why This File Failed:
            </div>
            <p className="text-rose-900 dark:text-rose-200 leading-relaxed">
              {diag.reason}
            </p>
          </div>

          {/* Card 2: What you should do next */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              What You Should Do Next:
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {diag.whatToDoNext}
            </p>
          </div>

          {/* Metadata summary */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <div>
              Type: <span className="font-semibold uppercase text-slate-700 dark:text-slate-200">{failedSource.type}</span>
            </div>
            {failedSource.fileSizeBytes && (
              <div>
                Size: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBytes(failedSource.fileSizeBytes)}</span>
              </div>
            )}
            <div>
              Logged: <span className="text-slate-700 dark:text-slate-200">{new Date(failedSource.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Technical details accordion */}
          {failedSource.errorMessage && (
            <details className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <summary className="cursor-pointer font-semibold hover:text-slate-800 dark:hover:text-slate-200">
                View Technical Log Details
              </summary>
              <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-900 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {failedSource.errorMessage}
              </pre>
            </details>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={async () => {
              await onDeleteSource(failedSource.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Failed Record</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

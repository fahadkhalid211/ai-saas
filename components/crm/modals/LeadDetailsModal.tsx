'use client';

import { T } from '@/lib/i18n/context';
import React from 'react';
import { Users, X, ExternalLink } from 'lucide-react';
import { Lead } from '@/components/crm/LeadsTab';

export interface LeadDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
  assistantName?: string;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  onClose,
  assistantName,
}) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lead.name || <T>{'Website Visitor'}</T>}
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                {lead.email}
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

        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide"><T>Phone Number</T></div>
              <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                {lead.phone || <T>{'Not provided'}</T>}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide"><T>Submission Date</T></div>
              <div className="text-slate-800 dark:text-slate-200 mt-0.5">
                {new Date(lead.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {lead.customData && Object.keys(lead.customData).length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <T>Custom Fields</T>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                {Object.entries(lead.customData).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center text-xs border-b border-slate-200/50 dark:border-slate-700/50 pb-1.5 last:border-none last:pb-0">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{key}:</span>
                    <span className="font-medium text-slate-900 dark:text-white font-mono">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visitor Comments */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              <T>Visitor Comments / Message</T>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {lead.notes || <span className="text-slate-400 italic"><T>No additional comments provided.</T></span>}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <a
              href={`mailto:${lead.email}?subject=Re:%20Support%20Inquiry%20via%20${encodeURIComponent(assistantName || 'AI Assistant')}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <span><T>Reply Email</T></span>
              <ExternalLink className="h-3 w-3" />
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition"
              >
                <span><T>Call</T></span>
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <T>Close</T>
          </button>
        </div>
      </div>
    </div>
  );
};

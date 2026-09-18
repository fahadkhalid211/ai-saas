'use client';

import React from 'react';
import { RefreshCw, Download } from 'lucide-react';

export interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  notes?: string;
  customData?: Record<string, any>;
  createdAt: string;
}

export interface LeadsTabProps {
  leads: Lead[];
  handleManualSyncLeads: () => void | Promise<void>;
  isSyncingLeads: boolean;
  activeAssistant: { name?: string; id?: string } | null;
  setSelectedLeadModal: (lead: Lead) => void;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({
  leads,
  handleManualSyncLeads,
  isSyncingLeads,
  activeAssistant,
  setSelectedLeadModal,
}) => {
  return (
    <div className="max-w-6xl space-y-6 mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Leads</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                       View contact details and inquiries automatically captured by your assistant.
                     </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Sync Active</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleManualSyncLeads}
                      disabled={isSyncingLeads}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                      title="Fetch newest leads right now"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLeads ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                      <span>{isSyncingLeads ? 'Syncing...' : 'Sync Now'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const csvHeader = 'ID,Name,Email,Phone,Comments,Custom Fields,Date\n';
                        const csvRows = leads
                          .map((l) => {
                            const customStr = l.customData
                              ? Object.entries(l.customData)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(' | ')
                              : '';
                            return `"${l.id}","${(l.name || '').replace(/"/g, '""')}","${l.email}","${(l.phone || '').replace(/"/g, '""')}","${(l.notes || '').replace(/"/g, '""')}","${customStr.replace(/"/g, '""')}","${l.createdAt}"`;
                          })
                          .join('\n');
                        const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `leads-${activeAssistant?.name || 'export'}.csv`;
                        a.click();
                      }}
                      disabled={leads.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                  {leads.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No leads or support requests captured yet. When visitors use the support form in the widget, submissions will appear here.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-5">Visitor Contact</th>
                          <th className="py-3 px-5">Phone</th>
                          <th className="py-3 px-5">Comments / Notes</th>
                          <th className="py-3 px-5">Custom Fields</th>
                          <th className="py-3 px-5">Date</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leads.map((lead) => {
                          const customEntries = lead.customData ? Object.entries(lead.customData) : [];
                          return (
                            <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-5">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {lead.name || 'Website Visitor'}
                                </div>
                                <div className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                                  {lead.email}
                                </div>
                              </td>
                              <td className="py-3.5 px-5 font-mono text-slate-700 dark:text-slate-300">
                                {lead.phone || '—'}
                              </td>
                              <td className="py-3.5 px-5 max-w-[200px]">
                                {lead.notes ? (
                                  <span className="text-slate-600 dark:text-slate-400 line-clamp-2" title={lead.notes}>
                                    {lead.notes}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">None</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5">
                                {customEntries.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 max-w-[220px]">
                                    {customEntries.map(([k, v]) => (
                                      <span
                                        key={k}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                      >
                                        <strong className="font-medium mr-1">{k}:</strong> {String(v)}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                                {new Date(lead.createdAt).toLocaleDateString()}{' '}
                                <span className="text-[10px] opacity-75">
                                  {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedLeadModal(lead)}
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 px-2.5 py-1 rounded transition cursor-pointer"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
  );
};

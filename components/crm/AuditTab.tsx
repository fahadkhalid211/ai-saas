'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardList, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface AuditTabProps {
  auditLogs: any[];
  isSyncingAudit: boolean;
  fetchAuditLogs: () => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  auditLogs,
  isSyncingAudit,
  fetchAuditLogs,
}) => {
  const __t = useT();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  // Filter logs by search term (actor name, email, action, target)
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return auditLogs;
    const q = searchQuery.toLowerCase().trim();
    return auditLogs.filter((log) => {
      const name = (log.actor?.name || '').toLowerCase();
      const email = (log.actor?.email || log.details?.email || log.details?.attemptedEmail || '').toLowerCase();
      const username = (log.actor?.username || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const targetType = (log.targetType || '').toLowerCase();
      const ip = (log.actor?.ip || '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        username.includes(q) ||
        action.includes(q) ||
        targetType.includes(q) ||
        ip.includes(q)
      );
    });
  }, [auditLogs, searchQuery]);

  // Always sort newest logs to the very top
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filteredLogs]);

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLogs.slice(start, start + pageSize);
  }, [sortedLogs, currentPage, pageSize]);

  const startEntry = sortedLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(sortedLogs.length, currentPage * pageSize);

  return (
    <div className="max-w-5xl space-y-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span><T>Audit Trail</T></span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <T>A complete log of every action taken in your workspace — logins, settings changes, and plan updates.</T>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder={__t("Search user, email, action...")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 sm:w-64 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="button"
            onClick={fetchAuditLogs}
            disabled={isSyncingAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingAudit ? 'animate-spin text-blue-600' : ''}`} />
            <span><T>Refresh Logs</T></span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4"><T>Timestamp</T></th>
                <th className="py-3 px-4"><T>Actor</T></th>
                <th className="py-3 px-4"><T>User Email / Username</T></th>
                <th className="py-3 px-4"><T>Action Event</T></th>
                <th className="py-3 px-4"><T>Target</T></th>
                <th className="py-3 px-4"><T>IP Address</T></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {searchQuery ? <T>{'No matching audit logs found for your search.'}</T> : <T>{'No security audit logs recorded yet.'}</T>}
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const userEmail = log.actor?.email || log.details?.email || log.details?.attemptedEmail || log.details?.ownerEmail;
                  const username = log.actor?.username || (userEmail ? userEmail.split('@')[0] : null);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {log.actor?.name || <T>{'Admin'}</T>}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {userEmail ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 font-medium">
                            {userEmail}
                          </span>
                        ) : username ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            @{username}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic"><T>system</T></span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {log.targetType}{log.targetId ? ` (${log.targetId.slice(0, 10)})` : ''}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.actor?.ip || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedLogs.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <T>Showing</T> {startEntry} <T>to</T> {endEntry} <T>of</T> {sortedLogs.length} <T>entries</T>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label={__t("Previous Page")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, and near current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && page - prev > 1;
                    return (
                      <React.Fragment key={page}>
                        {hasGap && <span className="px-1 text-slate-400">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[28px] h-7 px-2 rounded-lg font-mono text-[11px] font-semibold transition cursor-pointer ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                aria-label={__t("Next Page")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

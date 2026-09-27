'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, Clock, Download, RefreshCw, Search, ShieldAlert, Users, X, Zap } from 'lucide-react';

/** Master-admin only. The server enforces this (404 for everyone else); the tab is also only shown to the master admin. */

interface LogEntry {
  id: string;
  ts: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  category: string;
  event: string;
  message: string | null;
  requestId: string | null;
  method: string | null;
  route: string | null;
  path: string | null;
  status: number | null;
  durationMs: number | null;
  userId: string | null;
  workspaceId: string | null;
  role: string | null;
  ip: string | null;
  userAgent: string | null;
  deployment: string | null;
  errorName: string | null;
  errorMessage: string | null;
  errorStack: string | null;
  fingerprint: string | null;
  meta: Record<string, unknown> | null;
}

interface Summary {
  hours: number;
  totals: { requests: number; errors: number; warnings: number; serverErrors: number; activeUsers: number; activeUsersHour: number };
  byHour: Array<{ hour: string; errors: number; warnings: number; requests: number }>;
  topFailingRoutes: Array<{ route: string; method: string | null; failures: number; lastSeen: string }>;
  errorGroups: Array<{ fingerprint: string; count: number; firstSeen: string; lastSeen: string; event: string; category: string; message: string | null; route: string | null }>;
  slowestRoutes: Array<{ route: string; method: string | null; requests: number; p50: number; p95: number }>;
  storage: { rows: number; bytes: number; oldest: string | null };
}

const RANGES: Array<{ id: string; label: string; ms: number; hours: number }> = [
  { id: '15m', label: 'Last 15 min', ms: 15 * 60_000, hours: 1 },
  { id: '1h', label: 'Last hour', ms: 3_600_000, hours: 1 },
  { id: '6h', label: 'Last 6 hours', ms: 6 * 3_600_000, hours: 6 },
  { id: '24h', label: 'Last 24 hours', ms: 24 * 3_600_000, hours: 24 },
  { id: '7d', label: 'Last 7 days', ms: 7 * 24 * 3_600_000, hours: 24 * 7 },
  { id: '30d', label: 'Last 30 days', ms: 30 * 24 * 3_600_000, hours: 24 * 30 },
];

const CATEGORIES = ['request', 'auth', 'security', 'db', 'llm', 'rag', 'webhook', 'billing', 'booking', 'knowledge', 'voice', 'client', 'system', 'audit', 'cron', 'admin'];
const LEVELS: Array<LogEntry['level']> = ['fatal', 'error', 'warn', 'info', 'debug'];

const LEVEL_STYLE: Record<string, string> = {
  fatal: 'bg-rose-700 text-white',
  error: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  debug: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const inputClass =
  'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 px-2.5 py-1.5 outline-none focus:border-blue-500';

function fmtTime(ts: string): string {
  const d = new Date(ts);
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour12: false })}`;
}

function relative(ts: string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export const SystemLogsTab: React.FC = () => {
  const [range, setRange] = useState('1h');
  const [levels, setLevels] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [userId, setUserId] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [statusClass, setStatusClass] = useState<'' | '4xx' | '5xx'>('');
  const [route, setRoute] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [view, setView] = useState<'events' | 'groups' | 'routes'>('events');

  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trace, setTrace] = useState<{ requestId: string; entries: LogEntry[] } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const query = useCallback(
    (extra: Record<string, string> = {}) => {
      const p = new URLSearchParams();
      const r = RANGES.find((x) => x.id === range) || RANGES[1];
      p.set('from', new Date(Date.now() - r.ms).toISOString());
      if (levels.size) p.set('levels', [...levels].join(','));
      if (category) p.set('categories', category);
      if (debouncedQ) p.set('q', debouncedQ);
      if (userId.trim()) p.set('userId', userId.trim());
      if (workspaceId.trim()) p.set('workspaceId', workspaceId.trim());
      if (route.trim()) p.set('route', route.trim());
      if (fingerprint) p.set('fingerprint', fingerprint);
      if (statusClass === '4xx') {
        p.set('statusMin', '400');
        p.set('statusMax', '499');
      }
      if (statusClass === '5xx') p.set('statusMin', '500');
      for (const [k, v] of Object.entries(extra)) p.set(k, v);
      return p;
    },
    [range, levels, category, debouncedQ, userId, workspaceId, route, fingerprint, statusClass]
  );

  const loadFirstPage = useCallback(
    async (silent = false) => {
      const seq = ++requestSeq.current;
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`/api/master/logs?${query({ limit: live ? '100' : '50' }).toString()}`, { cache: 'no-store' });
        if (res.status === 401 || res.status === 404) throw new Error('This page is only available to the platform owner.');
        if (!res.ok) throw new Error('Could not load the log.');
        const data = await res.json();
        if (seq !== requestSeq.current) return;
        setEntries(data.entries || []);
        setCursor(data.nextCursor || null);
        setError(null);
      } catch (e) {
        if (seq === requestSeq.current) setError((e as Error).message);
      } finally {
        if (seq === requestSeq.current && !silent) setLoading(false);
      }
    },
    [query, live]
  );

  const loadSummary = useCallback(async () => {
    try {
      const hours = (RANGES.find((x) => x.id === range) || RANGES[1]).hours;
      const res = await fetch(`/api/master/logs/summary?hours=${Math.max(hours, 24)}`, { cache: 'no-store' });
      if (res.ok) setSummary(await res.json());
    } catch {
      // the summary is optional
    }
  }, [range]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);
  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  // Live view: re-read the newest rows every 5 seconds.
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      void loadFirstPage(true);
      void loadSummary();
    }, 5000);
    return () => clearInterval(t);
  }, [live, loadFirstPage, loadSummary]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/master/logs?${query({ before: cursor, limit: '50' }).toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Could not load more.');
      const data = await res.json();
      setEntries((prev) => [...prev, ...(data.entries || [])]);
      setCursor(data.nextCursor || null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openTrace = async (requestId: string) => {
    const p = new URLSearchParams({ requestId, order: 'asc', limit: '200' });
    const res = await fetch(`/api/master/logs?${p.toString()}`, { cache: 'no-store' });
    if (res.ok) setTrace({ requestId, entries: (await res.json()).entries || [] });
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      // clipboard blocked
    }
  };

  const toggleLevel = (l: string) =>
    setLevels((prev) => {
      const next = new Set(prev);
      if (next.has(l)) next.delete(l);
      else next.add(l);
      return next;
    });

  const clearFilters = () => {
    setLevels(new Set());
    setCategory('');
    setQ('');
    setUserId('');
    setWorkspaceId('');
    setStatusClass('');
    setRoute('');
    setFingerprint('');
  };

  const filtersActive = levels.size > 0 || category || q || userId || workspaceId || statusClass || route || fingerprint;
  const maxHour = useMemo(() => Math.max(1, ...(summary?.byHour.map((h) => h.errors + h.warnings) || [1])), [summary]);
  const exportUrl = (format: 'csv' | 'ndjson') => `/api/master/logs/export?${query({ format }).toString()}`;
  const errorRate = summary && summary.totals.requests > 0 ? (summary.totals.serverErrors / summary.totals.requests) * 100 : 0;

  return (
    <div className="max-w-7xl space-y-5 mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>System Logs</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">Owner only</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every request, sign-in, error and background job, with user, workspace, request id and timing. Passwords, keys and message text are never stored.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLive((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              live ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{live ? 'Live' : 'Go live'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              void loadFirstPage();
              void loadSummary();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <a href={exportUrl('csv')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </a>
          <a href={exportUrl('ndjson')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <Download className="h-3.5 w-3.5" />
            <span>JSON</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { label: 'Errors (24h)', value: summary.totals.errors, icon: ShieldAlert, tone: summary.totals.errors ? 'text-rose-600' : 'text-emerald-600' },
            { label: 'Warnings (24h)', value: summary.totals.warnings, icon: AlertTriangle, tone: 'text-amber-600' },
            { label: 'Requests (24h)', value: summary.totals.requests.toLocaleString(), icon: Zap, tone: 'text-sky-600' },
            { label: 'Server error rate', value: `${errorRate.toFixed(2)}%`, icon: Activity, tone: errorRate > 1 ? 'text-rose-600' : 'text-emerald-600' },
            { label: 'Active users (24h)', value: `${summary.totals.activeUsers} (${summary.totals.activeUsersHour} in 1h)`, icon: Users, tone: 'text-indigo-600' },
            { label: 'Log storage', value: `${fmtBytes(summary.storage.bytes)}`, icon: Clock, tone: 'text-slate-600' },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <c.icon className={`h-3.5 w-3.5 ${c.tone}`} />
                <span>{c.label}</span>
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {summary && summary.byHour.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">Errors and warnings per hour</div>
          <div className="flex items-end gap-1 h-16" role="img" aria-label="Errors and warnings per hour">
            {summary.byHour.map((h) => (
              <div key={h.hour} className="flex-1 min-w-[3px] flex flex-col justify-end" title={`${fmtTime(h.hour)}: ${h.errors} errors, ${h.warnings} warnings, ${h.requests} requests`}>
                <div className="bg-amber-400" style={{ height: `${(h.warnings / maxHour) * 100}%` }} />
                <div className="bg-rose-500" style={{ height: `${(h.errors / maxHour) * 100}%`, minHeight: h.errors ? 2 : 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold w-fit">
        {([['events', 'Events'], ['groups', 'Error groups'], ['routes', 'Slow & failing routes']] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${view === id ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'events' && (
        <>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <select value={range} onChange={(e) => setRange(e.target.value)} className={inputClass} aria-label="Time range">
                {RANGES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLevel(l)}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-bold uppercase transition cursor-pointer border ${levels.has(l) ? `${LEVEL_STYLE[l]} border-transparent ring-2 ring-blue-500/40` : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} aria-label="Category">
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select value={statusClass} onChange={(e) => setStatusClass(e.target.value as '' | '4xx' | '5xx')} className={inputClass} aria-label="Status">
                <option value="">Any status</option>
                <option value="4xx">4xx (client errors)</option>
                <option value="5xx">5xx (server errors)</option>
              </select>
              <div className="relative">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search message, event, route, error…" className={`${inputClass} w-64 pl-7`} />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User id" className={`${inputClass} w-40 font-mono`} />
              <input value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} placeholder="Workspace id" className={`${inputClass} w-40 font-mono`} />
              <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="Route, e.g. /api/chat" className={`${inputClass} w-48 font-mono`} />
              {fingerprint && (
                <button type="button" onClick={() => setFingerprint('')} className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-semibold cursor-pointer">
                  <span>Error group {fingerprint.slice(0, 8)}</span>
                  <X className="h-3 w-3" />
                </button>
              )}
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 underline cursor-pointer">
                  Clear filters
                </button>
              )}
              {live && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Live: newest 100 rows, updating every 5 s</span>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Level</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Route</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Time taken</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Request</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">{loading ? 'Loading…' : 'Nothing matches these filters.'}</td>
                    </tr>
                  )}
                  {entries.map((e) => (
                    <React.Fragment key={e.id}>
                      <tr onClick={() => setExpanded(expanded === e.id ? null : e.id)} tabIndex={0} aria-expanded={expanded === e.id} onKeyDown={(ev) => { if (ev.target === ev.currentTarget && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); setExpanded(expanded === e.id ? null : e.id); } }} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 align-top">
                        <td className="py-2 px-3 whitespace-nowrap font-mono text-[11px]" title={e.ts}>
                          <div>{fmtTime(e.ts)}</div>
                          <div className="text-slate-400">{relative(e.ts)}</div>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${LEVEL_STYLE[e.level]}`}>{e.level}</span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{e.event}</div>
                          <div className="text-slate-500 dark:text-slate-400 max-w-md truncate">{e.errorMessage || e.message || ''}</div>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">{e.method ? `${e.method} ` : ''}{e.route || ''}</td>
                        <td className="py-2 px-3 font-mono">{e.status ?? ''}</td>
                        <td className="py-2 px-3 font-mono">{e.durationMs !== null ? `${e.durationMs} ms` : ''}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 max-w-[9rem] truncate" title={e.userId || ''}>{e.userId || '-'}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{e.requestId ? e.requestId.slice(0, 8) : ''}</td>
                      </tr>
                      {expanded === e.id && (
                        <tr className="bg-slate-50 dark:bg-slate-950/40">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {e.requestId && (
                                <button type="button" onClick={() => void openTrace(e.requestId!)} className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-semibold cursor-pointer">Trace this request</button>
                              )}
                              {e.userId && (
                                <button type="button" onClick={() => setUserId(e.userId!)} className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-[11px] font-semibold cursor-pointer">Only this user</button>
                              )}
                              {e.workspaceId && (
                                <button type="button" onClick={() => setWorkspaceId(e.workspaceId!)} className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-[11px] font-semibold cursor-pointer">Only this workspace</button>
                              )}
                              {e.fingerprint && (
                                <button type="button" onClick={() => setFingerprint(e.fingerprint!)} className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-[11px] font-semibold cursor-pointer">Same error</button>
                              )}
                              <button type="button" onClick={() => void copy(JSON.stringify(e, null, 2), e.id)} className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-[11px] font-semibold cursor-pointer">{copied === e.id ? 'Copied' : 'Copy JSON'}</button>
                            </div>
                            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[11px] mb-2">
                              {([['Request id', e.requestId], ['User', e.userId], ['Workspace', e.workspaceId], ['Role', e.role], ['IP', e.ip], ['Path', e.path], ['Category', e.category], ['Deployment', e.deployment]] as const).map(([k, v]) => (
                                <div key={k}>
                                  <dt className="text-slate-400">{k}</dt>
                                  <dd className="font-mono text-slate-800 dark:text-slate-200 break-all">{v || '-'}</dd>
                                </div>
                              ))}
                            </dl>
                            {e.userAgent && <div className="text-[11px] text-slate-500 mb-2 break-all">{e.userAgent}</div>}
                            {(e.errorName || e.errorMessage) && (
                              <div className="mb-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-2.5">
                                <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300">{e.errorName}: {e.errorMessage}</div>
                                {e.errorStack && <pre className="mt-1 text-[10.5px] leading-snug text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all max-h-56 overflow-auto">{e.errorStack}</pre>}
                              </div>
                            )}
                            {e.meta && <pre className="text-[11px] leading-snug bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 overflow-auto max-h-56">{JSON.stringify(e.meta, null, 2)}</pre>}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {cursor && !live && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button type="button" onClick={() => void loadMore()} disabled={loading} className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50">
                  {loading ? 'Loading…' : 'Load older'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {view === 'groups' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Error</th>
                <th className="py-2.5 px-3">Where</th>
                <th className="py-2.5 px-3">Times</th>
                <th className="py-2.5 px-3">First seen</th>
                <th className="py-2.5 px-3">Last seen</th>
                <th className="py-2.5 px-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(summary?.errorGroups || []).length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">No errors in this period.</td></tr>
              )}
              {(summary?.errorGroups || []).map((g) => (
                <tr key={g.fingerprint}>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{g.event}</div>
                    <div className="text-slate-500 dark:text-slate-400 max-w-lg truncate">{g.message}</div>
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px]">{g.category}{g.route ? ` · ${g.route}` : ''}</td>
                  <td className="py-2 px-3 font-bold text-rose-600">{g.count}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{fmtTime(g.firstSeen)}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{relative(g.lastSeen)}</td>
                  <td className="py-2 px-3">
                    <button type="button" onClick={() => { setFingerprint(g.fingerprint); setView('events'); setRange('24h'); }} className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-semibold cursor-pointer">Show events</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'routes' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">Most failing routes (5xx)</div>
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(summary?.topFailingRoutes || []).length === 0 && <tr><td className="py-8 text-center text-slate-400">No server errors in this period.</td></tr>}
                {(summary?.topFailingRoutes || []).map((r) => (
                  <tr key={`${r.method}${r.route}`} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" tabIndex={0} onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setRoute(r.route); setStatusClass('5xx'); setView('events'); } }} onClick={() => { setRoute(r.route); setStatusClass('5xx'); setView('events'); }}>
                    <td className="py-2 px-3 font-mono text-[11px]">{r.method} {r.route}</td>
                    <td className="py-2 px-3 font-bold text-rose-600 text-right">{r.failures}</td>
                    <td className="py-2 px-3 text-slate-500 text-right whitespace-nowrap">{relative(r.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">Slowest routes (95th percentile)</div>
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(summary?.slowestRoutes || []).length === 0 && <tr><td className="py-8 text-center text-slate-400">Not enough traffic yet.</td></tr>}
                {(summary?.slowestRoutes || []).map((r) => (
                  <tr key={`${r.method}${r.route}`} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" tabIndex={0} onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setRoute(r.route); setView('events'); } }} onClick={() => { setRoute(r.route); setView('events'); }}>
                    <td className="py-2 px-3 font-mono text-[11px]">{r.method} {r.route}</td>
                    <td className="py-2 px-3 text-right">p50 {r.p50} ms</td>
                    <td className="py-2 px-3 font-bold text-right">p95 {r.p95} ms</td>
                    <td className="py-2 px-3 text-slate-500 text-right">{r.requests}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {summary && (
        <p className="text-[11px] text-slate-400">
          Logs are kept for 30 days{summary.storage.oldest ? ` (oldest entry ${fmtTime(summary.storage.oldest)})` : ''} and then deleted automatically.
        </p>
      )}

      {trace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Request trace" onClick={() => setTrace(null)}>
          <div className="w-full max-w-3xl max-h-[85vh] overflow-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">Everything that happened in one request</div>
                <div className="text-[11px] font-mono text-slate-500 break-all">{trace.requestId}</div>
              </div>
              <button type="button" onClick={() => setTrace(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <ol className="space-y-2">
              {trace.entries.map((e) => (
                <li key={e.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">{new Date(e.ts).toLocaleTimeString(undefined, { hour12: false })}.{String(new Date(e.ts).getMilliseconds()).padStart(3, '0')}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${LEVEL_STYLE[e.level]}`}>{e.level}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{e.event}</span>
                    {e.status !== null && <span className="font-mono">{e.status}</span>}
                    {e.durationMs !== null && <span className="font-mono text-slate-500">{e.durationMs} ms</span>}
                  </div>
                  {(e.errorMessage || e.message) && <div className="mt-1 text-slate-600 dark:text-slate-300 break-words">{e.errorMessage || e.message}</div>}
                  {e.errorStack && <pre className="mt-1 text-[10.5px] whitespace-pre-wrap break-all text-slate-500 max-h-40 overflow-auto">{e.errorStack}</pre>}
                  {e.meta && <pre className="mt-1 text-[10.5px] bg-slate-50 dark:bg-slate-950/40 rounded p-1.5 overflow-auto max-h-32">{JSON.stringify(e.meta)}</pre>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

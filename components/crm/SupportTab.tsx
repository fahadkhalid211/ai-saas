'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useCallback, useEffect, useState } from 'react';
import { LifeBuoy, Plus, RefreshCw, Send, Lock, CheckCircle2, Search, Bug } from 'lucide-react';

type Status = 'open' | 'pending' | 'resolved' | 'closed';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

interface Ticket {
  ref: string;
  name: string;
  email: string;
  business: string;
  category: string;
  priority: Priority;
  subject: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  lastReplyBy: 'customer' | 'staff';
  messageCount: number;
}
interface Msg {
  id: string;
  author: 'customer' | 'staff' | 'system';
  authorName: string;
  body: string;
  internal?: boolean;
  createdAt: string;
}

const CATEGORIES = ['Bug Report', 'Technical Support', 'Billing & Payments', 'Account & Access', 'Privacy request', 'Security', 'Sales & Enterprise', 'Feature request', 'General Support'];
const STATUS_STYLE: Record<Status, string> = {
  open: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  pending: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};
const PRIORITY_STYLE: Record<Priority, string> = {
  low: 'text-slate-500',
  normal: 'text-slate-600 dark:text-slate-300',
  high: 'text-orange-600',
  urgent: 'text-rose-600 font-bold',
};
const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const input = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-800 dark:[&>option]:text-white';

export function SupportTab({ master }: { master: boolean }) {
  const __t = useT();
  const base = master ? '/api/master/tickets' : '/api/support/tickets';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [counts, setCounts] = useState<Record<Status, number> | null>(null);
  const [filter, setFilter] = useState<string>('active');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ ticket: Ticket; messages: Msg[]; customerLink?: string } | null>(null);
  const [reply, setReply] = useState('');
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ category: CATEGORIES[0], priority: 'normal', subject: '', message: '' });

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const params = master ? `?status=${filter}${q ? `&q=${encodeURIComponent(q)}` : ''}` : '';
      const res = await fetch(base + params, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        setCounts(data.counts || null);
      }
    } finally {
      setLoading(false);
    }
  }, [base, filter, q, master]);

  const loadDetail = useCallback(
    async (ref: string) => {
      const res = await fetch(`${base}/${encodeURIComponent(ref)}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setDetail({ ticket: { ...(data.ticket as Ticket), email: data.ticket.email || '', business: data.ticket.business || '' }, messages: data.messages, customerLink: data.customerLink });
    },
    [base]
  );

  useEffect(() => {
    loadList();
  }, [loadList]);

  // a link from a notification e-mail opens that ticket directly
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ticket');
    if (ref) setSelected(ref);
  }, []);

  useEffect(() => {
    if (selected) loadDetail(selected);
    else setDetail(null);
  }, [selected, loadDetail]);

  const send = async (extra: Record<string, unknown> = {}) => {
    if (!selected) return;
    if (!reply.trim() && !extra.status && !extra.priority) return;
    setBusy(true);
    setError('');
    try {
      const statusOnly = Boolean(extra.status || extra.priority);
      const body = master ? { message: statusOnly ? '' : reply, internal, ...extra } : { message: reply };
      const res = await fetch(`${base}/${encodeURIComponent(selected)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send.');
      setReply('');
      setInternal(false);
      await Promise.all([loadDetail(selected), loadList()]);
    } catch (e: any) {
      setError(e?.message || 'Could not send.');
    }
    setBusy(false);
  };

  const create = async () => {
    setError('');
    if (draft.message.trim().length < 10) {
      setError('Please describe the problem or question in a little more detail (at least 10 characters).');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not create the ticket.');
      setComposing(false);
      setDraft({ category: CATEGORIES[0], priority: 'normal', subject: '', message: '' });
      await loadList();
      if (data.ticket?.ref) {
        setSelected(data.ticket.ref);
      }
    } catch (e: any) {
      setError(e?.message || 'Could not create the ticket.');
    }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{master ? <T>Support inbox</T> : <T>Support</T>}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={loadList} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" aria-label={__t("Refresh")}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setComposing(true);
                setSelected(null);
                setDraft({ category: 'Bug Report', priority: 'normal', subject: '', message: '' });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Bug className="h-3.5 w-3.5" /> <T>Report a bug</T>
            </button>
            <button
              type="button"
              onClick={() => {
                setComposing(true);
                setSelected(null);
                setDraft({ category: 'Technical Support', priority: 'normal', subject: '', message: '' });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> <T>New ticket</T>
            </button>
          </div>
        </div>
      </div>

      {master && (
        <div className="flex items-center gap-2 flex-wrap">
          {(['active', 'open', 'pending', 'resolved', 'closed', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize cursor-pointer ${filter === f ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              {f}
              {counts && f !== 'all' && f !== 'active' ? ` (${counts[f]})` : f === 'active' && counts ? ` (${counts.open + counts.pending})` : ''}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={__t("Search ref, e-mail, subject")} className={`${input} pl-8 w-56`} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 max-h-[70vh] overflow-y-auto">
          {tickets.length === 0 && (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-slate-500">
                {loading ? <T>Loading...</T> : master ? <T>No tickets match your filters.</T> : <T>No tickets yet. Need help or have a question?</T>}
              </p>
              {!loading && (
                <button
                  type="button"
                  onClick={() => {
                    setComposing(true);
                    setSelected(null);
                    setDraft({ category: 'Technical Support', priority: 'normal', subject: '', message: '' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span><T>Create a support ticket</T></span>
                </button>
              )}
            </div>
          )}
          {tickets.map((t) => (
            <button
              key={t.ref}
              type="button"
              onClick={() => { setSelected(t.ref); setComposing(false); }}
              className={`w-full text-left p-3.5 space-y-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${selected === t.ref ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-500">{t.ref}</span>
                  {t.category === 'Bug Report' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                      <T>Bug</T>
                    </span>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[t.status]}`}><T>{t.status}</T></span>
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{t.subject}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2">
                <span className="truncate">{master ? `${t.name} · ${t.email}` : t.category}</span>
                <span className={PRIORITY_STYLE[t.priority]}>{t.priority}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {fmt(t.updatedAt)}{master && t.status === 'open' && t.lastReplyBy === 'customer' ? <T> · needs a reply</T> : ''}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[20rem]">
          {composing && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white"><T>New support ticket</T></h3>
              <p className="text-[11px] text-slate-500">
                <T>Describe the inquiry, request, or issue. A confirmation email and tracking link will be dispatched immediately.</T>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <select className={input} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{__t(c)}</option>)}
                </select>
                <select className={input} value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
                  {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <input className={input} placeholder={__t("Subject")} maxLength={120} value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
              <textarea className={input} rows={7} maxLength={5000} placeholder={__t("Describe the problem or question in detail (at least 10 characters)")} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
              {error && <p className="text-xs text-rose-500"><T>{error}</T></p>}
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={create} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-xs transition">
                  {busy ? <T>Sending...</T> : <T>Submit ticket</T>}
                </button>
                <button type="button" onClick={() => setComposing(false)} className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"><T>Cancel</T></button>
              </div>
            </div>
          )}

          {!composing && !detail && <p className="text-xs text-slate-500 text-center py-16"><T>Select a ticket to read the conversation or click &quot;New ticket&quot; above.</T></p>}

          {!composing && detail && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[11px] font-mono text-slate-500">{detail.ticket.ref} · {detail.ticket.category}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{detail.ticket.subject}</h3>
                  {master && <div className="text-[11px] text-slate-500 mt-0.5"><T>{detail.ticket.name}</T> · {detail.ticket.email}{detail.ticket.business ? ` · ${detail.ticket.business}` : ''}</div>}
                </div>
                {master ? (
                  <div className="flex items-center gap-2">
                    <select className={`${input} w-28`} value={detail.ticket.status} onChange={(e) => send({ status: e.target.value })}>
                      {['open', 'pending', 'resolved', 'closed'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <select className={`${input} w-24`} value={detail.ticket.priority} onChange={(e) => send({ priority: e.target.value })}>
                      {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[detail.ticket.status]}`}><T>{detail.ticket.status}</T></span>
                )}
              </div>

              <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                {detail.messages.map((m) => (
                  <div key={m.id} className={`rounded-xl p-3 text-xs ${m.internal ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900' : m.author === 'staff' ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    <div className="flex justify-between gap-3 text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold">{m.internal ? <T>Internal note</T> : m.author === 'staff' ? <T>Crescelo Support</T> : m.authorName}</span>
                      <span>{fmt(m.createdAt)}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">{m.body}</div>
                  </div>
                ))}
              </div>

              {detail.ticket.status !== 'closed' || master ? (
                <div className="space-y-2">
                  <textarea className={input} rows={4} maxLength={5000} placeholder={master ? (internal ? 'Internal note (not e-mailed, not shown to the customer)' : 'Reply to the customer (sent by e-mail)') : 'Write a reply'} value={reply} onChange={(e) => setReply(e.target.value)} />
                  {error && <p className="text-xs text-rose-500"><T>{error}</T></p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button type="button" disabled={busy || !reply.trim()} onClick={() => send()} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-xs transition">
                      {internal ? <Lock className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />} {internal ? <T>Save note</T> : <T>Send reply</T>}
                    </button>
                    {master && (
                      <>
                        <button type="button" disabled={busy || !reply.trim() || internal} onClick={() => send({ resolve: true })} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 text-emerald-700 dark:text-emerald-300 disabled:opacity-40 text-xs font-semibold cursor-pointer">
                          <CheckCircle2 className="h-3.5 w-3.5" /> <T>Reply and resolve</T>
                        </button>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                          <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> <T>Internal note</T>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500"><T>This ticket is closed. Open a new ticket if you still need help.</T></p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

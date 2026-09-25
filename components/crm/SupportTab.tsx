'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { LifeBuoy, Plus, RefreshCw, Send, Lock, CheckCircle2, Search } from 'lucide-react';

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

const CATEGORIES = ['Technical Support', 'Billing & Payments', 'Account & Access', 'Privacy request', 'Security', 'Sales & Enterprise', 'Feature request', 'General Support'];
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

const input = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

export function SupportTab({ master }: { master: boolean }) {
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
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/support/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not create the ticket.');
      setComposing(false);
      setDraft({ category: CATEGORIES[0], priority: 'normal', subject: '', message: '' });
      await loadList();
      setSelected(data.ticket.ref);
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{master ? 'Support inbox' : 'Support'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={loadList} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" aria-label="Refresh">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!master && (
            <button type="button" onClick={() => { setComposing(true); setSelected(null); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> New ticket
            </button>
          )}
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
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, e-mail, subject" className={`${input} pl-8 w-56`} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 max-h-[70vh] overflow-y-auto">
          {tickets.length === 0 && <p className="p-6 text-xs text-slate-500 text-center">{loading ? 'Loading...' : master ? 'No tickets match.' : 'No tickets yet. Use "New ticket" to contact the Crescelo team.'}</p>}
          {tickets.map((t) => (
            <button
              key={t.ref}
              type="button"
              onClick={() => { setSelected(t.ref); setComposing(false); }}
              className={`w-full text-left p-3.5 space-y-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${selected === t.ref ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-500">{t.ref}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[t.status]}`}>{t.status}</span>
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{t.subject}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2">
                <span className="truncate">{master ? `${t.name} · ${t.email}` : t.category}</span>
                <span className={PRIORITY_STYLE[t.priority]}>{t.priority}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {fmt(t.updatedAt)}{master && t.status === 'open' && t.lastReplyBy === 'customer' ? ' · needs a reply' : ''}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 min-h-[20rem]">
          {composing && !master && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">New ticket</h3>
              <p className="text-[11px] text-slate-500">We reply by e-mail to your account address, and you can follow the conversation here.</p>
              <div className="grid grid-cols-2 gap-3">
                <select className={input} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select className={input} value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
                  {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <input className={input} placeholder="Subject" maxLength={120} value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
              <textarea className={input} rows={7} maxLength={5000} placeholder="Describe the problem or question" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <div className="flex gap-2">
                <button type="button" disabled={busy || draft.message.trim().length < 10} onClick={create} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer">
                  {busy ? 'Sending...' : 'Submit ticket'}
                </button>
                <button type="button" onClick={() => setComposing(false)} className="px-4 py-2 rounded-xl text-xs text-slate-500 cursor-pointer">Cancel</button>
              </div>
            </div>
          )}

          {!composing && !detail && <p className="text-xs text-slate-500 text-center py-16">Select a ticket to read the conversation.</p>}

          {!composing && detail && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[11px] font-mono text-slate-500">{detail.ticket.ref} · {detail.ticket.category}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{detail.ticket.subject}</h3>
                  {master && <div className="text-[11px] text-slate-500 mt-0.5">{detail.ticket.name} · {detail.ticket.email}{detail.ticket.business ? ` · ${detail.ticket.business}` : ''}</div>}
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
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[detail.ticket.status]}`}>{detail.ticket.status}</span>
                )}
              </div>

              <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                {detail.messages.map((m) => (
                  <div key={m.id} className={`rounded-xl p-3 text-xs ${m.internal ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900' : m.author === 'staff' ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    <div className="flex justify-between gap-3 text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold">{m.internal ? 'Internal note' : m.author === 'staff' ? 'Crescelo Support' : m.authorName}</span>
                      <span>{fmt(m.createdAt)}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">{m.body}</div>
                  </div>
                ))}
              </div>

              {detail.ticket.status !== 'closed' || master ? (
                <div className="space-y-2">
                  <textarea className={input} rows={4} maxLength={5000} placeholder={master ? (internal ? 'Internal note (not e-mailed, not shown to the customer)' : 'Reply to the customer (sent by e-mail)') : 'Write a reply'} value={reply} onChange={(e) => setReply(e.target.value)} />
                  {error && <p className="text-xs text-rose-500">{error}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button type="button" disabled={busy || !reply.trim()} onClick={() => send()} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer">
                      {internal ? <Lock className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />} {internal ? 'Save note' : 'Send reply'}
                    </button>
                    {master && (
                      <>
                        <button type="button" disabled={busy || !reply.trim() || internal} onClick={() => send({ resolve: true })} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 text-emerald-700 dark:text-emerald-300 disabled:opacity-40 text-xs font-semibold cursor-pointer">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Reply and resolve
                        </button>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                          <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note
                        </label>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">This ticket is closed. Open a new ticket if you still need help.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

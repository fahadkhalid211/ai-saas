'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Plus, RefreshCw, Trash2 } from 'lucide-react';

interface Redemption {
  code: string;
  workspaceId: string;
  redeemedAt: string;
}
interface Row {
  code: string;
  planId: 'starter' | 'growth' | 'scale';
  days: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  note: string;
  createdAt: string;
  redemptions: Redemption[];
}

const PLAN_LABEL: Record<Row['planId'], string> = { starter: 'Starter', growth: 'Growth', scale: 'Agency' };
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

function statusOf(r: Row): { label: string; tone: string } {
  if (!r.active) return { label: 'Switched off', tone: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' };
  if (r.expiresAt && new Date(r.expiresAt).getTime() <= Date.now()) return { label: 'Expired', tone: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200' };
  if (r.usedCount >= r.maxUses) return { label: 'Used up', tone: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200' };
  return { label: 'Active', tone: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200' };
}

/** The message to send a friend along with the code. */
const invitation = (r: Row) =>
  `Here is a free access code for Crescelo: ${r.code}\n\n1. Create your account at ${typeof window !== 'undefined' ? window.location.origin : ''}/login?mode=register\n2. When it asks you to start a trial, choose "Have an access code?" and enter it.\n\nIt gives you the ${PLAN_LABEL[r.planId]} plan ${r.days > 0 ? `free for ${r.days} days` : 'free with no end date'}. No card needed.`;

export function AccessCodesTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', planId: 'growth', days: '30', maxUses: '1', expiresAt: '', note: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/master/access-codes', { cache: 'no-store' });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Could not load the codes.');
      setRows(out.codes);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/master/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, days: form.days === '' ? undefined : Number(form.days), maxUses: form.maxUses === '' ? undefined : Number(form.maxUses), expiresAt: form.expiresAt ? new Date(form.expiresAt + 'T23:59:59').toISOString() : undefined }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Could not make the code.');
      setForm({ ...form, code: '', note: '' });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (r: Row) => {
    await fetch(`/api/master/access-codes/${encodeURIComponent(r.code)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !r.active }) });
    load();
  };
  const remove = async (r: Row) => {
    if (!window.confirm(`Delete ${r.code}? Workspaces that already used it keep their access.`)) return;
    await fetch(`/api/master/access-codes/${encodeURIComponent(r.code)}`, { method: 'DELETE' });
    load();
  };
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      setError('Your browser blocked copying. Select the text and copy it by hand.');
    }
  };

  const field = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100';
  const label = 'block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Access codes</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Make a code and send it to a friend. They sign up, choose &ldquo;Have an access code?&rdquo; when asked to start a trial, and get a plan free with no card. Nothing is charged. When the days run out their assistants pause like any ended trial.
          </p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-pointer">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <form onSubmit={create} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Make a code</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="ac-code" className={label}>Code (leave blank for a random one)</label>
            <input id="ac-code" className={`${field} uppercase`} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} maxLength={32} placeholder="FRIENDS-2026" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="ac-plan" className={label}>Plan</label>
            <select id="ac-plan" className={field} value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="scale">Agency</option>
            </select>
          </div>
          <div>
            <label htmlFor="ac-days" className={label}>Free days (0 = no end date)</label>
            <input id="ac-days" className={field} type="number" min={0} max={3650} value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} />
          </div>
          <div>
            <label htmlFor="ac-uses" className={label}>How many people can use it</label>
            <input id="ac-uses" className={field} type="number" min={1} max={1000} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>
          <div>
            <label htmlFor="ac-exp" className={label}>Stop accepting it after (optional)</label>
            <input id="ac-exp" className={field} type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <div>
            <label htmlFor="ac-note" className={label}>Note to yourself (optional)</label>
            <input id="ac-note" className={field} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={200} placeholder="For Sam's salon" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-slate-900 disabled:opacity-60 cursor-pointer">
            <Plus className="h-4 w-4" /> {busy ? 'Making…' : 'Make code'}
          </button>
          {error ? <p role="alert" className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p> : null}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Access codes</caption>
          <thead className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-4 py-3">Code</th>
              <th scope="col" className="px-4 py-3">Gives</th>
              <th scope="col" className="px-4 py-3">Used</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">{loading ? 'Loading…' : 'No codes yet. Make one above.'}</td></tr>
            ) : null}
            {rows.map((r) => {
              const st = statusOf(r);
              return (
                <React.Fragment key={r.code}>
                  <tr className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">{r.code}</div>
                      {r.note ? <div className="text-xs text-slate-600 dark:text-slate-300">{r.note}</div> : null}
                      <div className="text-xs text-slate-600 dark:text-slate-300">Made {fmt(r.createdAt)}{r.expiresAt ? `, accepted until ${fmt(r.expiresAt)}` : ''}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-100">{PLAN_LABEL[r.planId]}<div className="text-xs text-slate-600 dark:text-slate-300">{r.days > 0 ? `${r.days} days free` : 'No end date'}</div></td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-100">
                      {r.usedCount} of {r.maxUses}
                      {r.redemptions.length ? (
                        <button type="button" aria-expanded={open === r.code} onClick={() => setOpen(open === r.code ? null : r.code)} className="ml-2 text-xs font-semibold underline text-blue-700 dark:text-blue-400 cursor-pointer">Who?</button>
                      ) : null}
                    </td>
                    <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.tone}`}>{st.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => copy(r.code, `c-${r.code}`)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">
                          {copied === `c-${r.code}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === `c-${r.code}` ? 'Copied' : 'Copy code'}
                        </button>
                        <button type="button" onClick={() => copy(invitation(r), `i-${r.code}`)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">
                          {copied === `i-${r.code}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === `i-${r.code}` ? 'Copied' : 'Copy message for a friend'}
                        </button>
                        <button type="button" onClick={() => toggle(r)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer">{r.active ? 'Switch off' : 'Switch on'}</button>
                        <button type="button" onClick={() => remove(r)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-800 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {open === r.code ? (
                    <tr>
                      <td colSpan={5} className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
                        <p className="font-semibold">Workspaces that used this code</p>
                        <ul className="mt-1 space-y-0.5">
                          {r.redemptions.map((x) => <li key={x.workspaceId}><span className="font-mono">{x.workspaceId}</span> on {fmt(x.redeemedAt)}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

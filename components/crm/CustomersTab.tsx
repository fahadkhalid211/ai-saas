'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, LogIn, RefreshCw, Search } from 'lucide-react';
import { showErrorModal } from '@/lib/ui/notify';

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string | null;
  lastLoginAt: string | null;
  twoFactorEnabled: boolean;
}
interface Bot {
  id: string;
  name: string;
  provider: string;
  model: string;
  hasOwnKey: boolean;
}
interface Customer {
  id: string;
  name: string;
  planName: string;
  status: 'legacy' | 'needs_card' | 'trialing' | 'subscribed' | 'past_due' | 'expired';
  trialEndsAt: string | null;
  accessCode: string | null;
  subscribed: boolean;
  createdAt: string | null;
  lastActiveAt: string | null;
  owner: Person | null;
  members: Person[];
  assistants: Bot[];
}

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never');
const ROLE: Record<string, string> = { owner: 'Owner', admin: 'Admin', support_agent: 'Support agent', billing_manager: 'Billing manager', viewer: 'Viewer' };

function statusOf(c: Customer): { label: string; tone: string } {
  const good = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200';
  const warn = 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200';
  const bad = 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200';
  const plain = 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100';
  switch (c.status) {
    case 'subscribed':
      return { label: 'Paying', tone: good };
    case 'trialing':
      return { label: c.accessCode ? `Free access (code ${c.accessCode}) until ${day(c.trialEndsAt)}` : `Trial until ${day(c.trialEndsAt)}`, tone: good };
    case 'needs_card':
      return { label: 'Signed up, no plan chosen', tone: warn };
    case 'past_due':
      return { label: 'Payment failed', tone: bad };
    case 'expired':
      return { label: 'Trial or plan ended', tone: bad };
    default:
      return { label: c.accessCode ? `Free access (code ${c.accessCode})` : 'Open access', tone: plain };
  }
}

/**
 * Master admin only: everyone registered on the platform, grouped by workspace, with their assistants and plan status,
 * and a way to open a customer's account to troubleshoot it (support access, recorded in their audit trail).
 */
export function CustomersTab() {
  const __t = useT();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totals, setTotals] = useState<{ workspaces: number; members: number; assistants: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Customer | null>(null);
  const [entering, setEntering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/master/customers', { cache: 'no-store' });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Could not load the customers.');
      setCustomers(out.customers || []);
      setTotals(out.totals || null);
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

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.id, c.accessCode || '', ...c.members.flatMap((m) => [m.name, m.email]), ...c.assistants.map((a) => a.name)].some((v) => v.toLowerCase().includes(q))
    );
  }, [customers, query]);

  const enter = async (c: Customer) => {
    setEntering(true);
    try {
      const res = await fetch('/api/master/support-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: c.id }) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Could not open the account.');
      window.location.href = '/dashboard';
    } catch (e) {
      setEntering(false);
      setConfirm(null);
      showErrorModal({ title: "Couldn't open the account", message: (e as Error).message });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white"><T>Customers</T></h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            <T>Everyone registered on Crescelo, by workspace: who they are, their assistants and their plan. Open an account to see exactly what the customer sees and fix a problem for them.</T>
          </p>
          {totals ? (
            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">
              {totals.workspaces} <T>workspaces ·</T> {totals.members} <T>people ·</T> {totals.assistants} <T>assistants</T>
            </p>
          ) : null}
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-pointer">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> <T>Refresh</T>
        </button>
      </div>

      <div className="relative max-w-md">
        <label htmlFor="cust-search" className="sr-only"><T>Search customers</T></label>
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" aria-hidden="true" />
        <input
          id="cust-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={__t("Search by name, e-mail, workspace or assistant")}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100"
        />
      </div>

      {error ? <p role="alert" className="text-sm font-medium text-rose-700 dark:text-rose-300"><T>{error}</T></p> : null}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only"><T>Customers</T></caption>
          <thead className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-4 py-3"><T>Workspace and owner</T></th>
              <th scope="col" className="px-4 py-3"><T>Assistants</T></th>
              <th scope="col" className="px-4 py-3"><T>Plan</T></th>
              <th scope="col" className="px-4 py-3"><T>Joined</T></th>
              <th scope="col" className="px-4 py-3"><T>Last sign-in</T></th>
              <th scope="col" className="px-4 py-3"><span className="sr-only"><T>Actions</T></span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {shown.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600 dark:text-slate-300">
                  {loading ? <T>{'Loading…'}</T> : query ? <T>{'Nobody matches that search.'}</T> : <T>{'No customers yet.'}</T>}
                </td>
              </tr>
            ) : (
              shown.map((c) => {
                const st = statusOf(c);
                const expanded = open === c.id;
                return (
                  <React.Fragment key={c.id}>
                    <tr className="align-top">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white"><T>{c.name}</T></div>
                        {c.owner ? (
                          <div className="text-slate-700 dark:text-slate-200">
                            {c.owner.name || <T>{'No name'}</T>} · <span className="break-all">{c.owner.email}</span>
                          </div>
                        ) : (
                          <div className="text-slate-600 dark:text-slate-300"><T>No account attached</T></div>
                        )}
                        {c.members.length > 1 ? <div className="text-xs text-slate-600 dark:text-slate-300">+ {c.members.length - 1} <T>more team</T> {c.members.length - 1 === 1 ? <T>{'member'}</T> : <T>{'members'}</T>}</div> : null}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-100">
                        {c.assistants.length === 0 ? (
                          <span className="text-slate-600 dark:text-slate-300"><T>None</T></span>
                        ) : (
                          <ul className="space-y-0.5">
                            {c.assistants.slice(0, 3).map((a) => (
                              <li key={a.id}><T>{a.name}</T></li>
                            ))}
                            {c.assistants.length > 3 ? <li className="text-xs text-slate-600 dark:text-slate-300">+ {c.assistants.length - 3} <T>more</T></li> : null}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900 dark:text-white">{c.planName}</div>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${st.tone}`}><T>{st.label}</T></span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-800 dark:text-slate-100">{c.createdAt ? day(c.createdAt) : <T>{'Unknown'}</T>}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-800 dark:text-slate-100">{day(c.lastActiveAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setOpen(expanded ? null : c.id)}
                            aria-expanded={expanded}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer"
                          >
                            <T>Details</T> <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirm(c)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-white px-2.5 py-1.5 text-xs font-bold text-white dark:text-slate-900 cursor-pointer"
                          >
                            <LogIn className="h-3.5 w-3.5" aria-hidden="true" /> <T>Open account</T>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="bg-slate-50 dark:bg-slate-800/40">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid gap-5 lg:grid-cols-2">
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200"><T>People (</T>{c.members.length})</h3>
                              <ul className="mt-2 space-y-2">
                                {c.members.map((m) => (
                                  <li key={m.id} className="text-sm text-slate-800 dark:text-slate-100">
                                    <span className="font-semibold">{m.name || <T>{'No name'}</T>}</span> · <span className="break-all">{m.email}</span>
                                    <div className="text-xs text-slate-600 dark:text-slate-300">
                                      {ROLE[m.role] || m.role}
                                      {m.status === 'invited' ? <T>{' · invited, not joined yet'}</T> : ''} <T>· joined</T> {day(m.createdAt)} <T>· last sign-in</T> {day(m.lastLoginAt)}
                                      {m.twoFactorEnabled ? <T>{' · two-factor on'}</T> : ''}
                                    </div>
                                  </li>
                                ))}
                                {c.members.length === 0 ? <li className="text-sm text-slate-600 dark:text-slate-300"><T>Nobody yet.</T></li> : null}
                              </ul>
                            </div>
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200"><T>Assistants (</T>{c.assistants.length})</h3>
                              <ul className="mt-2 space-y-2">
                                {c.assistants.map((a) => (
                                  <li key={a.id} className="text-sm text-slate-800 dark:text-slate-100">
                                    <span className="font-semibold"><T>{a.name}</T></span>
                                    <div className="text-xs text-slate-600 dark:text-slate-300">
                                      <T>AI engine:</T> {a.provider}
                                      {a.model ? ` (${a.model})` : ''} · {a.hasOwnKey ? <T>{'their own API key'}</T> : <T>{'no API key added'}</T>}
                                    </div>
                                  </li>
                                ))}
                                {c.assistants.length === 0 ? <li className="text-sm text-slate-600 dark:text-slate-300"><T>No assistants.</T></li> : null}
                              </ul>
                              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300"><T>Workspace ID:</T> <span className="font-mono">{c.id}</span></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {confirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" aria-labelledby="cust-open-title">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <h2 id="cust-open-title" className="text-lg font-bold text-slate-900 dark:text-white"><T>Open</T> <T>{confirm.name}</T>?</h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
              <T>You will see this workspace exactly as its owner</T>{confirm.owner ? ` (${confirm.owner.email})` : ''} <T>does, for up to 60 minutes. A bar at the top takes you back to your master account.</T>
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
              <li><T>Changes you make are real changes to their account.</T></li>
              <li><T>The visit is written to their audit trail as &ldquo;Crescelo Support&rdquo;.</T></li>
              <li><T>You cannot change their password or two-factor settings.</T></li>
            </ul>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirm(null)} disabled={entering} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-100 cursor-pointer">
                <T>Cancel</T>
              </button>
              <button type="button" onClick={() => enter(confirm)} disabled={entering} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-slate-900 disabled:opacity-60 cursor-pointer">
                {entering ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
                {entering ? <T>{'Opening…'}</T> : <T>{'Open account'}</T>}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

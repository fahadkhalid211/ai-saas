'use client';

import { T, useT } from '@/lib/i18n/context';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarSync, Check, Copy, Plus, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import { CALENDAR_LABEL_OPTIONS, relativeTime, type CalendarLinkView } from '@/lib/calendar/link-view';

interface Props {
  /** The assistant whose calendars are shown. Calendar changes are saved as soon as they are made, not with the Save button. */
  assistantId?: string;
}

interface Loaded {
  links: CalendarLinkView[];
  busyFeedUrl: string;
  durable: boolean;
}

interface ApiJson {
  error?: string;
  links?: CalendarLinkView[];
  link?: CalendarLinkView;
  busyFeed?: { url?: string };
  durable?: boolean;
}
type Reply = { ok: boolean; status: number; json: ApiJson | null };

const FIELD =
  'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500';
// 44 px tall on small screens (touch), the card's own compact size from the sm breakpoint up
const BTN = 'inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[44px] sm:min-h-0 px-3 py-1.5 disabled:opacity-60 disabled:cursor-not-allowed';
const BTN_PRIMARY = `${BTN} bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs`;
const BTN_PLAIN = `${BTN} border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800`;
const BTN_DANGER = `${BTN} border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40`;

async function api(assistantId: string, method: 'GET' | 'POST' | 'DELETE', query = '', body?: unknown): Promise<Reply> {
  const res = await fetch(`/api/assistants/${encodeURIComponent(assistantId)}/calendars${query}`, {
    method,
    cache: 'no-store',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json: ApiJson | null = null;
  try {
    json = (await res.json()) as ApiJson;
  } catch {
    // not JSON: the status still tells the story
  }
  return { ok: res.ok, status: res.status, json };
}

async function fetchLoaded(assistantId: string): Promise<Loaded | null> {
  try {
    const r = await api(assistantId, 'GET');
    if (!r.ok || !r.json || !Array.isArray(r.json.links)) return null;
    return { links: r.json.links, busyFeedUrl: String(r.json.busyFeed?.url || ''), durable: Boolean(r.json.durable) };
  } catch {
    return null;
  }
}

/** Which calendars block this assistant's booking slots, plus the private busy-only link to paste into other calendar apps. */
export function CalendarLinksPanel({ assistantId }: Props) {
  const __t = useT();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<Loaded | null>(null);

  const [label, setLabel] = useState<string>('google');
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [syncing, setSyncing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);
  const feedRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const requestRef = useRef(0);

  // The first load runs from the effect; "Try again" and a vanished link reload through reload(). A newer load makes an older answer irrelevant.
  const applyLoaded = useCallback((loaded: Loaded | null) => {
    if (loaded) {
      setData(loaded);
      setState('ready');
    } else {
      setState('error');
    }
  }, []);

  const reload = () => {
    if (!assistantId) return;
    setState('loading');
    setData(null);
    setNotes({});
    setConfirmRemove(null);
    setConfirmReset(false);
    setAddError(null);
    setProblem(null);
    setStatus('');
    const mine = ++requestRef.current;
    fetchLoaded(assistantId).then((loaded) => {
      if (mine === requestRef.current) applyLoaded(loaded);
    });
  };

  useEffect(() => {
    if (!assistantId) return;
    let live = true;
    fetchLoaded(assistantId).then((loaded) => {
      if (live) applyLoaded(loaded);
    });
    return () => {
      live = false;
    };
  }, [assistantId, applyLoaded]);

  const labelName = (value: string) => CALENDAR_LABEL_OPTIONS.find((o) => o.value === value)?.name ?? 'Other';
  const selected = CALENDAR_LABEL_OPTIONS.find((o) => o.value === label) ?? CALENDAR_LABEL_OPTIONS[0];

  const countText = (n: number) => (n === 1 ? __t('1 busy time read') : __t('{n} busy times read', { n }));

  const lastSyncedText = (iso: string | null) => {
    const r = relativeTime(iso);
    switch (r.kind) {
      case 'never':
        return __t('Not read yet');
      case 'just_now':
        return __t('Last synced just now');
      case 'minutes':
        return __t('Last synced {n} min ago', { n: r.n });
      case 'hours':
        return __t('Last synced {n} h ago', { n: r.n });
      case 'days':
        return __t('Last synced {n} days ago', { n: r.n });
      default:
        return __t('Last synced on {date}', { date: new Date(iso as string).toLocaleDateString() });
    }
  };

  const replaceLink = (link: CalendarLinkView) =>
    setData((d) => (d ? { ...d, links: d.links.map((l) => (l.id === link.id ? link : l)) } : d));

  const networkProblem = () => __t('Could not reach the server. Check your connection and try again.');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantId || adding) return;
    if (!url.trim()) {
      setAddError(__t('Paste the calendar link.'));
      return;
    }
    setAdding(true);
    setAddError(null);
    setStatus(__t('Checking the calendar link...'));
    try {
      const r = await api(assistantId, 'POST', '', { label, url });
      if (r.ok && r.json?.link) {
        const link = r.json.link as CalendarLinkView;
        setData((d) => (d ? { ...d, links: [...d.links, link] } : d));
        setUrl('');
        setStatus(link.lastError ? __t('Calendar added, but it could not be read yet.') : `${__t('Calendar added.')} ${countText(link.blockCount)}`);
      } else {
        const message = typeof r.json?.error === 'string' ? r.json.error : __t('The calendar could not be added. Please try again.');
        setAddError(message);
        setStatus('');
      }
    } catch {
      setAddError(networkProblem());
      setStatus('');
    } finally {
      setAdding(false);
    }
  };

  const handleSync = async (link: CalendarLinkView) => {
    if (!assistantId || syncing) return;
    setSyncing(link.id);
    setProblem(null);
    setNotes((n) => ({ ...n, [link.id]: { ok: true, text: __t('Reading...') } }));
    setStatus(__t('Reading the calendar...'));
    try {
      const r = await api(assistantId, 'POST', `?action=sync&linkId=${encodeURIComponent(link.id)}`);
      if (r.ok && r.json?.link) {
        const fresh = r.json.link as CalendarLinkView;
        replaceLink(fresh);
        const text = fresh.lastError ? __t('Could not read this calendar.') : `${__t('Done.')} ${countText(fresh.blockCount)}`;
        setNotes((n) => ({ ...n, [link.id]: { ok: !fresh.lastError, text } }));
        setStatus(text);
      } else if (r.status === 404) {
        setNotes((n) => ({ ...n, [link.id]: { ok: false, text: __t('This calendar was already removed.') } }));
        reload();
      } else {
        const text = typeof r.json?.error === 'string' ? r.json.error : __t('The calendar could not be read. Please try again.');
        setNotes((n) => ({ ...n, [link.id]: { ok: false, text } }));
        setStatus(text);
      }
    } catch {
      const text = networkProblem();
      setNotes((n) => ({ ...n, [link.id]: { ok: false, text } }));
      setStatus(text);
    } finally {
      setSyncing(null);
    }
  };

  const handleRemove = async (link: CalendarLinkView) => {
    if (!assistantId || removing) return;
    setRemoving(link.id);
    setProblem(null);
    try {
      const r = await api(assistantId, 'DELETE', `?linkId=${encodeURIComponent(link.id)}`);
      if (r.ok || r.status === 404) {
        setData((d) => (d ? { ...d, links: d.links.filter((l) => l.id !== link.id) } : d));
        setNotes((n) => {
          const { [link.id]: _gone, ...rest } = n;
          return rest;
        });
        setConfirmRemove(null);
        setStatus(__t('Calendar removed. Its events no longer block slots.'));
        headingRef.current?.focus(); // the row that had the focus is gone
      } else {
        setProblem(typeof r.json?.error === 'string' ? r.json.error : __t('The calendar could not be removed. Please try again.'));
      }
    } catch {
      setProblem(networkProblem());
    } finally {
      setRemoving(null);
    }
  };

  const handleCopy = async () => {
    if (!data?.busyFeedUrl) return;
    try {
      await navigator.clipboard.writeText(data.busyFeedUrl);
      setCopied(true);
      setStatus(__t('Link copied.'));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard blocked: select the link so Ctrl+C / long-press works
      feedRef.current?.focus();
      feedRef.current?.select();
      setStatus(__t('Select the link and copy it with Ctrl+C.'));
    }
  };

  const handleReset = async () => {
    if (!assistantId || resetting) return;
    setResetting(true);
    setProblem(null);
    try {
      const r = await api(assistantId, 'POST', '?action=reset-feed');
      const newUrl = r.json?.busyFeed?.url;
      if (r.ok && newUrl) {
        setData((d) => (d ? { ...d, busyFeedUrl: String(newUrl) } : d));
        setConfirmReset(false);
        setStatus(__t('New link created. The old link no longer works.'));
        feedRef.current?.focus();
      } else {
        setProblem(typeof r.json?.error === 'string' ? r.json.error : __t('The link could not be reset. Please try again.'));
      }
    } catch {
      setProblem(networkProblem());
    } finally {
      setResetting(false);
    }
  };

  if (!assistantId) return null;

  return (
    <section aria-labelledby="cal-links-heading" className="space-y-3 pt-2.5 border-t border-dashed border-emerald-200 dark:border-emerald-800">
      <div>
        <h4 id="cal-links-heading" ref={headingRef} tabIndex={-1} className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 outline-none focus-visible:underline">
          <CalendarSync className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span><T>Calendars that block my slots</T></span>
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          <T>Link your Google, Apple or Outlook calendar. Events in it make those times unavailable for booking. Changes here are saved straight away.</T>
        </p>
      </div>

      {/* One polite region announces results to screen readers; the visible messages sit next to what they describe */}
      <p className="sr-only" role="status" aria-live="polite">{status}</p>

      {state === 'loading' && (
        <div className="min-h-[220px] space-y-2" aria-busy="true">
          <div className="h-14 rounded-lg bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          <div className="h-24 rounded-lg bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          <div className="h-24 rounded-lg bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          <p className="sr-only"><T>Loading your calendars...</T></p>
        </div>
      )}

      {state === 'error' && (
        <div className="min-h-[220px] rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-3 flex flex-col items-start gap-2" role="alert">
          <p className="flex items-start gap-1.5 text-[11px] text-rose-800 dark:text-rose-200">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
            <span><T>Your calendars could not be loaded.</T></span>
          </p>
          <button type="button" onClick={reload} className={BTN_PLAIN}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span><T>Try again</T></span>
          </button>
        </div>
      )}

      {state === 'ready' && data && (
        <div className="space-y-3">
          {!data.durable && (
            <p className="flex items-start gap-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-2.5 text-[11px] text-amber-900 dark:text-amber-200">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
              <span><T>Calendar links are only kept temporarily on this server. Ask your administrator to turn on database mode so they are saved permanently.</T></span>
            </p>
          )}

          {problem && (
            <p className="flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300" role="alert">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
              <span>{problem}</span>
            </p>
          )}

          {data.links.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 text-[11px] text-slate-600 dark:text-slate-400">
              <T>No calendars linked yet. Add one below and its events will stop visitors from booking those times.</T>
            </p>
          ) : (
            <ul className="space-y-2" aria-label={__t('Linked calendars')}>
              {data.links.map((link) => {
                const note = notes[link.id];
                const isConfirming = confirmRemove === link.id;
                return (
                  <li key={link.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white"><T>{labelName(link.label)}</T></div>
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">{link.maskedUrl}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {lastSyncedText(link.lastSyncedAt)}
                          {link.lastSyncedAt ? ` · ${countText(link.blockCount)}` : ''}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSync(link)}
                          disabled={syncing !== null}
                          aria-label={`${__t('Sync now')}: ${labelName(link.label)} ${link.maskedUrl}`}
                          className={BTN_PLAIN}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${syncing === link.id ? 'animate-spin' : ''}`} aria-hidden="true" />
                          <span>{syncing === link.id ? <T>Reading...</T> : <T>Sync now</T>}</span>
                        </button>
                        <button
                          type="button"
                          id={`cal-remove-${link.id}`}
                          onClick={() => setConfirmRemove(link.id)}
                          aria-label={`${__t('Remove')}: ${labelName(link.label)} ${link.maskedUrl}`}
                          aria-expanded={isConfirming}
                          className={BTN_DANGER}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span><T>Remove</T></span>
                        </button>
                      </div>
                    </div>

                    {link.lastError && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300">
                        <TriangleAlert className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
                        <span><T>This calendar could not be read:</T> {link.lastError}</span>
                      </p>
                    )}
                    {link.unsupportedCount > 0 && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300">
                        <TriangleAlert className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
                        <span>
                          {link.unsupportedCount === 1
                            ? __t("1 event with repeats we can't read yet")
                            : __t("{n} events with repeats we can't read yet", { n: link.unsupportedCount })}
                        </span>
                      </p>
                    )}
                    {note && (
                      <p className={`mt-1.5 flex items-start gap-1.5 text-[11px] ${note.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                        {note.ok ? <Check className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" /> : <TriangleAlert className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />}
                        <span>{note.text}</span>
                      </p>
                    )}

                    {isConfirming && (
                      <div role="group" aria-label={__t('Confirm removing this calendar')} className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-2.5">
                        <p className="text-[11px] text-rose-900 dark:text-rose-200 flex-1 min-w-[12rem]">
                          <T>Remove this calendar? Its events will stop blocking your booking slots.</T>
                        </p>
                        <button type="button" onClick={() => handleRemove(link)} disabled={removing !== null} className={BTN_DANGER}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{removing === link.id ? <T>Removing...</T> : <T>Yes, remove it</T>}</span>
                        </button>
                        <button
                          type="button"
                          autoFocus
                          onClick={() => {
                            setConfirmRemove(null);
                            document.getElementById(`cal-remove-${link.id}`)?.focus();
                          }}
                          className={BTN_PLAIN}
                        >
                          <T>Keep it</T>
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={handleAdd} noValidate className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-3">
            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300"><T>Add a calendar</T></div>
            <div className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-2">
              <div>
                <label htmlFor="cal-link-label" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  <T>Calendar type</T>
                </label>
                <select id="cal-link-label" value={label} onChange={(e) => setLabel(e.target.value)} aria-describedby="cal-link-help" className={FIELD}>
                  {CALENDAR_LABEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{__t(o.name)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cal-link-url" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  <T>Private calendar link</T>
                </label>
                <input
                  id="cal-link-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={__t('https://… or webcal://…')}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (addError) setAddError(null);
                  }}
                  aria-describedby={addError ? 'cal-link-help cal-link-error' : 'cal-link-help'}
                  aria-invalid={addError ? true : undefined}
                  className={`${FIELD} font-mono`}
                />
              </div>
            </div>

            <p id="cal-link-help" className="text-[11px] text-slate-600 dark:text-slate-400">
              <T>{selected.help}</T>
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              <T>{"Events marked Free (Show as: Free) do not block slots, including all-day events, which Google marks Free by default; set them to Busy if they should."}</T>
            </p>

            {addError && (
              <p id="cal-link-error" role="alert" className="flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
                <span>{addError}</span>
              </p>
            )}

            <button type="submit" disabled={adding} className={BTN_PRIMARY}>
              {adding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
              <span>{adding ? <T>Checking...</T> : <T>Add calendar</T>}</span>
            </button>
          </form>

          <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-3">
            <label htmlFor="cal-feed-url" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
              <T>Your Crescelo calendar link</T>
            </label>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              <T>{"Other apps show only 'Busy' for your bookings, never guest details. Treat this link like a password: anyone who has it can see when you are booked. Reset it if it leaks."}</T>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="cal-feed-url"
                ref={feedRef}
                type="text"
                readOnly
                value={data.busyFeedUrl}
                className="flex-1 min-w-[12rem] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 select-all outline-none focus:border-emerald-500"
              />
              <button type="button" onClick={handleCopy} className={BTN_PRIMARY}>
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                <span>{copied ? <T>Copied!</T> : <T>Copy</T>}</span>
              </button>
              <button type="button" onClick={() => setConfirmReset(true)} aria-expanded={confirmReset} className={BTN_DANGER}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span><T>Reset link</T></span>
              </button>
            </div>

            {confirmReset && (
              <div role="group" aria-label={__t('Confirm resetting the link')} className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-2.5">
                <p className="text-[11px] text-rose-900 dark:text-rose-200 flex-1 min-w-[12rem]">
                  <T>Reset the link? Apps that use the old link will stop showing your bookings until you paste the new one.</T>
                </p>
                <button type="button" onClick={handleReset} disabled={resetting} className={BTN_DANGER}>
                  <span>{resetting ? <T>Resetting...</T> : <T>Yes, reset it</T>}</span>
                </button>
                <button type="button" autoFocus onClick={() => setConfirmReset(false)} className={BTN_PLAIN}>
                  <T>Keep it</T>
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              <T>Other apps refresh your Crescelo link slowly, often every few hours, so a new booking may show there late. It is already safe in Crescelo.</T>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

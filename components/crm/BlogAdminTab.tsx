'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Eye, RefreshCw, Save, Search, Undo2 } from 'lucide-react';

interface Views {
  total: number;
  last7: number;
  last30: number;
  today: number;
}
interface Row {
  slug: string;
  title: string;
  cluster: string;
  words: number;
  published: boolean;
  datePublished: string;
  dateModified: string;
  edited: boolean;
  views: Views;
}
interface Detail {
  slug: string;
  title: string;
  description: string;
  bodyMarkup: string;
  edited: boolean;
  updatedAt: string | null;
  words: number;
  series: { day: string; views: number }[];
}

type SortKey = 'views' | 'last30' | 'last7' | 'words' | 'title' | 'edited';

const input = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30';
const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4';

const FORMAT_HELP = `## Heading          ### Sub-heading
Paragraph text with [a link](/pricing) and **bold**
- bullet            1. numbered step
> a highlighted note
| Col | Col |  then  | --- | --- |  then rows (a table)
Q: A question?  then  A: Its answer.   (FAQ, marked up for Google)
Leave one blank line between blocks.`;

/** Platform owner only: every blog article with its views, and an editor for each one. */
export function BlogAdminTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Views | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('views');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/master/blog', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load the articles');
      setRows(data.posts);
      setTotals(data.totals);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows.filter((r) => !needle || r.title.toLowerCase().includes(needle) || r.slug.includes(needle) || r.cluster.toLowerCase().includes(needle));
    const key = (r: Row) => (sort === 'views' ? r.views.total : sort === 'last30' ? r.views.last30 : sort === 'last7' ? r.views.last7 : sort === 'words' ? r.words : sort === 'edited' ? Number(r.edited) : 0);
    return [...list].sort((a, b) => (sort === 'title' ? a.title.localeCompare(b.title) : key(b) - key(a) || a.title.localeCompare(b.title)));
  }, [rows, q, sort]);

  if (open) {
    return (
      <Editor
        slug={open}
        onBack={() => {
          setOpen(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Blog articles</h2>
          <p className="text-xs text-slate-500">Open an article to edit it. Changes go live within a moment. Views count real readers once a day each, not search crawlers.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ['Articles', rows.length],
          ['Views today', totals?.today ?? 0],
          ['Last 7 days', totals?.last7 ?? 0],
          ['Last 30 days', totals?.last30 ?? 0],
          ['All time', totals?.total ?? 0],
        ].map(([label, n]) => (
          <div key={label as string} className={card}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{Number(n).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, address or topic" className={`${input} pl-9`} aria-label="Search articles" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${input} !w-auto`} aria-label="Sort by">
          <option value="views">Most views (all time)</option>
          <option value="last30">Most views (30 days)</option>
          <option value="last7">Most views (7 days)</option>
          <option value="words">Longest</option>
          <option value="edited">Edited first</option>
          <option value="title">Title A to Z</option>
        </select>
      </div>

      {error ? <p className="text-xs text-rose-600" role="alert">{error}</p> : null}

      <div className={`${card} !p-0 overflow-x-auto`}>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 font-semibold">Article</th>
              <th className="px-3 py-3 font-semibold text-right">Words</th>
              <th className="px-3 py-3 font-semibold text-right">Today</th>
              <th className="px-3 py-3 font-semibold text-right">7 days</th>
              <th className="px-3 py-3 font-semibold text-right">30 days</th>
              <th className="px-3 py-3 font-semibold text-right">All time</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.slug} className="border-b last:border-0 border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 max-w-[26rem]">
                  <button onClick={() => setOpen(r.slug)} className="text-left font-semibold text-slate-900 dark:text-white hover:underline">
                    {r.title}
                  </button>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    <span>/blog/{r.slug}</span>
                    {r.cluster ? <span>· {r.cluster}</span> : null}
                    {r.edited ? <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold">Edited</span> : null}
                    {!r.published ? <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">Not indexed</span> : null}
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{r.words.toLocaleString()}</td>
                <td className="px-3 py-3 text-right tabular-nums">{r.views.today}</td>
                <td className="px-3 py-3 text-right tabular-nums">{r.views.last7}</td>
                <td className="px-3 py-3 text-right tabular-nums">{r.views.last30}</td>
                <td className="px-3 py-3 text-right tabular-nums font-semibold">{r.views.total}</td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => setOpen(r.slug)} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!shown.length && !loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No articles match.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Editor({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/master/blog/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      setNote({ ok: false, text: data.error || 'Could not open the article' });
      return;
    }
    setD(data);
    setTitle(data.title);
    setDescription(data.description);
    setBody(data.bodyMarkup);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = d ? title !== d.title || description !== d.description || body !== d.bodyMarkup : false;
  const words = useMemo(() => body.split(/\s+/).filter(Boolean).length, [body]);
  const max = Math.max(1, ...(d?.series.map((s) => s.views) ?? [1]));

  async function save() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/master/blog/${encodeURIComponent(slug)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, bodyMarkup: body }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save');
      setNote({ ok: true, text: `Saved. ${data.words.toLocaleString()} words, live on the site now.` });
      await load();
    } catch (err) {
      setNote({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function revert() {
    if (!window.confirm('Put this article back to the original version? Your edit will be lost.')) return;
    setBusy(true);
    try {
      await fetch(`/api/master/blog/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      setNote({ ok: true, text: 'Back to the original version.' });
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!d) return <p className="text-xs text-slate-500">{note ? note.text : 'Opening…'}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> All articles
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <ExternalLink className="h-3.5 w-3.5" /> View live
          </a>
          {d.edited ? (
            <button onClick={revert} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-50">
              <Undo2 className="h-3.5 w-3.5" /> Revert to original
            </button>
          ) : null}
          <button onClick={save} disabled={busy || !dirty} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold">
            <Save className="h-3.5 w-3.5" /> {busy ? 'Saving…' : 'Save and publish'}
          </button>
        </div>
      </div>

      {note ? (
        <p className={`text-xs ${note.ok ? 'text-emerald-600' : 'text-rose-600'}`} role={note.ok ? 'status' : 'alert'}>
          {note.text}
        </p>
      ) : null}

      <div className={card}>
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-4 w-4 text-slate-500" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Views, last 30 days ({d.series.reduce((n, s) => n + s.views, 0).toLocaleString()})</p>
        </div>
        <div className="flex items-end gap-[3px] h-16" role="img" aria-label="Views per day for the last 30 days">
          {d.series.map((s) => (
            <div key={s.day} title={`${s.day}: ${s.views}`} className="flex-1 rounded-sm bg-blue-500/80" style={{ height: `${Math.max(4, (s.views / max) * 100)}%`, opacity: s.views ? 1 : 0.25 }} />
          ))}
        </div>
      </div>

      <div className={`${card} space-y-3`}>
        <div className="space-y-1">
          <label htmlFor="blog-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title <span className="font-normal text-slate-400">({title.length} characters)</span></label>
          <input id="blog-title" value={title} onChange={(e) => setTitle(e.target.value)} className={input} maxLength={120} />
        </div>
        <div className="space-y-1">
          <label htmlFor="blog-desc" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Search description <span className={`font-normal ${description.length >= 120 && description.length <= 160 ? 'text-emerald-600' : 'text-slate-400'}`}>({description.length} characters, aim for 120 to 160)</span>
          </label>
          <textarea id="blog-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={input} maxLength={320} />
        </div>
        <div className="space-y-1">
          <label htmlFor="blog-body" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Article <span className="font-normal text-slate-400">({words.toLocaleString()} words)</span></label>
          <textarea id="blog-body" value={body} onChange={(e) => setBody(e.target.value)} rows={28} spellCheck className={`${input} font-mono leading-relaxed`} />
        </div>
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer font-semibold">How to format</summary>
          <pre className="mt-2 whitespace-pre-wrap font-mono">{FORMAT_HELP}</pre>
        </details>
      </div>
    </div>
  );
}

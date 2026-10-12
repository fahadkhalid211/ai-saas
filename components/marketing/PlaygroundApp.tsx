'use client';

import { T, useT } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';
import { useRecaptcha } from '@/components/security/GoogleRecaptcha';
import './playground.css';

interface Source { id: string; title: string; kind: 'file' | 'text' | 'url'; chars: number }
interface Session { key: string; name: string; sources: Source[]; chatsLeft: number; expiresAt: string; limits: { maxSources: number; maxFileMb: number } }
interface Msg { role: 'user' | 'assistant'; content: string; sources?: string[]; booking?: boolean }

/** Wanting to book, in the words people use. The playground answers this with a sample booking form, like a real assistant would. */
const BOOKING_INTENT = /\b(book|booking|schedule|appointment|reserve|reservation|consultation|meeting|demo|call back|callback)\b/i;
const SLOTS = ['9:30 AM', '11:00 AM', '1:15 PM', '3:00 PM', '4:45 PM'];

/** A sample of the booking form the assistant shows on a customer's site. Nothing is saved or sent. */
function DemoBooking({ name }: { name: string }) {
  const __t = useT();
  const days = Array.from({ length: 5 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; });
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState('');
  const [who, setWho] = useState(name);
  const [done, setDone] = useState(false);
  const label = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  if (done) return <div className="pg-book"><b><T>Booked (sample)</T></b><p><T>{who}</T><T>, you are down for</T> {label(days[day])} <T>at</T> <T>{slot}</T><T>. On your own site this lands in your calendar and inbox, and the customer gets a confirmation.</T></p></div>;
  return (
    <form className="pg-book" onSubmit={(e) => { e.preventDefault(); if (slot && who.trim()) setDone(true); }}>
      <b><T>Pick a time</T></b>
      <div className="pg-book-row" role="group" aria-label={__t("Day")}>{days.map((d, i) => <button key={i} type="button" aria-pressed={day === i} onClick={() => setDay(i)}>{label(d)}</button>)}</div>
      <div className="pg-book-row" role="group" aria-label={__t("Time")}>{SLOTS.map((t) => <button key={t} type="button" aria-pressed={slot === t} onClick={() => setSlot(t)}><T>{t}</T></button>)}</div>
      <input value={who} onChange={(e) => setWho(e.target.value)} placeholder={__t("Your name")} maxLength={80} aria-label={__t("Your name")} />
      <button className="pg-btn" disabled={!slot || !who.trim()}><T>Confirm booking</T></button>
      <small><T>This is a sample: nothing is saved. Your real assistant books into your own calendar.</T></small>
    </form>
  );
}

const STORE = 'crescelo_playground_key';

const remember = (key: string | null) => {
  try { if (key) localStorage.setItem(STORE, key); else localStorage.removeItem(STORE); } catch { /* private mode */ }
};

async function call<T>(url: string, init: RequestInit & { key?: string } = {}): Promise<T> {
  const { key, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (key) headers.set('x-playground-key', key);
  const res = await fetch(url, { ...rest, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Something went wrong. Please try again.');
  return data as T;
}

export function PlaygroundApp({ faq }: { faq: { q: string; a: string }[] }) {
  const __t = useT();
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);

  // reopen from the emailed link (?s=) or this browser's memory
  useEffect(() => {
    let key = new URLSearchParams(window.location.search).get('s');
    if (!key) { try { key = localStorage.getItem(STORE); } catch { /* ignore */ } }
    if (!key) { setBooting(false); return; }
    call<Session>(`/api/playground/session?s=${encodeURIComponent(key)}`)
      .then((s) => { setSession(s); remember(s.key); })
      .catch(() => remember(null))
      .finally(() => setBooting(false));
  }, []);

  return (
    <>
      <section className="mk-hero" style={{ marginTop: '1rem' }}>
        <div className="mk-hero-glow" aria-hidden="true" />
        <div className="mk-wrap mk-hero-inner">
          <p className="mk-eyebrow"><T>THE PLAYGROUND</T></p>
          <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}><T>Feed it your docs. Then quiz it.</T></h1>
          <p className="mk-lead" style={{ maxWidth: '58ch' }}>
            <T>Upload a price list, an FAQ or a policy and ask the assistant what a customer would ask. It answers only from what you gave it. No card, no install, no commitment.</T>
          </p>
        </div>
      </section>

      <section className="mk-section" aria-label={__t("Playground")} style={{ paddingTop: '2rem' }}>
        <div className="mk-wrap">
          {booting ? <p className="pg-muted" role="status"><T>Opening your playground…</T></p> : session ? (
            <Workspace session={session} setSession={setSession} onLeave={() => { remember(null); setSession(null); }} />
          ) : (
            <Gate onStart={(s) => { remember(s.key); setSession(s); }} />
          )}
        </div>
      </section>

      <section className="mk-section mk-section-tint" aria-labelledby="pg-faq">
        <div className="mk-wrap">
          <SectionHead eyebrow="GOOD TO KNOW" title="Questions before you try." id="pg-faq" align="center" />
          <div className="pg-faq">
            {faq.map((f, i) => (
              <Reveal key={f.q} delay={i * 50}>
                <details className="pg-faq-item"><summary><T>{f.q}</T></summary><p><T>{f.a}</T></p></details>
              </Reveal>
            ))}
          </div>
          <div className="mk-cta-row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function Gate({ onStart }: { onStart: (s: Session) => void }) {
  const { executeRecaptcha } = useRecaptcha();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [shownAt] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const recaptchaToken = await executeRecaptcha('playground_start');
      onStart(await call<Session>('/api/playground/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, marketingOptIn: optIn, filledInMs: Date.now() - shownAt, recaptchaToken }),
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="pg-gate">
      <Reveal className="pg-gate-copy">
        <h2 className="mk-h2"><T>Open your playground in 10 seconds.</T></h2>
        <ul className="pg-points">
          <li><b><T>Bring your own docs.</T></b> <T>PDF, Word, text, CSV or a web page.</T></li>
          <li><b><T>Honest answers.</T></b> <T>It only says what your documents say.</T></li>
          <li><b><T>No password, no card.</T></b> <T>We email you a private link so you can come back.</T></li>
        </ul>
      </Reveal>
      <Reveal delay={80}>
        <form className="pg-card" onSubmit={submit}>
          <label><T>Your name</T><input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label><T>Work email</T><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" /></label>
          <label className="pg-check"><input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} /> <T>Send me the occasional tip on getting more from an AI assistant. Unsubscribe any time.</T></label>
          {error ? <p className="pg-error" role="alert"><T>{error}</T></p> : null}
          <button className="pg-btn" disabled={busy}><T>{busy ? 'Opening…' : 'Open the playground'}</T></button>
          <small className="pg-muted"><T>We use your details to open the playground and email your link. Documents are deleted from the playground after 7 days. To write answers, your questions and the relevant passages are sent to an AI provider (Groq or Google), so do not add confidential or personal data. See our</T> <A href="/privacy"><T>privacy policy</T></A>.</small>
        </form>
      </Reveal>
    </div>
  );
}

function Workspace({ session, setSession, onLeave }: { session: Session; setSession: (s: Session) => void; onLeave: () => void }) {
  const __t = useT();
  const [sources, setSources] = useState<Source[]>(session.sources);
  const [left, setLeft] = useState(session.chatsLeft);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<'file' | 'text' | 'url'>('file');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const key = session.key;

  // starter questions come from the visitor's own documents and refresh whenever the sources change
  const sourceIds = sources.map((x) => x.id).join(',');
  useEffect(() => {
    if (!sourceIds) { setSuggestions([]); return; }
    let live = true;
    call<{ questions: string[] }>('/api/playground/suggest', { method: 'POST', key })
      .then((r) => { if (live) setSuggestions(r.questions || []); })
      .catch(() => { if (live) setSuggestions([]); });
    return () => { live = false; };
  }, [sourceIds, key]);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs, sending]);

  const add = useCallback(async (init: RequestInit) => {
    setAdding(true); setNote('');
    try {
      const r = await call<{ sources: Source[] }>('/api/playground/sources', { ...init, key });
      setSources(r.sources); setSession({ ...session, sources: r.sources });
      setText(''); setUrl(''); if (fileRef.current) fileRef.current.value = '';
    } catch (err) { setNote((err as Error).message); } finally { setAdding(false); }
  }, [key, session, setSession]);

  async function remove(id: string) {
    try { const r = await call<{ sources: Source[] }>(`/api/playground/sources?id=${encodeURIComponent(id)}`, { method: 'DELETE', key }); setSources(r.sources); } catch (err) { setNote((err as Error).message); }
  }

  async function send(q: string) {
    const message = q.trim();
    if (!message || sending) return;
    const history = msgs.map((m) => ({ role: m.role, content: m.content }));
    if (BOOKING_INTENT.test(message)) {
      setMsgs((m) => [...m, { role: 'user', content: message }, { role: 'assistant', content: 'Happy to help you pick a time. Choose a day and a slot below.', booking: true }]); setInput('');
      return;
    }
    setMsgs((m) => [...m, { role: 'user', content: message }]); setInput(''); setSending(true);
    try {
      const r = await call<{ reply: string; sources: string[]; chatsLeft: number }>('/api/playground/chat', { method: 'POST', key, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }) });
      setMsgs((m) => [...m, { role: 'assistant', content: r.reply, sources: r.sources }]); setLeft(r.chatsLeft);
    } catch (err) { setMsgs((m) => [...m, { role: 'assistant', content: (err as Error).message }]); } finally { setSending(false); }
  }

  const tabs: [typeof mode, string][] = [['file', 'Upload file'], ['text', 'Paste text'], ['url', 'Web page']];
  const full = sources.length >= session.limits.maxSources;
  const post = (body: object) => add({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  return (
    <div className="pg-work">
      <div className="pg-card pg-side">
        <h2 className="pg-h"><T>Hi</T> <T>{session.name.split(' ')[0]}</T><T>, add something to read</T></h2>
        <div className="pg-tabs" role="tablist">
          {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)}><T>{label}</T></button>)}
        </div>
        {mode === 'file' && (
          <div className="pg-add">
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv,.json" disabled={adding || full} aria-label={__t("Choose a file")} />
            <button className="pg-btn" disabled={adding || full} onClick={() => { const f = fileRef.current?.files?.[0]; if (!f) { setNote('Choose a file first.'); return; } const fd = new FormData(); fd.append('file', f); add({ method: 'POST', body: fd }); }}><T>{adding ? 'Reading…' : 'Add file'}</T></button>
            <small className="pg-muted"><T>PDF, Word, text, Markdown, CSV or JSON, up to</T> <T>{session.limits.maxFileMb}</T> <T>MB.</T></small>
          </div>
        )}
        {mode === 'text' && (
          <div className="pg-add">
            <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={__t("Paste your FAQ, opening hours, price list…")} maxLength={60000} aria-label={__t("Text to add")} />
            <button className="pg-btn" disabled={adding || full} onClick={() => post({ kind: 'text', text })}><T>{adding ? 'Reading…' : 'Add text'}</T></button>
          </div>
        )}
        {mode === 'url' && (
          <div className="pg-add">
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={__t("https://yourbusiness.com/faq")} aria-label={__t("Web page address")} />
            <button className="pg-btn" disabled={adding || full} onClick={() => post({ kind: 'url', url })}><T>{adding ? 'Reading…' : 'Add page'}</T></button>
          </div>
        )}
        {full ? <p className="pg-muted"><T>You have added the maximum of</T> <T>{session.limits.maxSources}</T> <T>sources. Remove one to add another.</T></p> : null}
        {note ? <p className="pg-error" role="alert"><T>{note}</T></p> : null}
        <h3 className="pg-sub"><T>Your sources (</T><T>{sources.length}</T>/<T>{session.limits.maxSources}</T>)</h3>
        {sources.length === 0 ? <p className="pg-muted"><T>Nothing yet. Add a document to begin.</T></p> : (
          <ul className="pg-sources">{sources.map((s) => (
            <li key={s.id}><span><T>{s.title}</T></span><button type="button" onClick={() => remove(s.id)} aria-label={`Remove ${s.title}`}><T>Remove</T></button></li>
          ))}</ul>
        )}
        <button type="button" className="pg-link" onClick={onLeave}><T>Not</T> <T>{session.name.split(' ')[0]}</T><T>? Start over</T></button>
      </div>

      <div className="pg-card pg-chat">
        <div className="pg-chat-head"><b><T>Your assistant</T></b><span><T>{left}</T> <T>questions left</T></span></div>
        <div className="pg-log" ref={logRef} aria-live="polite">
          {msgs.length === 0 ? (
            <div className="pg-empty">
              <p><T>{sources.length ? 'Ask it something a customer would ask.' : 'Add a document on the left, then ask away.'}</T></p>
              {suggestions.length ? <div className="pg-chips">{suggestions.map((s) => <button key={s} type="button" onClick={() => send(s)}><T>{s}</T></button>)}</div> : null}
            </div>
          ) : msgs.map((m, i) => (
            <div key={i} className={`pg-msg pg-${m.role}`}>
              <p><T>{m.content}</T></p>
              {m.booking ? <DemoBooking name={session.name} /> : null}
              {m.sources?.length ? <small><T>From:</T> {m.sources.join(', ')}</small> : null}
            </div>
          ))}
          {sending ? <div className="pg-msg pg-assistant"><p className="pg-typing"><T>Thinking…</T></p></div> : null}
        </div>
        {left <= 0 ? (
          <div className="pg-cta"><p><T>You have used all your playground questions.</T></p><ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink></div>
        ) : (
          <form className="pg-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={__t("Ask about your documents…")} maxLength={500} aria-label={__t("Your question")} />
            <button className="pg-btn" disabled={sending || !input.trim()}><T>Send</T></button>
          </form>
        )}
        <div className="pg-cta pg-cta-soft">
          <span><T>Like what you see? Put it on your website in minutes.</T></span>
          <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
        </div>
      </div>
    </div>
  );
}

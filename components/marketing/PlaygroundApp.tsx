'use client';

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
  const days = Array.from({ length: 5 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; });
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState('');
  const [who, setWho] = useState(name);
  const [done, setDone] = useState(false);
  const label = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  if (done) return <div className="pg-book"><b>Booked (sample)</b><p>{who}, you are down for {label(days[day])} at {slot}. On your own site this lands in your calendar and inbox, and the customer gets a confirmation.</p></div>;
  return (
    <form className="pg-book" onSubmit={(e) => { e.preventDefault(); if (slot && who.trim()) setDone(true); }}>
      <b>Pick a time</b>
      <div className="pg-book-row" role="group" aria-label="Day">{days.map((d, i) => <button key={i} type="button" aria-pressed={day === i} onClick={() => setDay(i)}>{label(d)}</button>)}</div>
      <div className="pg-book-row" role="group" aria-label="Time">{SLOTS.map((t) => <button key={t} type="button" aria-pressed={slot === t} onClick={() => setSlot(t)}>{t}</button>)}</div>
      <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Your name" maxLength={80} aria-label="Your name" />
      <button className="pg-btn" disabled={!slot || !who.trim()}>Confirm booking</button>
      <small>This is a sample: nothing is saved. Your real assistant books into your own calendar.</small>
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
          <p className="mk-eyebrow">THE PLAYGROUND</p>
          <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>Feed it your docs. Then quiz it.</h1>
          <p className="mk-lead" style={{ maxWidth: '58ch' }}>
            Upload a price list, an FAQ or a policy and ask the assistant what a customer would ask. It answers only from what you gave it. No card, no install, no commitment.
          </p>
        </div>
      </section>

      <section className="mk-section" aria-label="Playground" style={{ paddingTop: '2rem' }}>
        <div className="mk-wrap">
          {booting ? <p className="pg-muted" role="status">Opening your playground…</p> : session ? (
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
                <details className="pg-faq-item"><summary>{f.q}</summary><p>{f.a}</p></details>
              </Reveal>
            ))}
          </div>
          <div className="mk-cta-row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <ButtonLink href={SIGNUP_HREF}>Start free trial</ButtonLink>
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
        <h2 className="mk-h2">Open your playground in 10 seconds.</h2>
        <ul className="pg-points">
          <li><b>Bring your own docs.</b> PDF, Word, text, CSV or a web page.</li>
          <li><b>Honest answers.</b> It only says what your documents say.</li>
          <li><b>No password, no card.</b> We email you a private link so you can come back.</li>
        </ul>
      </Reveal>
      <Reveal delay={80}>
        <form className="pg-card" onSubmit={submit}>
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label>Work email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" /></label>
          <label className="pg-check"><input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} /> Send me the occasional tip on getting more from an AI assistant. Unsubscribe any time.</label>
          {error ? <p className="pg-error" role="alert">{error}</p> : null}
          <button className="pg-btn" disabled={busy}>{busy ? 'Opening…' : 'Open the playground'}</button>
          <small className="pg-muted">We use your details to open the playground and email your link. Documents are deleted after 7 days. See our <a href="/privacy">privacy policy</a>.</small>
        </form>
      </Reveal>
    </div>
  );
}

function Workspace({ session, setSession, onLeave }: { session: Session; setSession: (s: Session) => void; onLeave: () => void }) {
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
        <h2 className="pg-h">Hi {session.name.split(' ')[0]}, add something to read</h2>
        <div className="pg-tabs" role="tablist">
          {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)}>{label}</button>)}
        </div>
        {mode === 'file' && (
          <div className="pg-add">
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv,.json" disabled={adding || full} aria-label="Choose a file" />
            <button className="pg-btn" disabled={adding || full} onClick={() => { const f = fileRef.current?.files?.[0]; if (!f) { setNote('Choose a file first.'); return; } const fd = new FormData(); fd.append('file', f); add({ method: 'POST', body: fd }); }}>{adding ? 'Reading…' : 'Add file'}</button>
            <small className="pg-muted">PDF, Word, text, Markdown, CSV or JSON, up to {session.limits.maxFileMb} MB.</small>
          </div>
        )}
        {mode === 'text' && (
          <div className="pg-add">
            <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your FAQ, opening hours, price list…" maxLength={60000} aria-label="Text to add" />
            <button className="pg-btn" disabled={adding || full} onClick={() => post({ kind: 'text', text })}>{adding ? 'Reading…' : 'Add text'}</button>
          </div>
        )}
        {mode === 'url' && (
          <div className="pg-add">
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourbusiness.com/faq" aria-label="Web page address" />
            <button className="pg-btn" disabled={adding || full} onClick={() => post({ kind: 'url', url })}>{adding ? 'Reading…' : 'Add page'}</button>
          </div>
        )}
        {full ? <p className="pg-muted">You have added the maximum of {session.limits.maxSources} sources. Remove one to add another.</p> : null}
        {note ? <p className="pg-error" role="alert">{note}</p> : null}
        <h3 className="pg-sub">Your sources ({sources.length}/{session.limits.maxSources})</h3>
        {sources.length === 0 ? <p className="pg-muted">Nothing yet. Add a document to begin.</p> : (
          <ul className="pg-sources">{sources.map((s) => (
            <li key={s.id}><span>{s.title}</span><button type="button" onClick={() => remove(s.id)} aria-label={`Remove ${s.title}`}>Remove</button></li>
          ))}</ul>
        )}
        <button type="button" className="pg-link" onClick={onLeave}>Not {session.name.split(' ')[0]}? Start over</button>
      </div>

      <div className="pg-card pg-chat">
        <div className="pg-chat-head"><b>Your assistant</b><span>{left} questions left</span></div>
        <div className="pg-log" ref={logRef} aria-live="polite">
          {msgs.length === 0 ? (
            <div className="pg-empty">
              <p>{sources.length ? 'Ask it something a customer would ask.' : 'Add a document on the left, then ask away.'}</p>
              {suggestions.length ? <div className="pg-chips">{suggestions.map((s) => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}</div> : null}
            </div>
          ) : msgs.map((m, i) => (
            <div key={i} className={`pg-msg pg-${m.role}`}>
              <p>{m.content}</p>
              {m.booking ? <DemoBooking name={session.name} /> : null}
              {m.sources?.length ? <small>From: {m.sources.join(', ')}</small> : null}
            </div>
          ))}
          {sending ? <div className="pg-msg pg-assistant"><p className="pg-typing">Thinking…</p></div> : null}
        </div>
        {left <= 0 ? (
          <div className="pg-cta"><p>You have used all your playground questions.</p><ButtonLink href={SIGNUP_HREF}>Start free trial</ButtonLink></div>
        ) : (
          <form className="pg-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your documents…" maxLength={500} aria-label="Your question" />
            <button className="pg-btn" disabled={sending || !input.trim()}>Send</button>
          </form>
        )}
        <div className="pg-cta pg-cta-soft">
          <span>Like what you see? Put it on your website in minutes.</span>
          <ButtonLink href={SIGNUP_HREF}>Start free trial</ButtonLink>
        </div>
      </div>
    </div>
  );
}

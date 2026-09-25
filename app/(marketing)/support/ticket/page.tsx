'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';

interface TicketView {
  ref: string;
  subject: string;
  category: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdAt: string;
}
interface Msg {
  id: string;
  author: 'customer' | 'staff' | 'system';
  authorName: string;
  body: string;
  createdAt: string;
}

const STATUS_LABEL: Record<TicketView['status'], string> = {
  open: 'Open: waiting for our team',
  pending: 'Waiting for your reply',
  resolved: 'Resolved',
  closed: 'Closed',
};

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function TicketPage() {
  const [ref, setRef] = useState('');
  const [token, setToken] = useState('');
  const [ticket, setTicket] = useState<TicketView | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [canReply, setCanReply] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'nolink'>('loading');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (r: string, t: string) => {
    try {
      const res = await fetch(`/api/support/tickets/${encodeURIComponent(r)}?t=${encodeURIComponent(t)}`, { cache: 'no-store' });
      if (!res.ok) {
        setState('missing');
        return;
      }
      const data = await res.json();
      setTicket(data.ticket);
      setMessages(data.messages);
      setCanReply(Boolean(data.canReply));
      setState('ready');
    } catch {
      setState('missing');
    }
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const r = q.get('ref') || '';
    const t = q.get('t') || '';
    if (!r || !t) {
      setState('nolink');
      return;
    }
    setRef(r);
    setToken(t);
    load(r, t);
  }, [load]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/support/tickets/${encodeURIComponent(ref)}?t=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send your reply.');
      setReply('');
      await load(ref, token);
    } catch (err: any) {
      setError(err?.message || 'Could not send your reply.');
    }
    setSending(false);
  };

  const closeTicket = async () => {
    if (!confirm('Close this ticket? You can still open a new request later.')) return;
    await fetch(`/api/support/tickets/${encodeURIComponent(ref)}?t=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close' }),
    });
    await load(ref, token);
  };

  return (
    <>
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '780px' }}>
            {state === 'loading' && <p style={{ color: 'var(--mk-muted)' }}>Loading your ticket...</p>}

            {state === 'nolink' && (
              <article className="mk-card" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Find your ticket</h1>
                <p style={{ color: 'var(--mk-muted)' }}>
                  Tickets are private. Open the link in the e-mail we sent when you contacted us; it takes you straight to your ticket. If you cannot find it, check your spam folder or{' '}
                  <a href="/support/contact" style={{ textDecoration: 'underline' }}>send a new request</a>.
                </p>
              </article>
            )}

            {state === 'missing' && (
              <article className="mk-card" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Ticket not found</h1>
                <p style={{ color: 'var(--mk-muted)' }}>
                  This link is not valid. Please use the exact link from our e-mail, or{' '}
                  <a href="/support/contact" style={{ textDecoration: 'underline' }}>send a new request</a>.
                </p>
              </article>
            )}

            {state === 'ready' && ticket && (
              <>
                <p className="mk-eyebrow">Ticket {ticket.ref}</p>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{ticket.subject}</h1>
                <p style={{ color: 'var(--mk-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  {ticket.category} · opened {fmt(ticket.createdAt)} · <strong>{STATUS_LABEL[ticket.status]}</strong>
                </p>

                <div style={{ display: 'grid', gap: '14px' }}>
                  {messages.map((m) => (
                    <article
                      key={m.id}
                      className="mk-card"
                      style={{
                        padding: '16px clamp(14px, 3.5vw, 20px)',
                        borderColor: m.author === 'staff' ? 'var(--mk-ink)' : undefined,
                        background: m.author === 'staff' ? 'var(--mk-surface)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--mk-muted)', marginBottom: '8px' }}>
                        <strong style={{ color: 'var(--mk-ink)' }}>{m.author === 'staff' ? 'Crescelo Support' : m.authorName || 'You'}</strong>
                        <span>{fmt(m.createdAt)}</span>
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', fontSize: '15px', lineHeight: 1.6 }}>{m.body}</div>
                    </article>
                  ))}
                </div>

                {canReply ? (
                  <form onSubmit={send} style={{ display: 'grid', gap: '12px', marginTop: '24px' }}>
                    <label htmlFor="ticket-reply" style={{ fontSize: '13px', fontWeight: 700 }}>
                      {ticket.status === 'resolved' ? 'Not solved? Reply to reopen this ticket' : 'Add a reply'}
                    </label>
                    <textarea
                      id="ticket-reply"
                      rows={5}
                      maxLength={5000}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid var(--mk-ink)', background: 'var(--mk-bg)', fontSize: '15px', fontFamily: 'inherit' }}
                    />
                    {error && <p style={{ color: 'var(--mk-warn)', fontSize: '14px', fontWeight: 600 }}>{error}</p>}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button type="submit" disabled={sending || !reply.trim()} className="mk-btn mk-btn-primary">
                        {sending ? 'Sending...' : 'Send reply'}
                      </button>
                      <button type="button" onClick={closeTicket} className="mk-btn mk-btn-ghost">
                        Close ticket
                      </button>
                    </div>
                  </form>
                ) : (
                  <p style={{ marginTop: '24px', color: 'var(--mk-muted)' }}>
                    This ticket is closed. <a href="/support/contact" style={{ textDecoration: 'underline' }}>Open a new request</a> if you still need help.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

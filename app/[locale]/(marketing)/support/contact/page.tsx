'use client';

import { T, useT } from '@/lib/i18n/context';
import { useEffect, useState, type FormEvent } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { Reveal, SectionHead } from '@/components/marketing/ui';
import { GoogleRecaptchaNotice, useRecaptcha } from '@/components/security/GoogleRecaptcha';

const CATEGORIES = ['Technical Support', 'Billing & Payments', 'Account & Access', 'Privacy request', 'Security', 'Sales & Enterprise', 'Feature request', 'General Support'];

export default function ContactPage() {
  const __t = useT();
  const { executeRecaptcha } = useRecaptcha();
  const [website, setWebsite] = useState(''); // honeypot: real visitors never see or fill this
  const [ticketRef, setTicketRef] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [business, setBusiness] = useState('');
  const [category, setCategory] = useState('Technical Support');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // links such as /support/contact?category=Privacy%20request prefill the form
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const cat = q.get('category');
    if (cat && CATEGORIES.includes(cat)) setCategory(cat);
    const mail = q.get('email');
    if (mail) setEmail(mail);
    const topic = q.get('topic');
    if (topic === 'newsletter') setMessage('Please add me to the Crescelo email updates.');
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Email, and Message).');
      return;
    }
    setErrorMsg('');
    setStatus('sending');

    try {
      const recaptchaToken = await executeRecaptcha('contact');
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          business: business.trim(),
          category,
          priority,
          message: message.trim(),
          website,
          recaptchaToken,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit support request.');
      }

      setTicketRef(data?.ticketRef || '');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Could not send your request. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '780px' }}>
            <SectionHead
              as="h1"
              eyebrow="Contact & Support"
              title="Get in touch with our solutions team."
              intro="Whether you need help setting up your assistant, subscribing to your calendar feed, or exploring custom enterprise deployment, our engineering team responds within 24 hours."
              id="contact"
              align="center"
            />

            <Reveal
              as="article"
              className="mk-card"
              style={{
                padding: 'clamp(20px, 4vw, 40px)',
                marginTop: '40px',
                background: 'var(--mk-surface)',
                borderColor: 'var(--mk-ink)',
              }}
            >
              {status === 'success' ? (
                <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--mk-lime)',
                      color: 'var(--mk-deep)',
                      fontSize: '24px',
                      fontWeight: 800,
                      marginBottom: '16px',
                    }}
                  >
                    ✓
                  </span>
                  <h3 style={{ fontSize: '2rem', marginBottom: '8px' }}><T>Ticket</T> <T>{ticketRef || 'created'}</T> <T>opened</T></h3>
                  <p style={{ color: 'var(--mk-muted)', fontSize: '15px', maxWidth: '44ch', marginInline: 'auto' }}>
                    <T>Thank you,</T> <T>{name}</T><T>! We sent a confirmation to</T> <strong><T>{email}</T></strong> <T>with a private link to your ticket. Use that link to follow the progress and to reply. Check your spam folder if it does not arrive within a few minutes.</T>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setName('');
                      setEmail('');
                      setBusiness('');
                      setMessage('');
                      setTicketRef('');
                      setStatus('idle');
                    }}
                    className="mk-btn mk-btn-primary mk-btn-sm"
                    style={{ marginTop: '24px' }}
                  >
                    <T>Send another inquiry</T>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px' }}>
                    <div>
                      <label htmlFor="contact-name" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        <T>Your Full Name *</T>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={__t("Alex Morgan")}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--mk-ink)',
                          background: 'var(--mk-bg)',
                          fontSize: '15px',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        <T>Email Address *</T>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={__t("alex@acme.com")}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--mk-ink)',
                          background: 'var(--mk-bg)',
                          fontSize: '15px',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px' }}>
                    <div>
                      <label htmlFor="contact-business" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        <T>Company / Organization</T>
                      </label>
                      <input
                        id="contact-business"
                        type="text"
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        placeholder={__t("Apex Wellness Group")}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--mk-ink)',
                          background: 'var(--mk-bg)',
                          fontSize: '15px',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-category" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        <T>Topic Category</T>
                      </label>
                      <select
                        id="contact-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--mk-ink)',
                          background: 'var(--mk-bg)',
                          fontSize: '15px',
                          cursor: 'pointer',
                        }}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-msg" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      <T>How can we help? *</T>
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={__t("Describe your request, issue, or question in detail...")}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--mk-ink)',
                        background: 'var(--mk-bg)',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                    <label htmlFor="contact-website"><T>Website</T></label>
                    <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>

                  {errorMsg && (
                    <p style={{ color: 'var(--mk-warn)', fontSize: '14px', fontWeight: 600 }}>
                      <T>{errorMsg}</T>
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--mk-muted)' }}>
                        <T>Every request becomes a ticket you can follow and reply to. Replies come by email with a link to it.</T>
                      </span>
                      <GoogleRecaptchaNotice />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="mk-btn mk-btn-primary"
                    >
                      <T>{status === 'sending' ? 'Submitting...' : 'Submit Support Request'}</T>
                    </button>
                  </div>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

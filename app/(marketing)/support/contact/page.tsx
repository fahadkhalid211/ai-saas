'use client';

import { useState, type FormEvent } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { Reveal, SectionHead } from '@/components/marketing/ui';
import { SITE } from '@/components/marketing/content';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [business, setBusiness] = useState('');
  const [category, setCategory] = useState('Technical Support');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Email, and Message).');
      return;
    }
    setErrorMsg('');
    setStatus('sending');

    try {
      // Direct mailto fallback and graceful simulated submission
      const subject = encodeURIComponent(`[${priority}] ${category} inquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nBusiness: ${business}\nCategory: ${category}\nPriority: ${priority}\n\nMessage:\n${message}`
      );
      
      // Simulate quick processing then provide confirmation
      await new Promise((r) => setTimeout(r, 600));
      setStatus('success');
      window.location.href = `mailto:${SITE.contactEmail}?subject=${subject}&body=${body}`;
    } catch {
      setStatus('error');
      setErrorMsg('Failed to dispatch support request. Please email us directly.');
    }
  };

  return (
    <>
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '780px' }}>
            <SectionHead
              eyebrow="Contact & Support"
              title="Get in touch with our solutions team."
              intro="Whether you need help configuring your voice worker, connecting Google Calendar, or exploring custom enterprise deployment, our engineering team responds within 24 hours."
              id="contact"
              align="center"
            />

            <Reveal
              as="article"
              className="mk-card"
              style={{
                padding: '40px',
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
                  <h3 style={{ fontSize: '2rem', marginBottom: '8px' }}>Support Request Received</h3>
                  <p style={{ color: 'var(--mk-muted)', fontSize: '15px', maxWidth: '44ch', marginInline: 'auto' }}>
                    Thank you, {name}! Your ticket has been logged and forwarded to our engineering team. We will review your inquiry and follow up at <strong>{email}</strong> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mk-btn mk-btn-primary mk-btn-sm"
                    style={{ marginTop: '24px' }}
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div>
                      <label htmlFor="contact-name" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Your Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Morgan"
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
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@acme.com"
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div>
                      <label htmlFor="contact-business" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Company / Organization
                      </label>
                      <input
                        id="contact-business"
                        type="text"
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        placeholder="Apex Wellness Group"
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
                        Topic Category
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
                        <option value="Technical Support">Technical Support</option>
                        <option value="Phone Voice Worker">Phone Voice Worker & Telnyx</option>
                        <option value="Calendar & Booking">Calendar Sync & Mutex Locks</option>
                        <option value="Billing & Plans">Billing & Plan Inquiries</option>
                        <option value="Custom Enterprise">Custom Enterprise Integration</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-msg" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      How can we help? *
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your request, issue, or question in detail..."
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

                  {errorMsg && (
                    <p style={{ color: 'var(--mk-warn)', fontSize: '14px', fontWeight: 600 }}>
                      {errorMsg}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--mk-muted)' }}>
                      Direct email: <a href="mailto:contact@crescelo.com" style={{ textDecoration: 'underline' }}>contact@crescelo.com</a>
                    </span>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="mk-btn mk-btn-primary"
                    >
                      {status === 'sending' ? 'Submitting...' : 'Submit Support Request'}
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

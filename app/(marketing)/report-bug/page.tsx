'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { Reveal, SectionHead } from '@/components/marketing/ui';
import { GoogleRecaptchaNotice, useRecaptcha } from '@/components/security/GoogleRecaptcha';
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  ExternalLink,
  Laptop,
  LifeBuoy,
  RefreshCw,
  Send,
  ShieldAlert,
} from 'lucide-react';

const AREAS = [
  'AI Assistant & Chat',
  'CRM & Leads',
  'Calendar & Booking',
  'Integrations (WhatsApp / Telegram)',
  'Billing & Subscription',
  'Authentication & Account',
  'Mobile App',
  'Knowledge Base & RAG',
  'Developer API & Webhooks',
  'Other / Unspecified',
];

const SEVERITIES = [
  {
    id: 'normal',
    label: 'Normal',
    desc: 'Unexpected glitch or annoyance with workaround',
    badgeClass: 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  },
  {
    id: 'low',
    label: 'Low',
    desc: 'Minor visual glitch, cosmetic flaw, or typo',
    badgeClass: 'border-slate-200 dark:border-slate-700 text-slate-500',
  },
  {
    id: 'high',
    label: 'High',
    desc: 'Important feature impaired; work disrupted',
    badgeClass: 'border-amber-300 dark:border-amber-700/80 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'critical',
    label: 'Critical',
    desc: 'System outage, blocking appointments or data loss',
    badgeClass: 'border-rose-300 dark:border-rose-700/80 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300',
  },
];

interface EnvironmentInfo {
  browser: string;
  os: string;
  deviceType: string;
  screenResolution: string;
  viewport: string;
  pageUrl: string;
}

export default function ReportBugPage() {
  const { executeRecaptcha } = useRecaptcha();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [business, setBusiness] = useState('');
  const [area, setArea] = useState(AREAS[0]);
  const [severity, setSeverity] = useState('normal');
  const [title, setTitle] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  // Diagnostics
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo>({
    browser: '',
    os: '',
    deviceType: '',
    screenResolution: '',
    viewport: '',
    pageUrl: '',
  });
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Submission state
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [ticketRef, setTicketRef] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');

  // Auto-detect environment on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect browser
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    if (ua.includes('Firefox/')) {
      browser = `Firefox ${ua.split('Firefox/')[1]?.split(' ')[0] || ''}`;
    } else if (ua.includes('Edg/')) {
      browser = `Edge ${ua.split('Edg/')[1]?.split(' ')[0] || ''}`;
    } else if (ua.includes('Chrome/')) {
      browser = `Chrome ${ua.split('Chrome/')[1]?.split(' ')[0] || ''}`;
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
      browser = `Safari ${ua.split('Version/')[1]?.split(' ')[0] || ''}`;
    }

    // Detect OS
    let os = 'Unknown OS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    // Device type
    const isMobile = /Mobi|Android/i.test(ua);
    const isTablet = /Tablet|iPad/i.test(ua);
    const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

    const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
    const viewport = `${window.innerWidth}x${window.innerHeight}`;

    // Read URL or query params
    const q = new URLSearchParams(window.location.search);
    const prefillArea = q.get('area');
    if (prefillArea && AREAS.includes(prefillArea)) {
      setArea(prefillArea);
    }
    const prefillUrl = q.get('url') || document.referrer || window.location.origin;

    setEnvInfo({
      browser: browser.trim(),
      os,
      deviceType,
      screenResolution: screenRes,
      viewport,
      pageUrl: prefillUrl,
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Please provide your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a brief summary of the bug.');
      return;
    }
    if (!stepsToReproduce.trim() || stepsToReproduce.trim().length < 10) {
      setErrorMsg('Please describe the steps to reproduce the issue (at least 10 characters).');
      return;
    }

    setErrorMsg('');
    setStatus('sending');

    try {
      const recaptchaToken = await executeRecaptcha('bug_report');
      const res = await fetch('/api/support/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          business: business.trim(),
          title: title.trim(),
          area,
          severity,
          stepsToReproduce: stepsToReproduce.trim(),
          expectedBehavior: expectedBehavior.trim(),
          actualBehavior: actualBehavior.trim(),
          errorMessage: errorMessage.trim(),
          screenshotUrl: screenshotUrl.trim(),
          environment: envInfo,
          website,
          recaptchaToken,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit bug report.');
      }

      setTicketRef(data.ticketRef || '');
      setTicketUrl(data.ticketUrl || '');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Could not submit your bug report. Please try again or contact support directly.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setStepsToReproduce('');
    setExpectedBehavior('');
    setActualBehavior('');
    setErrorMessage('');
    setScreenshotUrl('');
    setTicketRef('');
    setTicketUrl('');
    setStatus('idle');
  };

  return (
    <>
      <Header />
      <main id="main">
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '840px' }}>
            <SectionHead
              as="h1"
              eyebrow="Bug Report & Issue Triage"
              title="Report an issue. Help us engineer perfection."
              intro="Encountered an error, unexpected glitch, or broken flow in Crescelo? Submit the details below. Our engineering team reviews and triages all bug reports promptly."
              id="report-bug"
              align="center"
            />

            <Reveal
              as="article"
              className="mk-card"
              style={{
                padding: 'clamp(20px, 4vw, 40px)',
                marginTop: '36px',
                background: 'var(--mk-surface)',
                borderColor: 'var(--mk-ink)',
              }}
            >
              {status === 'success' ? (
                <div style={{ textAlign: 'center', padding: '40px 12px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'var(--mk-lime)',
                      color: 'var(--mk-deep)',
                      fontSize: '28px',
                      fontWeight: 800,
                      marginBottom: '20px',
                    }}
                  >
                    ✓
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>
                    Bug Ticket <span style={{ fontFamily: 'monospace' }}>{ticketRef}</span> Created
                  </h2>
                  <p
                    style={{
                      color: 'var(--mk-muted)',
                      fontSize: '15px',
                      maxWidth: '52ch',
                      marginInline: 'auto',
                      lineHeight: '1.6',
                    }}
                  >
                    Thank you, <strong>{name}</strong>! We logged your bug report in our issue tracking queue and sent a confirmation link to <strong>{email}</strong>.
                    You can track updates, view engineering responses, and post additional diagnostic information directly on your ticket.
                  </p>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '28px' }}>
                    {ticketUrl && (
                      <Link
                        href={ticketUrl}
                        className="mk-btn mk-btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        View Ticket Status <ExternalLink size={16} />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={resetForm}
                      className="mk-btn mk-btn-ghost"
                    >
                      Report another issue
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '24px' }}>
                  {/* Reporter info */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LifeBuoy size={18} style={{ color: 'var(--mk-lime)' }} /> Your Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '16px' }}>
                      <div>
                        <label htmlFor="bug-name" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                          Your Name *
                        </label>
                        <input
                          id="bug-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jordan Lee"
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
                        <label htmlFor="bug-email" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                          Email Address *
                        </label>
                        <input
                          id="bug-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jordan@company.com"
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
                        <label htmlFor="bug-business" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                          Company / Workspace <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
                        </label>
                        <input
                          id="bug-business"
                          type="text"
                          value={business}
                          onChange={(e) => setBusiness(e.target.value)}
                          placeholder="Acme Health"
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
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--mk-ink)', margin: '4px 0' }} />

                  {/* Bug Classification */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bug size={18} style={{ color: 'var(--mk-lime)' }} /> Issue Classification
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
                      <div>
                        <label htmlFor="bug-area" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                          Affected Component / Area *
                        </label>
                        <select
                          id="bug-area"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
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
                          {AREAS.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                          Severity Level *
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                          {SEVERITIES.map((s) => {
                            const isSelected = severity === s.id;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setSeverity(s.id)}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  textAlign: 'left',
                                  border: isSelected ? '2px solid var(--mk-lime)' : '1px solid var(--mk-ink)',
                                  background: isSelected ? 'rgba(163, 230, 53, 0.08)' : 'var(--mk-bg)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div style={{ fontSize: '13px', fontWeight: 700 }}>{s.label}</div>
                                <div style={{ fontSize: '10px', color: 'var(--mk-muted)', lineHeight: '1.2', marginTop: '2px' }}>
                                  {s.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--mk-ink)', margin: '4px 0' }} />

                  {/* Bug Details */}
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} style={{ color: 'var(--mk-lime)' }} /> Bug Details
                    </h3>

                    <div>
                      <label htmlFor="bug-title" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Issue Title / Summary *
                      </label>
                      <input
                        id="bug-title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Chat widget crashes on Safari iOS when tapping voice button"
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
                      <label htmlFor="bug-steps" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Steps to Reproduce *
                      </label>
                      <p style={{ fontSize: '12px', color: 'var(--mk-muted)', marginBottom: '8px' }}>
                        Please provide numbered step-by-step instructions that allow us to observe the bug:
                      </p>
                      <textarea
                        id="bug-steps"
                        rows={4}
                        required
                        value={stepsToReproduce}
                        onChange={(e) => setStepsToReproduce(e.target.value)}
                        placeholder={`1. Open https://crescelo.com/dashboard/calendar&#10;2. Click on "Add New Appointment"&#10;3. Select a date and click Save&#10;4. Observe the button stays spinning indefinitely.`}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--mk-ink)',
                          background: 'var(--mk-bg)',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          lineHeight: '1.5',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
                      <div>
                        <label htmlFor="bug-expected" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                          Expected Behavior
                        </label>
                        <textarea
                          id="bug-expected"
                          rows={3}
                          value={expectedBehavior}
                          onChange={(e) => setExpectedBehavior(e.target.value)}
                          placeholder="Appointment should be created and confirmation toast displayed."
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: '1.5px solid var(--mk-ink)',
                            background: 'var(--mk-bg)',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="bug-actual" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                          Actual Behavior
                        </label>
                        <textarea
                          id="bug-actual"
                          rows={3}
                          value={actualBehavior}
                          onChange={(e) => setActualBehavior(e.target.value)}
                          placeholder="Nothing happens, console shows 500 internal server error."
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: '1.5px solid var(--mk-ink)',
                            background: 'var(--mk-bg)',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="bug-error-logs" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Error Messages or Console Logs <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
                      </label>
                      <textarea
                        id="bug-error-logs"
                        rows={3}
                        value={errorMessage}
                        onChange={(e) => setErrorMessage(e.target.value)}
                        placeholder="Paste any error message, red console logs, or stack trace here..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--mk-ink)',
                          background: 'var(--mk-bg)',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="bug-screenshot" style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                        Screenshot / Screen Recording URL <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
                      </label>
                      <input
                        id="bug-screenshot"
                        type="url"
                        value={screenshotUrl}
                        onChange={(e) => setScreenshotUrl(e.target.value)}
                        placeholder="Link to Loom video, Imgur, or cloud screenshot (e.g. https://loom.com/share/...)"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--mk-ink)',
                          background: 'var(--mk-bg)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--mk-ink)', margin: '4px 0' }} />

                  {/* Auto-detected Diagnostics Accordion */}
                  <div
                    style={{
                      border: '1px solid var(--mk-ink)',
                      borderRadius: '14px',
                      background: 'rgba(0, 0, 0, 0.02)',
                      padding: '14px 18px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowDiagnostics(!showDiagnostics)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 0,
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Laptop size={16} style={{ color: 'var(--mk-lime)' }} />
                        System Diagnostics <span style={{ fontSize: '11px', color: 'var(--mk-muted)', fontWeight: 400 }}>(Auto-collected for debugging)</span>
                      </span>
                      {showDiagnostics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showDiagnostics && (
                      <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
                        <div>
                          <strong style={{ color: 'var(--mk-muted)' }}>Browser:</strong>
                          <div>{envInfo.browser || 'Detecting...'}</div>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--mk-muted)' }}>OS / Platform:</strong>
                          <div>{envInfo.os || 'Detecting...'}</div>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--mk-muted)' }}>Device Type:</strong>
                          <div>{envInfo.deviceType || 'Detecting...'}</div>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--mk-muted)' }}>Screen:</strong>
                          <div>{envInfo.screenResolution} (Viewport: {envInfo.viewport})</div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label htmlFor="diag-pageurl" style={{ display: 'block', fontWeight: 700, marginBottom: '4px', color: 'var(--mk-muted)' }}>
                            Page URL where bug occurred:
                          </label>
                          <input
                            id="diag-pageurl"
                            type="text"
                            value={envInfo.pageUrl}
                            onChange={(e) => setEnvInfo({ ...envInfo, pageUrl: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid var(--mk-ink)',
                              background: 'var(--mk-bg)',
                              fontSize: '12px',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Honeypot for spam bots */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                    <label htmlFor="bug-website">Website</label>
                    <input
                      id="bug-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  {errorMsg && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: 'var(--mk-warn)',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--mk-muted)' }}>
                        All bug reports create a ticket with private link delivered to your email.
                      </span>
                      <GoogleRecaptchaNotice />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="mk-btn mk-btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      {status === 'sending' ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Submit Bug Report
                        </>
                      )}
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

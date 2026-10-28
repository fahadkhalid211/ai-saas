'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { Reveal, SectionHead } from '@/components/marketing/ui';
import Link from '@/components/i18n/Link';
import { Bot, Brain, BarChart3, Mic, Workflow, ShieldCheck, Check } from 'lucide-react';

/* ─── Data ─────────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    icon: Bot,
    tone: 'lav',
    kicker: 'Custom LLM Integration',
    title: 'AI Chatbots & Assistants',
    body: 'Purpose-built conversational AI trained on your data, integrated into your existing stack. From customer support to internal knowledge bases.',
    tags: ['GPT-4o', 'Claude', 'Gemini', 'Llama'],
  },
  {
    icon: Brain,
    tone: 'lime',
    kicker: 'Intelligent Automation',
    title: 'Agentic Workflows',
    body: 'Multi-step AI agents that read, reason and act — automating complex business processes end-to-end without human hand-holding.',
    tags: ['RAG Pipelines', 'Tool Use', 'Multi-agent'],
  },
  {
    icon: BarChart3,
    tone: 'mint',
    kicker: 'Data & Insights',
    title: 'AI-Powered Analytics',
    body: 'Turn raw business data into actionable decisions. Natural-language querying, anomaly detection, forecasting and executive dashboards.',
    tags: ['LLM Analytics', 'Vector Search', 'Forecasting'],
  },
  {
    icon: Mic,
    tone: 'amber',
    kicker: 'Voice & Multimodal',
    title: 'Voice AI & Speech',
    body: 'Real-time voice agents that handle calls, transcribe meetings and synthesise speech in your brand voice — any language, any channel.',
    tags: ['Whisper', 'TTS', 'Real-time streaming'],
  },
  {
    icon: Workflow,
    tone: 'coral',
    kicker: 'System Integration',
    title: 'AI API & Connectors',
    body: 'Plug AI into your CRM, ERP, website, mobile app or internal tools via clean REST/GraphQL APIs with enterprise-grade auth and rate limiting.',
    tags: ['REST APIs', 'Webhooks', 'SDKs'],
  },
  {
    icon: ShieldCheck,
    tone: 'pink',
    kicker: 'Compliance & Security',
    title: 'Private AI Deployments',
    body: 'On-premise or private-cloud deployments for regulated industries. HIPAA-aware design, data residency controls and audit trails baked in.',
    tags: ['On-premise', 'HIPAA-aware', 'Audit logs'],
  },
];

const PROCESS = [
  {
    num: '01',
    title: 'Discovery Call',
    body: 'We spend 30–60 minutes understanding your business, data, and goals. No jargon, no pitch — just straight answers on what AI can and cannot do for you.',
  },
  {
    num: '02',
    title: 'Solution Design',
    body: 'Our engineers map the architecture: model selection, data pipeline, integration points, and a realistic timeline. You get a written spec before any code is written.',
  },
  {
    num: '03',
    title: 'Build & Iterate',
    body: 'Weekly demos, short sprints. You see progress every step of the way and can redirect at any checkpoint — no black-box waterfall delivery.',
  },
  {
    num: '04',
    title: 'Deploy & Support',
    body: 'We handle production deployment, monitoring and ongoing maintenance. Your team gets training, runbooks, and direct Slack access to our engineers.',
  },
];

const RESULTS = [
  { value: '12h', label: 'Average response time on enquiries' },
  { value: '3×', label: 'Faster delivery vs. hiring in-house' },
  { value: '100%', label: 'Projects delivered with working demo first' },
  { value: '24/7', label: 'Deployed AI running around the clock' },
];

const PROJECT_TYPES = [
  'Customer support chatbot',
  'Internal knowledge base AI',
  'Voice agent / IVR replacement',
  'Data analytics & reporting',
  'Lead qualification automation',
  'Document processing pipeline',
  'E-commerce recommendation engine',
  'Custom LLM fine-tuning',
  'AI API integration',
  'Other / not sure yet',
];

const BUDGETS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000 – $150,000',
  '$150,000+',
  'Not sure yet',
];

const TIMELINES = [
  'ASAP (1–4 weeks)',
  '1–3 months',
  '3–6 months',
  'Flexible / ongoing',
];

/* ─── Animated number counter ───────────────────────────────────────────── */
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect(); } },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
      <div
        style={{
          fontFamily: 'var(--mk-display)',
          fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
          fontWeight: 700,
          color: 'var(--mk-lime)',
          lineHeight: 1,
          transform: visible ? 'none' : 'translateY(12px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.9375rem', color: '#cfe3d6', marginTop: '0.5rem', maxWidth: '18ch', marginInline: 'auto' }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Floating particle background ─────────────────────────────────────── */
function Particles() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${4 + (i % 5) * 3}px`,
            height: `${4 + (i % 5) * 3}px`,
            borderRadius: '50%',
            background: i % 3 === 0 ? 'rgba(171,255,68,0.25)' : i % 3 === 1 ? 'rgba(91,219,186,0.2)' : 'rgba(240,215,255,0.2)',
            left: `${(i * 17 + 5) % 95}%`,
            top: `${(i * 23 + 10) % 90}%`,
            animation: `mk-drift ${8 + (i % 4) * 2}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Service card ──────────────────────────────────────────────────────── */
function ServiceCard({ svc, index }: { svc: typeof SERVICES[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const toneMap: Record<string, string> = {
    lav: 'var(--mk-lav)',
    lime: 'var(--mk-lime-soft)',
    mint: 'var(--mk-bg-tint)',
    amber: 'var(--mk-warn-soft)',
    coral: '#ffd9d0',
    pink: '#ffe3f9',
  };
  const bg = toneMap[svc.tone] ?? 'var(--mk-surface)';

  return (
    <Reveal as="article" delay={index * 80}>
      <div
        style={{
          border: '1.5px solid var(--mk-ink)',
          borderRadius: '1.75rem',
          background: bg,
          padding: 'clamp(1.5rem, 4vw, 2.25rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          cursor: 'default',
          height: '100%',
          transform: hovered ? 'translate(-3px, -4px)' : 'none',
          boxShadow: hovered ? '0.375rem 0.5rem 0 var(--mk-ink)' : '0 0 0 transparent',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
      <div style={{ lineHeight: 1 }}><svc.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" /></div>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mk-accent)', marginBottom: '0.35rem' }}>
          {svc.kicker}
        </p>
        <h3 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.015em' }}>
          {svc.title}
        </h3>
      </div>
      <p style={{ color: 'var(--mk-muted)', fontSize: '0.9688rem', lineHeight: 1.6, flex: 1 }}>{svc.body}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
        {svc.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.625rem',
              borderRadius: '999px',
              border: '1.5px solid var(--mk-ink)',
              background: 'var(--mk-surface)',
              color: 'var(--mk-deep)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      </div>
    </Reveal>
  );
}

/* ─── Quote form ────────────────────────────────────────────────────────── */
function QuoteForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [details, setDetails] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 0.875rem',
    borderRadius: '0.875rem',
    border: '1.5px solid var(--mk-ink)',
    background: 'var(--mk-bg)',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    color: 'var(--mk-ink)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 700,
    marginBottom: '0.375rem',
    color: 'var(--mk-deep)',
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !projectType || !details.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setStatus('sending');

    // Send to the existing contact/support endpoint
    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          business: company.trim(),
          category: 'Sales & Enterprise',
          priority: 'High',
          message: `Custom AI Project Enquiry\n\nProject Type: ${projectType}\nBudget: ${budget || 'Not specified'}\nTimeline: ${timeline || 'Not specified'}\n\nProject Details:\n${details.trim()}`,
          website,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit.');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Could not send your enquiry. Please try again or email us directly.');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'var(--mk-lime)',
            border: '1.5px solid var(--mk-ink)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            marginBottom: '1.25rem',
            boxShadow: '0 0.25rem 0 var(--mk-ink)',
          }}
        ><Check className="h-6 w-6" /></div>
        <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: '0.625rem' }}>Quote request received!</h3>
        <p style={{ color: 'var(--mk-muted)', maxWidth: '44ch', marginInline: 'auto', fontSize: '0.9688rem' }}>
          We&apos;ll review your project details and get back to you within 12 business hours with a tailored proposal. Check your inbox — a copy is on its way.
        </p>
        <button
          type="button"
          onClick={() => {
            setName(''); setEmail(''); setCompany(''); setProjectType('');
            setBudget(''); setTimeline(''); setDetails('');
            setStatus('idle');
          }}
          className="mk-btn mk-btn-ghost"
          style={{ marginTop: '1.5rem' }}
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '1.25rem' }}>
      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
        <div>
          <label htmlFor="qa-name" style={labelStyle}>Your Full Name *</label>
          <input id="qa-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="qa-email" style={labelStyle}>Work Email *</label>
          <input id="qa-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" style={inputStyle} />
        </div>
      </div>

      {/* Row 2 */}
      <div>
        <label htmlFor="qa-company" style={labelStyle}>Company / Organisation</label>
        <input id="qa-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." style={inputStyle} />
      </div>

      {/* Project type */}
      <div>
        <label htmlFor="qa-type" style={labelStyle}>What kind of AI project is this? *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
          {PROJECT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setProjectType(t)}
              style={{
                padding: '0.4375rem 0.875rem',
                borderRadius: '999px',
                border: `1.5px solid ${projectType === t ? 'var(--mk-ink)' : 'var(--mk-line)'}`,
                background: projectType === t ? 'var(--mk-lime)' : 'var(--mk-surface)',
                color: projectType === t ? 'var(--mk-deep)' : 'var(--mk-muted)',
                fontSize: '0.8438rem',
                fontWeight: projectType === t ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                transform: projectType === t ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Budget + timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
        <div>
          <label style={labelStyle}>Budget range</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {BUDGETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '999px',
                  border: `1.5px solid ${budget === b ? 'var(--mk-ink)' : 'var(--mk-line)'}`,
                  background: budget === b ? 'var(--mk-deep)' : 'var(--mk-surface)',
                  color: budget === b ? 'var(--mk-lime)' : 'var(--mk-muted)',
                  fontSize: '0.8125rem',
                  fontWeight: budget === b ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Ideal timeline</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {TIMELINES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeline(t)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '999px',
                  border: `1.5px solid ${timeline === t ? 'var(--mk-ink)' : 'var(--mk-line)'}`,
                  background: timeline === t ? 'var(--mk-lav)' : 'var(--mk-surface)',
                  color: timeline === t ? 'var(--mk-deep)' : 'var(--mk-muted)',
                  fontSize: '0.8125rem',
                  fontWeight: timeline === t ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Details */}
      <div>
        <label htmlFor="qa-details" style={labelStyle}>Tell us about your project *</label>
        <textarea
          id="qa-details"
          rows={5}
          required
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe your use case, the data you have, your current setup, and what success looks like for you..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <label htmlFor="qa-website">Website</label>
        <input id="qa-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {errorMsg && (
        <p style={{ color: 'var(--mk-warn)', fontSize: '0.875rem', fontWeight: 600 }}>{errorMsg}</p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: '0.5rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--mk-muted)', maxWidth: '42ch' }}>
          No obligation. We respond within 12 business hours with a tailored proposal.
        </p>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="mk-btn mk-btn-primary"
          style={{ minWidth: '200px' }}
        >
          {status === 'sending' ? 'Sending…' : 'Get My Free Quote →'}
        </button>
      </div>
    </form>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function CustomAIPage() {
  return (
    <>
      <Header />
      <main id="main">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="mk-hero"
          style={{ marginTop: '12px', minHeight: 'min(90vh, 680px)', display: 'flex', alignItems: 'center' }}
          aria-labelledby="cai-hero-title"
        >
          <div className="mk-hero-glow" aria-hidden="true" />
          <Particles />
          <div className="mk-wrap mk-hero-inner" style={{ position: 'relative', zIndex: 1 }}>
            <p className="mk-eyebrow mk-rise" style={{ color: 'var(--mk-lime)', ['--mk-delay' as string]: '0ms' }}>
              Custom AI Solutions
            </p>
            <h1
              id="cai-hero-title"
              className="mk-h1"
              style={{ maxWidth: '22ch', marginInline: 'auto' }}
            >
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                We build the AI
              </span>
              <span className="mk-echo mk-echo-em" style={{ ['--mk-delay' as string]: '320ms' }}>
                your business actually needs.
              </span>
            </h1>
            <p
              className="mk-lead mk-rise"
              style={{ color: '#cfe3d6', maxWidth: '52ch', textAlign: 'center', ['--mk-delay' as string]: '480ms' }}
            >
              From conversational chatbots to complex agentic pipelines — we design, build, and deploy custom AI systems that fit your workflow, your data, and your team.
            </p>
            <div className="mk-cta-row mk-rise" style={{ justifyContent: 'center', ['--mk-delay' as string]: '600ms' }}>
              <a href="#get-quote" className="mk-btn mk-btn-primary">
                Get a Free Quote
              </a>
              <a href="#services" className="mk-btn mk-btn-ghost" style={{ background: 'transparent', color: 'var(--mk-bg)', borderColor: 'var(--mk-bg)' }}>
                See What We Build ↓
              </a>
            </div>

            {/* Trust pills */}
            <ul
              className="mk-trust mk-rise"
              style={{ ['--mk-delay' as string]: '720ms' }}
            >
              {['No lock-in contracts', 'Working demo before final payment', 'BYOK or managed AI keys', 'Respond in 12h'].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            {/* Floating badge strip */}
            <div
              className="mk-rise"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.625rem',
                marginTop: '2.5rem',
                ['--mk-delay' as string]: '840ms',
              }}
            >
              {['GPT-4o', 'Claude 3.7', 'Gemini 2.5', 'Llama 3.3', 'Mistral', 'LangChain', 'LlamaIndex', 'Pinecone', 'Supabase pgvector', 'Next.js', 'FastAPI'].map((tech) => (
                <span
                  key={tech}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.3125rem 0.75rem',
                    borderRadius: '999px',
                    background: 'rgba(255,254,235,0.12)',
                    border: '1px solid rgba(255,254,235,0.25)',
                    color: '#dcebe1',
                    letterSpacing: '0.02em',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social proof strip ───────────────────────────────────────── */}
        <section style={{ borderBlock: '1px solid var(--mk-line)', padding: '2rem 0', overflow: 'hidden' }}>
          <div className="mk-wrap">
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--mk-muted)', marginBottom: '1.25rem' }}>
              Trusted to deliver AI solutions for businesses across
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem' }}>
              {['Healthcare', 'Legal', 'E-commerce', 'Real estate', 'Finance', 'Education', 'SaaS', 'Logistics', 'Media'].map((ind, i) => (
                <span
                  key={ind}
                  style={{
                    padding: '0.5rem 1.125rem',
                    borderRadius: '999px',
                    border: '1.5px solid var(--mk-ink)',
                    background: i % 4 === 0 ? 'var(--mk-lav)' : i % 4 === 1 ? 'var(--mk-lime-soft)' : i % 4 === 2 ? '#ffe3f9' : 'var(--mk-warn-soft)',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    transform: i % 2 === 0 ? 'rotate(-1.5deg)' : 'rotate(1deg)',
                    display: 'inline-block',
                  }}
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services grid ────────────────────────────────────────────── */}
        <section id="services" className="mk-section" aria-labelledby="cai-services-title">
          <div className="mk-wrap">
            <SectionHead
              id="cai-services-title"
              eyebrow="What We Build"
              title="Custom AI solutions for every layer of your business."
              intro="We don't sell off-the-shelf software. Every engagement starts from your problem and ends with something that works exactly the way you need it."
              align="center"
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '1.25rem',
                marginTop: '3rem',
              }}
            >
              {SERVICES.map((svc, i) => (
                <ServiceCard key={svc.title} svc={svc} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Process ──────────────────────────────────────────────────── */}
        <section
          className="mk-section mk-section-tint"
          aria-labelledby="cai-process-title"
        >
          <div className="mk-wrap">
            <SectionHead
              id="cai-process-title"
              eyebrow="How We Work"
              title="From first call to production — in four steps."
              intro="A repeatable process that keeps you in control at every stage, with zero handover gaps."
              align="center"
            />
            <ol
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                gap: '1.5rem',
                marginTop: '3rem',
                listStyle: 'none',
                position: 'relative',
              }}
            >
              {PROCESS.map((step, i) => (
                <Reveal key={step.num} as="li" delay={i * 100}>
                  <div
                    style={{
                      border: '1.5px solid var(--mk-ink)',
                      borderRadius: '1.5rem',
                      padding: 'clamp(1.25rem, 3vw, 2rem)',
                      background: 'var(--mk-surface)',
                      height: '100%',
                      position: 'relative',
                      transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0.375rem 0 var(--mk-ink)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'none';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--mk-display)',
                        background: 'var(--mk-lime)',
                        color: 'var(--mk-deep)',
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.75rem',
                        border: '1.5px solid var(--mk-ink)',
                        display: 'grid',
                        placeItems: 'center',
                        marginBottom: '1rem',
                        boxShadow: '0.1875rem 0.1875rem 0 var(--mk-ink)',
                      }}
                    >
                      {step.num}
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {step.title}
                    </h3>
                    <p style={{ color: 'var(--mk-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Results / Metrics ────────────────────────────────────────── */}
        <section
          style={{
            margin: '0 0.75rem',
            borderRadius: '2.25rem',
            background: 'var(--mk-deep)',
            color: 'var(--mk-bg)',
            padding: '5rem 0',
          }}
          aria-labelledby="cai-metrics-title"
        >
          <div className="mk-wrap">
            <Reveal className="mk-head is-center" style={{ marginBottom: '0' }}>
              <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>Results</p>
              <h2 id="cai-metrics-title" className="mk-h2" style={{ color: 'var(--mk-bg)', textAlign: 'center', marginInline: 'auto' }}>
                Numbers we&apos;re proud to stand behind.
              </h2>
            </Reveal>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                borderTop: '1px solid rgba(255,254,235,0.18)',
                marginTop: '3rem',
              }}
            >
              {RESULTS.map((r, i) => (
                <div
                  key={r.label}
                  style={{
                    borderRight: i < RESULTS.length - 1 ? '1px solid rgba(255,254,235,0.18)' : 'none',
                    borderBottom: '1px solid rgba(255,254,235,0.18)',
                  }}
                >
                  <AnimatedStat value={r.value} label={r.label} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why us (benefits) ────────────────────────────────────────── */}
        <section className="mk-section" aria-labelledby="cai-why-title">
          <div className="mk-wrap">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
                gap: '4rem',
                alignItems: 'center',
              }}
            >
              <Reveal>
                <p className="mk-eyebrow">Why Crescelo</p>
                <h2 id="cai-why-title" className="mk-h2" style={{ maxWidth: '20ch' }}>
                  Engineers who ship. Not just consultants.
                </h2>
                <p className="mk-lead">
                  We&apos;ve built production AI systems — not just demo decks. Every project is staffed with engineers who write and maintain the code, not account managers who pass it on.
                </p>
                <ul style={{ display: 'grid', gap: '0.875rem', marginTop: '2rem' }}>
                  {[
                    'Full-stack AI engineers — model to UI',
                    'Weekly sprint demos, nothing hidden',
                    'Working demo before final payment',
                    'Handover includes runbooks, tests, and training',
                    'Post-launch support built into every contract',
                    'Fixed-scope or retainer — your call',
                  ].map((pt) => (
                    <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9688rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '1.375rem',
                          height: '1.375rem',
                          borderRadius: '50%',
                          background: 'var(--mk-lime)',
                          border: '1.5px solid var(--mk-ink)',
                          flexShrink: 0,
                          marginTop: '0.1rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: 'var(--mk-deep)',
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span style={{ color: 'var(--mk-deep)', fontWeight: 500 }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Interactive tech-stack visual */}
              <Reveal delay={120}>
                <div
                  style={{
                    border: '1.5px solid var(--mk-ink)',
                    borderRadius: '2rem',
                    background: 'var(--mk-surface)',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                    boxShadow: '0.375rem 0.5rem 0 var(--mk-ink)',
                  }}
                >
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mk-muted)', marginBottom: '1.25rem' }}>
                    Example Stack — AI Support Agent
                  </p>
                  {[
                    { layer: 'User interface', tech: 'React / Next.js', color: 'var(--mk-lav)' },
                    { layer: 'Orchestration', tech: 'LangChain Agents', color: 'var(--mk-lime-soft)' },
                    { layer: 'Language model', tech: 'Claude 3.7 Sonnet', color: 'var(--mk-bg-tint)' },
                    { layer: 'Knowledge base', tech: 'pgvector + RAG', color: 'var(--mk-warn-soft)' },
                    { layer: 'Integrations', tech: 'Slack · CRM · Calendar', color: '#ffe3f9' },
                    { layer: 'Infrastructure', tech: 'Vercel + Supabase', color: '#ffd9d0' },
                  ].map((row, i) => (
                    <div
                      key={row.layer}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.875rem',
                        background: row.color,
                        border: '1.5px solid var(--mk-ink)',
                        marginBottom: i < 5 ? '0.5rem' : 0,
                        gap: '0.75rem',
                        transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1)',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
                    >
                      <span style={{ fontSize: '0.8125rem', color: 'var(--mk-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{row.layer}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--mk-deep)', textAlign: 'right' }}>{row.tech}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: '0.75rem', color: 'var(--mk-muted)', marginTop: '1rem', textAlign: 'center' }}>
                    ↑ Every stack is designed from scratch for your requirements.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── FAQ mini ─────────────────────────────────────────────────── */}
        <section className="mk-section mk-section-tint" aria-labelledby="cai-faq-title">
          <div className="mk-wrap" style={{ maxWidth: '840px' }}>
            <SectionHead
              id="cai-faq-title"
              eyebrow="Quick Answers"
              title="Common questions about custom AI projects."
              align="center"
            />
            <div style={{ display: 'grid', gap: '1rem', marginTop: '2.5rem' }}>
              {[
                {
                  q: 'Do I need to have my own AI provider API key?',
                  a: 'No. We can manage all model access for you, or integrate with your existing OpenAI, Anthropic, Google or Azure accounts. We never mark up model costs.',
                },
                {
                  q: 'How long does a typical custom AI project take?',
                  a: 'Simple chatbots can be live in 2–3 weeks. Complex agentic pipelines with custom integrations usually take 6–12 weeks. We give you a realistic timeline in writing before we start.',
                },
                {
                  q: 'What data do you need from us?',
                  a: 'It depends on the project. Most commonly: your documents, knowledge base, CRM data, or API access to your existing systems. We sign an NDA before you share anything sensitive.',
                },
                {
                  q: 'Can we host it on our own infrastructure?',
                  a: 'Absolutely. We support cloud (AWS, GCP, Azure), on-premise, and hybrid deployments. For regulated industries like healthcare and legal, private deployments are standard.',
                },
                {
                  q: 'What happens after launch?',
                  a: 'Every contract includes a 30-day post-launch support window. After that, we offer flexible retainers for ongoing maintenance, model updates, and new features.',
                },
              ].map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Get Quote form ───────────────────────────────────────────── */}
        <section id="get-quote" className="mk-section" aria-labelledby="cai-quote-title">
          <div className="mk-wrap" style={{ maxWidth: '860px' }}>
            <SectionHead
              id="cai-quote-title"
              as="h2"
              eyebrow="Get a Quote"
              title="Tell us about your project. We'll get back to you in 12 hours."
              intro="No obligation, no sales call required to get a written proposal. Just fill in the details below and our engineering team will review and respond with a tailored quote."
              align="center"
            />

            <Reveal
              as="article"
              style={{
                marginTop: '2.5rem',
                border: '1.5px solid var(--mk-ink)',
                borderRadius: '2rem',
                background: 'var(--mk-surface)',
                padding: 'clamp(1.5rem, 5vw, 3rem)',
                boxShadow: '0.375rem 0.5rem 0 var(--mk-ink)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative lime blob */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-4rem',
                  right: '-4rem',
                  width: '20rem',
                  height: '20rem',
                  borderRadius: '50%',
                  background: 'radial-gradient(closest-side, rgba(171,255,68,0.12), transparent)',
                  pointerEvents: 'none',
                }}
              />
              <QuoteForm />
            </Reveal>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section
          className="mk-final"
          style={{ margin: '0 0.75rem 12px' }}
          aria-labelledby="cai-cta-title"
        >
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>LET&apos;S BUILD</p>
            <h2 id="cai-cta-title" className="mk-h2" style={{ color: 'var(--mk-lime)', marginInline: 'auto', textAlign: 'center' }}>
              Your AI project starts with one conversation.
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6', textAlign: 'center', marginInline: 'auto' }}>
              Book a free 30-minute scoping call. No pitch, no pressure — just an honest answer on whether AI can help and what it would take.
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <a href="#get-quote" className="mk-btn mk-btn-primary" style={{ background: 'var(--mk-lime)', color: 'var(--mk-deep)', borderColor: 'var(--mk-lime)', boxShadow: '0 0.1875rem 0 #4b9a1e' }}>
                Get a Free Quote
              </a>
              <Link href="/support/contact" className="mk-btn mk-btn-ghost" style={{ background: 'transparent', color: 'var(--mk-bg)', borderColor: 'rgba(255,254,235,0.4)' }}>
                Talk to an engineer
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

/* ─── Accordion FAQ item ────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal
      as="div"
      style={{
        border: '1.5px solid var(--mk-ink)',
        borderRadius: '1.25rem',
        background: 'var(--mk-surface)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        boxShadow: open ? '0 0.25rem 0 var(--mk-ink)' : 'none',
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.125rem 1.375rem',
          textAlign: 'left',
          fontFamily: 'var(--mk-serif)',
          fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
          fontWeight: 600,
          color: 'var(--mk-deep)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span>{q}</span>
        <span
          aria-hidden="true"
          style={{
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            border: '1.5px solid var(--mk-ink)',
            background: open ? 'var(--mk-lime)' : 'var(--mk-surface)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            fontSize: '1rem',
            transition: 'background 0.2s, transform 0.3s cubic-bezier(0.22,1,0.36,1)',
            transform: open ? 'rotate(45deg)' : 'none',
          }}
        >
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <p style={{ padding: '0 1.375rem 1.25rem', color: 'var(--mk-muted)', fontSize: '0.9375rem', lineHeight: 1.65 }}>{a}</p>
      </div>
    </Reveal>
  );
}

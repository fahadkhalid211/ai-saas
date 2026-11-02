'use client';

import { T } from '@/lib/i18n/context';
import { useState } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, softwareSchema, webPageSchema } from '@/lib/schema';

interface ArchitectureStep {
  id: string;
  stepNumber: string;
  title: string;
  badge: string;
  tagline: string;
  tone: 'lime' | 'lav' | 'mint' | 'pink' | 'amber';
  description: string;
  specs: { label: string; value: string }[];
  codeSnippet: string;
  highlights: string[];
}

const ARCHITECTURE_STEPS: ArchitectureStep[] = [
  {
    id: 'ingress',
    stepNumber: '01',
    title: 'Inbound Messages & Channels',
    badge: 'Step 1: Visitors',
    tagline: 'Every message arrives securely from your website, WhatsApp, or Telegram.',
    tone: 'pink',
    description:
      'Customer messages from the website widget, WhatsApp, and Telegram arrive through secure, verified channels and are screened before the assistant responds.',
    specs: [
      { label: 'Protocols', value: 'HTTPS' },
      { label: 'Ingress Latency', value: '< 24ms validation' },
      { label: 'Security', value: 'HMAC-SHA256 & Ed25519 Webhook Verification' },
    ],
    codeSnippet: `// A signed inbound webhook (WhatsApp shown)
POST /api/channels/whatsapp?assistantId=ast_1
Headers: {
  "X-Hub-Signature-256": "sha256=0a1b2c..."
}
Payload: {
  object: "whatsapp_business_account",
  entry: [ ... ]
}`,
    highlights: [
      'Webhook signatures are verified before anything is processed',
      'Web, WhatsApp and Telegram share one conversation history',
      'Visitors are rate limited to stop abuse',
    ],
  },
  {
    id: 'rag',
    stepNumber: '02',
    title: 'Grounded Knowledge & Search',
    badge: 'Step 2: Knowledge',
    tagline: 'Answers only from your real documents — no guessing.',
    tone: 'lav',
    description:
      'Every document, policy guide, and pricing table is analyzed and indexed with strict source citations. Crescelo searches your exact files so your assistant never invents prices or policies.',
    specs: [
      { label: 'Embedding Architecture', value: 'Local ONNX bge-small-en-v1.5' },
      { label: 'Retrieval Algorithm', value: 'Reciprocal Rank Fusion (RRF)' },
      { label: 'Chunk Cosine Cutoff', value: 'Similarity Threshold >= 0.72' },
      { label: 'Execution Overhead', value: '38ms CPU inference' },
    ],
    codeSnippet: `// Hybrid RRF Search Query
const chunks = await retrieveHybridChunks({
  query: "What is your consultation fee and weekend policy?",
  denseWeight: 0.65,
  lexicalWeight: 0.35,
  minConfidence: 0.72,
  limit: 3
});
// => Returns exact verified passage with source attribution`,
    highlights: [
      'Runs locally on CPU with ONNX runtime without external vector API costs',
      'Negative constraint enforcement: declines to answer if no source exists',
      'Automatic logging of unanswered customer questions to alert staff',
      'One-click website scraper and multi-page PDF ingestion engine',
    ],
  },
  {
    id: 'mutex',
    stepNumber: '03',
    title: 'Guaranteed No Double-Bookings',
    badge: 'Step 3: Scheduling',
    tagline: 'Instant slot locking ensures two customers never grab the same time.',
    tone: 'mint',
    description:
      'Unlike simple bots that pretend to book appointments, Crescelo locks the slot instantly the moment a customer confirms, holding it securely before syncing directly to your Google Calendar or Outlook.',
    specs: [
      { label: 'Lock Mechanism', value: 'Atomic In-Memory Mutex + DB State' },
      { label: 'Lock Hold Window', value: '180 seconds hold during checkout' },
      { label: 'Calendar Providers', value: 'Google Calendar API & Microsoft Graph' },
      { label: 'Conflict Rate', value: '0.00% double-booking probability' },
    ],
    codeSnippet: `// Atomic Mutex Slot Locking
const lock = await acquireSlotMutex({
  assistantId: "ast_prod_01",
  slotTime: "2026-09-23T14:30:00Z",
  durationMinutes: 45
});
if (!lock.acquired) {
  return reply("That slot was just reserved. Let me check the next opening...");
}`,
    highlights: [
      'Slot locking so two visitors cannot take the same time',
      'Confirmation emails with self-service reschedule and cancel links',
      'Dynamic buffer periods between appointments (e.g. 15-minute prep)',
      'Booking notifications to your team by email and in the dashboard',
    ],
  },
  {
    id: 'byok',
    stepNumber: '04',
    title: 'Direct AI Brain & Instant Replies',
    badge: 'Step 4: AI Engine',
    tagline: 'Zero markup on AI. Instant streaming replies with automatic failover.',
    tone: 'lime',
    description:
      'Run for free out of the box with automatic failover, or connect your own account from Groq, OpenAI, Anthropic, or Google Gemini with 0% token markup. Replies stream to the visitor instantly.',
    specs: [
      { label: 'Token Markup', value: '0% (Wholesale Provider Cost)' },
      { label: 'Fastest First Token', value: '140ms with Groq LPU' },
      { label: 'Encryption', value: 'AES-256 GCM Salted Key Vault' },
    ],
    codeSnippet: `// BYOK Multi-LLM Dispatch
const stream = await dispatchModel({
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  prompt: groundedSystemPrompt,
  userMessage: visitorQuestion,
  onToken: (token) => widget.stream(token)
});`,
    highlights: [
      'Complete ownership: pay wholesale direct to model providers',
      'Multi-model fallback cascades if an external AI provider has downtime',
      'Zero retention of private customer data on third-party servers',
    ],
  },
];

export default function ProductPage() {
  const [activeStepId, setActiveStepId] = useState('ingress');
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(false);

  const activeStep = ARCHITECTURE_STEPS.find((s) => s.id === activeStepId) || ARCHITECTURE_STEPS[0];

  return (
    <>
      <JsonLd data={[webPageSchema('AI Chatbot & Appointment Booking Features', 'See what a Crescelo assistant does: answers questions from your own documents, books appointments in the chat, captures leads and hands over to your team.', '/product', 'WebPage'), breadcrumbSchema([{ name: 'Product', path: '/product' }]), softwareSchema()]} />
      <Header />
      <main id="main">
        {/* Product Hero */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              <T>HOW IT WORKS UNDER THE HOOD</T>
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                <T>Built to answer, book and</T> <span className="mk-echo-em"><T>never guess.</T></span>
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '320ms' }}>
              <T>Every reply is grounded in content you uploaded. Every booking is checked against a real calendar slot. Every AI call goes directly to your provider — no middleman, no markup.</T>
            </p>
            <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
              <ButtonLink href="/#playground" variant="ghost">
                <T>Try it live</T>
              </ButtonLink>
            </div>
            <ul className="mk-trust mk-rise" style={{ marginTop: '36px', ['--mk-delay' as string]: '600ms' }}>
              <li><T>No hallucinations — answers from your content only</T></li>
              <li><T>Zero token markup — your key, your rate</T></li>
              <li><T>Real calendar slot locking — no double bookings</T></li>
              <li><T>Human takeover in one click</T></li>
            </ul>
          </div>
        </section>

        {/* Interactive Architecture Visualizer */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Interactive Pipeline"
              title="Inspect the four stages of the autonomous execution engine."
              intro="Click each stage of the pipeline to inspect live protocol traces, benchmark latency, and verified technical specifications."
              id="pipeline-stages"
              align="center"
            />

            {/* Pipeline Stage Tabs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '36px',
                marginBottom: '40px',
              }}
            >
              {ARCHITECTURE_STEPS.map((s) => {
                const isActive = s.id === activeStep.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`mk-cockpit-tab ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveStepId(s.id)}
                  >
                    <T>Stage</T> <T>{s.stepNumber}</T>: <T>{s.title}</T>
                  </button>
                );
              })}
            </div>

            {/* Stage Deep-Dive Workbench */}
            <Reveal
              className="mk-card"
              style={{
                padding: 'clamp(18px, 4vw, 40px)',
                background: 'var(--mk-surface)',
                border: '2px solid var(--mk-ink)',
                boxShadow: '0 8px 0 var(--mk-ink)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                  gap: 'clamp(20px, 3.5vw, 40px)',
                  alignItems: 'start',
                }}
              >
                {/* Left Side: Specifications & Core Capabilities */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: 'var(--mk-lime)',
                        color: 'var(--mk-deep)',
                      }}
                    >
                      <T>Stage</T> <T>{activeStep.stepNumber}</T>
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-accent)' }}>
                      <T>{activeStep.badge}</T>
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--mk-serif)',
                      fontSize: 'clamp(2rem, 3.8vw, 2.7rem)',
                      lineHeight: 1.1,
                      margin: '0 0 10px',
                    }}
                  >
                    <T>{activeStep.title}</T>
                  </h3>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mk-ink)', marginBottom: '16px' }}>
                    <T>{activeStep.tagline}</T>
                  </p>
                  <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--mk-muted)', marginBottom: '24px' }}>
                    <T>{activeStep.description}</T>
                  </p>

                  {/* Benchmark Specs Matrix */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                      gap: '12px',
                      marginBottom: '24px',
                    }}
                  >
                    {activeStep.specs.map((spec, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: 'var(--mk-bg)',
                          border: '1.5px solid var(--mk-ink)',
                        }}
                      >
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--mk-muted)', fontWeight: 700 }}>
                          <T>{spec.label}</T>
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px', color: 'var(--mk-deep)' }}>
                          <T>{spec.value}</T>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Highlights Checklist */}
                  <ul style={{ display: 'grid', gap: '8px', padding: 0, listStyle: 'none' }}>
                    {activeStep.highlights.map((h, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <span style={{ color: 'var(--mk-accent)', fontWeight: 800 }}>✓</span>
                        <span><T>{h}</T></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Side: Interactive Code Terminal & Payload Preview */}
                <div
                  style={{
                    borderRadius: '20px',
                    background: 'var(--mk-deep)',
                    border: '2px solid var(--mk-ink)',
                    padding: 'clamp(16px, 3.5vw, 24px)',
                    boxShadow: '0 6px 0 var(--mk-ink)',
                    color: 'var(--mk-bg)',
                    maxWidth: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255,255,255,0.15)',
                      paddingBottom: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                      <span style={{ fontSize: '12px', color: '#a9c4b4', marginLeft: '8px', fontFamily: 'monospace' }}>
                        <T>crescelo-engine ~</T> <T>{activeStep.id}</T><T>.ts</T>
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--mk-lime)', fontFamily: 'monospace' }}>
                      <T>● ACTIVE</T>
                    </span>
                  </div>

                  <pre
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: 'var(--mk-lime)',
                      fontFamily: 'monospace',
                      overflowX: 'auto',
                      maxWidth: '100%',
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {activeStep.codeSnippet}
                  </pre>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Technical Specs Table */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Hardware & Platform Specs"
              title="Built for operational sovereignty and compliance."
              intro="Every component is engineered to run deterministically with zero third-party dependencies or hidden lock-ins."
              id="specifications"
              align="center"
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                gap: '16px',
                marginTop: '36px',
              }}
            >
              {[
                { label: 'Embedding Architecture', val: 'ONNX bge-small-en-v1.5 (Local)' },
                { label: 'Token Markup', val: '0% (Wholesale Provider Cost)' },
                { label: 'Supported Providers', val: 'OpenAI, Groq, Gemini, Claude, Ollama' },
                { label: 'Credential Encryption', val: 'AES-256 GCM Salted Vault' },
                { label: 'Calendar', val: 'Calendar feed, Calendly and Cal.com links' },
                { label: 'Concurrency Engine', val: 'Atomic Mutex In-Memory Locks' },
              ].map((spec, i) => (
                <div
                  key={i}
                  className="mk-card"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mk-muted)', fontWeight: 700 }}>
                    <T>{spec.label}</T>
                  </span>
                  <strong style={{ fontSize: '16px', marginTop: '8px', color: 'var(--mk-deep)' }}>
                    <T>{spec.val}</T>
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Conversion CTA */}
        <section className="mk-final" style={{ margin: '48px 0.75rem 12px' }}>
          <div className="mk-wrap">
            <Reveal className="mk-final-inner">
              <h2 id="mk-final-title" className="mk-h2 mk-h2-wide">
                <T>Deploy your autonomous assistant in under 5 minutes.</T>
              </h2>
              <p className="mk-lead">
                <T>Upload your documents, test the booking engine, and add the widget to your site.</T>
              </p>
              <div className="mk-cta-row">
                <ButtonLink href={SIGNUP_HREF}><T>Start free trial</T></ButtonLink>
                <ButtonLink href="/pricing" variant="ghost">
                  <T>View pricing plans</T>
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

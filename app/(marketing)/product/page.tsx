import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SITE, SIGNUP_HREF, LOGIN_HREF } from '@/components/marketing/content';

export const metadata: Metadata = {
  title: 'Product & Autonomous Architecture | Crescelo',
  description:
    'Explore the engineering behind Crescelo: grounded RAG retrieval, atomic mutex slot locking, zero-markup BYOK inference, and local CPU voice calling.',
};

const ARCHITECTURE_PILLARS = [
  {
    step: '01',
    title: 'Hybrid Grounded RAG Memory',
    subtitle: 'Zero Hallucinations. Pure Verification.',
    body: 'Crescelo combines dense neural vector embeddings with BM25 lexical keyword matching using Reciprocal Rank Fusion (RRF). When visitors ask complex questions, answers are synthesized strictly from your uploaded PDFs, service sheets, and scraped website pages.',
    badge: 'Vector Engine',
    details: [
      'Local ONNX embedding model (Xenova/bge-small-en-v1.5)',
      'Deterministic chunk attribution with direct citation links',
      'Unanswered query logging to alert staff of content gaps',
    ],
    tone: 'lav',
  },
  {
    step: '02',
    title: 'Atomic Mutex Slot Locking',
    subtitle: '100% Double-Booking Immunity',
    body: 'Unlike traditional calendar widgets that link out to third-party forms, Crescelo checks, verifies, and locks calendar slots directly in the chat session. An in-memory mutex concurrency lock reserves the slot before writing to Google Calendar or Outlook.',
    badge: 'Scheduling Core',
    details: [
      'Sub-millisecond atomic memory locks during checkout',
      'Auto-rescheduling and cancellation self-service tokens',
      'Real-time buffer periods and business hours validation',
    ],
    tone: 'mint',
  },
  {
    step: '03',
    title: 'Wholesale BYOK & Zero Token Markup',
    subtitle: '0% Token Tax. Wholesale Provider Pricing.',
    body: 'Most AI platforms charge 300% to 800% markups on token usage. Crescelo operates on a transparent Bring-Your-Own-Key (BYOK) model: connect your OpenAI, Groq, Anthropic, or Gemini API keys, or use our automated free tier cascade.',
    badge: 'Inference Layer',
    details: [
      'AES-256 GCM encrypted credential storage',
      'Groq Llama 3.3 for sub-200ms Time-To-First-Token (TTFT)',
      'Automated fallback cascades if a provider experiences outages',
    ],
    tone: 'lime',
  },
  {
    step: '04',
    title: 'Inbound Phone Voice Calling',
    subtitle: 'Local CPU Audio. Under 1.5 Cents / Min.',
    body: 'A dedicated voice worker answers real telephone calls from your Telnyx or Twilio phone numbers. Powered by faster-whisper on CPU, Silero VAD, and Piper neural speech, callers experience sub-second natural conversation with real-time interruption (barge-in).',
    badge: 'Voice Worker',
    details: [
      'Full duplex bidirectional WebSocket media streaming',
      'Callers can interrupt the AI at any time while it speaks',
      'Phone appointments sync directly into the unified CRM calendar',
    ],
    tone: 'pink',
  },
  {
    step: '05',
    title: 'One-Click Live Human Takeover',
    subtitle: 'A Person When It Matters Most',
    body: 'When a customer has an emergency or requests a manager, the assistant triggers an instant audio chime on your team dashboard. Staff can take over the chat or phone call with complete prior conversational context intact.',
    badge: 'Human-in-the-Loop',
    details: [
      'Audio chimes and desktop browser notifications',
      'Seamless conversational handoff without restarting the chat',
      'Optional PSTN phone transfer directly to owner mobile phone',
    ],
    tone: 'amber',
  },
];

const SPEC_GRID = [
  { label: 'Embedding Model', val: 'ONNX bge-small-en-v1.5 (Local)' },
  { label: 'Token Markup', val: '0% (Wholesale Provider Cost)' },
  { label: 'Supported Providers', val: 'OpenAI, Groq, Gemini, Claude, Ollama' },
  { label: 'Voice STT / TTS', val: 'faster-whisper + Piper (CPU)' },
  { label: 'Telephony Carriers', val: 'Telnyx TeXML & Twilio Media Streams' },
  { label: 'Credential Encryption', val: 'AES-256 GCM Salted Vault' },
  { label: 'Calendar Sync', val: 'Google Calendar, Outlook, iCal' },
  { label: 'Concurrency Engine', val: 'Atomic Mutex In-Memory Locks' },
];

export default function ProductPage() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Product Hero */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow">AUTONOMOUS ARCHITECTURE</p>
            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              Engineered for <span className="mk-echo-em">revenue</span> and deterministic action.
            </h1>
            <p className="mk-lead">
              Crescelo combines grounded hybrid RAG retrieval, atomic mutex calendar scheduling,
              and local CPU voice calling into a unified customer-facing engine.
            </p>
            <div className="mk-cta-row">
              <ButtonLink href={SIGNUP_HREF}>Create your assistant</ButtonLink>
              <ButtonLink href="/#playground" variant="ghost">
                Test live playground
              </ButtonLink>
            </div>
            <ul className="mk-trust" style={{ marginTop: '36px' }}>
              <li>Grounded RAG (No Hallucinations)</li>
              <li>0% Token Markup (BYOK)</li>
              <li>Atomic Mutex Slot Locking</li>
              <li>Sub-Second Phone Calling</li>
            </ul>
          </div>
        </section>

        {/* Architecture Deep Dive */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Core Engine"
              title="Built differently from the ground up."
              intro="Most chatbots are shallow prompt wrappers. Crescelo is an autonomous operational pipeline that verifies information, secures calendar slots, and handles voice calls."
              id="architecture"
              align="center"
            />

            <div style={{ display: 'grid', gap: '32px', marginTop: '48px' }}>
              {ARCHITECTURE_PILLARS.map((pillar) => (
                <Reveal
                  key={pillar.step}
                  as="article"
                  className={`mk-card mk-tabpanel`}
                  style={{
                    display: 'grid',
                    gap: '24px',
                    padding: '36px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '999px',
                          border: '1.5px solid var(--mk-ink)',
                          background: `var(--mk-${pillar.tone})`,
                        }}
                      >
                        {pillar.badge}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--mk-muted)', fontWeight: 600 }}>
                        Step {pillar.step}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '8px', lineHeight: 1.1 }}>
                      {pillar.title}
                    </h3>
                    <p style={{ color: 'var(--mk-deep)', fontWeight: 600, fontSize: '15px', marginBottom: '14px' }}>
                      {pillar.subtitle}
                    </p>
                    <p className="mk-body" style={{ marginTop: 0, maxWidth: '58ch' }}>
                      {pillar.body}
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'var(--mk-surface)',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1.5px solid var(--mk-ink)',
                    }}
                  >
                    <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-muted)', fontWeight: 700, marginBottom: '16px' }}>
                      Technical Implementation
                    </p>
                    <ul style={{ display: 'grid', gap: '12px' }}>
                      {pillar.details.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14.5px', color: 'var(--mk-deep)' }}>
                          <span style={{ color: 'var(--mk-lime)', background: 'var(--mk-deep)', borderRadius: '50%', width: '18px', height: '18px', display: 'grid', placeItems: 'center', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Specs Table */}
        <section className="mk-section mk-section-tint">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Specifications"
              title="Enterprise-ready technical foundation."
              intro="Transparent architecture designed for compliance, low latency, and operational sovereignty."
              id="specifications"
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginTop: '36px',
              }}
            >
              {SPEC_GRID.map((spec, i) => (
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
                  <span style={{ fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mk-muted)', fontWeight: 600 }}>
                    {spec.label}
                  </span>
                  <strong style={{ fontSize: '16px', marginTop: '8px', color: 'var(--mk-deep)' }}>
                    {spec.val}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Conversion CTA */}
        <section className="mk-final" style={{ margin: '48px 12px 12px 12px' }}>
          <div className="mk-wrap">
            <p className="mk-eyebrow" style={{ color: 'var(--mk-lime)' }}>GET STARTED</p>
            <h2 className="mk-h2" style={{ color: 'var(--mk-bg)' }}>
              Deploy your autonomous assistant in under 5 minutes.
            </h2>
            <p className="mk-lead" style={{ color: '#cfe3d6' }}>
              Upload your documents, test the booking engine, and connect your phone number.
            </p>
            <div className="mk-cta-row" style={{ justifyContent: 'center' }}>
              <ButtonLink href={SIGNUP_HREF}>Create your assistant</ButtonLink>
              <ButtonLink href="/pricing" variant="ghost" style={{ borderColor: '#fff', color: '#fff' }}>
                View pricing plans
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

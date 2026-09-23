'use client';

import { useState } from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import { SIGNUP_HREF } from '@/components/marketing/content';

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
    title: 'Inbound Multimodal Ingress',
    badge: 'Telephony & Webhooks',
    tagline: 'Dual-path audio and text streams with sub-50ms ingress validation.',
    tone: 'pink',
    description:
      'Phone calls from Telnyx and Twilio arrive via encrypted bidirectional WebSocket media streams (`wss://`) with 8kHz mulaw audio transcoding. Text chat from the web widget, WhatsApp, and Telegram arrives through signed HTTPS webhooks.',
    specs: [
      { label: 'Protocols', value: 'WebSocket (wss://) & HTTPS' },
      { label: 'Ingress Latency', value: '< 24ms validation' },
      { label: 'Audio Sample Rate', value: '8,000 Hz / 16,000 Hz PCM' },
      { label: 'Security', value: 'HMAC-SHA256 & Ed25519 Webhook Verification' },
    ],
    codeSnippet: `// Inbound Telephony WebSocket Handshake
POST /api/channels/voice/stream
Headers: {
  "X-Telnyx-Signature": "t=1790046900,h=0a1b2c...",
  "Upgrade": "websocket",
  "Connection": "Upgrade"
}
Payload: {
  event: "media.start",
  stream_id: "str_9942",
  codec: "PCMU/8000"
}`,
    highlights: [
      'Zero round-trip carrier authentication',
      'Silero Voice Activity Detection (VAD) runs in real time',
      'Handles instantaneous caller interruption (barge-in)',
      'Direct caller caller-ID lookup in unified customer database',
    ],
  },
  {
    id: 'rag',
    stepNumber: '02',
    title: 'Autonomous Hybrid RAG Memory',
    badge: 'Vector Engine',
    tagline: 'Dense vector embeddings fused with BM25 keyword matching.',
    tone: 'lav',
    description:
      'Every document, policy guide, and pricing table is segmented into semantic chunks and embedded locally using ONNX `bge-small-en-v1.5`. Crescelo queries dense vectors alongside sparse BM25 indices via Reciprocal Rank Fusion (RRF), guaranteeing strict citations without hallucination.',
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
    title: 'Zero-Collision Mutex Scheduler',
    badge: 'Scheduling Core',
    tagline: 'In-memory atomic locking guarantees zero double-bookings.',
    tone: 'mint',
    description:
      'Unlike simple prompt wrappers that pretend to book appointments, Crescelo’s backend features a distributed in-memory mutex lock. When a customer confirms a slot in chat or on a call, Crescelo locks the slot atomically down to the millisecond before writing to Google Calendar or Outlook.',
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
      'Instant verification across multi-staff calendars',
      'Automatic Google Meet and Microsoft Teams conference link creation',
      'Dynamic buffer periods between appointments (e.g. 15-minute prep)',
      'SMS and email booking confirmations with self-service reschedule links',
    ],
  },
  {
    id: 'byok',
    stepNumber: '04',
    title: 'BYOK Multi-LLM Routing & Voice',
    badge: 'Inference Layer',
    tagline: '0% platform token markup. Sub-400ms neural voice synthesis.',
    tone: 'lime',
    description:
      'Connect your own keys from Groq, OpenAI, Anthropic, or Google Gemini with 0% token tax. For voice calls, responses stream into Piper neural TTS on CPU, delivering natural conversational tone and real-time interruption under wholesale carrier rates.',
    specs: [
      { label: 'Token Markup', value: '0% (Wholesale Provider Cost)' },
      { label: 'Voice STT / TTS', value: 'faster-whisper + Piper on CPU' },
      { label: 'Fastest First Token', value: '140ms with Groq LPU' },
      { label: 'Encryption', value: 'AES-256 GCM Salted Key Vault' },
    ],
    codeSnippet: `// BYOK Multi-LLM Dispatch & Piper Audio Stream
const stream = await dispatchModel({
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  prompt: groundedSystemPrompt,
  userMessage: callerAudioTranscript,
  onToken: (token) => piperVoiceSynthesizer.feed(token)
});`,
    highlights: [
      'Complete ownership: pay wholesale direct to model providers',
      'Sub-400ms voice turn latency without costly third-party speech wrappers',
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
      <Header />
      <main id="main">
        {/* Product Hero */}
        <section className="mk-hero" style={{ marginTop: '12px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              AUTONOMOUS ARCHITECTURE
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                Engineered for <span className="mk-echo-em">revenue</span> and deterministic action.
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '320ms' }}>
              Crescelo combines grounded hybrid RAG retrieval, atomic mutex calendar scheduling,
              and local CPU voice calling into a unified customer-facing engine.
            </p>
            <div className="mk-cta-row mk-rise" style={{ ['--mk-delay' as string]: '460ms' }}>
              <ButtonLink href={SIGNUP_HREF}>Create your assistant</ButtonLink>
              <ButtonLink href="/#playground" variant="ghost">
                Test live playground
              </ButtonLink>
            </div>
            <ul className="mk-trust mk-rise" style={{ marginTop: '36px', ['--mk-delay' as string]: '600ms' }}>
              <li>Grounded RAG (No Hallucinations)</li>
              <li>0% Token Markup (BYOK)</li>
              <li>Atomic Mutex Slot Locking</li>
              <li>Sub-Second Phone Calling</li>
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
                    Stage {s.stepNumber}: {s.title}
                  </button>
                );
              })}
            </div>

            {/* Stage Deep-Dive Workbench */}
            <Reveal
              className="mk-card"
              style={{
                padding: '40px',
                background: 'var(--mk-surface)',
                border: '2px solid var(--mk-ink)',
                boxShadow: '0 8px 0 var(--mk-ink)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '40px',
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
                      Stage {activeStep.stepNumber}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-accent)' }}>
                      {activeStep.badge}
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
                    {activeStep.title}
                  </h3>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mk-ink)', marginBottom: '16px' }}>
                    {activeStep.tagline}
                  </p>
                  <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--mk-muted)', marginBottom: '24px' }}>
                    {activeStep.description}
                  </p>

                  {/* Benchmark Specs Matrix */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
                          {spec.label}
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px', color: 'var(--mk-deep)' }}>
                          {spec.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Highlights Checklist */}
                  <ul style={{ display: 'grid', gap: '8px', padding: 0, listStyle: 'none' }}>
                    {activeStep.highlights.map((h, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <span style={{ color: 'var(--mk-accent)', fontWeight: 800 }}>✓</span>
                        <span>{h}</span>
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
                    padding: '24px',
                    boxShadow: '0 6px 0 var(--mk-ink)',
                    color: 'var(--mk-bg)',
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
                        crescelo-engine ~ {activeStep.id}.ts
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--mk-lime)', fontFamily: 'monospace' }}>
                      ● ACTIVE
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
                    }}
                  >
                    {activeStep.codeSnippet}
                  </pre>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Live Speech & Latency Benchmark Lab */}
        <section className="mk-section mk-section-tint">
          <div className="mk-wrap">
            <SectionHead
              eyebrow="Voice Engineering"
              title="CPU Speech Synthesis vs Legacy Phone IVR."
              intro="Hear and compare the difference between Crescelo's sub-400ms neural voice and expensive legacy cloud wrappers."
              id="voice-lab-title"
              align="center"
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginTop: '36px',
              }}
            >
              {/* Crescelo Voice Card */}
              <Reveal
                className="mk-card"
                style={{
                  padding: '32px',
                  background: 'var(--mk-deep)',
                  color: 'var(--mk-bg)',
                  border: '2px solid var(--mk-ink)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'var(--mk-lime)',
                      color: 'var(--mk-deep)',
                    }}
                  >
                    Crescelo Voice Worker
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--mk-lime)', fontWeight: 700 }}>
                    ⚡ 380ms Latency
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--mk-serif)', fontSize: '1.8rem', color: 'var(--mk-lime)', margin: '0 0 8px' }}>
                  Natural Neural Speech on CPU
                </h3>
                <p style={{ fontSize: '14px', color: '#cfe3d6', lineHeight: 1.5, marginBottom: '20px' }}>
                  Faster-whisper STT + Silero VAD + Piper neural speech. Callers talk naturally and can interrupt at any point without awkward robotic delays.
                </p>

                {/* Simulated Audio Player */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(171,255,68,0.3)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#cfe3d6' }}>Natural Conversational Cadence</span>
                    <button
                      type="button"
                      onClick={() => setIsSimulatingAudio((v) => !v)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: '1px solid var(--mk-lime)',
                        background: isSimulatingAudio ? 'var(--mk-lime)' : 'transparent',
                        color: isSimulatingAudio ? 'var(--mk-deep)' : 'var(--mk-lime)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isSimulatingAudio ? '❚❚ Playing Audio' : '▶ Play Voice Demo'}
                    </button>
                  </div>

                  {/* Animated Waveform Bars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '28px' }}>
                    {[12, 24, 18, 28, 14, 22, 10, 26, 16, 20, 28, 14, 22, 18, 24, 12, 16].map((h, i) => (
                      <span
                        key={i}
                        style={{
                          flex: 1,
                          height: isSimulatingAudio ? `${(h * 1.2)}px` : '6px',
                          background: 'var(--mk-lime)',
                          borderRadius: '2px',
                          transition: 'height 0.2s ease',
                          animation: isSimulatingAudio ? `mk-bars 0.8s ease-in-out infinite alternate ${i * 0.05}s` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#a9c4b4' }}>
                  Cost: Wholesale carrier wholesale rates (~$0.015/min). No platform per-minute markup.
                </div>
              </Reveal>

              {/* Legacy Phone IVR Card */}
              <Reveal
                className="mk-card"
                style={{
                  padding: '32px',
                  background: 'var(--mk-surface)',
                  border: '2px solid var(--mk-ink)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'var(--mk-lav)',
                      color: 'var(--mk-ink)',
                    }}
                  >
                    Legacy Cloud Wrappers
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--mk-muted)', fontWeight: 700 }}>
                    🐢 1,850ms Latency
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--mk-serif)', fontSize: '1.8rem', margin: '0 0 8px' }}>
                  Multi-Hop Cloud Chaining
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--mk-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Chains three distinct external cloud APIs for transcription, LLM generation, and cloud voice audio. Causes high latency, frequent interruptions, and caller drop-offs.
                </p>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'var(--mk-bg)',
                    border: '1px solid var(--mk-line)',
                    marginBottom: '20px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Bottlenecks:</p>
                  <ul style={{ paddingLeft: '18px', margin: 0, color: 'var(--mk-muted)' }}>
                    <li>1.8 to 2.4 second silence before the robot replies</li>
                    <li>No interruption handling (talks over the caller)</li>
                    <li>Expensive \$0.12 to \$0.25 per minute platform fees</li>
                  </ul>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--mk-muted)' }}>
                  Outcome: Callers hang up and assume they reached an offshore robocall center.
                </div>
              </Reveal>
            </div>
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                marginTop: '36px',
              }}
            >
              {[
                { label: 'Embedding Architecture', val: 'ONNX bge-small-en-v1.5 (Local)' },
                { label: 'Token Markup', val: '0% (Wholesale Provider Cost)' },
                { label: 'Supported Providers', val: 'OpenAI, Groq, Gemini, Claude, Ollama' },
                { label: 'Voice STT / TTS', val: 'faster-whisper + Piper (CPU)' },
                { label: 'Telephony Carriers', val: 'Telnyx TeXML & Twilio Media Streams' },
                { label: 'Credential Encryption', val: 'AES-256 GCM Salted Vault' },
                { label: 'Calendar Sync', val: 'Google Calendar, Outlook, Cal.com' },
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
            <Reveal className="mk-final-inner">
              <h2 id="mk-final-title" className="mk-h2 mk-h2-wide">
                Deploy your autonomous assistant in under 5 minutes.
              </h2>
              <p className="mk-lead">
                Upload your documents, test the booking engine, and connect your phone number with wholesale rates.
              </p>
              <div className="mk-cta-row">
                <ButtonLink href={SIGNUP_HREF}>Create your assistant</ButtonLink>
                <ButtonLink href="/pricing" variant="ghost">
                  View pricing plans
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

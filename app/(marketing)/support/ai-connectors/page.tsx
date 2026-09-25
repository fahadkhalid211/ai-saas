import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen,
  Sparkles,
  Lock,
} from 'lucide-react';

export const metadata: Metadata = withSocial({
  alternates: { canonical: '/support/ai-connectors' },
  title: 'AI Platform Connectors & BYOK Guides | Crescelo Support',
  description:
    'Comprehensive step-by-step setup guides for all supported AI model providers: OpenAI, Anthropic Claude, Google Gemini, Groq, DeepSeek, and local Ollama.',
}, '/support/ai-connectors');

const CONNECTORS = [
  {
    id: 'auto-free',
    name: 'Zero-Cost Free Engine',
    slug: 'auto-free',
    provider: 'auto_free',
    tag: '100% FREE',
    badgeTone: 'mint',
    cost: '$0.00 compute (Forever)',
    speed: 'Ultra-Fast (~300ms)',
    bestFor: 'Testing, staging, and businesses wanting $0 server/AI bills',
    summary:
      'Intelligent multi-provider cascade across Groq Free Tier (Llama 3.3 70B), Google Gemini Flash, and local Ollama. Zero credit card or subscription needed.',
    icon: '⚡',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o & GPT-4o-mini)',
    slug: 'openai',
    provider: 'openai',
    tag: '0% MARKUP BYOK',
    badgeTone: 'lime',
    cost: '$0.15 / 1M tokens (gpt-4o-mini)',
    speed: 'Fast (~600ms)',
    bestFor: 'Gold-standard reasoning, universal tool-use reliability, and enterprise compliance',
    summary:
      'Direct connection to platform.openai.com. Pay raw wholesale rates directly to OpenAI with zero token markup and enterprise AES-256 key encryption.',
    icon: '🟢',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude (3.5 Sonnet & Haiku)',
    slug: 'anthropic',
    provider: 'anthropic',
    tag: '0% MARKUP BYOK',
    badgeTone: 'lav',
    cost: '$0.80 / 1M tokens (Haiku)',
    speed: 'Fast (~500ms)',
    bestFor: 'Nuanced conversational empathy, professional tone, and intricate instruction following',
    summary:
      'Connect via Anthropic Console. Renowned for natural human-like voice, low hallucination rates, and superior brand safety guardrails.',
    icon: '🟣',
  },
  {
    id: 'gemini',
    name: 'Google Gemini (Flash & Pro)',
    slug: 'gemini',
    provider: 'gemini',
    tag: 'FREE TIER + BYOK',
    badgeTone: 'mint',
    cost: 'Free tier (15 RPM) or $0.075 / 1M',
    speed: 'Ultra-Fast (~400ms)',
    bestFor: 'Massive knowledge bases (1M+ context window), document manuals, and budget scale',
    summary:
      'Get a free API key from Google AI Studio. Gemini Flash processes huge document catalogs and complex price sheets without truncation.',
    icon: '🔵',
  },
  {
    id: 'groq',
    name: 'Groq Cloud (Llama 3.3 70B)',
    slug: 'groq',
    provider: 'groq',
    tag: 'FASTEST (FREE)',
    badgeTone: 'amber',
    cost: 'Free tier (14.4k req/day)',
    speed: 'Sub-Second (~500+ tokens/sec)',
    bestFor: 'Live website chat widgets where instant typing response is paramount for conversions',
    summary:
      'Runs on custom LPU tensor architecture. Streams complete multi-paragraph answers before standard models finish their first word.',
    icon: '⚡',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek (V3 & R1 Reasoning)',
    slug: 'deepseek',
    provider: 'deepseek',
    tag: 'ULTRA-LOW COST',
    badgeTone: 'mint',
    cost: '$0.14 / 1M input tokens',
    speed: 'Fast (~700ms)',
    bestFor: 'High-volume customer support desks seeking 95% cost reduction over legacy models',
    summary:
      'Frontier model intelligence at a fraction of standard cost. Supports deep reasoning mode (R1) for complex multi-variable quoting.',
    icon: '🐋',
  },
  {
    id: 'ollama',
    name: 'Local Server (Ollama Offline)',
    slug: 'ollama',
    provider: 'ollama',
    tag: 'AIR-GAPPED PRIVACY',
    badgeTone: 'lav',
    cost: '$0.00 (Self-Hosted)',
    speed: 'Dependent on hardware',
    bestFor: 'Healthcare, defense, legal, or privacy-critical firms where data cannot leave premise',
    summary:
      'Run Llama 3.2, Mistral, or Qwen on your own computer or private cloud instance. Zero external network calls; 100% private inference.',
    icon: '💻',
  },
];

export default function AiConnectorsIndexPage() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Hero */}
        <section className="mk-hero" style={{ marginTop: '16px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              BYOK &amp; ZERO-MARKUP GUIDES
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                Connect your favorite <span className="mk-echo-em">AI Platform</span>.
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '64ch', marginInline: 'auto', ['--mk-delay' as string]: '320ms' }}>
              Crescelo guarantees 0% token markup. You can bring your own API key and pay raw wholesale rates
              directly to providers, or use our built-in Zero-Cost failover engine for $0 compute.
            </p>
          </div>
        </section>

        {/* Directory Grid */}
        <section className="mk-section">
          <div className="mk-wrap">
            <SectionHead
              id="connectors-list"
              eyebrow="STEP-BY-STEP GUIDES"
              title="Select an AI model connector."
              intro="Each guide walks you through account creation, API key generation, budget configuration, and Crescelo dashboard connection."
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '24px',
                marginTop: '40px',
              }}
            >
              {CONNECTORS.map((c) => (
                <div
                  key={c.id}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 'clamp(18px, 4vw, 28px)',
                    borderRadius: '16px',
                    border: '1.5px solid var(--mk-ink)',
                    background: 'var(--mk-surface)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                      <span
                        className={`mk-badge mk-badge-${c.badgeTone}`}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          border: '1px solid currentColor',
                        }}
                      >
                        {c.tag}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--mk-ink)',
                        marginBottom: '8px',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {c.name}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--mk-muted)', lineHeight: 1.55, marginBottom: '18px' }}>
                      {c.summary}
                    </p>

                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '14px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--mk-muted)', fontWeight: 600 }}>Wholesale Cost:</span>
                        <span style={{ fontWeight: 700, color: 'var(--mk-ink)' }}>{c.cost}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--mk-muted)', fontWeight: 600 }}>Response Speed:</span>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{c.speed}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--mk-muted)', fontWeight: 600 }}>Best For:</span>
                        <span style={{ fontWeight: 600, color: 'var(--mk-ink)', textAlign: 'right', maxWidth: 'min(100%, 200px)' }}>{c.bestFor}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1.5px solid var(--mk-ink)' }}>
                    <Link
                      href={`/support/ai-connectors/${c.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--mk-ink)',
                        textDecoration: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: 'var(--mk-lime)',
                        border: '1px solid var(--mk-ink)',
                        transition: 'opacity 0.15s',
                        width: '100%',
                      }}
                    >
                      <BookOpen style={{ width: '14px', height: '14px' }} />
                      <span>Here&apos;s how to connect (Step-by-Step Guide)</span>
                      <ArrowRight style={{ width: '13px', height: '13px' }} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Help CTA */}
        <section className="mk-section" style={{ background: 'var(--mk-sand)' }}>
          <div className="mk-wrap" style={{ textAlign: 'center' }}>
            <h2 className="mk-h2" style={{ marginBottom: '12px' }}>
              Need assistance setting up a custom endpoint?
            </h2>
            <p className="mk-lead" style={{ maxWidth: '54ch', marginInline: 'auto', marginBottom: '24px' }}>
              We support custom OpenAI-compatible enterprise endpoints (Azure OpenAI, AWS Bedrock proxies, and private vLLM clusters).
            </p>
            <ButtonLink href="/support/contact" variant="primary">
              Contact Engineering Team
            </ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

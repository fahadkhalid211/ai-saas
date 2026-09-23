import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Zero-Cost Free Engine Architecture & Guide | Crescelo Support',
  description:
    'Learn how Crescelo’s built-in Zero-Cost Inference Engine cascades requests across Groq Free Tier, Google Gemini Flash, and local Ollama for $0 compute cost.',
};

export default function AutoFreeGuidePage() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Breadcrumb & Hero */}
        <section className="mk-hero" style={{ marginTop: '16px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <Link href="/support" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-muted)', textDecoration: 'none' }}>
                Help Center
              </Link>
              <span style={{ color: 'var(--mk-muted)', fontSize: '12px' }}>/</span>
              <Link href="/support/ai-connectors" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-muted)', textDecoration: 'none' }}>
                AI Connectors
              </Link>
              <span style={{ color: 'var(--mk-muted)', fontSize: '12px' }}>/</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}>Zero-Cost Free Engine</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              <Zap style={{ width: '13px', height: '13px' }} />
              <span>100% Free • Multi-Provider Cascade • $0 Compute</span>
            </div>

            <h1 className="mk-h1" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
              How the <span className="mk-echo-em">Zero-Cost Engine</span> operates.
            </h1>
            <p className="mk-lead" style={{ maxWidth: '62ch', marginInline: 'auto' }}>
              You don&apos;t need an OpenAI credit balance or paid subscription to launch a production-grade AI concierge.
              Crescelo includes an intelligent multi-provider cascade that runs on free tiers forever.
            </p>
          </div>
        </section>

        {/* Step-by-Step Guide Section */}
        <section className="mk-section">
          <div className="mk-wrap" style={{ maxWidth: '860px' }}>
            {/* Quick Summary Card */}
            <div
              style={{
                borderRadius: '16px',
                border: '1.5px solid var(--mk-ink)',
                background: 'var(--mk-surface)',
                padding: '24px',
                marginBottom: '36px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Setup Time</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>Instant (0 Seconds)</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Token Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>$0.00 (Free Tiers)</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Credit Card Needed</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>No Credit Card Required</div>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--mk-ink)', marginBottom: '14px' }}>
                How the Cascade Routing Works
              </h2>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                When a customer asks a question, Crescelo’s orchestrator attempts inference through a priority tier chain:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#065f46', fontSize: '14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#10b981', color: 'white', fontSize: '11px' }}>Priority 1</span>
                    <span>Groq Cloud Free Tier (Sub-Second Llama 3.3 70B)</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#047857', lineHeight: 1.5 }}>
                    Processes the request in ~300ms using Groq’s ultrafast LPU hardware. Provides up to 14,400 free requests per day.
                  </p>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1e40af', fontSize: '14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#3b82f6', color: 'white', fontSize: '11px' }}>Priority 2 (Failover)</span>
                    <span>Google Gemini Flash Free Tier</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#1d4ed8', lineHeight: 1.5 }}>
                    If Groq hits a momentary tokens-per-minute ceiling, requests seamlessly cascade to Google Gemini Flash with massive 1M context.
                  </p>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#92400e', fontSize: '14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#f59e0b', color: 'white', fontSize: '11px' }}>Priority 3 (Local Fallback)</span>
                    <span>Local Ollama Server</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#b45309', lineHeight: 1.5 }}>
                    If both cloud free tiers are unreachable, Crescelo attempts to dispatch to any running local Ollama instance on your machine.
                  </p>
                </div>
              </div>
            </div>

            {/* How to activate */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--mk-ink)', marginBottom: '14px' }}>
                How to Enable the Zero-Cost Engine
              </h2>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Open your <strong>Crescelo Dashboard</strong> &rarr; <strong>Settings</strong> &rarr; <strong>AI Settings</strong>.</li>
                <li>Ensure <strong>Zero-Cost Free Engine</strong> is selected (it is the default for all new accounts).</li>
                <li>(Optional) You can paste either a free Groq key or free Gemini key to lift rate limits, or leave the box blank to use system free pipelines.</li>
                <li>Click <strong>Save AI Settings</strong>.</li>
              </ol>
            </div>

            {/* Need Help CTA */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <ButtonLink href="/support/contact" variant="primary">
                  Contact Support Engineer
                </ButtonLink>
                <ButtonLink href="/support/ai-connectors" variant="ghost">
                  View All AI Connector Guides
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

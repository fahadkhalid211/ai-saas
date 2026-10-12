import { localizeMeta } from '@/lib/i18n/metadata';
import { T } from '@/lib/i18n/context';
import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import Link from '@/components/i18n/Link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  alternates: { canonical: '/support/ai-connectors/auto-free' },
  title: 'Free AI Engine for Your Assistant | Crescelo',
  description:
    'Learn how Crescelo’s built-in Zero-Cost Inference Engine cascades requests across Groq Free Tier, Google Gemini Flash, and local Ollama for $0 compute cost.',
}, '/support/ai-connectors/auto-free'));
}

export default function AutoFreeGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Free AI Engine for Your Assistant | Crescelo', 'Learn how Crescelo’s built-in Zero-Cost Inference Engine cascades requests across Groq Free Tier, Google Gemini Flash, and local Ollama for $0 compute cost.', '/support/ai-connectors/auto-free'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'AI connectors', path: '/support/ai-connectors' }, { name: 'Free engine', path: '/support/ai-connectors/auto-free' }])]} />
      <Header />
      <main id="main">
        {/* Breadcrumb & Hero */}
        <section className="mk-hero" style={{ marginTop: '16px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <Link href="/support" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-muted)', textDecoration: 'none' }}>
                <T>Help Center</T>
              </Link>
              <span style={{ color: 'var(--mk-muted)', fontSize: '12px' }}>/</span>
              <Link href="/support/ai-connectors" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-muted)', textDecoration: 'none' }}>
                <T>AI Connectors</T>
              </Link>
              <span style={{ color: 'var(--mk-muted)', fontSize: '12px' }}>/</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}><T>Zero-Cost Free Engine</T></span>
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
              <span><T>100% Free • Multi-Provider Cascade • $0 Compute</T></span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '22ch', marginInline: 'auto' }}>
              <T>How the</T> <span className="mk-echo-em"><T>Zero-Cost Engine</T></span> <T>operates.</T>
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '62ch', marginInline: 'auto', animationDelay: '140ms' }}>
              <T>You don&apos;t need an OpenAI credit balance or paid subscription to launch a production-grade AI concierge.
              Crescelo includes an intelligent multi-provider cascade that runs on free tiers forever.</T>
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
                padding: 'clamp(16px, 4vw, 24px)',
                marginBottom: '36px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Setup Time</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>Instant (0 Seconds)</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Token Cost</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}><T>$0.00 (Free Tiers)</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Credit Card Needed</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}><T>No Credit Card Required</T></div>
              </div>
            </div>

            {/* Architecture Card */}
            <div className="mk-card" style={{ padding: 'clamp(18px, 4vw, 32px)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--mk-ink)', marginBottom: '14px' }}>
                <T>How the Cascade Routing Works</T>
              </h2>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                <T>When a customer asks a question, Crescelo’s orchestrator attempts inference through a priority tier chain:</T>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#065f46', fontSize: '14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#10b981', color: 'white', fontSize: '11px' }}><T>Priority 1</T></span>
                    <span><T>Groq Cloud Free Tier (Sub-Second Llama 3.3 70B)</T></span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#047857', lineHeight: 1.5 }}>
                    <T>Processes the request in ~300ms using Groq’s ultrafast LPU hardware. Provides up to 14,400 free requests per day.</T>
                  </p>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1e40af', fontSize: '14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#3b82f6', color: 'white', fontSize: '11px' }}><T>Priority 2 (Failover)</T></span>
                    <span><T>Google Gemini Flash Free Tier</T></span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#1d4ed8', lineHeight: 1.5 }}>
                    <T>If Groq hits a momentary tokens-per-minute ceiling, requests seamlessly cascade to Google Gemini Flash with massive 1M context.</T>
                  </p>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#92400e', fontSize: '14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#f59e0b', color: 'white', fontSize: '11px' }}><T>Priority 3 (Local Fallback)</T></span>
                    <span><T>Local Ollama Server</T></span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#b45309', lineHeight: 1.5 }}>
                    <T>If both cloud free tiers are unreachable, Crescelo attempts to dispatch to any running local Ollama instance on your machine.</T>
                  </p>
                </div>
              </div>
            </div>

            {/* How to activate */}
            <div className="mk-card" style={{ padding: 'clamp(18px, 4vw, 32px)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--mk-ink)', marginBottom: '14px' }}>
                <T>How to Enable the Zero-Cost Engine</T>
              </h2>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>Open your</T> <strong><T>Crescelo Dashboard</T></strong> &rarr; <strong><T>Settings</T></strong> &rarr; <strong><T>AI Settings</T></strong>.</li>
                <li><T>Ensure</T> <strong><T>Zero-Cost Free Engine</T></strong> <T>is selected (it is the default for all new accounts).</T></li>
                <li><T>(Optional) You can paste either a free Groq key or free Gemini key to lift rate limits, or leave the box blank to use system free pipelines.</T></li>
                <li><T>Click</T> <strong><T>Save AI Settings</T></strong>.</li>
              </ol>
            </div>

            {/* Need Help CTA */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <ButtonLink href="/support/contact" variant="primary">
                  <T>Contact Support Engineer</T>
                </ButtonLink>
                <ButtonLink href="/support/ai-connectors" variant="ghost">
                  <T>View All AI Connector Guides</T>
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

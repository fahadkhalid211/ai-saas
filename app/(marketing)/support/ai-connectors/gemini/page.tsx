import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';
import {
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Connect Google Gemini to Crescelo | Step-by-Step API Guide',
  description:
    'Step-by-step guide to get a free Google AI Studio API key and connect Gemini 1.5 Flash or Gemini 2.0 Flash to Crescelo with massive context windows.',
};

export default function GeminiGuidePage() {
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
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}>Google Gemini</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              <Zap style={{ width: '13px', height: '13px' }} />
              <span>100% Free Tier Available • Massive 1M+ Context Window</span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              How to connect <span className="mk-echo-em">Google Gemini</span> to Crescelo.
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '60ch', marginInline: 'auto', animationDelay: '140ms' }}>
              Google AI Studio offers one of the most generous free tiers in the industry with Gemini Flash.
              Here is how to get your free API key in under 2 minutes.
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
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Estimated Time</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>2 Minutes</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>Free Tier (15 RPM)</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Recommended Model</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>gemini-2.5-flash / 1.5-flash</div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="mk-card" style={{ padding: 'clamp(18px, 4vw, 32px)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  1
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--mk-ink)' }}>
                  Open Google AI Studio
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Google AI Studio is Google’s dedicated developer playground for obtaining Gemini API keys:
              </p>
              <div style={{ margin: '16px 0' }}>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--mk-sand)',
                    border: '1.5px solid var(--mk-ink)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--mk-ink)',
                    textDecoration: 'none',
                  }}
                >
                  <span>Open aistudio.google.com/app/apikey</span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </a>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Sign in with any standard Google Account or Google Workspace account.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mk-card" style={{ padding: 'clamp(18px, 4vw, 32px)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  2
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--mk-ink)' }}>
                  Click &ldquo;Create API key&rdquo;
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Generating a key takes just one click:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Click the blue <strong>Create API key</strong> button at the top.</li>
                <li>Select <strong>Create API key in new project</strong> (or choose an existing Google Cloud project if you have one).</li>
                <li>Google will generate a key starting with <code>AIzaSy...</code> in seconds.</li>
                <li>Click <strong>Copy</strong>.</li>
              </ol>
            </div>

            {/* Step 3 */}
            <div className="mk-card" style={{ padding: 'clamp(18px, 4vw, 32px)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--mk-deep)',
                    color: 'var(--mk-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  3
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--mk-ink)' }}>
                  Paste Key in Crescelo Settings
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Save the key in your Crescelo assistant:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Open your <strong>Crescelo Dashboard</strong> &rarr; <strong>Settings</strong> &rarr; <strong>AI Settings</strong>.</li>
                <li>Select <strong>Google Gemini</strong> as your provider.</li>
                <li>Paste your <code>AIzaSy...</code> key into the API key box.</li>
                <li>Set the model to <code>gemini-3.6-flash</code> (recommended) or <code>gemini-3.5-flash</code>.</li>
                <li>Click <strong>Save AI Settings</strong>.</li>
              </ol>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldCheck style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>
                  <strong>Massive Context Advantage:</strong> Gemini models support over 1,000,000 tokens of context,
                  meaning your assistant can reference hundreds of pages of complex manuals without truncation.
                </span>
              </div>
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

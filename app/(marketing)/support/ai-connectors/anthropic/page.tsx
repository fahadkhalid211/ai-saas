import type { Metadata } from 'next';
import { withSocial } from '@/lib/seo';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { JsonLd } from '@/components/marketing/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { ButtonLink, SectionHead } from '@/components/marketing/ui';
import {
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const metadata: Metadata = withSocial({
  alternates: { canonical: '/support/ai-connectors/anthropic' },
  title: 'Connect Anthropic Claude to Crescelo: API Key Guide',
  description:
    'Complete step-by-step guide to create your Anthropic Console account, generate a Claude API key, and connect Claude 3.5 Sonnet or Haiku to Crescelo with zero markup.',
}, '/support/ai-connectors/anthropic');

export default function AnthropicGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Connect Anthropic Claude to Crescelo: API Key Guide', 'Complete step-by-step guide to create your Anthropic Console account, generate a Claude API key, and connect Claude 3.5 Sonnet or Haiku to Crescelo with zero markup.', '/support/ai-connectors/anthropic'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'AI connectors', path: '/support/ai-connectors' }, { name: 'Anthropic Claude', path: '/support/ai-connectors/anthropic' }])]} />
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
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}>Anthropic Claude</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: '#fdf2f8',
                border: '1px solid #fbcfe8',
                color: '#9d174d',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              <Sparkles style={{ width: '13px', height: '13px' }} />
              <span>Nuanced Tone • Human-Like Professional Empathy</span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              How to connect <span className="mk-echo-em">Anthropic Claude</span> to Crescelo.
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '60ch', marginInline: 'auto', animationDelay: '140ms' }}>
              Claude 3.5 Sonnet and Haiku deliver industry-leading conversational nuance and factual adherence.
              Here is how to generate your Anthropic API key and configure your assistant in under 4 minutes.
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
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>3–4 Minutes</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Prerequisites</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>Anthropic Console Account</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Recommended Model</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>claude-3-5-haiku ($0.80/1M)</div>
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
                  Sign in to the Anthropic Console
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Anthropic manages its developer APIs through the Anthropic Console:
              </p>
              <div style={{ margin: '16px 0' }}>
                <a
                  href="https://console.anthropic.com/"
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
                  <span>Open console.anthropic.com</span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </a>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Create an account using your business email or Google Account. Note: Claude Pro consumer subscriptions are separate from the Console developer API.
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
                  Fund Your Console Balance
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Anthropic uses prepaid credits to service API calls:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Click on <strong>Plans &amp; Billing</strong> in the left sidebar or top right settings.</li>
                <li>Click <strong>Add Payment Method</strong> and enter your business payment details.</li>
                <li>Add an initial credit balance (e.g., $5 to $10).</li>
                <li>Optional: Set up monthly budget limits to prevent accidental overages.</li>
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
                  Generate Your Claude API Key
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Create a dedicated key for your Crescelo assistant:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Click on <strong>API Keys</strong> in the navigation menu.</li>
                <li>Click the <strong>+ Create Key</strong> button.</li>
                <li>Label it (e.g. <code>Crescelo Concierge</code>).</li>
                <li>Click <strong>Generate Key</strong>.</li>
                <li>Copy the key string (it starts with <code>sk-ant-api03-...</code>).</li>
              </ol>
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Copy immediately:</strong> The key cannot be viewed again once you close the modal.
                </span>
              </div>
            </div>

            {/* Step 4 */}
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
                  4
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--mk-ink)' }}>
                  Paste Key in Crescelo Settings
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Activate Claude inside Crescelo:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>In your <strong>Crescelo Dashboard</strong>, go to <strong>Settings</strong> &rarr; <strong>AI Settings</strong>.</li>
                <li>Select <strong>Anthropic Claude</strong> as your provider.</li>
                <li>Paste your <code>sk-ant-...</code> key into the API key field.</li>
                <li>Choose <code>claude-3-5-haiku-20241022</code> for lightning-fast customer chats, or <code>claude-3-5-sonnet-20241022</code> for deep technical guidance.</li>
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
                  <strong>Zero Token Markup:</strong> Crescelo routes prompts directly to Anthropic’s raw API endpoints with AES-256-GCM encrypted keys.
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

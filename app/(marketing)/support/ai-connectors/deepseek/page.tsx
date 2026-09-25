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
  Zap,
} from 'lucide-react';

export const metadata: Metadata = withSocial({
  alternates: { canonical: '/support/ai-connectors/deepseek' },
  title: 'Connect DeepSeek to Crescelo: API Key Guide',
  description:
    'Complete step-by-step guide to create a DeepSeek Platform account, generate an API key, and run DeepSeek-V3 and R1 reasoning on Crescelo at raw wholesale rates.',
}, '/support/ai-connectors/deepseek');

export default function DeepSeekGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Connect DeepSeek to Crescelo: API Key Guide', 'Complete step-by-step guide to create a DeepSeek Platform account, generate an API key, and run DeepSeek-V3 and R1 reasoning on Crescelo at raw wholesale rates.', '/support/ai-connectors/deepseek'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'AI connectors', path: '/support/ai-connectors' }, { name: 'DeepSeek', path: '/support/ai-connectors/deepseek' }])]} />
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
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}>DeepSeek</span>
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
              <Sparkles style={{ width: '13px', height: '13px' }} />
              <span>95% Cheaper than GPT-4o • High-Precision Reasoning</span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              How to connect <span className="mk-echo-em">DeepSeek</span> to Crescelo.
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '60ch', marginInline: 'auto', animationDelay: '140ms' }}>
              DeepSeek-V3 and DeepSeek-R1 deliver frontier-class intelligence at a fraction of standard LLM pricing ($0.14 per 1M input tokens).
              Here is how to set up your API connection in minutes.
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
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>3 Minutes</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Wholesale Rate</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>$0.14 / 1M tokens</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Supported Models</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>deepseek-chat / deepseek-reasoner</div>
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
                  Create an Account on DeepSeek Open Platform
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Open DeepSeek’s official developer platform:
              </p>
              <div style={{ margin: '16px 0' }}>
                <a
                  href="https://platform.deepseek.com/"
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
                  <span>Open platform.deepseek.com</span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </a>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Register using your email or phone number.
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
                  Top-up Prepaid Balance
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                DeepSeek operates on a prepaid usage model:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Go to <strong>Top up</strong> in the left sidebar menu.</li>
                <li>DeepSeek supports international payment cards, PayPal, and WeChat/Alipay.</li>
                <li>A $5 deposit gives you roughly 35,000,000 tokens — enough for months of intense business traffic.</li>
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
                  Generate and Copy Your API Key
                </h2>
              </div>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Click <strong>API keys</strong> in the left sidebar.</li>
                <li>Click <strong>Create API key</strong> and name it <code>Crescelo Assistant</code>.</li>
                <li>Copy the generated key (starts with <code>sk-...</code>).</li>
              </ol>
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
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>In your <strong>Crescelo Dashboard</strong>, go to <strong>Settings</strong> &rarr; <strong>AI Settings</strong>.</li>
                <li>Select <strong>DeepSeek</strong> as your provider.</li>
                <li>Paste your API key into the field.</li>
                <li>Choose <code>deepseek-chat</code> (V3) for real-time customer conversations or <code>deepseek-reasoner</code> (R1) for intricate multi-step problem solving.</li>
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
                  <strong>Zero Token Markup:</strong> Your queries route directly to <code>api.deepseek.com</code> with no third-party middleware fees.
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

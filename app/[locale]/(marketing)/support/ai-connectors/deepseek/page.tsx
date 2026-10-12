import { localizeMeta } from '@/lib/i18n/metadata';
import { T } from '@/lib/i18n/context';
import { A } from '@/components/i18n/A';
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
  Sparkles,
  Zap,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  alternates: { canonical: '/support/ai-connectors/deepseek' },
  title: 'Connect DeepSeek to Crescelo: API Key Guide',
  description:
    'Complete step-by-step guide to create a DeepSeek Platform account, generate an API key, and run DeepSeek-V3 and R1 reasoning on Crescelo at raw wholesale rates.',
}, '/support/ai-connectors/deepseek'));
}

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
                <T>Help Center</T>
              </Link>
              <span style={{ color: 'var(--mk-muted)', fontSize: '12px' }}>/</span>
              <Link href="/support/ai-connectors" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mk-muted)', textDecoration: 'none' }}>
                <T>AI Connectors</T>
              </Link>
              <span style={{ color: 'var(--mk-muted)', fontSize: '12px' }}>/</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}><T>DeepSeek</T></span>
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
              <span><T>95% Cheaper than GPT-4o • High-Precision Reasoning</T></span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              <T>How to connect</T> <span className="mk-echo-em"><T>DeepSeek</T></span> <T>to Crescelo.</T>
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '60ch', marginInline: 'auto', animationDelay: '140ms' }}>
              <T>DeepSeek-V3 and DeepSeek-R1 deliver frontier-class intelligence at a fraction of standard LLM pricing ($0.14 per 1M input tokens).
              Here is how to set up your API connection in minutes.</T>
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
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Estimated Time</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>3 Minutes</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Wholesale Rate</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}><T>$0.14 / 1M tokens</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Supported Models</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>deepseek-chat / deepseek-reasoner</T></div>
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
                  <T>Create an Account on DeepSeek Open Platform</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>Open DeepSeek’s official developer platform:</T>
              </p>
              <div style={{ margin: '16px 0' }}>
                <A
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
                  <span><T>Open platform.deepseek.com</T></span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </A>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                <T>Register using your email or phone number.</T>
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
                  <T>Top-up Prepaid Balance</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>DeepSeek operates on a prepaid usage model:</T>
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>Go to</T> <strong><T>Top up</T></strong> <T>in the left sidebar menu.</T></li>
                <li><T>DeepSeek supports international payment cards, PayPal, and WeChat/Alipay.</T></li>
                <li><T>A $5 deposit gives you roughly 35,000,000 tokens — enough for months of intense business traffic.</T></li>
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
                  <T>Generate and Copy Your API Key</T>
                </h2>
              </div>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>Click</T> <strong><T>API keys</T></strong> <T>in the left sidebar.</T></li>
                <li><T>Click</T> <strong><T>Create API key</T></strong> <T>and name it</T> <code>Crescelo Assistant</code>.</li>
                <li><T>Copy the generated key (starts with</T> <code>sk-...</code>).</li>
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
                  <T>Paste Key in Crescelo Settings</T>
                </h2>
              </div>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>In your</T> <strong><T>Crescelo Dashboard</T></strong><T>, go to</T> <strong><T>Settings</T></strong> &rarr; <strong><T>AI Settings</T></strong>.</li>
                <li><T>Select</T> <strong><T>DeepSeek</T></strong> <T>as your provider.</T></li>
                <li><T>Paste your API key into the field.</T></li>
                <li><T>Choose</T> <code>deepseek-chat</code> <T>(V3) for real-time customer conversations or</T> <code>deepseek-reasoner</code> <T>(R1) for intricate multi-step problem solving.</T></li>
                <li><T>Click</T> <strong><T>Save AI Settings</T></strong>.</li>
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
                  <strong><T>Zero Token Markup:</T></strong> <T>Your queries route directly to</T> <code>api.deepseek.com</code> <T>with no third-party middleware fees.</T>
                </span>
              </div>
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

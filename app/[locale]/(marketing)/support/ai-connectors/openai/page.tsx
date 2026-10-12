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
import { ButtonLink, Reveal, SectionHead } from '@/components/marketing/ui';
import {
  ExternalLink,
  Key,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  CreditCard,
  Sliders,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  alternates: { canonical: '/support/ai-connectors/openai' },
  title: 'Connect OpenAI to Crescelo: API Key Guide',
  description:
    'Complete step-by-step guide to generate your OpenAI API key, configure usage limits, and connect GPT-4o or GPT-4o mini to Crescelo with zero token markup.',
}, '/support/ai-connectors/openai'));
}

export default function OpenAiGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Connect OpenAI to Crescelo: API Key Guide', 'Complete step-by-step guide to generate your OpenAI API key, configure usage limits, and connect GPT-4o or GPT-4o mini to Crescelo with zero token markup.', '/support/ai-connectors/openai'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'AI connectors', path: '/support/ai-connectors' }, { name: 'OpenAI', path: '/support/ai-connectors/openai' }])]} />
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
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}><T>OpenAI</T></span>
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
              <Sparkles style={{ width: '13px', height: '13px' }} />
              <span><T>0% Platform Markup • Direct Wholesale Token Billing</T></span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              <T>How to connect</T> <span className="mk-echo-em"><T>OpenAI</T></span> <T>to Crescelo.</T>
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '60ch', marginInline: 'auto', animationDelay: '140ms' }}>
              <T>Follow this 5-minute walkthrough to create an OpenAI developer account, generate a secure API key,
              and connect GPT-4o or GPT-4o-mini to power your customer concierge.</T>
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
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>3–5 Minutes</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Prerequisites</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>OpenAI Account &amp; Credit Card</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Recommended Model</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>gpt-4o-mini ($0.15/1M tokens)</T></div>
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
                  <T>Sign in to the OpenAI Developer Platform</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>OpenAI separates its ChatGPT consumer app from its Developer API platform. You need an account on the API platform:</T>
              </p>
              <div style={{ margin: '16px 0' }}>
                <A
                  href="https://platform.openai.com/signup"
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
                  <span><T>Open platform.openai.com</T></span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </A>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                <T>If you already have a ChatGPT account, you can click</T> <strong><T>Log In</T></strong> <T>and use the exact same credentials.</T>
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
                  <T>Fund Your API Balance (Initial Credit Top-Up)</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>OpenAI Developer API operates on a prepaid credit system. Even if you pay for ChatGPT Plus ($20/month),
                the API requires its own separate prepaid balance:</T>
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>In the left sidebar, click on</T> <strong><T>Settings</T></strong> <T>(gear icon) &rarr;</T> <strong><T>Billing</T></strong>.</li>
                <li><T>Click</T> <strong><T>Add Payment Details</T></strong> <T>and add a credit or debit card.</T></li>
                <li><T>Click</T> <strong><T>Add to credit balance</T></strong> <T>and add an initial deposit (e.g.</T> <strong><T>$5.00 or $10.00</T></strong> <T>is plenty for thousands of customer conversations).</T></li>
                <li><T>(Optional but recommended) Enable</T> <strong><T>Auto-recharge</T></strong> <T>so your assistant never stops answering if the balance drops below $2.</T></li>
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
                  <T>Create a Secret API Key</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>Now generate a secret key that allows Crescelo to query models on your behalf:</T>
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>Navigate to the</T> <strong><T>API Keys</T></strong> <T>page in the left navigation menu.</T></li>
                <li><T>Click the</T> <strong><T>+ Create new secret key</T></strong> <T>button.</T></li>
                <li><T>Name your key (e.g.,</T> <code>Crescelo Website Assistant</code>).</li>
                <li><T>Under Permissions, select</T> <strong><T>All</T></strong> <T>or</T> <strong><T>Restricted</T></strong> <T>(granting</T> <code>Model capabilities: Write</code>).</li>
                <li><T>Click</T> <strong><T>Create secret key</T></strong>.</li>
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
                  <strong><T>Important:</T></strong> <T>OpenAI will only show this secret key once (starting with</T> <code>sk-proj-...</code> <T>or</T> <code>sk-...</code><T>).
                  Click the copy button immediately and do not close the window until you paste it into Crescelo.</T>
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
                  <T>Paste Your Key in Crescelo Settings</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>Connect your key inside your Crescelo assistant dashboard:</T>
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>Open your</T> <strong><T>Crescelo Dashboard</T></strong> &rarr; <strong><T>Settings</T></strong> &rarr; <strong><T>AI Settings (Engine Tab)</T></strong>.</li>
                <li><T>Under</T> <strong><T>Select AI Provider</T></strong><T>, click</T> <strong><T>OpenAI</T></strong>.</li>
                <li><T>In the</T> <strong><T>OPENAI API Key</T></strong> <T>field, paste your copied key.</T></li>
                <li><T>Select your default model (we recommend</T> <code>gpt-4o-mini</code> <T>for ultra-fast, budget-friendly answers, or</T> <code>gpt-4o</code> <T>for complex reasoning).</T></li>
                <li><T>Click</T> <strong><T>Save AI Settings</T></strong> <T>at the top right.</T></li>
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
                  <strong><T>Security Guarantee:</T></strong> <T>Your OpenAI API key is encrypted at rest using AES-256-GCM.
                  Crescelo never logs your key or proxies requests through markup brokers.</T>
                </span>
              </div>
            </div>

            {/* Wholesale Pricing Breakdown */}
            <div className="mk-card" style={{ padding: 'clamp(18px, 4vw, 32px)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--mk-ink)', marginBottom: '12px' }}>
                <T>Wholesale Token Cost Breakdown (Zero Markup Guarantee)</T>
              </h3>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                <T>Because you provide your own key (BYOK), you pay raw wholesale rates directly to OpenAI with 0% platform surcharge:</T>
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--mk-ink)' }}>
                      <th style={{ padding: '8px', color: 'var(--mk-ink)' }}><T>Model</T></th>
                      <th style={{ padding: '8px', color: 'var(--mk-ink)' }}><T>Input / 1M Tokens</T></th>
                      <th style={{ padding: '8px', color: 'var(--mk-ink)' }}><T>Output / 1M Tokens</T></th>
                      <th style={{ padding: '8px', color: 'var(--mk-ink)' }}><T>Cost per 1,000 Chats</T></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}><T>gpt-4o-mini (Recommended)</T></td>
                      <td style={{ padding: '8px' }}>$0.15</td>
                      <td style={{ padding: '8px' }}>$0.60</td>
                      <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}><T>~$0.30 total</T></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}><T>gpt-4o (Flagship)</T></td>
                      <td style={{ padding: '8px' }}>$2.50</td>
                      <td style={{ padding: '8px' }}>$10.00</td>
                      <td style={{ padding: '8px', fontWeight: 700 }}><T>~$5.00 total</T></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Need Help CTA */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <p style={{ fontSize: '14px', color: 'var(--mk-muted)', marginBottom: '16px' }}>
                <T>Need help troubleshooting an OpenAI quota error or invalid key message?</T>
              </p>
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

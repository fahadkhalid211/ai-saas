import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
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

export const metadata: Metadata = {
  title: 'How to Connect OpenAI to Crescelo | Step-by-Step API Guide',
  description:
    'Complete step-by-step guide to generate your OpenAI API key, configure usage limits, and connect GPT-4o or GPT-4o mini to Crescelo with zero token markup.',
};

export default function OpenAiGuidePage() {
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
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}>OpenAI</span>
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
              <span>0% Platform Markup • Direct Wholesale Token Billing</span>
            </div>

            <h1 className="mk-h1" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              How to connect <span className="mk-echo-em">OpenAI</span> to Crescelo.
            </h1>
            <p className="mk-lead" style={{ maxWidth: '60ch', marginInline: 'auto' }}>
              Follow this 5-minute walkthrough to create an OpenAI developer account, generate a secure API key,
              and connect GPT-4o or GPT-4o-mini to power your customer concierge.
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
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Estimated Time</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>3–5 Minutes</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Prerequisites</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>OpenAI Account &amp; Credit Card</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}>Recommended Model</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}>gpt-4o-mini ($0.15/1M tokens)</div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
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
                  Sign in to the OpenAI Developer Platform
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                OpenAI separates its ChatGPT consumer app from its Developer API platform. You need an account on the API platform:
              </p>
              <div style={{ margin: '16px 0' }}>
                <a
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
                  <span>Open platform.openai.com</span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </a>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                If you already have a ChatGPT account, you can click <strong>Log In</strong> and use the exact same credentials.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
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
                  Fund Your API Balance (Initial Credit Top-Up)
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                OpenAI Developer API operates on a prepaid credit system. Even if you pay for ChatGPT Plus ($20/month),
                the API requires its own separate prepaid balance:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>In the left sidebar, click on <strong>Settings</strong> (gear icon) &rarr; <strong>Billing</strong>.</li>
                <li>Click <strong>Add Payment Details</strong> and add a credit or debit card.</li>
                <li>Click <strong>Add to credit balance</strong> and add an initial deposit (e.g. <strong>$5.00 or $10.00</strong> is plenty for thousands of customer conversations).</li>
                <li>(Optional but recommended) Enable <strong>Auto-recharge</strong> so your assistant never stops answering if the balance drops below $2.</li>
              </ol>
            </div>

            {/* Step 3 */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
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
                  Create a Secret API Key
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Now generate a secret key that allows Crescelo to query models on your behalf:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Navigate to the <strong>API Keys</strong> page in the left navigation menu.</li>
                <li>Click the <strong>+ Create new secret key</strong> button.</li>
                <li>Name your key (e.g., <code>Crescelo Website Assistant</code>).</li>
                <li>Under Permissions, select <strong>All</strong> or <strong>Restricted</strong> (granting <code>Model capabilities: Write</code>).</li>
                <li>Click <strong>Create secret key</strong>.</li>
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
                  <strong>Important:</strong> OpenAI will only show this secret key once (starting with <code>sk-proj-...</code> or <code>sk-...</code>).
                  Click the copy button immediately and do not close the window until you paste it into Crescelo.
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
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
                  Paste Your Key in Crescelo Settings
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Connect your key inside your Crescelo assistant dashboard:
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li>Open your <strong>Crescelo Dashboard</strong> &rarr; <strong>Settings</strong> &rarr; <strong>AI Settings (Engine Tab)</strong>.</li>
                <li>Under <strong>Select AI Provider</strong>, click <strong>OpenAI</strong>.</li>
                <li>In the <strong>OPENAI API Key</strong> field, paste your copied key.</li>
                <li>Select your default model (we recommend <code>gpt-4o-mini</code> for ultra-fast, budget-friendly answers, or <code>gpt-4o</code> for complex reasoning).</li>
                <li>Click <strong>Save AI Settings</strong> at the top right.</li>
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
                  <strong>Security Guarantee:</strong> Your OpenAI API key is encrypted at rest using AES-256-GCM.
                  Crescelo never logs your key or proxies requests through markup brokers.
                </span>
              </div>
            </div>

            {/* Wholesale Pricing Breakdown */}
            <div className="mk-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--mk-ink)', marginBottom: '12px' }}>
                Wholesale Token Cost Breakdown (Zero Markup Guarantee)
              </h3>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                Because you provide your own key (BYOK), you pay raw wholesale rates directly to OpenAI with 0% platform surcharge:
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--mk-ink)' }}>
                      <th style={{ padding: '8px', color: 'var(--mk-ink)' }}>Model</th>
                      <th style={{ padding: '8px', color: 'var(--mk-ink)' }}>Input / 1M Tokens</th>
                      <th style={{ padding: '8px', color: 'var(--mk-ink)' }}>Output / 1M Tokens</th>
                      <th style={{ padding: '8px', color: 'var(--mk-ink)' }}>Cost per 1,000 Chats</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}>gpt-4o-mini (Recommended)</td>
                      <td style={{ padding: '8px' }}>$0.15</td>
                      <td style={{ padding: '8px' }}>$0.60</td>
                      <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>~$0.30 total</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                      <td style={{ padding: '8px', fontWeight: 700 }}>gpt-4o (Flagship)</td>
                      <td style={{ padding: '8px' }}>$2.50</td>
                      <td style={{ padding: '8px' }}>$10.00</td>
                      <td style={{ padding: '8px', fontWeight: 700 }}>~$5.00 total</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Need Help CTA */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <p style={{ fontSize: '14px', color: 'var(--mk-muted)', marginBottom: '16px' }}>
                Need help troubleshooting an OpenAI quota error or invalid key message?
              </p>
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

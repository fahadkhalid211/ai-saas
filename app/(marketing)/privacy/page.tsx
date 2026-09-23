import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { Reveal, SectionHead } from '@/components/marketing/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy | Crescelo Autonomous AI Platform',
  description:
    'Our commitment to privacy, data sovereignty, BYOK API encryption, and strict vector isolation at Crescelo.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 24, 2026';

  return (
    <>
      <Header />
      <main id="main">
        {/* Header / Hero */}
        <section className="mk-hero" style={{ marginTop: '16px' }}>
          <div className="mk-hero-glow" aria-hidden="true" />
          <div className="mk-wrap mk-hero-inner">
            <p className="mk-eyebrow mk-rise" style={{ ['--mk-delay' as string]: '0ms' }}>
              LEGAL &amp; COMPLIANCE
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '24ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                Privacy <span className="mk-echo-em">Policy</span>
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '280ms', maxWidth: '64ch' }}>
              We respect your privacy, enforce zero token markup, and ensure your data and customer
              conversations remain strictly confidential, isolated, and under your control.
            </p>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--mk-muted)' }}>
              Last updated: {lastUpdated} • Effective Date: January 1, 2026
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="mk-section" style={{ paddingTop: '24px' }}>
          <div className="mk-wrap" style={{ maxWidth: '840px' }}>
            <Reveal
              as="article"
              className="mk-card"
              style={{
                padding: '48px 36px',
                lineHeight: 1.75,
                fontSize: '15.5px',
                color: 'var(--mk-deep)',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  1. Introduction &amp; Scope
                </h2>
                <p>
                  Crescelo Technologies Inc. (&quot;Crescelo&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides an autonomous
                  business assistant and customer engagement platform. This Privacy Policy details how we collect,
                  safeguard, process, and respect your personal information when you access our website, use our SaaS
                  application, embed our chat widgets, or connect third-party AI model connectors.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  2. Bring Your Own Key (BYOK) &amp; AI Provider Transparency
                </h2>
                <p>
                  Crescelo operates on a <strong>Zero Token Markup &amp; Sovereign AI</strong> model. When you configure
                  your workspace with proprietary API keys from model providers (including Google Gemini, OpenAI, Anthropic Claude,
                  Groq, DeepSeek, or local Ollama instances):
                </p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>
                    <strong>No Model Training:</strong> Crescelo never uses your company documents, knowledge base data, or
                    customer conversation transcripts to train foundational or public AI models.
                  </li>
                  <li>
                    <strong>Direct Routing:</strong> Customer queries and responses are executed under your own direct provider
                    credentials. The data sent to respective model APIs is governed strictly by your provider&apos;s commercial terms.
                  </li>
                  <li>
                    <strong>Zero Interception:</strong> We do not broker, broker-resell, or inspect conversational prompts for
                    advertising, cross-contextual behavioral tracking, or data-broker syndication.
                  </li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  3. Information We Collect
                </h2>
                <p>We collect and manage only information necessary to deliver and protect our services:</p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>
                    <strong>Account &amp; Profile Data:</strong> Name, work email address, hashed authentication credentials,
                    and workspace preferences provided during registration or OAuth authentication.
                  </li>
                  <li>
                    <strong>Knowledge Base Content:</strong> Text documents, PDF manuals, website URLs, and structured FAQs you
                    upload to power your assistant&apos;s Retrieval-Augmented Generation (RAG) vector index.
                  </li>
                  <li>
                    <strong>Operational Logs &amp; Lead Ingestion:</strong> Visitor inquiry transcripts, appointment bookings,
                    contact details submitted via the chat widget, and diagnostic metadata (e.g., latency, token count).
                  </li>
                  <li>
                    <strong>Technical &amp; Telemetry Data:</strong> IP addresses (anonymized for rate limiting and fraud prevention),
                    browser user agent, and error diagnostics required to maintain system stability.
                  </li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  4. Security &amp; Cryptographic Controls
                </h2>
                <p>
                  Security is engineered into our architecture. Key safeguards include:
                </p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>
                    <strong>AES-256-GCM Encryption at Rest:</strong> All custom AI API keys, webhook secrets, and private credentials
                    are encrypted at rest using industry-standard authenticated AES-256-GCM ciphers.
                  </li>
                  <li>
                    <strong>Salted Password Hashes:</strong> Master and user passwords are never stored in plaintext and are salted
                    and hashed using memory-hard cryptographic algorithms (scrypt).
                  </li>
                  <li>
                    <strong>Transport Security:</strong> All client-to-server and server-to-server transmissions are enforced over
                    TLS 1.3 encryption.
                  </li>
                  <li>
                    <strong>Multi-Factor Authentication (MFA/2FA):</strong> Optional Time-based One-Time Password (TOTP)
                    enforcement for workspace administrative controls.
                  </li>
                  <li>
                    <strong>Automated Abuse &amp; Rate-Limiting:</strong> Sensitive auth and inference endpoints are protected
                    by adaptive rate limiters and Google reCAPTCHA bot verification.
                  </li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  5. Data Retention &amp; Customer Deletion Rights
                </h2>
                <p>
                  You own your data. You may at any time:
                </p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>
                    Export all conversation transcripts, appointment registries, and lead captures directly from the Dashboard.
                  </li>
                  <li>
                    Purge uploaded documents and vector embeddings permanently with immediate index re-synchronization.
                  </li>
                  <li>
                    Request full account and workspace destruction by emailing{' '}
                    <a href="mailto:privacy@crescelo.com" style={{ textDecoration: 'underline', color: 'var(--mk-ink)' }}>
                      privacy@crescelo.com
                    </a>
                    . All records are purged within thirty (30) days of verified request.
                  </li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  6. Third-Party Sub-processors
                </h2>
                <p>
                  We partner with select infrastructure providers to run our cloud architecture:
                </p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><strong>Oracle Cloud Infrastructure (OCI) / PostgreSQL:</strong> Secure high-availability database hosting.</li>
                  <li><strong>Stripe Inc.:</strong> Payment processing, subscriptions, and PCI-DSS Level 1 compliance.</li>
                  <li><strong>Google LLC / reCAPTCHA:</strong> Bot deterrence and anti-abuse verification on public portals.</li>
                  <li><strong>Resend / SMTP Providers:</strong> Transactional email notifications and appointment confirmations.</li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  7. Global Compliance: GDPR &amp; CCPA/CPRA
                </h2>
                <p>
                  Regardless of your jurisdiction, Crescelo respects fundamental digital rights:
                </p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>The right to know what personal data is processed and stored.</li>
                  <li>The right to rectify inaccurate records or request immediate erasure.</li>
                  <li>The right to data portability in machine-readable JSON format.</li>
                  <li>The right not to be discriminated against for exercising consumer privacy privileges.</li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  8. Contact Our Privacy Officer
                </h2>
                <p>
                  If you have questions regarding this Privacy Policy, please contact our data governance team at:
                </p>
                <p style={{ marginTop: '8px', fontWeight: 600 }}>
                  Crescelo Technologies Inc. — Data Protection Office<br />
                  Email:{' '}
                  <a href="mailto:privacy@crescelo.com" style={{ textDecoration: 'underline', color: 'var(--mk-ink)' }}>
                    privacy@crescelo.com
                  </a>
                  <br />
                  Support Desk:{' '}
                  <Link href="/support/contact" style={{ textDecoration: 'underline', color: 'var(--mk-ink)' }}>
                    crescelo.com/support/contact
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

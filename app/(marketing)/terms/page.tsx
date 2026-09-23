import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Closing';
import { Reveal, SectionHead } from '@/components/marketing/ui';

export const metadata: Metadata = {
  title: 'Terms of Service | Crescelo Autonomous AI Platform',
  description:
    'Terms and Conditions governing the use of Crescelo website assistants, multi-channel connectors, and developer APIs.',
};

export default function TermsOfServicePage() {
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
              LEGAL AGREEMENT
            </p>
            <h1 className="mk-h1" style={{ maxWidth: '24ch', marginInline: 'auto' }}>
              <span className="mk-echo" style={{ ['--mk-delay' as string]: '140ms' }}>
                Terms &amp; <span className="mk-echo-em">Conditions</span>
              </span>
            </h1>
            <p className="mk-lead mk-rise" style={{ ['--mk-delay' as string]: '280ms', maxWidth: '64ch' }}>
              Please review these Terms of Service carefully before utilizing Crescelo&apos;s autonomous
              assistant platform, embeddable widgets, or API integrations.
            </p>
            <div
              className="mk-rise"
              style={{
                marginTop: '22px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 18px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1.5px solid rgba(171, 255, 68, 0.5)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                ['--mk-delay' as string]: '380ms',
              }}
            >
              <span style={{ color: 'var(--mk-lime)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.01em' }}>
                Last updated: {lastUpdated}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>•</span>
              <span style={{ color: '#cfe3d6', fontWeight: 500, fontSize: '13px' }}>
                Effective Date: January 1, 2026
              </span>
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
                  1. Acceptance of Terms
                </h2>
                <p>
                  By creating an account, accessing our website, or installing any Crescelo client code or API connectors,
                  you enter into a legally binding contract with Crescelo Technologies Inc. (&quot;Crescelo&quot;). If you are agreeing
                  on behalf of an organization or corporate entity, you represent and warrant that you possess full legal
                  authority to bind that entity to these Terms.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  2. Platform Description &amp; Zero Token Markup
                </h2>
                <p>
                  Crescelo offers enterprise-grade autonomous website assistants, multi-channel AI connectors, document
                  ingestion pipelines (RAG), and booking scheduling tools. Under our <strong>Zero Token Markup</strong> guarantee,
                  subscribers connect their own third-party AI provider credentials (such as Google Gemini, OpenAI, Anthropic,
                  Groq, or DeepSeek) and pay their AI model providers directly with no hidden resale margins or inflated per-token fees.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  3. Account Security &amp; Responsibilities
                </h2>
                <p>
                  You are responsible for safeguarding your login credentials, API secrets, and workspace administrator
                  permissions. You agree to immediately notify Crescelo of any unauthorized access, compromised API keys,
                  or security anomalies. Crescelo is not liable for losses resulting from compromised user passwords or
                  unrestricted API key leakage on public repositories.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  4. Acceptable Use Policy
                </h2>
                <p>You agree not to use the Crescelo platform to:</p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Generate, transmit, or promote illegal, fraudulent, harmful, or defamatory content.</li>
                  <li>Impersonate legal entities or mislead consumers regarding the synthetic AI nature of automated assistants.</li>
                  <li>Engage in denial-of-service attacks, automated crawling, or reverse-engineering of proprietary algorithms.</li>
                  <li>Upload copyrighted documents, trade secrets, or protected personal data without explicit legal authorization.</li>
                  <li>Circumvent API rate limits, authentication tokens, or automated security firewalls.</li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  5. AI Disclaimer &amp; Autonomous Output
                </h2>
                <p>
                  Generative Artificial Intelligence is inherently probabilistic. While Crescelo&apos;s RAG engine and prompt
                  scaffolding are engineered to minimize hallucinations by grounding responses in your uploaded documents,
                  Crescelo does not warrant that AI-generated replies are 100% free of inaccuracies or omissions. You are
                  responsible for supervising high-stakes conversational flows, medical or legal guidance, and configuring
                  appropriate escalation rules to human operators.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  6. Intellectual Property &amp; Customer Data
                </h2>
                <p>
                  <strong>Your Content:</strong> You retain complete ownership of all data, proprietary files, knowledge sources,
                  brand assets, and customer transcripts uploaded to your workspace. You grant Crescelo only the limited license
                  necessary to host, chunk, index, and process your content to provide the services.
                </p>
                <p style={{ marginTop: '12px' }}>
                  <strong>Crescelo Platform:</strong> All software, designs, user interfaces, documentation, algorithms, and
                  trademarks remain the exclusive intellectual property of Crescelo Technologies Inc.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  7. Subscriptions, Invoicing &amp; Cancellations
                </h2>
                <p>
                  All subscriptions (Starter, Professional, Agency) are billed recurringly through Stripe. You may cancel or
                  modify your subscription at any time via the self-service Stripe Customer Portal in your billing dashboard.
                  Cancellations take effect at the conclusion of the current prepaid billing period. We do not provide prorated
                  refunds for partially used monthly cycles, except where mandatory by applicable regional statutes.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  8. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by applicable law, Crescelo shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages, including loss of profits, data corruption, or business interruption,
                  even if advised of the possibility of such damages. In no event shall our total aggregate liability exceed the
                  amount paid by you to Crescelo in the twelve (12) months immediately preceding the incident.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--mk-line)', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--mk-ink)' }}>
                  9. Contact &amp; Legal Notices
                </h2>
                <p>
                  All formal notices and inquiries regarding these Terms should be sent to:
                </p>
                <p style={{ marginTop: '8px', fontWeight: 600 }}>
                  Crescelo Technologies Inc. — Legal Affairs<br />
                  Email:{' '}
                  <a href="mailto:legal@crescelo.com" style={{ textDecoration: 'underline', color: 'var(--mk-ink)' }}>
                    legal@crescelo.com
                  </a>
                  <br />
                  Privacy Team:{' '}
                  <Link href="/privacy" style={{ textDecoration: 'underline', color: 'var(--mk-ink)' }}>
                    crescelo.com/privacy
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

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
  alternates: { canonical: '/support/ai-connectors/gemini' },
  title: 'Connect Google Gemini to Crescelo: API Key Guide',
  description:
    'Step-by-step guide to get a free Google AI Studio API key and connect Gemini 1.5 Flash or Gemini 2.0 Flash to Crescelo with massive context windows.',
}, '/support/ai-connectors/gemini'));
}

export default function GeminiGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Connect Google Gemini to Crescelo: API Key Guide', 'Step-by-step guide to get a free Google AI Studio API key and connect Gemini 1.5 Flash or Gemini 2.0 Flash to Crescelo with massive context windows.', '/support/ai-connectors/gemini'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'AI connectors', path: '/support/ai-connectors' }, { name: 'Google Gemini', path: '/support/ai-connectors/gemini' }])]} />
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
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}><T>Google Gemini</T></span>
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
              <span><T>100% Free Tier Available • Massive 1M+ Context Window</T></span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              <T>How to connect</T> <span className="mk-echo-em"><T>Google Gemini</T></span> <T>to Crescelo.</T>
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '60ch', marginInline: 'auto', animationDelay: '140ms' }}>
              <T>Google AI Studio offers one of the most generous free tiers in the industry with Gemini Flash.
              Here is how to get your free API key in under 2 minutes.</T>
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
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>2 Minutes</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Cost</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}><T>Free Tier (15 RPM)</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Recommended Model</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>gemini-2.5-flash / 1.5-flash</T></div>
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
                  <T>Open Google AI Studio</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>Google AI Studio is Google’s dedicated developer playground for obtaining Gemini API keys:</T>
              </p>
              <div style={{ margin: '16px 0' }}>
                <A
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
                  <span><T>Open aistudio.google.com/app/apikey</T></span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </A>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                <T>Sign in with any standard Google Account or Google Workspace account.</T>
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
                  <T>Click &ldquo;Create API key&rdquo;</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>Generating a key takes just one click:</T>
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>Click the blue</T> <strong><T>Create API key</T></strong> <T>button at the top.</T></li>
                <li><T>Select</T> <strong><T>Create API key in new project</T></strong> <T>(or choose an existing Google Cloud project if you have one).</T></li>
                <li><T>Google will generate a key starting with</T> <code>AIzaSy...</code> <T>in seconds.</T></li>
                <li><T>Click</T> <strong><T>Copy</T></strong>.</li>
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
                  <T>Paste Key in Crescelo Settings</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>Save the key in your Crescelo assistant:</T>
              </p>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>Open your</T> <strong><T>Crescelo Dashboard</T></strong> &rarr; <strong><T>Settings</T></strong> &rarr; <strong><T>AI Settings</T></strong>.</li>
                <li><T>Select</T> <strong><T>Google Gemini</T></strong> <T>as your provider.</T></li>
                <li><T>Paste your</T> <code>AIzaSy...</code> <T>key into the API key box.</T></li>
                <li><T>Set the model to</T> <code>gemini-3.6-flash</code> <T>(recommended) or</T> <code>gemini-3.5-flash</code>.</li>
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
                  <strong><T>Massive Context Advantage:</T></strong> <T>Gemini models support over 1,000,000 tokens of context,
                  meaning your assistant can reference hundreds of pages of complex manuals without truncation.</T>
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

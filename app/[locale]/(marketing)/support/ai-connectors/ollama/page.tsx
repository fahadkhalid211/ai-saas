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
  Lock,
  Terminal,
  Server,
  Zap,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return localizeMeta(withSocial({
  alternates: { canonical: '/support/ai-connectors/ollama' },
  title: 'Connect a Local Ollama Model to Crescelo',
  description:
    'Install Ollama, pull a local open-source model such as Llama or Mistral, configure CORS origins and run private offline inference with Crescelo.',
}, '/support/ai-connectors/ollama'));
}

export default function OllamaGuidePage() {
  return (
    <>
      <JsonLd data={[webPageSchema('Connect a Local Ollama Model to Crescelo', 'Install Ollama, pull a local open-source model such as Llama or Mistral, configure CORS origins and run private offline inference with Crescelo.', '/support/ai-connectors/ollama'), breadcrumbSchema([{ name: 'Support', path: '/support' }, { name: 'AI connectors', path: '/support/ai-connectors' }, { name: 'Local Ollama', path: '/support/ai-connectors/ollama' }])]} />
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
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mk-ink)' }}><T>Local Server (Ollama)</T></span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '16px',
              }}
            >
              <Lock style={{ width: '13px', height: '13px' }} />
              <span><T>100% Air-Gapped Privacy • Zero Cloud Dependencies</T></span>
            </div>

            <h1 className="mk-h1 mk-rise" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
              <T>How to connect</T> <span className="mk-echo-em"><T>Local Ollama</T></span> <T>to Crescelo.</T>
            </h1>
            <p className="mk-lead mk-rise" style={{ maxWidth: '60ch', marginInline: 'auto', animationDelay: '140ms' }}>
              <T>Run Llama 3.2, Mistral, or Qwen entirely on your own hardware.
              Follow this step-by-step guide to download Ollama, configure cross-origin permissions, and connect your assistant.</T>
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
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>5 Minutes</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Cloud Cost</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}><T>$0.00 Forever</T></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mk-muted)', textTransform: 'uppercase' }}><T>Recommended Model</T></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mk-ink)', marginTop: '4px' }}><T>llama3.2:3b / llama3.1:8b</T></div>
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
                  <T>Download &amp; Install Ollama</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>Download the free Ollama installer for your operating system:</T>
              </p>
              <div style={{ margin: '16px 0' }}>
                <A
                  href="https://ollama.com/download"
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
                  <span><T>Download from ollama.com</T></span>
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                </A>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                <T>Ollama runs locally on macOS (Apple Silicon M1/M2/M3/M4 is exceptionally fast), Windows, and Linux.</T>
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
                  <T>Pull Your Desired Open-Source Model</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>Open your terminal (Terminal on Mac/Linux, PowerShell or Command Prompt on Windows) and run:</T>
              </p>
              <div
                style={{
                  background: 'var(--mk-deep)',
                  color: '#abff44',
                  fontFamily: 'monospace',
                  padding: '16px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  margin: '14px 0',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  wordBreak: 'break-all',
                }}
              >
                <T>ollama run llama3.2</T>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                <T>Ollama will download Llama 3.2 (~2.0 GB) and boot the local server. You can also pull larger models such as</T> <code>ollama pull llama3.1:8b</code> <T>or</T> <code>ollama pull mistral</code>.
              </p>
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
                  <T>Configure CORS Allowed Origins (Crucial Step)</T>
                </h2>
              </div>
              <p style={{ color: 'var(--mk-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                <T>By default, Ollama only accepts requests originating from localhost applications. To allow your Crescelo web dashboard to send prompts to your local Ollama server, you must set the</T> <code>OLLAMA_ORIGINS</code> <T>environment variable:</T>
              </p>
              
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--mk-sand)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--mk-ink)', marginBottom: '6px' }}><T>On macOS:</T></div>
                  <code style={{ fontSize: '12px', fontFamily: 'monospace' }}>launchctl setenv OLLAMA_ORIGINS &quot;*&quot;</code>
                  <div style={{ fontSize: '12px', color: 'var(--mk-muted)', marginTop: '4px' }}><T>Then restart the Ollama desktop app from your top menu bar.</T></div>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--mk-sand)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--mk-ink)', marginBottom: '6px' }}><T>On Windows:</T></div>
                  <div style={{ fontSize: '12px', color: 'var(--mk-ink)' }}>
                    <T>Quit Ollama from the Windows taskbar tray &rarr; Search &ldquo;Edit environment variables for your account&rdquo; &rarr; Click</T> <strong><T>New</T></strong> <T>&rarr; Variable name:</T> <code>OLLAMA_ORIGINS</code> <T>&rarr; Variable value:</T> <code>*</code> <T>&rarr; Click OK &rarr; Restart Ollama.</T>
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--mk-sand)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--mk-ink)', marginBottom: '6px' }}><T>On Linux (systemd):</T></div>
                  <code style={{ fontSize: '12px', fontFamily: 'monospace' }}>sudo systemctl edit ollama.service</code>
                  <div style={{ fontSize: '12px', color: 'var(--mk-muted)', marginTop: '4px' }}>
                    <T>Add under [Service]:</T> <code>Environment=&quot;OLLAMA_ORIGINS=*&quot;</code><T>, save, and run</T> <code>sudo systemctl restart ollama</code>.
                  </div>
                </div>
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
                  <T>Connect to Crescelo</T>
                </h2>
              </div>
              <ol style={{ paddingLeft: '20px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mk-ink)', fontSize: '14px' }}>
                <li><T>In your</T> <strong><T>Crescelo Dashboard</T></strong><T>, go to</T> <strong><T>Settings</T></strong> &rarr; <strong><T>AI Settings</T></strong>.</li>
                <li><T>Select</T> <strong><T>Local Server (Ollama)</T></strong>.</li>
                <li><T>Verify the host URL is set to</T> <code>http://localhost:11434</code> <T>(or your custom server IP).</T></li>
                <li><T>In the</T> <strong><T>Model Name</T></strong> <T>box, enter the model tag you pulled (e.g.</T> <code>llama3.2</code>).</li>
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
                  <strong><T>100% Data Confidentiality:</T></strong> <T>When running Ollama, prompt text and customer inquiries never leave your local device or internal network.</T>
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
